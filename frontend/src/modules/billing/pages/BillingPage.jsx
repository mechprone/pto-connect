import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'
import { API_BASE_URL } from '@/utils/api'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const token = (await supabase.auth.getSession()).data.session.access_token
      const res = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
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
