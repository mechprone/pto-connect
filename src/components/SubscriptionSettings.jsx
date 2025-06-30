export default function SubscriptionSettings() {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Subscription</h2>
      <div className="mb-4">
        <div className="font-bold">Current Plan:</div>
        <div className="text-gray-600">[Plan Name]</div>
      </div>
      <div className="mb-4">
        <div className="font-bold">Renewal Date:</div>
        <div className="text-gray-600">[2025-12-31]</div>
      </div>
      <div className="mb-4">
        <div className="font-bold">Payment Method:</div>
        <div className="text-gray-600">[Visa •••• 1234]</div>
      </div>
      <button className="px-4 py-2 rounded bg-blue-600 text-white font-semibold opacity-50 cursor-not-allowed" disabled>Manage Subscription</button>
      <div className="mt-6 text-gray-400 italic">[Subscription management coming soon]</div>
    </div>
  )
} 