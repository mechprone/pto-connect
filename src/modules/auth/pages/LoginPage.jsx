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
    
    console.log('🔍 [LOGIN DEBUG] Login attempt started');
    console.log('🔍 [LOGIN DEBUG] Email:', email);
    
    setLoading(true)
    setError('')

    if (!email || !password) {
      console.log('❌ [LOGIN DEBUG] Missing email or password');
      setError('Email and password are required.')
      setLoading(false)
      return
    }

    console.log('🔍 [LOGIN DEBUG] Calling Supabase signInWithPassword...');
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('🔍 [LOGIN DEBUG] Supabase response:', {
      user: !!data?.user,
      session: !!data?.session,
      error: loginError
    });

    if (loginError || !data?.user) {
      console.error('❌ [LOGIN DEBUG] Login error:', loginError)
      setError(loginError?.message || 'Login failed.')
      setLoading(false)
      return
    }

    const user = data.user
    console.log('🔍 [LOGIN DEBUG] User authenticated:', {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata
    });

    // Get role from profiles table instead of user metadata
    console.log('🔍 [LOGIN DEBUG] Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, org_id, approved')
      .eq('id', user.id)
      .single();

    console.log('🔍 [LOGIN DEBUG] Profile query result:', {
      profile,
      profileError
    });

    if (profileError || !profile) {
      console.error('❌ [LOGIN DEBUG] Profile fetch error:', profileError);
      setError('Unable to load user profile. Please contact support.');
      setLoading(false)
      return
    }

    if (!profile.approved) {
      console.log('❌ [LOGIN DEBUG] User not approved');
      setError('Your account is pending approval. Please contact an administrator.');
      setLoading(false)
      return
    }

    const role = profile.role;
    console.log('🔍 [LOGIN DEBUG] User role:', role);

    if (!role) {
      console.log('❌ [LOGIN DEBUG] No role assigned');
      setError('Your account does not have a role assigned.')
      setLoading(false)
      return
    }

    console.log('🔍 [LOGIN DEBUG] Getting dashboard route for role:', role);
    const dashboardPath = getDashboardRouteForRole(role)
    console.log('🔍 [LOGIN DEBUG] Navigating to:', dashboardPath);
    
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
