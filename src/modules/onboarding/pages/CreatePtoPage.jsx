import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreatePtoPage() {
  const [ptoName, setPtoName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleContinue = () => {
    setError('')

    if (!ptoName || !schoolName) {
      setError('PTO Name and School Name are required.')
      return
    }

    // Store in sessionStorage (or localStorage, or context)
    const ptoData = {
      ptoName,
      schoolName,
      districtName,
    }
    sessionStorage.setItem('pendingPto', JSON.stringify(ptoData))

    // Navigate to pricing/plan selection (Stripe)
    navigate('/onboarding/pricing')
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Your PTO</h1>
      <p className="text-gray-700 mb-6">
        Let's start by getting your organization set up. Enter your PTO's info below.
      </p>

      <input
        className="border p-2 w-full mb-4"
        type="text"
        placeholder="PTO Name"
        value={ptoName}
        onChange={(e) => setPtoName(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-4"
        type="text"
        placeholder="School Name"
        value={schoolName}
        onChange={(e) => setSchoolName(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-4"
        type="text"
        placeholder="District Name (optional)"
        value={districtName}
        onChange={(e) => setDistrictName(e.target.value)}
      />

      <button
        onClick={handleContinue}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Continue to Plan Selection
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  )
}
