import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { type verifications } from "@/db/schemas/verifications.schema";
import type { Merchant } from "@/data/types/Merchant";

export type Verification = InferSelectModel<typeof verifications>;

export type NewVerification = InferInsertModel<typeof verifications>;

export type VerificationIdParam = {
  verificationId: string;
};

export type VerificationMerchantIdParam = {
  merchantId: string;
};

// Verification.ts
export type RequestVerificationDto =
  | {
      merchantId: string;
      merchant?: never;
    }
  | {
      merchant: Merchant;
      merchantId?: never;
    };