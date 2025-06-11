import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, DollarSign, Upload, Paperclip,
  AlertTriangle, CheckCircle, Calendar, Type, FileText
} from 'lucide-react';

const CreateEditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    type: 'expense', // 'expense' or 'income'
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: categoryId || '',
    subcategoryId: subcategoryId || '',
    receipt: null,
    notes: '',
    status: 'pending', // pending, approved, denied
  });

  const [receiptPreview, setReceiptPreview] = useState(null);

  // Mock data for existing transaction (if editing)
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockTransaction = {
          id: parseInt(id),
          type: 'expense',
          description: 'Decorations from Party City',
          amount: 450,
          date: '2024-10-15',
          categoryId: '1',
          subcategoryId: '1',
          receipt: { name: 'receipt_party_city.pdf' },
          notes: 'Purchased decorations for the Fall Festival event.',
          status: 'approved',
        };
        
        setFormData({
          ...mockTransaction,
          amount: mockTransaction.amount.toString(),
        });
        if (mockTransaction.receipt) {
          setReceiptPreview(mockTransaction.receipt.name);
        }
        setLoading(false);
      }, 1000);
    }
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, receipt: file }));
      setReceiptPreview(file.name);
    }
  };

  const removeReceipt = () => {
    setFormData(prev => ({ ...prev, receipt: null }));
    setReceiptPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'A valid amount is required';
    if (!formData.date) newErrors.date = 'Transaction date is required';
    if (!formData.categoryId) newErrors.categoryId = 'A budget category must be selected';
    if (!formData.subcategoryId) newErrors.subcategoryId = 'A budget subcategory must be selected';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Simulate API call with FormData for file upload
      const apiFormData = new FormData();
      Object.keys(formData).forEach(key => {
        apiFormData.append(key, formData[key]);
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Saving transaction:', Object.fromEntries(apiFormData.entries()));
      
      navigate(`/budget/subcategory/${formData.subcategoryId}`);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction...</p>
        </div>
      </div>
    );
  }

  // Mock data for dropdowns
  const categories = [{id: '1', name: 'Events & Programs'}, {id: '2', name: 'Educational Support'}];
  const subcategories = [{id: '1', name: 'Fall Festival', parentId: '1'}, {id: '2', name: 'Science Night', parentId: '1'}, {id: '3', name: 'Classroom Supplies', parentId: '2'}];
  const filteredSubcategories = subcategories.filter(s => s.parentId === formData.categoryId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update the details for this transaction.' : 'Record a new income or expense.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-lg shadow-lg p-8">
          {/* Transaction Type */}
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Type *</label>
            <div className="flex items-center">
              <input type="radio" id="expense" name="type" value="expense" checked={formData.type === 'expense'} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
              <label htmlFor="expense" className="ml-2 block text-sm text-gray-900">Expense</label>
            </div>
            <div className="flex items-center">
              <input type="radio" id="income" name="type" value="income" checked={formData.type === 'income'} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
              <label htmlFor="income" className="ml-2 block text-sm text-gray-900">Income</label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-2 text-gray-400" />
              Description *
            </label>
            <input type="text" name="description" value={formData.description} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Bouncy house rental for Fall Festival"/>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                Amount *
              </label>
              <div className="relative">
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors.amount ? 'border-red-500' : 'border-gray-300'}`} placeholder="150.00" min="0" step="0.01"/>
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
              </div>
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                Date *
              </label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg ${errors.date ? 'border-red-500' : 'border-gray-300'}`}/>
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
              <select name="subcategoryId" value={formData.subcategoryId} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg ${errors.subcategoryId ? 'border-red-500' : 'border-gray-300'}`} disabled={!formData.categoryId}>
                <option value="">Select a subcategory</option>
                {filteredSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.subcategoryId && <p className="text-red-500 text-sm mt-1">{errors.subcategoryId}</p>}
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
            {receiptPreview && (
              <div className="mt-4 flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{receiptPreview}</span>
                </div>
                <button type="button" onClick={removeReceipt} className="text-red-600 hover:text-red-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Add any relevant notes..."/>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button type="button" onClick={() => navigate(-1)} className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Transaction' : 'Add Transaction'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditTransaction;
