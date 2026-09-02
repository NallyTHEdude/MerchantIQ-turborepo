import { type Merchant } from "@/data/types/Merchant";
import { type Verification } from "@/data/types/Verification";
import { type Payment } from "@/data/types/Payment";
import { type RiskLevel, type VerificationStatus } from "@/data/enums/db.enums";

export type VerificationResults = {
  isPhoneNumberVerified: boolean;
  isGstNumberVerified: boolean;
  isWebsiteVerified: boolean;
};

export type MLRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type MLPredictionData = {
  paymentCount: number;
  averagePaymentAmount: number;
  failedPaymentRate: number;
  highValuePaymentRate: number;
  internationalPaymentRate: number;
  isGstNumberVerified: boolean;
  isPhoneNumberVerified: boolean;
  isWebsiteVerified: boolean;
  fraudProbability: number;
  riskLevel: MLRiskLevel;
};

export type WebsiteData = {
  url: string;
  businessName?: string;
  contactInformation?: string;
  physicalAddress?: string;
  productsOrServices?: string;
  policies?: {
    privacyPolicy?: string;
    termsAndConditions?: string;
    refundPolicy?: string;
  };
  scrapedAt: string;
};

export type WebsiteVerificationResult = {
  websiteData: WebsiteData | null;
  isWebsiteVerified: boolean;
};

export type PipelineVerification = Omit<Verification, "createdAt"> & {
  createdAt: string;
};

export type PipelinePayment = Omit<Payment, "createdAt"> & {
  createdAt: string;
};

export type PipelineResults = {
  merchant: Merchant;
  verification: PipelineVerification;
  recentPayments: PipelinePayment[];

  isPhoneNumberVerified: boolean;
  isGstNumberVerified: boolean;
  isWebsiteVerified: boolean;

  websiteData: WebsiteData | null;

  mlPredictionData: MLPredictionData;
};

export type VerificationUpdateData = {
  verificationStatus: VerificationStatus;
  isPhoneNumberVerified: boolean;
  isGstNumberVerified: boolean;
  isWebsiteVerified: boolean;
  trustscore: number;
  riskLevel: RiskLevel;
};

export type VerificationRequestedEvent = {
  name: "verification/requested";
  data: {
    merchant: Merchant;
  };
};

export interface MLServiceResponse {
  fraudProbability: number;
  riskLevel: MLRiskLevel;
}
