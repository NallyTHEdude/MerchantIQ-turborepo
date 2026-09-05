import asyncHandler from 'express-async-handler';
import StatusCodes from 'http-status-codes';
import { type Request, type Response } from 'express';
import { getInvestigationByVerificationIdService } from '@/app/services/investigation.service';
import { ApiResponse } from '@/utils/response/ApiResponse';
import { type InvestigationParams } from '@/data/types/Investigation';

export const getInvestigationByVerificationIdController = asyncHandler(
    async (req: Request<InvestigationParams>, res: Response): Promise<void> => {
        const { verificationId } = req.params;
        const investigation =
            await getInvestigationByVerificationIdService(verificationId);
        new ApiResponse(
            StatusCodes.OK,
            investigation,
            'Investigation retrieved successfully',
        ).send(res);
    },
);
