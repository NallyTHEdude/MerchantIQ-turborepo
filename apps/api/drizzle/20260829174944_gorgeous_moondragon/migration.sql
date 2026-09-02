ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "payment_status";--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('SUCCESS', 'FAILED', 'REFUNDED');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "payment_status" USING "status"::"payment_status";