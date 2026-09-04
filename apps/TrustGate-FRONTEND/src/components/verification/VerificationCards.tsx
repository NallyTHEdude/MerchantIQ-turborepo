import React from 'react';
import { Check, X, ShieldCheck, Globe, Phone, FileCheck2 } from 'lucide-react';
import { Verification } from '@/types';
import { Card } from '@/components/ui/Card';

interface VerificationCardsProps {
  latestVerification: Verification | null;
  gstNumber?: string;
  websiteUrl?: string;
  phoneNumber?: string;
}

export function VerificationCards({
  latestVerification,
  gstNumber,
  websiteUrl,
  phoneNumber,
}: VerificationCardsProps) {
  const isGstVerified = Boolean(latestVerification?.isGstNumberVerified);
  const isWebVerified = Boolean(latestVerification?.isWebsiteVerified);
  const isPhoneVerified = Boolean(latestVerification?.isPhoneNumberVerified);

  const checks = [
    {
      id: 'check-gst',
      title: 'GST Number',
      value: gstNumber || 'Not provided',
      isVerified: isGstVerified,
      icon: FileCheck2,
      subtitle: 'Government GST portal compliance verification',
    },
    {
      id: 'check-website',
      title: 'Website',
      value: websiteUrl || 'Not provided',
      isVerified: isWebVerified,
      icon: Globe,
      subtitle: 'Domain registration & active operational state check',
    },
    {
      id: 'check-phone',
      title: 'Phone Number',
      value: phoneNumber || 'Not provided',
      isVerified: isPhoneVerified,
      icon: Phone,
      subtitle: 'Telephony carrier & direct merchant line verification',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
        Verification Checks
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div
              key={check.id}
              id={check.id}
              className="bg-white rounded-xl border border-[#E4E4E7] p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#18181B]">
                      {check.title}
                    </h4>
                  </div>

                  {check.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      <X className="w-3 h-3 stroke-[2.5]" />
                      Not Verified
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#F4F4F5]">
                  <p className="text-xs font-mono font-medium text-[#18181B] truncate" title={check.value}>
                    {check.value}
                  </p>
                  <p className="text-[11px] text-[#71717A] mt-1">{check.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
