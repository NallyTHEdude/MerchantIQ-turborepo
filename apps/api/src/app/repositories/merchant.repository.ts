import {
    type CreateMerchantDto,
    type Merchant,
    type UpdateMerchantDto,
    type MerchantWithLatestVerification,
} from '@/data/types/Merchant';
import { db } from '@/db';
import { merchants as merchantTable } from '@/db/schemas/merchants.schema';
import { verifications as verificationTable } from '@/db/schemas/verifications.schema';
import { eq, desc } from 'drizzle-orm';

export const getAllMerchants = async (): Promise<Merchant[]> => {
    return db.select().from(merchantTable);
};

export const getMerchantById = async (id: string): Promise<Merchant | null> => {
    const [merchant] = await db
        .select()
        .from(merchantTable)
        .where(eq(merchantTable.id, id))
        .limit(1);
    return merchant ?? null;
};

export const getMerchantByGstNumber = async (
    gstNumber: string,
): Promise<Merchant | null> => {
    const [merchant] = await db
        .select()
        .from(merchantTable)
        .where(eq(merchantTable.gstNumber, gstNumber))
        .limit(1);

    return merchant ?? null;
};

export const createMerchant = async (
    merchantData: CreateMerchantDto,
): Promise<Merchant | null> => {
    const [newMerchant] = await db
        .insert(merchantTable)
        .values(merchantData)
        .returning();

    return newMerchant ?? null;
};

export const updateMerchant = async (
    id: string,
    merchantData: UpdateMerchantDto,
): Promise<Merchant | null> => {
    const [updatedMerchant] = await db
        .update(merchantTable)
        .set(merchantData)
        .where(eq(merchantTable.id, id))
        .returning();

    return updatedMerchant ?? null;
};

export const deleteMerchantById = async (
    id: string,
): Promise<Merchant | null> => {
    const [deletedMerchant] = await db
        .delete(merchantTable)
        .where(eq(merchantTable.id, id))
        .returning();

    return deletedMerchant ?? null;
};

export const getLatestVerificationOfAllMerchants = async (): Promise<
    MerchantWithLatestVerification[]
> => {
    return db
        .selectDistinctOn([merchantTable.id], {
            merchant: {
                id: merchantTable.id,
                businessName: merchantTable.businessName,
                category: merchantTable.category,
                gstNumber: merchantTable.gstNumber,
                websiteUrl: merchantTable.websiteUrl,
                phoneNumber: merchantTable.phoneNumber,
                createdAt: merchantTable.createdAt,
            },

            verification: {
                id: verificationTable.id,
                merchantId: verificationTable.merchantId,
                verificationStatus: verificationTable.verificationStatus,
                isGstNumberVerified: verificationTable.isGstNumberVerified,
                isWebsiteVerified: verificationTable.isWebsiteVerified,
                isPhoneNumberVerified: verificationTable.isPhoneNumberVerified,
                trustscore: verificationTable.trustscore,
                riskLevel: verificationTable.riskLevel,
                createdAt: verificationTable.createdAt,
            },
        })
        .from(merchantTable)
        .leftJoin(
            verificationTable,
            eq(merchantTable.id, verificationTable.merchantId),
        )
        .orderBy(merchantTable.id, desc(verificationTable.createdAt));
};
