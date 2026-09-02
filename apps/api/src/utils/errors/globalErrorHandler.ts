import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./ApiError.js";

export const globalErrorHandler = (
  error: unknown,
  _req: Request,
  response: Response,
  _next: NextFunction,
) => {
  console.error({
    name: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof ApiError) {
    return response.status(error.statusCode).json({
      success: error.success,
      message: error.message,
      errors: error.errors,
      data: error.data,
    });
  }

  return response.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
    data: null,
  });
};
