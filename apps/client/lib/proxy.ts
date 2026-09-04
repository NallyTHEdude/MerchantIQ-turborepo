/**
 * Helpers shared by the route handlers in `app/api/*`.
 *
 * Each handler is a thin proxy: it forwards the request to the backend and
 * returns the backend's status code and body untouched, so the browser sees the
 * real `{ statusCode, data, message, success }` / `{ success, message, errors }`
 * envelopes and real validation errors.
 */
import { NextResponse } from 'next/server';

import { MAX_DOCUMENT_BYTES } from '@/lib/api-types';
import { callBackend, type BackendResult } from '@/lib/backend';

export const toResponse = ({ status, body }: BackendResult) =>
    NextResponse.json(body, { status });

export const proxy = async (path: string, init?: RequestInit) =>
    toResponse(await callBackend(path, init));

export const failure = (status: number, message: string) =>
    NextResponse.json(
        { success: false, message, errors: [], data: null },
        { status },
    );

type BodyResult =
    | { ok: true; value: unknown }
    | { ok: false; response: NextResponse };

/** Parses a JSON request body, answering 400 instead of throwing. */
export const readJsonBody = async (request: Request): Promise<BodyResult> => {
    try {
        return { ok: true, value: await request.json() };
    } catch {
        return {
            ok: false,
            response: failure(400, 'The request body was not valid JSON.'),
        };
    }
};

/**
 * Forwards a single-file multipart upload to the backend.
 *
 * `document.middleware.ts` ignores the multipart field name and accepts exactly
 * one file, so the first file in the incoming form is re-sent under the
 * `document` field. PDF type and the 10 MB cap are checked here as well to fail
 * fast, using the same rules as `document.validator.ts`.
 */
export const forwardDocument = async (
    request: Request,
    path: string,
    headers: Record<string, string> = {},
) => {
    const incoming = await readFormData(request);
    if ('response' in incoming) return incoming.response;
    return forwardDocumentForm(incoming.form, path, headers);
};

/** Reads multipart form data, answering 400 instead of throwing. */
export const readFormData = async (
    request: Request,
): Promise<{ form: FormData } | { response: NextResponse }> => {
    try {
        return { form: await request.formData() };
    } catch {
        return {
            response: failure(
                400,
                'The upload could not be read as form data.',
            ),
        };
    }
};

/** Variant of `forwardDocument` for callers that already parsed the form. */
export const forwardDocumentForm = async (
    incoming: FormData,
    path: string,
    headers: Record<string, string> = {},
) => {
    const file =
        incoming
            .getAll('document')
            .find((entry): entry is File => entry instanceof File) ??
        [...incoming.values()].find(
            (entry): entry is File => entry instanceof File,
        );

    if (!file) return failure(400, 'Document is required');
    if (file.type !== 'application/pdf' || !/\.pdf$/i.test(file.name))
        return failure(400, 'Only PDF documents are supported.');
    if (file.size > MAX_DOCUMENT_BYTES)
        return failure(400, 'The document exceeds the 10 MB limit.');

    const outgoing = new FormData();
    outgoing.append('document', file, file.name);

    return proxy(path, { method: 'POST', headers, body: outgoing });
};
