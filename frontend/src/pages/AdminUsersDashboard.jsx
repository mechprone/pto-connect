import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AdminUsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([
    'admin',
    'board_member',
    'committee_lead',
    'volunteer',
    'parent_member',
    'teacher',
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('id, email, full_name, role');
    if (error) {
      console.error('Error loading users:', error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Failed to update role: ' + error.message);
    } else {
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage PTO Users</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Full Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.full_name || 'N/A'}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-sm text-green-600">Saved automatically</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
