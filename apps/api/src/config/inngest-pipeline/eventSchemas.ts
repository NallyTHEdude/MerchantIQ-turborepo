import { eventType } from "inngest";
import { z } from "zod";
import { type Merchant } from "@/data/types/Merchant";
import { DocumentType } from "@/data/enums/db.enums";

export const verificationRequested = eventType("verification/requested", {
  schema: z.object({
    merchant: z.custom<Merchant>(),
    verificationId: z.string(),
    isMerchantUpdate: z.boolean(),
  }),
});

export const documentUploaded = eventType("document/uploaded", {
  schema: z.object({
    secureUrl: z.string().url(),
    publicId: z.string(),
    source: z.string(),
    documentType: z.nativeEnum(DocumentType),
    merchantId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});