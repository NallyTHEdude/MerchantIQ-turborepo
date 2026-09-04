import React from 'react';
import { Store, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MerchantWithVerification } from '@/types';
import { Card } from '@/components/ui/Card';

interface MerchantSummaryCardsProps {
  merchants: MerchantWithVerification[];
  isLoading?: boolean;
}

export function MerchantSummaryCards({
  merchants,
  isLoading,
}: MerchantSummaryCardsProps) {
  const total = merchants.length;

  const pending = merchants.filter((m) => {
    const status = m.verification?.verificationStatus?.toUpperCase();
    return status === 'PENDING' || !m.verification;
  }).length;

  const highRisk = merchants.filter((m) => {
    const risk = m.verification?.riskLevel?.toUpperCase();
    return risk === 'HIGH' || risk === 'VERY_HIGH' || risk === 'VERY HIGH';
  }).length;

  const completed = merchants.filter((m) => {
    const status = m.verification?.verificationStatus?.toUpperCase();
    return status === 'COMPLETED' || status === 'VERIFIED';
  }).length;

  const stats = [
    {
      id: 'stat-total-merchants',
      title: 'Total Merchants',
      value: total,
      subtext: '+12% from last cycle',
      subtextColor: 'text-green-600',
      valueColor: 'text-[#18181B]',
      icon: Store,
    },
    {
      id: 'stat-pending-verification',
      title: 'Pending Verification',
      value: pending,
      subtext: pending > 0 ? `${pending} requires action` : 'All caught up',
      subtextColor: pending > 0 ? 'text-amber-600' : 'text-[#71717A]',
      valueColor: 'text-[#18181B]',
      icon: Clock,
    },
    {
      id: 'stat-high-risk',
      title: 'High Risk Flagged',
      value: highRisk,
      subtext: highRisk > 0 ? `${highRisk} under surveillance` : 'Zero active flags',
      subtextColor: highRisk > 0 ? 'text-red-600' : 'text-[#71717A]',
      valueColor: highRisk > 0 ? 'text-red-600' : 'text-[#18181B]',
      icon: AlertTriangle,
    },
    {
      id: 'stat-completed-verified',
      title: 'Completed / Verified',
      value: completed,
      subtext: total > 0 ? `${Math.round((completed / total) * 100)}% verification rate` : 'Operational baseline',
      subtextColor: 'text-blue-600',
      valueColor: 'text-[#18181B]',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            id={stat.id}
            className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-1">
                  {stat.title}
                </p>
                <Icon className="w-3.5 h-3.5 text-[#A1A1AA]" />
              </div>
              <h2 className={`text-2xl font-bold tracking-tight ${stat.valueColor}`}>
                {isLoading ? '—' : stat.value}
              </h2>
            </div>
            <p className={`text-xs mt-2 font-medium ${stat.subtextColor}`}>
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
