import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Configuration, OpenAIApi } from 'openai'

const openai = new OpenAIApi(new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
}))

export default function AiEventIdeas() {
  const [schoolLevel, setSchoolLevel] = useState('elementary')
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const prompt = `Generate 20 creative and relevant event ideas for a ${schoolLevel} PTO. 
Include a mix of fundraising events, community-building, appreciation, and achievement themes. 
Return a JSON array of objects with title, description, and 3 category tags.`

      const response = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })

      const jsonText = response.data.choices[0].message.content
      const parsedIdeas = JSON.parse(jsonText)
      setIdeas(parsedIdeas)
    } catch (err) {
      console.error(err)
      setError('Failed to generate ideas. Check OpenAI key or quota.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveIdea = async (idea) => {
    const { data: { user } } = await supabase.auth.getUser()
    const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

    const { error } = await supabase.from('events').insert([{
      title: idea.title,
      description: idea.description,
      tags: idea.tags,
      created_by: user.id,
      org_id: orgId
    }])

    if (error) {
      alert('Save failed: ' + error.message)
    } else {
      alert('Idea saved to your events.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI-Powered Event Ideas</h1>
      <div className="mb-4 flex gap-2">
        <select
          className="border p-2"
          value={schoolLevel}
          onChange={(e) => setSchoolLevel(e.target.value)}
        >
          <option value="elementary">Elementary</option>
          <option value="upper elementary">Upper Elementary</option>
          <option value="middle school">Middle School</option>
          <option value="junior high">Junior High</option>
          <option value="high school">High School</option>
        </select>
        <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Generating...' : 'Generate Ideas'}
        </button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-4">
        {ideas.map((idea, idx) => (
          <li key={idx} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{idea.title}</h2>
            <p className="mt-1">{idea.description}</p>
            <p className="text-sm text-blue-700 mt-1">Tags: {idea.tags?.join(', ')}</p>
            <button onClick={() => handleSaveIdea(idea)} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">
              Save to My Events
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}