import React from 'react';
import { Plus, ShieldCheck, RefreshCw } from 'lucide-react';

interface MerchantHeaderProps {
    onCreateClick: () => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

export function MerchantHeader({
    onCreateClick,
    onRefresh,
    isLoading,
}: MerchantHeaderProps) {
    return (
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 bg-white border border-[#E4E4E7] rounded-xl shadow-xs">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#18181B] rounded-md flex items-center justify-center shrink-0">
                    <div className="w-3.5 h-3.5 border-2 border-white rotate-45" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#18181B]">
                        Merchant Risk Analyzer
                    </h1>
                    <p className="text-xs text-[#71717A] font-medium">
                        Merchant verification &amp; risk monitoring
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    id="btn-refresh-merchants"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] active:bg-[#E4E4E7] disabled:opacity-50 transition-colors shadow-2xs"
                    title="Refresh merchant list"
                >
                    <RefreshCw
                        className={`w-3.5 h-3.5 text-[#71717A] ${isLoading ? 'animate-spin' : ''}`}
                    />
                    <span>Refresh</span>
                </button>

                <button
                    type="button"
                    id="btn-create-merchant"
                    onClick={onCreateClick}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#18181B] hover:bg-[#27272A] active:bg-black rounded-md shadow-2xs transition-colors"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Create Merchant
                </button>
            </div>
        </header>
    );
}
