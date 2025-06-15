import { useState } from 'react'
import PermissionsConsole from '@/components/PermissionsConsole'
import OrganizationInfo from '@/components/OrganizationInfo'
import EmailSettings from '@/components/EmailSettings'
import SubscriptionSettings from '@/components/SubscriptionSettings'
import ApiKeys from '@/components/ApiKeys'

const TABS = [
  { key: 'org', label: 'Organization Info' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'email', label: 'Email Settings' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'apikeys', label: 'API Keys' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('org')

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-2 mb-6 border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 font-semibold rounded-t ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {tab === 'org' && <OrganizationInfo />}
        {tab === 'permissions' && <PermissionsConsole />}
        {tab === 'email' && <EmailSettings />}
        {tab === 'subscription' && <SubscriptionSettings />}
        {tab === 'apikeys' && <ApiKeys />}
      </div>
    </div>
  )
}
