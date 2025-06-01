import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState('monthly')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const token = (await supabase.auth.getSession()).data.session.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Checkout session failed to start.')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred during checkout.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Start Your PTO Connect Subscription</h1>
      <p className="mb-4">Subscribe now to unlock all features for your PTO group.</p>

      <div className="mb-4">
        <label className="block font-medium mb-1">Choose a plan:</label>
        <select
          className="border p-2 rounded w-full"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="monthly">Monthly - $29/month</option>
          <option value="annual">Annual - $299/year</option>
        </select>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Redirecting…' : 'Subscribe Now'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  )
}
