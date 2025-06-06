import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'
import { getDashboardRouteForRole } from '@/utils/roleRoutes'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError || !data?.user) {
      console.error('Login error:', loginError)
      setError(loginError?.message || 'Login failed.')
      return
    }

    const user = data.user
    const role = user?.user_metadata?.role

    if (!role) {
      setError('Your account does not have a role assigned.')
      return
    }

    const dashboardPath = getDashboardRouteForRole(role)
    navigate(dashboardPath)
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Log In</h1>

      <input
        className="border p-2 w-full mb-2"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        className="border p-2 w-full mb-4"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Log In
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
