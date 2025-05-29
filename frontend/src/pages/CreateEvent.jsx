import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    school_level: 'elementary',
    category: '',
    visibility: 'public',
    estimated_budget: '',
    share_public: false
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

    const { error } = await supabase
      .from('events')
      .insert([{ ...form, created_by: user.id, org_id: orgId }])

    if (error) {
      setError(error.message)
      setMessage('')
    } else {
      setMessage('Event created successfully!')
      setError('')
      setForm({})
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title || ''} onChange={handleChange} placeholder="Event Title" className="w-full border p-2" required />
        <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Description" className="w-full border p-2" />
        <input type="date" name="event_date" value={form.event_date || ''} onChange={handleChange} className="w-full border p-2" required />
        <input type="time" name="start_time" value={form.start_time || ''} onChange={handleChange} className="w-full border p-2" />
        <input type="time" name="end_time" value={form.end_time || ''} onChange={handleChange} className="w-full border p-2" />
        <input name="location" value={form.location || ''} onChange={handleChange} placeholder="Location" className="w-full border p-2" />
        <select name="school_level" value={form.school_level || ''} onChange={handleChange} className="w-full border p-2">
          <option value="elementary">Elementary</option>
          <option value="upper_elementary">Upper Elementary</option>
          <option value="middle">Middle</option>
          <option value="junior_high">Junior High</option>
          <option value="high">High School</option>
        </select>
        <input name="category" value={form.category || ''} onChange={handleChange} placeholder="Category (e.g., Fundraiser)" className="w-full border p-2" />
        <input name="estimated_budget" value={form.estimated_budget || ''} onChange={handleChange} placeholder="Estimated Budget" className="w-full border p-2" />
        <select name="visibility" value={form.visibility || ''} onChange={handleChange} className="w-full border p-2">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="share_public" checked={form.share_public || false} onChange={handleChange} />
          <span>Share this event (without private details) to the PTO Central Idea Library</span>
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create Event</button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}