export type VerificationStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | string;
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | string;

export interface Merchant {
  id: string;
  businessName: string;
  category: string;
  gstNumber: string;
  websiteUrl: string;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMerchantDto {
  businessName: string;
  category: string;
  gstNumber: string;
  websiteUrl: string;
  phoneNumber: string;
}

export interface Verification {
  id: string;
  merchantId: string;
  verificationStatus: VerificationStatus;
  isGstNumberVerified: boolean;
  isWebsiteVerified: boolean;
  isPhoneNumberVerified: boolean;
  trustscore: number;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface MerchantWithVerification {
  merchant: Merchant;
  verification: Verification | null;
}

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | string;
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | string;

export interface PaymentItem {
  id: string;
  merchantId: string;
  amount: string | number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  isInternational?: boolean;
  createdAt: string;
}

export interface CreatePaymentDto {
  amount: number;
  status: string;
  paymentMethod: string;
  isInternational: boolean;
}

export interface DocumentUploadData {
  publicId?: string;
  secureUrl: string;
  format?: string;
  bytes?: number;
}

export interface Investigation {
  id: string;
  verificationId: string;
  action: string;
  reasoning: string;
  isOverridden: boolean;
  overriddenBy: string | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  statusCode?: number;
  data?: T;
  message?: unknown;
  success?: boolean;
}

export interface UploadedDocInfo {
  type: 'merchant' | 'government';
  publicId?: string;
  secureUrl: string;
  format?: string;
  bytes?: number;
  uploadedAt: string;
  fileName?: string;
}
