export default function EmailSettings() {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Email Settings (SMTP)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">SMTP Host</label>
          <input className="w-full border rounded px-3 py-2" placeholder="smtp.example.com" disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SMTP Port</label>
          <input className="w-full border rounded px-3 py-2" placeholder="587" disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input className="w-full border rounded px-3 py-2" placeholder="user@example.com" disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input className="w-full border rounded px-3 py-2" placeholder="••••••••" type="password" disabled />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Sender Name/Email</label>
          <input className="w-full border rounded px-3 py-2" placeholder="PTO Connect <noreply@ptoconnect.com>" disabled />
        </div>
      </div>
      <div className="mt-6 flex gap-4 items-center">
        <button className="px-4 py-2 rounded bg-blue-600 text-white font-semibold opacity-50 cursor-not-allowed" disabled>Test Connection</button>
        <span className="text-gray-400">[SMTP editing & testing coming soon]</span>
      </div>
    </div>
  )
} 