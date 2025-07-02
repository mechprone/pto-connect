import React from 'react';
import { Outlet } from 'react-router-dom'
import { useUserProfile } from '@/modules/hooks/useUserProfile'
import NotificationBell from '@/modules/components/notifications/NotificationBell'
import LogoutButton from '@/modules/components/auth/LogoutButton'
import SidebarNav from '@/modules/components/layout/SidebarNav'
import Footer from '@/modules/components/layout/Footer'
import RenewalBanner from '@/components/RenewalBanner'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function MainLayout() {
  console.log('🏗️ [MainLayout] Component render at:', new Date().toLocaleTimeString());
  
  const { profile, loading, isAuthenticated } = useUserProfile();

  // Show loading spinner while fetching user data
  if (loading) {
    console.log('⏳ [MainLayout] Loading user profile...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // This should not happen as ProtectedRoute handles auth, but just in case
  if (!isAuthenticated || !profile) {
    console.log('❌ [MainLayout] User not authenticated or profile missing');
    return null;
  }

  console.log('✅ [MainLayout] Rendering layout for user:', profile.role);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top header (full width) */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center w-full">
        <span className="text-xl font-bold text-blue-700">PTO Connect</span>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </header>
      <RenewalBanner />
      {/* Sidebar + Main content area */}
      <div className="flex flex-1">
        <SidebarNav role={profile.role} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}