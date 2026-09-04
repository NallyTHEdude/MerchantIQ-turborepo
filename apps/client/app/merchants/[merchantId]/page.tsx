import { AppShell } from '@/components/AppShell';
import { Badge } from '@/components/ui/badge';
import { api, displayLabel } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function MerchantDetailPage({
    params,
}: {
    params: Promise<{ merchantId: string }>;
}) {
    const { merchantId } = await params;
    let merchant;
    let verification;
    try {
        const [merchantResponse, verificationResponse] = await Promise.all([
            api.merchant(merchantId),
            api.verifications(merchantId),
        ]);
        merchant = merchantResponse.data;
        verification = verificationResponse.data.at(-1) ?? null;
    } catch {
        notFound();
    }

    return (
        <AppShell>
            <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-5 py-7 md:px-8 md:py-9">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" aria-hidden="true" /> Back
                    to merchant queue
                </Link>
                <header className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                            {merchant.businessName}
                        </h1>
                        <Badge>
                            {displayLabel(
                                verification?.verificationStatus ?? 'PENDING',
                            )}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {merchant.businessName} ·{' '}
                        {displayLabel(merchant.category)}
                    </p>
                </header>
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card px-4 py-4">
                        <p className="text-xs text-muted-foreground">
                            Risk level
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                            {displayLabel(
                                verification?.riskLevel ?? 'VERY_HIGH',
                            )}
                        </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card px-4 py-4">
                        <p className="text-xs text-muted-foreground">
                            Trust score
                        </p>
                        <p className="mt-2 font-mono text-sm font-medium text-foreground">
                            {verification?.trustscore ?? 0}/100
                        </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card px-4 py-4">
                        <p className="text-xs text-muted-foreground">
                            Current stage
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                            {verification
                                ? 'Verification in progress'
                                : 'Awaiting verification'}
                        </p>
                    </div>
                </div>
            </section>
        </AppShell>
    );
}
