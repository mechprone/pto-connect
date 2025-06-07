import React from 'react';
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { Link } from 'react-router-dom'

export default function BudgetDashboard() {
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTransactions() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required.')
        return
      }

      try {
        const res = await fetch('/api/budgets', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load transactions.')
        } else {
          setTransactions(data)
        }
      } catch (err) {
        console.error('Budget fetch error:', err)
        setError('Error connecting to the server.')
      }
    }

    fetchTransactions()
  }, [])

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">PTO Budget Overview</h1>
        <Link to="/budget/create" className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Entry</Link>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-100">
        <p className="text-lg font-semibold">Current Balance: ${balance.toFixed(2)}</p>
        <p className="text-sm text-green-700">Total Income: ${totalIncome.toFixed(2)}</p>
        <p className="text-sm text-red-700">Total Expenses: ${totalExpense.toFixed(2)}</p>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {transactions.length === 0 && !error && <p>No budget entries found.</p>}

      <ul className="space-y-4">
        {transactions.map(entry => (
          <li key={entry.id} className="border p-4 rounded shadow-sm bg-white">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">{entry.label}</h2>
              <span className={entry.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                {entry.type === 'income' ? '+' : '-'}${parseFloat(entry.amount).toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-500">{entry.category || 'Uncategorized'}</p>
            {entry.related_event_id && (
              <p className="text-sm text-blue-700 mt-1">Event ID: {entry.related_event_id}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
