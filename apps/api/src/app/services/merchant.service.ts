import {
    type MerchantWithLatestVerification,
    type CreateMerchantDto,
    type Merchant,
    type UpdateMerchantDto,
} from '@/data/types/Merchant';
import { ApiError } from '@/utils/errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import {
    getAllMerchants,
    getMerchantById,
    getMerchantByGstNumber,
    createMerchant,
    deleteMerchantById,
    getLatestVerificationOfAllMerchants,
    updateMerchant,
} from '../repositories/merchant.repository';
import { request as requestVerification } from '@/app/services/verification.service';
import { inngestClient } from '@/config/inngest-pipeline/client';

export const getAll = async (): Promise<Merchant[]> => {
    const allMerchants: Merchant[] = await getAllMerchants();
    return allMerchants;
};

export const getById = async (id: string): Promise<Merchant> => {
    const merchant: Merchant | null = await getMerchantById(id);
    if (!merchant) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            `Merchant with id: ${id} does not exist`,
        );
    }
    return merchant;
};

export const getByGstNumber = async (gstNumber: string): Promise<Merchant> => {
    const merchant: Merchant | null = await getMerchantByGstNumber(gstNumber);
    if (!merchant) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            `Merchant with GST number: ${gstNumber} does not exist`,
        );
    }
    return merchant;
};

// if merchant with same gst number already exists, update it instead of creating a new one ensuring end to end onboarding flow is maintained
export const create = async (
    merchantData: CreateMerchantDto,
): Promise<Merchant> => {
    const existingMerchant: Merchant | null = await getMerchantByGstNumber(
        merchantData.gstNumber,
    );

    if (existingMerchant) {
        const updatedMerchant: Merchant | null = await updateMerchant(
            existingMerchant.id,
            merchantData,
        );

        if (!updatedMerchant) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to update existing merchant',
            );
        }

        return updatedMerchant;
    }

    const newMerchant: Merchant | null = await createMerchant(merchantData);

    if (!newMerchant) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to create merchant',
        );
    }

    return newMerchant;
};
 
// UPDATE -> DEPRICATED ROUTE: CREATE MERCHANT HANDLES UPDATES IF GST NUMBER ALREADY EXISTS. update is depricated
export const update = async (
    id: string,
    newMerchantData: UpdateMerchantDto,
): Promise<Merchant> => {
    // Get current merchant
    const merchant = await getMerchantById(id);
    if (!merchant) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            `Merchant with id: ${id} does not exist`,
        );
    }

    // Build proposed merchant without modifying DB
    const proposedMerchant: Merchant = { ...merchant, ...newMerchantData };

    // Verify proposed data
    const verification = await requestVerification({
        merchant: proposedMerchant,
    });

    await inngestClient.send({
        name: 'verification/requested',
        data: {
            merchant: proposedMerchant,
            verificationId: verification.id,
            isMerchantUpdate: true,
        },
    });

    return proposedMerchant;
};

export const deleteById = async (id: string): Promise<Merchant> => {
    const deletedMerchant: Merchant | null = await deleteMerchantById(id);
    if (!deletedMerchant) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            `Merchant with id: ${id} does not exist`,
        );
    }
    return deletedMerchant;
};

export const getAllLatestVerification = async (): Promise<
    MerchantWithLatestVerification[]
> => {
    return getLatestVerificationOfAllMerchants();
};
