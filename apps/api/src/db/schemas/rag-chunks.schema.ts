import {
  pgTable,
  uuid,
  timestamp,
  text,
  integer,
  vector,
  index,
} from "drizzle-orm/pg-core";

import { ragDocuments } from "@/db/schemas/rag-documents.schema";

export const ragChunks = pgTable(
  "rag_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    documentId: uuid("document_id")
      .notNull()
      .references(() => ragDocuments.id, {
        onDelete: "cascade",
      }),

    content: text("content").notNull(),

    chunkIndex: integer("chunk_index").notNull(),

    embedding: vector("embedding", {
      dimensions: 1024,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("rag_chunks_document_id_idx").on(table.documentId)],
);
