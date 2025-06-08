import React from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'
import { getDashboardRouteForRole } from '@/utils/roleRoutes'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault()
    }
    
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      setLoading(false)
      return
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError || !data?.user) {
      console.error('Login error:', loginError)
      setError(loginError?.message || 'Login failed.')
      setLoading(false)
      return
    }

    const user = data.user
    const role = user?.user_metadata?.role

    if (!role) {
      setError('Your account does not have a role assigned.')
      setLoading(false)
      return
    }

    const dashboardPath = getDashboardRouteForRole(role)
    navigate(dashboardPath)
    
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Log In</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={loading}
          autoComplete="email"
        />
        <input
          className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={loading}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  )
}
