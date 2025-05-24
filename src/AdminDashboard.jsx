import React, { useState } from 'react';

const navItems = [
  { label: 'Dashboard', key: 'home' },
  { label: 'Users & Roles', key: 'users' },
  { label: 'Events', key: 'events' },
  { label: 'Fundraising', key: 'fundraising' },
  { label: 'Budget', key: 'budget' },
  { label: 'Announcements', key: 'announcements' },
];

const panels = {
  home: <p className="text-lg">Welcome, Admin! Use the sidebar to manage your PTO tools.</p>,
  users: <p className="text-lg">User management will appear here.</p>,
  events: <p className="text-lg">Event planning tools coming soon.</p>,
  fundraising: <p className="text-lg">Fundraiser tracking will be displayed here.</p>,
  budget: <p className="text-lg">View and edit your budget here.</p>,
  announcements: <p className="text-lg">Send updates and alerts from here.</p>,
};

export default function AdminDashboard() {
  const [selected, setSelected] = useState('home');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-800">Admin Panel</h2>
        {navItems.map(item => (
          <button
            key={item.key}
            className={`w-full text-left px-3 py-2 rounded-md hover:bg-blue-100 ${
              selected === item.key ? 'bg-blue-200 text-blue-900' : 'text-gray-700'
            }`}
            onClick={() => setSelected(item.key)}
          >
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{navItems.find(i => i.key === selected)?.label}</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
        <div className="bg-white shadow rounded-lg p-6">{panels[selected]}</div>
      </main>
    </div>
  );
}
