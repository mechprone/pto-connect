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
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
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
