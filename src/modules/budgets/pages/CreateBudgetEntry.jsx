import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function CreateBudgetEntry() {
  const [form, setForm] = useState({
    label: '',
    amount: '',
    category: '',
    type: 'expense',
    related_event_id: ''
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
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Submission failed.')
      } else {
        setMessage('Budget entry added successfully!')
        setForm({
          label: '',
          amount: '',
          category: '',
          type: 'expense',
          related_event_id: ''
        })
      }
    } catch (err) {
      console.error('Budget entry error:', err)
      setError('Server error. Please try again.')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Budget Entry</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="label"
          value={form.label}
          onChange={handleChange}
          placeholder="Label"
          className="w-full border p-2"
          required
        />
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="w-full border p-2"
          required
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category (e.g., supplies, venue)"
          className="w-full border p-2"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          name="related_event_id"
          value={form.related_event_id}
          onChange={handleChange}
          placeholder="Related Event ID (optional)"
          className="w-full border p-2"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Save Entry
        </button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
