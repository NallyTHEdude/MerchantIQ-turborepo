import React, { useRef, useState } from 'react';
import {
    Plus,
    RefreshCw,
    Upload,
    X,
    FileText,
    ShieldCheck,
    Loader2,
    AlertCircle,
} from 'lucide-react';

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
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [adminPassword, setAdminPassword] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const openUploadModal = () => {
        setUploadError(null);
        setUploadSuccess(null);
        setIsUploadModalOpen(true);
    };

    const closeUploadModal = () => {
        if (isUploading) return;

        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setAdminPassword('');
        setUploadError(null);
        setUploadSuccess(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        setSelectedFile(file);
        setUploadError(null);
        setUploadSuccess(null);
    };

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setUploadError(null);
        setUploadSuccess(null);

        if (!selectedFile) {
            setUploadError('Please select a government document.');
            return;
        }

        if (!adminPassword.trim()) {
            setUploadError('Please enter the admin password.');
            return;
        }

        setIsUploading(true);

        try {
            const backendUrl = import.meta.env.NEXT_PUBLIC_BACKEND_URL;

            if (!backendUrl) {
                throw new Error('Backend URL is not configured.');
            }

            const formData = new FormData();

            /*
             * The backend should receive the uploaded document
             * as the "file" multipart field.
             */
            formData.append('file', selectedFile);

            const response = await fetch(`${backendUrl}/api/document/govt`, {
                method: 'POST',
                headers: {
                    'x-admin-password': adminPassword,
                },
                body: formData,
            });

            let result: any = null;

            try {
                result = await response.json();
            } catch {
                // Response may not contain JSON.
            }

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                        result?.error ||
                        `Upload failed with status ${response.status}.`,
                );
            }

            setUploadSuccess(
                result?.message || 'Government document uploaded successfully.',
            );

            setSelectedFile(null);
            setAdminPassword('');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: unknown) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload government document.',
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            {/* =========================================================
                MERCHANT HEADER
            ========================================================= */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 bg-white border border-[#E4E4E7] rounded-xl shadow-xs">
                {/* Logo + Title */}
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#18181B] rounded-md flex items-center justify-center shrink-0">
                        <div className="w-3.5 h-3.5 border-2 border-white rotate-45" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#18181B]">
                            MerchantIQ - Merchant Risk Analyzer
                        </h1>

                        <p className="text-xs text-[#71717A] font-medium">
                            Merchant verification &amp; risk monitoring
                        </p>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                    {/* Refresh */}
                    <button
                        type="button"
                        id="btn-refresh-merchants"
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] active:bg-[#E4E4E7] disabled:opacity-50 transition-colors shadow-2xs"
                        title="Refresh merchant list"
                    >
                        <RefreshCw
                            className={`w-3.5 h-3.5 text-[#71717A] ${
                                isLoading ? 'animate-spin' : ''
                            }`}
                        />

                        <span>Refresh</span>
                    </button>

                    {/* Upload Government Document */}
                    <button
                        type="button"
                        id="btn-upload-government-document"
                        onClick={openUploadModal}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] active:bg-[#E4E4E7] transition-colors shadow-2xs"
                    >
                        <Upload className="w-3.5 h-3.5 text-[#71717A]" />

                        <span>Upload Government Document</span>
                    </button>

                    {/* Create Merchant */}
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

            {/* =========================================================
                GOVERNMENT DOCUMENT UPLOAD MODAL
            ========================================================= */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeUploadModal}
                    />

                    {/* Modal */}
                    <div
                        className="relative w-full max-w-md bg-white rounded-xl border border-[#E4E4E7] shadow-xl overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="government-upload-title"
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between px-5 py-4 border-b border-[#E4E4E7]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-[#18181B]" />
                                </div>

                                <div>
                                    <h2
                                        id="government-upload-title"
                                        className="text-sm font-semibold text-[#18181B]"
                                    >
                                        Upload Government Document
                                    </h2>

                                    <p className="text-xs text-[#71717A] mt-0.5">
                                        Add authoritative compliance evidence
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeUploadModal}
                                disabled={isUploading}
                                className="p-1.5 rounded-md text-[#71717A] hover:bg-[#F4F4F5] disabled:opacity-50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* =================================================
                            FORM
                        ================================================= */}
                        <form onSubmit={handleUpload}>
                            <div className="p-5 space-y-5">
                                {/* Government Document */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#18181B] mb-2">
                                        Government Document
                                    </label>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        className="hidden"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isUploading}
                                        className="w-full flex items-center gap-3 p-4 text-left bg-white border border-dashed border-[#D4D4D8] rounded-lg hover:bg-[#FAFAFA] hover:border-[#A1A1AA] transition-colors disabled:opacity-50"
                                    >
                                        <div className="w-10 h-10 rounded-md bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center shrink-0">
                                            {selectedFile ? (
                                                <FileText className="w-5 h-5 text-[#18181B]" />
                                            ) : (
                                                <Upload className="w-5 h-5 text-[#71717A]" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            {selectedFile ? (
                                                <>
                                                    <p className="text-xs font-semibold text-[#18181B] truncate">
                                                        {selectedFile.name}
                                                    </p>

                                                    <p className="text-[11px] text-[#71717A] mt-0.5">
                                                        {(
                                                            selectedFile.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{' '}
                                                        MB
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-xs font-semibold text-[#18181B]">
                                                        Click to select PDF
                                                    </p>

                                                    <p className="text-[11px] text-[#71717A] mt-0.5">
                                                        Upload an official
                                                        government compliance
                                                        document
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Admin Password */}
                                <div>
                                    <label
                                        htmlFor="admin-password"
                                        className="block text-xs font-semibold text-[#18181B] mb-2"
                                    >
                                        Enter Admin Password to Upload
                                    </label>

                                    <input
                                        id="admin-password"
                                        type="password"
                                        value={adminPassword}
                                        onChange={(event) => {
                                            setAdminPassword(
                                                event.target.value,
                                            );
                                            setUploadError(null);
                                        }}
                                        placeholder="Enter admin password"
                                        disabled={isUploading}
                                        className="w-full px-3 py-2.5 text-sm text-[#18181B] bg-white border border-[#E4E4E7] rounded-md outline-none focus:ring-2 focus:ring-[#18181B]/10 focus:border-[#18181B] disabled:opacity-50"
                                    />

                                    <p className="text-[11px] text-[#A1A1AA] mt-1.5">
                                        Admin authorization is required before
                                        uploading government evidence.
                                    </p>
                                </div>

                                {/* Error */}
                                {uploadError && (
                                    <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200">
                                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />

                                        <p className="text-xs text-red-700 leading-relaxed">
                                            {uploadError}
                                        </p>
                                    </div>
                                )}

                                {/* Success */}
                                {uploadSuccess && (
                                    <div className="flex items-start gap-2 p-3 rounded-md bg-green-50 border border-green-200">
                                        <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />

                                        <p className="text-xs text-green-700 leading-relaxed">
                                            {uploadSuccess}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2 px-5 py-4 bg-[#FAFAFA] border-t border-[#E4E4E7]">
                                <button
                                    type="button"
                                    onClick={closeUploadModal}
                                    disabled={isUploading}
                                    className="px-3 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isUploading ||
                                        !selectedFile ||
                                        !adminPassword.trim()
                                    }
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#27272A] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                >
                                    {isUploading && (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    )}

                                    {isUploading
                                        ? 'Uploading...'
                                        : 'Submit & Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
