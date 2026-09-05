import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Lock, X, CheckCircle2, AlertCircle } from 'lucide-react';

import { getLatestMerchantVerifications } from '@/lib/api';
import { MerchantWithVerification } from '@/types';

import { MerchantHeader } from '@/components/merchants/MerchantHeader';
import { MerchantSummaryCards } from '@/components/merchants/MerchantSummaryCards';
import { MerchantTable } from '@/components/merchants/MerchantTable';
import { CreateMerchantModal } from '@/components/merchants/CreateMerchantModal';
import { MerchantDetailsPage } from '@/components/merchants/MerchantDetailsPage';

export default function App() {
    // =========================================================
    // ROUTING
    // =========================================================

    const [currentMerchantId, setCurrentMerchantId] = useState<string | null>(
        () => {
            if (typeof window !== 'undefined') {
                const path = window.location.pathname;
                const match = path.match(/^\/merchant\/([^/]+)/);

                if (match && match[1]) {
                    return decodeURIComponent(match[1]);
                }
            }

            return null;
        },
    );

    // =========================================================
    // DASHBOARD STATE
    // =========================================================

    const [merchants, setMerchants] = useState<MerchantWithVerification[]>([]);

    const [isLoadingMerchants, setIsLoadingMerchants] = useState(true);

    const [merchantsError, setMerchantsError] = useState<string | null>(null);

    // =========================================================
    // CREATE MERCHANT MODAL
    // =========================================================

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // =========================================================
    // GOVERNMENT DOCUMENT UPLOAD
    // =========================================================

    const [isGovtUploadModalOpen, setIsGovtUploadModalOpen] = useState(false);

    const [adminPassword, setAdminPassword] = useState('');

    const [isUploadingGovernmentDocument, setIsUploadingGovernmentDocument] =
        useState(false);

    const [governmentUploadError, setGovernmentUploadError] = useState<
        string | null
    >(null);

    const [governmentUploadSuccess, setGovernmentUploadSuccess] =
        useState(false);

    // =========================================================
    // SYNC BROWSER URL WITH POPSTATE
    // =========================================================

    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            const match = path.match(/^\/merchant\/([^/]+)/);

            if (match && match[1]) {
                setCurrentMerchantId(decodeURIComponent(match[1]));
            } else {
                setCurrentMerchantId(null);
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // =========================================================
    // NAVIGATION
    // =========================================================

    const navigateToMerchant = (merchantId: string) => {
        setCurrentMerchantId(merchantId);

        if (window.location.pathname !== `/merchant/${merchantId}`) {
            window.history.pushState(
                {},
                '',
                `/merchant/${encodeURIComponent(merchantId)}`,
            );
        }
    };

    const navigateToDashboard = () => {
        setCurrentMerchantId(null);

        if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
        }
    };

    // =========================================================
    // FETCH MERCHANTS
    // =========================================================

    const fetchMerchants = useCallback(async () => {
        setIsLoadingMerchants(true);
        setMerchantsError(null);

        try {
            const data = await getLatestMerchantVerifications();

            setMerchants(data);
        } catch (err: unknown) {
            setMerchantsError(
                err instanceof Error
                    ? err.message
                    : 'Unable to connect to backend service.',
            );
        } finally {
            setIsLoadingMerchants(false);
        }
    }, []);

    useEffect(() => {
        fetchMerchants();
    }, [fetchMerchants]);

    // =========================================================
    // MERCHANT CREATED
    // =========================================================

    const handleMerchantCreated = (_newMerchantId: string) => {
        /*
         * The merchant has been successfully created.
         *
         * Do NOT close the modal here.
         * Do NOT navigate to the merchant details page here.
         *
         * The CreateMerchantModal will remain open so the user
         * can watch the remaining setup pipeline if they want to.
         *
         * The modal can be closed manually by clicking the X,
         * Cancel, or outside the modal.
         */
        fetchMerchants();
    };

    // =========================================================
    // MERCHANT DELETED
    // =========================================================

    const handleMerchantDeleted = () => {
        navigateToDashboard();
        fetchMerchants();
    };

    // =========================================================
    // OPEN GOVERNMENT UPLOAD MODAL
    // =========================================================

    const openGovernmentUploadModal = () => {
        setAdminPassword('');
        setGovernmentUploadError(null);
        setGovernmentUploadSuccess(false);
        setIsGovtUploadModalOpen(true);
    };

    // =========================================================
    // CLOSE GOVERNMENT UPLOAD MODAL
    // =========================================================

    const closeGovernmentUploadModal = () => {
        if (isUploadingGovernmentDocument) {
            return;
        }

        setIsGovtUploadModalOpen(false);
        setAdminPassword('');
        setGovernmentUploadError(null);
        setGovernmentUploadSuccess(false);
    };

    // =========================================================
    // UPLOAD GOVERNMENT DOCUMENT
    // =========================================================

    const handleGovernmentDocumentUpload = async () => {
        if (!adminPassword.trim()) {
            setGovernmentUploadError('Please enter the admin password.');
            return;
        }

        setIsUploadingGovernmentDocument(true);
        setGovernmentUploadError(null);
        setGovernmentUploadSuccess(false);

        try {
            const response = await fetch(
                'http://localhost:4000/api/document/govt',
                {
                    method: 'POST',
                    headers: {
                        'x-admin-password': adminPassword.trim(),
                    },
                },
            );

            /*
             * Backend should return 401/403 when the
             * password is incorrect.
             */

            if (response.status === 401 || response.status === 403) {
                setGovernmentUploadError('Invalid admin password.');
                return;
            }

            if (!response.ok) {
                let errorMessage = 'Failed to upload government document.';

                try {
                    const errorData = await response.json();

                    errorMessage =
                        errorData?.message || errorData?.error || errorMessage;
                } catch {
                    // Ignore invalid/non-JSON response
                }

                throw new Error(errorMessage);
            }

            setGovernmentUploadSuccess(true);
            setAdminPassword('');
        } catch (error) {
            setGovernmentUploadError(
                error instanceof Error
                    ? error.message
                    : 'Unable to upload government document.',
            );
        } finally {
            setIsUploadingGovernmentDocument(false);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="min-h-screen bg-[#F4F4F5] text-[#18181B] flex flex-col font-sans selection:bg-[#18181B] selection:text-white">
            {/* Backend API Configuration & Health Banner */}

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {currentMerchantId ? (
                    /* =================================================
                     * PAGE 2 — MERCHANT DETAILS
                     * ================================================= */

                    <MerchantDetailsPage
                        merchantId={currentMerchantId}
                        onBack={navigateToDashboard}
                        onMerchantDeleted={handleMerchantDeleted}
                    />
                ) : (
                    /* =================================================
                     * PAGE 1 — DASHBOARD
                     * ================================================= */

                    <div className="space-y-6 animate-in fade-in duration-150">
                        {/* Page Header */}
                        <MerchantHeader
                            onCreateClick={() => setIsCreateModalOpen(true)}
                            onRefresh={fetchMerchants}
                            isLoading={isLoadingMerchants}
                        />

                        {/* Summary Cards */}
                        <MerchantSummaryCards
                            merchants={merchants}
                            isLoading={isLoadingMerchants}
                        />

                        {/* Merchant Table */}
                        <MerchantTable
                            merchants={merchants}
                            isLoading={isLoadingMerchants}
                            error={merchantsError}
                            onRetry={fetchMerchants}
                            onSelectMerchant={navigateToMerchant}
                            onCreateClick={() => setIsCreateModalOpen(true)}
                        />
                    </div>
                )}
            </main>

            {/* =====================================================
             * FOOTER
             * ===================================================== */}

            <footer className="px-6 py-2.5 bg-white border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#A1A1AA] uppercase tracking-widest font-mono gap-2 mt-auto">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>System Status: Healthy &amp; Active</span>
                </div>

                <div className="flex items-center gap-4">
                    <span>Node ID: FRA-01-VX</span>

                    <span>Security Engine: v2.4.0</span>
                </div>
            </footer>

            {/* =====================================================
             * CREATE MERCHANT MODAL
             * ===================================================== */}

            <CreateMerchantModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleMerchantCreated}
            />

            {/* =====================================================
             * GOVERNMENT DOCUMENT ADMIN MODAL
             * ===================================================== */}

            {isGovtUploadModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    onMouseDown={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            !isUploadingGovernmentDocument
                        ) {
                            closeGovernmentUploadModal();
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-xl border border-[#E4E4E7] shadow-xl overflow-hidden"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-5 border-b border-[#E4E4E7] flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7]">
                                    <Lock className="w-4 h-4 text-[#18181B]" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[#18181B]">
                                        Upload Government Document
                                    </h3>

                                    <p className="text-xs text-[#71717A] mt-1">
                                        Admin authentication is required before
                                        uploading government compliance data.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeGovernmentUploadModal}
                                disabled={isUploadingGovernmentDocument}
                                className="p-1.5 rounded-md text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B] transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {!governmentUploadSuccess ? (
                                <>
                                    <div>
                                        <label
                                            htmlFor="admin-password"
                                            className="block text-xs font-semibold text-[#18181B] mb-1.5"
                                        >
                                            Enter Admin Password to Upload
                                        </label>

                                        <input
                                            id="admin-password"
                                            type="password"
                                            value={adminPassword}
                                            onChange={(e) => {
                                                setAdminPassword(
                                                    e.target.value,
                                                );

                                                if (governmentUploadError) {
                                                    setGovernmentUploadError(
                                                        null,
                                                    );
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleGovernmentDocumentUpload();
                                                }
                                            }}
                                            placeholder="Enter admin password"
                                            autoFocus
                                            disabled={
                                                isUploadingGovernmentDocument
                                            }
                                            className="w-full px-3 py-2 text-sm text-[#18181B] bg-white border border-[#E4E4E7] rounded-md outline-none focus:ring-2 focus:ring-[#18181B]/10 focus:border-[#18181B] disabled:bg-[#F4F4F5] disabled:text-[#A1A1AA]"
                                        />
                                    </div>

                                    {/* Error */}
                                    {governmentUploadError && (
                                        <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
                                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />

                                            <p className="text-xs">
                                                {governmentUploadError}
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeGovernmentUploadModal}
                                            disabled={
                                                isUploadingGovernmentDocument
                                            }
                                            className="px-3 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                handleGovernmentDocumentUpload
                                            }
                                            disabled={
                                                isUploadingGovernmentDocument ||
                                                !adminPassword.trim()
                                            }
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#18181B] rounded-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploadingGovernmentDocument ? (
                                                <>
                                                    <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-3.5 h-3.5" />
                                                    Submit
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* Success State */
                                <div className="py-5 text-center">
                                    <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600 border border-green-200 mb-3">
                                        <CheckCircle2 className="w-7 h-7" />
                                    </div>

                                    <h4 className="text-sm font-semibold text-[#18181B]">
                                        Government Document Uploaded
                                    </h4>

                                    <p className="text-xs text-[#71717A] mt-1">
                                        The government compliance document was
                                        successfully submitted.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={closeGovernmentUploadModal}
                                        className="mt-5 px-4 py-2 text-xs font-semibold bg-[#18181B] text-white hover:bg-black rounded-md transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
