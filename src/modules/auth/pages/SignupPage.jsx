import React from 'react';
import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

const elevatedRoles = ['admin', 'treasurer', 'board_member']

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ptoCode, setPtoCode] = useState('')
  const [role, setRole] = useState('parent_member')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    setError('')
    setMessage('')

    if (!email || !password || !ptoCode || !role) {
      setError('All fields are required.')
      return
    }

    // Step 1: Lookup organization by code (case-insensitive)
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .ilike('signup_code', ptoCode)
      .single()

    if (orgError || !org?.id) {
      console.error('PTO code lookup failed:', orgError)
      setError('Invalid PTO code. Please check with your organization.')
      return
    }

    const orgId = org.id

    // Step 2: Create user in Supabase Auth
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          org_id: orgId,
          role,
        },
      },
    })

    if (signupError || !data?.user) {
      console.error('Signup error:', signupError)
      setError(signupError?.message || 'Signup failed.')
      return
    }

    const user = data.user
    const approved = !elevatedRoles.includes(role)

    // Step 3: Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      console.warn('Profile already exists, skipping insert.')
      setMessage('Signup successful! You can now log in.')
      return
    }

    // Step 4: Insert new profile if not found
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        email,
        org_id: orgId,
        role,
        approved,
      },
    ])

    if (profileError) {
      console.error('Profile insert error:', profileError)
      setError('Signup successful, but failed to save profile.')
    } else {
      const approvalMsg = approved
        ? 'Signup successful! You can now log in.'
        : 'Signup submitted. An admin must approve your role before you can access the system.'

      setMessage(approvalMsg)
      setEmail('')
      setPassword('')
      setPtoCode('')
      setRole('parent_member')
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>

      <input
        className="border p-2 w-full mb-2"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        className="border p-2 w-full mb-2"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <input
        className="border p-2 w-full mb-2"
        type="text"
        value={ptoCode}
        onChange={(e) => setPtoCode(e.target.value)}
        placeholder="PTO Code (e.g. abc123xy)"
        required
      />
      <select
        className="border p-2 w-full mb-4"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value="parent_member">Parent Member</option>
        <option value="teacher">Teacher</option>
        <option value="volunteer">Volunteer</option>
        <option value="committee_lead">Committee Lead</option>
        <option value="board_member">Board Member</option>
        <option value="treasurer">Treasurer</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={handleSignup}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Sign Up
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {message && <p className="text-green-600 mt-2">{message}</p>}
    </div>
  )
}