import {
  type CreateMerchantRequest,
  type MerchantGstNumberParam,
  type MerchantIdParam,
  type UpdateMerchantRequest,
} from "@/data/types/Merchant";
import { ApiResponse } from "@/utils/response/ApiResponse";
import { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import {
  create,
  deleteById,
  getAll,
  getByGstNumber,
  getById,
  update,
} from "../services/merchant.service";

export const getAllMerchants = asyncHandler(
  async (_req: Request, res: Response) => {
    const merchants = await getAll();
    new ApiResponse(
      StatusCodes.OK,
      merchants,
      "Merchants retrieved successfully",
    ).send(res);
  },
);

export const getMerchantById = asyncHandler(
  async (req: Request<MerchantIdParam>, res: Response) => {
    const merchantId = req.params.id;
    const merchant = await getById(merchantId);
    new ApiResponse(
      StatusCodes.OK,
      merchant,
      "Merchant retrieved successfully",
    ).send(res);
  },
);

export const getMerchantByGstNumber = asyncHandler(
  async (req: Request<MerchantGstNumberParam>, res: Response) => {
    const gstNumber = req.params.gstNumber;
    const merchant = await getByGstNumber(gstNumber);
    new ApiResponse(
      StatusCodes.OK,
      merchant,
      "Merchant retrieved successfully",
    ).send(res);
  },
);

export const createMerchant = asyncHandler(
  async (req: CreateMerchantRequest, res: Response) => {
    const body = req.body;
    const newMerchant = await create(body);
    new ApiResponse(
      StatusCodes.CREATED,
      newMerchant,
      "Merchant created successfully",
    ).send(res);
  },
);

export const updateMerchant = asyncHandler(
  async (req: UpdateMerchantRequest, res: Response) => {
    const merchantId = req.params.id;
    const body = req.body;
    const updatedMerchant = await update(merchantId, body);
    new ApiResponse(
      StatusCodes.OK,
      updatedMerchant,
      "Merchant updated successfully",
    ).send(res);
  },
);

export const deleteMerchant = asyncHandler(
  async (req: Request<MerchantIdParam>, res: Response) => {
    const merchantId = req.params.id;
    const deletedMerchant = await deleteById(merchantId);
    new ApiResponse(
      StatusCodes.OK,
      deletedMerchant,
      "Merchant deleted successfully",
    ).send(res);
  },
);
