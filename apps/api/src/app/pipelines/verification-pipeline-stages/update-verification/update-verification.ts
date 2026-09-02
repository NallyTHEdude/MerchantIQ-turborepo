import {
  type PipelineResults,
  type VerificationUpdateData,
} from "@/data/types/pipelineTypes";
import { updateVerificationById } from "@/app/repositories/verification.repository";

export const updateVerification = async (
  results: PipelineResults,
  updateData: VerificationUpdateData,
) => {
  return updateVerificationById(
    results.merchant.id,
    results.verification.id,
    updateData,
  );
};
