import { extname } from "node:path";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import { ApiError } from "@/utils/errors/ApiError";

const ALLOWED_MIME_TYPE = "application/pdf";
const ALLOWED_EXTENSION = ".pdf";

export const validateDocument = (filename: string, mimeType: string) => {
  const extension = extname(filename).toLowerCase();

  if (mimeType !== ALLOWED_MIME_TYPE) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Only PDF files are allowed");
  }

  if (extension !== ALLOWED_EXTENSION) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Only .pdf files are allowed");
  }
};
