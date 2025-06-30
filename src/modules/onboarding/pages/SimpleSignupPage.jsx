import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/utils/api'

export default function SimpleSignupPage() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    ptoName: '',
    schoolName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

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
    if (!formData.ptoName || !formData.schoolName || !formData.adminName || !formData.adminEmail || !formData.adminPassword) {
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
      const response = await api.post('/signup/complete', {
        ptoName: formData.ptoName,
        schoolName: formData.schoolName,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
        // No Stripe session for testing
      })

      if (response.data && response.data.success) {
        setSuccess(response.data.organization)
        setError('')
      } else {
        setError(response.data?.error || 'Failed to create account.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-green-800 mb-4">Success! 🎉</h1>
          <p className="text-green-700 mb-4">
            Your organization <strong>{success.name}</strong> has been created successfully!
          </p>
          <div className="bg-white border border-green-300 rounded p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Your signup code:</p>
            <p className="text-lg font-mono font-bold text-green-800">{success.signup_code}</p>
          </div>
          <p className="text-sm text-green-600">
            Share this code with other members to join your organization.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Create Another Organization
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Create Your PTO Organization</h1>
        <p className="text-gray-600">
          Set up your PTO and create your admin account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PTO Name
          </label>
          <input
            type="text"
            name="ptoName"
            value={formData.ptoName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Lincoln Elementary PTO"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School Name
          </label>
          <input
            type="text"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Lincoln Elementary School"
            required
          />
        </div>

        <hr className="my-4" />

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
          {loading ? 'Creating Organization...' : 'Create Organization'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>This will create a trial organization (14 days)</p>
        <p className="mt-2">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  )
}
