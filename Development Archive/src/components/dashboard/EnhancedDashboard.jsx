import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../modules/hooks/useUserProfile';
import { supabase } from '../../utils/supabaseClient';
import AnalyticsCharts from './AnalyticsCharts';
import SmartNotifications from './SmartNotifications';

const EnhancedDashboard = () => {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalMembers: 0,
      activeEvents: 0,
      budgetUsed: 0,
      engagementRate: 0
    },
    recentActivity: [],
    upcomingEvents: [],
    pendingTasks: [],
    financialSummary: {
      totalBudget: 0,
      spent: 0,
      remaining: 0,
      categories: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.org_id) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch metrics
      const metricsPromises = [
        fetchTotalMembers(),
        fetchActiveEvents(),
        fetchBudgetData(),
        fetchEngagementRate()
      ];

      const [members, events, budget, engagement] = await Promise.all(metricsPromises);

      // Fetch activity data
      const [activity, upcomingEvents, tasks] = await Promise.all([
        fetchRecentActivity(),
        fetchUpcomingEvents(),
        fetchPendingTasks()
      ]);

      setDashboardData({
        metrics: {
          totalMembers: members,
          activeEvents: events,
          budgetUsed: budget.percentUsed,
          engagementRate: engagement
        },
        recentActivity: activity,
        upcomingEvents: upcomingEvents,
        pendingTasks: tasks,
        financialSummary: budget
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalMembers = async () => {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', userProfile.org_id);
    return count || 0;
  };

  const fetchActiveEvents = async () => {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', userProfile.org_id)
      .gte('event_date', new Date().toISOString());
    return count || 0;
  };

  const fetchBudgetData = async () => {
    const { data: budgetEntries } = await supabase
      .from('budget_entries')
      .select('amount, category, type')
      .eq('org_id', userProfile.org_id);

    if (!budgetEntries) return { percentUsed: 0, totalBudget: 0, spent: 0, remaining: 0, categories: [] };

    const income = budgetEntries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = budgetEntries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    
    const categories = budgetEntries.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = { income: 0, expenses: 0 };
      }
      if (entry.type === 'income') {
        acc[entry.category].income += entry.amount;
      } else {
        acc[entry.category].expenses += entry.amount;
      }
      return acc;
    }, {});

    return {
      totalBudget: income,
      spent: expenses,
      remaining: income - expenses,
      percentUsed: income > 0 ? Math.round((expenses / income) * 100) : 0,
      categories: Object.entries(categories).map(([name, data]) => ({
        name,
        ...data,
        net: data.income - data.expenses
      }))
    };
  };

  const fetchEngagementRate = async () => {
    // Calculate engagement based on recent activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', userProfile.org_id)
      .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', userProfile.org_id);

    return totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  };

  const fetchRecentActivity = async () => {
    // This would typically come from an activity log table
    // For now, we'll fetch recent events and user registrations
    const { data: recentEvents } = await supabase
      .from('events')
      .select('title, created_at, created_by')
      .eq('org_id', userProfile.org_id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentUsers } = await supabase
      .from('users')
      .select('first_name, last_name, created_at')
      .eq('org_id', userProfile.org_id)
      .order('created_at', { ascending: false })
      .limit(3);

    const activity = [];
    
    if (recentEvents) {
      recentEvents.forEach(event => {
        activity.push({
          type: 'event_created',
          title: `New event: ${event.title}`,
          timestamp: event.created_at,
          user: 'System'
        });
      });
    }

    if (recentUsers) {
      recentUsers.forEach(user => {
        activity.push({
          type: 'user_joined',
          title: `${user.first_name} ${user.last_name} joined`,
          timestamp: user.created_at,
          user: `${user.first_name} ${user.last_name}`
        });
      });
    }

    return activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);
  };

  const fetchUpcomingEvents = async () => {
    const { data: events } = await supabase
      .from('events')
      .select('id, title, event_date, location, status')
      .eq('org_id', userProfile.org_id)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5);

    return events || [];
  };

  const fetchPendingTasks = async () => {
    // This would come from a tasks table - for now return mock data based on role
    const tasks = [];
    
    if (userProfile.role === 'admin' || userProfile.role === 'board_member') {
      tasks.push(
        { id: 1, title: 'Review budget proposal', priority: 'high', dueDate: '2025-06-10' },
        { id: 2, title: 'Approve volunteer applications', priority: 'medium', dueDate: '2025-06-12' },
        { id: 3, title: 'Update event calendar', priority: 'low', dueDate: '2025-06-15' }
      );
    }

    return tasks;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.first_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your PTO today
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.metrics.totalMembers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.metrics.activeEvents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">3 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.metrics.budgetUsed}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                {formatCurrency(dashboardData.financialSummary.remaining)} remaining
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.metrics.engagementRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+5% from last month</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'event_created' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <AnalyticsCharts />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Smart Notifications */}
            <SmartNotifications />

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{formatDate(event.event_date)}</p>
                        {event.location && (
                          <p className="text-sm text-gray-500">{event.location}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  ))}
                  {dashboardData.upcomingEvents.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No upcoming events</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-900">New Event</span>
                  </button>

                  <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium text-green-900">Send Message</span>
                  </button>

                  <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-900">Add Member</span>
                  </button>

                  <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                    <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-yellow-900">New Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            {dashboardData.pendingTasks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Pending Tasks</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {dashboardData.pendingTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">Due: {formatDate(task.dueDate)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
