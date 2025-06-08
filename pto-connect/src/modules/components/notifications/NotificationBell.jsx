import React from 'react';
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'
import { Bell } from 'lucide-react'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    const data = await res.json()
    setNotifications(data)
  }

  const handleClickOutside = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      setPanelOpen(false)
    }
  }

  const handleNotificationClick = async (notification) => {
    await fetch(`/api/notifications/${notification.id}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    navigate(notification.module_link || '/')
    setPanelOpen(false)
  }

  const handleClearAll = async () => {
    await fetch('/api/notifications/clear', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    setNotifications([])
  }

  const unreadCount = notifications.length

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setPanelOpen((prev) => !prev)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full animate-pulse"></span>
        )}
      </button>

      {panelOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <button
              onClick={handleClearAll}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 p-4">No new notifications</p>
            ) : (
              notifications.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleNotificationClick(note)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b"
                >
                  <p className="font-medium text-sm">{note.title}</p>
                  {note.message && (
                    <p className="text-xs text-gray-600 mt-1">{note.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
