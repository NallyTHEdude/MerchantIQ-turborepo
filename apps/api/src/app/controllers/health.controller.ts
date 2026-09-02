import { type Request, type Response } from "express";
import  asyncHandler  from "express-async-handler";
import { ApiResponse } from "@/utils/response/ApiResponse";
import { healthCheckService } from "@/app/services/health.service";
import { StatusCodes } from "http-status-codes"

export const healthCheck = asyncHandler(
    async (_req: Request, res: Response) => {
        const response = await healthCheckService();
        new ApiResponse(
            StatusCodes.OK,
            response ,
            "Health check successful"
        ).send(res);
    }
);
