import type {
  InferInsertModel,
  InferSelectModel,
} from "drizzle-orm";
import type { Request } from "express";
import { type payments } from "@/db/schemas/payments.schema";
import {
  type PaymentStatus,
  type PaymentMethod,
} from "@/data/enums/db.enums";

export type Payment = InferSelectModel<typeof payments>;

export type NewPayment = InferInsertModel<typeof payments>;

export type PaymentIdParam = {
  paymentId: string;
};

export type PaymentMerchantIdParam = {
  merchantId: string;
};

export interface CreatePaymentDto {
  amount: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  isInternational: boolean;
}

export type CreatePaymentRequest = Request<
  PaymentMerchantIdParam,
  unknown,
  CreatePaymentDto[]
>;