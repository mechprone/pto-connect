import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, 
  Calendar, User, Edit, Plus, Download, Filter,
  AlertTriangle, CheckCircle, Clock, Sparkles
} from 'lucide-react';

const BudgetCategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockCategory = {
          id: parseInt(id),
          name: 'Events & Programs',
          description: 'Budget allocation for all PTO events and educational programs',
          budgeted: 15000,
          spent: 8500,
          remaining: 6500,
          percentage: 57,
          trend: 'up',
          createdBy: 'stella',
          createdDate: '2024-09-01',
          lastModified: '2024-10-15',
          subcategories: [
            { 
              id: 1, 
              name: 'Fall Festival', 
              budgeted: 5000, 
              spent: 3200, 
              remaining: 1800,
              status: 'active'
            },
            { 
              id: 2, 
              name: 'Science Night', 
              budgeted: 3000, 
              spent: 1800, 
              remaining: 1200,
              status: 'active'
            },
            { 
              id: 3, 
              name: 'Book Fair', 
              budgeted: 4000, 
              spent: 2500, 
              remaining: 1500,
              status: 'completed'
            },
            { 
              id: 4, 
              name: 'Art Show', 
              budgeted: 3000, 
              spent: 1000, 
              remaining: 2000,
              status: 'planned'
            }
          ]
        };

        const mockTransactions = [
          {
            id: 1,
            date: '2024-10-15',
            description: 'Fall Festival Decorations',
            subcategory: 'Fall Festival',
            amount: -450,
            type: 'expense',
            status: 'approved',
            approvedBy: 'Sarah Johnson',
            receipt: true,
            createdBy: 'stella'
          },
          {
            id: 2,
            date: '2024-10-14',
            description: 'Book Fair Revenue',
            subcategory: 'Book Fair',
            amount: 2800,
            type: 'income',
            status: 'confirmed',
            createdBy: 'manual'
          },
          {
            id: 3,
            date: '2024-10-12',
            description: 'Science Night Materials',
            subcategory: 'Science Night',
            amount: -320,
            type: 'expense',
            status: 'pending',
            receipt: false,
            createdBy: 'manual'
          },
          {
            id: 4,
            date: '2024-10-10',
            description: 'Fall Festival Venue Deposit',
            subcategory: 'Fall Festival',
            amount: -800,
            type: 'expense',
            status: 'approved',
            approvedBy: 'Mike Chen',
            receipt: true,
            createdBy: 'manual'
          },
          {
            id: 5,
            date: '2024-10-08',
            description: 'Art Show Supplies',
            subcategory: 'Art Show',
            amount: -150,
            type: 'expense',
            status: 'approved',
            approvedBy: 'Sarah Johnson',
            receipt: true,
            createdBy: 'stella'
          }
        ];

        setCategory(mockCategory);
        setTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    };

    fetchCategoryDetails();
  }, [id]);

  const filteredTransactions = transactions.filter(transaction => {
    if (filterPeriod === 'all') return true;
    
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    
    switch (filterPeriod) {
      case 'week':
        return transactionDate >= new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return transactionDate >= new Date(now.setMonth(now.getMonth() - 1));
      case 'quarter':
        return transactionDate >= new Date(now.setMonth(now.getMonth() - 3));
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-600 mb-4">The budget category you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/budget')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Budget Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = (category.spent / category.budgeted) * 100;
  const isOverBudget = progressPercentage > 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button 
            onClick={() => navigate('/budget')}
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Budget Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            {category.createdBy === 'stella' && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Optimized by Stella</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(`/budget/category/edit/${category.id}`)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Category
            </button>
            <button 
              onClick={() => navigate(`/budget/transaction/create?category=${category.id}`)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Total Budget</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${category.budgeted.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Allocated for {category.name}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-gray-900">Amount Spent</h3>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              ${category.spent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(progressPercentage)}% of budget used
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Remaining</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${category.remaining.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Available to spend
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Budget Health</h3>
            </div>
            <div className={`text-3xl font-bold mb-2 ${
              progressPercentage < 75 ? 'text-green-600' : 
              progressPercentage < 90 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {progressPercentage < 75 ? 'Good' : 
               progressPercentage < 90 ? 'Caution' : 'Over'}
            </div>
            <div className="text-sm text-gray-600">
              Budget status
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className={`h-4 rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {category.description}
          </div>
        </div>

        {/* Subcategories */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Subcategories</h3>
            <button 
              onClick={() => navigate(`/budget/subcategory/create?parent=${category.id}`)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.subcategories.map(sub => {
              const subProgress = (sub.spent / sub.budgeted) * 100;
              
              return (
                <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{sub.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' :
                        sub.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate(`/budget/subcategory/${sub.id}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>${sub.spent.toLocaleString()} spent</span>
                    <span>${sub.remaining.toLocaleString()} remaining</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(subProgress, 100)}%` }}
                    />
                  </div>
                  
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {Math.round(subProgress)}% of ${sub.budgeted.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <div className="flex items-center space-x-3">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      {transaction.createdBy === 'stella' && (
                        <Sparkles className="w-4 h-4 text-purple-500" title="Processed by Stella" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'approved' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.subcategory} • {new Date(transaction.date).toLocaleDateString()}
                      {transaction.approvedBy && (
                        <span> • Approved by {transaction.approvedBy}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                  <button 
                    onClick={() => navigate(`/budget/transaction/${transaction.id}`)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetCategoryDetails;
