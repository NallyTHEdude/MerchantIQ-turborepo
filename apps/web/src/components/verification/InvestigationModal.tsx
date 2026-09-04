import React from 'react';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Investigation } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/lib/utils';

interface InvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigation: Investigation | null;
  isLoading: boolean;
  error: string | null;
  verificationId?: string;
}

export function InvestigationModal({
  isOpen,
  onClose,
  investigation,
  isLoading,
  error,
  verificationId,
}: InvestigationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Investigation Details"
      description={`Verification Record: ${verificationId || '—'}`}
      maxWidth="lg"
      id="modal-investigation-details"
    >
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Querying investigation telemetry...</p>
        </div>
      ) : error ? (
        <div className="py-8 px-4 text-center">
          <div className="inline-flex p-3 rounded-full bg-[#F4F4F5] text-[#18181B] mb-2 border border-[#E4E4E7]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-[#18181B]">
            Investigation Not Found
          </h4>
          <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">{error}</p>
          <p className="text-xs text-[#A1A1AA] mt-2">
            An investigation case may not have been initiated for this verification checkpoint yet.
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
          {/* Action Header Card */}
          <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E4E4E7] flex items-start gap-3">
            <div className="p-2 bg-white text-[#18181B] border border-[#E4E4E7] rounded-md shrink-0 mt-0.5 shadow-2xs">
              <FileSearch className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                Investigative Action Taken
              </span>
              <h3 className="text-base font-bold text-[#18181B] mt-0.5 font-mono">
                {investigation.action || 'NO_ACTION'}
              </h3>
            </div>
          </div>

          {/* Reasoning */}
          <div className="p-4 bg-white rounded-lg border border-[#E4E4E7] shadow-xs">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">
              Reasoning &amp; Findings
            </span>
            <p className="text-xs text-[#18181B] leading-relaxed whitespace-pre-wrap font-sans">
              {investigation.reasoning || 'No specific reasoning string supplied by engine.'}
            </p>
          </div>

          {/* Overrides & Governance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Override Status */}
            <div className="p-4 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA]">
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-2">
                Override Status
              </span>
              {investigation.isOverridden ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Manually Overridden
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  System Default (Not Overridden)
                </div>
              )}
            </div>

            {/* Overridden By */}
            <div className="p-4 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA]">
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">
                Overridden By
              </span>
              <div className="flex items-center gap-2 mt-2">
                <UserCheck className="w-4 h-4 text-[#71717A]" />
                <span className="text-xs font-mono font-medium text-[#18181B]">
                  {investigation.overriddenBy ? investigation.overriddenBy : 'None (System Evaluated)'}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="pt-3 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between text-xs text-[#71717A] gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span>Created: {formatDateTime(investigation.createdAt)}</span>
            </div>
            <div className="font-mono text-[11px] text-[#A1A1AA]">
              ID: {investigation.id}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
