import {db} from "@/db";
import {eq, and, desc} from "drizzle-orm";
import { verifications as verificationTable } from "@/db/schemas/verifications.schema";
import type { NewVerification, Verification } from "@/data/types/Verification";
import { VerificationStatus } from "@/data/enums/db.enums";

export const getAllVerifications = async (merchantId: string): Promise<Verification[]> => {
    return db.select().from(verificationTable).where(eq(verificationTable.merchantId, merchantId));
};

export const createVerification = async (verificationData: NewVerification): Promise<Verification | null> => {
    const [createdVerification] = await db.insert(verificationTable).values(verificationData).returning();
    return createdVerification ?? null;
};

export const getByVerificationId = async (merchantId: string, verificationId: string): Promise<Verification | null> => {
    const [verification] = await db.select().from(verificationTable)
    .where(
        and(
            eq(verificationTable.merchantId, merchantId),
            eq(verificationTable.id, verificationId)
        )
    )
    .limit(1);
    return verification ?? null;
};

export const updateVerificationById = async (merchantId: string, verificationId: string, updateData: Partial<NewVerification>): Promise<Verification | null> => {
    const [updatedVerification] = await db.update(verificationTable)
    .set(updateData)
    .where(
        and(
            eq(verificationTable.merchantId, merchantId),
            eq(verificationTable.id, verificationId)
        )
    )
    .returning();
    return updatedVerification ?? null;
}

export const markVerificationAsServerError = async (
  verificationId: string,
): Promise<Verification | null> => {
  const [updatedVerification] = await db
    .update(verificationTable)
    .set({
      verificationStatus: VerificationStatus.SERVER_ERROR,
    })
    .where(eq(verificationTable.id, verificationId))
    .returning();

  return updatedVerification ?? null;
};

export const getLatestVerificationByMerchantId = async (
  merchantId: string,
): Promise<Verification | null> => {
  const [verification] = await db
    .select()
    .from(verificationTable)
    .where(eq(verificationTable.merchantId, merchantId))
    .orderBy(desc(verificationTable.createdAt))
    .limit(1);

  return verification ?? null;
};