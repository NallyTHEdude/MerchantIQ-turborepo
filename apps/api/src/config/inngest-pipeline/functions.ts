import { inngestClient } from "./client";
import { verificationRequested } from "./eventSchemas";

import { documentUploaded } from "./eventSchemas";
import { extractTextFromPdf } from "@/app/embedding-pipeline-stages/document";
import { chunkDocument } from "@/app/embedding-pipeline-stages/chunk";
import { generateEmbeddings } from "@/app/embedding-pipeline-stages/embedding";
import { createRagDocumentWithChunks } from "@/app/repositories/rag.repository";

import {
  applyMerchantUpdate,
  buildPipelineResults,
  combinePipelineResults,
  loadVerificationContext,
  persistVerificationResult,
  runGstVerification,
  runMlPrediction,
  runPhoneVerification,
  runWebsiteVerification,
} from "../../helpers/verificaiton-pipeline";

import { markVerificationAsServerError } from "@/app/repositories/verification.repository";
import { VerificationStatus } from "@/data/enums/db.enums";
import { type Merchant } from "@/data/types/Merchant";

export const verificationPipeline = inngestClient.createFunction(
  {
    id: "verify-merchant",
    retries: 2, // 2 retries after the initial attempt, total 3 attempts

    triggers: [verificationRequested],

    // Runs after all retries are exhausted
    onFailure: async (failure) => {
      const eventData = failure.event.data.event.data as unknown as {
        merchant: Merchant;
        verificationId: string;
      };

      const { merchant, verificationId } = eventData;

      console.error(
        `Verification pipeline permanently failed for merchant ${merchant.id}`,
        failure.error,
      );

      await markVerificationAsServerError(verificationId);

      console.log(`Verification ${verificationId} marked as SERVER_ERROR`);
    },
  },

  async ({ event, step }) => {
    const { merchant, verificationId, isMerchantUpdate } = event.data;

    // Step 0: Start verification
    await step.run("start-verification", () => {
      console.log(
        `Starting verification ${verificationId} for merchant ${merchant.id}`,
      );
    });

    // Step 1: Load verification + recent payments
    const { verification, recentPayments } = await step.run(
      "load-context",
      async () => {
        return loadVerificationContext(merchant, verificationId);
      },
    );

    // Step 2-4: Run independent verification stages concurrently for better latency
    const [isPhoneNumberVerified, isGstNumberVerified, websiteVerification] =
      await Promise.all([
        // Step 2: Verify phone number
        step.run("verify-phone-number", async () => {
          return runPhoneVerification(merchant);
        }),

        // Step 3: Verify GST number
        step.run("verify-gst-number", async () => {
          return runGstVerification(merchant);
        }),

        // Step 4: Verify website
        step.run("verify-website", async () => {
          return runWebsiteVerification(merchant);

          // For testing purposes, we can return dummy data here:
          //
          // return {
          //   websiteData: {
          //     dummyData: true,
          //     url: "wrong_dummy_url_here",
          //   },
          //   isWebsiteVerified: false,
          // };
        }),
      ]);

    const { websiteData, isWebsiteVerified } = websiteVerification;

    // Step 5: Run ML prediction
    const mlPredictionData = await step.run("run-ml-prediction", async () => {
      return runMlPrediction(
        merchant,
        recentPayments,
        isGstNumberVerified,
        isPhoneNumberVerified,
        isWebsiteVerified,
      );
    });

    // Step 6: Build pipeline results
    const pipelineResults = buildPipelineResults(
      merchant,
      verification,
      recentPayments,
      isPhoneNumberVerified,
      isGstNumberVerified,
      websiteData,
      isWebsiteVerified,
      mlPredictionData,
    );

    // Step 7: Combine results
    const result = await step.run("combine-results", () => {
      return combinePipelineResults(pipelineResults);
    });

    // Step 8: Persist final verification result
    const updatedVerificationData = await step.run(
      "update-verification",
      async () => {
        return persistVerificationResult(pipelineResults, result);
      },
    );

    // Step 9: Apply merchant update only after successful verification
    const updatedMerchant = await step.run(
      "apply-merchant-update",
      async () => {
        if (!isMerchantUpdate) {
          return null;
        }

        if (result.verificationStatus !== VerificationStatus.COMPLETED) {
          return null;
        }

        console.log(
          `Verification successful. Applying merchant update for ${merchant.id}`,
        );

        return applyMerchantUpdate(merchant);
      },
    );

    console.log(
      `Updated verification ${verification.id} for merchant ${merchant.id}`,
    );

    return {
      updatedVerificationData,
      pipelineResults,
      updatedMerchant,
    };
  },
);

export const documentIngestionPipeline = inngestClient.createFunction(
  {
    id: "ingest-document",
    retries: 2,
    triggers: [documentUploaded],
  },
  async ({ event, step }) => {
    const { secureUrl, source, documentType, metadata } = event.data;

    // step1: Extract text from document
    const text = await step.run("extract-document-text", async () => {
      const text = await extractTextFromPdf(secureUrl);
      if (!text) {
        throw new Error("No text could be extracted from document");
      }
      return text;
    });

    // step2: Chunk document
    const chunks = await step.run("chunk-document", async () => {
      const chunks = await chunkDocument(text);
      if (chunks.length === 0) {
        throw new Error("Document produced no chunks");
      }
      return chunks;
    });

    // step3: Generate embeddings from chunks
    const embeddings = await step.run("generate-document-embeddings", async () => {
        return generateEmbeddings(chunks);
      },
    );

    // step4: Persist document and chunks to database
    const document = await step.run("persist-rag-document", async () => {
      return createRagDocumentWithChunks(
        {
          source,
          documentType,
          metadata,
        },
        {
          chunks,
          embeddings,
        },
      );
    });

    return {
      documentId: document.id,
      chunkCount: chunks.length,
    };
  },
);