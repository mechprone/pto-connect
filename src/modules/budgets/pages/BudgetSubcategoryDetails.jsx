import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, 
  Calendar, Edit, Plus, Download, Filter,
  AlertTriangle, CheckCircle, Sparkles, List
} from 'lucide-react';

const BudgetSubcategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subcategory, setSubcategory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchSubcategoryDetails = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockSubcategory = {
          id: parseInt(id),
          name: 'Fall Festival',
          parentCategoryId: 1,
          parentCategoryName: 'Events & Programs',
          description: 'Budget for the annual Fall Festival community event.',
          budgeted: 5000,
          spent: 3200,
          remaining: 1800,
          status: 'active',
          createdBy: 'stella',
          createdDate: '2024-09-05',
        };

        const mockTransactions = [
          {
            id: 1,
            date: '2024-10-15',
            description: 'Decorations from Party City',
            amount: -450,
            type: 'expense',
            status: 'approved',
            approvedBy: 'Sarah Johnson',
            receipt: true,
            createdBy: 'stella'
          },
          {
            id: 4,
            date: '2024-10-10',
            description: 'Venue Deposit - Community Park',
            amount: -800,
            type: 'expense',
            status: 'approved',
            approvedBy: 'Mike Chen',
            receipt: true,
            createdBy: 'manual'
          },
          {
            id: 6,
            date: '2024-09-20',
            description: 'Ticket Sales (Early Bird)',
            amount: 1200,
            type: 'income',
            status: 'confirmed',
            createdBy: 'manual'
          },
           {
            id: 7,
            date: '2024-10-18',
            description: 'Bouncy House Rental',
            amount: -500,
            type: 'expense',
            status: 'pending',
            receipt: false,
            createdBy: 'manual'
          }
        ];

        setSubcategory(mockSubcategory);
        setTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    };

    fetchSubcategoryDetails();
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
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subcategory details...</p>
        </div>
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subcategory Not Found</h2>
          <p className="text-gray-600 mb-4">The budget subcategory you're looking for doesn't exist.</p>
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

  const progressPercentage = (subcategory.spent / subcategory.budgeted) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button 
            onClick={() => navigate('/budget')}
            className="hover:text-blue-600 transition-colors"
          >
            Budget Dashboard
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate(`/budget/category/${subcategory.parentCategoryId}`)}
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            {subcategory.parentCategoryName}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{subcategory.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">{subcategory.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subcategory.status === 'active' ? 'bg-green-100 text-green-700' :
              subcategory.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {subcategory.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(`/budget/subcategory/edit/${subcategory.id}`)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Subcategory
            </button>
            <button 
              onClick={() => navigate(`/budget/transaction/create?subcategory=${subcategory.id}`)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Subcategory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Budgeted</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              ${subcategory.budgeted.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-gray-900">Spent</h3>
            </div>
            <div className="text-3xl font-bold text-red-600">
              ${subcategory.spent.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Remaining</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${subcategory.remaining.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
            <span className="font-medium text-gray-900">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="h-4 rounded-full bg-blue-600"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {subcategory.description}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Transactions for {subcategory.name}</h3>
            <div className="flex items-center space-x-3">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'approved' || transaction.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
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

export default BudgetSubcategoryDetails;
