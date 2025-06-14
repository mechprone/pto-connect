import React from 'react';
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'
import NotificationBell from '@/modules/components/notifications/NotificationBell'
import LogoutButton from '@/modules/components/auth/LogoutButton'
import SidebarNav from '@/modules/components/layout/SidebarNav'
import Footer from '@/modules/components/layout/Footer'

export default function MainLayout() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role)
    }

    fetchUser()
  }, [])

  if (!user || !role) return null // or loading spinner

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

      {/* Sidebar + Main content area */}
      <div className="flex flex-1">
        <SidebarNav role={role} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}