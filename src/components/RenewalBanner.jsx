import React from 'react';
import { useUserProfile } from '@/modules/hooks/useUserProfile';

export default function RenewalBanner() {
  const { showRenewalBanner, organization } = useUserProfile();

  if (!showRenewalBanner()) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-4 flex items-center justify-between">
      <div>
        <strong>Annual Subscription Expiring Soon:</strong> Your annual subscription will expire on{' '}
        <span className="font-semibold">
          {organization?.current_period_end ? new Date(organization.current_period_end).toLocaleDateString() : 'soon'}
        </span>.
        Please renew to avoid interruption.
      </div>
      <a
        href="/billing"
        className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
      >
        Renew Now
      </a>
    </div>
  );
} 