import { RiskLevel, VerificationStatus } from "@/data/enums/db.enums";

import { type PipelineResults } from "@/data/types/pipelineTypes";

export const combineResults = (results: PipelineResults) => {
  const trustscore = Math.round(
    (1 - results.mlPredictionData.fraudProbability) * 100,
  );

  const riskLevelMap = {
    LOW: RiskLevel.LOW,
    MEDIUM: RiskLevel.MODERATE,
    HIGH: RiskLevel.HIGH,
  } as const;

  const riskLevel = riskLevelMap[results.mlPredictionData.riskLevel];

  return {
    verificationStatus: VerificationStatus.COMPLETED,
    isPhoneNumberVerified: results.isPhoneNumberVerified,
    isGstNumberVerified: results.isGstNumberVerified,
    isWebsiteVerified: results.isWebsiteVerified,
    trustscore,
    riskLevel,
  };
};
