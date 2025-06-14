import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'https://api.ptoconnect.com'

export default function DocumentsDashboard() {
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDocs() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return setError('Not authenticated.')

      try {
        const res = await axios.get(`${API_BASE_URL}/api/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDocuments(res.data)
      } catch (err) {
        setError('Failed to load documents.')
        console.error(err)
      }
    }

    fetchDocs()
  }, [])

  const getPublicUrl = (filePath) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
    return data?.publicUrl
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">PTO Documents</h1>
        <Link to="/documents/upload" className="bg-blue-600 text-white px-4 py-2 rounded">+ Upload Document</Link>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {documents.length === 0 && !error && <p>No documents found.</p>}

      <ul className="space-y-4">
        {documents.map(doc => (
          <li key={doc.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-lg font-semibold">{doc.title}</h2>
            <a
              href={getPublicUrl(doc.file_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline text-sm"
            >
              View / Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
