import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ExternalLink,
  Plus,
  AlertCircle,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { MerchantWithVerification } from '@/types';
import { RiskBadge, StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface MerchantTableProps {
  merchants: MerchantWithVerification[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectMerchant: (merchantId: string) => void;
  onCreateClick: () => void;
}

type SortField = 'name' | 'category' | 'status' | 'trustscore' | 'risk' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function MerchantTable({
  merchants,
  isLoading,
  error,
  onRetry,
  onSelectMerchant,
  onCreateClick,
}: MerchantTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort
  const filteredMerchants = useMemo(() => {
    let result = [...merchants];

    // Search query by business name, category, or gst
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.merchant?.businessName?.toLowerCase().includes(q) ||
          item.merchant?.category?.toLowerCase().includes(q) ||
          item.merchant?.gstNumber?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((item) => {
        const s = (item.verification?.verificationStatus || 'PENDING').toUpperCase();
        return s === statusFilter.toUpperCase();
      });
    }

    // Risk filter
    if (riskFilter !== 'ALL') {
      result = result.filter((item) => {
        const r = (item.verification?.riskLevel || '').toUpperCase().replace(/\s+/g, '_');
        const target = riskFilter.toUpperCase().replace(/\s+/g, '_');
        return r === target;
      });
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'name':
          valA = a.merchant?.businessName?.toLowerCase() || '';
          valB = b.merchant?.businessName?.toLowerCase() || '';
          break;
        case 'category':
          valA = a.merchant?.category?.toLowerCase() || '';
          valB = b.merchant?.category?.toLowerCase() || '';
          break;
        case 'status':
          valA = a.verification?.verificationStatus || '';
          valB = b.verification?.verificationStatus || '';
          break;
        case 'trustscore':
          valA = a.verification?.trustscore ?? -1;
          valB = b.verification?.trustscore ?? -1;
          break;
        case 'risk':
          const riskWeight: Record<string, number> = {
            LOW: 1,
            MEDIUM: 2,
            HIGH: 3,
            VERY_HIGH: 4,
          };
          valA = riskWeight[(a.verification?.riskLevel || '').toUpperCase().replace(/\s+/g, '_')] || 0;
          valB = riskWeight[(b.verification?.riskLevel || '').toUpperCase().replace(/\s+/g, '_')] || 0;
          break;
        case 'createdAt':
        default:
          valA = new Date(a.merchant?.createdAt || 0).getTime();
          valB = new Date(b.merchant?.createdAt || 0).getTime();
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [merchants, searchQuery, statusFilter, riskFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-[#E4E4E7] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="input-search-merchant"
            placeholder="Search merchants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-[#F4F4F5] border border-[#E4E4E7] rounded-md text-[#18181B] placeholder:text-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#18181B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Status:</span>
            <select
              id="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#F4F4F5] border border-[#E4E4E7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#18181B]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Risk:</span>
            <select
              id="select-filter-risk"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#F4F4F5] border border-[#E4E4E7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#18181B]"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="VERY_HIGH">Very High</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'ALL' || riskFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setRiskFilter('ALL');
              }}
              className="px-2.5 py-1.5 text-xs text-[#18181B] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : error ? (
        <div className="py-16 px-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-red-50 text-red-600 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#18181B]">
            Unable to load merchant data
          </h3>
          <p className="text-sm text-[#71717A] mt-1 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#18181B] hover:bg-[#27272A] rounded-md shadow-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredMerchants.length === 0 ? (
        <div className="py-16 px-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-[#F4F4F5] text-[#71717A] mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#18181B]">
            {merchants.length === 0 ? 'No merchants found' : 'No matching merchants'}
          </h3>
          <p className="text-sm text-[#71717A] mt-1 max-w-md mx-auto">
            {merchants.length === 0
              ? 'Get started by creating your first merchant profile for risk analysis.'
              : 'Try clearing your search query or filters to see all merchants.'}
          </p>
          {merchants.length === 0 && (
            <button
              type="button"
              onClick={onCreateClick}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#18181B] hover:bg-[#27272A] rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first merchant
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[#71717A] text-[10px] font-bold uppercase tracking-widest">
                <th
                  scope="col"
                  className="py-3 px-6 cursor-pointer hover:text-[#18181B] select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    Merchant / Category
                    <ArrowUpDown className="w-3 h-3 text-[#A1A1AA]" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 cursor-pointer hover:text-[#18181B] select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1.5">
                    Status
                    <ArrowUpDown className="w-3 h-3 text-[#A1A1AA]" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 cursor-pointer hover:text-[#18181B] select-none"
                  onClick={() => handleSort('trustscore')}
                >
                  <div className="flex items-center gap-1.5">
                    Trust Score
                    <ArrowUpDown className="w-3 h-3 text-[#A1A1AA]" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 cursor-pointer hover:text-[#18181B] select-none"
                  onClick={() => handleSort('risk')}
                >
                  <div className="flex items-center gap-1.5">
                    Risk Level
                    <ArrowUpDown className="w-3 h-3 text-[#A1A1AA]" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="py-3 px-6 cursor-pointer hover:text-[#18181B] select-none text-right"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Joined
                    <ArrowUpDown className="w-3 h-3 text-[#A1A1AA]" />
                  </div>
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5] text-sm">
              {filteredMerchants.map((item) => {
                const merchant = item.merchant;
                const verification = item.verification;
                const merchantId = merchant?.id || verification?.merchantId;

                return (
                  <tr
                    key={merchantId || Math.random()}
                    id={`row-merchant-${merchantId}`}
                    onClick={() => merchantId && onSelectMerchant(merchantId)}
                    className="hover:bg-[#F9FAFB] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-[#18181B] group-hover:text-black transition-colors">
                          {merchant?.businessName || 'Unnamed Merchant'}
                        </span>
                        <span className="text-[10px] text-[#71717A] font-mono uppercase tracking-wider">
                          {merchant?.category || 'MERCHANT'} {merchant?.gstNumber ? `• ${merchant.gstNumber}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={verification?.verificationStatus || 'PENDING'} />
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-[#18181B]">
                        {String(verification?.trustscore ?? 0).padStart(2, '0')}/100
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <RiskBadge risk={verification?.riskLevel || 'VERY_HIGH'} />
                    </td>
                    <td className="py-4 px-6 text-[#71717A] text-sm text-right font-mono">
                      {formatDate(merchant?.createdAt || verification?.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#18181B] group-hover:translate-x-0.5 transition-all inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count info */}
      {!isLoading && !error && (
        <div className="px-6 py-3 border-t border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
          <div className="text-xs text-[#71717A]">
            Showing <strong className="text-[#18181B] font-semibold">{filteredMerchants.length}</strong> of{' '}
            <strong className="text-[#18181B] font-semibold">{merchants.length}</strong> merchants
          </div>
          <div className="text-xs text-[#71717A] hidden sm:block">
            Click any row to inspect verification history &amp; risk telemetry
          </div>
        </div>
      )}
    </div>
  );
}
