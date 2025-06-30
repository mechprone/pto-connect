export default function OrganizationInfo() {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Organization Info</h2>
      <div className="flex items-center gap-6 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-gray-400">Logo</div>
        <div>
          <div className="font-bold text-lg mb-1">[Organization Name]</div>
          <div className="text-gray-500">[School/Year/Timezone]</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Contact Email</label>
          <input className="w-full border rounded px-3 py-2" placeholder="contact@email.com" disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input className="w-full border rounded px-3 py-2" placeholder="123 Main St" disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input className="w-full border rounded px-3 py-2" placeholder="(555) 555-5555" disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <input className="w-full border rounded px-3 py-2" placeholder="America/Chicago" disabled />
        </div>
      </div>
      <div className="mt-6 text-gray-400 italic">[Organization editing coming soon]</div>
    </div>
  )
} 