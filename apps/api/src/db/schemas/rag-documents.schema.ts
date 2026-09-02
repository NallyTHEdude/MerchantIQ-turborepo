import {pgTable, uuid, varchar, timestamp, jsonb, pgEnum} from "drizzle-orm/pg-core";
import {DocumentType} from "@/data/enums/db.enums";

export const documentTypeEnum = pgEnum("document_type", Object.values(DocumentType) as [DocumentType, ...DocumentType[]]);

export const ragDocuments = pgTable("rag_documents", {
  id: uuid("id").defaultRandom().primaryKey(),

  source: varchar("source", {
    length: 500,
  }).notNull(),

  documentType: documentTypeEnum("document_type").notNull(),

  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
