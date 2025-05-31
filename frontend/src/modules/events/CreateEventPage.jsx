// src/pages/CreateEvent.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function CreateEventPage() {
  const [form, setForm] = useState({
    title: '',
    event_date: '',
    category: '',
    school_level: '',
    share_public: false
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const user = (await supabase.auth.getUser()).data.user
    const org_id = user?.user_metadata?.org_id || user?.app_metadata?.org_id

    const { error: insertError } = await supabase.from('events').insert([
      {
        title: form.title,
        event_date: form.event_date,
        category: form.category,
        school_level: form.school_level,
        share_public: form.share_public,
        org_id,
        created_by: user.id
      }
    ])

    if (insertError) {
      setError('Failed to create event.')
      console.error(insertError)
    } else {
      navigate('/events')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-semibold mb-4">Create New Event</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="date"
          name="event_date"
          value={form.event_date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="Fundraiser">Fundraiser</option>
          <option value="Meeting">Meeting</option>
          <option value="Celebration">Celebration</option>
          <option value="Other">Other</option>
        </select>
        <select
          name="school_level"
          value={form.school_level}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select School Level</option>
          <option value="Elementary">Elementary</option>
          <option value="Middle">Middle</option>
          <option value="High">High</option>
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="share_public"
            checked={form.share_public}
            onChange={handleChange}
          />
          <span>Share Publicly</span>
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Event
        </button>
      </form>
    </div>
  )
}
