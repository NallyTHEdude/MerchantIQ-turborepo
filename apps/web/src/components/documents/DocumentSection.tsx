import React, { useState } from 'react';
import {
    FileText,
    ExternalLink,
    Upload,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Building,
    Landmark,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
    uploadMerchantDocument,
    // uploadGovernmentDocument,
} from '@/lib/api';
import { formatBytes, formatDateTime } from '@/lib/utils';
import { UploadedDocInfo } from '@/types';

interface DocumentSectionProps {
    merchantId: string;
}

export function DocumentSection({ merchantId }: DocumentSectionProps) {
    // We keep track of documents uploaded during this session or passed
    const [documents, setDocuments] = useState<UploadedDocInfo[]>(() => {
        // Check localStorage for previously uploaded docs for this merchant to maintain seamless experience
        try {
            const stored = localStorage.getItem(`docs_${merchantId}`);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [isUploadingMerchantDoc, setIsUploadingMerchantDoc] = useState(false);
    // const [isUploadingGovtDoc, setIsUploadingGovtDoc] = useState(false);
    const [merchantDocError, setMerchantDocError] = useState<string | null>(
        null,
    );
    // const [govtDocError, setGovtDocError] = useState<string | null>(null);

    const saveDoc = (newDoc: UploadedDocInfo) => {
        setDocuments((prev) => {
            const updated = [newDoc, ...prev];
            try {
                localStorage.setItem(
                    `docs_${merchantId}`,
                    JSON.stringify(updated),
                );
            } catch {}
            return updated;
        });
    };

    const handleUploadMerchantDoc = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMerchantDocError(null);
        setIsUploadingMerchantDoc(true);

        try {
            const res = await uploadMerchantDocument(merchantId, file);
            saveDoc({
                type: 'merchant',
                publicId: res.publicId,
                secureUrl: res.secureUrl,
                format: res.format || 'pdf',
                bytes: res.bytes || file.size,
                uploadedAt: new Date().toISOString(),
                fileName: file.name,
            });
        } catch (err: unknown) {
            setMerchantDocError(
                err instanceof Error
                    ? err.message
                    : 'Failed to upload document',
            );
        } finally {
            setIsUploadingMerchantDoc(false);
            e.target.value = '';
        }
    };

    // const handleUploadGovtDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const file = e.target.files?.[0];
    //   if (!file) return;
    //   setGovtDocError(null);
    //   setIsUploadingGovtDoc(true);
    //
    //   try {
    //     const res = await uploadGovernmentDocument(file);
    //     saveDoc({
    //       type: 'government',
    //       publicId: res.publicId,
    //       secureUrl: res.secureUrl,
    //       format: res.format || 'pdf',
    //       bytes: res.bytes || file.size,
    //       uploadedAt: new Date().toISOString(),
    //       fileName: file.name,
    //     });
    //   } catch (err: unknown) {
    //     setGovtDocError(err instanceof Error ? err.message : 'Failed to upload document');
    //   } finally {
    //     setIsUploadingGovtDoc(false);
    //     e.target.value = '';
    //   }
    // };

    const merchantDocs = documents.filter((d) => d.type === 'merchant');
    // const govtDocs = documents.filter((d) => d.type === 'government');

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-semibold text-[#18181B] tracking-tight">
                        Compliance &amp; Verification Documents
                    </h3>
                    <p className="text-xs text-[#71717A]">
                        Secure cloud-stored merchant credentials and government
                        registry records
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Merchant Documents */}
                <div
                    id="section-merchant-documents"
                    className="bg-white rounded-xl border border-[#E4E4E7] shadow-xs flex flex-col justify-between overflow-hidden"
                >
                    <div>
                        <div className="p-4 sm:p-5 border-b border-[#E4E4E7] flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7] rounded-md">
                                    <Building className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-[#18181B]">
                                        Merchant Documents
                                    </h4>
                                    <p className="text-[11px] text-[#71717A]">
                                        Business incorporation, license, or
                                        bills
                                    </p>
                                </div>
                            </div>

                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] shadow-2xs transition-colors">
                                {isUploadingMerchantDoc ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#71717A]" />
                                ) : (
                                    <Upload className="w-3.5 h-3.5 text-[#71717A]" />
                                )}
                                <span>
                                    {isUploadingMerchantDoc
                                        ? 'Uploading...'
                                        : 'Upload PDF'}
                                </span>
                                <input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={handleUploadMerchantDoc}
                                    disabled={isUploadingMerchantDoc}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="p-4 sm:p-5">
                            {merchantDocError && (
                                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                    <span>{merchantDocError}</span>
                                </div>
                            )}

                            {merchantDocs.length === 0 ? (
                                <div className="py-8 text-center border border-dashed border-[#E4E4E7] rounded-lg text-[#71717A]">
                                    <FileText className="w-7 h-7 mx-auto mb-1 text-[#A1A1AA]" />
                                    <p className="text-xs font-medium text-[#18181B]">
                                        No merchant documents registered
                                    </p>
                                    <p className="text-[11px] text-[#71717A] mt-0.5">
                                        Upload a PDF document to attach to this
                                        merchant record.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#F4F4F5] border border-[#E4E4E7] rounded-lg overflow-hidden">
                                    {merchantDocs.map((doc, idx) => (
                                        <div
                                            key={doc.publicId || idx}
                                            className="p-3 bg-white hover:bg-[#F9FAFB] transition-colors flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <FileText className="w-4 h-4 text-red-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-[#18181B] truncate">
                                                        {doc.fileName ||
                                                            doc.publicId ||
                                                            'Merchant Document (PDF)'}
                                                    </p>
                                                    <p className="text-[10px] text-[#71717A] font-mono">
                                                        {formatBytes(doc.bytes)}{' '}
                                                        •{' '}
                                                        {formatDateTime(
                                                            doc.uploadedAt,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <a
                                                href={doc.secureUrl}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#18181B] hover:bg-[#E4E4E7] bg-[#F4F4F5] rounded-md border border-[#E4E4E7] shrink-0 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3 text-[#71717A]" />
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Government Documents */}
                {/*
        <div id="section-government-documents" className="bg-white rounded-xl border border-[#E4E4E7] shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 sm:p-5 border-b border-[#E4E4E7] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7] rounded-md">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#18181B]">Government Documents</h4>
                  <p className="text-[11px] text-[#71717A]">
                    Official tax certificates &amp; compliance forms
                  </p>
                </div>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] shadow-2xs transition-colors">
                {isUploadingGovtDoc ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#71717A]" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#71717A]" />
                )}
                <span>{isUploadingGovtDoc ? 'Uploading...' : 'Upload PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleUploadGovtDoc}
                  disabled={isUploadingGovtDoc}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 sm:p-5">
              {govtDocError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{govtDocError}</span>
                </div>
              )}

              {govtDocs.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#E4E4E7] rounded-lg text-[#71717A]">
                  <Landmark className="w-7 h-7 mx-auto mb-1 text-[#A1A1AA]" />
                  <p className="text-xs font-medium text-[#18181B]">No government documents</p>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Upload official PDF certifications under 10 MB.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F4F4F5] border border-[#E4E4E7] rounded-lg overflow-hidden">
                  {govtDocs.map((doc, idx) => (
                    <div
                      key={doc.publicId || idx}
                      className="p-3 bg-white hover:bg-[#F9FAFB] transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#18181B] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#18181B] truncate">
                            {doc.fileName || doc.publicId || 'Government Document (PDF)'}
                          </p>
                          <p className="text-[10px] text-[#71717A] font-mono">
                            {formatBytes(doc.bytes)} • {formatDateTime(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>

                      <a
                        href={doc.secureUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#18181B] hover:bg-[#E4E4E7] bg-[#F4F4F5] rounded-md border border-[#E4E4E7] shrink-0 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-[#71717A]" />
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        */}
            </div>
        </div>
    );
}
