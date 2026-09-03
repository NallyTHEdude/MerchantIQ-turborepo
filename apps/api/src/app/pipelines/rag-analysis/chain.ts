import { ChatMistralAI } from "@langchain/mistralai";
import { ragDecisionSchema } from "./schema";
import type { RagDecisionResult } from "./schema";

const ragModel = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
});

export const structuredRagModel = ragModel.withStructuredOutput<RagDecisionResult>(ragDecisionSchema);
