import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { verifications } from "./verifications.schema";

export const investigations = pgTable(
  "investigations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    verificationId: uuid("verification_id").references(() => verifications.id),

    action: varchar("action", {
      length: 255,
    }).notNull(),

    reasoning: text("reasoning"),

    isOverridden: boolean("is_overridden").notNull().default(false),

    overriddenBy: varchar("overridden_by", {
      length: 255,
    }),

    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("investigation_verification_id_unique").on(
      table.verificationId,
    ),
  ],
);
