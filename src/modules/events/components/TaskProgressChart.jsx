import React, { useState, useEffect } from 'react';
import { Card, Select } from '@/components/common';
import { api } from '@/utils/api';

const TaskProgressChart = ({ eventId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    loadChartData();
  }, [eventId, timeframe]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}/task-progress?timeframe=${timeframe}`);
      setChartData(response.data);
    } catch (err) {
      setError('Failed to load chart data');
      console.error('Error loading chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No chart data available</p>
      </div>
    );
  }

  // Simple chart visualization using CSS
  const maxValue = Math.max(...chartData.data.map(d => d.completed_tasks));
  const chartHeight = 200;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Completion Trend</h3>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
        </Select>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        <div className="flex items-end justify-between h-full space-x-2">
          {chartData.data.map((dataPoint, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              {/* Bar */}
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{
                  height: `${(dataPoint.completed_tasks / maxValue) * chartHeight}px`,
                  minHeight: '4px'
                }}
                title={`${dataPoint.date}: ${dataPoint.completed_tasks} tasks completed`}
              ></div>
              
              {/* Label */}
              <div className="text-xs text-gray-600 mt-2 text-center">
                {new Date(dataPoint.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {chartData.total_completed || 0}
          </p>
          <p className="text-sm text-gray-600">Total Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {chartData.average_daily || 0}
          </p>
          <p className="text-sm text-gray-600">Avg Daily</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            {chartData.completion_rate || 0}%
          </p>
          <p className="text-sm text-gray-600">Completion Rate</p>
        </div>
      </div>
    </div>
  );
};

export default TaskProgressChart; 