import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function MessagesDashboard() {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMessages() {
      const user = (await supabase.auth.getUser()).data.user
      const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load messages.')
        console.error(error)
      } else {
        setMessages(data)
      }
    }

    fetchMessages()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">PTO Messages</h1>
        <Link to="/messages/create" className="bg-blue-600 text-white px-4 py-2 rounded">+ New Message</Link>
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