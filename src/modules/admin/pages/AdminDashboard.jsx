import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import axios from 'axios'
import UserRoleManager from '@/components/UserRoleManager'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Supabase session:', session)

        const token = session?.access_token
        if (!token) {
          setError('Not authenticated.')
          return
        }

        const res = await axios.get('https://api.ptoconnect.com/api/admin-users', {
          headers: { Authorization: `Bearer ${token}` }
        })

        console.log('API response:', res.data)

        if (!Array.isArray(res.data)) {
          throw new Error('Invalid API response format (expected array)')
        }

        setUsers(res.data)
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PTO Members & Roles</h1>

      {loading && <p className="text-gray-500">Loading users...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && users.length === 0 && !error && <p>No users found for this PTO.</p>}

      {!loading && users.length > 0 && (
        <table className="w-full table-auto border-collapse">
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

      {/* User Role Management Section */}
      <UserRoleManager users={users} setUsers={setUsers} />
    </div>
  )
}
