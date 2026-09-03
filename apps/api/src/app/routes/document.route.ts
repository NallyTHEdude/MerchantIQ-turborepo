import {
    uploadGovtDocument,
    uploadMerchantDocument,
} from '@/app/controllers/document.controller';
import { verifyAdminPassword } from '@/app/middlewares/adminAuth.middleware';
import { documentUpload } from '@/app/middlewares/document.middleware';
import Router from 'express';

const router = Router();

/**
 * @swagger
 * /api/document/govt:
 *   post:
 *     tags:
 *       - Document Endpoints
 *     summary: Upload a government compliance document
 *     description: Uploads one PDF government compliance document and starts the document ingestion workflow. This administrative endpoint requires the configured admin password.
 *     security:
 *       - AdminPassword: []
 *     parameters:
 *       - in: header
 *         name: x-admin-password
 *         required: true
 *         schema:
 *           type: string
 *           format: password
 *         description: Administrative upload password.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DocumentUploadRequest'
 *     responses:
 *       200:
 *         description: Government compliance document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/DocumentUploadResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: Government compliance document uploaded successfully
 *       400:
 *         description: No document was supplied, or the file is not a PDF or exceeds 10 MB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid admin password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Document upload or workflow dispatch failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/govt', verifyAdminPassword, documentUpload, uploadGovtDocument);

/**
 * @swagger
 * /api/document/{merchantId}:
 *   post:
 *     tags:
 *       - Document Endpoints
 *     summary: Upload a merchant document
 *     description: Uploads one PDF document for a merchant and starts merchant analysis. The merchant must exist and have a pending verification.
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant UUID.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DocumentUploadRequest'
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentUploadResponse'
 *       400:
 *         description: No document was supplied, the file is not a PDF or exceeds 10 MB, or no pending verification exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Merchant does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Document upload or workflow dispatch failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:merchantId', documentUpload, uploadMerchantDocument);

export default router;
