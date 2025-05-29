import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function SharedLibraryDashboard() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSharedLibrary() {
      const { data, error } = await supabase
        .from('shared_library_items')
        .select('*')
        .eq('shared', true)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load shared items.')
        console.error(error)
      } else {
        setItems(data)
      }
    }

    fetchSharedLibrary()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shared Event & Fundraiser Library</h1>
      {error && <p className="text-red-600">{error}</p>}
      {items.length === 0 && !error && <p>No shared items found.</p>}

      <ul className="space-y-4">
        {items.map(item => (
          <li key={item.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-gray-600 italic text-sm mb-1">Type: {item.item_type}</p>
            <p className="whitespace-pre-wrap text-sm">{item.description}</p>
            {item.tags?.length > 0 && (
              <p className="text-sm text-blue-700 mt-1">Tags: {item.tags.join(', ')}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}