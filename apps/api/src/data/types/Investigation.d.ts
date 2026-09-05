import {
    VerificationIdParam,
    VerificationMerchantIdParam,
} from './Verification';
import { investigations } from '@/db/schemas/investigations.schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Investigation = InferSelectModel<typeof investigations>;

export type InvestigationParams = VerificationIdParam;
