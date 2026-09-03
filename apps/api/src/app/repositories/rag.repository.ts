import { db } from '@/db';
import { ragDocuments } from '@/db/schemas/rag-documents.schema';
import { ragChunks } from '@/db/schemas/rag-chunks.schema';
import type { CreateRagDocument, CreateRagChunks } from '@/data/types/Rag';
import { eq, isNull, sql } from 'drizzle-orm';

export const createRagDocumentWithChunks = async (
    documentData: CreateRagDocument,
    chunkData: Omit<CreateRagChunks, 'documentId'>,
) => {
    return db.transaction(async (tx) => {
        if (chunkData.chunks.length !== chunkData.embeddings.length) {
            throw new Error(
                'Number of chunks does not match number of embeddings',
            );
        }

        const [document] = await tx
            .insert(ragDocuments)
            .values(documentData)
            .returning({
                id: ragDocuments.id,
            });

        if (!document) {
            throw new Error('Failed to create RAG document');
        }

        const values = chunkData.chunks.map((content, index) => {
            const embedding = chunkData.embeddings[index];

            if (!embedding) {
                throw new Error(`Missing embedding for chunk ${index}`);
            }

            return {
                documentId: document.id,
                content,
                chunkIndex: index,
                embedding,
            };
        });

        await tx.insert(ragChunks).values(values);
        return document;
    });
};

export const retrieveRelevantChunks = async (
    queryEmbedding: number[],
    merchantId: string,
    limit = 5,
) => {
    const embedding = JSON.stringify(queryEmbedding);

    const governmentChunks = await db
        .select({
            id: ragChunks.id,
            documentId: ragChunks.documentId,
            content: ragChunks.content,
            documentType: ragDocuments.documentType,
            source: ragDocuments.source,
            similarity: sql<number>`
        1 - (${ragChunks.embedding} <=> ${embedding}::vector)
      `,
        })
        .from(ragChunks)
        .innerJoin(ragDocuments, eq(ragChunks.documentId, ragDocuments.id))
        .where(isNull(ragDocuments.merchantId))
        .orderBy(sql`${ragChunks.embedding} <=> ${embedding}::vector`)
        .limit(limit);

    const merchantChunks = await db
        .select({
            id: ragChunks.id,
            documentId: ragChunks.documentId,
            content: ragChunks.content,
            documentType: ragDocuments.documentType,
            source: ragDocuments.source,
            similarity: sql<number>`
        1 - (${ragChunks.embedding} <=> ${embedding}::vector)
      `,
        })
        .from(ragChunks)
        .innerJoin(ragDocuments, eq(ragChunks.documentId, ragDocuments.id))
        .where(eq(ragDocuments.merchantId, merchantId))
        .orderBy(sql`${ragChunks.embedding} <=> ${embedding}::vector`)
        .limit(limit);

    return {
        governmentChunks,
        merchantChunks,
    };
};
