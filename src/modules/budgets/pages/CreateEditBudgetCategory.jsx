import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, Plus, Trash2, DollarSign, 
  Calendar, User, AlertTriangle, CheckCircle, Sparkles,
  Target, TrendingUp, Calculator, PieChart
} from 'lucide-react';

const CreateEditBudgetCategory = () => {
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
    startDate: '',
    endDate: '',
    approvalRequired: false,
    approvalThreshold: '',
    parentCategory: parentId || '',
    subcategories: [],
    notes: '',
    tags: []
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    budgetAmount: '',
    description: ''
  });

  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [stellaSuggestions, setStellaSuggestions] = useState(null);
  const [showStellaSuggestions, setShowStellaSuggestions] = useState(false);

  // Mock data for existing category (if editing)
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockCategory = {
          id: parseInt(id),
          name: 'Events & Programs',
          description: 'Budget allocation for all PTO events and educational programs',
          budgetAmount: 15000,
          startDate: '2024-09-01',
          endDate: '2025-08-31',
          approvalRequired: true,
          approvalThreshold: 500,
          parentCategory: '',
          subcategories: [
            { id: 1, name: 'Fall Festival', budgetAmount: 5000, description: 'Annual fall community event' },
            { id: 2, name: 'Science Night', budgetAmount: 3000, description: 'STEM education event' },
            { id: 3, name: 'Book Fair', budgetAmount: 4000, description: 'Scholastic book fair' },
            { id: 4, name: 'Art Show', budgetAmount: 3000, description: 'Student art exhibition' }
          ],
          notes: 'This category covers all major PTO events and educational programs.',
          tags: ['events', 'education', 'community']
        };
        
        setFormData({
          ...mockCategory,
          budgetAmount: mockCategory.budgetAmount.toString(),
          approvalThreshold: mockCategory.approvalThreshold.toString()
        });
        setLoading(false);
      }, 1000);
    }
  }, [id, isEdit]);

  // Stella's AI suggestions
  const generateStellaSuggestions = () => {
    setShowStellaSuggestions(true);
    setStellaSuggestions({
      budgetRecommendation: {
        amount: 18000,
        reasoning: "Based on historical data and similar PTOs, I recommend $18,000 for Events & Programs. This is 20% higher than last year to account for inflation and increased participation.",
        breakdown: [
          { item: 'Fall Festival', amount: 6000, reason: 'Increased venue costs' },
          { item: 'Science Night', amount: 3500, reason: 'New STEM equipment' },
          { item: 'Book Fair', amount: 4500, reason: 'Expanded book selection' },
          { item: 'Art Show', amount: 3000, reason: 'Consistent with previous year' },
          { item: 'Contingency', amount: 1000, reason: 'Emergency fund for unexpected costs' }
        ]
      },
      optimizations: [
        "Consider bulk purchasing decorations for multiple events to save 15%",
        "Partner with local businesses for sponsorships to offset costs",
        "Implement digital ticketing to reduce printing costs by $200"
      ],
      riskFactors: [
        "Weather dependency for outdoor events",
        "Vendor price increases due to inflation",
        "Lower than expected attendance"
      ]
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubcategoryChange = (e) => {
    const { name, value } = e.target;
    setSubcategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSubcategory = () => {
    if (!subcategoryForm.name || !subcategoryForm.budgetAmount) {
      alert('Please fill in subcategory name and budget amount');
      return;
    }

    const newSubcategory = {
      id: Date.now(),
      ...subcategoryForm,
      budgetAmount: parseFloat(subcategoryForm.budgetAmount)
    };

    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSubcategory]
    }));

    setSubcategoryForm({ name: '', budgetAmount: '', description: '' });
    setShowSubcategoryForm(false);
  };

  const removeSubcategory = (subcategoryId) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(sub => sub.id !== subcategoryId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) {
      newErrors.budgetAmount = 'Valid budget amount is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.approvalRequired && (!formData.approvalThreshold || parseFloat(formData.approvalThreshold) <= 0)) {
      newErrors.approvalThreshold = 'Approval threshold is required when approval is enabled';
    }

    // Check if subcategories total exceeds main budget
    const subcategoryTotal = formData.subcategories.reduce((sum, sub) => sum + sub.budgetAmount, 0);
    if (subcategoryTotal > parseFloat(formData.budgetAmount)) {
      newErrors.subcategories = 'Subcategory total cannot exceed main budget amount';
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
      
      console.log('Saving category:', formData);
      
      // Navigate back to budget dashboard or category details
      if (isEdit) {
        navigate(`/budget/category/${id}`);
      } else {
        navigate('/budget');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyStellaRecommendation = () => {
    if (stellaSuggestions) {
      setFormData(prev => ({
        ...prev,
        budgetAmount: stellaSuggestions.budgetRecommendation.amount.toString(),
        subcategories: stellaSuggestions.budgetRecommendation.breakdown.map((item, index) => ({
          id: Date.now() + index,
          name: item.item,
          budgetAmount: item.amount,
          description: item.reason
        }))
      }));
      setShowStellaSuggestions(false);
    }
  };

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

  const subcategoryTotal = formData.subcategories.reduce((sum, sub) => sum + sub.budgetAmount, 0);
  const remainingBudget = parseFloat(formData.budgetAmount) - subcategoryTotal;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
          <span className="text-gray-900 font-medium">
            {isEdit ? 'Edit Category' : 'Create Category'}
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Budget Category' : 'Create Budget Category'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update category details and budget allocation' : 'Set up a new budget category with allocations'}
            </p>
          </div>
          
          <button
            onClick={generateStellaSuggestions}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get Stella's Help
          </button>
        </div>

        {/* Stella's Suggestions */}
        {showStellaSuggestions && stellaSuggestions && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">Stella's Recommendations</h3>
              </div>
              <button
                onClick={() => setShowStellaSuggestions(false)}
                className="text-purple-600 hover:text-purple-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Budget Recommendation</h4>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  ${stellaSuggestions.budgetRecommendation.amount.toLocaleString()}
                </div>
                <p className="text-sm text-purple-700 mb-4">
                  {stellaSuggestions.budgetRecommendation.reasoning}
                </p>
                
                <div className="space-y-2">
                  {stellaSuggestions.budgetRecommendation.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-purple-800">{item.item}</span>
                      <span className="font-medium text-purple-900">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={applyStellaRecommendation}
                  className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Apply Recommendation
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Optimization Tips</h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  {stellaSuggestions.optimizations.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
                
                <h4 className="font-semibold text-purple-900 mb-2 mt-4">Risk Factors</h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  {stellaSuggestions.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Events & Programs"
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
                    placeholder="15000"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.budgetAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.budgetAmount}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this budget category covers..."
              />
            </div>
          </div>

          {/* Budget Period */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Period</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Approval Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Approval Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="approvalRequired"
                  checked={formData.approvalRequired}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Require approval for expenses
                </label>
              </div>
              
              {formData.approvalRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Threshold *
                  </label>
                  <div className="relative max-w-xs">
                    <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="approvalThreshold"
                      value={formData.approvalThreshold}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.approvalThreshold ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Expenses above this amount will require approval
                  </p>
                  {errors.approvalThreshold && (
                    <p className="text-red-500 text-sm mt-1">{errors.approvalThreshold}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subcategories */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Subcategories</h3>
              <button
                type="button"
                onClick={() => setShowSubcategoryForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subcategory
              </button>
            </div>
            
            {errors.subcategories && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.subcategories}</p>
              </div>
            )}
            
            {/* Budget Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  ${parseFloat(formData.budgetAmount || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Budget</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  ${subcategoryTotal.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Allocated</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${remainingBudget.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
            
            {/* Subcategory Form */}
            {showSubcategoryForm && (
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Add New Subcategory</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={subcategoryForm.name}
                      onChange={handleSubcategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Fall Festival"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="budgetAmount"
                        value={subcategoryForm.budgetAmount}
                        onChange={handleSubcategoryChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5000"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={subcategoryForm.description}
                    onChange={handleSubcategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of this subcategory"
                  />
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={addSubcategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add Subcategory
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubcategoryForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Existing Subcategories */}
            <div className="space-y-3">
              {formData.subcategories.map(subcategory => (
                <div key={subcategory.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{subcategory.name}</h4>
                    <p className="text-sm text-gray-600">{subcategory.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${subcategory.budgetAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {((subcategory.budgetAmount / parseFloat(formData.budgetAmount || 1)) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubcategory(subcategory.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {formData.subcategories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No subcategories added yet. Click "Add Subcategory" to get started.
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Additional Notes</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes or special instructions for this budget category..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/budget')}
              className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
                  {isEdit ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditBudgetCategory;
