import { MistralAIEmbeddings } from "@langchain/mistralai";
import { config } from "@/config/env";

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey: config.MISTRAL_API_KEY,
});

export const generateEmbeddings = async (chunks: string[]): Promise<number[][]> => {
  return embeddings.embedDocuments(chunks);
};

