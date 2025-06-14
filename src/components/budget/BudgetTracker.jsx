import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { budgetAPI } from '../../services/api';

const BudgetTracker = ({ fiscalYear = new Date().getFullYear() }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [totals, setTotals] = useState({});
  const [viewMode, setViewMode] = useState('overview'); // overview, categories, trends
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [timeRange, setTimeRange] = useState('ytd'); // ytd, quarter, month

  useEffect(() => {
    loadBudgetData();
  }, [fiscalYear, timeRange]);

  const loadBudgetData = async () => {
    setLoading(true);
    try {
      const response = await budgetAPI.getCategories({
        fiscal_year: fiscalYear,
        include_spending: true
      });

      if (response.success) {
        setCategories(response.data);
        setTotals(response.totals);
      }
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (category) => {
    const percentageUsed = category.percentage_used || 0;
    if (percentageUsed >= 100) return 'text-red-600';
    if (percentageUsed >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (category) => {
    const percentageUsed = category.percentage_used || 0;
    if (percentageUsed >= 100) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    }
    if (percentageUsed >= 80) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
    }
    return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
  };

  // Prepare chart data
  const chartData = categories.map(category => ({
    name: category.name.length > 15 ? category.name.substring(0, 15) + '...' : category.name,
    fullName: category.name,
    budgeted: category.budget_amount || 0,
    spent: category.actual_spent || 0,
    remaining: category.remaining || 0,
    percentage: category.percentage_used || 0,
    type: category.category_type
  }));

  const expenseData = chartData.filter(item => item.type === 'expense');
  const revenueData = chartData.filter(item => item.type === 'revenue');

  // Pie chart data for budget allocation
  const pieData = categories.map(category => ({
    name: category.name,
    value: category.budget_amount || 0,
    color: category.category_type === 'revenue' ? '#10B981' : '#EF4444'
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.total_revenue_actual)}
              </p>
              <p className="text-sm text-gray-500">
                of {formatCurrency(totals.total_revenue_budget)} budgeted
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.total_expense_spent)}
              </p>
              <p className="text-sm text-gray-500">
                of {formatCurrency(totals.total_expense_budget)} budgeted
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Position</p>
              <p className={`text-2xl font-bold ${
                (totals.total_revenue_actual - totals.total_expense_spent) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(totals.total_revenue_actual - totals.total_expense_spent)}
              </p>
              <p className="text-sm text-gray-500">Current balance</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Over Budget</p>
              <p className="text-2xl font-bold text-yellow-600">
                {categories.filter(cat => cat.is_over_budget).length}
              </p>
              <p className="text-sm text-gray-500">
                of {categories.length} categories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget vs Actual Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Budget vs Actual Spending</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('categories')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={expenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, name) => [formatCurrency(value), name]}
              labelFormatter={(label) => {
                const item = expenseData.find(d => d.name === label);
                return item ? item.fullName : label;
              }}
            />
            <Legend />
            <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" />
            <Bar dataKey="spent" fill="#EF4444" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Allocation Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Budget Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Budget Alerts</h3>
          <div className="space-y-4">
            {categories
              .filter(cat => cat.percentage_used >= 80)
              .sort((a, b) => (b.percentage_used || 0) - (a.percentage_used || 0))
              .slice(0, 5)
              .map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {getStatusIcon(category)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(category.actual_spent)} of {formatCurrency(category.budget_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getStatusColor(category)}`}>
                      {formatPercentage(category.percentage_used)}
                    </p>
                    <p className="text-xs text-gray-500">used</p>
                  </div>
                </div>
              ))}
            
            {categories.filter(cat => cat.percentage_used >= 80).length === 0 && (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-sm text-gray-500">All categories are within budget!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoryDetails = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Category Details</h3>
        <button
          onClick={() => setViewMode('overview')}
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Overview
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Budget Categories</h4>
            <div className="flex space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="ytd">Year to Date</option>
                <option value="quarter">This Quarter</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budgeted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-500">{category.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.category_type === 'revenue' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.category_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(category.budget_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(category.category_type === 'revenue' ? category.actual_revenue : category.actual_spent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(category.remaining)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (category.percentage_used || 0) >= 100 ? 'bg-red-600' :
                            (category.percentage_used || 0) >= 80 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(category.percentage_used || 0, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(category)}`}>
                        {formatPercentage(category.percentage_used)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusIcon(category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Tracker</h2>
          <p className="text-sm text-gray-600">Fiscal Year {fiscalYear}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Categories
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'categories' && renderCategoryDetails()}
    </div>
  );
};

export default BudgetTracker;