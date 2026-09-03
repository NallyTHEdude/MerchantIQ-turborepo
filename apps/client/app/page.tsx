'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { MerchantQueue } from '@/components/MerchantQueue';
import { MerchantReviewSheet } from '@/components/MerchantReviewSheet';
import { merchants, type Merchant } from '@/data/merchants';

export default function Page() {
    const [merchantRecords, setMerchantRecords] =
        useState<Merchant[]>(merchants);
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
        null,
    );
    return (
        <AppShell>
            <section className="mx-auto flex w-[calc(100vw-2rem)] max-w-[1400px] flex-col gap-4 px-5 py-5 md:w-[calc(100vw-3rem)] md:px-8 md:py-6">
                <header className="flex flex-col gap-1">
                    <h1 className="text-balance text-2xl font-semibold tracking-[-0.03em] text-foreground">
                        Merchant verification
                    </h1>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        Monitor verification status, risk, and exceptions across
                        merchants.
                    </p>
                </header>
                <MerchantQueue
                    merchants={merchantRecords}
                    onSelect={setSelectedMerchant}
                    onCreated={(merchant) => {
                        setMerchantRecords((records) => [merchant, ...records]);
                        setSelectedMerchant(merchant);
                    }}
                />
            </section>
            <MerchantReviewSheet
                merchant={selectedMerchant}
                open={Boolean(selectedMerchant)}
                onOpenChange={(open) => {
                    if (!open) setSelectedMerchant(null);
                }}
            />
        </AppShell>
    );
}
