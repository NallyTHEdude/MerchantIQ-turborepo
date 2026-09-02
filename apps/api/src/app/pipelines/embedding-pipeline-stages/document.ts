import { PDFParse } from "pdf-parse";

export const extractTextFromPdf = async (secureUrl: string): Promise<string> => {
  const parser = new PDFParse({url: secureUrl});

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
};
