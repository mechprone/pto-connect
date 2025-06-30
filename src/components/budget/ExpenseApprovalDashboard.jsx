import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  CameraIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { expenseAPI } from '../../services/api';

const ExpenseApprovalDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [filter]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      let response;
      if (filter === 'pending') {
        response = await expenseAPI.getPendingExpenses();
      } else {
        // This would need an endpoint to get all expenses with status filter
        response = await expenseAPI.getPendingExpenses(); // Placeholder
      }

      if (response.success) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId, notes = '') => {
    setActionLoading(true);
    try {
      const response = await expenseAPI.approveExpense(expenseId, { notes });
      if (response.success) {
        await loadExpenses();
        setShowModal(false);
        setSelectedExpense(null);
      }
    } catch (error) {
      console.error('Failed to approve expense:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (expenseId, reason) => {
    setActionLoading(true);
    try {
      const response = await expenseAPI.rejectExpense(expenseId, { reason });
      if (response.success) {
        await loadExpenses();
        setShowModal(false);
        setSelectedExpense(null);
      }
    } catch (error) {
      console.error('Failed to reject expense:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'needs_info':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'needs_info':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ExpenseDetailModal = ({ expense, onClose, onApprove, onReject }) => {
    const [action, setAction] = useState('');
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
      if (action === 'approve') {
        onApprove(expense.id, notes);
      } else if (action === 'reject') {
        onReject(expense.id, reason);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Expense Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Expense Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium">{formatCurrency(expense.amount)}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="ml-2">{formatDate(expense.expense_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Submitted by:</span>
                      <span className="ml-2">{expense.submitted_by_name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Vendor:</span>
                      <span className="ml-2">{expense.vendor}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="ml-2">{expense.category_name}</span>
                    </div>
                    {expense.event_name && (
                      <div>
                        <span className="text-sm text-gray-600">Event:</span>
                        <span className="ml-2">{expense.event_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {expense.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {expense.description}
                  </p>
                </div>
              )}

              {/* Receipt Images */}
              {expense.receipt_images && expense.receipt_images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Receipt Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {expense.receipt_images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={`Receipt ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-2 right-2">
                          <CameraIcon className="h-4 w-4 text-white bg-black bg-opacity-50 rounded p-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Section */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Take Action</h4>
                
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setAction('approve')}
                      className={`flex-1 py-2 px-4 border rounded-md text-sm font-medium ${
                        action === 'approve'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                      }`}
                    >
                      <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => setAction('reject')}
                      className={`flex-1 py-2 px-4 border rounded-md text-sm font-medium ${
                        action === 'reject'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                      }`}
                    >
                      <XCircleIcon className="h-4 w-4 inline mr-2" />
                      Reject
                    </button>
                  </div>

                  {action === 'approve' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approval Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Add any notes about this approval..."
                      />
                    </div>
                  )}

                  {action === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (Required)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Please explain why this expense is being rejected..."
                        required
                      />
                    </div>
                  )}

                  {action && (
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setAction('')}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={actionLoading || (action === 'reject' && !reason.trim())}
                        className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                          action === 'approve'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {actionLoading ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Expense Approvals</h2>
          <p className="text-sm text-gray-600">Review and approve expense submissions</p>
        </div>
        <div className="flex space-x-2">
          {['pending', 'approved', 'rejected', 'all'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-2 text-sm font-medium rounded-md capitalize ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {expenses.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {expenses.filter(e => e.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {expenses.filter(e => e.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filter === 'all' ? 'All Expenses' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Expenses`}
          </h3>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No expenses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{expense.vendor}</div>
                        <div className="text-sm text-gray-500">{expense.category_name}</div>
                        {expense.event_name && (
                          <div className="text-xs text-blue-600">{expense.event_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.submitted_by_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.expense_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(expense.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedExpense(expense);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {expense.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(expense.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          onClose={() => {
            setShowModal(false);
            setSelectedExpense(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default ExpenseApprovalDashboard;