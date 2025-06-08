import React from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'

export default function CreateFundraiser() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal_amount: '',
    deadline: '',
    share_public: false
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
      const res = await fetch('/api/fundraisers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(form)
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Submission failed.')
      } else {
        setMessage('Fundraiser created!')
        setTimeout(() => navigate('/fundraisers'), 1500)
      }
    } catch (err) {
      console.error('Create fundraiser error:', err)
      setError('Server error. Try again.')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Fundraiser</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border p-2"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2"
        />
        <input
          name="goal_amount"
          value={form.goal_amount}
          onChange={handleChange}
          type="number"
          placeholder="Goal Amount"
          className="w-full border p-2"
          required
        />
        <input
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          type="date"
          className="w-full border p-2"
          required
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="share_public"
            checked={form.share_public}
            onChange={handleChange}
          />
          <span>Share this fundraiser to the public library</span>
        </label>

        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Create Fundraiser
        </button>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
