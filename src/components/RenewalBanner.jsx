import React from 'react';
import { useUser } from '@/modules/components/context/UserProvider';

export default function RenewalBanner() {
  const { showRenewalBanner, organization } = useUser();

  if (!showRenewalBanner()) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
      <p>Your annual plan is expiring soon. Please renew to avoid interruption.</p>
      {organization?.current_period_end && (
        <p>Current period ends: {new Date(organization.current_period_end).toLocaleDateString()}</p>
      )}
    </div>
  );
} 