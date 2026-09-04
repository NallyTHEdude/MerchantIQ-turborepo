/**
 * View-model types for the merchant UI.
 *
 * The backend value unions live in `lib/api-types.ts` (mirrored from
 * `apps/api/src/data/enums`) and are re-exported here so existing imports from
 * `@/data/merchants` keep working.
 */
import type {
    ApiVerification,
    CreatePaymentRequest,
    MerchantCategory,
    RiskLevel,
    VerificationStatus,
} from '@/lib/api-types';

export {
    merchantCategories,
    paymentMethods,
    paymentStatuses,
    riskLevels,
    verificationStatuses,
} from '@/lib/api-types';

export type {
    MerchantCategory,
    PaymentMethod,
    PaymentStatus,
    RiskLevel,
    VerificationStatus,
} from '@/lib/api-types';

/**
 * Human-readable labels for the pipeline steps. Only the first three map to
 * columns the backend actually stores (`is_phone_number_verified`,
 * `is_gst_number_verified`, `is_website_verified`); the rest describe stages
 * whose output is exposed through the investigation record instead.
 */
export const verificationStages = [
    'Phone Number Verification',
    'GST Verification',
    'Website Verification',
    'Payment / Transaction Analysis',
    'Trust Score + Risk Level',
    'LangGraph Reasoning / Action',
    'Compliance RAG',
] as const;

export type VerificationStage = (typeof verificationStages)[number];
export type CheckState = 'success' | 'processing' | 'failed' | 'review';

export type PipelineCheck = {
    stage: VerificationStage;
    state: CheckState;
    result: string;
    timestamp: string;
    explanation: string;
};

export type Merchant = {
    id: string;
    name: string;
    legalName: string;
    status: VerificationStatus;
    risk: RiskLevel;
    trustScore: number;
    updatedAt: string;
    submittedAt: string;
    country?: string;
    category: MerchantCategory;
    website: string;
    phone: string;
    gstNumber: string;
    merchantId: string;
    verification?: ApiVerification | null;
    stage?: VerificationStage;
    checks?: PipelineCheck[];
};

/** A single entry of the uploaded payment JSON, ready to POST. */
export type PaymentRecord = CreatePaymentRequest;

export type GstRegistrationCertificate = File;
