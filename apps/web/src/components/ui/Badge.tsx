import React from 'react';
import { getRiskBadgeClasses, getVerificationStatusClasses } from '@/lib/utils';
import { RiskLevel, VerificationStatus, PaymentStatus } from '@/types';

export function RiskBadge({ risk }: { risk?: RiskLevel | null }) {
    const styling = getRiskBadgeClasses(risk);
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${styling.bg} ${styling.text} uppercase tracking-tighter whitespace-nowrap shadow-2xs`}
        >
            {styling.label}
        </span>
    );
}

export function StatusBadge({
    status,
}: {
    status?: VerificationStatus | null;
}) {
    const styling = getVerificationStatusClasses(status);
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${styling.bg} ${styling.text} ${styling.border} uppercase whitespace-nowrap`}
        >
            {styling.label}
        </span>
    );
}

export function PaymentStatusBadge({
    status,
}: {
    status?: PaymentStatus | null;
}) {
    const upper = (status || '').toUpperCase();
    let bg = 'bg-zinc-100 text-zinc-700 border-zinc-200';
    if (upper === 'SUCCESS' || upper === 'COMPLETED') {
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (upper === 'FAILED') {
        bg = 'bg-red-50 text-red-700 border-red-200';
    } else if (upper === 'PENDING') {
        bg = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${bg} uppercase whitespace-nowrap`}
        >
            {upper || 'UNKNOWN'}
        </span>
    );
}
