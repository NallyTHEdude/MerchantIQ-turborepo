import {
  decimal,
  index,
  pgTable,
  timestamp,
  uuid,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { PaymentStatus, PaymentMethod } from "@/data/enums/db.enums";

import { merchants } from "./merchants.schema";

export const paymentStatusEnum = pgEnum("payment_status", Object.values(PaymentStatus) as [PaymentStatus, ...PaymentStatus[]]);
export const paymentMethodEnum = pgEnum("payment_method", Object.values(PaymentMethod) as [PaymentMethod, ...PaymentMethod[]]);

export const payments = pgTable("payments", {
    id: uuid("id").defaultRandom().primaryKey(),

    merchantId: uuid("merchant_id").notNull().references(() => merchants.id),

    amount: decimal("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    status: paymentStatusEnum("status").notNull(),

    paymentMethod: paymentMethodEnum("payment_method").notNull(),

    isInternational: boolean("is_international").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("payment_merchant_id_index").on(table.merchantId)],
);
