import {
  type PaymentMerchantIdParam,
  type PaymentIdParam,
  type CreatePaymentRequest,
} from "@/data/types/Payment";
import { ApiResponse } from "@/utils/response/ApiResponse";
import { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { createMany, getAll, getById } from "../services/payment.service";

export const getAllPayments = asyncHandler(async (req: Request<PaymentMerchantIdParam>, res: Response) => {
    const {merchantId} = req.params;
    const payments = await getAll(merchantId);

    new ApiResponse(
      StatusCodes.OK,
      payments,
      "Payments retrieved successfully",
    ).send(res);
  },
);

export const getPaymentById = asyncHandler(async (req: Request<PaymentMerchantIdParam & PaymentIdParam>, res: Response) => {
    const { merchantId, paymentId } = req.params;
    const payment = await getById(merchantId, paymentId);

    new ApiResponse(
      StatusCodes.OK,
      payment,
      "Payment fetched successfully",
    ).send(res);
  },
);

export const createPayments = asyncHandler(async (req: CreatePaymentRequest, res: Response) => {
    const { merchantId } = req.params;
    const payments = req.body;

    const createdPayments = await createMany(merchantId, payments);

    new ApiResponse(
      StatusCodes.CREATED,
      createdPayments,
      "Payments created successfully",
    ).send(res);
  },
);
