import { getBaseApiUrl } from './config';
import { ApiResponse } from '@/types';

export class ApiError extends Error {
  statusCode?: number;
  data?: unknown;

  constructor(message: string, statusCode?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getBaseApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  // If body is not FormData, default to application/json
  if (!(options.body instanceof FormData) && !('Content-Type' in headers)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error occurred';
    throw new ApiError(
      `Failed to connect to backend (${baseUrl}): ${message}. Ensure your backend server is running and accessible.`,
      0
    );
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        `Server returned ${response.status} ${response.statusText}`,
        response.status
      );
    }
    // Empty or non-json successful response
    return {
      statusCode: response.status,
      success: true,
      message: 'OK',
    };
  }

  if (!response.ok || json.success === false) {
    const errorMsg =
      (typeof json.message === 'string' ? json.message : '') ||
      (typeof json.data === 'string' ? json.data : '') ||
      `Request failed with status code ${response.status}`;
    throw new ApiError(errorMsg, response.status, json.data);
  }

  return json;
}
