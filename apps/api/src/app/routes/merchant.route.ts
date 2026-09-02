import {
  createMerchant,
  deleteMerchant,
  getAllMerchants,
  getMerchantByGstNumber,
  getMerchantById,
  updateMerchant,
} from "@/app/controllers/merchant.controller";
import { validate } from "@/app/middlewares/validate.middleware";
import {
  createMerchantValidator,
  deleteMerchantValidator,
  getMerchantByGstNumberValidator,
  getMerchantByIdValidator,
  updateMerchantValidator,
} from "@/app/validators/merchant.validator";
import Router from "express";

const router = Router();

/**
 * @swagger
 * /api/merchant:
 *   get:
 *     tags:
 *       - Merchant Endpoints
 *     summary: Get all merchants
 *     description: Returns all merchants. No authentication is required.
 *     responses:
 *       200:
 *         description: Merchants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MerchantListResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Merchant Endpoints
 *     summary: Create a merchant
 *     description: Creates a merchant. No authentication is required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMerchantRequest'
 *           example:
 *             businessName: Example Retail Pvt Ltd
 *             category: RETAIL
 *             gstNumber: 27ABCDE1234F1Z5
 *             websiteUrl: https://example.com
 *             phoneNumber: "9876543210"
 *     responses:
 *       201:
 *         description: Merchant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MerchantResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       example: 201
 *                     message:
 *                       example: Merchant created successfully
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Merchant with the same GST number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Failed to create merchant or internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getAllMerchants);

/**
 * @swagger
 * /api/merchant/gst/{gstNumber}:
 *   get:
 *     tags:
 *       - Merchant Endpoints
 *     summary: Get a merchant by GST number
 *     description: Returns a merchant matching the provided GST number. No authentication is required.
 *     parameters:
 *       - in: path
 *         name: gstNumber
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
 *           example: 27ABCDE1234F1Z5
 *         description: GST number in the validated GSTIN format.
 *     responses:
 *       200:
 *         description: Merchant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MerchantResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       example: 200
 *                     message:
 *                       example: Merchant retrieved successfully
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Merchant with the GST number does not exist
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
router.get("/gst/:gstNumber",validate(getMerchantByGstNumberValidator),getMerchantByGstNumber,);

/**
 * @swagger
 * /api/merchant/{id}:
 *   get:
 *     tags:
 *       - Merchant Endpoints
 *     summary: Get a merchant by ID
 *     description: Returns a merchant matching the provided UUID. No authentication is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant UUID.
 *     responses:
 *       200:
 *         description: Merchant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MerchantResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       example: 200
 *                     message:
 *                       example: Merchant retrieved successfully
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags:
 *       - Merchant Endpoints
 *     summary: Update a merchant
 *     description: Updates any provided merchant fields. No authentication is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant UUID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMerchantRequest'
 *           example:
 *             businessName: Updated Retail Pvt Ltd
 *             websiteUrl: https://updated.example.com
 *     responses:
 *       200:
 *         description: Merchant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MerchantResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       example: 200
 *                     message:
 *                       example: Merchant updated successfully
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Merchant Endpoints
 *     summary: Delete a merchant
 *     description: Deletes a merchant by UUID and returns the deleted merchant. No authentication is required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant UUID.
 *     responses:
 *       200:
 *         description: Merchant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MerchantResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       example: 200
 *                     message:
 *                       example: Merchant deleted successfully
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", validate(getMerchantByIdValidator), getMerchantById);
router.post("/", validate(createMerchantValidator), createMerchant);
router.patch("/:id", validate(updateMerchantValidator), updateMerchant);
router.delete("/:id", validate(deleteMerchantValidator), deleteMerchant);

export default router;
