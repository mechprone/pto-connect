import { useEffect, useState } from 'react'
import { profileAPI } from '@/utils/api'
import UserRoleManager from '@/components/UserRoleManager'
import PermissionsConsole from '@/components/PermissionsConsole'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPermissions, setShowPermissions] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await profileAPI.getUsers()
        if (error) throw new Error(error)
        if (!data?.profiles || !Array.isArray(data.profiles)) {
          throw new Error('Invalid API response format (expected { profiles: [...] })')
        }
        setUsers(data.profiles)
        setError('') // Clear error on success
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Failed to load user list.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PTO Members & Roles</h1>
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${!showPermissions ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setShowPermissions(false)}
        >
          User Management
        </button>
        <button
          className={`px-4 py-2 rounded ${showPermissions ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setShowPermissions(true)}
        >
          Permissions Management
        </button>
      </div>
      {!showPermissions && (
        <>
          {loading && <p className="text-gray-500">Loading users...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && users.length === 0 && !error && <p>No users found for this PTO.</p>}
          {!loading && users.length > 0 && (
            <table className="w-full table-auto border-collapse mb-6">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2">{user.full_name || '—'}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2 capitalize">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <UserRoleManager users={users} setUsers={setUsers} />
        </>
      )}
      {showPermissions && <PermissionsConsole />}
    </div>
  )
}
