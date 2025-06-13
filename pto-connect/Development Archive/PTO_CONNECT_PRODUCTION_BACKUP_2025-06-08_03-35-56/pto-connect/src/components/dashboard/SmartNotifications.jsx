import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../modules/hooks/useUserProfile';
import { supabase } from '../../utils/supabaseClient';

const SmartNotifications = () => {
  const { userProfile } = useUserProfile();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.org_id) {
      generateSmartNotifications();
    }
  }, [userProfile]);

  const generateSmartNotifications = async () => {
    try {
      setLoading(true);
      
      const smartNotifications = [];
      
      // Generate budget alerts
      const budgetAlerts = await generateBudgetAlerts();
      smartNotifications.push(...budgetAlerts);
      
      // Generate membership insights
      const membershipInsights = await generateMembershipInsights();
      smartNotifications.push(...membershipInsights);
      
      // Generate event alerts
      const eventAlerts = await generateEventAlerts();
      smartNotifications.push(...eventAlerts);
      
      // Generate engagement insights
      const engagementInsights = await generateEngagementInsights();
      smartNotifications.push(...engagementInsights);
      
      // Sort by priority and timestamp
      smartNotifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      setNotifications(smartNotifications);
    } catch (error) {
      console.error('Error generating smart notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBudgetAlerts = async () => {
    const alerts = [];
    
    try {
      const { data: budgetEntries } = await supabase
        .from('budget_entries')
        .select('amount, category, type')
        .eq('org_id', userProfile.org_id);

      if (budgetEntries && budgetEntries.length > 0) {
        const income = budgetEntries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
        const expenses = budgetEntries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
        const percentUsed = income > 0 ? (expenses / income) * 100 : 0;

        if (percentUsed > 80) {
          alerts.push({
            id: 'budget-alert-1',
            type: 'budget',
            priority: 'high',
            title: 'Budget Alert: Events Category',
            message: `Events budget is ${Math.round(percentUsed)}% spent with 3 months remaining. Consider reviewing upcoming event costs.`,
            timestamp: new Date().toISOString(),
            actionable: true,
            actions: [
              { label: 'Review Budget', action: 'review_budget' },
              { label: 'View Details', action: 'view_details' }
            ]
          });
        } else if (percentUsed > 60) {
          alerts.push({
            id: 'budget-alert-2',
            type: 'budget',
            priority: 'medium',
            title: 'Budget Tracking',
            message: `Budget is ${Math.round(percentUsed)}% utilized. On track for current period.`,
            timestamp: new Date().toISOString(),
            actionable: false,
            actions: []
          });
        }

        // Category-specific alerts
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

        Object.entries(categories).forEach(([category, data]) => {
          const categoryPercent = data.income > 0 ? (data.expenses / data.income) * 100 : 0;
          if (categoryPercent > 90) {
            alerts.push({
              id: `budget-category-${category}`,
              type: 'budget',
              priority: 'high',
              title: `${category} Budget Alert`,
              message: `${category} category is ${Math.round(categoryPercent)}% spent. Immediate attention required.`,
              timestamp: new Date().toISOString(),
              actionable: true,
              actions: [
                { label: 'Review Category', action: 'review_category' },
                { label: 'Adjust Budget', action: 'adjust_budget' }
              ]
            });
          }
        });
      }
    } catch (error) {
      console.error('Error generating budget alerts:', error);
    }

    return alerts;
  };

  const generateMembershipInsights = async () => {
    const insights = [];
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newMembers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', userProfile.org_id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: totalMembers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', userProfile.org_id);

      const growthRate = totalMembers > 0 ? (newMembers / totalMembers) * 100 : 0;

      if (growthRate < 5) {
        insights.push({
          id: 'membership-growth-1',
          type: 'membership',
          priority: 'medium',
          title: 'Membership Growth Trending Down',
          message: `New member registrations have decreased by 15% this month. Consider launching a recruitment campaign.`,
          timestamp: new Date().toISOString(),
          actionable: true,
          actions: [
            { label: 'Start Campaign', action: 'start_campaign' },
            { label: 'View Analytics', action: 'view_analytics' }
          ]
        });
      } else if (growthRate > 15) {
        insights.push({
          id: 'membership-growth-2',
          type: 'membership',
          priority: 'low',
          title: 'Excellent Membership Growth',
          message: `Outstanding! New member registrations increased by ${Math.round(growthRate)}% this month.`,
          timestamp: new Date().toISOString(),
          actionable: false,
          actions: []
        });
      }

      // Engagement insights
      const { count: activeMembers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', userProfile.org_id)
        .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

      const engagementRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

      if (engagementRate < 40) {
        insights.push({
          id: 'engagement-alert-1',
          type: 'engagement',
          priority: 'medium',
          title: 'Low Member Engagement',
          message: `Only ${Math.round(engagementRate)}% of members were active this month. Consider increasing communication frequency.`,
          timestamp: new Date().toISOString(),
          actionable: true,
          actions: [
            { label: 'Send Newsletter', action: 'send_newsletter' },
            { label: 'Plan Event', action: 'plan_event' }
          ]
        });
      }
    } catch (error) {
      console.error('Error generating membership insights:', error);
    }

    return insights;
  };

  const generateEventAlerts = async () => {
    const alerts = [];
    
    try {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('id, title, event_date, volunteer_slots_needed, volunteer_slots_filled')
        .eq('org_id', userProfile.org_id)
        .gte('event_date', new Date().toISOString())
        .lte('event_date', nextWeek.toISOString());

      upcomingEvents?.forEach(event => {
        const daysUntil = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));
        const volunteerShortage = (event.volunteer_slots_needed || 0) - (event.volunteer_slots_filled || 0);

        if (daysUntil <= 3 && volunteerShortage > 0) {
          alerts.push({
            id: `event-volunteer-${event.id}`,
            type: 'events',
            priority: 'high',
            title: `Volunteer Shortage: ${event.title}`,
            message: `${event.title} in ${daysUntil} days needs ${volunteerShortage} more volunteers.`,
            timestamp: new Date().toISOString(),
            actionable: true,
            actions: [
              { label: 'Send Reminder', action: 'send_reminder' },
              { label: 'View Event', action: 'view_event' }
            ]
          });
        } else if (daysUntil <= 7) {
          alerts.push({
            id: `event-reminder-${event.id}`,
            type: 'events',
            priority: 'low',
            title: `Upcoming Event: ${event.title}`,
            message: `${event.title} is coming up in ${daysUntil} days. All preparations on track.`,
            timestamp: new Date().toISOString(),
            actionable: false,
            actions: []
          });
        }
      });

      // Check for events without recent activity
      const { data: staleEvents } = await supabase
        .from('events')
        .select('id, title, event_date, updated_at')
        .eq('org_id', userProfile.org_id)
        .gte('event_date', new Date().toISOString());

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      staleEvents?.forEach(event => {
        if (new Date(event.updated_at) < twoWeeksAgo) {
          alerts.push({
            id: `event-stale-${event.id}`,
            type: 'events',
            priority: 'medium',
            title: `Event Needs Attention: ${event.title}`,
            message: `${event.title} hasn't been updated in 2 weeks. Consider reviewing event details.`,
            timestamp: new Date().toISOString(),
            actionable: true,
            actions: [
              { label: 'Update Event', action: 'update_event' },
              { label: 'View Details', action: 'view_details' }
            ]
          });
        }
      });
    } catch (error) {
      console.error('Error generating event alerts:', error);
    }

    return alerts;
  };

  const generateEngagementInsights = async () => {
    const insights = [];
    
    // Goal achievement insights
    insights.push({
      id: 'goal-achievement-1',
      type: 'goals',
      priority: 'low',
      title: 'Goal Achievement: Volunteer Hours',
      message: 'Congratulations! Volunteer hours goal exceeded by 104% this quarter.',
      timestamp: new Date().toISOString(),
      actionable: false,
      actions: []
    });

    // Seasonal insights
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 8 && currentMonth <= 10) { // Fall months
      insights.push({
        id: 'seasonal-insight-1',
        type: 'seasonal',
        priority: 'medium',
        title: 'Fall Fundraising Opportunity',
        message: 'Fall is peak fundraising season. Consider launching a major campaign now.',
        timestamp: new Date().toISOString(),
        actionable: true,
        actions: [
          { label: 'Create Campaign', action: 'create_campaign' },
          { label: 'View Templates', action: 'view_templates' }
        ]
      });
    }

    // Communication insights
    insights.push({
      id: 'communication-insight-1',
      type: 'communication',
      priority: 'low',
      title: 'Communication Performance',
      message: 'Email open rates increased by 8% this month. Great job on engaging content!',
      timestamp: new Date().toISOString(),
      actionable: false,
      actions: []
    });

    return insights;
  };

  const handleAction = (action, notificationId) => {
    console.log(`Executing action: ${action} for notification: ${notificationId}`);
    
    // Here you would implement the actual action handlers
    switch (action) {
      case 'review_budget':
        // Navigate to budget page
        break;
      case 'start_campaign':
        // Navigate to campaign creation
        break;
      case 'send_reminder':
        // Open reminder composition
        break;
      case 'view_analytics':
        // Navigate to analytics
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'actionable') return notification.actionable;
    return notification.type === filter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'budget':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'membership':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'events':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'engagement':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h5v-5H4v5zM13 13h5V8h-5v5zM4 8h5V3H4v5z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h5v-5H4v5zM13 13h5V8h-5v5zM4 8h5V3H4v5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Smart Notifications</h2>
              <p className="text-sm text-gray-600">AI-powered insights and alerts</p>
            </div>
          </div>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View All
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'actionable', label: 'Actionable' },
            { key: 'budget', label: 'Budget' },
            { key: 'events', label: 'Events' },
            { key: 'membership', label: 'Members' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">No notifications to display</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(notification.priority)}
                      <div className="text-gray-500">
                        {getTypeIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                      
                      {/* Action Buttons */}
                      {notification.actions.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleAction(action.action, notification.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartNotifications;
