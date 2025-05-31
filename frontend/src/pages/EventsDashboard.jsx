import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

export default function EventsDashboard() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchEvents() {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('User not found.')
        console.error('User error:', userError)
        return
      }

      const org_id = user?.user_metadata?.org_id || user?.app_metadata?.org_id

      if (!org_id) {
        setError('Unable to load org ID.')
        console.error('Missing org_id in user metadata')
        return
      }

      const { data, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('org_id', org_id)
        .order('event_date', { ascending: true })

      if (eventError) {
        setError('Failed to load events.')
        console.error('Event query error:', eventError)
      } else {
        setEvents(data)
      }
    }

    fetchEvents()
  }, [])

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?')
    if (!confirmed) return

    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
      alert('Failed to delete event.')
      console.error(error)
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">PTO-Wide Events</h1>
        <div className="flex gap-2">
          <Link
            to="/events/calendar"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            📅 View Calendar
          </Link>
          <Link
            to="/events/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
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
                <Link
                  to={`/events/edit/${event.id}`}
                  className="text-blue-600 hover:underline"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-600 hover:underline"
                >
                  🗑️ Delete
                </button>
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
