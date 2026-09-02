import Router from "express";
import {
    getAllPaymentsValidator,
    getPaymentByIdValidator,
    createPaymentValidator
} from "@/app/validators/payment.validator";
import { validate } from "@/app/middlewares/validate.middleware";
import {
    getAllPayments,
    getPaymentById,
    createPayments
} from "@/app/controllers/payment.controller";

const router = Router();

/**
 * @swagger
 * /api/payment/{merchantId}:
 *   get:
 *     tags:
 *       - Payment Endpoints
 *     summary: Get all payments for a merchant
 *     description: Returns all payment records for the merchant. No authentication is required.
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
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentListResponse'
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
 *   post:
 *     tags:
 *       - Payment Endpoints
 *     summary: Create payments for a merchant
 *     description: Creates one or more payment records for the merchant. No authentication is required.
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
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *           example:
 *             - amount: "1499.00"
 *               status: SUCCESS
 *               paymentMethod: UPI
 *     responses:
 *       201:
 *         description: Payments created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaymentListResponse'
 *                 - type: object
 *                   properties:
 *                     statusCode:
 *                       example: 201
 *                     message:
 *                       example: Payments created successfully
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
router.get("/:merchantId", validate(getAllPaymentsValidator), getAllPayments);

/**
 * @swagger
 * /api/payment/{merchantId}/{paymentId}:
 *   get:
 *     tags:
 *       - Payment Endpoints
 *     summary: Get a payment by ID
 *     description: Returns a payment record for the merchant. No authentication is required.
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant UUID.
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment UUID.
 *     responses:
 *       200:
 *         description: Payment fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Merchant or payment does not exist
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
router.get("/:merchantId/:paymentId", validate(getPaymentByIdValidator), getPaymentById);
router.post("/:merchantId", validate(createPaymentValidator), createPayments);

export default router;
