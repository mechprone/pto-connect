import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import axios from 'axios'

export default function SharedLibraryDashboard() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchLibraryItems() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setError('Not authenticated.')
        return
      }

      try {
        const res = await axios.get('/api/shared-library', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setItems(res.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load shared library items.')
      }
    }

    fetchLibraryItems()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shared PTO Library</h1>
      {error && <p className="text-red-600">{error}</p>}
      {items.length === 0 && !error && <p>No shared events or fundraisers yet.</p>}

      <ul className="space-y-4">
        {items.map(item => (
          <li key={item.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-500">{item.description}</p>
            <p className="text-sm text-blue-700 mt-1">
              Type: {item.type?.toUpperCase() || 'N/A'} • Shared by another PTO
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
