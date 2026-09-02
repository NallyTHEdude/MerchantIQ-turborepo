import {
  uploadGovernment,
  uploadMerchant,
} from "@/app/services/document.service";
import { type DocumentMerchantIdParam } from "@/data/types/Document";
import { ApiError } from "@/utils/errors/ApiError";
import { ApiResponse } from "@/utils/response/ApiResponse";
import { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

export const uploadMerchantDocument = asyncHandler(
  async (req: Request<DocumentMerchantIdParam>, res: Response) => {
    const { fileStream, fileOriginalName } = req;

    if (!fileStream || !fileOriginalName) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No document was uploaded");
    }

    const uploadResult = await uploadMerchant({
      merchantId: req.params.merchantId,
      fileStream,
      originalFilename: fileOriginalName,
    });

    new ApiResponse(
      StatusCodes.OK,
      uploadResult,
      "Document uploaded successfully",
    ).send(res);
  },
);

export const uploadGovtDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const { fileStream, fileOriginalName } = req;

    if (!fileStream || !fileOriginalName) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No document was uploaded");
    }

    const uploadResult = await uploadGovernment({
      fileStream,
      originalFilename: fileOriginalName,
    });

    new ApiResponse(
      StatusCodes.OK,
      uploadResult,
      "Government compliance document uploaded successfully",
    ).send(res);
  },
);
