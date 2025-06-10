import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon, 
  BellIcon, 
  ShareIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const CommunicationDashboard = () => {
  const { user, organization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    emailTemplates: 0,
    smsCampaigns: 0,
    totalSent: 0,
    avgEngagement: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (organization?.id) {
      fetchDashboardData();
    }
  }, [organization?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch communication statistics
      const [templatesResponse, campaignsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/communications/templates`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/communications/sms/campaigns`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setStats(prev => ({ ...prev, emailTemplates: templatesData.count || 0 }));
      }

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setStats(prev => ({ 
          ...prev, 
          smsCampaigns: campaignsData.count || 0,
          totalSent: campaignsData.data?.reduce((sum, campaign) => sum + (campaign.sent_count || 0), 0) || 0
        }));
        
        // Set recent activity from campaigns
        setRecentActivity(campaignsData.data?.slice(0, 5).map(campaign => ({
          id: campaign.id,
          type: 'sms',
          title: campaign.name,
          status: campaign.status,
          timestamp: campaign.created_at,
          recipients: campaign.recipient_count || 0
        })) || []);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load communication dashboard');
    } finally {
      setLoading(false);
    }
  };

  const communicationChannels = [
    {
      name: 'Email Templates',
      description: 'Create and manage email templates',
      icon: EnvelopeIcon,
      color: 'bg-blue-500',
      count: stats.emailTemplates,
      href: '/communications/email-templates',
      action: 'Manage Templates'
    },
    {
      name: 'SMS Campaigns',
      description: 'Send SMS messages to members',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-green-500',
      count: stats.smsCampaigns,
      href: '/communications/sms-campaigns',
      action: 'Create Campaign'
    },
    {
      name: 'Push Notifications',
      description: 'Send real-time notifications',
      icon: BellIcon,
      color: 'bg-purple-500',
      count: 0,
      href: '/communications/push-notifications',
      action: 'Coming Soon',
      disabled: true
    },
    {
      name: 'Social Media',
      description: 'Manage social media posts',
      icon: ShareIcon,
      color: 'bg-pink-500',
      count: 0,
      href: '/communications/social-media',
      action: 'Coming Soon',
      disabled: true
    }
  ];

  const quickActions = [
    {
      name: 'Create Email Template',
      description: 'Design a new email template',
      icon: EnvelopeIcon,
      href: '/communications/email-templates/create',
      color: 'bg-blue-500'
    },
    {
      name: 'Send SMS Campaign',
      description: 'Create and send SMS to members',
      icon: PaperAirplaneIcon,
      href: '/communications/sms-campaigns/create',
      color: 'bg-green-500'
    },
    {
      name: 'View Analytics',
      description: 'Communication performance metrics',
      icon: ChartBarIcon,
      href: '/communications/analytics',
      color: 'bg-indigo-500'
    },
    {
      name: 'Manage Preferences',
      description: 'User communication settings',
      icon: EyeIcon,
      href: '/communications/preferences',
      color: 'bg-gray-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
            <p className="text-gray-600 mt-1">
              Manage all your PTO communications from one central location
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/communications/email-templates/create'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Template</span>
            </button>
            <button
              onClick={() => window.location.href = '/communications/sms-campaigns/create'}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              <span>Send SMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Email Templates</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.emailTemplates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">SMS Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.smsCampaigns}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PaperAirplaneIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Messages Sent</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Engagement</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avgEngagement}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Channels */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {communicationChannels.map((channel) => {
            const IconComponent = channel.icon;
            return (
              <div
                key={channel.name}
                className={`relative p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors ${
                  channel.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                }`}
                onClick={() => !channel.disabled && (window.location.href = channel.href)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${channel.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{channel.name}</h3>
                    <p className="text-sm text-gray-500">{channel.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{channel.count}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    channel.disabled 
                      ? 'bg-gray-100 text-gray-500' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}>
                    {channel.action}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <div
                  key={action.name}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
                  onClick={() => window.location.href = action.href}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{action.name}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-3 rounded-lg bg-gray-50">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'sms' ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {activity.type === 'sms' ? (
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-white" />
                    ) : (
                      <EnvelopeIcon className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-500">
                      {activity.status} • {activity.recipients} recipients
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent communication activity</p>
              <p className="text-sm text-gray-400 mt-1">
                Start by creating an email template or SMS campaign
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationDashboard;
