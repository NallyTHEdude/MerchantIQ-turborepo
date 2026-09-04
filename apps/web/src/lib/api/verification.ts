import { request } from './client';
import { Verification } from '@/types';

/**
 * API 7 — Verification History
 * GET /api/verification/:merchantId
 */
export async function getVerificationHistory(
  merchantId: string
): Promise<Verification[]> {
  const response = await request<Verification[]>(
    `/api/verification/${encodeURIComponent(merchantId)}`,
    {
      method: 'GET',
    }
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}
