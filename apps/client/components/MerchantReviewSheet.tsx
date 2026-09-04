'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CheckState, Merchant, PipelineCheck } from '@/data/merchants';
import {
    AlertCircle,
    CheckCircle2,
    CircleDashed,
    Clock3,
    ExternalLink,
    ShieldAlert,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const stateStyles: Record<
    CheckState,
    { label: string; className: string; icon: typeof CheckCircle2 }
> = {
    success: {
        label: 'Passed',
        className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
        icon: CheckCircle2,
    },
    processing: {
        label: 'Processing',
        className: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
        icon: CircleDashed,
    },
    failed: {
        label: 'Failed',
        className: 'border-red-400/30 bg-red-400/10 text-red-300',
        icon: XCircle,
    },
    review: {
        label: 'Needs review',
        className: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
        icon: AlertCircle,
    },
};

function StatusBadge({
    state,
    children,
}: {
    state: CheckState;
    children?: React.ReactNode;
}) {
    const style = stateStyles[state];
    const Icon = style.icon;
    return (
        <Badge variant="outline" className={style.className}>
            <Icon className="mr-1 size-3" aria-hidden="true" />
            {children ?? style.label}
        </Badge>
    );
}

function CheckRow({
    check,
    merchant,
}: {
    check: PipelineCheck;
    merchant: Merchant;
}) {
    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-border/70 py-3 last:border-0">
            <div className="pt-0.5">
                <StatusBadge state={check.state} />
            </div>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="min-w-0 text-xs font-medium text-foreground">
                        {check.stage}
                    </p>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock3 className="size-3" aria-hidden="true" />
                        {check.timestamp}
                    </span>
                </div>
                <p className="mt-1 text-xs text-foreground">{check.result}</p>
                {check.stage === 'Payment / Transaction Analysis' && (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-md border border-border/70 bg-card/40 px-2.5 py-2">
                            <p className="text-[10px] text-muted-foreground">
                                Logistic Regression
                            </p>
                            <p className="mt-1 text-[11px] text-foreground">
                                {merchant.logisticRegression ??
                                    'Not provided by backend.'}
                            </p>
                        </div>
                        <div className="rounded-md border border-border/70 bg-card/40 px-2.5 py-2">
                            <p className="text-[10px] text-muted-foreground">
                                Isolation Forest
                            </p>
                            <p className="mt-1 text-[11px] text-foreground">
                                {merchant.isolationForest ??
                                    'Not provided by backend.'}
                            </p>
                        </div>
                    </div>
                )}
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {check.explanation}
                </p>
            </div>
        </div>
    );
}

function ChecksTab({ merchant }: { merchant: Merchant }) {
    return (
        <div className="flex flex-col gap-5">
            <section>
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground">
                        Verification pipeline
                    </h3>
                    <span className="text-[11px] text-muted-foreground">
                        {
                            (merchant.checks ?? []).filter(
                                (check) => check.state === 'success',
                            ).length
                        }
                        /{(merchant.checks ?? []).length} passed
                    </span>
                </div>
                <div className="mt-2">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Evidence verification
                    </p>
                    {(merchant.checks ?? []).slice(0, 3).map((check) => (
                        <CheckRow
                            key={check.stage}
                            check={check}
                            merchant={merchant}
                        />
                    ))}
                    <p className="mb-1 mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Analysis and decisioning
                    </p>
                    {(merchant.checks ?? []).slice(3, 6).map((check) => (
                        <CheckRow
                            key={check.stage}
                            check={check}
                            merchant={merchant}
                        />
                    ))}
                    <p className="mb-1 mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Compliance context
                    </p>
                    {(merchant.checks ?? []).slice(6).map((check) => (
                        <CheckRow
                            key={check.stage}
                            check={check}
                            merchant={merchant}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

function RiskTab({ merchant }: { merchant: Merchant }) {
    return (
        <div className="flex flex-col gap-5">
            <section>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-foreground">
                            Trust score
                        </h3>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Combined verification confidence
                        </p>
                    </div>
                    <span className="font-mono text-2xl font-semibold text-foreground">
                        {merchant.trustScore}
                        <span className="text-sm text-muted-foreground">
                            /100
                        </span>
                    </span>
                </div>
                <Progress value={merchant.trustScore} className="mt-3 h-1.5" />
            </section>
            <Separator />
            <section className="grid gap-3 sm:grid-cols-2">
                <RiskModel
                    label="Logistic Regression"
                    value={
                        merchant.logisticRegression ??
                        'Not provided by backend.'
                    }
                />
                <RiskModel
                    label="Isolation Forest"
                    value={
                        merchant.isolationForest ?? 'Not provided by backend.'
                    }
                />
            </section>
            <Separator />
            <section>
                <div className="flex items-center gap-2">
                    <ShieldAlert
                        className="size-4 text-red-300"
                        aria-hidden="true"
                    />
                    <h3 className="text-xs font-semibold text-foreground">
                        Risk signals
                    </h3>
                </div>
                {merchant.riskSignals?.length ? (
                    <ul className="mt-3 flex flex-col gap-2">
                        {merchant.riskSignals.map((signal) => (
                            <li
                                key={signal}
                                className="text-xs text-muted-foreground"
                            >
                                {signal}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                        No active risk signals.
                    </p>
                )}
            </section>
        </div>
    );
}
function RiskModel({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-border bg-card/60 p-3">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="mt-2 text-xs leading-5 text-foreground">{value}</p>
        </div>
    );
}

function getDecision(merchant: Merchant) {
    const processing =
        merchant.status === 'PENDING' ||
        (merchant.checks ?? []).some((check) => check.state === 'processing');
    if (processing)
        return {
            title: 'Verification in progress',
            description:
                'Final decision will be available when all required checks complete.',
            actions: [] as string[],
        };
    if (
        merchant.status === 'FAILED' ||
        merchant.status === 'SERVER_ERROR' ||
        merchant.risk === 'HIGH' ||
        merchant.risk === 'VERY_HIGH'
    )
        return {
            title: 'Keep merchant blocked',
            description:
                'Verification failures or strong risk signals require enhanced due diligence.',
            actions: ['Request evidence', 'Keep blocked'],
        };
    if (
        merchant.status === 'COMPLETED' &&
        merchant.risk === 'LOW' &&
        (merchant.checks ?? []).every((check) => check.state === 'success')
    )
        return {
            title: 'Approve merchant',
            description:
                'All verification checks passed and no significant risk signals were detected.',
            actions: ['Approve merchant'],
        };
    return {
        title: 'Hold merchant approval',
        description:
            'Website verification failed and transaction analysis indicates elevated risk. Additional review is required before approval.',
        actions: ['Request evidence', 'Reject merchant'],
    };
}

function ComplianceTab({ merchant }: { merchant: Merchant }) {
    return (
        <div className="flex flex-col gap-5">
            <section>
                <h3 className="text-xs font-semibold text-foreground">
                    LangGraph assessment
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground">
                    {merchant.assessment ?? 'Not provided by backend.'}
                </p>
            </section>
            <Separator />
            <section>
                <h3 className="text-xs font-semibold text-foreground">
                    Document compliance concerns
                </h3>
                {merchant.complianceConcerns?.length ? (
                    <ul className="mt-3 flex flex-col gap-2">
                        {merchant.complianceConcerns.map((concern) => (
                            <li
                                key={concern}
                                className="text-xs leading-5 text-amber-200"
                            >
                                {concern}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                        No compliance concerns identified.
                    </p>
                )}
            </section>
            <section className="rounded-md border border-border bg-card/60 p-3">
                <p className="text-[11px] text-muted-foreground">
                    RAG-derived regulatory context
                </p>
                <p className="mt-2 text-xs leading-5 text-foreground">
                    {merchant.ragContext ?? 'Not provided by backend.'}
                </p>
            </section>
        </div>
    );
}

export function MerchantReviewSheet({
    merchant,
    open,
    onOpenChange,
}: {
    merchant: Merchant | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [width, setWidth] = useState(680);
    const dragging = useRef(false);
    useEffect(() => {
        const move = (event: MouseEvent) => {
            if (!dragging.current) return;
            setWidth(
                Math.min(
                    Math.max(window.innerWidth - event.clientX, 420),
                    window.innerWidth * 0.5,
                ),
            );
        };
        const stop = () => {
            dragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', stop);
        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', stop);
        };
    }, []);
    if (!merchant) return null;
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-none"
                style={
                    {
                        width: 'var(--sheet-width)',
                        maxWidth: '50vw',
                        '--sheet-width': `${width}px`,
                    } as React.CSSProperties
                }
            >
                {' '}
                <div
                    role="separator"
                    aria-label="Resize merchant review panel"
                    aria-orientation="vertical"
                    tabIndex={0}
                    onMouseDown={() => {
                        dragging.current = true;
                        document.body.style.cursor = 'ew-resize';
                        document.body.style.userSelect = 'none';
                    }}
                    className="absolute left-0 top-0 z-10 hidden h-full w-1 cursor-ew-resize bg-transparent transition-colors hover:bg-primary/50 sm:block"
                />
                <SheetHeader className="border-b border-border px-5 py-5 text-left md:px-7">
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <div className="min-w-0">
                            <SheetTitle className="truncate text-lg tracking-tight">
                                {merchant.name}
                            </SheetTitle>
                            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                <span>{merchant.phone}</span>
                                <span aria-hidden="true">·</span>
                                <span>{merchant.category}</span>
                                <span aria-hidden="true">·</span>
                                <span>
                                    {merchant.gstNumber ?? 'Not submitted'}
                                </span>
                            </div>
                        </div>
                        <StatusBadge
                            state={
                                merchant.status === 'COMPLETED'
                                    ? 'success'
                                    : merchant.status === 'FAILED' ||
                                        merchant.status === 'SERVER_ERROR'
                                      ? 'failed'
                                      : merchant.status === 'PENDING'
                                        ? 'processing'
                                        : 'review'
                            }
                        >
                            {merchant.status}
                        </StatusBadge>
                    </div>
                    <div className="mt-4 flex flex-wrap items-end gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Risk
                            </p>
                            <p className="mt-1 text-xs font-medium text-foreground">
                                {merchant.risk}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Trust score
                            </p>
                            <p className="mt-1 font-mono text-xs text-foreground">
                                {merchant.trustScore}/100
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Website
                            </p>
                            <a
                                href={
                                    merchant.website.startsWith('http')
                                        ? merchant.website
                                        : `https://${merchant.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex min-w-0 items-center gap-1 text-xs text-violet-300 transition-colors hover:text-violet-200 hover:underline"
                            >
                                <span className="truncate">
                                    {merchant.website}
                                </span>
                                <ExternalLink
                                    className="size-3 shrink-0"
                                    aria-hidden="true"
                                />
                            </a>
                        </div>
                    </div>
                </SheetHeader>
                <ScrollArea className="min-h-0 flex-1">
                    <div className="px-5 py-5 md:px-7">
                        <Tabs defaultValue="checks">
                            <TabsList className="mb-5 grid w-full grid-cols-3">
                                <TabsTrigger value="checks">Checks</TabsTrigger>
                                <TabsTrigger value="risk">Risk</TabsTrigger>
                                <TabsTrigger value="compliance">
                                    Document Compliance
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="checks">
                                <ChecksTab merchant={merchant} />
                            </TabsContent>
                            <TabsContent value="risk">
                                <RiskTab merchant={merchant} />
                            </TabsContent>
                            <TabsContent value="compliance">
                                <ComplianceTab merchant={merchant} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </ScrollArea>
                <div className="border-t border-border bg-card/60 px-5 py-4 md:px-7">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Decision
                    </p>
                    {(() => {
                        const decision = getDecision(merchant);
                        return (
                            <>
                                <p className="mt-1 text-xs font-medium text-foreground">
                                    {decision.title}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {decision.description}
                                </p>
                                {decision.actions.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {decision.actions.map((action) => (
                                            <Button
                                                key={action}
                                                variant={
                                                    action ===
                                                    'Approve merchant'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                className="h-8 flex-1 text-xs"
                                            >
                                                {action}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </SheetContent>
        </Sheet>
    );
}
