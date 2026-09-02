import { body, param } from "express-validator";
import { PaymentStatus, PaymentMethod } from "@/data/enums/db.enums";

export const getAllPaymentsValidator = [
    param("merchantId")
        .trim()
        .notEmpty()
        .withMessage("Merchant ID is required")
        .isUUID()
        .withMessage("Invalid merchant ID"),
];

export const getPaymentByIdValidator = [
    param("merchantId")
        .trim()
        .notEmpty()
        .withMessage("Merchant ID is required")
        .isUUID()
        .withMessage("Invalid merchant ID"),
    param("paymentId")
        .trim()
        .notEmpty()
        .withMessage("Payment ID is required")
        .isUUID()
        .withMessage("Invalid payment ID"),
];

export const createPaymentValidator = [
    param("merchantId")
        .trim()
        .notEmpty()
        .withMessage("Merchant ID is required")
        .isUUID()
        .withMessage("Invalid merchant ID"),
    body()
        .isArray({ min: 1 })
        .withMessage("Payments must be a non-empty array"),
    body("*.amount")
        .trim()
        .notEmpty()
        .withMessage("Payment amount is required"),
    body("*.status")
        .trim()
        .notEmpty()
        .isIn(Object.values(PaymentStatus))
        .withMessage("Payment status is required"),
    body("*.paymentMethod")
        .trim()
        .notEmpty()
        .isIn(Object.values(PaymentMethod))
        .withMessage("Payment method is required"),
    body("*.isInternational")
        .exists()
        .withMessage("isInternational field is required")
        .isBoolean()
        .withMessage("isInternational must be a boolean")
];