import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { deleteMerchant } from '@/lib/api';

interface DeleteMerchantModalProps {
    isOpen: boolean;
    onClose: () => void;
    merchantId: string;
    businessName: string;
    onSuccess: () => void;
}

export function DeleteMerchantModal({
    isOpen,
    onClose,
    merchantId,
    businessName,
    onSuccess,
}: DeleteMerchantModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await deleteMerchant(merchantId);
            onSuccess();
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete merchant. Please try again.',
            );
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={isDeleting ? () => {} : onClose}
            title="Delete Merchant?"
            maxWidth="md"
            id="modal-delete-merchant"
        >
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold">
                            Are you sure you want to delete{' '}
                            <span className="underline">
                                {businessName || 'this merchant'}
                            </span>
                            ?
                        </p>
                        <p className="text-xs text-rose-700 mt-1">
                            This action cannot be undone. All associated
                            verifications, risk telemetry, and merchant records
                            will be removed.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-rose-100 border border-rose-300 rounded-lg text-xs text-rose-800 font-medium">
                        {error}
                    </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        id="btn-confirm-delete-merchant"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-60 rounded-lg shadow-xs transition-colors"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Merchant'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
