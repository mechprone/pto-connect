import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserProfile } from '@/modules/hooks/useUserProfile';

export default function ProtectedRoute({ allowedRoles }) {
  const { profile, organization, loading, isAuthenticated, isSubscriptionActive } = useUserProfile();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check subscription status (except for billing page)
  if (!isSubscriptionActive() && window.location.pathname !== '/billing') {
    return <Navigate to="/billing" replace />;
  }

  // All checks passed, render the protected content
  return <Outlet />;
}
