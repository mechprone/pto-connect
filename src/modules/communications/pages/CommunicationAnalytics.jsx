import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Users, Mail, MessageSquare, 
  Calendar, ArrowLeft, Download, Filter, RefreshCw,
  Eye, MousePointer, Share2, Clock
} from 'lucide-react';

const CommunicationAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');
  const [communicationType, setCommunicationType] = useState('all');

  // Sample analytics data
  const overviewStats = {
    totalSent: 1247,
    totalOpened: 892,
    totalClicked: 234,
    totalShared: 67,
    openRate: 71.5,
    clickRate: 18.8,
    shareRate: 5.4,
    avgEngagement: 65.2
  };

  const campaignPerformance = [
    {
      id: 1,
      name: 'Fall Festival Announcement',
      type: 'email',
      sent: 450,
      opened: 342,
      clicked: 89,
      openRate: 76,
      clickRate: 20,
      sentDate: '2024-10-01'
    },
    {
      id: 2,
      name: 'Volunteer Drive',
      type: 'social',
      sent: 1,
      reached: 1200,
      engaged: 156,
      shared: 23,
      engagementRate: 13,
      sentDate: '2024-09-28'
    },
    {
      id: 3,
      name: 'Book Fair Reminder',
      type: 'sms',
      sent: 320,
      delivered: 318,
      clicked: 45,
      deliveryRate: 99,
      clickRate: 14,
      sentDate: '2024-09-25'
    }
  ];

  const audienceInsights = {
    mostEngaged: 'Parents with Elementary Kids',
    bestTime: 'Tuesday 10:00 AM',
    preferredChannel: 'Email',
    growthRate: 12.5
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const CampaignRow = ({ campaign }) => {
    const getTypeColor = (type) => {
      const colors = {
        email: 'bg-blue-100 text-blue-800',
        sms: 'bg-green-100 text-green-800',
        social: 'bg-purple-100 text-purple-800'
      };
      return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
            <div className="text-sm text-gray-500">{new Date(campaign.sentDate).toLocaleDateString()}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(campaign.type)}`}>
            {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {campaign.sent || campaign.reached}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {campaign.opened || campaign.engaged || campaign.delivered}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {campaign.clicked || campaign.shared}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-900">
              {campaign.openRate || campaign.engagementRate || campaign.deliveryRate}%
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${campaign.openRate || campaign.engagementRate || campaign.deliveryRate}%` }}
              />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button className="text-blue-600 hover:text-blue-900">View Details</button>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/communications')}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Analytics</h1>
              <p className="text-gray-600">Track performance and engagement across all channels</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Mail}
            title="Total Sent"
            value={overviewStats.totalSent.toLocaleString()}
            subtitle="Communications"
            trend={8.2}
            color="blue"
          />
          <StatCard
            icon={Eye}
            title="Open Rate"
            value={`${overviewStats.openRate}%`}
            subtitle={`${overviewStats.totalOpened} opened`}
            trend={3.1}
            color="green"
          />
          <StatCard
            icon={MousePointer}
            title="Click Rate"
            value={`${overviewStats.clickRate}%`}
            subtitle={`${overviewStats.totalClicked} clicked`}
            trend={-1.2}
            color="purple"
          />
          <StatCard
            icon={Share2}
            title="Share Rate"
            value={`${overviewStats.shareRate}%`}
            subtitle={`${overviewStats.totalShared} shared`}
            trend={5.7}
            color="orange"
          />
        </div>

        {/* Audience Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{audienceInsights.mostEngaged}</div>
              <div className="text-sm text-gray-600">Most Engaged Segment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{audienceInsights.bestTime}</div>
              <div className="text-sm text-gray-600">Best Send Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{audienceInsights.preferredChannel}</div>
              <div className="text-sm text-gray-600">Preferred Channel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">+{audienceInsights.growthRate}%</div>
              <div className="text-sm text-gray-600">Audience Growth</div>
            </div>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
              <div className="flex items-center space-x-3">
                <select
                  value={communicationType}
                  onChange={(e) => setCommunicationType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="social">Social Media</option>
                </select>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent/Reached
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opened/Engaged
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicked/Shared
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaignPerformance.map(campaign => (
                  <CampaignRow key={campaign.id} campaign={campaign} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Stella's Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Optimize Send Times</h4>
              <p className="text-sm text-gray-600">
                Your emails perform 23% better when sent on Tuesday mornings. Consider scheduling more campaigns during this time.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Improve Subject Lines</h4>
              <p className="text-sm text-gray-600">
                Subject lines with "Event" or "Volunteer" get 15% higher open rates. Try incorporating these keywords.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationAnalytics;
