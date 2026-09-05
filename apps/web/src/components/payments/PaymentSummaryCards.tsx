import React from 'react';
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Globe2,
    TrendingUp,
    Receipt,
} from 'lucide-react';
import { PaymentItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface PaymentSummaryCardsProps {
    payments: PaymentItem[];
    isLoading?: boolean;
}

export function PaymentSummaryCards({
    payments,
    isLoading,
}: PaymentSummaryCardsProps) {
    const totalTransactions = payments.length;

    const totalVolume = payments.reduce((acc, curr) => {
        const amt =
            typeof curr.amount === 'string'
                ? parseFloat(curr.amount)
                : curr.amount;
        return acc + (isNaN(amt) ? 0 : amt);
    }, 0);

    const successfulPayments = payments.filter(
        (p) =>
            p.status?.toUpperCase() === 'SUCCESS' ||
            p.status?.toUpperCase() === 'COMPLETED',
    ).length;

    const failedPayments = payments.filter(
        (p) => p.status?.toUpperCase() === 'FAILED',
    ).length;

    const internationalPayments = payments.filter((p) =>
        Boolean(p.isInternational),
    ).length;

    const stats = [
        {
            id: 'stat-total-transactions',
            title: 'Total Transactions',
            value: totalTransactions.toString(),
            icon: Receipt,
            bg: 'bg-slate-100 text-slate-700',
        },
        {
            id: 'stat-payment-volume',
            title: 'Total Volume',
            value: formatCurrency(totalVolume),
            icon: TrendingUp,
            bg: 'bg-blue-50 text-blue-700',
        },
        {
            id: 'stat-successful-payments',
            title: 'Successful Payments',
            value: successfulPayments.toString(),
            icon: CheckCircle2,
            bg: 'bg-emerald-50 text-emerald-700',
        },
        {
            id: 'stat-failed-payments',
            title: 'Failed Payments',
            value: failedPayments.toString(),
            icon: XCircle,
            bg: 'bg-rose-50 text-rose-700',
        },
        {
            id: 'stat-intl-payments',
            title: 'International Payments',
            value: internationalPayments.toString(),
            icon: Globe2,
            bg: 'bg-purple-50 text-purple-700',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.id}
                        id={stat.id}
                        className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-xs flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] truncate">
                                {stat.title}
                            </span>
                            <Icon className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-bold text-[#18181B] tracking-tight block truncate font-mono">
                                {isLoading ? '—' : stat.value}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
