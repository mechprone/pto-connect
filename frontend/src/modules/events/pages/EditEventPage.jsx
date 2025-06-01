import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/supabaseClient'

export default function EditEventPage() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single()
      if (error) {
        setError('Failed to load event.')
        console.error(error)
      } else {
        setForm(data)
      }
    }

    loadEvent()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('events').update({
      title: form.title,
      event_date: form.event_date,
      category: form.category,
      school_level: form.school_level,
      share_public: form.share_public
    }).eq('id', id)

    if (error) {
      setError('Update failed.')
      console.error(error)
    } else {
      navigate('/events')
    }
  }

  if (!form) return <p className="p-4">Loading event...</p>

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-semibold mb-4">Edit Event</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input type="date" name="event_date" value={form.event_date} onChange={handleChange} className="w-full border p-2 rounded" required />
        <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded" required>
          <option value="Fundraiser">Fundraiser</option>
          <option value="Meeting">Meeting</option>
          <option value="Celebration">Celebration</option>
          <option value="Other">Other</option>
        </select>
        <select name="school_level" value={form.school_level} onChange={handleChange} className="w-full border p-2 rounded" required>
          <option value="Elementary">Elementary</option>
          <option value="Middle">Middle</option>
          <option value="High">High</option>
        </select>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="share_public" checked={form.share_public} onChange={handleChange} />
          <span>Share Publicly</span>
        </label>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save Changes</button>
      </form>
    </div>
  )
}
