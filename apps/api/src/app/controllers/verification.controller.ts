import {
    getAll,
    getById,
    request
} from "@/app/services/verification.service";
import { type Request, type Response } from "express";
import { ApiResponse } from "@/utils/response/ApiResponse";
import {StatusCodes} from "http-status-codes";
import type {
  Verification,
  RequestVerificationDto,
  VerificationMerchantIdParam,
  VerificationIdParam,
} from "@/data/types/Verification";

export const getAllVerifications = async (req: Request<VerificationMerchantIdParam>, res: Response) => {
    const { merchantId } = req.params;
    const verifications : Verification[] = await getAll(merchantId);
    new ApiResponse(
        StatusCodes.OK,
        verifications,
        "Verifications fetched successfully"
    ).send(res);
}

export const getVerificationById = async (req: Request<VerificationMerchantIdParam & VerificationIdParam>, res: Response) => {
    const { merchantId, verificationId } = req.params;
    const verification : Verification = await getById(merchantId, verificationId);
    new ApiResponse(
        StatusCodes.OK,
        verification,
        "Verification fetched successfully"
    ).send(res);
}   

export const requestVerification = async (req: Request<VerificationMerchantIdParam>, res: Response) => {
  const { merchantId } = req.params;
  const requestVerificationDto: RequestVerificationDto = {
    merchantId,
  };

  const verification = await request(requestVerificationDto);

  new ApiResponse(
    StatusCodes.ACCEPTED,
    verification,
    "Verification requested successfully",
  ).send(res);
};