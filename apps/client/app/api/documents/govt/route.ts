import { NextResponse, type NextRequest } from 'next/server';

import type { ApiEnvelope, GovtDocumentStatus } from '@/lib/api-types';
import { failure, forwardDocumentForm, readFormData } from '@/lib/proxy';

/**
 * Government compliance document.
 *
 * `POST /api/document/govt` on the backend stores the file as a `rag_documents`
 * row with `documentType = GOVT_DOCUMENT`, but no backend route reads that table
 * back, so there is no way to ask the API whether the prerequisite is met. This
 * handler therefore records the outcome in an httpOnly cookie and exposes it as
 * a status endpoint. `PUT` lets an operator confirm the document was uploaded in
 * an earlier session so a fresh browser is not blocked forever.
 *
 * The admin password arrives as a form field on this route and is attached to
 * the outbound request as `x-admin-password` here, on the server. It is never
 * stored, logged, or exposed to the browser bundle.
 */
const COOKIE_NAME = 'govt_document_state';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const emptyStatus: GovtDocumentStatus = {
    exists: false,
    uploadedAt: null,
    filename: null,
    source: null,
};

const envelope = (
    status: GovtDocumentStatus,
    message: string,
): ApiEnvelope<GovtDocumentStatus> => ({
    statusCode: 200,
    data: status,
    message,
    success: true,
});

const readStatus = (request: NextRequest): GovtDocumentStatus => {
    const raw = request.cookies.get(COOKIE_NAME)?.value;
    if (!raw) return emptyStatus;

    try {
        const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<
            Record<keyof GovtDocumentStatus, unknown>
        >;
        return {
            exists: parsed.exists === true,
            uploadedAt:
                typeof parsed.uploadedAt === 'string'
                    ? parsed.uploadedAt
                    : null,
            filename:
                typeof parsed.filename === 'string' ? parsed.filename : null,
            source:
                parsed.source === 'upload' || parsed.source === 'acknowledged'
                    ? parsed.source
                    : null,
        };
    } catch {
        return emptyStatus;
    }
};

const withStatusCookie = (
    response: NextResponse,
    status: GovtDocumentStatus,
) => {
    response.cookies.set({
        name: COOKIE_NAME,
        value: encodeURIComponent(JSON.stringify(status)),
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    });
    return response;
};

export async function GET(request: NextRequest) {
    const status = readStatus(request);
    return NextResponse.json(
        envelope(
            status,
            status.exists
                ? 'Government compliance document is on record'
                : 'Government compliance document has not been uploaded yet',
        ),
    );
}

export async function POST(request: NextRequest) {
    const incoming = await readFormData(request);
    if ('response' in incoming) return incoming.response;

    const adminPassword = incoming.form.get('adminPassword');
    if (typeof adminPassword !== 'string' || !adminPassword)
        return failure(401, 'Admin password is required');

    const file = incoming.form
        .getAll('document')
        .find((entry): entry is File => entry instanceof File);

    const response = await forwardDocumentForm(incoming.form, '/document/govt', {
        'x-admin-password': adminPassword,
    });

    if (response.status >= 400) return response;

    return withStatusCookie(response, {
        exists: true,
        uploadedAt: new Date().toISOString(),
        filename: file?.name ?? null,
        source: 'upload',
    });
}

/** Records that the document was already uploaded outside this browser. */
export async function PUT() {
    const status: GovtDocumentStatus = {
        exists: true,
        uploadedAt: new Date().toISOString(),
        filename: null,
        source: 'acknowledged',
    };

    return withStatusCookie(
        NextResponse.json(
            envelope(status, 'Government compliance document marked as present'),
        ),
        status,
    );
}

/** Clears the local record so the prerequisite is re-checked. */
export async function DELETE() {
    return withStatusCookie(
        NextResponse.json(
            envelope(
                emptyStatus,
                'Government compliance document record cleared',
            ),
        ),
        emptyStatus,
    );
}
