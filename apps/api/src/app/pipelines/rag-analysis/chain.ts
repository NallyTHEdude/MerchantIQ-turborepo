import { ChatMistralAI } from "@langchain/mistralai";
import { ragDecisionSchema, type RagDecisionResult } from "./schema";

const ragModel = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
});

export const structuredRagModel = ragModel.withStructuredOutput<RagDecisionResult>(ragDecisionSchema);
