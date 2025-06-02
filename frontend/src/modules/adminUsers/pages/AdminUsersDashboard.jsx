import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import axios from 'axios'

export default function AdminUsersDashboard() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setError('Not authenticated.')
        return
      }

      try {
        const res = await axios.get('/api/admin-users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUsers(res.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load user list.')
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PTO Members & Roles</h1>
      {error && <p className="text-red-600">{error}</p>}
      {users.length === 0 && !error && <p>No users found for this PTO.</p>}

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
    </div>
  )
}
