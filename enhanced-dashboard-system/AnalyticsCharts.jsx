import React, { useState, useEffect } from 'react'
import { useTheme } from '../pto-connect-theme-system/ThemeProvider'
import { 
  BarChart3, PieChart, TrendingUp, Calendar, Users, 
  DollarSign, Activity, Download, Filter, RefreshCw
} from 'lucide-react'

const AnalyticsCharts = () => {
  const { theme } = useTheme()
  const [selectedChart, setSelectedChart] = useState('membership')
  const [timeRange, setTimeRange] = useState('6m')
  const [loading, setLoading] = useState(false)

  // Mock data for different chart types
  const chartData = {
    membership: {
      title: 'Membership Growth',
      data: [
        { month: 'Jan', members: 198, newMembers: 12, churnRate: 2 },
        { month: 'Feb', members: 205, newMembers: 15, churnRate: 8 },
        { month: 'Mar', members: 218, newMembers: 18, churnRate: 5 },
        { month: 'Apr', members: 232, newMembers: 20, churnRate: 6 },
        { month: 'May', members: 241, newMembers: 14, churnRate: 5 },
        { month: 'Jun', members: 247, newMembers: 11, churnRate: 5 }
      ]
    },
    events: {
      title: 'Event Attendance',
      data: [
        { event: 'Movie Night', attendance: 85, capacity: 100, satisfaction: 4.2 },
        { event: 'Bake Sale', attendance: 92, capacity: 120, satisfaction: 4.5 },
        { event: 'Science Fair', attendance: 78, capacity: 90, satisfaction: 4.1 },
        { event: 'Art Show', attendance: 88, capacity: 100, satisfaction: 4.3 },
        { event: 'Sports Day', attendance: 95, capacity: 110, satisfaction: 4.6 }
      ]
    },
    financial: {
      title: 'Budget Allocation',
      data: [
        { category: 'Events', allocated: 15000, spent: 12300, remaining: 2700 },
        { category: 'Supplies', allocated: 8000, spent: 6200, remaining: 1800 },
        { category: 'Communications', allocated: 5000, spent: 3800, remaining: 1200 },
        { category: 'Administration', allocated: 7000, spent: 4250, remaining: 2750 },
        { category: 'Emergency Fund', allocated: 10000, spent: 6000, remaining: 4000 }
      ]
    },
    engagement: {
      title: 'Member Engagement',
      data: [
        { metric: 'Email Open Rate', value: 68, target: 70, trend: 'up' },
        { metric: 'Event Participation', value: 45, target: 50, trend: 'up' },
        { metric: 'Volunteer Hours', value: 1250, target: 1200, trend: 'up' },
        { metric: 'Survey Response', value: 32, target: 40, trend: 'down' },
        { metric: 'Website Visits', value: 890, target: 800, trend: 'up' }
      ]
    }
  }

  const chartOptions = [
    { key: 'membership', label: 'Membership', icon: Users },
    { key: 'events', label: 'Events', icon: Calendar },
    { key: 'financial', label: 'Financial', icon: DollarSign },
    { key: 'engagement', label: 'Engagement', icon: Activity }
  ]

  const MembershipChart = ({ data }) => (
    <div className="space-y-6">
      {/* Line Chart Simulation */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Trends</h3>
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="40"
                y1={40 + i * 30}
                x2="380"
                y2={40 + i * 30}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Data line */}
            <polyline
              fill="none"
              stroke={`rgb(var(--theme-primary))`}
              strokeWidth="3"
              points={data.map((item, index) => 
                `${60 + index * 55},${180 - ((item.members - 180) / 80) * 120}`
              ).join(' ')}
            />
            
            {/* Data points */}
            {data.map((item, index) => (
              <circle
                key={index}
                cx={60 + index * 55}
                cy={180 - ((item.members - 180) / 80) * 120}
                r="4"
                fill={`rgb(var(--theme-primary))`}
              />
            ))}
            
            {/* Labels */}
            {data.map((item, index) => (
              <text
                key={index}
                x={60 + index * 55}
                y="195"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.month}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total Growth</h4>
          <p className="text-2xl font-bold text-gray-900">+49</p>
          <p className="text-sm text-green-600">+24.7% this period</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Avg. Monthly Growth</h4>
          <p className="text-2xl font-bold text-gray-900">+8.2</p>
          <p className="text-sm text-green-600">Above target</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Retention Rate</h4>
          <p className="text-2xl font-bold text-gray-900">94.8%</p>
          <p className="text-sm text-green-600">Excellent</p>
        </div>
      </div>
    </div>
  )

  const EventsChart = ({ data }) => (
    <div className="space-y-6">
      {/* Bar Chart Simulation */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Performance</h3>
        <div className="space-y-4">
          {data.map((event, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-24 text-sm text-gray-700 truncate">{event.event}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    {event.attendance}/{event.capacity} attendees
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round((event.attendance / event.capacity) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.attendance / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right">
                <div className="text-sm font-medium text-gray-900">
                  {event.satisfaction}★
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Best Performing Event</h4>
          <p className="text-lg font-bold text-gray-900">Sports Day</p>
          <p className="text-sm text-green-600">95 attendees, 4.6★ rating</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Average Satisfaction</h4>
          <p className="text-lg font-bold text-gray-900">4.3★</p>
          <p className="text-sm text-green-600">Above target (4.0★)</p>
        </div>
      </div>
    </div>
  )

  const FinancialChart = ({ data }) => (
    <div className="space-y-6">
      {/* Donut Chart Simulation */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Distribution</h3>
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              {/* Progress segments */}
              {data.map((item, index) => {
                const total = data.reduce((sum, d) => sum + d.allocated, 0)
                const percentage = (item.allocated / total) * 100
                const circumference = 2 * Math.PI * 40
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
                const strokeDashoffset = -data.slice(0, index).reduce((sum, d) => 
                  sum + ((d.allocated / total) * circumference), 0)
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={`hsl(${index * 60}, 70%, 60%)`}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">$45K</div>
                <div className="text-sm text-gray-500">Total Budget</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                ></div>
                <span className="text-sm text-gray-700">{item.category}</span>
              </div>
              <div className="text-sm text-gray-900 font-medium">
                ${item.allocated.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total Spent</h4>
          <p className="text-2xl font-bold text-gray-900">$32.5K</p>
          <p className="text-sm text-gray-600">72% of budget</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Remaining</h4>
          <p className="text-2xl font-bold text-gray-900">$12.5K</p>
          <p className="text-sm text-green-600">28% available</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Largest Category</h4>
          <p className="text-2xl font-bold text-gray-900">Events</p>
          <p className="text-sm text-gray-600">$15K allocated</p>
        </div>
      </div>
    </div>
  )

  const EngagementChart = ({ data }) => (
    <div className="space-y-6">
      {/* Metrics Dashboard */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
        <div className="space-y-4">
          {data.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{metric.metric}</h4>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {typeof metric.value === 'number' && metric.value > 100 
                        ? metric.value.toLocaleString() 
                        : metric.value}
                      {metric.metric.includes('Rate') || metric.metric.includes('Response') ? '%' : ''}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {metric.target}{metric.metric.includes('Rate') || metric.metric.includes('Response') ? '%' : ''}
                    </span>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span>{metric.trend === 'up' ? 'Improving' : 'Declining'}</span>
                  </div>
                </div>
              </div>
              <div className="w-24">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.value >= metric.target ? 'bg-green-500' : 'bg-theme-primary'
                    }`}
                    style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Top Performing Metric</h4>
          <p className="text-lg font-bold text-gray-900">Volunteer Hours</p>
          <p className="text-sm text-green-600">104% of target achieved</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Needs Attention</h4>
          <p className="text-lg font-bold text-gray-900">Survey Response</p>
          <p className="text-sm text-red-600">80% of target, declining</p>
        </div>
      </div>
    </div>
  )

  const renderChart = () => {
    const data = chartData[selectedChart].data
    
    switch (selectedChart) {
      case 'membership':
        return <MembershipChart data={data} />
      case 'events':
        return <EventsChart data={data} />
      case 'financial':
        return <FinancialChart data={data} />
      case 'engagement':
        return <EngagementChart data={data} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Detailed insights into your PTO's performance and growth.</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
          >
            <option value="1m">Last month</option>
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
          <button className="theme-button-secondary px-4 py-2 text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setLoading(true)}
            className="theme-button-primary px-4 py-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {chartOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.key}
                onClick={() => setSelectedChart(option.key)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedChart === option.key
                    ? 'bg-theme-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {chartData[selectedChart].title}
              </h2>
            </div>
            {renderChart()}
          </>
        )}
      </div>
    </div>
  )
}

export default AnalyticsCharts
