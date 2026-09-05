import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    Trash2,
    ExternalLink,
    Clock,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';

import { Merchant, Verification, PaymentItem, Investigation } from '@/types';

import {
    getLatestMerchantVerifications,
    getVerificationHistory,
    getPaymentHistory,
    getInvestigation,
} from '@/lib/api';

import { RiskOverview } from '@/components/verification/RiskOverview';
import { VerificationCards } from '@/components/verification/VerificationCards';
import { TrustScoreChart } from '@/components/verification/TrustScoreChart';
import { VerificationHistoryTable } from '@/components/verification/VerificationHistoryTable';
import { InvestigationModal } from '@/components/verification/InvestigationModal';

import { PaymentSummaryCards } from '@/components/payments/PaymentSummaryCards';
import { PaymentMethodChart } from '@/components/payments/PaymentMethodChart';
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable';

import { DocumentSection } from '@/components/documents/DocumentSection';
import { DeleteMerchantModal } from '@/components/merchants/DeleteMerchantModal';

import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface MerchantDetailsPageProps {
    merchantId: string;
    onBack: () => void;
    onMerchantDeleted: () => void;
}

type InvestigationAction = 'APPROVE' | 'REJECT';

/**
 * Type guard used to safely narrow the generic string
 * coming from the Investigation type.
 */
function isInvestigationAction(
    action: string | undefined | null,
): action is InvestigationAction {
    return action === 'APPROVE' || action === 'REJECT';
}

export function MerchantDetailsPage({
    merchantId,
    onBack,
    onMerchantDeleted,
}: MerchantDetailsPageProps) {
    // ============================================================
    // Merchant / Verification / Payment State
    // ============================================================

    const [merchant, setMerchant] = useState<Merchant | null>(null);

    const [verifications, setVerifications] = useState<Verification[]>([]);

    const [payments, setPayments] = useState<PaymentItem[]>([]);

    // ============================================================
    // Loading States
    // ============================================================

    const [isLoadingMerchant, setIsLoadingMerchant] = useState(true);

    const [isLoadingVerifications, setIsLoadingVerifications] = useState(true);

    const [isLoadingPayments, setIsLoadingPayments] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // ============================================================
    // Investigation Status
    //
    // Maps:
    //
    // verificationId -> APPROVE / REJECT
    //
    // Example:
    //
    // {
    //   "verification-id-1": "APPROVE",
    //   "verification-id-2": "REJECT"
    // }
    // ============================================================

    const [investigationStatuses, setInvestigationStatuses] = useState<
        Record<string, InvestigationAction>
    >({});

    const [isLoadingInvestigationStatuses, setIsLoadingInvestigationStatuses] =
        useState(false);

    // ============================================================
    // Investigation Modal State
    // ============================================================

    const [selectedVerificationId, setSelectedVerificationId] = useState<
        string | null
    >(null);

    const [investigationData, setInvestigationData] =
        useState<Investigation | null>(null);

    const [isLoadingInvestigation, setIsLoadingInvestigation] = useState(false);

    const [investigationError, setInvestigationError] = useState<string | null>(
        null,
    );

    const [isInvestigationModalOpen, setIsInvestigationModalOpen] =
        useState(false);

    // ============================================================
    // Delete Modal State
    // ============================================================

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // ============================================================
    // Load Investigation Statuses
    //
    // Called after verification history has loaded because we need
    // the verification IDs to query the investigation API.
    //
    // Promise.allSettled() means one missing investigation does NOT
    // cause all the other investigation requests to fail.
    // ============================================================

    const loadInvestigationStatuses = useCallback(
        async (verificationList: Verification[]) => {
            if (verificationList.length === 0) {
                setInvestigationStatuses({});
                setIsLoadingInvestigationStatuses(false);
                return;
            }

            setIsLoadingInvestigationStatuses(true);

            try {
                const results = await Promise.allSettled(
                    verificationList.map(async (verification) => {
                        /**
                         * getInvestigation() already returns an Investigation
                         * object, so there is NO response.message / response.data
                         * wrapper here.
                         */
                        const investigation = await getInvestigation(
                            verification.id,
                        );

                        console.log(
                            'Investigation response:',
                            verification.id,
                            investigation,
                        );

                        const action = investigation?.action
                            ?.trim()
                            .toUpperCase();

                        /**
                         * Narrow the generic string to:
                         * 'APPROVE' | 'REJECT'
                         */
                        if (!isInvestigationAction(action)) {
                            return null;
                        }

                        return {
                            verificationId: verification.id,
                            action,
                        };
                    }),
                );

                const statuses: Record<string, InvestigationAction> = {};

                results.forEach((result) => {
                    if (result.status !== 'fulfilled') {
                        /**
                         * No investigation for this verification
                         * is perfectly valid.
                         */
                        return;
                    }

                    if (!result.value) {
                        return;
                    }

                    statuses[result.value.verificationId] = result.value.action;
                });

                console.log('FINAL INVESTIGATION STATUSES:', statuses);

                setInvestigationStatuses(statuses);
            } catch (error) {
                console.error('Failed to load investigation statuses:', error);
            } finally {
                setIsLoadingInvestigationStatuses(false);
            }
        },
        [],
    );

    // ============================================================
    // Load Merchant Details
    //
    // Merchant + verification + payments are started concurrently.
    //
    // Investigations start after verification history returns,
    // because verification IDs are required.
    // ============================================================

    const loadMerchantDetails = useCallback(async () => {
        setError(null);

        setIsLoadingMerchant(true);
        setIsLoadingVerifications(true);
        setIsLoadingPayments(true);

        setInvestigationStatuses({});
        setIsLoadingInvestigationStatuses(false);

        // ========================================================
        // START ALL INDEPENDENT REQUESTS CONCURRENTLY
        // ========================================================

        const merchantPromise = getLatestMerchantVerifications();

        const verificationPromise = getVerificationHistory(merchantId);

        const paymentPromise = getPaymentHistory(merchantId);

        // ========================================================
        // MERCHANT
        // ========================================================

        try {
            const allMerchants = await merchantPromise;

            const matched = allMerchants.find(
                (m) =>
                    m.merchant?.id === merchantId ||
                    m.verification?.merchantId === merchantId,
            );

            if (matched?.merchant) {
                setMerchant(matched.merchant);
            } else {
                // Fallback merchant object
                setMerchant({
                    id: merchantId,
                    businessName: 'Merchant Profile',
                    category: 'MERCHANT',
                    gstNumber: '',
                    websiteUrl: '',
                    phoneNumber: '',
                });
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to retrieve merchant profile.',
            );
        } finally {
            setIsLoadingMerchant(false);
        }

        // ========================================================
        // VERIFICATION HISTORY
        // ========================================================

        try {
            const verifData = await verificationPromise;

            setVerifications(verifData);

            // Start investigation lookups in the background.
            //
            // We intentionally don't await this here because
            // investigation status should not block the rest
            // of the page from rendering.
            void loadInvestigationStatuses(verifData);
        } catch (err: unknown) {
            console.warn('Failed to load verification history:', err);
        } finally {
            setIsLoadingVerifications(false);
        }

        // ========================================================
        // PAYMENT HISTORY
        // ========================================================

        try {
            const payData = await paymentPromise;

            setPayments(payData);
        } catch (err: unknown) {
            console.warn('Failed to load payment history:', err);
        } finally {
            setIsLoadingPayments(false);
        }
    }, [merchantId, loadInvestigationStatuses]);

    // ============================================================
    // Initial Load
    // ============================================================

    useEffect(() => {
        loadMerchantDetails();
    }, [loadMerchantDetails]);

    // ============================================================
    // Handle Investigate
    //
    // This is used when the user clicks the Investigate
    // button in the verification table.
    // ============================================================

    const handleInvestigate = async (verificationId: string) => {
        setSelectedVerificationId(verificationId);

        setIsInvestigationModalOpen(true);

        setIsLoadingInvestigation(true);

        setInvestigationError(null);

        setInvestigationData(null);

        try {
            /**
             * getInvestigation() already returns an Investigation.
             *
             * DO NOT use:
             * result.message
             * result.data
             *
             * because those properties belong to the HTTP response
             * wrapper, not the Investigation type.
             */
            const result = await getInvestigation(verificationId);

            setInvestigationData(result);

            // Keep table status synchronized with the modal result.
            const action = result.action?.trim().toUpperCase();

            if (isInvestigationAction(action)) {
                setInvestigationStatuses((previous) => ({
                    ...previous,
                    [verificationId]: action,
                }));
            }
        } catch (err: unknown) {
            setInvestigationError(
                err instanceof Error
                    ? err.message
                    : 'Failed to retrieve investigation telemetry.',
            );
        } finally {
            setIsLoadingInvestigation(false);
        }
    };

    // ============================================================
    // Latest Verification
    // ============================================================

    const latestVerification =
        verifications.length > 0
            ? [...verifications].sort(
                  (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
              )[0]
            : null;

    // ============================================================
    // Render
    // ============================================================

    return (
        <div className="space-y-8 pb-16 animate-in fade-in duration-200">
            {/* ================================================== */}
            {/* Navigation Top Bar */}
            {/* ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <button
                    type="button"
                    id="btn-back-to-merchants"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#71717A] hover:text-[#18181B] transition-colors py-1"
                >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                    Back to Merchants
                </button>

                <div className="flex items-center gap-2.5">
                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={loadMerchantDetails}
                        disabled={
                            isLoadingMerchant ||
                            isLoadingVerifications ||
                            isLoadingPayments ||
                            isLoadingInvestigationStatuses
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] transition-colors shadow-2xs"
                        title="Refresh details"
                    >
                        <RefreshCw
                            className={`w-3.5 h-3.5 text-[#71717A] ${
                                isLoadingMerchant ||
                                isLoadingVerifications ||
                                isLoadingPayments ||
                                isLoadingInvestigationStatuses
                                    ? 'animate-spin'
                                    : ''
                            }`}
                        />

                        <span>Refresh</span>
                    </button>

                    {/* Delete */}
                    <button
                        type="button"
                        id="btn-delete-merchant"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-600 bg-white hover:bg-red-50 active:bg-red-100 border border-red-200 rounded-md transition-colors shadow-2xs"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        Delete Merchant
                    </button>
                </div>
            </div>

            {/* ================================================== */}
            {/* Merchant Profile */}
            {/* ================================================== */}

            <div className="bg-white rounded-xl border border-[#E4E4E7] p-6 shadow-xs">
                {isLoadingMerchant ? (
                    <div className="space-y-4">
                        <Skeleton className="h-7 w-1/3" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />

                        <div>
                            <p className="font-semibold">
                                Unable to fetch complete merchant info
                            </p>

                            <p className="text-xs text-red-700 mt-0.5">
                                {error}
                            </p>
                        </div>
                    </div>
                ) : merchant ? (
                    <div>
                        {/* Merchant heading */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E4E4E7]">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-md bg-[#18181B] text-white flex items-center justify-center font-bold text-base tracking-tight shrink-0">
                                    {merchant.businessName
                                        ? merchant.businessName
                                              .charAt(0)
                                              .toUpperCase()
                                        : 'M'}
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold text-[#18181B] tracking-tight">
                                        {merchant.businessName ||
                                            'Unnamed Merchant'}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7] uppercase tracking-wider">
                                            {merchant.category || 'GENERAL'}
                                        </span>

                                        <span className="text-xs text-[#71717A] font-mono">
                                            ID: {merchant.id}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {merchant.createdAt && (
                                <div className="text-xs text-[#71717A] font-mono flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-[#A1A1AA]" />

                                    <span>
                                        Enrolled:{' '}
                                        {formatDate(merchant.createdAt)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Merchant Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                                    GST Number
                                </span>

                                <span className="text-sm font-mono font-semibold text-[#18181B]">
                                    {merchant.gstNumber || 'Not configured'}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                                    Website
                                </span>

                                {merchant.websiteUrl ? (
                                    <a
                                        href={
                                            merchant.websiteUrl.startsWith(
                                                'http',
                                            )
                                                ? merchant.websiteUrl
                                                : `https://${merchant.websiteUrl}`
                                        }
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="text-sm font-medium text-[#18181B] hover:underline inline-flex items-center gap-1 truncate max-w-full font-mono"
                                    >
                                        {merchant.websiteUrl}

                                        <ExternalLink className="w-3 h-3 shrink-0 text-[#71717A]" />
                                    </a>
                                ) : (
                                    <span className="text-sm text-[#A1A1AA] font-mono">
                                        Not provided
                                    </span>
                                )}
                            </div>

                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                                    Phone
                                </span>

                                <span className="text-sm font-mono font-semibold text-[#18181B]">
                                    {merchant.phoneNumber || 'Not provided'}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ================================================== */}
            {/* Risk Overview */}
            {/* ================================================== */}

            <RiskOverview
                latestVerification={latestVerification}
                isLoading={isLoadingVerifications}
            />

            {/* ================================================== */}
            {/* Verification Checks */}
            {/* ================================================== */}

            <VerificationCards
                latestVerification={latestVerification}
                gstNumber={merchant?.gstNumber}
                websiteUrl={merchant?.websiteUrl}
                phoneNumber={merchant?.phoneNumber}
            />

            {/* ================================================== */}
            {/* Trust Score Chart */}
            {/* ================================================== */}

            <TrustScoreChart
                verifications={verifications}
                isLoading={isLoadingVerifications}
            />

            {/* ================================================== */}
            {/* Verification History */}
            {/* ================================================== */}

            <VerificationHistoryTable
                verifications={verifications}
                isLoading={isLoadingVerifications}
                onInvestigate={handleInvestigate}
                investigationStatuses={investigationStatuses}
            />

            {/* ================================================== */}
            {/* Payments */}
            {/* ================================================== */}

            <div className="space-y-4 pt-2">
                <div>
                    <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                        Payments &amp; Financial Velocity
                    </h3>

                    <p className="text-xs text-slate-500">
                        Real-time aggregate transaction metrics and settlement
                        channels
                    </p>
                </div>

                <PaymentSummaryCards
                    payments={payments}
                    isLoading={isLoadingPayments}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-110">
                    <div className="lg:col-span-1 h-full min-h-0">
                        <PaymentMethodChart
                            payments={payments}
                            isLoading={isLoadingPayments}
                        />
                    </div>

                    <div className="lg:col-span-2 h-full min-h-0">
                        <PaymentHistoryTable
                            payments={payments}
                            isLoading={isLoadingPayments}
                        />
                    </div>
                </div>
            </div>

            {/* ================================================== */}
            {/* Documents */}
            {/* ================================================== */}

            <div className="pt-2">
                <DocumentSection merchantId={merchantId} />
            </div>

            {/* ================================================== */}
            {/* Investigation Modal */}
            {/* ================================================== */}

            <InvestigationModal
                isOpen={isInvestigationModalOpen}
                onClose={() => setIsInvestigationModalOpen(false)}
                investigation={investigationData}
                isLoading={isLoadingInvestigation}
                error={investigationError}
                verificationId={selectedVerificationId || undefined}
            />

            {/* ================================================== */}
            {/* Delete Merchant Modal */}
            {/* ================================================== */}

            {merchant && (
                <DeleteMerchantModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    merchantId={merchant.id}
                    businessName={merchant.businessName}
                    onSuccess={onMerchantDeleted}
                />
            )}
        </div>
    );
}
