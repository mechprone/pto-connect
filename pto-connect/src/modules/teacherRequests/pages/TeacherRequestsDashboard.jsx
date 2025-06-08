import React from 'react';
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Link } from 'react-router-dom'

export default function TeacherRequestsDashboard() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRequests() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required.')
        return
      }

      try {
        const res = await fetch('/api/teacher-requests', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load teacher requests.')
        } else {
          setRequests(data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Error connecting to server.')
      }
    }

    fetchRequests()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teacher Requests</h1>
        <Link to="/teacher-requests/create" className="bg-blue-600 text-white px-4 py-2 rounded">
          + New Request
        </Link>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {requests.length === 0 && !error && <p>No teacher requests found.</p>}

      <ul className="space-y-4">
        {requests.map(req => (
          <li key={req.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{req.title}</h2>
            <p className="text-sm text-gray-500">By {req.teacher_name} ({req.grade_or_subject})</p>
            <p className="mt-2">{req.description}</p>
            {req.amount_requested && (
              <p className="mt-2 text-blue-800 font-semibold">
                Requested: ${parseFloat(req.amount_requested).toFixed(2)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
