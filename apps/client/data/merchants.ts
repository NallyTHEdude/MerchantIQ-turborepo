import type { ApiVerification } from '@/lib/api';

export const verificationStatuses = [
    'PENDING',
    'SERVER_ERROR',
    'COMPLETED',
    'FAILED',
] as const;
export const riskLevels = ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'] as const;
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

export const verificationStages = [
    'Phone Number Verification',
    'GST Verification',
    'Website Verification',
    'Payment / Transaction Analysis',
    'Trust Score + Risk Level',
    'LangGraph Reasoning / Action',
    'Compliance RAG',
] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];
export type RiskLevel = (typeof riskLevels)[number];
export type MerchantCategory = (typeof merchantCategories)[number];
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
    stage: VerificationStage;
    updatedAt: string;
    submittedAt: string;
    country?: string;
    category: MerchantCategory;
    website: string;
    phone: string;
    gstNumber: string;
    merchantId: string;
    verification?: ApiVerification | null;
    assessment?: string;
    logisticRegression?: string;
    isolationForest?: string;
    riskSignals?: string[];
    complianceConcerns?: string[];
    ragContext?: string;
    recommendedAction?: string;
    checks?: PipelineCheck[];
};

export type PaymentRecord = {
    amount: string;
    status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
    paymentMethod: 'CARD' | 'UPI' | 'NET_BANKING';
    isInternational: boolean;
};

export type GstRegistrationCertificate = File;
