import { db } from "@/db";
import { ragDocuments } from "@/db/schemas/rag-documents.schema";
import { ragChunks } from "@/db/schemas/rag-chunks.schema";
import type { CreateRagDocument, CreateRagChunks } from "@/data/types/Rag";

export const createRagDocumentWithChunks = async (documentData: CreateRagDocument, chunkData: Omit<CreateRagChunks, "documentId">) => {
  return db.transaction(async (tx) => {

    if (chunkData.chunks.length !== chunkData.embeddings.length) {
      throw new Error("Number of chunks does not match number of embeddings");
    }

    const [document] = await tx
      .insert(ragDocuments)
      .values(documentData)
      .returning({
        id: ragDocuments.id,
      });

    if (!document) {
      throw new Error("Failed to create RAG document");
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
