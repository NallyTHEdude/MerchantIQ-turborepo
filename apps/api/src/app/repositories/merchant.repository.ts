import {
  type CreateMerchantDto,
  type Merchant,
  type UpdateMerchantDto,
} from "@/data/types/Merchant";
import { db } from "@/db";
import { merchants as merchantTable } from "@/db/schemas/merchants.schema";
import { eq } from "drizzle-orm"; 

export const getAllMerchants = async (): Promise<Merchant[]> => {
    return db.select().from(merchantTable);
};

export const getMerchantById = async (id: string): Promise<Merchant | null> => {
    const [merchant] = await db.select().from(merchantTable)
    .where(eq(merchantTable.id, id))
    .limit(1);
    return merchant ?? null;
};

export const getMerchantByGstNumber = async (gstNumber: string): Promise<Merchant | null> => {
  const [merchant] = await db
    .select()
    .from(merchantTable)
    .where(eq(merchantTable.gstNumber, gstNumber))
    .limit(1);

  return merchant ?? null;
};

export const createMerchant = async (merchantData: CreateMerchantDto): Promise<Merchant | null> => {
  const [newMerchant] = await db
    .insert(merchantTable)
    .values(merchantData)
    .returning();

  return newMerchant ?? null;
};

export const updateMerchant = async (id: string, merchantData: UpdateMerchantDto): Promise<Merchant | null> => {
  const [updatedMerchant] = await db
    .update(merchantTable)
    .set(merchantData)
    .where(eq(merchantTable.id, id))
    .returning();

  return updatedMerchant ?? null;
};

export const deleteMerchantById = async (id: string): Promise<Merchant | null> => {
    const [deletedMerchant] = await db.delete(merchantTable)
    .where(eq(merchantTable.id, id))
    .returning();

    return deletedMerchant ?? null;
};