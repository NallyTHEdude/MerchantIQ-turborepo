import type { CloudinaryFolderName } from "@/data/enums/cloudinary.enums";
import type { Readable } from "node:stream";
import type { DocumentType } from "@/data/enums/db.enums";


export type DocumentUploadOptions = {
  folder: CloudinaryFolderName;
  subFolder: string;
  originalFilename: string;
};

export type UploadMerchantDto = {
  merchantId: string;
  fileStream: Readable;
  originalFilename: string;
};

export type UploadGovernmentDto = {
  fileStream: Readable;
  originalFilename: string;
};

export type DocumentUploadResult = {
  publicId: string;
  secureUrl: string;
  format?: string;
  bytes: number;
};

export type DocumentMerchantIdParam = {
  merchantId: string;
};

export type DocumentUploadedEventData = {
  secureUrl: string;
  publicId: string;
  source: string;
  documentType: DocumentType;
  merchantId?: string;
  metadata?: Record<string, unknown>;
};