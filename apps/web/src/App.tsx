import React, { useState, useEffect, useCallback } from 'react';
import { getLatestMerchantVerifications } from '@/lib/api';
import { MerchantWithVerification } from '@/types';
import { BackendBanner } from '@/components/ui/BackendBanner';
import { MerchantHeader } from '@/components/merchants/MerchantHeader';
import { MerchantSummaryCards } from '@/components/merchants/MerchantSummaryCards';
import { MerchantTable } from '@/components/merchants/MerchantTable';
import { CreateMerchantModal } from '@/components/merchants/CreateMerchantModal';
import { MerchantDetailsPage } from '@/components/merchants/MerchantDetailsPage';

export default function App() {
    // Routing state: only 2 pages: '/' or '/merchant/:merchantId'
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

    // Dashboard state
    const [merchants, setMerchants] = useState<MerchantWithVerification[]>([]);
    const [isLoadingMerchants, setIsLoadingMerchants] = useState(true);
    const [merchantsError, setMerchantsError] = useState<string | null>(null);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Sync browser URL with popstate
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
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Navigation helpers
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

    // Fetch all latest verifications for dashboard
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

    // Handle successful merchant creation
    const handleMerchantCreated = (newMerchantId: string) => {
        setIsCreateModalOpen(false);
        fetchMerchants();
        navigateToMerchant(newMerchantId);
    };

    // Handle merchant deletion
    const handleMerchantDeleted = () => {
        navigateToDashboard();
        fetchMerchants();
    };

    return (
        <div className="min-h-screen bg-[#F4F4F5] text-[#18181B] flex flex-col font-sans selection:bg-[#18181B] selection:text-white">
            {/* Backend API Configuration & Health Banner */}
            <BackendBanner onBackendUrlChanged={fetchMerchants} />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {currentMerchantId ? (
                    /* PAGE 2 — Merchant Details /merchant/:merchantId */
                    <MerchantDetailsPage
                        merchantId={currentMerchantId}
                        onBack={navigateToDashboard}
                        onMerchantDeleted={handleMerchantDeleted}
                    />
                ) : (
                    /* PAGE 1 — Merchant Dashboard / */
                    <div className="space-y-6 animate-in fade-in duration-150">
                        {/* Page 1 Header */}
                        <MerchantHeader
                            onCreateClick={() => setIsCreateModalOpen(true)}
                            onRefresh={fetchMerchants}
                            isLoading={isLoadingMerchants}
                        />

                        {/* Calculated Summary Cards */}
                        <MerchantSummaryCards
                            merchants={merchants}
                            isLoading={isLoadingMerchants}
                        />

                        {/* Primary Merchant Table */}
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

            {/* Technical Status Footer from Recipe 1 */}
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

            {/* Modal: Create Merchant Flow (Sequential Execution) */}
            <CreateMerchantModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleMerchantCreated}
            />
        </div>
    );
}
