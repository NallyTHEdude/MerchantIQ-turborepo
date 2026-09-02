import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

import { config } from "@/config/env";
import { ApiError } from "@/utils/errors/ApiError";

export const verifyAdminPassword = (req: Request, _res: Response, next: NextFunction) => {
  const providedPassword = req.headers["x-admin-password"];

  if (!providedPassword || typeof providedPassword !== "string") {
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Admin password is required"),
    );
  }

  if (providedPassword !== config.ADMIN_UPLOAD_PASSWORD) {
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Invalid admin password"),
    );
  }

  next();
};
