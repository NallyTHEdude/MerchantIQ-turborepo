import React, { useMemo } from 'react';
import {
    FileSearch,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    AlertCircle,
    Check,
    X,
} from 'lucide-react';
import { Investigation } from '@/types';
import { Modal } from '@/components/ui/Modal';

interface InvestigationModalProps {
    isOpen: boolean;
    onClose: () => void;
    investigation: Investigation | null;
    isLoading: boolean;
    error: string | null;
    verificationId?: string;
}

interface RagResult {
    missingEvidence?: string[];
    reasons?: string[];
    risks?: string[];
    decision?: string;
    confidence?: number;
}

interface ParsedReasoning {
    ragResult?: RagResult;
}

export function InvestigationModal({
    isOpen,
    onClose,
    investigation,
    isLoading,
    error,
    verificationId,
}: InvestigationModalProps) {
    /*
     * investigation.reasoning is returned by the API as a JSON string.
     *
     * Example:
     *
     * {
     *   "documentResult": {...},
     *   "merchantId": "...",
     *   "ragContext": "...",
     *   "ragResult": {
     *      "confidence": 0.7,
     *      "decision": "REJECT",
     *      "missingEvidence": [...],
     *      "reasons": [...],
     *      "risks": [...]
     *   }
     * }
     *
     * We only extract ragResult because the raw document/RAG context
     * should never be shown to the user.
     */
    const ragResult = useMemo<RagResult | null>(() => {
        if (!investigation?.reasoning) {
            return null;
        }

        try {
            const parsed: ParsedReasoning = JSON.parse(investigation.reasoning);

            return parsed?.ragResult ?? null;
        } catch (err) {
            console.error('Failed to parse investigation reasoning:', err);

            return null;
        }
    }, [investigation?.reasoning]);

    const missingEvidence = ragResult?.missingEvidence ?? [];
    const reasons = ragResult?.reasons ?? [];
    const risks = ragResult?.risks ?? [];

    const action = (
        investigation?.action ||
        ragResult?.decision ||
        'NO_ACTION'
    ).toUpperCase();

    const isApprove = action === 'APPROVE' || action === 'ACCEPT';
    const isReject = action === 'REJECT';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Investigation Details"
            description={`Verification Record: ${
                verificationId || investigation?.verificationId || '—'
            }`}
            maxWidth="lg"
            id="modal-investigation-details"
        >
            {isLoading ? (
                <div className="py-12 text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin mx-auto" />

                    <p className="text-xs text-slate-500">
                        Querying investigation telemetry...
                    </p>
                </div>
            ) : error ? (
                <div className="py-8 px-4 text-center">
                    <div className="inline-flex p-3 rounded-full bg-[#F4F4F5] text-[#18181B] mb-2 border border-[#E4E4E7]">
                        <AlertCircle className="w-6 h-6" />
                    </div>

                    <h4 className="text-sm font-semibold text-[#18181B]">
                        Investigation Not Found
                    </h4>

                    <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
                        {error}
                    </p>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-semibold bg-[#18181B] text-white hover:bg-black rounded-md transition-colors shadow-2xs"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ) : investigation ? (
                <div className="space-y-4">
                    {/* ================================================== */}
                    {/* ACTION */}
                    {/* ================================================== */}

                    <div
                        className={`p-4 rounded-lg border flex items-center gap-3 ${
                            isReject
                                ? 'bg-red-50 border-red-200'
                                : isApprove
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-[#FAFAFA] border-[#E4E4E7]'
                        }`}
                    >
                        <div
                            className={`p-2 rounded-md shrink-0 border ${
                                isReject
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : isApprove
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : 'bg-white text-[#18181B] border-[#E4E4E7]'
                            }`}
                        >
                            {isReject ? (
                                <X className="w-5 h-5" />
                            ) : isApprove ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <FileSearch className="w-5 h-5" />
                            )}
                        </div>

                        <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                                Investigative Action
                            </span>

                            <h3
                                className={`text-base font-bold mt-0.5 ${
                                    isReject
                                        ? 'text-red-700'
                                        : isApprove
                                          ? 'text-green-700'
                                          : 'text-[#18181B]'
                                }`}
                            >
                                {action}
                            </h3>
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* FINDINGS */}
                    {/* ================================================== */}

                    <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
                        {/* Section Header */}
                        <div className="px-4 py-3 border-b border-[#E4E4E7] bg-[#FAFAFA]">
                            <div className="flex items-center gap-2">
                                <FileSearch className="w-4 h-4 text-[#71717A]" />

                                <h3 className="text-xs font-bold text-[#18181B]">
                                    Findings
                                </h3>
                            </div>

                            <p className="text-[11px] text-[#71717A] mt-0.5">
                                Evidence and reasoning used to reach the
                                investigation decision.
                            </p>
                        </div>

                        <div className="p-4 space-y-5">
                            {/* ========================================== */}
                            {/* MISSING EVIDENCE */}
                            {/* ========================================== */}

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />

                                    <h4 className="text-xs font-semibold text-[#18181B]">
                                        Missing Evidence
                                    </h4>
                                </div>

                                {missingEvidence.length > 0 ? (
                                    <ul className="space-y-2 ml-6">
                                        {missingEvidence.map(
                                            (evidence, index) => (
                                                <li
                                                    key={`missing-${index}`}
                                                    className="relative text-xs text-[#3F3F46] leading-5"
                                                >
                                                    <span className="absolute -left-4 top-2 w-1.5 h-1.5 rounded-full bg-amber-500" />

                                                    {evidence}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                ) : (
                                    <div className="ml-6 flex items-center gap-2 text-xs text-[#71717A]">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />

                                        <span>
                                            No missing evidence identified.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-[#F4F4F5]" />

                            {/* ========================================== */}
                            {/* REASONS */}
                            {/* ========================================== */}

                            <div>
                                <h4 className="text-xs font-semibold text-[#18181B] mb-2">
                                    Reasons
                                </h4>

                                {reasons.length > 0 ? (
                                    <ul className="space-y-2 ml-2">
                                        {reasons.map((reason, index) => (
                                            <li
                                                key={`reason-${index}`}
                                                className="flex items-start gap-2 text-xs text-[#3F3F46] leading-5"
                                            >
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />

                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-[#71717A]">
                                        No specific reasons provided.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* RISKS */}
                    {/* ================================================== */}

                    <div
                        className={`rounded-lg border p-4 ${
                            risks.length > 0
                                ? 'bg-red-50/50 border-red-200'
                                : 'bg-white border-[#E4E4E7]'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert
                                className={`w-4 h-4 ${
                                    risks.length > 0
                                        ? 'text-red-600'
                                        : 'text-[#71717A]'
                                }`}
                            />

                            <h3
                                className={`text-xs font-bold ${
                                    risks.length > 0
                                        ? 'text-red-700'
                                        : 'text-[#18181B]'
                                }`}
                            >
                                Risks
                            </h3>
                        </div>

                        {risks.length > 0 ? (
                            <ul className="space-y-2 ml-2">
                                {risks.map((risk, index) => (
                                    <li
                                        key={`risk-${index}`}
                                        className="flex items-start gap-2 text-xs text-[#3F3F46] leading-5"
                                    >
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />

                                        <span>{risk}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-[#71717A]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />

                                <span>No specific risks identified.</span>
                            </div>
                        )}
                    </div>

                    {/* ================================================== */}
                    {/* FALLBACK IF REASONING COULD NOT BE PARSED */}
                    {/* ================================================== */}

                    {!ragResult && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />

                                <div>
                                    <p className="text-xs font-semibold text-amber-800">
                                        Investigation findings unavailable
                                    </p>

                                    <p className="text-xs text-amber-700 mt-1 leading-5">
                                        The investigation was retrieved, but its
                                        structured findings could not be read.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </Modal>
    );
}
