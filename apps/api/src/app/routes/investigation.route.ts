import { getInvestigationByVerificationIdController } from '@/app/controllers/investigation.controller';
import { validate } from '@/app/middlewares/validate.middleware';
import { getInvestigationByVerificationIdValidator } from '@/app/validators/investigation.validator';
import Router from 'express';

const router = Router();

router.get(
    '/:verificationId',
    validate(getInvestigationByVerificationIdValidator),
    getInvestigationByVerificationIdController,
);

export default router;
