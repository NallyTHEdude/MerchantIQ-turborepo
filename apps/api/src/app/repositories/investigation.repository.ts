import { db } from '@/db';
import { investigations } from '@/db/schemas/investigations.schema';

export const createInvestigation = async ({
    verificationId,
    action,
    reasoning,
}: {
    verificationId: string;
    action: string;
    reasoning: string;
}) => {
    const [investigation] = await db
        .insert(investigations)
        .values({
            verificationId,
            action,
            reasoning,
            isOverridden: false,
        })
        .returning();

    return investigation;
};
