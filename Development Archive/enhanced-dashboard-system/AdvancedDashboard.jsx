import React, { useState, useEffect } from 'react'
import { useTheme } from '../pto-connect-theme-system/ThemeProvider'
import { 
  Users, Calendar, DollarSign, TrendingUp, TrendingDown, 
  Mail, MessageSquare, FileText, Clock, AlertCircle,
  BarChart3, PieChart, Activity, Target, Award,
  CheckCircle, XCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const AdvancedDashboard = () => {
  const { theme } = useTheme()
  const [timeRange, setTimeRange] = useState('30d')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Simulated data - in real app, this would come from your API
  const mockData = {
    overview: {
      totalMembers: { value: 247, change: 12, trend: 'up' },
      activeEvents: { value: 8, change: 2, trend: 'up' },
      monthlyRevenue: { value: 12450, change: -5, trend: 'down' },
      engagementRate: { value: 78, change: 8, trend: 'up' }
    },
    recentActivity: [
      { id: 1, type: 'member_joined', user: 'Sarah Johnson', time: '2 hours ago', icon: Users },
      { id: 2, type: 'event_created', user: 'Mike Chen', event: 'Spring Carnival', time: '4 hours ago', icon: Calendar },
      { id: 3, type: 'payment_received', user: 'Lisa Wang', amount: 150, time: '6 hours ago', icon: DollarSign },
      { id: 4, type: 'message_sent', user: 'Admin', recipients: 45, time: '8 hours ago', icon: Mail },
      { id: 5, type: 'document_uploaded', user: 'Tom Wilson', document: 'Budget Report Q1', time: '1 day ago', icon: FileText }
    ],
    upcomingEvents: [
      { id: 1, name: 'Spring Carnival', date: '2025-06-15', attendees: 89, status: 'confirmed' },
      { id: 2, name: 'Parent-Teacher Conference', date: '2025-06-20', attendees: 156, status: 'planning' },
      { id: 3, name: 'Book Fair', date: '2025-06-25', attendees: 67, status: 'confirmed' },
      { id: 4, name: 'Summer Picnic', date: '2025-07-10', attendees: 203, status: 'planning' }
    ],
    pendingTasks: [
      { id: 1, title: 'Review budget proposals', priority: 'high', dueDate: '2025-06-08', assignee: 'Finance Committee' },
      { id: 2, title: 'Approve volunteer applications', priority: 'medium', dueDate: '2025-06-10', assignee: 'Admin Team' },
      { id: 3, title: 'Update website content', priority: 'low', dueDate: '2025-06-12', assignee: 'Communications' },
      { id: 4, title: 'Prepare quarterly report', priority: 'high', dueDate: '2025-06-15', assignee: 'Board Members' }
    ],
    financialSummary: {
      totalBudget: 45000,
      spent: 32550,
      remaining: 12450,
      categories: [
        { name: 'Events', allocated: 15000, spent: 12300, percentage: 82 },
        { name: 'Supplies', allocated: 8000, spent: 6200, percentage: 78 },
        { name: 'Communications', allocated: 5000, spent: 3800, percentage: 76 },
        { name: 'Administration', allocated: 7000, spent: 4250, percentage: 61 },
        { name: 'Emergency Fund', allocated: 10000, spent: 6000, percentage: 60 }
      ]
    },
    membershipTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [198, 205, 218, 232, 241, 247]
    },
    eventAttendance: {
      labels: ['Movie Night', 'Bake Sale', 'Science Fair', 'Art Show', 'Sports Day'],
      data: [85, 92, 78, 88, 95]
    }
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData(mockData)
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const MetricCard = ({ icon: Icon, title, value, change, trend, prefix = '', suffix = '' }) => (
    <div className="theme-metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="theme-metric-icon">
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  )

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon
    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="w-8 h-8 bg-theme-primary-light rounded-full flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-theme-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">
            <span className="font-medium">{activity.user}</span>
            {activity.type === 'member_joined' && ' joined the PTO'}
            {activity.type === 'event_created' && ` created event "${activity.event}"`}
            {activity.type === 'payment_received' && ` made a payment of $${activity.amount}`}
            {activity.type === 'message_sent' && ` sent a message to ${activity.recipients} members`}
            {activity.type === 'document_uploaded' && ` uploaded "${activity.document}"`}
          </p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    )
  }

  const TaskItem = ({ task }) => (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
        <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
        <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>
        <button className="text-theme-primary hover:text-theme-primary-dark">
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your PTO.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          title="Total Members"
          value={dashboardData.overview.totalMembers.value}
          change={dashboardData.overview.totalMembers.change}
          trend={dashboardData.overview.totalMembers.trend}
        />
        <MetricCard
          icon={Calendar}
          title="Active Events"
          value={dashboardData.overview.activeEvents.value}
          change={dashboardData.overview.activeEvents.change}
          trend={dashboardData.overview.activeEvents.trend}
        />
        <MetricCard
          icon={DollarSign}
          title="Available Budget"
          value={dashboardData.overview.monthlyRevenue.value}
          change={dashboardData.overview.monthlyRevenue.change}
          trend={dashboardData.overview.monthlyRevenue.trend}
          prefix="$"
        />
        <MetricCard
          icon={Activity}
          title="Engagement Rate"
          value={dashboardData.overview.engagementRate.value}
          change={dashboardData.overview.engagementRate.change}
          trend={dashboardData.overview.engagementRate.trend}
          suffix="%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="theme-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-theme-primary hover:text-theme-primary-dark text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-1">
              {dashboardData.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="theme-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {dashboardData.upcomingEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{event.name}</h4>
                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{event.attendees} attendees</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-theme-primary hover:text-theme-primary-dark text-sm font-medium">
              View All Events
            </button>
          </div>

          {/* Quick Actions */}
          <div className="theme-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="theme-button-primary p-3 rounded-lg text-sm">
                <Calendar className="w-4 h-4 mx-auto mb-1" />
                New Event
              </button>
              <button className="theme-button-secondary p-3 rounded-lg text-sm">
                <Mail className="w-4 h-4 mx-auto mb-1" />
                Send Message
              </button>
              <button className="theme-button-secondary p-3 rounded-lg text-sm">
                <Users className="w-4 h-4 mx-auto mb-1" />
                Add Member
              </button>
              <button className="theme-button-secondary p-3 rounded-lg text-sm">
                <FileText className="w-4 h-4 mx-auto mb-1" />
                New Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="theme-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pending Tasks</h2>
            <span className="theme-badge">{dashboardData.pendingTasks.length}</span>
          </div>
          <div className="space-y-3">
            {dashboardData.pendingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="theme-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Budget Overview</h2>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Budget Used</span>
              <span>{Math.round((dashboardData.financialSummary.spent / dashboardData.financialSummary.totalBudget) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(dashboardData.financialSummary.spent / dashboardData.financialSummary.totalBudget) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${dashboardData.financialSummary.spent.toLocaleString()} spent</span>
              <span>${dashboardData.financialSummary.remaining.toLocaleString()} remaining</span>
            </div>
          </div>
          <div className="space-y-3">
            {dashboardData.financialSummary.categories.slice(0, 3).map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{category.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-theme-primary h-1.5 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedDashboard
