import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function AiEventIdeas() {
  const [form, setForm] = useState({
    type: '',
    season: '',
    audience: '',
    theme: '',
    goal: ''
  })

  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setIdeas([])

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError || !session?.access_token) {
      setError('Authentication required.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/ai/generate-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (data.result) {
        const parsedIdeas = data.result
          .split(/\n?\d+\.\s/)
          .filter(Boolean)
          .map(item => item.trim().replace(/^\*\*/, '').replace(/\*\*$/, ''))
        setIdeas(parsedIdeas)
      } else {
        setError('No ideas returned.')
      }
    } catch (err) {
      console.error(err)
      setError('Error contacting the backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Event Idea Generator</h1>

      <div className="grid gap-4 mb-4">
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Event Type (e.g. Family Night)"
          className="w-full border p-2 rounded"
        />
        <input
          name="season"
          value={form.season}
          onChange={handleChange}
          placeholder="Season or Month (e.g. Spring, October)"
          className="w-full border p-2 rounded"
        />
        <input
          name="audience"
          value={form.audience}
          onChange={handleChange}
          placeholder="Audience (e.g. students, families)"
          className="w-full border p-2 rounded"
        />
        <input
          name="theme"
          value={form.theme}
          onChange={handleChange}
          placeholder="Theme (e.g. carnival, STEM)"
          className="w-full border p-2 rounded"
        />
        <input
          name="goal"
          value={form.goal}
          onChange={handleChange}
          placeholder="Goal (e.g. raise funds, build community)"
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Generating...' : 'Generate Ideas'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {ideas.length > 0 && (
        <ul className="mt-6 space-y-2">
          {ideas.map((idea, index) => (
            <li key={index} className="border p-3 rounded bg-gray-50">
              {idea}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
