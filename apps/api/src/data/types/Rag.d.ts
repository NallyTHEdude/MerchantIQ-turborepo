import type { DocumentType } from "@/data/enums/db.enums";

export type CreateRagDocument = {
  source: string;
  documentType: DocumentType;
  metadata?: Record<string, unknown>;
};

export type CreateRagChunks = {
  documentId: string;
  chunks: string[];
  embeddings: number[][];
};

export type IngestDocumentInput = {
  secureUrl: string;
  source: string;
  documentType: DocumentType;
  metadata?: Record<string, unknown>;
};