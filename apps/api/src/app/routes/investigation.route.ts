import { getInvestigationByVerificationIdController } from '@/app/controllers/investigation.controller';
import { validate } from '@/app/middlewares/validate.middleware';
import { getInvestigationByVerificationIdValidator } from '@/app/validators/investigation.validator';
import Router from 'express';

const router = Router();

/**
 * @swagger
 * /api/investigation/{verificationId}:
 *   get:
 *     tags:
 *       - Investigation Endpoints
 *     summary: Get an investigation by verification ID
 *     description: Returns the investigation associated with a verification. No authentication is required.
 *     parameters:
 *       - in: path
 *         name: verificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Verification UUID.
 *     responses:
 *       200:
 *         description: Investigation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvestigationResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Investigation was not found for the verification
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
router.get(
    '/:verificationId',
    validate(getInvestigationByVerificationIdValidator),
    getInvestigationByVerificationIdController,
);

export default router;
