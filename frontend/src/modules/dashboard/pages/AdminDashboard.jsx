import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Upcoming Events" value="3 Events" />
        <DashboardCard title="Pending Approvals" value="5 Requests" />
        <DashboardCard title="Budget Overview" value="$12,480" />
        <DashboardCard title="Active Fundraisers" value="2 Campaigns" />
        <DashboardCard title="Recent Messages" value="7 New" />
        <DashboardCard title="Teacher Requests" value="4 Open" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-2xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}
