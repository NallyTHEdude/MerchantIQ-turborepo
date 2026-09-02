import {db} from "@/db";
import {payments as paymentTable} from "@/db/schemas/payments.schema";
import {type Payment, type NewPayment, type CreatePaymentDto} from "@/data/types/Payment";
import { eq, and, desc } from "drizzle-orm/sql/expressions/index";

export const getAllPayments = async (merchantId: string) : Promise<Payment[]> => {
    return db.select().from(paymentTable).where(eq(paymentTable.merchantId, merchantId));
};
export const getPaymentById = async (merchantId: string, paymentId: string): Promise<Payment | null>  => {
    const [payment] = await db.select().from(paymentTable)
    .where(
        and(
            eq(paymentTable.merchantId, merchantId), 
            eq(paymentTable.id, paymentId)
        )
    )
    .limit(1);
    return payment ?? null;
};

export const getHundredLatestPaymentsByMerchantId = async (merchantId: string): Promise<Payment[]> => {
    return db.select().from(paymentTable)
    .where(eq(paymentTable.merchantId, merchantId))
    .orderBy(desc(paymentTable.createdAt))
    .limit(100);
}
export const createManyPayments = async (merchantId: string, payments: CreatePaymentDto[]): Promise<Payment[]> => {
    const newPayments: NewPayment[] = payments.map((payment) => ({ ...payment, merchantId }));
    return db.insert(paymentTable).values(newPayments).returning();
};
