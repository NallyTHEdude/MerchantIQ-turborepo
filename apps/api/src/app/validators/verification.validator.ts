import { param } from "express-validator";

export const requestVerificationValidator = [
    param("merchantId")
        .trim()
        .notEmpty()
        .withMessage("Merchant ID is required")
        .isUUID()
        .withMessage("Invalid merchant ID"),
];

export const getVerificationByIdValidator = [
    param("merchantId")
        .trim()
        .notEmpty()
        .withMessage("Merchant ID is required")
        .isUUID()
        .withMessage("Invalid merchant ID"),
    param("verificationId")
        .trim()
        .notEmpty()
        .withMessage("Verification ID is required")
        .isUUID()
        .withMessage("Invalid verification ID"),
];

