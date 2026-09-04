import { chunkDocument } from '@/app/pipelines/embedding-pipeline-stages/chunk';
import { extractTextFromPdf } from '@/app/pipelines/embedding-pipeline-stages/document';
import {
    generateEmbeddings,
    generateOneEmbedding,
} from '@/app/pipelines/embedding-pipeline-stages/embedding';
import { structuredRagModel } from '@/app/pipelines/rag-analysis/chain';
import { buildRagContext } from '@/app/pipelines/rag-analysis/context';
import { buildRagPrompt } from '@/app/pipelines/rag-analysis/prompt';
import type { RagDecisionResult } from '@/app/pipelines/rag-analysis/schema';
import { createInvestigation } from '@/app/repositories/investigation.repository';
import {
    createRagDocumentWithChunks,
    retrieveRelevantChunks,
} from '@/app/repositories/rag.repository';
import { markVerificationAsServerError } from '@/app/repositories/verification.repository';
import { VerificationStatus } from '@/data/enums/db.enums';
import { type Merchant } from '@/data/types/Merchant';
import { invoke } from 'inngest';
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
} from '../../helpers/verificaiton-pipeline';
import { inngestClient } from './client';
import {
    documentUploaded,
    merchantAnalysisRequested,
    merchantRagSchema,
    verificationRequested,
} from './eventSchemas';
import {RagDecision} from "@/data/enums/rag.enums";

type RagProcessingResult = {
    merchantId: string;
    verificationId: string;
    ragContext: string;
    ragResult: RagDecisionResult;
    documentResult: unknown;
};

export const verificationPipeline = inngestClient.createFunction(
    {
        id: 'verify-merchant',
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

            console.log(
                `Verification ${verificationId} marked as SERVER_ERROR`,
            );
        },
    },

    async ({ event, step }) => {
        const { merchant, verificationId, isMerchantUpdate } = event.data;

        // Step 0: Start verification
        await step.run('start-verification', () => {
            console.log(
                `Starting verification ${verificationId} for merchant ${merchant.id}`,
            );
        });

        // Step 1: Load verification + recent payments
        const { verification, recentPayments } = await step.run(
            'load-context',
            async () => {
                return loadVerificationContext(merchant, verificationId);
            },
        );

        // Step 2-4: Run independent verification stages concurrently for better latency
        const [
            isPhoneNumberVerified,
            isGstNumberVerified,
            websiteVerification,
        ] = await Promise.all([
            // Step 2: Verify phone number
            step.run('verify-phone-number', async () => {
                return runPhoneVerification(merchant);
            }),

            // Step 3: Verify GST number
            step.run('verify-gst-number', async () => {
                return runGstVerification(merchant);
            }),

            // Step 4: Verify website
            step.run('verify-website', async () => {
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
        const mlPredictionData = await step.run(
            'run-ml-prediction',
            async () => {
                return runMlPrediction(
                    merchant,
                    recentPayments,
                    isGstNumberVerified,
                    isPhoneNumberVerified,
                    isWebsiteVerified,
                );
            },
        );

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
        const result = await step.run('combine-results', () => {
            return combinePipelineResults(pipelineResults);
        });

        // Step 8: Persist final verification result
        const updatedVerificationData = await step.run(
            'update-verification',
            async () => {
                return persistVerificationResult(pipelineResults, result);
            },
        );

        // Step 9: Apply merchant update only after successful verification
        const updatedMerchant = await step.run(
            'apply-merchant-update',
            async () => {
                if (!isMerchantUpdate) {
                    return null;
                }

                if (
                    result.verificationStatus !== VerificationStatus.COMPLETED
                ) {
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
        id: 'ingest-document',
        retries: 2,
        triggers: [documentUploaded],
    },
    async ({ event, step }) => {
        const { secureUrl, source, documentType, merchantId, metadata } =
            event.data;
        const text = await step.run('extract-document-text', async () => {
            const document_text = await extractTextFromPdf(secureUrl);
            if (!document_text) {
                throw new Error('No text could be extracted from document');
            }
            return document_text;
        });

        const chunks = await step.run('chunk-document', async () => {
            const document_chunks = await chunkDocument(text);
            if (document_chunks.length === 0) {
                throw new Error('Document produced no chunks');
            }
            return document_chunks;
        });

        const document = await step.run(
            'generate-embeddings-and-persist',
            async () => {
                const embeddings = await generateEmbeddings(chunks);

                return createRagDocumentWithChunks(
                    {
                        source,
                        documentType,
                        merchantId,
                        metadata,
                    },
                    {
                        chunks,
                        embeddings,
                    },
                );
            },
        );

        return {
            documentId: document.id,
            chunkCount: chunks.length,
        };
    },
);

export const ragProcessingPipeline = inngestClient.createFunction(
    {
        id: 'process-merchant-rag',
        retries: 2,
        triggers: [invoke(merchantRagSchema)],
    },

    async ({ event, step }) => {
        const { merchant, verificationId, verificationResult, documentResult } =
            event.data;

        const query = `
      Merchant name: ${merchant.businessName}
      Business category: ${merchant.category}
      GST number: ${merchant.gstNumber}
      Phone number: ${merchant.phoneNumber}
    `;

        const queryEmbedding = await step.run(
            'generate-query-embedding',
            async () => {
                const embedding = await generateOneEmbedding(query);
                if (!embedding) {
                    throw new Error('Failed to generate query embedding');
                }
                return embedding;
            },
        );

        const retrievedChunks = await step.run(
            'retrieve-relevant-chunks',
            async () => {
                return retrieveRelevantChunks(queryEmbedding, merchant.id, 5);
            },
        );

        const ragContext = buildRagContext(
            retrievedChunks.governmentChunks,
            retrievedChunks.merchantChunks,
        );

        const ragResult = await step.run(
            'analyze-merchant-with-rag',
            async () => {
                const prompt = buildRagPrompt(
                    merchant,
                    verificationResult,
                    ragContext,
                );

                return structuredRagModel.invoke(prompt);
            },
        );

        return {
            merchantId: merchant.id,
            verificationId,
            ragContext,
            ragResult,
            documentResult,
        };
    },
);

export const merchantAnalysisPipeline = inngestClient.createFunction(
    {
        id: 'merchant-analysis',
        triggers: [merchantAnalysisRequested],
    },
    async ({ event, step }) => {
        const { merchant, verificationId, isMerchantUpdate, document } =
            event.data;

        const [verificationResult, documentResult] = await Promise.all([
            step.invoke('run-verification', {
                function: verificationPipeline,
                data: {
                    merchant,
                    verificationId,
                    isMerchantUpdate,
                },
            }),

            step.invoke('run-document-ingestion', {
                function: documentIngestionPipeline,
                data: document,
            }),
        ]);

        if (!verificationResult || !documentResult) {
            throw new Error('Merchant analysis prerequisites are missing');
        }

        // console.log("Verification result:", verificationResult);
        // console.log("Document result:", documentResult);

        let ragPipelineResult: RagProcessingResult | null = null;

        try {
            ragPipelineResult = (await step.invoke('run-rag', {
                function: ragProcessingPipeline,
                data: {
                    merchant,
                    verificationId,
                    verificationResult,
                    documentResult,
                },
            })) as RagProcessingResult;
        } catch (error) {
            console.error(
                `RAG pipeline failed for merchant ${merchant.id}`,
                error,
            );

            await step.run('create-failed-investigation', async () => {
                return createInvestigation({
                    verificationId,
                    action: RagDecision.SERVER_ERROR,
                    reasoning: 'server error',
                });
            });

            throw error;
        }

        await step.run('create-investigation', async () => {
            return createInvestigation({
                verificationId,
                action: ragPipelineResult!.ragResult.decision,
                reasoning: JSON.stringify(ragPipelineResult, null, 2),
            });
        });

        return {
            verificationResult,
            documentResult,
            ragPipelineResult,
        };
    },
);
