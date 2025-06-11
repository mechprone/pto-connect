import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, DollarSign, 
  AlertTriangle, Sparkles
} from 'lucide-react';

const CreateEditBudgetSubcategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const parentId = searchParams.get('parent');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budgetAmount: '',
    parentCategory: parentId || '',
    status: 'planned',
  });

  // Mock data for existing subcategory (if editing)
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockSubcategory = {
          id: parseInt(id),
          name: 'Fall Festival',
          description: 'Budget for the annual Fall Festival community event.',
          budgetAmount: 5000,
          parentCategory: '1',
          status: 'active',
        };
        
        setFormData({
          ...mockSubcategory,
          budgetAmount: mockSubcategory.budgetAmount.toString(),
        });
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Subcategory name is required';
    }

    if (!formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) {
      newErrors.budgetAmount = 'Valid budget amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Saving subcategory:', formData);
      
      // Navigate back to parent category details
      navigate(`/budget/category/${formData.parentCategory}`);
    } catch (error)
    {
      console.error('Error saving subcategory:', error);
      alert('Error saving subcategory. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
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
            onClick={() => navigate(`/budget/category/${formData.parentCategory}`)}
            className="hover:text-blue-600 transition-colors"
          >
            Parent Category
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {isEdit ? 'Edit Subcategory' : 'Create Subcategory'}
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Budget Subcategory' : 'Create Budget Subcategory'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update the details for this subcategory.' : 'Add a new subcategory to your budget.'}
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-lg shadow-lg p-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Fall Festival Decorations"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="number"
                name="budgetAmount"
                value={formData.budgetAmount}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.budgetAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="5000"
                min="0"
                step="0.01"
              />
            </div>
            {errors.budgetAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.budgetAmount}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what this subcategory covers..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/budget/category/${formData.parentCategory}`)}
              className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Subcategory' : 'Create Subcategory'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditBudgetSubcategory;
