import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Download, Paperclip,
  AlertTriangle, CheckCircle, Clock, User, Tag, MessageSquare, Calendar
} from 'lucide-react';

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockTransaction = {
          id: parseInt(id),
          type: 'expense',
          description: 'Decorations from Party City',
          amount: 450.75,
          date: '2024-10-15',
          category: { id: 1, name: 'Events & Programs' },
          subcategory: { id: 1, name: 'Fall Festival' },
          submittedBy: { id: 101, name: 'Alice Johnson' },
          status: 'approved',
          approvedBy: { id: 202, name: 'Bob Williams (Treasurer)' },
          approvalDate: '2024-10-16',
          receipt: { name: 'receipt_party_city.pdf', url: '/path/to/receipt.pdf', size: '1.2MB' },
          notes: 'Purchased decorations for the Fall Festival event. Includes banners, tablecloths, and balloons.',
          comments: [
            { id: 1, user: 'Alice Johnson', date: '2024-10-15', text: 'Submitted for approval.' },
            { id: 2, user: 'Bob Williams', date: '2024-10-16', text: 'Looks good. Approved.' }
          ]
        };
        setTransaction(mockTransaction);
        setLoading(false);
      }, 1000);
    };

    fetchTransactionDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
          <p className="text-gray-600 mb-4">The transaction you're looking for doesn't exist.</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = {
    pending: { icon: Clock, color: 'yellow', text: 'Pending Approval' },
    approved: { icon: CheckCircle, color: 'green', text: 'Approved' },
    denied: { icon: AlertTriangle, color: 'red', text: 'Denied' },
  };
  const currentStatus = statusInfo[transaction.status] || statusInfo.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/budget')} className="hover:text-blue-600">Budget</button>
          <span>/</span>
          <button onClick={() => navigate(`/budget/category/${transaction.category.id}`)} className="hover:text-blue-600">{transaction.category.name}</button>
          <span>/</span>
          <button onClick={() => navigate(`/budget/subcategory/${transaction.subcategory.id}`)} className="hover:text-blue-600">{transaction.subcategory.name}</button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Transaction Details</span>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{transaction.description}</h1>
                <p className="text-sm text-gray-500">
                  Transaction ID: #{transaction.id}
                </p>
              </div>
              <div className={`text-3xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusIcon className={`w-6 h-6 text-${currentStatus.color}-500`} />
                <span className={`text-lg font-semibold text-${currentStatus.color}-600`}>{currentStatus.text}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => navigate(`/budget/transaction/edit/${transaction.id}`)} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </button>
                <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Transaction Date</p>
                  <p className="font-medium text-gray-900">{new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Tag className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  {/* Use > to prevent JSX parsing error */}
                  <p className="font-medium text-gray-900">{transaction.category.name} &gt; {transaction.subcategory.name}</p>
                </div>
              </div>
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Submitted By</p>
                  <p className="font-medium text-gray-900">{transaction.submittedBy.name}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {transaction.status === 'approved' && transaction.approvedBy && (
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Approved By</p>
                    <p className="font-medium text-gray-900">{transaction.approvedBy.name}</p>
                    <p className="text-xs text-gray-500">on {new Date(transaction.approvalDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {transaction.receipt && (
                <div className="flex items-start">
                  <Paperclip className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Receipt</p>
                    <a href={transaction.receipt.url} target="_blank" rel="noopener noreferrer" className="flex items-center font-medium text-blue-600 hover:text-blue-700">
                      {transaction.receipt.name} ({transaction.receipt.size})
                      <Download className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{transaction.notes || 'No notes provided.'}</p>
          </div>

          {/* Comments/History */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">History & Comments</h3>
            <div className="space-y-4">
              {transaction.comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-sm text-gray-900">{comment.user}</p>
                      <p className="text-xs text-gray-500">{new Date(comment.date).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start space-x-3 pt-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="w-full">
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="2" placeholder="Add a comment..."></textarea>
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Add Comment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
