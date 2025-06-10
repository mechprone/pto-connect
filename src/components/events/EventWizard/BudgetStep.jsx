import React, { useState } from 'react';
import { DollarSign, Plus, X, TrendingUp, AlertCircle, Calculator, Target } from 'lucide-react';

const BudgetStep = ({ data, onUpdate }) => {
  const [newCategory, setNewCategory] = useState({
    name: '',
    estimated_cost: '',
    description: '',
    type: 'expense'
  });

  const predefinedCategories = {
    expenses: [
      { name: 'Venue Rental', description: 'Cost to rent event space', typical_cost: '200-500' },
      { name: 'Food & Beverages', description: 'Catering, snacks, drinks', typical_cost: '300-800' },
      { name: 'Decorations', description: 'Banners, balloons, table settings', typical_cost: '100-300' },
      { name: 'Entertainment', description: 'DJ, performers, activities', typical_cost: '200-600' },
      { name: 'Supplies', description: 'Paper goods, utensils, materials', typical_cost: '50-200' },
      { name: 'Marketing', description: 'Flyers, social media ads', typical_cost: '25-100' },
      { name: 'Equipment Rental', description: 'Tables, chairs, sound system', typical_cost: '100-400' },
      { name: 'Insurance', description: 'Event liability insurance', typical_cost: '50-150' },
      { name: 'Permits & Fees', description: 'Required permits and fees', typical_cost: '25-100' },
      { name: 'Miscellaneous', description: 'Unexpected expenses (10% buffer)', typical_cost: '50-200' }
    ],
    revenue: [
      { name: 'Ticket Sales', description: 'Admission fees', typical_cost: '500-2000' },
      { name: 'Food Sales', description: 'Concession stand revenue', typical_cost: '200-800' },
      { name: 'Merchandise', description: 'T-shirts, school items', typical_cost: '100-500' },
      { name: 'Sponsorships', description: 'Local business sponsors', typical_cost: '200-1000' },
      { name: 'Donations', description: 'Direct donations', typical_cost: '100-500' },
      { name: 'Activity Fees', description: 'Game booths, activities', typical_cost: '150-600' },
      { name: 'Raffle/Auction', description: 'Silent auction, raffle tickets', typical_cost: '300-1500' }
    ]
  };

  const handleInputChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const addCategory = (category) => {
    const categories = data.budget_categories || [];
    const newId = Date.now().toString();
    const newCategoryWithId = { ...category, id: newId };
    onUpdate({ budget_categories: [...categories, newCategoryWithId] });
  };

  const removeCategory = (id) => {
    const categories = data.budget_categories || [];
    onUpdate({ budget_categories: categories.filter(cat => cat.id !== id) });
  };

  const addPredefinedCategory = (category, type) => {
    const newCategory = {
      id: Date.now().toString(),
      name: category.name,
      description: category.description,
      estimated_cost: '',
      type: type,
      typical_range: category.typical_cost
    };
    addCategory(newCategory);
  };

  const addCustomCategory = () => {
    if (!newCategory.name.trim()) return;
    
    addCategory({
      ...newCategory,
      id: Date.now().toString(),
      estimated_cost: parseFloat(newCategory.estimated_cost) || 0
    });
    
    setNewCategory({
      name: '',
      estimated_cost: '',
      description: '',
      type: 'expense'
    });
  };

  const calculateTotals = () => {
    const categories = data.budget_categories || [];
    const expenses = categories
      .filter(cat => cat.type === 'expense')
      .reduce((sum, cat) => sum + (parseFloat(cat.estimated_cost) || 0), 0);
    const revenue = categories
      .filter(cat => cat.type === 'revenue')
      .reduce((sum, cat) => sum + (parseFloat(cat.estimated_cost) || 0), 0);
    
    return { expenses, revenue, profit: revenue - expenses };
  };

  const { expenses, revenue, profit } = calculateTotals();

  const getRecommendedBudget = () => {
    const categoryType = data.category;
    const schoolLevel = data.school_level;
    
    // Basic budget recommendations based on event type
    const budgetRanges = {
      fundraiser: { min: 1000, max: 5000 },
      social: { min: 300, max: 1500 },
      educational: { min: 200, max: 1000 },
      community: { min: 500, max: 2500 },
      performance: { min: 400, max: 2000 },
      sports: { min: 300, max: 1200 },
      meeting: { min: 50, max: 300 },
      volunteer: { min: 100, max: 500 }
    };

    return budgetRanges[categoryType] || { min: 200, max: 1000 };
  };

  const recommendedBudget = getRecommendedBudget();

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Estimated Total Budget
          </label>
          <input
            type="number"
            value={data.estimated_budget || ''}
            onChange={(e) => handleInputChange('estimated_budget', e.target.value)}
            placeholder="Enter total budget"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Recommended range for {data.category || 'this type of'} events: ${recommendedBudget.min} - ${recommendedBudget.max}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-1" />
            Fundraising Goal (Optional)
          </label>
          <input
            type="number"
            value={data.fundraising_goal || ''}
            onChange={(e) => handleInputChange('fundraising_goal', e.target.value)}
            placeholder="Target profit amount"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            How much profit do you want to raise?
          </p>
        </div>
      </div>

      {/* Budget Summary */}
      {data.budget_categories && data.budget_categories.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Budget Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 font-medium">Total Expenses</div>
              <div className="text-2xl font-bold text-red-700">${expenses.toFixed(2)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Expected Revenue</div>
              <div className="text-2xl font-bold text-green-700">${revenue.toFixed(2)}</div>
            </div>
            <div className={`p-4 rounded-lg ${profit >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
              <div className={`text-sm font-medium ${profit >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                Projected {profit >= 0 ? 'Profit' : 'Loss'}
              </div>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>
                ${Math.abs(profit).toFixed(2)}
              </div>
            </div>
          </div>
          
          {data.fundraising_goal && profit > 0 && (
            <div className="mt-4 p-3 bg-white rounded border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progress toward fundraising goal:</span>
                <span className="text-sm font-medium">
                  ${profit.toFixed(2)} / ${parseFloat(data.fundraising_goal).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((profit / parseFloat(data.fundraising_goal)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Predefined Categories */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add Budget Items</h3>
        
        {/* Expenses */}
        <div className="mb-6">
          <h4 className="font-medium text-red-700 mb-3">💸 Common Expenses</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {predefinedCategories.expenses.map((category, index) => (
              <div
                key={index}
                className="p-3 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900 text-sm">{category.name}</h5>
                  <button
                    onClick={() => addPredefinedCategory(category, 'expense')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-1">{category.description}</p>
                <div className="text-xs text-gray-500">Typical: ${category.typical_cost}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div>
          <h4 className="font-medium text-green-700 mb-3">💰 Revenue Sources</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {predefinedCategories.revenue.map((category, index) => (
              <div
                key={index}
                className="p-3 border border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900 text-sm">{category.name}</h5>
                  <button
                    onClick={() => addPredefinedCategory(category, 'revenue')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-1">{category.description}</p>
                <div className="text-xs text-gray-500">Typical: ${category.typical_cost}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Budget Item */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Custom Budget Item</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Security Deposit"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="expense">Expense</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                value={newCategory.estimated_cost}
                onChange={(e) => setNewCategory({ ...newCategory, estimated_cost: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Brief description of this budget item"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={addCustomCategory}
            disabled={!newCategory.name.trim()}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Budget Item
          </button>
        </div>
      </div>

      {/* Current Budget Items */}
      {data.budget_categories && data.budget_categories.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Budget Breakdown ({data.budget_categories.length} items)
          </h3>

          <div className="space-y-3">
            {data.budget_categories.map((category) => (
              <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-gray-900 mr-3">{category.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.type === 'expense' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {category.type === 'expense' ? '💸' : '💰'} {category.type}
                      </span>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-1">{category.description}</p>
                    )}
                    
                    {category.typical_range && (
                      <p className="text-xs text-gray-500">Typical range: ${category.typical_range}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${parseFloat(category.estimated_cost || 0).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Budget Planning Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add a 10-15% buffer for unexpected expenses</li>
          <li>• Get quotes from multiple vendors for major expenses</li>
          <li>• Consider asking local businesses for sponsorships or donations</li>
          <li>• Track actual costs during the event to improve future budgets</li>
          <li>• Plan revenue conservatively and expenses generously</li>
        </ul>
      </div>

      {/* Validation */}
      {profit < 0 && data.budget_categories && data.budget_categories.length > 0 && (
        <div className="text-sm text-amber-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Your current budget shows a loss. Consider reducing expenses or increasing revenue sources.
        </div>
      )}
    </div>
  );
};

export default BudgetStep;
