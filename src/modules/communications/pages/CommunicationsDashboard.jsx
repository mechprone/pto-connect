import { useState } from 'react'

const tabs = ['Drafts', 'Scheduled', 'Sent']
const statuses = {
  draft: 'bg-gray-200 text-gray-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

const mockData = {
  Drafts: [
    { id: 1, title: 'Weekly Newsletter', saved: 'Draft saved 2 mins ago', status: 'draft' },
  ],
  Scheduled: [
    { id: 2, title: 'Reminder: PTO Meeting Tonight', saved: 'Scheduled for 6 PM', status: 'scheduled' },
  ],
  Sent: [
    { id: 3, title: 'Spring Carnival Invite', saved: 'Sent Apr 18', status: 'sent' },
    { id: 4, title: 'Volunteer Thank You', saved: 'Sent Apr 14', status: 'sent' },
    { id: 5, title: 'April Updates', saved: 'Failed to send', status: 'failed' },
  ],
}

export default function CommunicationsDashboard() {
  const [activeTab, setActiveTab] = useState('Drafts')

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Communications</h1>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 text-sm font-medium ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Row (placeholder) */}
      <div className="flex space-x-4 mb-4">
        <select className="border rounded px-3 py-1 text-sm text-gray-700">
          <option>Type</option>
          <option>Event</option>
          <option>Fundraiser</option>
          <option>General</option>
        </select>
        <select className="border rounded px-3 py-1 text-sm text-gray-700">
          <option>Time</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>All Time</option>
        </select>
      </div>

      {/* Section Title */}
      <h2 className="text-lg font-semibold mb-3">{activeTab}</h2>

      {/* Communication Items */}
      <div className="space-y-4">
        {mockData[activeTab].map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">{item.saved}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded ${statuses[item.status]}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
