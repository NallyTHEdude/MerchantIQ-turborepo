import { extractTextFromPdf } from "./document";
import { chunkDocument } from "./chunk";
import { generateEmbeddings } from "./embedding";
import { createRagDocumentWithChunks } from "@/app/repositories/rag.repository";
import type { IngestDocumentInput } from "@/data/types/Rag";


export const ingestDocument = async ({secureUrl, source, documentType, metadata}: IngestDocumentInput) => {
  const text = await extractTextFromPdf(secureUrl);

  if (!text) {
    throw new Error("No text could be extracted from document");
  }

  const chunks = await chunkDocument(text);

  if (chunks.length === 0) {
    throw new Error("Document produced no chunks");
  }

  const embeddings = await generateEmbeddings(chunks);

  const document = await createRagDocumentWithChunks(
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

  return document;
};
