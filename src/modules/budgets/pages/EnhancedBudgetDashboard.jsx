import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, 
  Sparkles, User, Calculator, PieChart, BarChart3,
  Plus, Search, Filter, Calendar, Target, CheckCircle,
  ArrowUp, ArrowDown, Eye, Edit, Download
} from 'lucide-react';
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
        <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
          Let Stella Create Reallocation Plan
        </button>
      </div>
    </div>
  );

  const CategoryBreakdown = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Budget Categories</h3>
        <div className="flex items-center space-x-2">
          <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
            Manual Entry
          </button>
          <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors">
            Ask Stella
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {budgetData.categories.map(category => {
          const progressPercentage = (category.spent / category.budgeted) * 100;
          const isOverBudget = progressPercentage > 100;
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-gray-900">{category.name}</h4>
                  {category.createdBy === 'stella' && (
                    <Sparkles className="w-3 h-3 text-purple-500" title="Optimized by Stella" />
                  )}
                  <div className={`flex items-center space-x-1 text-xs ${
                    category.trend === 'up' ? 'text-green-600' : 
                    category.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {category.trend === 'up' && <ArrowUp className="w-3 h-3" />}
                    {category.trend === 'down' && <ArrowDown className="w-3 h-3" />}
                    <span className="capitalize">{category.trend}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    ${category.remaining.toLocaleString()} remaining
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOverBudget ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {category.subcategories.map((sub, index) => (
                  <div key={index} className="bg-gray-50 rounded p-2">
                    <div className="text-xs font-medium text-gray-900 truncate">{sub.name}</div>
                    <div className="text-xs text-gray-600">
                      ${sub.spent.toLocaleString()} / ${sub.budgeted.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-1">
                <button 
                  onClick={() => navigate(`/budget/category/${category.id}`)}
                  className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </button>
                <button 
                  onClick={() => navigate(`/budget/category/edit/${category.id}`)}
                  className="flex items-center px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                {category.createdBy === 'manual' && (
                  <button 
                    onClick={() => navigate(`/budget/category/optimize/${category.id}`)}
                    className="flex items-center px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Optimize
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
            onClick={() => navigate('/budget/category/create')}
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
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
          <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Let Stella Generate
          </button>
        </div>
      </div>
    </div>
  );

  const RecentTransactions = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
        <button className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
          <Download className="w-3 h-3 mr-1" />
          Export
        </button>
      </div>
      
      <div className="space-y-2">
        {budgetData.recentTransactions.map(transaction => (
          <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowUp className="w-3 h-3 text-green-600" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-600" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{transaction.description}</h4>
                  {transaction.createdBy === 'stella' && (
                    <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" title="Processed by Stella" />
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className={`text-sm font-semibold flex-shrink-0 ${
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your PTO finances with intelligent insights</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="current">Current Year</option>
              <option value="previous">Previous Year</option>
              <option value="quarter">This Quarter</option>
            </select>
            <button 
              onClick={() => navigate('/budget/analytics')}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Compact Overview & Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Budget Overview - Compact 2x2 Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Budget Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-600">Total Budget</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ${budgetData.totalBudget.toLocaleString()}
                  </div>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-600">Total Spent</span>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    ${budgetData.totalSpent.toLocaleString()}
                  </div>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Remaining</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    ${budgetData.totalRemaining.toLocaleString()}
                  </div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-600">Projected</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    ${budgetData.projectedIncome.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stella Insights - Compact */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 h-full">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-purple-900">Stella's Insights</h3>
              </div>
              
              <div className="space-y-2">
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-purple-600">Budget Health</div>
                  <div className="text-sm font-semibold text-green-700">Excellent</div>
                </div>
                
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-purple-600">Opportunity</div>
                  <div className="text-sm font-semibold text-purple-900">Fall Festival</div>
                </div>
                
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-purple-600">Savings Found</div>
                  <div className="text-sm font-semibold text-purple-900">$1,200</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Budget Options - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Create New Budget Item</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Manual</h4>
                  <p className="text-xs text-gray-600">Full control</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/budget/category/create')}
                className="w-full py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                Create Manually
              </button>
            </div>

            <div className="border border-blue-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Assisted</h4>
                  <p className="text-xs text-blue-700">Smart suggestions</p>
                </div>
              </div>
              <button className="w-full py-1.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors">
                Get Help
              </button>
            </div>

            <div className="border border-purple-200 rounded-lg p-3 hover:border-purple-300 transition-colors bg-purple-50">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-900">Auto</h4>
                  <p className="text-xs text-purple-700">AI-powered</p>
                </div>
              </div>
              <button className="w-full py-1.5 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors">
                Auto-Generate
              </button>
            </div>
          </div>
        </div>

        {/* Category Breakdown - Compact */}
        <CategoryBreakdown />

        {/* Recent Transactions - Compact */}
        <RecentTransactions />
      </div>
    </div>
  );
};

export default EnhancedBudgetDashboard;
