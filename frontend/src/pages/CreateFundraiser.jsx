import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CreateFundraiser() {
  const [form, setForm] = useState({
    title: '',
    goal_amount: '',
    deadline: '',
    description: '',
    share_public: false
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

    const { error } = await supabase
      .from('fundraisers')
      .insert([{ ...form, created_by: user.id, org_id: orgId }])

    if (error) {
      setError(error.message)
      setMessage('')
    } else {
      setMessage('Fundraiser created successfully!')
      setError('')
      setForm({})
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Fundraiser</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title || ''} onChange={handleChange} placeholder="Fundraiser Title" className="w-full border p-2" required />
        <input type="number" name="goal_amount" value={form.goal_amount || ''} onChange={handleChange} placeholder="Goal Amount" className="w-full border p-2" required />
        <input type="date" name="deadline" value={form.deadline || ''} onChange={handleChange} className="w-full border p-2" required />
        <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Description" className="w-full border p-2" />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="share_public" checked={form.share_public || false} onChange={handleChange} />
          <span>Share this fundraiser (minus sensitive info) to the PTO Central Idea Library</span>
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create</button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}