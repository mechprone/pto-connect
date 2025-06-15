import { useEffect, useState } from 'react'
import { apiRequest } from '@/utils/api'

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'committee_lead', label: 'Committee Lead' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'parent_member', label: 'Parent Member' },
  { value: 'teacher', label: 'Teacher' },
]

export default function PermissionsConsole() {
  const [users, setUsers] = useState([])
  const [permissions, setPermissions] = useState([])
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [roleFilter, setRoleFilter] = useState('')
  const [userOverrides, setUserOverrides] = useState({}) // { userId: { permKey: true/false } }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError('')
      const [{ data: permData, error: permError }, { data: userData, error: userError }] = await Promise.all([
        apiRequest('GET', '/admin/organization-permissions'),
        apiRequest('GET', '/admin-users'),
      ])
      console.log('[PermissionsConsole] /admin/organization-permissions response:', permData)
      console.log('[PermissionsConsole] /admin-users response:', userData)
      if (permError || userError) {
        setError('Failed to load permissions or users.')
        setLoading(false)
        return
      }
      setPermissions(Array.isArray(permData?.permissions) ? permData.permissions : [])
      setGrouped(permData?.grouped && typeof permData.grouped === 'object' ? permData.grouped : {})
      setUsers(userData?.profiles || (Array.isArray(userData) ? userData : []))
      setLoading(false)
    }
    fetchData()
  }, [])

  // Defensive checks
  if (loading) return <div className="py-8 text-center text-gray-500">Loading permissions...</div>
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>
  if (!Array.isArray(permissions) || !grouped || typeof grouped !== 'object') {
    return <div className="py-8 text-center text-red-600">Permissions data is unavailable or malformed.</div>
  }

  // Filter users by role
  const filteredUsers = roleFilter
    ? users.filter(u => u.role === roleFilter)
    : users

  // Get all unique permission keys
  const allPerms = permissions.map(p => ({
    key: p.permission_key,
    name: p.permission_name,
    module: p.module_name,
    defaultEnabled: p.is_enabled,
    minRole: p.current_min_role,
  }))

  // Handle per-user permission toggle
  const handleUserPermChange = (userId, permKey, value) => {
    setUserOverrides(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [permKey]: value,
      },
    }))
    setDirty(true)
  }

  // Handle bulk apply for role
  const handleBulkApply = (permKey, value) => {
    filteredUsers.forEach(user => {
      handleUserPermChange(user.id, permKey, value)
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    // Prepare per-user overrides for API
    const overrides = Object.entries(userOverrides).flatMap(([userId, perms]) =>
      Object.entries(perms).map(([permKey, enabled]) => ({
        user_id: userId,
        permission_key: permKey,
        is_enabled: enabled,
      }))
    )
    // You may need to adjust the endpoint and payload to match your backend
    const { error } = await apiRequest('POST', '/admin/organization-permissions/user-overrides', {
      overrides,
    })
    if (error) setError('Failed to save changes.')
    else setDirty(false)
    setSaving(false)
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Permissions Management</h2>
      <div className="mb-4 flex gap-4 items-center">
        <label className="font-medium">Filter by Role:</label>
        <select
          className="border rounded px-2 py-1"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          {roleOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-gray-500 text-center py-8">No permissions found.</div>
        ) : (
          <table className="w-full table-auto border mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                {allPerms.map(perm => (
                  <th key={perm.key} className="p-2 border">
                    <div className="flex flex-col items-center">
                      <span>{perm.name}</span>
                      <button
                        className="text-xs text-blue-600 underline mt-1"
                        onClick={() => handleBulkApply(perm.key, true)}
                        title="Enable for all filtered users"
                      >Enable All</button>
                      <button
                        className="text-xs text-red-600 underline"
                        onClick={() => handleBulkApply(perm.key, false)}
                        title="Disable for all filtered users"
                      >Disable All</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="p-2 border font-medium">{user.full_name || user.email}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border capitalize">{user.role}</td>
                  {allPerms.map(perm => {
                    // Use override if set, else default
                    const override = userOverrides[user.id]?.[perm.key]
                    const checked = override !== undefined ? override : perm.defaultEnabled
                    return (
                      <td key={perm.key} className="p-2 border text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => handleUserPermChange(user.id, perm.key, e.target.checked)}
                          className="w-5 h-5 accent-blue-600"
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex gap-4 items-center mt-4">
        <button
          className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold ${!dirty || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSave}
          disabled={!dirty || saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {dirty && !saving && <span className="text-yellow-600">Unsaved changes</span>}
      </div>
    </div>
  )
} 