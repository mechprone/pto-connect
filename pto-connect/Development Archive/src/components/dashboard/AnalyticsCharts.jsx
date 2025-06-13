import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../modules/hooks/useUserProfile';
import { supabase } from '../../utils/supabaseClient';

const AnalyticsCharts = () => {
  const { userProfile } = useUserProfile();
  const [activeChart, setActiveChart] = useState('membership');
  const [timeRange, setTimeRange] = useState('6months');
  const [chartData, setChartData] = useState({
    membership: [],
    events: [],
    financial: [],
    engagement: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.org_id) {
      fetchChartData();
    }
  }, [userProfile, timeRange]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 6);
      }

      const [membershipData, eventsData, financialData, engagementData] = await Promise.all([
        fetchMembershipData(startDate, endDate),
        fetchEventsData(startDate, endDate),
        fetchFinancialData(startDate, endDate),
        fetchEngagementData(startDate, endDate)
      ]);

      setChartData({
        membership: membershipData,
        events: eventsData,
        financial: financialData,
        engagement: engagementData
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipData = async (startDate, endDate) => {
    // Generate monthly data points
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', userProfile.org_id)
        .lte('created_at', monthEnd.toISOString());

      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        value: count || 0,
        date: monthStart
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  const fetchEventsData = async (startDate, endDate) => {
    const { data: events } = await supabase
      .from('events')
      .select('event_date, title, status')
      .eq('org_id', userProfile.org_id)
      .gte('event_date', startDate.toISOString())
      .lte('event_date', endDate.toISOString())
      .order('event_date');

    // Group by month
    const monthlyEvents = {};
    events?.forEach(event => {
      const month = new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyEvents[month]) {
        monthlyEvents[month] = { total: 0, completed: 0 };
      }
      monthlyEvents[month].total++;
      if (event.status === 'completed') {
        monthlyEvents[month].completed++;
      }
    });

    return Object.entries(monthlyEvents).map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
      success_rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  };

  const fetchFinancialData = async (startDate, endDate) => {
    const { data: budgetEntries } = await supabase
      .from('budget_entries')
      .select('amount, type, category, created_at')
      .eq('org_id', userProfile.org_id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Group by category
    const categoryData = {};
    budgetEntries?.forEach(entry => {
      if (!categoryData[entry.category]) {
        categoryData[entry.category] = { income: 0, expenses: 0 };
      }
      if (entry.type === 'income') {
        categoryData[entry.category].income += entry.amount;
      } else {
        categoryData[entry.category].expenses += entry.amount;
      }
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }));
  };

  const fetchEngagementData = async (startDate, endDate) => {
    // Mock engagement data - in real implementation, this would come from activity tracking
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const month = currentDate.toLocaleDateString('en-US', { month: 'short' });
      
      // Generate realistic engagement metrics
      const baseEngagement = 65;
      const variation = Math.random() * 20 - 10; // ±10%
      const engagement = Math.max(0, Math.min(100, baseEngagement + variation));
      
      months.push({
        month,
        engagement: Math.round(engagement),
        email_opens: Math.round(engagement * 0.8),
        event_attendance: Math.round(engagement * 0.6),
        volunteer_participation: Math.round(engagement * 0.4)
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  const renderLineChart = (data, dataKey, color = '#3B82F6') => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d[dataKey] || 0));
    const minValue = Math.min(...data.map(d => d[dataKey] || 0));
    const range = maxValue - minValue || 1;

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (((item[dataKey] || 0) - minValue) / range) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            points={points}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (((item[dataKey] || 0) - minValue) / range) * 80 - 10;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill={color}
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4">
          {data.map((item, index) => (
            <span key={index}>{item.month}</span>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-4">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>
      </div>
    );
  };

  const renderBarChart = (data, dataKey, color = '#10B981') => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d[dataKey] || 0));

    return (
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const height = maxValue > 0 ? ((item[dataKey] || 0) / maxValue) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${height}%`,
                    backgroundColor: color,
                    minHeight: height > 0 ? '4px' : '0'
                  }}
                />
                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDonutChart = (data) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + Math.abs(item.net || 0), 0);
    let currentAngle = 0;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
      <div className="relative h-64 flex items-center justify-center">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = total > 0 ? Math.abs(item.net || 0) / total : 0;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = 50 + 35 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 35 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 35 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 35 * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                opacity={0.8}
              />
            );
          })}
          <circle cx="50" cy="50" r="20" fill="white" />
        </svg>
        
        {/* Legend */}
        <div className="absolute right-0 top-0 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-700">{item.category}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const exportData = () => {
    const dataToExport = chartData[activeChart];
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(dataToExport[0] || {}).join(",") + "\n" +
      dataToExport.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeChart}_analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartConfigs = {
    membership: {
      title: 'Membership Growth',
      description: 'Track member acquisition and retention over time',
      dataKey: 'value',
      color: '#3B82F6'
    },
    events: {
      title: 'Event Performance',
      description: 'Monitor event frequency and success rates',
      dataKey: 'total',
      color: '#10B981'
    },
    financial: {
      title: 'Financial Distribution',
      description: 'Analyze income and expenses by category',
      dataKey: 'net',
      color: '#F59E0B'
    },
    engagement: {
      title: 'Member Engagement',
      description: 'Measure community participation and activity',
      dataKey: 'engagement',
      color: '#8B5CF6'
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            
            {/* Export Button */}
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {Object.entries(chartConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeChart === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {config.title}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {chartConfigs[activeChart].title}
          </h3>
          <p className="text-sm text-gray-600">
            {chartConfigs[activeChart].description}
          </p>
        </div>

        {/* Chart Rendering */}
        <div className="mb-6">
          {activeChart === 'membership' && renderLineChart(
            chartData.membership,
            chartConfigs.membership.dataKey,
            chartConfigs.membership.color
          )}
          
          {activeChart === 'events' && renderBarChart(
            chartData.events,
            chartConfigs.events.dataKey,
            chartConfigs.events.color
          )}
          
          {activeChart === 'financial' && renderDonutChart(chartData.financial)}
          
          {activeChart === 'engagement' && renderLineChart(
            chartData.engagement,
            chartConfigs.engagement.dataKey,
            chartConfigs.engagement.color
          )}
        </div>

        {/* Chart Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {activeChart === 'membership' && chartData.membership.length > 0 && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {chartData.membership[chartData.membership.length - 1]?.value || 0}
                </p>
                <p className="text-sm text-gray-600">Current Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  +{chartData.membership.length > 1 ? 
                    (chartData.membership[chartData.membership.length - 1]?.value || 0) - 
                    (chartData.membership[0]?.value || 0) : 0}
                </p>
                <p className="text-sm text-gray-600">Growth</p>
              </div>
            </>
          )}

          {activeChart === 'events' && chartData.events.length > 0 && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {chartData.events.reduce((sum, item) => sum + item.total, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {chartData.events.length > 0 ? 
                    Math.round(chartData.events.reduce((sum, item) => sum + item.success_rate, 0) / chartData.events.length) : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg Success Rate</p>
              </div>
            </>
          )}

          {activeChart === 'financial' && chartData.financial.length > 0 && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${chartData.financial.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Income</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  ${chartData.financial.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Expenses</p>
              </div>
            </>
          )}

          {activeChart === 'engagement' && chartData.engagement.length > 0 && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {chartData.engagement[chartData.engagement.length - 1]?.engagement || 0}%
                </p>
                <p className="text-sm text-gray-600">Current Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {chartData.engagement.length > 0 ? 
                    Math.round(chartData.engagement.reduce((sum, item) => sum + item.email_opens, 0) / chartData.engagement.length) : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg Email Opens</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
