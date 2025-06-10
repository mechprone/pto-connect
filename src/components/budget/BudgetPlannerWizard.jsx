import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { budgetAPI } from '../../services/api';

const BudgetPlannerWizard = ({ onComplete, existingPlan = null }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState({ expense: [], revenue: [] });
  const [budgetPlan, setBudgetPlan] = useState({
    name: '',
    description: '',
    fiscal_year: new Date().getFullYear(),
    start_date: `${new Date().getFullYear()}-01-01`,
    end_date: `${new Date().getFullYear()}-12-31`,
    total_budget: 0,
    categories: []
  });

  const steps = [
    { id: 1, name: 'Basic Information', description: 'Budget plan details' },
    { id: 2, name: 'Category Templates', description: 'Choose from templates' },
    { id: 3, name: 'Customize Categories', description: 'Adjust amounts and details' },
    { id: 4, name: 'Review & Create', description: 'Final review' }
  ];

  useEffect(() => {
    loadTemplates();
    if (existingPlan) {
      setBudgetPlan(existingPlan);
    }
  }, [existingPlan]);

  const loadTemplates = async () => {
    try {
      const response = await budgetAPI.getCategoryTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleBasicInfoChange = (field, value) => {
    setBudgetPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelection = (template, type) => {
    const newCategories = [...budgetPlan.categories];
    
    // Add main category
    const mainCategory = {
      id: `temp-${Date.now()}`,
      name: template.name,
      description: template.description,
      budget_amount: template.typical_amount || 0,
      category_type: type,
      subcategories: []
    };

    // Add subcategories if they exist
    if (template.subcategories) {
      template.subcategories.forEach((subcat, index) => {
        mainCategory.subcategories.push({
          id: `temp-${Date.now()}-${index}`,
          name: subcat.name,
          description: subcat.description || '',
          budget_amount: subcat.typical_amount || 0,
          category_type: type,
          parent_category_id: mainCategory.id
        });
      });
    }

    newCategories.push(mainCategory);
    setBudgetPlan(prev => ({
      ...prev,
      categories: newCategories
    }));
  };

  const handleCategoryChange = (categoryId, field, value) => {
    setBudgetPlan(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, [field]: value };
        }
        // Check subcategories
        if (cat.subcategories) {
          return {
            ...cat,
            subcategories: cat.subcategories.map(subcat => 
              subcat.id === categoryId ? { ...subcat, [field]: value } : subcat
            )
          };
        }
        return cat;
      })
    }));
  };

  const addCustomCategory = (type) => {
    const newCategory = {
      id: `custom-${Date.now()}`,
      name: '',
      description: '',
      budget_amount: 0,
      category_type: type,
      subcategories: []
    };

    setBudgetPlan(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  };

  const removeCategory = (categoryId) => {
    setBudgetPlan(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    }));
  };

  const calculateTotalBudget = () => {
    return budgetPlan.categories.reduce((total, category) => {
      let categoryTotal = category.budget_amount || 0;
      if (category.subcategories) {
        categoryTotal += category.subcategories.reduce((subTotal, subcat) => 
          subTotal + (subcat.budget_amount || 0), 0
        );
      }
      return total + categoryTotal;
    }, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create budget plan
      const planData = {
        ...budgetPlan,
        total_budget: calculateTotalBudget()
      };

      // First create the budget plan (this would need a budget plans API endpoint)
      // For now, we'll create the categories directly
      
      // Prepare categories for bulk creation
      const categoriesToCreate = [];
      
      budgetPlan.categories.forEach(category => {
        if (category.name.trim()) {
          categoriesToCreate.push({
            name: category.name,
            description: category.description,
            budget_amount: category.budget_amount || 0,
            category_type: category.category_type,
            fiscal_year: budgetPlan.fiscal_year
          });

          // Add subcategories
          if (category.subcategories) {
            category.subcategories.forEach(subcat => {
              if (subcat.name.trim()) {
                categoriesToCreate.push({
                  name: subcat.name,
                  description: subcat.description,
                  budget_amount: subcat.budget_amount || 0,
                  category_type: subcat.category_type,
                  fiscal_year: budgetPlan.fiscal_year,
                  parent_category_name: category.name // We'll need to handle this in the API
                });
              }
            });
          }
        }
      });

      const response = await budgetAPI.bulkCreateCategories({
        categories: categoriesToCreate,
        fiscal_year: budgetPlan.fiscal_year
      });

      if (response.success) {
        onComplete?.(response.data);
      }
    } catch (error) {
      console.error('Failed to create budget plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Plan Name
              </label>
              <input
                type="text"
                value={budgetPlan.name}
                onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024-2025 School Year Budget"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={budgetPlan.description}
                onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this budget plan..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiscal Year
                </label>
                <input
                  type="number"
                  value={budgetPlan.fiscal_year}
                  onChange={(e) => handleBasicInfoChange('fiscal_year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={budgetPlan.start_date}
                  onChange={(e) => handleBasicInfoChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={budgetPlan.end_date}
                  onChange={(e) => handleBasicInfoChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Revenue Templates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.revenue?.map((template, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => handleTemplateSelection(template, 'revenue')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <span className="text-sm text-green-600 font-medium">
                        ${template.typical_amount?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    {template.subcategories && (
                      <div className="text-xs text-gray-500">
                        Includes: {template.subcategories.map(sub => sub.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Templates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.expense?.map((template, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => handleTemplateSelection(template, 'expense')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <span className="text-sm text-red-600 font-medium">
                        ${template.typical_amount?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    {template.subcategories && (
                      <div className="text-xs text-gray-500">
                        Includes: {template.subcategories.map(sub => sub.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Categories Preview */}
            {budgetPlan.categories.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Selected Categories</h4>
                <div className="space-y-2">
                  {budgetPlan.categories.map(category => (
                    <div key={category.id} className="flex justify-between items-center text-sm">
                      <span>{category.name}</span>
                      <span className={category.category_type === 'revenue' ? 'text-green-600' : 'text-red-600'}>
                        ${category.budget_amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Customize Categories</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => addCustomCategory('revenue')}
                  className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Revenue
                </button>
                <button
                  onClick={() => addCustomCategory('expense')}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Expense
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {budgetPlan.categories.map(category => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => handleCategoryChange(category.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget Amount
                        </label>
                        <input
                          type="number"
                          value={category.budget_amount}
                          onChange={(e) => handleCategoryChange(category.id, 'budget_amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.category_type === 'revenue' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.category_type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={category.description}
                      onChange={(e) => handleCategoryChange(category.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Subcategories */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Subcategories</h5>
                      <div className="space-y-2">
                        {category.subcategories.map(subcat => (
                          <div key={subcat.id} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={subcat.name}
                              onChange={(e) => handleCategoryChange(subcat.id, 'name', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Subcategory name"
                            />
                            <input
                              type="number"
                              value={subcat.budget_amount}
                              onChange={(e) => handleCategoryChange(subcat.id, 'budget_amount', parseFloat(e.target.value) || 0)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Amount"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        const totalBudget = calculateTotalBudget();
        const revenueTotal = budgetPlan.categories
          .filter(cat => cat.category_type === 'revenue')
          .reduce((total, cat) => total + (cat.budget_amount || 0), 0);
        const expenseTotal = budgetPlan.categories
          .filter(cat => cat.category_type === 'expense')
          .reduce((total, cat) => total + (cat.budget_amount || 0), 0);

        return (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${revenueTotal.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">${expenseTotal.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${revenueTotal - expenseTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(revenueTotal - expenseTotal).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Net Budget</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Budget Plan Details</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div><strong>Name:</strong> {budgetPlan.name}</div>
                <div><strong>Fiscal Year:</strong> {budgetPlan.fiscal_year}</div>
                <div><strong>Period:</strong> {budgetPlan.start_date} to {budgetPlan.end_date}</div>
                <div><strong>Description:</strong> {budgetPlan.description}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Categories ({budgetPlan.categories.length})</h4>
              <div className="space-y-2">
                {budgetPlan.categories.map(category => (
                  <div key={category.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <span className="font-medium">{category.name}</span>
                    <span className={category.category_type === 'revenue' ? 'text-green-600' : 'text-red-600'}>
                      ${category.budget_amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            disabled={currentStep === 1 && !budgetPlan.name}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || budgetPlan.categories.length === 0}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Budget Plan'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BudgetPlannerWizard;
