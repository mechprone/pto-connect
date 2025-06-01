import { useState } from 'react'
import { supabase } from '@/supabaseClient'

export default function CreateMessage() {
  const [form, setForm] = useState({
    subject: '',
    body: '',
    send_as: 'email'
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setError('Authentication required.')
      return
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send message.')
      } else {
        setMessage('Message created successfully!')
        setForm({
          subject: '',
          body: '',
          send_as: 'email'
        })
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Server error. Please try again.')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Message</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="w-full border p-2"
          required
        />
        <textarea
          name="body"
          value={form.body}
          onChange={handleChange}
          placeholder="Message Body"
          className="w-full border p-2"
          required
        />
        <select
          name="send_as"
          value={form.send_as}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="in_app">In-App</option>
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          Send Message
        </button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
