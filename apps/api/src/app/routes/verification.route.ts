import Router from "express";
import {
    requestVerification,
    getVerificationById,
    getAllVerifications,
} from "@/app/controllers/verification.controller";
import { validate } from "@/app/middlewares/validate.middleware";
import {
    requestVerificationValidator,
    getVerificationByIdValidator,
} from "@/app/validators/verification.validator";

const router = Router();

/**
 * @swagger
 * /api/verification/{merchantId}:
 *   get:
 *     tags:
 *       - Verification Endpoints
 *     summary: Get all verifications for a merchant
 *     description: Returns all verification records for the merchant. No authentication is required.
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant UUID.
 *     responses:
 *       200:
 *         description: Verifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerificationListResponse'
 *       404:
 *         description: Merchant with the ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Verification Endpoints
 *     summary: Create a verification for a merchant
 *     description: Creates a verification record for the merchant using the path merchantId. No request body or authentication is required.
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant UUID.
 *     responses:
 *       201:
 *         description: Verification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/VerificationResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       example: 201
 *                     message:
 *                       example: Verification created successfully
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Merchant with the ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Failed to create verification or internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:merchantId", getAllVerifications);

/**
 * @swagger
 * /api/verification/{merchantId}/{verificationId}:
 *   get:
 *     tags:
 *       - Verification Endpoints
 *     summary: Get a verification by ID
 *     description: Returns a verification record for the merchant. No authentication is required.
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant UUID.
 *       - in: path
 *         name: verificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Verification UUID.
 *     responses:
 *       200:
 *         description: Verification fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/VerificationResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       example: 200
 *                     message:
 *                       example: Verification fetched successfully
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Merchant or verification does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:merchantId/:verificationId", validate(getVerificationByIdValidator), getVerificationById);
router.post("/:merchantId", validate(requestVerificationValidator), requestVerification);

export default router;
