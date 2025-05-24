import React, { useState } from 'react';

const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Parent' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Teacher' },
  { id: 3, name: 'Carol Admin', email: 'carol@example.com', role: 'Admin' },
];

const roleOptions = ['Parent', 'Teacher', 'Admin'];

export default function AdminUsersPanel() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');

  const handleRoleChange = (id, newRole) => {
    setUsers(prev =>
      prev.map(user => (user.id === id ? { ...user, role: newRole } : user))
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by name or email"
        className="border border-gray-300 rounded px-3 py-2 w-full"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <table className="min-w-full bg-white shadow rounded">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id} className="border-t">
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user.id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  {roleOptions.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => alert('Saving roles (connect to Supabase when ready)')}
      >
        Save Changes
      </button>
    </div>
  );
}
