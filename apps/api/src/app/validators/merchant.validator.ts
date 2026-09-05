import { body, param } from 'express-validator';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const createMerchantValidator = [
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('gstNumber')
        .trim()
        .notEmpty()
        .withMessage('GST number is required')
        .matches(GST_REGEX)
        .withMessage('Invalid GST number format'),
    body('websiteUrl')
        .trim()
        .notEmpty()
        .withMessage('Website URL is required')
        .isURL({
            require_tld: false,
            protocols: ['http', 'https'],
            require_protocol: true,
        })
        .withMessage('Invalid website URL'),
    body('phoneNumber')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/)
        .withMessage('Invalid phone number format'),
];

export const updateMerchantValidator = [
    param('id').notEmpty().isUUID().withMessage('Merchant ID is required'),
    body('businessName')
        .optional()
        .notEmpty()
        .withMessage('Business name is required'),
    body('category').optional().notEmpty().withMessage('Category is required'),
    body('gstNumber')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('GST number is required')
        .matches(GST_REGEX)
        .withMessage('Invalid GST number format'),
    body('websiteUrl').optional().isURL().withMessage('Invalid website URL'),
    body('phoneNumber')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/)
        .withMessage('Invalid phone number format'),
];

export const getMerchantByGstNumberValidator = [
    param('gstNumber')
        .trim()
        .notEmpty()
        .withMessage('GST number is required')
        .matches(GST_REGEX)
        .withMessage('Invalid GST number format'),
];

export const getMerchantByIdValidator = [
    param('id').notEmpty().isUUID().withMessage('Merchant ID is required'),
];

export const deleteMerchantValidator = [
    param('id').notEmpty().isUUID().withMessage('Merchant ID is required'),
];
