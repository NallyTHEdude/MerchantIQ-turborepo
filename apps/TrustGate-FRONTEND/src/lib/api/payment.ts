import { request } from './client';
import { CreatePaymentDto, PaymentItem, ApiResponse } from '@/types';

/**
 * API 3 — Create Payments
 * POST /api/payment/:merchantId
 * Expects array of payments in request body
 */
export async function createPayments(
  merchantId: string,
  payments: CreatePaymentDto[]
): Promise<ApiResponse<unknown>> {
  return request(`/api/payment/${encodeURIComponent(merchantId)}`, {
    method: 'POST',
    body: JSON.stringify(payments),
  });
}

/**
 * API 4 — Payment History
 * GET /api/payment/:merchantId
 */
export async function getPaymentHistory(
  merchantId: string
): Promise<PaymentItem[]> {
  const response = await request<PaymentItem[]>(
    `/api/payment/${encodeURIComponent(merchantId)}`,
    {
      method: 'GET',
    }
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}
