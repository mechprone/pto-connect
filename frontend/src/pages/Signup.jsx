import { useState } from 'react'
import { supabase } from '@/supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgId, setOrgId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    if (!orgId) {
      setError('Organization ID is required.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          org_id: orgId
        }
      }
    })

    if (error) {
      setError(error.message)
      setMessage('')
    } else {
      setMessage('Signup successful! You can now log in.')
      setError('')
      console.log('✅ Supabase signup response:', data)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>
      <input
        className="border p-2 w-full mb-2"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="border p-2 w-full mb-2"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />
      <input
        className="border p-2 w-full mb-2"
        type="text"
        value={orgId}
        onChange={e => setOrgId(e.target.value)}
        placeholder="Organization ID (required)"
      />
      <button
        onClick={handleSignup}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Sign Up
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {message && <p className="text-green-600 mt-2">{message}</p>}
    </div>
  )
}
