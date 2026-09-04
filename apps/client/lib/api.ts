import type { PipelineCheck } from '@/data/merchants';
import {
    merchantCategories,
    riskLevels,
    verificationStatuses,
    type Merchant,
    type MerchantCategory,
    type RiskLevel,
    type VerificationStatus,
} from '@/data/merchants';

const getBackendUrl = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl)
        throw new Error('NEXT_PUBLIC_BACKEND_URL is not configured');
    return backendUrl;
};

export type ApiResponse<T> = {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
};

export type ApiMerchant = {
    id: string;
    businessName: string;
    category: MerchantCategory;
    gstNumber: string;
    websiteUrl: string;
    phoneNumber: string;
    createdAt: string;
};

export type ApiVerification = {
    id: string;
    merchantId: string;
    verificationStatus: VerificationStatus;
    isGstNumberVerified: boolean;
    isWebsiteVerified: boolean;
    isPhoneNumberVerified: boolean;
    trustscore: number;
    riskLevel: RiskLevel;
    createdAt: string;
};

export type LatestVerification = {
    merchant: ApiMerchant;
    verification: ApiVerification | null;
};

export type ApiPayment = {
    id: string;
    merchantId: string;
    amount: string;
    status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
    paymentMethod: 'CARD' | 'UPI' | 'NET_BANKING';
    isInternational: boolean;
    createdAt: string;
};

export type CreateMerchantRequest = {
    businessName: string;
    category: MerchantCategory;
    gstNumber: string;
    websiteUrl: string;
    phoneNumber: string;
};

export type CreatePaymentRequest = {
    amount: string;
    status: ApiPayment['status'];
    paymentMethod: ApiPayment['paymentMethod'];
    isInternational: boolean;
};

export type DocumentUploadResult = {
    publicId: string;
    secureUrl: string;
    format?: string;
    bytes: number;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    let response: Response;
    try {
        response = await fetch(`${getBackendUrl()}${path}`, init);
    } catch {
        throw new Error('Unable to connect to the backend API.');
    }

    let body: unknown;
    try {
        body = await response.json();
    } catch {
        throw new Error('The backend returned an invalid response.');
    }

    if (!response.ok) {
        const message =
            typeof body === 'object' &&
            body !== null &&
            'message' in body &&
            typeof body.message === 'string'
                ? body.message
                : `Request failed with status ${response.status}.`;
        throw new Error(message);
    }

    return body as T;
};

const jsonRequest = (body: unknown, method = 'POST'): RequestInit => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

export const api = {
    latestVerifications: () =>
        request<ApiResponse<LatestVerification[]>>(
            '/merchant/all/latest-verification',
        ),
    merchant: (id: string) =>
        request<ApiResponse<ApiMerchant>>(`/merchant/${id}`),
    verifications: (merchantId: string) =>
        request<ApiResponse<ApiVerification[]>>(`/verification/${merchantId}`),
    payments: (merchantId: string) =>
        request<ApiResponse<ApiPayment[]>>(`/payment/${merchantId}`),
    createMerchant: (body: CreateMerchantRequest) =>
        request<ApiResponse<ApiMerchant>>('/merchant', jsonRequest(body)),
    createPayments: (merchantId: string, body: CreatePaymentRequest[]) =>
        request<ApiResponse<ApiPayment[]>>(
            `/payment/${merchantId}`,
            jsonRequest(body),
        ),
    uploadMerchantDocument: (merchantId: string, file: File) => {
        const formData = new FormData();
        formData.append('document', file);
        return request<ApiResponse<DocumentUploadResult>>(
            `/document/${merchantId}`,
            { method: 'POST', body: formData },
        );
    },
};

export const mapLatestVerification = (item: LatestVerification): Merchant => {
    const verification = item.verification;
    const checks: PipelineCheck[] | undefined = verification
        ? [
              {
                  stage: 'Phone Number Verification',
                  state: verification.isPhoneNumberVerified
                      ? 'success'
                      : verification.verificationStatus === 'PENDING'
                        ? 'processing'
                        : 'failed',
                  result: verification.isPhoneNumberVerified
                      ? 'Passed'
                      : 'Not verified',
                  timestamp: verification.createdAt,
                  explanation: 'Based on the latest verification record.',
              },
              {
                  stage: 'GST Verification',
                  state: verification.isGstNumberVerified
                      ? 'success'
                      : verification.verificationStatus === 'PENDING'
                        ? 'processing'
                        : 'failed',
                  result: verification.isGstNumberVerified
                      ? 'Passed'
                      : 'Not verified',
                  timestamp: verification.createdAt,
                  explanation: 'Based on the latest verification record.',
              },
              {
                  stage: 'Website Verification',
                  state: verification.isWebsiteVerified
                      ? 'success'
                      : verification.verificationStatus === 'PENDING'
                        ? 'processing'
                        : 'failed',
                  result: verification.isWebsiteVerified
                      ? 'Passed'
                      : 'Not verified',
                  timestamp: verification.createdAt,
                  explanation: 'Based on the latest verification record.',
              },
          ]
        : undefined;
    return {
        id: item.merchant.id,
        name: item.merchant.businessName,
        legalName: item.merchant.businessName,
        status: verification?.verificationStatus ?? 'PENDING',
        risk: verification?.riskLevel ?? 'VERY_HIGH',
        trustScore: verification?.trustscore ?? 0,
        stage: 'Phone Number Verification',
        updatedAt: verification?.createdAt ?? item.merchant.createdAt,
        submittedAt: item.merchant.createdAt,
        country: 'India',
        category: item.merchant.category,
        website: item.merchant.websiteUrl,
        phone: item.merchant.phoneNumber,
        gstNumber: item.merchant.gstNumber,
        merchantId: item.merchant.id,
        verification,
        checks,
    };
};

export const isMerchantCategory = (value: string): value is MerchantCategory =>
    (merchantCategories as readonly string[]).includes(value);

export const displayLabel = (value: string) =>
    value
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

export { riskLevels, verificationStatuses };
