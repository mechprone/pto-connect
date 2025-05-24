import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminDashboard from './AdminDashboard';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

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
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session:", session);  // 🐞 Debug

      const currentUser = session?.user;
      console.log("User:", currentUser); // 🐞 Debug

      if (currentUser) {
        setUser(currentUser);

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        console.log("Profile data:", data);   // 🐞 Debug
        console.log("Profile error:", error); // 🐞 Debug

        if (!error && data?.role) {
          setRole(data.role);
        } else {
          setRole('Parent'); // fallback
        }
      }

      setLoading(false);
    };

    getInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session); // 🐞 Debug

        if (session?.user) {
          setUser(session.user);

          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          console.log("Profile (live) data:", data);
          console.log("Profile (live) error:", error);

          if (!error && data?.role) {
            setRole(data.role);
          } else {
            setRole('Parent');
          }

          setLoading(false);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <LoadingScreen />;
  if (!user || !role) return <h1 className="text-red-500">Access denied or no session found.</h1>;

  switch (role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Teacher':
      return <TeacherDashboard />;
    default:
      return <ParentDashboard />;
  }
}
