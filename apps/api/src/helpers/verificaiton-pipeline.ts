import { type Merchant } from "@/data/types/Merchant";
import type{ PipelineResults, PipelinePayment } from "@/data/types/pipelineTypes";

import { getByVerificationId } from "@/app/repositories/verification.repository";

import { getHundredLatestPaymentsByMerchantId } from "@/app/repositories/payment.repository";

import { verifyPhoneNumber } from "@/app/verification-pipeline-stages/phone-number/phoneNumber.verification";
import { gstNumberVerification } from "@/app/verification-pipeline-stages/gst-number/gstNumber.verification";
import { fetchWebsiteData } from "@/app/verification-pipeline-stages/web-scraper/website.verification";
import { mlPrediction } from "@/app/verification-pipeline-stages/ml-prediction/ml-model";
import { combineResults } from "@/app/verification-pipeline-stages/combine-results/combine-results";
import { updateVerification } from "@/app/verification-pipeline-stages/update-verification/update-verification";
import { updateMerchant } from "@/app/repositories/merchant.repository";

// Load existing verification and recent payments
export const loadVerificationContext = async (
  merchant: Merchant,
  verificationId: string,
) => {
  const verification = await getByVerificationId(merchant.id, verificationId);

  if (!verification) {
    throw new Error(
      `Verification ${verificationId} not found for merchant ${merchant.id}`,
    );
  }

  const recentPayments = await getHundredLatestPaymentsByMerchantId(
    merchant.id,
  );

  console.log(
    `Loaded verification ${verification.id} and payments for merchant ${merchant.id}`,
  );

  return {
    verification,
    recentPayments,
  };
};

// Verify phone number
export const runPhoneVerification = async (merchant: Merchant) => {
  console.log(`Verifying phone number for merchant ${merchant.id}`);

  return verifyPhoneNumber(merchant.phoneNumber);
};

// Verify GST number
export const runGstVerification = async (merchant: Merchant) => {
  console.log(`Verifying GST for merchant ${merchant.id}`);

  return gstNumberVerification(merchant.gstNumber);
};

// Investigate merchant website
export const runWebsiteVerification = async (merchant: Merchant) => {
  console.log(`Verifying website for merchant ${merchant.id}`);

  return fetchWebsiteData(
    merchant.websiteUrl,
    merchant.businessName,
    merchant.category,
  );
};

// Run ML fraud prediction
export const runMlPrediction = async (
  merchant: Merchant,
  recentPayments: PipelinePayment[],
  isGstNumberVerified: boolean,
  isPhoneNumberVerified: boolean,
  isWebsiteVerified: boolean,
) => {
  console.log(`Running ML prediction for merchant ${merchant.id}`);

  return mlPrediction(recentPayments, {
    isGstNumberVerified,
    isPhoneNumberVerified,
    isWebsiteVerified,
  });
};

// Build final pipeline result object
export const buildPipelineResults = (
  merchant: Merchant,
  verification: PipelineResults["verification"],
  recentPayments: PipelineResults["recentPayments"],
  isPhoneNumberVerified: boolean,
  isGstNumberVerified: boolean,
  websiteData: PipelineResults["websiteData"],
  isWebsiteVerified: boolean,
  mlPredictionData: PipelineResults["mlPredictionData"],
): PipelineResults => {
  return {
    merchant,
    verification,
    recentPayments,
    isPhoneNumberVerified,
    isGstNumberVerified,
    websiteData,
    isWebsiteVerified,
    mlPredictionData,
  };
};

// Combine all verification results
export const combinePipelineResults = (
  pipelineResults: PipelineResults,
) => {
  return combineResults(pipelineResults);
};

// Persist final verification result
export const persistVerificationResult = async (
  pipelineResults: PipelineResults,
  result: Awaited<ReturnType<typeof combineResults>>,
) => {
  console.log(
    `Updating verification ${pipelineResults.verification.id} for merchant ${pipelineResults.merchant.id}`,
  );

  return updateVerification(pipelineResults, result);
};

export const applyMerchantUpdate = async (merchant: Merchant): Promise<Merchant | null> => {
  return updateMerchant(merchant.id, {
    businessName: merchant.businessName,
    category: merchant.category,
    gstNumber: merchant.gstNumber,
    websiteUrl: merchant.websiteUrl,
    phoneNumber: merchant.phoneNumber,
  });
};
