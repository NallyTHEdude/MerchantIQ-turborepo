import { type HttpStatusCode } from "@/data/types/statusCodes";

interface ApiErrorDetail {
  message: string;
}

export class ApiError extends Error {
  statusCode: HttpStatusCode;
  data: unknown;
  success: boolean;
  errors: ApiErrorDetail[];

  constructor(
    statusCode: HttpStatusCode,
    message = "Something went wrong",
    errors: ApiErrorDetail[] = [],
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
