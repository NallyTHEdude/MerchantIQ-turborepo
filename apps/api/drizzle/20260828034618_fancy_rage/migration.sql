CREATE TYPE "category" AS ENUM('FOOD_AND_BEVERAGE', 'GROCERY', 'RETAIL', 'CLOTHING_AND_FASHION', 'ELECTRONICS', 'MOBILE_AND_ACCESSORIES', 'HOME_AND_FURNITURE', 'AUTOMOTIVE', 'HEALTHCARE', 'PHARMACY', 'BEAUTY_AND_WELLNESS', 'HOTEL_AND_TRAVEL', 'EDUCATION', 'FINANCIAL_SERVICES', 'REAL_ESTATE', 'PROFESSIONAL_SERVICES', 'LOGISTICS', 'MANUFACTURING', 'WHOLESALE', 'ENTERTAINMENT', 'SPORTS_AND_FITNESS', 'JEWELLERY', 'BOOKS_AND_STATIONERY', 'SOFTWARE_AND_TECHNOLOGY', 'OTHER');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('CARD', 'UPI', 'NET_BANKING');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('SUCCESS', 'REFUNDED', 'CHARGEBACK');--> statement-breakpoint
CREATE TYPE "risk_level" AS ENUM('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');--> statement-breakpoint
CREATE TYPE "verification_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "investigations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"verification_id" uuid,
	"action" varchar(255) NOT NULL,
	"reasoning" text,
	"is_overridden" boolean DEFAULT false NOT NULL,
	"overridden_by" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"business_name" varchar(255) NOT NULL,
	"category" "category" NOT NULL,
	"gst_number" varchar(15) NOT NULL,
	"website_url" varchar(255) NOT NULL,
	"phone_number" varchar(15) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchant_id" uuid NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"status" "payment_status" NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchant_id" uuid NOT NULL,
	"verification_status" "verification_status" NOT NULL,
	"is_gst_number_verified" boolean NOT NULL,
	"is_website_verified" boolean,
	"is_phone_number_verified" boolean NOT NULL,
	"trustscore" integer NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "investigation_verification_id_unique" ON "investigations" ("verification_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_gst_number" ON "merchants" ("gst_number");--> statement-breakpoint
CREATE INDEX "payment_merchant_id_index" ON "payments" ("merchant_id");--> statement-breakpoint
CREATE INDEX "verification_merchant_id_index" ON "verifications" ("merchant_id");--> statement-breakpoint
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_verification_id_verifications_id_fkey" FOREIGN KEY ("verification_id") REFERENCES "verifications"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id");--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id");