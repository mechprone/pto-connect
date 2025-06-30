import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(profile?.role);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div>
        <span className="text-sm text-gray-700">
          Logged in as <strong>{user.email}</strong> ({role})
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Log Out
      </button>
    </header>
  );
}