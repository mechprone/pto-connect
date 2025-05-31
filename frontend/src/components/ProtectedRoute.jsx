import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function ProtectedRoute({ allowedRoles }) {
  const [authState, setAuthState] = useState({ loading: true, user: null, role: null });

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setAuthState({ loading: false, user, role: profile?.role });
      } else {
        setAuthState({ loading: false, user: null, role: null });
      }
    };

    fetchUser();
  }, []);

  if (authState.loading) return <div className="p-4">Loading...</div>;

  if (!authState.user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(authState.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
