import {param} from 'express-validator';

export const getInvestigationByVerificationIdValidator = [
    param('verificationId')
        .trim()
        .notEmpty()
        .withMessage('Verification ID is required')
        .isUUID()
        .withMessage('Invalid verification ID'),
];