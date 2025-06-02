import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Link } from 'react-router-dom'

export default function MessagesDashboard() {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMessages() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required.')
        return
      }

      try {
        const res = await fetch('/api/messages', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load messages.')
        } else {
          setMessages(data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Error connecting to server.')
      }
    }

    fetchMessages()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">PTO Messages</h1>
        <Link to="/messages/create" className="bg-blue-600 text-white px-4 py-2 rounded">
          + New Message
        </Link>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {messages.length === 0 && !error && <p>No messages found.</p>}

      <ul className="space-y-4">
        {messages.map(msg => (
          <li key={msg.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{msg.subject}</h2>
            <p className="text-sm text-gray-500">Type: {msg.send_as}</p>
            <p className="mt-2 whitespace-pre-wrap">{msg.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
