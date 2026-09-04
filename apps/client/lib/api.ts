/**
 * Browser-side API client.
 *
 * Nothing here talks to the backend directly. `BACKEND_URL` is server-only, so
 * every call goes to a Next.js route handler under `app/api/*`, which forwards
 * it to the backend and returns the backend's envelope untouched. Components
 * should use these functions (or the hooks in `lib/hooks.ts`) rather than
 * calling `fetch` themselves.
 */
import type {
    CheckState,
    Merchant,
    PipelineCheck,
    VerificationStage,
} from '@/data/merchants';
import type {
    ApiEnvelope,
    ApiFieldError,
    ApiInvestigation,
    ApiMerchant,
    ApiPayment,
    ApiVerification,
    CreateMerchantRequest,
    CreatePaymentRequest,
    DocumentUploadResult,
    GovtDocumentStatus,
    InvestigationReasoning,
    LatestVerification,
    MerchantCategory,
    VerificationStatus,
} from '@/lib/api-types';
import { merchantCategories } from '@/lib/api-types';

export * from '@/lib/api-types';

export class ApiRequestError extends Error {
    readonly status: number;
    readonly fieldErrors: ApiFieldError[];

    constructor(
        message: string,
        status: number,
        fieldErrors: ApiFieldError[] = [],
    ) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}

/** Turns an unknown thrown value into something safe to render. */
export const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

const readMessage = (body: unknown, status: number) =>
    body &&
    typeof body === 'object' &&
    'message' in body &&
    typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed with status ${status}.`;

const readFieldErrors = (body: unknown): ApiFieldError[] => {
    if (!body || typeof body !== 'object' || !('errors' in body)) return [];

    const errors = (body as { errors: unknown }).errors;
    if (!Array.isArray(errors)) return [];

    return errors.flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return [];
        const { field, message } = entry as {
            field?: unknown;
            message?: unknown;
        };
        return typeof field === 'string' && typeof message === 'string'
            ? [{ field, message }]
            : [];
    });
};

/** Fetches a route handler and returns the full envelope. */
const requestEnvelope = async <T>(
    path: string,
    init?: RequestInit,
): Promise<ApiEnvelope<T>> => {
    let response: Response;
    try {
        response = await fetch(path, { ...init, cache: 'no-store' });
    } catch {
        throw new ApiRequestError(
            'Unable to reach the application server. Check your connection and try again.',
            0,
        );
    }

    let body: unknown;
    try {
        body = await response.json();
    } catch {
        throw new ApiRequestError(
            'The server returned a response that could not be read.',
            response.status,
        );
    }

    if (!response.ok) {
        const fieldErrors = readFieldErrors(body);
        const message = readMessage(body, response.status);
        throw new ApiRequestError(
            fieldErrors.length
                ? `${message}: ${fieldErrors
                      .map((entry) => `${entry.field} — ${entry.message}`)
                      .join('; ')}`
                : message,
            response.status,
            fieldErrors,
        );
    }

    return body as ApiEnvelope<T>;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> =>
    (await requestEnvelope<T>(path, init)).data;

const jsonRequest = (body: unknown, method = 'POST'): RequestInit => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

const segment = (value: string) => encodeURIComponent(value);

const looksLikeInvestigation = (value: unknown): value is ApiInvestigation =>
    Boolean(value) &&
    typeof value === 'object' &&
    'action' in (value as Record<string, unknown>);

/**
 * `investigation.controller.ts` calls `new ApiResponse(status, message, data)`
 * but the constructor signature is `(status, data, message)`, so the
 * investigation record currently arrives in `message` and the human-readable
 * string in `data`. This reads whichever field actually holds the record, so it
 * keeps working unchanged once the backend argument order is corrected.
 */
export const normalizeInvestigation = (
    envelope: ApiEnvelope<unknown>,
): ApiInvestigation | null => {
    if (looksLikeInvestigation(envelope.data)) return envelope.data;
    if (looksLikeInvestigation(envelope.message))
        return envelope.message as unknown as ApiInvestigation;
    return null;
};

/**
 * `investigations.reasoning` holds `JSON.stringify({ ragContext, ragResult })`
 * for a completed run, or the literal string `'server error'` when the RAG step
 * failed. Returns `null` for anything that is not JSON.
 */
export const parseInvestigationReasoning = (
    reasoning: string | null,
): InvestigationReasoning | null => {
    if (!reasoning) return null;
    try {
        const parsed: unknown = JSON.parse(reasoning);
        return parsed && typeof parsed === 'object'
            ? (parsed as InvestigationReasoning)
            : null;
    } catch {
        return null;
    }
};

export const api = {
    latestVerifications: () =>
        request<LatestVerification[]>('/api/merchants/latest-verification'),

    merchant: (merchantId: string) =>
        request<ApiMerchant>(`/api/merchants/${segment(merchantId)}`),

    deleteMerchant: (merchantId: string) =>
        request<ApiMerchant>(`/api/merchants/${segment(merchantId)}`, {
            method: 'DELETE',
        }),

    createMerchant: (body: CreateMerchantRequest) =>
        request<ApiMerchant>('/api/merchants', jsonRequest(body)),

    verifications: (merchantId: string) =>
        request<ApiVerification[]>(`/api/verifications/${segment(merchantId)}`),

    payments: (merchantId: string) =>
        request<ApiPayment[]>(`/api/payments/${segment(merchantId)}`),

    createPayments: (merchantId: string, body: CreatePaymentRequest[]) =>
        request<ApiPayment[]>(
            `/api/payments/${segment(merchantId)}`,
            jsonRequest(body),
        ),

    /** Resolves to `null` while the investigation pipeline is still running. */
    investigation: async (verificationId: string) => {
        try {
            return normalizeInvestigation(
                await requestEnvelope<unknown>(
                    `/api/investigations/${segment(verificationId)}`,
                ),
            );
        } catch (error) {
            if (error instanceof ApiRequestError && error.status === 404)
                return null;
            throw error;
        }
    },

    /**
     * Final creation step. The backend also creates the verification record and
     * starts the verification, ingestion and investigation pipelines.
     */
    uploadMerchantDocument: (merchantId: string, file: File) => {
        const formData = new FormData();
        formData.append('document', file);
        return request<DocumentUploadResult>(
            `/api/documents/${segment(merchantId)}`,
            { method: 'POST', body: formData },
        );
    },

    govtDocumentStatus: () =>
        request<GovtDocumentStatus>('/api/documents/govt'),

    /** The password is forwarded as `x-admin-password` by the route handler. */
    uploadGovtDocument: (file: File, adminPassword: string) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('adminPassword', adminPassword);
        return request<DocumentUploadResult>('/api/documents/govt', {
            method: 'POST',
            body: formData,
        });
    },

    acknowledgeGovtDocument: () =>
        request<GovtDocumentStatus>('/api/documents/govt', { method: 'PUT' }),

    clearGovtDocument: () =>
        request<GovtDocumentStatus>('/api/documents/govt', {
            method: 'DELETE',
        }),
};

/**
 * `GET /api/verification/:merchantId` and `GET /api/payment/:merchantId` return
 * rows in whatever order Postgres yields, so ordering is applied here.
 */
export const sortByCreatedAtDesc = <T extends { createdAt: string | null }>(
    rows: T[],
): T[] =>
    [...rows].sort(
        (left, right) =>
            new Date(right.createdAt ?? 0).getTime() -
            new Date(left.createdAt ?? 0).getTime(),
    );

export const latestVerificationOf = (verifications: ApiVerification[]) =>
    sortByCreatedAtDesc(verifications)[0] ?? null;

const checkState = (
    flag: boolean | null,
    status: VerificationStatus,
): CheckState => {
    if (flag === true) return 'success';
    if (status === 'PENDING') return 'processing';
    if (status === 'SERVER_ERROR') return 'review';
    return 'failed';
};

const checkResult = (flag: boolean | null, status: VerificationStatus) => {
    if (flag === true) return 'Passed';
    if (status === 'PENDING') return 'Awaiting result';
    if (status === 'SERVER_ERROR') return 'Unknown — the pipeline errored';
    return 'Not verified';
};

/**
 * Builds one row per boolean the `verifications` table actually stores. No
 * additional stages are invented: the backend records exactly these three.
 */
export const buildPipelineChecks = (
    verification: ApiVerification | null,
): PipelineCheck[] | undefined => {
    if (!verification) return undefined;

    const flags: [VerificationStage, boolean | null][] = [
        ['Phone Number Verification', verification.isPhoneNumberVerified],
        ['GST Verification', verification.isGstNumberVerified],
        ['Website Verification', verification.isWebsiteVerified],
    ];

    return flags.map(([stage, flag]) => ({
        stage,
        state: checkState(flag, verification.verificationStatus),
        result: checkResult(flag, verification.verificationStatus),
        timestamp: verification.createdAt,
        explanation: `Recorded on verification ${verification.id}.`,
    }));
};

/** Combines a merchant record and its verification into the list view model. */
export const mapMerchant = (
    merchant: ApiMerchant,
    verification: ApiVerification | null,
): Merchant => ({
    id: merchant.id,
    name: merchant.businessName,
    legalName: merchant.businessName,
    status: verification?.verificationStatus ?? 'PENDING',
    risk: verification?.riskLevel ?? 'VERY_HIGH',
    trustScore: verification?.trustscore ?? 0,
    updatedAt: verification?.createdAt ?? merchant.createdAt ?? '',
    submittedAt: merchant.createdAt ?? '',
    country: 'India',
    category: merchant.category,
    website: merchant.websiteUrl,
    phone: merchant.phoneNumber,
    gstNumber: merchant.gstNumber,
    merchantId: merchant.id,
    verification,
    checks: buildPipelineChecks(verification),
});

export const mapLatestVerification = (item: LatestVerification): Merchant =>
    mapMerchant(item.merchant, item.verification);

export const isMerchantCategory = (value: string): value is MerchantCategory =>
    (merchantCategories as readonly string[]).includes(value);

/** `VERY_HIGH` -> `Very High` */
export const displayLabel = (value: string) =>
    value
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

export const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

export const formatAmount = (amount: string) => {
    const value = Number(amount);
    return Number.isFinite(value)
        ? new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 2,
          }).format(value)
        : amount;
};
