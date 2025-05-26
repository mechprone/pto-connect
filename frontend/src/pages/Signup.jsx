import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setMessage('')
    } else {
      setMessage('Check your email to confirm your signup.')
      setError('')
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>
      <input className="border p-2 w-full mb-2" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input className="border p-2 w-full mb-2" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleSignup} className="bg-green-600 text-white px-4 py-2 rounded">Sign Up</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {message && <p className="text-green-600 mt-2">{message}</p>}
    </div>
  )
}
