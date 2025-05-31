import { useState } from 'react'

export default function AiEventIdeas() {
  const [schoolLevel, setSchoolLevel] = useState('elementary')
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setIdeas([])

    try {
      const response = await fetch('https://pto-connect-backend.onrender.com/generate-event-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolLevel }),
      })

      const data = await response.json()

      if (data.ideas) {
        const parsedIdeas = data.ideas
          .split(/\n?\d+\.\s/)
          .filter(Boolean)
          .map(item =>
            item.trim().replace(/^\*\*/, '').replace(/\*\*$/, '')
          )
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
      <label className="block mb-2">
        Select School Level:
        <select
          value={schoolLevel}
          onChange={e => setSchoolLevel(e.target.value)}
          className="block w-full mt-1 p-2 border rounded"
        >
          <option value="elementary">Elementary</option>
          <option value="upper elementary">Upper Elementary</option>
          <option value="middle school">Middle School</option>
          <option value="junior high">Junior High</option>
          <option value="high school">High School</option>
        </select>
      </label>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
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
