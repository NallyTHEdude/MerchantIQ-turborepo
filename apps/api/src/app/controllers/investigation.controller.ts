import asyncHandler from 'express-async-handler';
import StatusCodes from 'http-status-codes';
import { Request, Response } from 'express';
import { getInvestigationByVerificationIdService } from '@/app/services/investigation.service';
import { ApiResponse } from '@/utils/response/ApiResponse';
import { InvestigationParams } from '@/data/types/Investigation';

export const getInvestigationByVerificationIdController = asyncHandler(
    async (req: Request<InvestigationParams>, res: Response): Promise<void> => {
        const { verificationId } = req.params;
        const investigation = await getInvestigationByVerificationIdService(
            verificationId,
        );
        new ApiResponse(
            StatusCodes.OK,
            'Investigation retrieved successfully',
            investigation,
        ).send(res);
    },
);