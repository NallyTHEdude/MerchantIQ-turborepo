import { uploadDocument } from '@/app/repositories/document.repository';
import { getMerchantById } from '@/app/repositories/merchant.repository';
import { CloudinaryFolderName } from '@/data/enums/cloudinary.enums';
import {
    type UploadGovernmentDto,
    type UploadMerchantDto,
} from '@/data/types/Document';
import { ApiError } from '@/utils/errors/ApiError';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { inngestClient } from '@/config/inngest-pipeline/client';
import {
    documentUploaded,
    merchantAnalysisRequested,
} from '@/config/inngest-pipeline/eventSchemas';
import { DocumentType } from '@/data/enums/db.enums';
import { request as requestVerification } from '@/app/services/verification.service';

export const uploadMerchant = async (data: UploadMerchantDto) => {
    const { fileStream, merchantId, originalFilename } = data;

    if (!merchantId) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST, 
            'Merchant ID is required'
        );
    }

    const merchant = await getMerchantById(merchantId);
    if (!merchant) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Merchant not found');
    }

    // Upload merchant document
    const uploadResult = await uploadDocument(fileStream, {
        folder: CloudinaryFolderName.MERCHANT_DOCUMENTS,
        subFolder: merchant.id,
        originalFilename,
    });
    if (!uploadResult) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Document upload failed',
        );
    }

    // Create a new pending verification
    const verification = await requestVerification({
        merchant,
    });

    // Start the complete merchant analysis workflow
    await inngestClient.send(
        merchantAnalysisRequested.create({
            merchant,
            verificationId: verification.id,
            isMerchantUpdate: false,
            document: {
                secureUrl: uploadResult.secureUrl,
                publicId: uploadResult.publicId,
                source: 'government-provided',
                documentType: DocumentType.MERCHANT_DOCUMENT,
                merchantId: merchant.id,
                metadata: {
                    originalFilename,
                    bytes: uploadResult.bytes,
                },
            },
        }),
    );

    return uploadResult;
};

export const uploadGovernment = async (data: UploadGovernmentDto) => {
    const { fileStream, originalFilename } = data;

    const uploadResult = await uploadDocument(fileStream, {
        folder: CloudinaryFolderName.GOVERNMENT_DOCUMENTS,
        subFolder: '',
        originalFilename,
    });

    if (!uploadResult) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Document upload failed',
        );
    }

    await inngestClient.send(
        documentUploaded.create({
            secureUrl: uploadResult.secureUrl,
            publicId: uploadResult.publicId,
            source: 'government-provided',
            documentType: DocumentType.GOVT_DOCUMENT,
            metadata: {
                originalFilename,
                bytes: uploadResult.bytes,
            },
        }),
    );

    return uploadResult;
};
