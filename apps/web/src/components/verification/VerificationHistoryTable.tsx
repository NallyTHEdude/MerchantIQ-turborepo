import React from 'react';
import { Check, X, Shield, FileSearch } from 'lucide-react';
import { Verification } from '@/types';
import { RiskBadge, StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface VerificationHistoryTableProps {
    verifications: Verification[];
    isLoading: boolean;
    onInvestigate: (verificationId: string) => void;

    /**
     * Investigation status keyed by verification ID.
     *
     * Example:
     * {
     *   "58c17c64-d8e5-4200-9bfc-d292f9e65fed": "REJECT",
     *   "123...": "ACCEPT"
     * }
     */
    investigationStatuses?: Record<string, 'APPROVE' | 'REJECT'>;
}

export function VerificationHistoryTable({
    verifications,
    isLoading,
    onInvestigate,
    investigationStatuses = {},
}: VerificationHistoryTableProps) {
    // Sort newest verification first
    const sorted = [...verifications].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const renderInvestigationStatus = (verificationId: string) => {
        const status = investigationStatuses[verificationId];

        if (status === 'APPROVE') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    Approved
                </span>
            );
        }

        if (status === 'REJECT') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                    <X className="w-3 h-3 stroke-[2.5]" />
                    Rejected
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-slate-50 text-slate-400 border border-slate-200 whitespace-nowrap">
                Not Investigated
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-xs overflow-hidden">
            {/* ========================================================= */}
            {/* HEADER */}
            {/* ========================================================= */}

            <div className="p-4 sm:p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-white">
                <div>
                    <h3 className="text-sm font-semibold text-[#18181B] tracking-tight">
                        Verification History
                    </h3>

                    <p className="text-xs text-[#71717A] mt-0.5">
                        Audit trail of automated and periodic verification
                        checkpoints
                    </p>
                </div>

                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7]">
                    {verifications.length} records
                </span>
            </div>

            {/* ========================================================= */}
            {/* LOADING */}
            {/* ========================================================= */}

            {isLoading ? (
                <TableSkeleton rows={4} cols={9} />
            ) : sorted.length === 0 ? (
                /* ===================================================== */
                /* EMPTY STATE */
                /* ===================================================== */

                <div className="py-12 px-6 text-center text-[#71717A]">
                    <Shield className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2" />

                    <p className="text-sm font-medium text-[#18181B]">
                        No verification checkpoints found
                    </p>

                    <p className="text-xs text-[#71717A] mt-1">
                        Verification history will appear as soon as checks are
                        run.
                    </p>
                </div>
            ) : (
                /* ===================================================== */
                /* TABLE */
                /* ===================================================== */

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {/* ================================================= */}
                        {/* TABLE HEADER */}
                        {/* ================================================= */}

                        <thead>
                            <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[#71717A] text-[10px] font-bold uppercase tracking-widest">
                                <th
                                    scope="col"
                                    className="py-3 px-6 whitespace-nowrap"
                                >
                                    Date
                                </th>

                                <th
                                    scope="col"
                                    className="py-3 px-4 whitespace-nowrap"
                                >
                                    Status
                                </th>

                                <th
                                    scope="col"
                                    className="py-3 px-4 whitespace-nowrap"
                                >
                                    Trust Score
                                </th>

                                <th
                                    scope="col"
                                    className="py-3 px-4 whitespace-nowrap"
                                >
                                    Risk Level
                                </th>

                                <th
                                    scope="col"
                                    className="py-3 px-4 text-center whitespace-nowrap"
                                >
                                    Investigation Status
                                </th>

                                <th
                                    scope="col"
                                    className="py-3 px-3 text-center"
                                >
                                    GST
                                </th>

                                <th
                                    scope="col"
                                    className="py-3 px-3 text-center"
                                >
                                    Website
                                </th>

                                <th
                                    scope="col"
                                    className="py-3 px-3 text-center"
                                >
                                    Phone
                                </th>

                                <th
                                    scope="col"
                                    className="py-3 px-6 text-right whitespace-nowrap"
                                >
                                    Investigation
                                </th>
                            </tr>
                        </thead>

                        {/* ================================================= */}
                        {/* TABLE BODY */}
                        {/* ================================================= */}

                        <tbody className="divide-y divide-[#F4F4F5] text-sm">
                            {sorted.map((item) => {
                                /*
                                 * The investigation API uses:
                                 *
                                 * verificationId
                                 * action: "ACCEPT" | "REJECT"
                                 *
                                 * The verification item's `id` is the
                                 * verification ID used by onInvestigate().
                                 */

                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-[#F9FAFB] transition-colors"
                                    >
                                        {/* ================================= */}
                                        {/* DATE */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-6 text-xs text-[#71717A] font-mono whitespace-nowrap">
                                            {formatDate(item.createdAt)}
                                        </td>

                                        {/* ================================= */}
                                        {/* VERIFICATION STATUS */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-4">
                                            <StatusBadge
                                                status={item.verificationStatus}
                                            />
                                        </td>

                                        {/* ================================= */}
                                        {/* TRUST SCORE */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-4">
                                            <span className="font-mono text-sm text-[#18181B]">
                                                {String(
                                                    item.trustscore ?? 0,
                                                ).padStart(2, '0')}
                                                /100
                                            </span>
                                        </td>

                                        {/* ================================= */}
                                        {/* RISK LEVEL */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-4">
                                            <RiskBadge risk={item.riskLevel} />
                                        </td>

                                        {/* ================================= */}
                                        {/* INVESTIGATION STATUS */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-4 text-center">
                                            {renderInvestigationStatus(item.id)}
                                        </td>

                                        {/* ================================= */}
                                        {/* GST / GSTIN */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-3 text-center">
                                            {item.isGstNumberVerified ? (
                                                <span className="inline-flex p-1 rounded-full bg-green-50 text-green-700">
                                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex p-1 rounded-full bg-red-50 text-red-600">
                                                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </span>
                                            )}
                                        </td>

                                        {/* ================================= */}
                                        {/* WEBSITE */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-3 text-center">
                                            {item.isWebsiteVerified ? (
                                                <span className="inline-flex p-1 rounded-full bg-green-50 text-green-700">
                                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex p-1 rounded-full bg-red-50 text-red-600">
                                                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </span>
                                            )}
                                        </td>

                                        {/* ================================= */}
                                        {/* PHONE */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-3 text-center">
                                            {item.isPhoneNumberVerified ? (
                                                <span className="inline-flex p-1 rounded-full bg-green-50 text-green-700">
                                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex p-1 rounded-full bg-red-50 text-red-600">
                                                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </span>
                                            )}
                                        </td>

                                        {/* ================================= */}
                                        {/* INVESTIGATE BUTTON */}
                                        {/* ================================= */}

                                        <td className="py-3.5 px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onInvestigate(item.id)
                                                }
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#18181B] bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] rounded-md transition-colors shadow-2xs"
                                            >
                                                <FileSearch className="w-3.5 h-3.5 text-[#71717A]" />
                                                Investigate
                                            </button>
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
