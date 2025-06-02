import { useState } from 'react';

export default function PricingPage() {
  const [plan, setPlan] = useState('monthly');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email })
      });

      const data = await res.json();

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Choose Your Plan</h1>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Email Address</label>
          <input
            type="email"
            className="border p-2 rounded-md w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label className="text-sm font-medium mt-4">Select Plan</label>
          <div className="flex justify-between gap-4">
            <button
              onClick={() => setPlan('monthly')}
              className={`w-1/2 p-3 rounded-lg border text-center ${plan === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Monthly<br /><span className="text-sm font-normal">$29/month</span>
            </button>
            <button
              onClick={() => setPlan('annual')}
              className={`w-1/2 p-3 rounded-lg border text-center ${plan === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Annual<br /><span className="text-sm font-normal">$290/year</span>
            </button>
          </div>

          <button
            onClick={handleSubscribe}
            className="mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Redirecting...' : 'Start Free Trial'}
          </button>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
