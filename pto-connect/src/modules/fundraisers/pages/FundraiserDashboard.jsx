import React from 'react';
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Link } from 'react-router-dom'

export default function FundraiserDashboard() {
  const [fundraisers, setFundraisers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchFundraisers() {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        setError('Authentication error. Please log in again.')
        return
      }

      try {
        const res = await fetch('/api/fundraisers', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })

        const result = await res.json()

        if (!res.ok) {
          setError(result.error || 'Failed to load fundraisers.')
        } else {
          setFundraisers(result)
        }
      } catch (err) {
        console.error(err)
        setError('Error connecting to the server.')
      }
    }

    fetchFundraisers()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">PTO Fundraisers</h1>
        <Link to="/fundraisers/create" className="bg-blue-600 text-white px-4 py-2 rounded">+ New Fundraiser</Link>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {fundraisers.length === 0 && !error && <p>No fundraisers found.</p>}

      <ul className="space-y-4">
        {fundraisers.map(fundraiser => (
          <li key={fundraiser.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{fundraiser.title}</h2>
            <p className="text-sm text-gray-500">
              Goal: ${fundraiser.goal_amount} • Deadline: {fundraiser.deadline}
            </p>
            <p className="mt-2">{fundraiser.description}</p>
            {fundraiser.share_public && (
              <span className="text-xs inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded">
                Shared to Library
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
