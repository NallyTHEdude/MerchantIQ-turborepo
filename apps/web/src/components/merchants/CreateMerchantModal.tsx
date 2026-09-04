import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import {
  createMerchant,
  createPayments,
  uploadMerchantDocument,
  uploadGovernmentDocument,
} from '@/lib/api';
import { CreatePaymentDto } from '@/types';

interface CreateMerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMerchantId: string) => void;
}

type StepStatus = 'pending' | 'active' | 'success' | 'failed';

interface SequenceStep {
  id: 'merchant' | 'payments' | 'merchantDoc' | 'govtDoc' | 'finishing';
  label: string;
  status: StepStatus;
  error?: string;
}

const SAMPLE_PAYMENTS: CreatePaymentDto[] = [
  {
    amount: 2499,
    status: 'SUCCESS',
    paymentMethod: 'UPI',
    isInternational: false,
  },
  {
    amount: 18999,
    status: 'SUCCESS',
    paymentMethod: 'CARD',
    isInternational: false,
  },
  {
    amount: 750,
    status: 'SUCCESS',
    paymentMethod: 'UPI',
    isInternational: false,
  },
  {
    amount: 45000,
    status: 'FAILED',
    paymentMethod: 'CARD',
    isInternational: true,
  },
];

export function CreateMerchantModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMerchantModalProps) {
  // Merchant Form fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('ELECTRONICS');
  const [gstNumber, setGstNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Payment JSON state
  const [paymentData, setPaymentData] = useState<CreatePaymentDto[] | null>(null);
  const [paymentFileName, setPaymentFileName] = useState<string>('');
  const [paymentJsonError, setPaymentJsonError] = useState<string | null>(null);

  // Document files
  const [merchantDocFile, setMerchantDocFile] = useState<File | null>(null);
  const [govtDocFile, setGovtDocFile] = useState<File | null>(null);
  const [merchantDocError, setMerchantDocError] = useState<string | null>(null);
  const [govtDocError, setGovtDocError] = useState<string | null>(null);

  // Sequence execution state
  const [isRunningSequence, setIsRunningSequence] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [steps, setSteps] = useState<SequenceStep[]>([
    { id: 'merchant', label: 'Creating merchant', status: 'pending' },
    { id: 'payments', label: 'Uploading payment data', status: 'pending' },
    { id: 'merchantDoc', label: 'Uploading merchant document', status: 'pending' },
    { id: 'govtDoc', label: 'Uploading government document', status: 'pending' },
    { id: 'finishing', label: 'Finishing', status: 'pending' },
  ]);

  if (!isOpen) return null;

  // Handle Payment JSON file selection & validation
  const handlePaymentJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentJsonError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setPaymentJsonError('Please upload a valid .json file');
      setPaymentData(null);
      setPaymentFileName('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          setPaymentJsonError('Invalid format: JSON file must contain an array of payment objects.');
          setPaymentData(null);
          return;
        }

        if (parsed.length === 0) {
          setPaymentJsonError('Payments array cannot be empty.');
          setPaymentData(null);
          return;
        }

        // Validate objects
        const validated: CreatePaymentDto[] = [];
        for (let i = 0; i < parsed.length; i++) {
          const item = parsed[i];
          if (
            typeof item !== 'object' ||
            item === null ||
            item.amount === undefined ||
            item.status === undefined ||
            item.paymentMethod === undefined
          ) {
            setPaymentJsonError(
              `Item #${i + 1} is missing required fields (amount, status, paymentMethod).`
            );
            setPaymentData(null);
            return;
          }

          const amountNum = typeof item.amount === 'string' ? parseFloat(item.amount) : Number(item.amount);
          if (isNaN(amountNum) || amountNum < 0) {
            setPaymentJsonError(`Item #${i + 1} has an invalid payment amount.`);
            setPaymentData(null);
            return;
          }

          validated.push({
            amount: amountNum,
            status: String(item.status).toUpperCase(),
            paymentMethod: String(item.paymentMethod).toUpperCase(),
            isInternational: Boolean(item.isInternational),
          });
        }

        setPaymentData(validated);
        setPaymentFileName(file.name);
        setPaymentJsonError(null);
      } catch (err: unknown) {
        setPaymentJsonError(`Failed to parse JSON: ${err instanceof Error ? err.message : 'Syntax error'}`);
        setPaymentData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleUseSamplePayments = () => {
    setPaymentData(SAMPLE_PAYMENTS);
    setPaymentFileName('sample-payments-dataset.json');
    setPaymentJsonError(null);
  };

  // Document validation
  const handleMerchantDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMerchantDocError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMerchantDocError('Only PDF files are allowed.');
      setMerchantDocFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMerchantDocError('File size exceeds the 10 MB maximum limit.');
      setMerchantDocFile(null);
      return;
    }
    setMerchantDocFile(file);
  };

  const handleGovtDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGovtDocError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setGovtDocError('Only PDF files are allowed.');
      setGovtDocFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setGovtDocError('File size exceeds the 10 MB maximum limit.');
      setGovtDocFile(null);
      return;
    }
    setGovtDocFile(file);
  };

  // Sequential Execution
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Initial validations
    if (!businessName.trim()) {
      setGeneralError('Please enter a valid business name.');
      return;
    }
    if (!gstNumber.trim()) {
      setGeneralError('Please enter a valid GST Number.');
      return;
    }
    if (!websiteUrl.trim()) {
      setGeneralError('Please enter a website URL.');
      return;
    }
    if (!phoneNumber.trim()) {
      setGeneralError('Please enter a phone number.');
      return;
    }
    if (!paymentData || paymentData.length === 0) {
      setPaymentJsonError('Please upload a valid payments JSON file or load the sample dataset.');
      return;
    }
    if (!merchantDocFile) {
      setMerchantDocError('Please select a merchant PDF document.');
      return;
    }
    if (!govtDocFile) {
      setGovtDocError('Please select a government compliance PDF document.');
      return;
    }

    setIsRunningSequence(true);

    const updateStep = (id: SequenceStep['id'], status: StepStatus, errorMsg?: string) => {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === id ? { ...step, status, error: errorMsg } : step
        )
      );
    };

    // Reset steps
    setSteps([
      { id: 'merchant', label: 'Creating merchant', status: 'pending' },
      { id: 'payments', label: 'Uploading payment data', status: 'pending' },
      { id: 'merchantDoc', label: 'Uploading merchant document', status: 'pending' },
      { id: 'govtDoc', label: 'Uploading government document', status: 'pending' },
      { id: 'finishing', label: 'Finishing', status: 'pending' },
    ]);

    let createdMerchantId = '';

    try {
      // Step 1: POST /api/merchant
      updateStep('merchant', 'active');
      const merchantRes = await createMerchant({
        businessName: businessName.trim(),
        category: category.trim(),
        gstNumber: gstNumber.trim(),
        websiteUrl: websiteUrl.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      createdMerchantId = merchantRes.merchantId;
      if (!createdMerchantId) {
        throw new Error('Merchant was created but backend returned no merchant ID.');
      }
      updateStep('merchant', 'success');

      // Step 2 & 3: POST /api/payment/:merchantId
      updateStep('payments', 'active');
      await createPayments(createdMerchantId, paymentData);
      updateStep('payments', 'success');

      // Step 4: POST /api/document/:merchantId
      updateStep('merchantDoc', 'active');
      await uploadMerchantDocument(createdMerchantId, merchantDocFile);
      updateStep('merchantDoc', 'success');

      // Step 5: POST /api/document/govt
      updateStep('govtDoc', 'active');
      await uploadGovernmentDocument(govtDocFile);
      updateStep('govtDoc', 'success');

      // Step 6: Finishing
      updateStep('finishing', 'active');
      await new Promise((resolve) => setTimeout(resolve, 600));
      updateStep('finishing', 'success');

      // Done!
      setTimeout(() => {
        onSuccess(createdMerchantId);
      }, 500);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Operation failed';
      setGeneralError(`Unable to complete merchant setup: ${errMsg}`);

      // Mark whichever active step as failed
      setSteps((prev) =>
        prev.map((step) =>
          step.status === 'active' ? { ...step, status: 'failed', error: errMsg } : step
        )
      );
    } finally {
      setIsRunningSequence(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRunningSequence) onClose();
      }}
    >
      <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7] bg-white">
          <div>
            <h2 className="text-base font-semibold text-[#18181B] tracking-tight">Create Merchant</h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Set up merchant profile, initial payment history, and compliance documents
            </p>
          </div>
          {!isRunningSequence && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#71717A] hover:text-[#18181B] rounded-md hover:bg-[#F4F4F5] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Display (if sequence started or active) */}
        {steps.some((s) => s.status !== 'pending') && (
          <div className="px-6 py-4 bg-[#18181B] text-white border-b border-[#27272A]">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2 font-mono">
              Setup Pipeline
            </h4>
            <div className="space-y-2">
              {steps.map((step) => {
                let icon = <span className="text-[#71717A]">○</span>;
                let textClass = 'text-[#A1A1AA]';

                if (step.status === 'active') {
                  icon = <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />;
                  textClass = 'text-white font-semibold';
                } else if (step.status === 'success') {
                  icon = <Check className="w-3.5 h-3.5 text-emerald-400" />;
                  textClass = 'text-emerald-400';
                } else if (step.status === 'failed') {
                  icon = <X className="w-3.5 h-3.5 text-red-400" />;
                  textClass = 'text-red-400 font-semibold';
                }

                return (
                  <div key={step.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
                      <span className={textClass}>{step.label}</span>
                    </div>
                    {step.status === 'success' && (
                      <span className="text-emerald-400 font-mono text-[11px]">✓</span>
                    )}
                    {step.status === 'failed' && (
                      <span className="text-red-400 font-mono text-[11px]">✕</span>
                    )}
                  </div>
                );
              })}
            </div>
            {generalError && (
              <div className="mt-3 p-2.5 bg-red-950/80 border border-red-800 rounded text-red-200 text-xs">
                {generalError}
              </div>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Section 1: Merchant Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#F4F4F5] text-[#18181B] text-xs font-mono font-bold inline-flex items-center justify-center border border-[#E4E4E7]">
                1
              </span>
              Merchant Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#71717A] mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={isRunningSequence}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Electronics"
                  className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-md text-[#18181B] bg-white focus:outline-none focus:ring-1 focus:ring-[#18181B] focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#71717A] mb-1">
                  Category *
                </label>
                <select
                  disabled={isRunningSequence}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-md text-[#18181B] bg-white focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                >
                  <option value="ELECTRONICS">ELECTRONICS</option>
                  <option value="APPAREL">APPAREL</option>
                  <option value="GROCERY">GROCERY</option>
                  <option value="TRAVEL">TRAVEL</option>
                  <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                  <option value="FINANCIAL_SERVICES">FINANCIAL SERVICES</option>
                  <option value="HEALTHCARE">HEALTHCARE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#71717A] mb-1">
                  GST Number *
                </label>
                <input
                  type="text"
                  required
                  disabled={isRunningSequence}
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 36AAAAA0000A1Z5"
                  className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-md text-[#18181B] font-mono focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#71717A] mb-1">
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  disabled={isRunningSequence}
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-md text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#71717A] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  disabled={isRunningSequence}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876540001"
                  className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-md text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#E4E4E7]" />

          {/* Section 2: Payment JSON */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#F4F4F5] text-[#18181B] text-xs font-mono font-bold inline-flex items-center justify-center border border-[#E4E4E7]">
                  2
                </span>
                Payment JSON (Initial Data)
              </h3>
              <button
                type="button"
                onClick={handleUseSamplePayments}
                disabled={isRunningSequence}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#18181B] hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#71717A]" />
                Use Sample Payments
              </button>
            </div>

            <div className="border border-dashed border-[#E4E4E7] rounded-xl p-4 bg-[#FAFAFA] hover:bg-white transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#71717A]" />
                    <span className="text-sm font-medium text-[#18181B]">
                      {paymentFileName || 'Upload Payments JSON (.json)'}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Array of payment objects with amount, status, paymentMethod.
                  </p>
                </div>

                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] shadow-2xs transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#71717A]" />
                  Select .json
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handlePaymentJsonUpload}
                    disabled={isRunningSequence}
                    className="hidden"
                  />
                </label>
              </div>

              {paymentData && (
                <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-green-600 shrink-0" />
                  <span>
                    Loaded <strong>{paymentData.length}</strong> validated payments ready for submission.
                  </span>
                </div>
              )}

              {paymentJsonError && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{paymentJsonError}</span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-[#E4E4E7]" />

          {/* Section 3: Merchant Document */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#F4F4F5] text-[#18181B] text-xs font-mono font-bold inline-flex items-center justify-center border border-[#E4E4E7]">
                3
              </span>
              Merchant Document (PDF)
            </h3>

            <div className="border border-dashed border-[#E4E4E7] rounded-xl p-4 bg-[#FAFAFA] hover:bg-white transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#71717A]" />
                    <span className="text-sm font-medium text-[#18181B]">
                      {merchantDocFile ? merchantDocFile.name : 'Upload Merchant Document (PDF)'}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Business incorporation or registration proof. PDF only, under 10 MB.
                  </p>
                </div>

                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] shadow-2xs transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#71717A]" />
                  Select PDF
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleMerchantDocChange}
                    disabled={isRunningSequence}
                    className="hidden"
                  />
                </label>
              </div>

              {merchantDocError && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{merchantDocError}</span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-[#E4E4E7]" />

          {/* Section 4: Government Document */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#F4F4F5] text-[#18181B] text-xs font-mono font-bold inline-flex items-center justify-center border border-[#E4E4E7]">
                4
              </span>
              Government Document (PDF)
            </h3>

            <div className="border border-dashed border-[#E4E4E7] rounded-xl p-4 bg-[#FAFAFA] hover:bg-white transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#71717A]" />
                    <span className="text-sm font-medium text-[#18181B]">
                      {govtDocFile ? govtDocFile.name : 'Upload Government Document (PDF)'}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Government tax clearance or compliance certificate. PDF only, under 10 MB.
                  </p>
                </div>

                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] shadow-2xs transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#71717A]" />
                  Select PDF
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleGovtDocChange}
                    disabled={isRunningSequence}
                    className="hidden"
                  />
                </label>
              </div>

              {govtDocError && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{govtDocError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E4E4E7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isRunningSequence}
              className="px-3.5 py-2 text-xs font-medium text-[#71717A] hover:text-[#18181B] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-create-merchant"
              disabled={isRunningSequence}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#18181B] hover:bg-black active:scale-[0.98] disabled:opacity-60 rounded-md shadow-2xs transition-colors"
            >
              {isRunningSequence ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing Pipeline...
                </>
              ) : (
                'Create Merchant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
