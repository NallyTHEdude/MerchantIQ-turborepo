import { request, ApiError } from './client';
import { Investigation } from '@/types';

/**
 * API 9 — Investigation By Verification ID
 * GET /api/investigation/:verificationId
 * 
 * Note: Current backend returns the investigation object under `message`,
 * not `data`. We handle both gracefully.
 */
export async function getInvestigation(
  verificationId: string
): Promise<Investigation> {
  const response = await request<unknown>(
    `/api/investigation/${encodeURIComponent(verificationId)}`,
    {
      method: 'GET',
    }
  );

  // Check response.message first as specified by backend contract
  if (
    response.message &&
    typeof response.message === 'object' &&
    'id' in (response.message as Record<string, unknown>)
  ) {
    return response.message as Investigation;
  }

  // Fallback to response.data if it is an investigation object
  if (
    response.data &&
    typeof response.data === 'object' &&
    'id' in (response.data as Record<string, unknown>)
  ) {
    return response.data as Investigation;
  }

  throw new ApiError(
    'No investigation data found for this verification record.',
    404
  );
}
