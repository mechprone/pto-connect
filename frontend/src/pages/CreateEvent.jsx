import { useState } from 'react'
import { supabase } from '../supabaseClient'
import axios from 'axios'

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

  // AI Assistant state
  const [showAI, setShowAI] = useState(false)
  const [aiForm, setAiForm] = useState({
    type: '',
    season: '',
    audience: '',
    theme: '',
    goal: ''
  })
  const [aiResult, setAiResult] = useState('')

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

  const handleAIChange = (e) => {
    const { name, value } = e.target
    setAiForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAIGenerate = async () => {
    setAiResult('Generating...')
    try {
      const { data } = await axios.post('/api/ai/generate-event', aiForm)
      setAiResult(data.result)
    } catch (err) {
      setAiResult('AI generation failed.')
    }
  }

  const applyAIToForm = () => {
    alert('This will eventually parse the AI response and populate the form fields. For now, you can copy/paste manually.')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Create New Event</h1>

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
          <span>Share this event (without private details) to the PTO Connect Idea Library</span>
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create Event</button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>

      <div className="border-t pt-6">
        <button onClick={() => setShowAI(!showAI)} className="text-blue-600 underline">
          {showAI ? 'Hide AI Event Assistant' : 'Use AI Event Assistant'}
        </button>

        {showAI && (
          <div className="mt-4 space-y-3">
            <h2 className="text-xl font-semibold">AI Event Assistant</h2>
            <input type="text" name="type" placeholder="Event Type" value={aiForm.type} onChange={handleAIChange} className="w-full border p-2" />
            <input type="text" name="season" placeholder="Season or Month" value={aiForm.season} onChange={handleAIChange} className="w-full border p-2" />
            <input type="text" name="audience" placeholder="Audience (e.g. families, teachers)" value={aiForm.audience} onChange={handleAIChange} className="w-full border p-2" />
            <input type="text" name="theme" placeholder="Theme (e.g. fall festival)" value={aiForm.theme} onChange={handleAIChange} className="w-full border p-2" />
            <input type="text" name="goal" placeholder="Goal (e.g. raise funds for library)" value={aiForm.goal} onChange={handleAIChange} className="w-full border p-2" />
            <button onClick={handleAIGenerate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Generate Event Idea
            </button>
            {aiResult && (
              <div className="border p-4 mt-4 bg-gray-50 rounded">
                <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
                <button onClick={applyAIToForm} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                  Use This Event
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
