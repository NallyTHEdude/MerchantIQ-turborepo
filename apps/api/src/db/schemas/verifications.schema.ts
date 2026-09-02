import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { VerificationStatus, RiskLevel } from "@/data/enums/db.enums";
import { merchants } from "./merchants.schema";

export const riskLevelEnum = pgEnum("risk_level", Object.values(RiskLevel) as [string, ...string[]]);
export const verificationStatusEnum = pgEnum("verification_status", Object.values(VerificationStatus) as [string, ...string[]]);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    merchantId: uuid("merchant_id")
      .notNull()
      .references(() => merchants.id),

    verificationStatus: verificationStatusEnum("verification_status").notNull(),

    isGstNumberVerified: boolean("is_gst_number_verified").notNull(),

    isWebsiteVerified: boolean("is_website_verified"),

    isPhoneNumberVerified: boolean("is_phone_number_verified").notNull(),

    trustscore: integer("trustscore").notNull(),

    riskLevel: riskLevelEnum("risk_level").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },

  (table) => [
    index("verification_merchant_id_index").on(table.merchantId),

    // Only one PENDING verification per merchant
    uniqueIndex("one_pending_verification_per_merchant").on(table.merchantId).where(
        sql`${table.verificationStatus} = ${VerificationStatus.PENDING}`
      )
  ],
);
