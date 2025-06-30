import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'committee_lead', label: 'Committee Lead' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'parent_member', label: 'Parent' },
  { value: 'teacher', label: 'Teacher' },
];

export default function UserRoleManager({ users, setUsers }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkRole, setBulkRole] = useState('');
  const [modalUser, setModalUser] = useState(null);
  const [modalRole, setModalRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filtered users
  const filteredUsers = users.filter(u =>
    (!search || `${u.full_name || ''} ${u.email}`.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter)
  );

  // Bulk role change
  async function handleBulkRoleChange() {
    if (!bulkRole || selected.length === 0) return;
    if (!window.confirm(`Change role for ${selected.length} users to ${bulkRole}?`)) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: bulkRole })
      .in('id', selected);
    setSaving(false);
    if (!error) {
      setUsers(users.map(u => selected.includes(u.id) ? { ...u, role: bulkRole } : u));
      setToast({ type: 'success', message: 'Roles updated successfully!' });
      setSelected([]);
      setBulkRole('');
    } else {
      setToast({ type: 'error', message: 'Failed to update roles.' });
    }
  }

  // Individual role change
  async function handleIndividualRoleChange() {
    if (!modalUser || !modalRole) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: modalRole })
      .eq('id', modalUser.id);
    setSaving(false);
    if (!error) {
      setUsers(users.map(u => u.id === modalUser.id ? { ...u, role: modalRole } : u));
      setToast({ type: 'success', message: 'Role updated successfully!' });
      setShowModal(false);
    } else {
      setToast({ type: 'error', message: 'Failed to update role.' });
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">User Role Management</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border rounded px-2 py-1"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select
          className="border rounded px-2 py-1"
          value={bulkRole}
          onChange={e => setBulkRole(e.target.value)}
        >
          <option value="">Bulk Change Role</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
          onClick={handleBulkRoleChange}
          disabled={!bulkRole || selected.length === 0 || saving}
        >
          Apply to Selected
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="border rounded p-4 flex items-center gap-4 bg-white shadow-sm">
            <input
              type="checkbox"
              checked={selected.includes(user.id)}
              onChange={e => setSelected(
                e.target.checked
                  ? [...selected, user.id]
                  : selected.filter(id => id !== user.id)
              )}
            />
            <div className="flex-1">
              <div className="font-semibold">{user.full_name || user.email}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-sm">Role: <span className="font-mono">{user.role}</span></div>
            </div>
            <button
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              onClick={() => { setModalUser(user); setModalRole(user.role); setShowModal(true); }}
            >
              Change Role
            </button>
          </div>
        ))}
      </div>
      {/* Modal for individual role change */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
            <h3 className="text-lg font-bold mb-2">Change Role for {modalUser.full_name || modalUser.email}</h3>
            <select
              className="border rounded px-2 py-1 w-full mb-4"
              value={modalRole}
              onChange={e => setModalRole(e.target.value)}
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={handleIndividualRoleChange}
                disabled={saving}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-1 rounded"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast/Alert */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          onClick={() => setToast(null)}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
} 