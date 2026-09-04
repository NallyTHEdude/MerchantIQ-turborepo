import { request, ApiError } from './client';
import { DocumentUploadData, ApiResponse } from '@/types';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function validatePdfFile(file: File): void {
  if (!file) {
    throw new ApiError('No file selected for upload', 400);
  }
  const isPdf =
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new ApiError('Only PDF files are allowed', 400);
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new ApiError('File size exceeds the 10 MB maximum limit', 400);
  }
}

/**
 * API 5 — Upload Merchant Document
 * POST /api/document/:merchantId
 * Multipart/form-data with field name 'file'
 */
export async function uploadMerchantDocument(
  merchantId: string,
  file: File
): Promise<DocumentUploadData> {
  validatePdfFile(file);

  const formData = new FormData();
  formData.append('file', file);

  const response = await request<DocumentUploadData>(
    `/api/document/${encodeURIComponent(merchantId)}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  return response.data as DocumentUploadData;
}

/**
 * API 6 — Upload Government Document
 * POST /api/document/govt
 * Multipart/form-data with field name 'file'
 */
export async function uploadGovernmentDocument(
  file: File
): Promise<DocumentUploadData> {
  validatePdfFile(file);

  const formData = new FormData();
  formData.append('file', file);

  const response = await request<DocumentUploadData>('/api/document/govt', {
    method: 'POST',
    body: formData,
  });

  return response.data as DocumentUploadData;
}
