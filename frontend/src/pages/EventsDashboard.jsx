import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function EventsDashboard() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchEvents() {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        setError('Authentication error. Please log in again.')
        return
      }

      const res = await fetch('/api/events', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error || 'Failed to load events')
        return
      }

      const data = await res.json()
      setEvents(data)
    }

    fetchEvents()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">PTO-Wide Events</h1>
        <div className="flex gap-2">
          <Link to="/events/calendar" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            📅 View Calendar
          </Link>
          <Link to="/events/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Create Event
          </Link>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {events.length === 0 && !error && <p>No events created yet.</p>}

      <ul className="space-y-4">
        {events.map((event) => (
          <li key={event.id} className="border p-4 rounded shadow-sm bg-white">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <div className="flex gap-2 text-sm">
                <Link to={`/events/edit/${event.id}`} className="text-blue-600 hover:underline">✏️ Edit</Link>
                <button className="text-red-600 hover:underline">🗑️ Delete</button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(event.event_date).toLocaleDateString()} • {event.school_level} • {event.category}
            </p>
            <p className="mt-2">{event.description}</p>
            {event.share_public && (
              <span className="text-xs inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded">
                Shared to Library
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
