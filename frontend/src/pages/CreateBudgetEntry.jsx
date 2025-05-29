import { useState } from 'react'
import { supabase } from '../supabaseClient'

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
    const { data: { user } } = await supabase.auth.getUser()
    const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

    const { error } = await supabase
      .from('transactions')
      .insert([{ ...form, created_by: user.id, org_id: orgId }])

    if (error) {
      setError(error.message)
      setMessage('')
    } else {
      setMessage('Budget entry added successfully!')
      setError('')
      setForm({})
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Budget Entry</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="label" value={form.label || ''} onChange={handleChange} placeholder="Label" className="w-full border p-2" required />
        <input type="number" name="amount" value={form.amount || ''} onChange={handleChange} placeholder="Amount" className="w-full border p-2" required />
        <input name="category" value={form.category || ''} onChange={handleChange} placeholder="Category (e.g., supplies, venue)" className="w-full border p-2" />
        <select name="type" value={form.type || ''} onChange={handleChange} className="w-full border p-2">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input name="related_event_id" value={form.related_event_id || ''} onChange={handleChange} placeholder="Related Event ID (optional)" className="w-full border p-2" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Save Entry</button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}