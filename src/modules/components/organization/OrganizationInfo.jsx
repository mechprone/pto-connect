import React from 'react';
import { useUser } from '@/modules/components/context/UserProvider';
import { useRoleAccess } from '@/modules/hooks/useRoleAccess';

export default function OrganizationInfo({ showDetails = true, className = '' }) {
  const { organization, profile, loading } = useUser();
  const { getRoleDisplayName, getRoleColor } = useRoleAccess();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!organization || !profile) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No organization data
      </div>
    );
  }

  const getSubscriptionStatus = () => {
    const { subscription_status, trial_ends_at } = organization;
    
    if (subscription_status === 'active') {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    }
    
    if (subscription_status === 'trial') {
      const trialEnd = new Date(trial_ends_at);
      const now = new Date();
      const isActive = trialEnd > now;
      
      if (isActive) {
        const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        return { 
          text: `Trial (${daysLeft} days left)`, 
          color: 'bg-yellow-100 text-yellow-800' 
        };
      } else {
        return { text: 'Trial Expired', color: 'bg-red-100 text-red-800' };
      }
    }
    
    return { text: 'Inactive', color: 'bg-gray-100 text-gray-800' };
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="text-sm font-medium text-gray-900">
          {organization.name}
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()}`}>
          {getRoleDisplayName()}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {organization.name}
          </h3>
          
          <div className="flex items-center space-x-3 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor()}`}>
              {getRoleDisplayName()}
            </span>
            
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscriptionStatus.color}`}>
              {subscriptionStatus.text}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium w-20">Type:</span>
              <span className="capitalize">{organization.type || 'PTO'}</span>
            </div>
            
            <div className="flex items-center">
              <span className="font-medium w-20">Member:</span>
              <span>{profile.first_name} {profile.last_name}</span>
            </div>
            
            {profile.email && (
              <div className="flex items-center">
                <span className="font-medium w-20">Email:</span>
                <span>{profile.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ml-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {organization.name?.charAt(0)?.toUpperCase() || 'O'}
            </span>
          </div>
        </div>
      </div>

      {organization.subscription_status === 'trial' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Your trial period is active. Consider upgrading to continue using all features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}