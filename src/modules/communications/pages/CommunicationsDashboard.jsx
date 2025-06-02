import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from '@material-tailwind/react'

const mockDrafts = [
  {
    id: 1,
    subject: 'Back-to-School Picnic',
    type: 'event',
    status: 'draft',
    updated_at: '2025-06-01'
  },
  {
    id: 2,
    subject: 'Fundraiser Reminder',
    type: 'fundraiser',
    status: 'draft',
    updated_at: '2025-06-02'
  }
]

const statuses = {
  draft: 'bg-gray-200 text-gray-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

export default function CommunicationsDashboard() {
  const [activeTab, setActiveTab] = useState('drafts')

  const renderList = (items) =>
    items.length === 0 ? (
      <p className="text-sm text-gray-500 mt-4">No communications found.</p>
    ) : (
      <ul className="space-y-3 mt-4">
        {items.map((msg) => (
          <li
            key={msg.id}
            className="p-4 bg-white border rounded shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{msg.subject}</h3>
              <p className="text-xs text-gray-500">
                Type: {msg.type} • Last updated: {msg.updated_at}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${statuses[msg.status]}`}
            >
              {msg.status}
            </span>
          </li>
        ))}
      </ul>
    )

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Communications</h1>
        <Link
          to="/communications/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New
        </Link>
      </div>

      <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
        <TabsHeader>
          <Tab value="drafts">Drafts</Tab>
          <Tab value="scheduled">Scheduled</Tab>
          <Tab value="sent">Sent</Tab>
        </TabsHeader>
        <TabsBody>
          <TabPanel value="drafts">{renderList(mockDrafts)}</TabPanel>
          <TabPanel value="scheduled">{renderList([])}</TabPanel>
          <TabPanel value="sent">{renderList([])}</TabPanel>
        </TabsBody>
      </Tabs>
    </div>
  )
}
