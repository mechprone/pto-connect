import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function NextStepPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [formData, setFormData] = useState({
    ptoName: '',
    schoolName: '',
    districtName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/signup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...formData })
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/login');
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-xl bg-white p-8 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">Complete Your PTO Setup</h2>

        <div className="grid gap-4">
          <input
            name="ptoName"
            placeholder="PTO Name"
            value={formData.ptoName}
            onChange={handleChange}
            className="p-3 border rounded"
          />
          <input
            name="schoolName"
            placeholder="School Name"
            value={formData.schoolName}
            onChange={handleChange}
            className="p-3 border rounded"
          />
          <input
            name="districtName"
            placeholder="District Name"
            value={formData.districtName}
            onChange={handleChange}
            className="p-3 border rounded"
          />

          <hr className="my-4" />

          <input
            name="adminName"
            placeholder="Your Full Name"
            value={formData.adminName}
            onChange={handleChange}
            className="p-3 border rounded"
          />
          <input
            name="adminEmail"
            type="email"
            placeholder="Email Address"
            value={formData.adminEmail}
            onChange={handleChange}
            className="p-3 border rounded"
          />
          <input
            name="adminPassword"
            type="password"
            placeholder="Password"
            value={formData.adminPassword}
            onChange={handleChange}
            className="p-3 border rounded"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Finish Setup'}
          </button>
        </div>
      </div>
    </div>
  );
}
