/**
 * Server-only access to the backend API.
 *
 * `BACKEND_URL` is deliberately not prefixed with `NEXT_PUBLIC_`, so it is
 * readable only inside the Next.js server runtime. Every browser request
 * therefore goes to a route handler under `app/api/*`, which forwards it here.
 * That also keeps the government-document admin password out of the client
 * bundle: it is posted to our own route handler and attached to the outbound
 * request as the `x-admin-password` header on the server.
 */
import type { ApiEnvelope, ApiFieldError } from '@/lib/api-types';

if (typeof window !== 'undefined')
    throw new Error('lib/backend.ts must only be imported on the server.');

/**
 * All backend routes are mounted under `/api` (see apps/api/src/app.ts), so the
 * suffix is appended when `BACKEND_URL` does not already include it. That makes
 * both `http://localhost:4000` and `http://localhost:4000/api` valid values.
 */
export const getBackendBaseUrl = () => {
    const raw = process.env.BACKEND_URL?.trim();
    if (!raw)
        throw new Error(
            'BACKEND_URL is not configured. Add it to apps/client/.env.local.',
        );

    const withoutTrailingSlash = raw.replace(/\/+$/, '');
    return /\/api$/i.test(withoutTrailingSlash)
        ? withoutTrailingSlash
        : `${withoutTrailingSlash}/api`;
};

export type BackendResult = {
    status: number;
    body: unknown;
};

const jsonHeaders = { 'Content-Type': 'application/json' } as const;

/**
 * Calls the backend and returns its status and parsed body without throwing, so
 * route handlers can mirror backend failures verbatim instead of flattening
 * everything into a generic 500.
 */
export const callBackend = async (
    path: string,
    init?: RequestInit,
): Promise<BackendResult> => {
    let baseUrl: string;
    try {
        baseUrl = getBackendBaseUrl();
    } catch (configError) {
        return {
            status: 500,
            body: {
                success: false,
                message:
                    configError instanceof Error
                        ? configError.message
                        : 'The backend URL is not configured.',
                errors: [] as ApiFieldError[],
                data: null,
            },
        };
    }

    let response: Response;
    try {
        response = await fetch(`${baseUrl}${path}`, {
            ...init,
            cache: 'no-store',
        });
    } catch {
        return {
            status: 502,
            body: {
                success: false,
                message: `Unable to reach the backend API at ${baseUrl}.`,
                errors: [] as ApiFieldError[],
                data: null,
            },
        };
    }

    const text = await response.text();
    if (!text)
        return {
            status: response.status,
            body: {
                success: response.ok,
                message: response.ok
                    ? 'Success'
                    : `Request failed with status ${response.status}.`,
                errors: [] as ApiFieldError[],
                data: null,
            },
        };

    try {
        return { status: response.status, body: JSON.parse(text) };
    } catch {
        return {
            status: 502,
            body: {
                success: false,
                message: 'The backend returned a response that was not JSON.',
                errors: [] as ApiFieldError[],
                data: null,
            },
        };
    }
};

/** JSON `RequestInit` for backend calls that send a body. */
export const backendJson = (body: unknown, method = 'POST'): RequestInit => ({
    method,
    headers: jsonHeaders,
    body: JSON.stringify(body),
});

/**
 * Reads a typed envelope from the backend, throwing when the call failed.
 * Used by server components that render backend data directly.
 */
export const readBackend = async <T>(path: string): Promise<T> => {
    const { status, body } = await callBackend(path);
    if (status >= 400) throw new BackendRequestError(status, body);
    return (body as ApiEnvelope<T>).data;
};

export class BackendRequestError extends Error {
    readonly status: number;
    readonly body: unknown;

    constructor(status: number, body: unknown) {
        super(extractMessage(body, status));
        this.name = 'BackendRequestError';
        this.status = status;
        this.body = body;
    }
}

/** Pulls the `message` field out of either envelope shape. */
export const extractMessage = (body: unknown, status: number): string => {
    if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof (body as { message: unknown }).message === 'string'
    )
        return (body as { message: string }).message;
    return `Request failed with status ${status}.`;
};
