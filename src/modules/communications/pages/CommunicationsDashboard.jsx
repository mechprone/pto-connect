import { useState } from 'react'
import { Link } from 'react-router-dom'

const sampleMessages = [
  {
    id: 1,
    type: 'Event',
    subject: 'Spring Carnival Volunteers Needed!',
    status: 'Draft',
    updated_at: '2025-06-01',
  },
  {
    id: 2,
    type: 'Fundraiser',
    subject: 'PTO Pizza Night - Order Online!',
    status: 'Scheduled',
    updated_at: '2025-06-03',
  },
  {
    id: 3,
    type: 'General',
    subject: 'May Newsletter',
    status: 'Sent',
    updated_at: '2025-05-29',
  },
]

const tabs = ['Drafts', 'Scheduled', 'Sent']

export default function CommunicationsDashboard() {
  const [activeTab, setActiveTab] = useState('Drafts')

  const filtered = sampleMessages.filter((msg) => msg.status === activeTab)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Communications</h1>
        <div className="relative inline-block">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + New
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border rounded z-10">
            <Link
              to="/communications/email"
              className="block px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Email
            </Link>
            <Link
              to="/communications/sms"
              className="block px-4 py-2 hover:bg-gray-100 text-sm"
            >
              SMS
            </Link>
            <Link
              to="/communications/social"
              className="block px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Social Post
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <label className="mr-2 text-sm text-gray-700">Filter by Type:</label>
          <select className="border px-2 py-1 text-sm rounded">
            <option>All</option>
            <option>Event</option>
            <option>Fundraiser</option>
            <option>General</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filtered.map((msg) => (
          <div key={msg.id} className="bg-white shadow-sm rounded p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">{msg.subject}</h2>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  msg.status === 'Draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : msg.status === 'Scheduled'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {msg.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Type: {msg.type} • Last updated: {msg.updated_at}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 italic text-sm">No messages in this category yet.</p>
        )}
      </div>
    </div>
  )
}
