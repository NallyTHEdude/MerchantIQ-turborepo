import {
  pgTable,
  pgEnum,
  uniqueIndex,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { Category } from "@/data/enums/db.enums";

// setting enums required by this schema
export const categoryEnum = pgEnum("category", Object.values(Category) as [Category, ...Category[]]);

// setting the schema using converted enums
export const merchants = pgTable("merchants", {
    id: uuid("id").defaultRandom().primaryKey(),

    businessName: varchar("business_name", {
      length: 255,
    }).notNull(),

    category: categoryEnum("category").notNull(),

    gstNumber: varchar("gst_number", {
      length: 15,
    }).notNull(),

    websiteUrl: varchar("website_url", {
      length: 255,
    }).notNull(),

    phoneNumber: varchar("phone_number", {
      length: 15,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  },
  
  (table) => [
    uniqueIndex("unique_gst_number").on(table.gstNumber),
  ],
);
