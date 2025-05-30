import { useState } from 'react'

export default function AiEventIdeas() {
  const [schoolLevel, setSchoolLevel] = useState('elementary')
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchIdeas = async () => {
    setLoading(true)
    setError(null)
    setIdeas([])

    try {
      const res = await fetch('https://pto-central-backend.onrender.com/api/generate-event-ideas', {
  	method: 'POST',
  	headers: {
    	'Content-Type': 'application/json'
  },
  body: JSON.stringify({ schoolLevel })
})


      const data = await res.json()
      if (res.ok) {
        setIdeas(data.ideas || [])
      } else {
        setError(data.error || 'Failed to generate ideas')
      }
    } catch (err) {
      setError('Error contacting the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">AI-Generated Event Ideas</h2>

      <div className="mb-4">
        <label className="block mb-2 font-medium text-sm">Select school level:</label>
        <select
          value={schoolLevel}
          onChange={(e) => setSchoolLevel(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="elementary">Elementary</option>
          <option value="upper elementary">Upper Elementary</option>
          <option value="middle school">Middle School</option>
          <option value="junior high">Junior High</option>
          <option value="high school">High School</option>
        </select>
      </div>

      <button
        onClick={fetchIdeas}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Ideas'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {ideas.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Suggested Events:</h3>
          <ul className="space-y-4">
            {ideas.map((idea, index) => (
              <li key={index} className="border p-4 rounded shadow-sm bg-white">
                <h4 className="font-bold text-blue-700">{idea.title}</h4>
                <p className="text-sm text-gray-700">{idea.description}</p>
                <p className="text-xs mt-1 text-gray-500">Tags: {idea.tags?.join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}