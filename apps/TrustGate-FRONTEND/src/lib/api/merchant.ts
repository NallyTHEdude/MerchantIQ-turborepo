import { request } from './client';
import {
  CreateMerchantDto,
  Merchant,
  MerchantWithVerification,
  ApiResponse,
} from '@/types';

/**
 * API 1 — Create Merchant
 * POST /api/merchant
 */
export async function createMerchant(
  data: CreateMerchantDto
): Promise<{ merchant: Merchant; merchantId: string }> {
  const response = await request<Merchant | { id?: string; merchant?: Merchant }>(
    '/api/merchant',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  const rawData = response.data;
  let merchantId = '';
  let merchantObj: Partial<Merchant> = {};

  if (rawData && typeof rawData === 'object') {
    if ('id' in rawData && typeof (rawData as { id: string }).id === 'string') {
      merchantId = (rawData as { id: string }).id;
    } else if (
      'merchant' in rawData &&
      (rawData as { merchant?: { id?: string } }).merchant?.id
    ) {
      merchantId = (rawData as { merchant: { id: string } }).merchant.id;
    }
    merchantObj = rawData as Partial<Merchant>;
  }

  // Fallback check on response top-level if returned there
  if (!merchantId && 'id' in response && typeof (response as unknown as { id: string }).id === 'string') {
    merchantId = (response as unknown as { id: string }).id;
  }

  const finalMerchant: Merchant = {
    id: merchantId,
    businessName: merchantObj.businessName || data.businessName,
    category: merchantObj.category || data.category,
    gstNumber: merchantObj.gstNumber || data.gstNumber,
    websiteUrl: merchantObj.websiteUrl || data.websiteUrl,
    phoneNumber: merchantObj.phoneNumber || data.phoneNumber,
    createdAt: merchantObj.createdAt,
    updatedAt: merchantObj.updatedAt,
  };

  return {
    merchant: finalMerchant,
    merchantId,
  };
}

/**
 * API 2 — Delete Merchant
 * DELETE /api/merchant/:merchantId
 */
export async function deleteMerchant(
  merchantId: string
): Promise<ApiResponse<Merchant>> {
  return request<Merchant>(`/api/merchant/${encodeURIComponent(merchantId)}`, {
    method: 'DELETE',
  });
}

/**
 * API 8 — Latest Verification For All Merchants
 * GET /api/merchant/all/latest-verification
 */
export async function getLatestMerchantVerifications(): Promise<
  MerchantWithVerification[]
> {
  const response = await request<MerchantWithVerification[]>(
    '/api/merchant/all/latest-verification',
    {
      method: 'GET',
    }
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}
