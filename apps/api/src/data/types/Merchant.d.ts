import type { Request } from "express";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { Category } from "@/data/enums/db.enums";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { merchants } from "@/db/schemas/merchants.schema";
// database types
export type Merchant = InferSelectModel<typeof merchants>;
export type NewMerchant = InferInsertModel<typeof merchants>;

// Request params
export type MerchantIdParam = {
  id: string;
};

export type MerchantGstNumberParam = {
  gstNumber: string;
};

// create dto
export interface CreateMerchantDto {
  businessName: string;
  category: Category;
  gstNumber: string;
  websiteUrl: string;
  phoneNumber: string;
}

export type CreateMerchantRequest = Request<
  Record<string, never>,
  unknown,
  CreateMerchantDto
>;

// update dto
export interface UpdateMerchantDto {
  businessName?: string;
  category?: Category;
  gstNumber?: string;
  websiteUrl?: string;
  phoneNumber?: string;
}

export type UpdateMerchantRequest = Request<
  MerchantIdParam,
  unknown,
  UpdateMerchantDto
>;