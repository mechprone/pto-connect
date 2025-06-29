import React from 'react';
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/dashboard/admin', label: 'Dashboard', roles: ['admin'] },
  { to: '/events', label: 'Events', roles: ['admin', 'teacher', 'parent_member'] },
  { to: '/calendar', label: 'Calendar', roles: ['admin', 'teacher', 'parent_member'] },
  { to: '/fundraisers', label: 'Fundraisers', roles: ['admin', 'treasurer'] },
  { to: '/budget', label: 'Budget', roles: ['admin', 'treasurer'] },
  { to: '/communications', label: 'Communications', roles: ['admin', 'committee_lead', 'teacher'] },
  { to: '/teacher-requests', label: 'Teacher Requests', roles: ['admin', 'teacher'] },
  { to: '/billing', label: 'Billing', roles: ['admin'] },
]

export default function SidebarNav({ role }) {
  const location = useLocation()

  const filtered = navItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
      <nav className="px-4 py-6 space-y-2">
        {filtered.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`block px-3 py-2 rounded text-sm font-medium ${
              location.pathname === item.to
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
