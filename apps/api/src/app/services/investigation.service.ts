import { getInvestigationByVerificationIdRepository } from '@/app/repositories/investigation.repository';
import { ApiError } from '@/utils/errors/ApiError';
import StatusCodes from 'http-status-codes';

export const getInvestigationByVerificationIdService = async (
    verificationId: string,
): Promise<any> => {
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
