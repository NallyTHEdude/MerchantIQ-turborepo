import { MistralAIEmbeddings } from '@langchain/mistralai';
import { config } from '@/config/env';

const embeddingModel = new MistralAIEmbeddings({
    model: 'mistral-embed',
    apiKey: config.MISTRAL_API_KEY,
});

const BATCH_SIZE = 20;

export const generateEmbeddings = async (
    chunks: string[],
): Promise<number[][]> => {
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const batchEmbeddings = await embeddingModel.embedDocuments(batch);
        allEmbeddings.push(...batchEmbeddings);
    }
    return allEmbeddings;
};

export const generateOneEmbedding = async (text: string): Promise<number[]> => {
    return embeddingModel.embedQuery(text);
};
