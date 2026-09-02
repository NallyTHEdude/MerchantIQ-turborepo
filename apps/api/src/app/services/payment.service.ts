import {
  createManyPayments,
  getAllPayments,
  getPaymentById,
} from "@/app/repositories/payment.repository";
import { getMerchantById } from "@/app/repositories/merchant.repository";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@/utils/errors/ApiError";
import {
  type CreatePaymentDto,
} from "@/data/types/Payment";

export const getAll = async (merchantId: string) => {
    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Merchant with id: ${merchantId} does not exist`,
      );
    }
    const payments = await getAllPayments(merchantId);
    return payments;
};

export const getById = async (merchantId: string, paymentId: string) => {
  const merchant = await getMerchantById(merchantId);
  if (!merchant) {
    throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Merchant with id: ${merchantId} does not exist`,
    );
  }

  const payment = await getPaymentById(merchantId,paymentId,);

  if (!payment) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Payment with id: ${paymentId} does not exist`,
    );
  }

  return payment;
};

export const createMany = async (merchantId: string, createPaymentDtos: CreatePaymentDto[]) => {
  const merchant = await getMerchantById(merchantId);
  if (!merchant) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Merchant with id: ${merchantId} does not exist`,
    );
  }

  const payments = await createManyPayments(merchantId, createPaymentDtos);

  return payments;
};
