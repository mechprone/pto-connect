import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, 
  Sparkles, User, Calculator, PieChart, BarChart3,
  Plus, Search, Filter, Calendar, Target, CheckCircle,
  ArrowUp, ArrowDown, Eye, Edit, Download, FileText,
  Upload, BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIAssistanceToggle from '../../../components/common/AIAssistanceToggle';

const EnhancedBudgetDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('overview');
  const [creationMode, setCreationMode] = useState('manual');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Sample budget data
  const budgetData = {
    totalBudget: 45000,
    totalSpent: 28500,
    totalRemaining: 16500,
    projectedIncome: 52000,
    categories: [
      {
        id: 1,
        name: 'Events & Programs',
        budgeted: 15000,
        spent: 8500,
        remaining: 6500,
        percentage: 57,
        trend: 'up',
        createdBy: 'stella',
        subcategories: [
          { name: 'Fall Festival', budgeted: 5000, spent: 3200 },
          { name: 'Science Night', budgeted: 3000, spent: 1800 },
          { name: 'Book Fair', budgeted: 4000, spent: 2500 },
          { name: 'Art Show', budgeted: 3000, spent: 1000 }
        ]
      },
      {
        id: 2,
        name: 'Educational Support',
        budgeted: 12000,
        spent: 7200,
        remaining: 4800,
        percentage: 60,
        trend: 'stable',
        createdBy: 'manual',
        subcategories: [
          { name: 'Classroom Supplies', budgeted: 6000, spent: 4200 },
          { name: 'Technology', budgeted: 4000, spent: 2000 },
          { name: 'Library Books', budgeted: 2000, spent: 1000 }
        ]
      },
      {
        id: 3,
        name: 'Communications',
        budgeted: 3000,
        spent: 1800,
        remaining: 1200,
        percentage: 60,
        trend: 'down',
        createdBy: 'stella',
        subcategories: [
          { name: 'Website & Digital', budgeted: 1500, spent: 800 },
          { name: 'Print Materials', budgeted: 1000, spent: 700 },
          { name: 'Social Media', budgeted: 500, spent: 300 }
        ]
      },
      {
        id: 4,
        name: 'Administrative',
        budgeted: 5000,
        spent: 3200,
        remaining: 1800,
        percentage: 64,
        trend: 'up',
        createdBy: 'manual',
        subcategories: [
          { name: 'Insurance', budgeted: 2000, spent: 2000 },
          { name: 'Banking & Fees', budgeted: 1000, spent: 600 },
          { name: 'Office Supplies', budgeted: 2000, spent: 600 }
        ]
      }
    ],
    recentTransactions: [
      {
        id: 1,
        date: '2024-10-15',
        description: 'Fall Festival Decorations',
        category: 'Events & Programs',
        amount: -450,
        type: 'expense',
        createdBy: 'stella'
      },
      {
        id: 2,
        date: '2024-10-14',
        description: 'Book Fair Revenue',
        category: 'Events & Programs',
        amount: 2800,
        type: 'income',
        createdBy: 'manual'
      },
      {
        id: 3,
        date: '2024-10-12',
        description: 'Classroom Technology',
        category: 'Educational Support',
        amount: -1200,
        type: 'expense',
        createdBy: 'manual'
      }
    ]
  };

  const handleCreationModeChange = (mode, settings) => {
    setCreationMode(mode);
    console.log('Creation mode changed:', mode, settings);
  };

  // Button handlers
  const handleCreateManually = () => {
    navigate('/budget/create');
  };

  const handleGetStellaHelp = () => {
    navigate('/budget/create?mode=ai-assisted');
  };

  const handleLetStellaGenerate = () => {
    navigate('/budget/create?mode=ai-automated');
  };

  const handleViewDetails = (categoryId) => {
    navigate(`/budget/category/${categoryId}`);
  };

  const handleEditCategory = (categoryId) => {
    navigate(`/budget/category/${categoryId}/edit`);
  };

  const handleAskStellaOptimize = (categoryId) => {
    navigate(`/budget/category/${categoryId}/optimize`);
  };

  const handleLetStellaCreateReallocation = () => {
    navigate('/budget/reallocation/create');
  };

  const BudgetOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Total Budget</h3>
          </div>
        </div>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          ${budgetData.totalBudget.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          For current fiscal year
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <h3 className="font-semibold text-gray-900">Total Spent</h3>
          </div>
        </div>
        <div className="text-3xl font-bold text-red-600 mb-2">
          ${budgetData.totalSpent.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          {Math.round((budgetData.totalSpent / budgetData.totalBudget) * 100)}% of budget used
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Remaining</h3>
          </div>
        </div>
        <div className="text-3xl font-bold text-green-600 mb-2">
          ${budgetData.totalRemaining.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          Available for spending
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Projected Income</h3>
          </div>
        </div>
        <div className="text-3xl font-bold text-purple-600 mb-2">
          ${budgetData.projectedIncome.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          Expected total revenue
        </div>
      </div>
    </div>
  );

  const StellaInsights = () => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">Stella's Budget Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Budget Health</div>
          <div className="text-lg font-semibold text-green-700">Excellent</div>
          <div className="text-xs text-purple-700">On track for surplus</div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Biggest Opportunity</div>
          <div className="text-lg font-semibold text-purple-900">Fall Festival</div>
          <div className="text-xs text-purple-700">Could generate $2K more</div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Cost Savings</div>
          <div className="text-lg font-semibold text-purple-900">$1,200 Found</div>
          <div className="text-xs text-purple-700">In administrative costs</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4">
        <div className="text-sm text-purple-900 font-medium mb-2">💡 Stella's Recommendation</div>
        <div className="text-sm text-purple-800">
          "Your Events & Programs category is performing well! Consider reallocating $1,000 from Administrative 
          to Educational Support to maximize impact on students. I can create a reallocation plan for you."
        </div>
        <button 
          onClick={handleLetStellaCreateReallocation}
          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
        >
          Let Stella Create Reallocation Plan
        </button>
      </div>
    </div>
  );

  const CategoryBreakdown = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Budget Categories</h3>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            Manual Entry
          </button>
          <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
            Ask Stella
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {budgetData.categories.map(category => {
          const progressPercentage = (category.spent / category.budgeted) * 100;
          const isOverBudget = progressPercentage > 100;
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                  {category.createdBy === 'stella' && (
                    <Sparkles className="w-4 h-4 text-purple-500" title="Optimized by Stella" />
                  )}
                  <div className={`flex items-center space-x-1 text-sm ${
                    category.trend === 'up' ? 'text-green-600' : 
                    category.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {category.trend === 'up' && <ArrowUp className="w-4 h-4" />}
                    {category.trend === 'down' && <ArrowDown className="w-4 h-4" />}
                    <span className="capitalize">{category.trend}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${category.remaining.toLocaleString()} remaining
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isOverBudget ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {category.subcategories.map((sub, index) => (
                  <div key={index} className="bg-gray-50 rounded p-3">
                    <div className="text-sm font-medium text-gray-900">{sub.name}</div>
                    <div className="text-xs text-gray-600">
                      ${sub.spent.toLocaleString()} / ${sub.budgeted.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button 
                  onClick={() => handleViewDetails(category.id)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button 
                  onClick={() => handleEditCategory(category.id)}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                {category.createdBy === 'manual' && (
                  <button 
                    onClick={() => handleAskStellaOptimize(category.id)}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ask Stella to Optimize
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const MonthlyReconciliation = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart2 className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-semibold text-gray-900">Monthly Reconciliation</h3>
        </div>
        <button 
          onClick={() => navigate('/budget/reconciliation')}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          View All Reconciliations
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Start Reconciliation */}
        <div className="border-2 border-indigo-200 rounded-lg p-6 hover:border-indigo-400 transition-colors bg-indigo-50">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="w-8 h-8 text-indigo-600" />
            <div>
              <h4 className="font-semibold text-indigo-900">Start New Reconciliation</h4>
              <p className="text-sm text-indigo-700">Upload bank statement and reconcile transactions</p>
            </div>
          </div>
          <ul className="text-sm text-indigo-700 space-y-2 mb-4">
            <li>• OCR bank statement processing</li>
            <li>• Smart transaction matching</li>
            <li>• Automated discrepancy detection</li>
            <li>• Generate reconciliation reports</li>
          </ul>
          <button 
            onClick={() => navigate('/budget/reconciliation/new')}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Reconciliation
          </button>
        </div>

        {/* Recent Reconciliation Status */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Recent Reconciliations</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-900">October 2024</div>
                <div className="text-sm text-green-700">Completed • 98% match rate</div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium text-yellow-900">November 2024</div>
                <div className="text-sm text-yellow-700">In Progress • 3 discrepancies</div>
              </div>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">December 2024</div>
                <div className="text-sm text-gray-700">Pending • Not started</div>
              </div>
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/budget/reconciliation')}
            className="w-full mt-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            View Reconciliation History
          </button>
        </div>
      </div>
      
      {/* Reconciliation Insights */}
      <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-indigo-900">Reconciliation Insights</span>
        </div>
        <div className="text-sm text-indigo-800">
          Your reconciliation accuracy has improved by 15% this quarter. Consider setting up automated 
          monthly reconciliations to maintain financial accuracy and save time.
        </div>
      </div>
    </div>
  );

  const CreateBudgetOptions = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Budget Item</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <Calculator className="w-8 h-8 text-gray-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Manual Entry</h4>
              <p className="text-sm text-gray-600">Full control over details</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            <li>• Custom categories</li>
            <li>• Detailed line items</li>
            <li>• Manual calculations</li>
          </ul>
          <button 
            onClick={handleCreateManually}
            className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Create Manually
          </button>
        </div>

        <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors bg-blue-50">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Stella Assisted</h4>
              <p className="text-sm text-blue-700">Smart suggestions & validation</p>
            </div>
          </div>
          <ul className="text-sm text-blue-700 space-y-2 mb-4">
            <li>• Budget recommendations</li>
            <li>• Historical comparisons</li>
            <li>• Optimization suggestions</li>
          </ul>
          <button 
            onClick={handleGetStellaHelp}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Stella's Help
          </button>
        </div>

        <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors bg-purple-50">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="font-semibold text-purple-900">Stella Auto-Generate</h4>
              <p className="text-sm text-purple-700">Complete budget creation</p>
            </div>
          </div>
          <ul className="text-sm text-purple-700 space-y-2 mb-4">
            <li>• AI-powered allocations</li>
            <li>• Predictive modeling</li>
            <li>• Optimization algorithms</li>
          </ul>
          <button 
            onClick={handleLetStellaGenerate}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Let Stella Generate
          </button>
        </div>
      </div>
    </div>
  );

  const RecentTransactions = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>
      
      <div className="space-y-4">
        {budgetData.recentTransactions.map(transaction => (
          <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowUp className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                  {transaction.createdBy === 'stella' && (
                    <Sparkles className="w-4 h-4 text-purple-500" title="Processed by Stella" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className={`text-lg font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Dashboard</h1>
            <p className="text-gray-600">Manage your PTO finances with Stella's intelligent insights</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="current">Current Year</option>
              <option value="previous">Previous Year</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        {/* Budget Overview */}
        <BudgetOverview />

        {/* Stella's Insights */}
        <StellaInsights />

        {/* Monthly Reconciliation */}
        <MonthlyReconciliation />

        {/* Create Budget Options */}
        <CreateBudgetOptions />

        {/* Category Breakdown */}
        <CategoryBreakdown />

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>
    </div>
  );
};

export default EnhancedBudgetDashboard;
