ALTER TABLE "verifications" ALTER COLUMN "verification_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "verification_status";--> statement-breakpoint
CREATE TYPE "verification_status" AS ENUM('PENDING', 'SERVER_ERROR', 'COMPLETED', 'FAILED');--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "verification_status" SET DATA TYPE "verification_status" USING "verification_status"::"verification_status";