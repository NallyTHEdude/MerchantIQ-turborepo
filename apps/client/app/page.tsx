'use client';

import { AppShell } from '@/components/AppShell';
import { MerchantQueue } from '@/components/MerchantQueue';
import { MerchantReviewSheet } from '@/components/MerchantReviewSheet';
import type { Merchant } from '@/data/merchants';
import { api, mapLatestVerification } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Page() {
    const [merchantRecords, setMerchantRecords] = useState<Merchant[]>([]);
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                const result = await api.latestVerifications();
                if (!result.success || !Array.isArray(result.data)) {
                    throw new Error(
                        'The backend returned invalid merchant data.',
                    );
                }
                setMerchantRecords(result.data.map(mapLatestVerification));
                setError(null);
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Failed to load merchants.',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMerchants();
    }, []);

    return (
        <AppShell>
            <section className="mx-auto flex w-[calc(100vw-2rem)] max-w-350 flex-col gap-4 px-5 py-5 md:w-[calc(100vw-3rem)] md:px-8 md:py-6">
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
                    loading={loading}
                    error={error}
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
