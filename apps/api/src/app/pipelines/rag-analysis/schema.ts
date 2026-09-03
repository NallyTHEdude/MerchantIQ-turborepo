import { z } from "zod";
import { RagDecision } from "@/data/enums/rag.enums";

export const ragDecisionSchema = z.object({
  decision: z.nativeEnum(RagDecision),
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  risks: z.array(z.string()),
  missingEvidence: z.array(z.string()),
});

export type RagDecisionResult = z.infer<typeof ragDecisionSchema>;