import React from 'react';
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Link } from 'react-router-dom'
import { Sparkles, Zap, Calendar, Users, DollarSign, Settings } from 'lucide-react'

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

      try {
        const res = await fetch('/api/events', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })

        const result = await res.json()

        if (!res.ok) {
          setError(result.error || 'Failed to load events')
        } else {
          setEvents(result)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to connect to server.')
      }
    }

    fetchEvents()
  }, [])

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?')
    if (!confirmed) return

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      alert('You must be logged in to delete events.')
      return
    }

    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (!res.ok) {
      alert('Failed to delete event.')
      console.error('Delete error:', await res.text())
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your PTO events with Stella AI assistance</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/events/calendar"
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar View</span>
          </Link>
          <Link
            to="/events/create-enhanced"
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Event with Stella</span>
          </Link>
        </div>
      </div>

      {/* Stella AI Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/events/create-enhanced"
          className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-purple-200 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">AI-Powered Event Creation</h3>
              <p className="text-sm text-gray-600 mt-1">Let Stella create complete event workflows automatically</p>
              <div className="flex items-center space-x-1 mt-2 text-xs text-purple-600">
                <Sparkles className="w-3 h-3" />
                <span>Full workflow automation</span>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/ai-workflow-orchestrator"
          className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-pink-200 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Workflow Orchestrator</h3>
              <p className="text-sm text-gray-600 mt-1">Manage and optimize your event workflows</p>
              <div className="flex items-center space-x-1 mt-2 text-xs text-purple-600">
                <Users className="w-3 h-3" />
                <span>Advanced management</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Event Insights</h3>
              <p className="text-sm text-gray-600 mt-1">AI-powered analytics and recommendations</p>
              <div className="text-xs text-green-600 mt-2">
                Coming soon in Phase 2.1
              </div>
            </div>
          </div>
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