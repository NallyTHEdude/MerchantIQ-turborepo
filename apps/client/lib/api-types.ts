/**
 * Types that mirror the backend contracts in `apps/api`.
 *
 * Every value union here is copied from `apps/api/src/data/enums/db.enums.ts`
 * and `apps/api/src/data/enums/rag.enums.ts`. Nothing in this file invents a
 * status the backend cannot return.
 */

/** `VerificationStatus` in db.enums.ts */
export const verificationStatuses = [
    'PENDING',
    'SERVER_ERROR',
    'COMPLETED',
    'FAILED',
] as const;

/** `RiskLevel` in db.enums.ts */
export const riskLevels = ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'] as const;

/** `PaymentStatus` in db.enums.ts */
export const paymentStatuses = ['SUCCESS', 'FAILED', 'REFUNDED'] as const;

/** `PaymentMethod` in db.enums.ts */
export const paymentMethods = ['CARD', 'UPI', 'NET_BANKING'] as const;

/** `RagDecision` in rag.enums.ts — the values stored in `investigations.action` */
export const ragDecisions = ['APPROVE', 'REJECT', 'SERVER_ERROR'] as const;

/** `Category` in db.enums.ts */
export const merchantCategories = [
    'FOOD_AND_BEVERAGE',
    'GROCERY',
    'RETAIL',
    'CLOTHING_AND_FASHION',
    'ELECTRONICS',
    'MOBILE_AND_ACCESSORIES',
    'HOME_AND_FURNITURE',
    'AUTOMOTIVE',
    'HEALTHCARE',
    'PHARMACY',
    'BEAUTY_AND_WELLNESS',
    'HOTEL_AND_TRAVEL',
    'EDUCATION',
    'FINANCIAL_SERVICES',
    'REAL_ESTATE',
    'PROFESSIONAL_SERVICES',
    'LOGISTICS',
    'MANUFACTURING',
    'WHOLESALE',
    'ENTERTAINMENT',
    'SPORTS_AND_FITNESS',
    'JEWELLERY',
    'BOOKS_AND_STATIONERY',
    'SOFTWARE_AND_TECHNOLOGY',
    'OTHER',
] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];
export type RiskLevel = (typeof riskLevels)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type RagDecision = (typeof ragDecisions)[number];
export type MerchantCategory = (typeof merchantCategories)[number];

/** `ApiResponse` in apps/api/src/utils/response/ApiResponse.ts */
export type ApiEnvelope<T> = {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
};

/** A single field error from `validate.middleware.ts` */
export type ApiFieldError = { field: string; message: string };

/** `merchants` table */
export type ApiMerchant = {
    id: string;
    businessName: string;
    category: MerchantCategory;
    gstNumber: string;
    websiteUrl: string;
    phoneNumber: string;
    createdAt: string | null;
};

/**
 * `verifications` table. `isWebsiteVerified` is nullable in the schema
 * (it is the only boolean column without `.notNull()`).
 */
export type ApiVerification = {
    id: string;
    merchantId: string;
    verificationStatus: VerificationStatus;
    isGstNumberVerified: boolean;
    isWebsiteVerified: boolean | null;
    isPhoneNumberVerified: boolean;
    trustscore: number;
    riskLevel: RiskLevel;
    createdAt: string;
};

/** `payments` table — `amount` is a numeric column, serialised as a string */
export type ApiPayment = {
    id: string;
    merchantId: string;
    amount: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    isInternational: boolean;
    createdAt: string;
};

/**
 * `investigations` table. `action` holds a `RagDecision`, but it is a
 * `varchar(255)` column so unknown values are tolerated by the UI.
 */
export type ApiInvestigation = {
    id: string;
    verificationId: string | null;
    action: string;
    reasoning: string | null;
    isOverridden: boolean;
    overriddenBy: string | null;
    createdAt: string;
};

/** `MerchantWithLatestVerification` in apps/api/src/data/types/Merchant.d.ts */
export type LatestVerification = {
    merchant: ApiMerchant;
    verification: ApiVerification | null;
};

/** `CreateMerchantDto` — see merchant.validator.ts for the exact rules */
export type CreateMerchantRequest = {
    businessName: string;
    category: MerchantCategory;
    gstNumber: string;
    websiteUrl: string;
    phoneNumber: string;
};

/** `CreatePaymentDto` — the POST body is an array of these */
export type CreatePaymentRequest = {
    amount: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    isInternational: boolean;
};

/** Return value of both document upload endpoints */
export type DocumentUploadResult = {
    publicId: string;
    secureUrl: string;
    format?: string;
    bytes: number;
};

/** `RagDecisionResult` in apps/api/src/app/pipelines/rag-analysis/schema.ts */
export type RagDecisionResult = {
    decision: RagDecision;
    confidence: number;
    reasons: string[];
    risks: string[];
    missingEvidence: string[];
};

/**
 * Shape of `investigations.reasoning` on a successful run: the pipeline stores
 * `JSON.stringify({ ragContext, ragResult }, null, 2)`. On a failed run the
 * column holds the literal string `'server error'` instead.
 */
export type InvestigationReasoning = {
    ragContext?: string;
    ragResult?: Partial<RagDecisionResult>;
};

/**
 * Government-document prerequisite state.
 *
 * The backend stores the government document as a `rag_documents` row with
 * `documentType = GOVT_DOCUMENT`, but exposes no route to read it back, so this
 * status is tracked by the Next.js server layer instead of the API.
 */
export type GovtDocumentStatus = {
    exists: boolean;
    uploadedAt: string | null;
    filename: string | null;
    source: 'upload' | 'acknowledged' | null;
};

/** Maximum upload size enforced by `document.middleware.ts` */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

/** `GST_REGEX` in merchant.validator.ts */
export const GST_REGEX =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** `phoneNumber` rule in merchant.validator.ts */
export const PHONE_REGEX = /^[0-9]{10}$/;
