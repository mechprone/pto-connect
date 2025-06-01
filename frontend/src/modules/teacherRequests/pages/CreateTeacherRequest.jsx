import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CreateTeacherRequest() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount_requested: '',
    teacher_name: '',
    grade_or_subject: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setError('You must be logged in to submit a request.')
      return
    }

    try {
      const res = await fetch('/api/teacher-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit request')
        setMessage('')
      } else {
        setMessage('Request submitted successfully!')
        setError('')
        setForm({})
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Network error or server unavailable')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Teacher Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title || ''} onChange={handleChange} placeholder="Title" className="w-full border p-2" required />
        <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Description" className="w-full border p-2" />
        <input type="number" name="amount_requested" value={form.amount_requested || ''} onChange={handleChange} placeholder="Amount Requested" className="w-full border p-2" />
        <input name="teacher_name" value={form.teacher_name || ''} onChange={handleChange} placeholder="Teacher Name" className="w-full border p-2" />
        <input name="grade_or_subject" value={form.grade_or_subject || ''} onChange={handleChange} placeholder="Grade or Subject" className="w-full border p-2" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Submit</button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
