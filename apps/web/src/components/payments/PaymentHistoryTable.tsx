import React, { useState, useMemo } from 'react';
import { CreditCard, Globe, ArrowUpDown, Receipt, Filter } from 'lucide-react';
import { PaymentItem } from '@/types';
import { PaymentStatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface PaymentHistoryTableProps {
    payments: PaymentItem[];
    isLoading: boolean;
}

export function PaymentHistoryTable({
    payments,
    isLoading,
}: PaymentHistoryTableProps) {
    const [filterMethod, setFilterMethod] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortField, setSortField] = useState<'createdAt' | 'amount'>(
        'createdAt',
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const filteredPayments = useMemo(() => {
        let result = [...payments];

        if (filterMethod !== 'ALL') {
            result = result.filter(
                (p) =>
                    (p.paymentMethod || '').toUpperCase() ===
                    filterMethod.toUpperCase(),
            );
        }

        if (filterStatus !== 'ALL') {
            result = result.filter(
                (p) =>
                    (p.status || '').toUpperCase() ===
                    filterStatus.toUpperCase(),
            );
        }

        result.sort((a, b) => {
            if (sortField === 'amount') {
                const amtA =
                    typeof a.amount === 'string'
                        ? parseFloat(a.amount)
                        : a.amount;
                const amtB =
                    typeof b.amount === 'string'
                        ? parseFloat(b.amount)
                        : b.amount;
                return sortOrder === 'asc' ? amtA - amtB : amtB - amtA;
            } else {
                const timeA = new Date(a.createdAt || 0).getTime();
                const timeB = new Date(b.createdAt || 0).getTime();
                return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
            }
        });

        return result;
    }, [payments, filterMethod, filterStatus, sortField, sortOrder]);

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-[#E4E4E7] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E4E4E7] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
                <div>
                    <h3 className="text-sm font-semibold text-[#18181B] tracking-tight">
                        Payment History
                    </h3>
                    <p className="text-xs text-[#71717A] mt-0.5">
                        Individual transaction logs for this merchant account
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Method Filter */}
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#F4F4F5] border border-[#E4E4E7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                    >
                        <option value="ALL">All Methods</option>
                        <option value="UPI">UPI</option>
                        <option value="CARD">CARD</option>
                        <option value="NETBANKING">NETBANKING</option>
                        <option value="WALLET">WALLET</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#F4F4F5] border border-[#E4E4E7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="PENDING">Pending</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => {
                            if (sortField === 'createdAt') {
                                setSortOrder((prev) =>
                                    prev === 'asc' ? 'desc' : 'asc',
                                );
                            } else {
                                setSortField('createdAt');
                                setSortOrder('desc');
                            }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5]"
                        title="Toggle sort order"
                    >
                        <ArrowUpDown className="w-3 h-3 text-[#71717A]" />
                        <span>Sort by Date</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <TableSkeleton rows={4} cols={5} />
            ) : filteredPayments.length === 0 ? (
                <div className="py-12 px-6 text-center text-[#71717A]">
                    <Receipt className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2" />
                    <p className="text-sm font-medium text-[#18181B]">
                        No payment transactions found
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">
                        {payments.length === 0
                            ? 'No payments have been recorded for this merchant.'
                            : 'Try clearing your filters to see all payments.'}
                    </p>
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[#71717A] text-[10px] font-bold uppercase tracking-widest">
                                <th scope="col" className="py-3 px-6">
                                    Amount
                                </th>
                                <th scope="col" className="py-3 px-4">
                                    Status
                                </th>
                                <th scope="col" className="py-3 px-4">
                                    Method
                                </th>
                                <th scope="col" className="py-3 px-4">
                                    Type
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#F4F4F5] text-sm">
                            {filteredPayments.map((p, index) => {
                                const isIntl = Boolean(p.isInternational);

                                return (
                                    <tr
                                        key={p.id || index}
                                        className="hover:bg-[#F9FAFB] transition-colors"
                                    >
                                        <td className="py-3.5 px-6 font-semibold text-[#18181B] font-mono">
                                            {formatCurrency(p.amount)}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <PaymentStatusBadge
                                                status={p.status}
                                            />
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7]">
                                                <CreditCard className="w-3 h-3 text-[#71717A]" />
                                                {p.paymentMethod || 'UNKNOWN'}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            {isIntl ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                                    <Globe className="w-3 h-3" />
                                                    International
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[#71717A] font-mono">
                                                    Domestic
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
