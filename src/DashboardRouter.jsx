import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function AdminDashboard() {
  return <h1 className="text-2xl text-green-700">Welcome to the Admin Dashboard</h1>;
}

function TeacherDashboard() {
  return <h1 className="text-2xl text-blue-700">Welcome to the Teacher Dashboard</h1>;
}

function ParentDashboard() {
  return <h1 className="text-2xl text-purple-700">Welcome to the Parent Dashboard</h1>;
}

function LoadingScreen() {
  return <h1 className="text-xl text-gray-500">Loading your dashboard...</h1>;
}

export default function DashboardRouter() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profileError) {
          setRole(data?.role || 'Parent');
        }
      }

      setLoading(false);
    };

    getUserAndProfile();
  }, []);

  if (loading) return <LoadingScreen />;

  if (!user || !role) return <h1 className="text-red-500">Access denied or session missing.</h1>;

  switch (role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Teacher':
      return <TeacherDashboard />;
    default:
      return <ParentDashboard />;
  }
}
