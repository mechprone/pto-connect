import { useState } from 'react'
import { supabase } from '@/supabaseClient'
import axios from 'axios'
import { jsPDF } from 'jspdf'

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
    setMessage('')
    setError('')

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(form)
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Failed to create event')
        return
      }

      setMessage('Event created successfully!')
      setForm({
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
    } catch (err) {
      setError('Failed to connect to server.')
      console.error('Submit error:', err)
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
    try {
      const aiJson = JSON.parse(aiResult)
      setForm(prev => ({
        ...prev,
        title: aiJson.title || '',
        description: aiJson.description || '',
        event_date: aiJson.event_date || '',
        category: aiJson.category || '',
        school_level: aiJson.school_level || '',
        location: aiJson.location || '',
        estimated_budget: aiJson.estimated_budget || ''
      }))
    } catch (err) {
      alert('Failed to parse AI response. Please review the output and enter manually.')
      console.error('Parse error:', err)
    }
  }

  const handlePrintSummary = () => {
    try {
      const parsed = JSON.parse(aiResult)
      const doc = new jsPDF()

      doc.setFontSize(14)
      doc.text(parsed.title || 'Event Summary', 10, 20)

      doc.setFontSize(10)
      doc.text(`Date: ${parsed.event_date || 'TBD'}`, 10, 30)
      doc.text(`Category: ${parsed.category || 'N/A'}`, 10, 36)
      doc.text(`School Level: ${parsed.school_level || 'N/A'}`, 10, 42)

      doc.setFontSize(12)
      doc.text('Description:', 10, 52)
      doc.setFontSize(10)
      doc.text(doc.splitTextToSize(parsed.description || '', 180), 10, 58)

      doc.setFontSize(12)
      doc.text('Planning Tasks:', 10, 100)
      const tasks = parsed.tasks || []
      tasks.forEach((task, i) => {
        doc.text(`- ${task}`, 10, 106 + i * 6)
      })

      doc.save(`${parsed.title || 'event-summary'}.pdf`)
    } catch (err) {
      alert('Unable to print. Please check that the AI returned a valid result.')
      console.error('Print error:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Create New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" className="w-full border p-2" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2" />
        <input type="date" name="event_date" value={form.event_date} onChange={handleChange} className="w-full border p-2" required />
        <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className="w-full border p-2" />
        <input type="time" name="end_time" value={form.end_time} onChange={handleChange} className="w-full border p-2" />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full border p-2" />
        <select name="school_level" value={form.school_level} onChange={handleChange} className="w-full border p-2">
          <option value="elementary">Elementary</option>
          <option value="upper_elementary">Upper Elementary</option>
          <option value="middle">Middle</option>
          <option value="junior_high">Junior High</option>
          <option value="high">High School</option>
        </select>
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category (e.g., Fundraiser)" className="w-full border p-2" />
        <input name="estimated_budget" value={form.estimated_budget} onChange={handleChange} placeholder="Estimated Budget" className="w-full border p-2" />
        <select name="visibility" value={form.visibility} onChange={handleChange} className="w-full border p-2">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="share_public" checked={form.share_public} onChange={handleChange} />
          <span>Share this event to the PTO Connect Idea Library</span>
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
                <div className="flex gap-2 mt-2">
                  <button onClick={applyAIToForm} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    Use This Event
                  </button>
                  <button onClick={handlePrintSummary} className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                    Print Summary
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
