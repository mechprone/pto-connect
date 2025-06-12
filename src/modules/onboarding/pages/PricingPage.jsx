import React from 'react';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PricingPage() {
  const [ptoData, setPtoData] = useState(null)
  const [prices, setPrices] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Load PTO info from sessionStorage
    const stored = sessionStorage.getItem('pendingPto')
    if (!stored) {
      setError('Missing PTO info. Please start again.')
    } else {
      setPtoData(JSON.parse(stored))
    }

    // Fetch Stripe prices
    fetch('/api/stripe/get-prices')
      .then((res) => res.json())
      .then(setPrices)
      .catch(() => setError('Could not load pricing. Please try again.'))
  }, [])

  const handlePlanSelect = async (priceId, lookupKey) => {
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Auth will be added later for logged-in flow, if needed
        },
        body: JSON.stringify({
          priceId,
          ptoMetadata: ptoData,
          plan: lookupKey === 'annual_plan' ? 'annual' : 'monthly',
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Unable to start checkout session.')
      }
    } catch (err) {
      setError('Stripe checkout error.')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Choose Your Plan</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-4">
        {prices.map((plan) => (
          <button
            key={plan.id}
            onClick={() => handlePlanSelect(plan.id, plan.lookup_key)}
            className="w-full py-3 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {plan.nickname || plan.lookup_key} – ${plan.amount}/{plan.interval}
          </button>
        ))}
      </div>
    </div>
  )
}
