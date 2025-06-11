import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Copy, Users, Settings, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function NextStepPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  
  const organization = location.state?.organization

  const copySignupCode = () => {
    if (organization?.signup_code) {
      navigator.clipboard.writeText(organization.signup_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!organization) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Setup Error</h1>
        <p className="text-gray-700 mb-4">
          Missing organization information. Please complete the signup process.
        </p>
        <button
          onClick={() => navigate('/onboarding/create-pto')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Start Setup
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to PTO Connect!
        </h1>
        <p className="text-lg text-gray-600">
          Your organization <strong>{organization.name}</strong> has been successfully created.
        </p>
      </div>

      {/* Organization Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          Your Organization Details
        </h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-blue-800">Organization Name:</span>
            <span className="ml-2 text-blue-700">{organization.name}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Organization ID:</span>
            <span className="ml-2 text-blue-700 font-mono text-sm">{organization.slug}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-blue-800">Signup Code:</span>
            <span className="ml-2 text-blue-700 font-mono text-lg font-bold">
              {organization.signup_code}
            </span>
            <button
              onClick={copySignupCode}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800"
              title="Copy signup code"
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && (
              <span className="ml-2 text-green-600 text-sm">Copied!</span>
            )}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Next Steps to Get Started
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Invite Your Team</h3>
              <p className="text-gray-600 text-sm">
                Share your signup code <strong>{organization.signup_code}</strong> with other PTO members, 
                teachers, and parents so they can join your organization.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Configure Your Settings</h3>
              <p className="text-gray-600 text-sm">
                Set up your organization preferences, communication settings, and user roles.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Create Your First Event</h3>
              <p className="text-gray-600 text-sm">
                Start engaging your community by creating your first PTO event or meeting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/login')}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
        
        <button
          onClick={() => navigate('/onboarding/create-pto')}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Create Another PTO
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Need Help?</h3>
        <p className="text-yellow-700 text-sm">
          Check out our getting started guide or contact support if you need assistance 
          setting up your PTO organization.
        </p>
      </div>
    </div>
  )
}
