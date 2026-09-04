import type { RetrievedChunk } from '@/data/types/Rag';

export const buildRagContext = (
    governmentChunks: RetrievedChunk[],
    merchantChunks: RetrievedChunk[],
) => {
    const MAX_CHARS_PER_CHUNK = 2500;

    const governmentContext = governmentChunks
        .slice(0, 2)
        .map(
            (chunk, index) =>
                `[Government Source ${index + 1}]
${chunk.content.slice(0, MAX_CHARS_PER_CHUNK)}`,
        )
        .join('\n\n');

    const merchantContext = merchantChunks
        .slice(0, 2)
        .map(
            (chunk, index) =>
                `[Merchant Document ${index + 1}]
${chunk.content.slice(0, MAX_CHARS_PER_CHUNK)}`,
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