// import { extractTextFromPdf } from "./document";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
});

const cleanDocumentText = (text: string): string => {
  return text
    .replace(/\0/g, "")
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const chunkDocument = async (text: string): Promise<string[]> => {
  const cleanedText = cleanDocumentText(text);
  return await splitter.splitText(cleanedText);
};
