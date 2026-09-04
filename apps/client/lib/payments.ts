/**
 * Payment JSON handling for step 2 of merchant creation.
 *
 * The uploaded file is read and parsed in the browser; only the parsed array is
 * sent to `POST /api/payment/:merchantId`. The file itself never leaves the
 * browser. Validation mirrors `apps/api/src/app/validators/payment.validator.ts`
 * so malformed files are rejected here with a specific message instead of
 * bouncing off the backend as a generic 400.
 */
import {
    paymentMethods,
    paymentStatuses,
    type PaymentMethod,
    type PaymentStatus,
} from '@/lib/api-types';
import type { PaymentRecord } from '@/data/merchants';

export type PaymentParseResult =
    | { ok: true; records: PaymentRecord[] }
    | { ok: false; error: string };

/** Keys accepted when the JSON wraps the array in an object. */
const wrapperKeys = ['payments', 'records', 'data'] as const;

const asArray = (value: unknown): unknown[] | null => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return null;

    for (const key of wrapperKeys) {
        const nested = (value as Record<string, unknown>)[key];
        if (Array.isArray(nested)) return nested;
    }
    return null;
};

const isPaymentStatus = (value: unknown): value is PaymentStatus =>
    typeof value === 'string' &&
    (paymentStatuses as readonly string[]).includes(value);

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
    typeof value === 'string' &&
    (paymentMethods as readonly string[]).includes(value);

/**
 * `payments.amount` is a `numeric(12, 2)` column and Drizzle expects a string,
 * so numeric JSON values are converted rather than rejected.
 */
const readAmount = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed && Number.isFinite(Number(trimmed)) ? trimmed : null;
    }
    if (typeof value === 'number' && Number.isFinite(value))
        return value.toFixed(2);
    return null;
};

export const parsePaymentJson = (text: string): PaymentParseResult => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        return {
            ok: false,
            error: 'The file is not valid JSON. Check for a trailing comma or a missing bracket.',
        };
    }

    const rows = asArray(parsed);
    if (!rows)
        return {
            ok: false,
            error: 'Expected a JSON array of payments, or an object with a "payments" array.',
        };
    if (!rows.length)
        return {
            ok: false,
            error: 'Payments must be a non-empty array.',
        };

    const records: PaymentRecord[] = [];

    for (const [index, row] of rows.entries()) {
        const label = `Record ${index + 1}`;
        if (!row || typeof row !== 'object' || Array.isArray(row))
            return { ok: false, error: `${label} is not an object.` };

        const item = row as Record<string, unknown>;
        const amount = readAmount(item.amount);
        if (!amount)
            return {
                ok: false,
                error: `${label}: "amount" must be a numeric value, for example "1499.00".`,
            };
        if (!isPaymentStatus(item.status))
            return {
                ok: false,
                error: `${label}: "status" must be one of ${paymentStatuses.join(', ')}.`,
            };
        if (!isPaymentMethod(item.paymentMethod))
            return {
                ok: false,
                error: `${label}: "paymentMethod" must be one of ${paymentMethods.join(', ')}.`,
            };
        if (typeof item.isInternational !== 'boolean')
            return {
                ok: false,
                error: `${label}: "isInternational" is required and must be true or false.`,
            };

        records.push({
            amount,
            status: item.status,
            paymentMethod: item.paymentMethod,
            isInternational: item.isInternational,
        });
    }

    return { ok: true, records };
};

/** Shared PDF checks, matching `document.validator.ts` and the 10 MB Busboy cap. */
export const validatePdf = (file: File): string | null => {
    if (file.type !== 'application/pdf' || !/\.pdf$/i.test(file.name))
        return 'Upload a PDF file.';
    if (file.size > 10 * 1024 * 1024)
        return 'The PDF exceeds the 10 MB upload limit.';
    return null;
};
