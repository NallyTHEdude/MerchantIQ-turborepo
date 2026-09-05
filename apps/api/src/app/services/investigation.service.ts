import { getInvestigationByVerificationIdRepository } from '@/app/repositories/investigation.repository';
import type { Investigation } from '@/data/types/Investigation';
import { ApiError } from '@/utils/errors/ApiError';
import StatusCodes from 'http-status-codes';

export const getInvestigationByVerificationIdService = async (
    verificationId: string,
): Promise<Investigation> => {
    const investigation =
        await getInvestigationByVerificationIdRepository(verificationId);
    if (!investigation) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'Investigation not found or invalid verificationId',
        );
    }
    return investigation;
};
