import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/utils/api'

export default function CompleteSignupPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  })
  const [ptoData, setPtoData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get Stripe session data and PTO info
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const stored = sessionStorage.getItem('pendingPto')
    
    if (!stored) {
      setError('Missing PTO information. Please start the signup process again.')
      return
    }
    
    setPtoData(JSON.parse(stored))
    
    // If we have a session_id, the payment was successful
    if (sessionId) {
      // Store session ID for completion
      sessionStorage.setItem('stripeSessionId', sessionId)
    }
  }, [searchParams])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.adminName || !formData.adminEmail || !formData.adminPassword) {
      setError('All fields are required.')
      setLoading(false)
      return
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (formData.adminPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const sessionId = sessionStorage.getItem('stripeSessionId')
      
      const response = await api.post('/signup/complete', {
        ptoName: ptoData.ptoName,
        schoolName: ptoData.schoolName,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        stripeSessionId: sessionId
      })

      if (response.success) {
        // Clear session storage
        sessionStorage.removeItem('pendingPto')
        sessionStorage.removeItem('stripeSessionId')
        
        // Navigate to success page with organization info
        navigate('/onboarding/next-steps', {
          state: { organization: response.organization }
        })
      } else {
        setError(response.error || 'Failed to create account.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!ptoData) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Setup Error</h1>
        <p className="text-gray-700 mb-4">
          Missing PTO information. Please start the signup process again.
        </p>
        <button
          onClick={() => navigate('/onboarding/create-pto')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Start Over
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Complete Your Setup</h1>
        <p className="text-gray-600">
          Creating <strong>{ptoData.ptoName}</strong> at {ptoData.schoolName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Full Name
          </label>
          <input
            type="text"
            name="adminName"
            value={formData.adminName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="adminPassword"
            value={formData.adminPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Create a password"
            minLength="6"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm your password"
            minLength="6"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Complete Setup'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  )
}
