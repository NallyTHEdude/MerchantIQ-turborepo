import type { RetrievedChunk } from '@/data/types/Rag';

export const buildRagContext = (
    governmentChunks: RetrievedChunk[],
    merchantChunks: RetrievedChunk[],
) => {
    const governmentContext = governmentChunks
        .map(
            (chunk, index) =>
                `[Government Source ${index + 1}]
${chunk.content}`,
        )
        .join('\n\n');

    const merchantContext = merchantChunks
        .map(
            (chunk, index) =>
                `[Merchant Document ${index + 1}]
${chunk.content}`,
        )
        .join('\n\n');

    return `
GOVERNMENT COMPLIANCE EVIDENCE
================================
${governmentContext || 'No relevant government evidence found.'}

MERCHANT REFERENCE DOCUMENT EVIDENCE
================================
${merchantContext || 'No relevant merchant evidence found.'}
`;
};
