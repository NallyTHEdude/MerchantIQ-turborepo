import { Investigation } from '@/data/types/Investigation';
import { db } from '@/db';
import { investigations as investigationTable } from '@/db/schemas/investigations.schema';
import { eq } from 'drizzle-orm';

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
        .insert(investigationTable)
        .values({
            verificationId,
            action,
            reasoning,
            isOverridden: false,
        })
        .returning();

    return investigation;
};

export const getInvestigationByVerificationIdRepository = async (verificationId: string): Promise<Investigation | undefined> => {
    const investigation = await db
        .select()
        .from(investigationTable)
        .where(eq(investigationTable.verificationId, verificationId))
        .limit(1);

    return investigation[0];
};
