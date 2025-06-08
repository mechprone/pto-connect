import React, { useState, useEffect } from 'react'
import { useTheme } from '../pto-connect-theme-system/ThemeProvider'
import { 
  Bell, AlertTriangle, CheckCircle, Info, X, 
  Calendar, Users, DollarSign, TrendingDown, 
  Clock, MessageSquare, FileText, Target,
  Settings, Filter, MoreHorizontal
} from 'lucide-react'

const SmartNotifications = () => {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [showSettings, setShowSettings] = useState(false)

  // Mock notification data with smart insights
  const mockNotifications = [
    {
      id: 1,
      type: 'alert',
      priority: 'high',
      title: 'Budget Alert: Events Category',
      message: 'Events budget is 82% spent with 3 months remaining. Consider reviewing upcoming event costs.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      category: 'financial',
      icon: DollarSign,
      actionable: true,
      actions: [
        { label: 'Review Budget', action: 'review_budget' },
        { label: 'View Details', action: 'view_details' }
      ],
      read: false
    },
    {
      id: 2,
      type: 'insight',
      priority: 'medium',
      title: 'Membership Growth Trending Down',
      message: 'New member registrations have decreased by 15% this month. Consider launching a recruitment campaign.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      category: 'membership',
      icon: TrendingDown,
      actionable: true,
      actions: [
        { label: 'Start Campaign', action: 'start_campaign' },
        { label: 'View Analytics', action: 'view_analytics' }
      ],
      read: false
    },
    {
      id: 3,
      type: 'reminder',
      priority: 'high',
      title: 'Upcoming Event: Spring Carnival',
      message: 'Spring Carnival is in 3 days. 5 volunteer positions still need to be filled.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      category: 'events',
      icon: Calendar,
      actionable: true,
      actions: [
        { label: 'Find Volunteers', action: 'find_volunteers' },
        { label: 'Event Details', action: 'event_details' }
      ],
      read: true
    },
    {
      id: 4,
      type: 'success',
      priority: 'low',
      title: 'Goal Achieved: Volunteer Hours',
      message: 'Congratulations! You\'ve exceeded your monthly volunteer hours goal by 104%.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      category: 'engagement',
      icon: Target,
      actionable: false,
      read: true
    },
    {
      id: 5,
      type: 'info',
      priority: 'medium',
      title: 'New Survey Responses',
      message: '12 new parent satisfaction survey responses received. Overall rating: 4.3/5.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      category: 'feedback',
      icon: MessageSquare,
      actionable: true,
      actions: [
        { label: 'View Responses', action: 'view_responses' },
        { label: 'Generate Report', action: 'generate_report' }
      ],
      read: true
    },
    {
      id: 6,
      type: 'alert',
      priority: 'medium',
      title: 'Document Approval Needed',
      message: 'Budget proposal for Q2 requires board approval. 2 approvals pending.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      category: 'administrative',
      icon: FileText,
      actionable: true,
      actions: [
        { label: 'Review Document', action: 'review_document' },
        { label: 'Send Reminder', action: 'send_reminder' }
      ],
      read: true
    },
    {
      id: 7,
      type: 'insight',
      priority: 'low',
      title: 'Communication Engagement Up',
      message: 'Email open rates have improved by 12% this month. Great job on the new newsletter format!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      category: 'communications',
      icon: CheckCircle,
      actionable: false,
      read: true
    }
  ]

  useEffect(() => {
    setNotifications(mockNotifications)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return AlertTriangle
      case 'success':
        return CheckCircle
      case 'insight':
        return Info
      case 'reminder':
        return Clock
      default:
        return Bell
    }
  }

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') {
      return 'text-red-600 bg-red-50 border-red-200'
    }
    switch (type) {
      case 'alert':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'insight':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'reminder':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const handleAction = (action, notificationId) => {
    console.log(`Action: ${action} for notification: ${notificationId}`)
    // In real app, this would trigger the appropriate action
    markAsRead(notificationId)
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.read
    if (filter === 'high') return notif.priority === 'high'
    return notif.category === filter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const NotificationCard = ({ notification }) => {
    const IconComponent = notification.icon || getNotificationIcon(notification.type)
    const colorClasses = getNotificationColor(notification.type, notification.priority)

    return (
      <div className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
        notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${colorClasses}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                }`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">{formatTimestamp(notification.timestamp)}</p>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {notification.priority === 'high' && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    High Priority
                  </span>
                )}
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {notification.actionable && notification.actions && (
              <div className="flex items-center space-x-2 mt-3">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action.action, notification.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      index === 0 
                        ? 'bg-theme-primary text-white hover:opacity-90'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Notifications</h1>
            <p className="text-gray-600">AI-powered insights and alerts for your PTO</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="theme-button-secondary px-4 py-2 text-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button className="theme-button-primary px-4 py-2 text-sm">
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by:</span>
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'high', label: 'High Priority', count: notifications.filter(n => n.priority === 'high').length },
            { key: 'financial', label: 'Financial', count: notifications.filter(n => n.category === 'financial').length },
            { key: 'events', label: 'Events', count: notifications.filter(n => n.category === 'events').length },
            { key: 'membership', label: 'Membership', count: notifications.filter(n => n.category === 'membership').length }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === filterOption.key
                  ? 'bg-theme-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  filter === filterOption.key
                    ? 'bg-white bg-opacity-20'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {filterOption.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for new insights.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        )}
      </div>

      {/* Smart Insights Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Priority Actions</h4>
            <p className="text-2xl font-bold text-red-600">3</p>
            <p className="text-sm text-gray-600">Require immediate attention</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Opportunities</h4>
            <p className="text-2xl font-bold text-green-600">2</p>
            <p className="text-sm text-gray-600">Areas for improvement identified</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Goals on Track</h4>
            <p className="text-2xl font-bold text-blue-600">85%</p>
            <p className="text-sm text-gray-600">Of your objectives are progressing well</p>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Smart Insights</h4>
                <p className="text-sm text-gray-600">AI-powered recommendations and alerts</p>
              </div>
              <input type="checkbox" defaultChecked className="theme-checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Budget Alerts</h4>
                <p className="text-sm text-gray-600">Notifications when budgets reach thresholds</p>
              </div>
              <input type="checkbox" defaultChecked className="theme-checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Event Reminders</h4>
                <p className="text-sm text-gray-600">Upcoming events and volunteer needs</p>
              </div>
              <input type="checkbox" defaultChecked className="theme-checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Membership Insights</h4>
                <p className="text-sm text-gray-600">Growth trends and engagement metrics</p>
              </div>
              <input type="checkbox" defaultChecked className="theme-checkbox" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartNotifications
