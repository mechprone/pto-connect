import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/modules/components/context/UserProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProtectedRoute({ allowedRoles }) {
  const { profile, organization, loading, isAuthenticated, isSubscriptionActive } = useUser();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check subscription status (except for billing page)
  if (!isSubscriptionActive() && window.location.pathname !== '/billing') {
    return <Navigate to="/billing" replace />;
  }

  // All checks passed, render the protected content
  return <Outlet />;
} 