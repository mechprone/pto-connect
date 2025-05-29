import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function EventsDashboard() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchEvents() {
      const user = (await supabase.auth.getUser()).data.user
      const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('org_id', orgId)
        .order('event_date', { ascending: true })

      if (error) {
        setError('Failed to load events.')
        console.error(error)
      } else {
        setEvents(data)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">PTO-Wide Events</h1>
        <Link to="/events/create" className="bg-blue-600 text-white px-4 py-2 rounded">+ Create Event</Link>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {events.length === 0 && !error && <p>No events created yet.</p>}

      <ul className="space-y-4">
        {events.map(event => (
          <li key={event.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-sm text-gray-500">{event.event_date} • {event.school_level} • {event.category}</p>
            <p className="mt-2">{event.description}</p>
            {event.share_public && <span className="text-xs inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded">Shared to Library</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}