import React from 'react';
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle } from 'lucide-react';
import { Verification } from '@/types';
import { RiskBadge, StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface RiskOverviewProps {
    latestVerification: Verification | null;
    isLoading?: boolean;
}

export function RiskOverview({
    latestVerification,
    isLoading,
}: RiskOverviewProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-xs p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-[#F4F4F5] rounded w-1/4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-16 bg-[#F4F4F5] rounded" />
                        <div className="h-16 bg-[#F4F4F5] rounded" />
                        <div className="h-16 bg-[#F4F4F5] rounded" />
                    </div>
                </div>
            </div>
        );
    }

    const status = latestVerification?.verificationStatus || 'PENDING';
    const trustscore = latestVerification?.trustscore ?? 0;
    const riskLevel = latestVerification?.riskLevel || 'VERY_HIGH';

    // Choose icon and highlight based on risk
    const isHighRisk =
        riskLevel.toUpperCase() === 'HIGH' ||
        riskLevel.toUpperCase() === 'VERY_HIGH' ||
        riskLevel.toUpperCase() === 'VERY HIGH';

    return (
        <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-xs p-6">
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E4E7]">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
                            Live Assessment
                        </span>
                        <h2 className="text-xl font-bold text-[#18181B] tracking-tight mt-0.5">
                            Risk &amp; Trust Telemetry
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#71717A] font-medium">
                            Status:
                        </span>
                        <StatusBadge status={status} />
                    </div>
                </div>

                {/* 3 Core Metric Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                    {/* Status */}
                    <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E4E4E7]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">
                            Verification State
                        </span>
                        <div className="mt-2 flex items-center gap-2">
                            {status.toUpperCase() === 'COMPLETED' ? (
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            ) : status.toUpperCase() === 'FAILED' ? (
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            ) : (
                                <Shield className="w-5 h-5 text-[#18181B]" />
                            )}
                            <span className="text-lg font-bold text-[#18181B] tracking-tight">
                                {status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[11px] text-[#71717A] mt-1 font-mono">
                            {latestVerification
                                ? `Updated ${new Date(latestVerification.createdAt).toLocaleDateString()}`
                                : 'Awaiting initial evaluation'}
                        </p>
                    </div>

                    {/* Trust Score */}
                    <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E4E4E7]">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                                Trust Score
                            </span>
                            <span className="text-[10px] font-mono text-[#71717A]">
                                0 - 100
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[#18181B] tracking-tight font-mono">
                                {trustscore}
                            </span>
                            <span className="text-xs font-semibold text-[#71717A]">
                                / 100
                            </span>
                        </div>
                        {/* Visual Bar */}
                        <div className="w-full bg-[#E4E4E7] rounded-full h-1.5 mt-2.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    trustscore >= 70
                                        ? 'bg-emerald-600'
                                        : trustscore >= 40
                                          ? 'bg-amber-500'
                                          : 'bg-red-600'
                                }`}
                                style={{
                                    width: `${Math.min(Math.max(trustscore, 5), 100)}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Risk Level */}
                    <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E4E4E7]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">
                            Evaluated Risk Level
                        </span>
                        <div className="mt-2 flex items-center gap-2">
                            <RiskBadge risk={riskLevel} />
                            {isHighRisk && (
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            )}
                        </div>
                        <p className="text-[11px] text-[#71717A] mt-2">
                            {isHighRisk
                                ? 'Heightened risk flagged. Inspect telemetry and payment velocity.'
                                : 'Metrics are within nominal risk parameters.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
