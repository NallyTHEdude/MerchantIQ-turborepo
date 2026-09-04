import React from 'react';
import { Check, X, Search, Shield, FileSearch, Info } from 'lucide-react';
import { Verification } from '@/types';
import { RiskBadge, StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface VerificationHistoryTableProps {
  verifications: Verification[];
  isLoading: boolean;
  onInvestigate: (verificationId: string) => void;
}

export function VerificationHistoryTable({
  verifications,
  isLoading,
  onInvestigate,
}: VerificationHistoryTableProps) {
  // Sort descending by date
  const sorted = [...verifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-white">
        <div>
          <h3 className="text-sm font-semibold text-[#18181B] tracking-tight">
            Verification History
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Audit trail of automated and periodic verification checkpoints
          </p>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7]">
          {verifications.length} records
        </span>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={8} />
      ) : sorted.length === 0 ? (
        <div className="py-12 px-6 text-center text-[#71717A]">
          <Shield className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#18181B]">No verification checkpoints found</p>
          <p className="text-xs text-[#71717A] mt-1">
            Verification history will appear as soon as checks are run.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[#71717A] text-[10px] font-bold uppercase tracking-widest">
                <th scope="col" className="py-3 px-6">Date</th>
                <th scope="col" className="py-3 px-4">Status</th>
                <th scope="col" className="py-3 px-4">Trust Score</th>
                <th scope="col" className="py-3 px-4">Risk Level</th>
                <th scope="col" className="py-3 px-3 text-center">GST</th>
                <th scope="col" className="py-3 px-3 text-center">Website</th>
                <th scope="col" className="py-3 px-3 text-center">Phone</th>
                <th scope="col" className="py-3 px-6 text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5] text-sm">
              {sorted.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3.5 px-6 text-xs text-[#71717A] font-mono">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.verificationStatus} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-sm text-[#18181B]">
                      {String(item.trustscore ?? 0).padStart(2, '0')}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge risk={item.riskLevel} />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {item.isGstNumberVerified ? (
                      <span className="inline-flex p-1 rounded-full bg-green-50 text-green-700">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-red-50 text-red-600">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {item.isWebsiteVerified ? (
                      <span className="inline-flex p-1 rounded-full bg-green-50 text-green-700">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-red-50 text-red-600">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {item.isPhoneNumberVerified ? (
                      <span className="inline-flex p-1 rounded-full bg-green-50 text-green-700">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-red-50 text-red-600">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => onInvestigate(item.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#18181B] bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] rounded-md transition-colors shadow-2xs"
                    >
                      <FileSearch className="w-3.5 h-3.5 text-[#71717A]" />
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
