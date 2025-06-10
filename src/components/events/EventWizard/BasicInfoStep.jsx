import React, { useState } from 'react';
import { Sparkles, Calendar, Users, DollarSign, MapPin, Eye, EyeOff, Share2 } from 'lucide-react';

const BasicInfoStep = ({ data, onUpdate }) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const eventTemplates = [
    {
      id: 'fall-festival',
      name: 'Fall Festival',
      category: 'Community Event',
      description: 'Annual fall celebration with games, food booths, and family activities',
      estimated_budget: '3000',
      school_level: 'elementary',
      icon: '🍂'
    },
    {
      id: 'book-fair',
      name: 'Book Fair',
      category: 'Educational',
      description: 'Scholastic book fair to promote reading and raise funds for the library',
      estimated_budget: '1500',
      school_level: 'elementary',
      icon: '📚'
    },
    {
      id: 'science-night',
      name: 'Science Night',
      category: 'Educational',
      description: 'Interactive science demonstrations and hands-on experiments for families',
      estimated_budget: '800',
      school_level: 'elementary',
      icon: '🔬'
    },
    {
      id: 'movie-night',
      name: 'Family Movie Night',
      category: 'Social',
      description: 'Outdoor movie screening with popcorn and family-friendly entertainment',
      estimated_budget: '500',
      school_level: 'elementary',
      icon: '🎬'
    },
    {
      id: 'talent-show',
      name: 'Talent Show',
      category: 'Performance',
      description: 'Student talent showcase with performances and audience voting',
      estimated_budget: '400',
      school_level: 'elementary',
      icon: '🎭'
    },
    {
      id: 'fundraiser-dinner',
      name: 'Fundraiser Dinner',
      category: 'Fundraiser',
      description: 'Elegant dinner event with silent auction and guest speakers',
      estimated_budget: '5000',
      school_level: 'elementary',
      icon: '🍽️'
    }
  ];

  const categories = [
    { value: 'fundraiser', label: 'Fundraiser', icon: '💰', color: 'bg-green-100 text-green-800' },
    { value: 'educational', label: 'Educational', icon: '📚', color: 'bg-blue-100 text-blue-800' },
    { value: 'social', label: 'Social', icon: '🎉', color: 'bg-purple-100 text-purple-800' },
    { value: 'community', label: 'Community Event', icon: '🏘️', color: 'bg-orange-100 text-orange-800' },
    { value: 'performance', label: 'Performance', icon: '🎭', color: 'bg-pink-100 text-pink-800' },
    { value: 'sports', label: 'Sports', icon: '⚽', color: 'bg-red-100 text-red-800' },
    { value: 'meeting', label: 'Meeting', icon: '👥', color: 'bg-gray-100 text-gray-800' },
    { value: 'volunteer', label: 'Volunteer', icon: '🤝', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const schoolLevels = [
    { value: 'elementary', label: 'Elementary (K-5)' },
    { value: 'upper_elementary', label: 'Upper Elementary (3-5)' },
    { value: 'middle', label: 'Middle School (6-8)' },
    { value: 'junior_high', label: 'Junior High (7-9)' },
    { value: 'high', label: 'High School (9-12)' },
    { value: 'all', label: 'All Grade Levels' }
  ];

  const handleInputChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const applyTemplate = (template) => {
    onUpdate({
      title: template.name,
      description: template.description,
      category: template.category.toLowerCase().replace(' ', '_'),
      estimated_budget: template.estimated_budget,
      school_level: template.school_level
    });
    setShowTemplates(false);
  };

  const selectedCategory = categories.find(cat => cat.value === data.category);

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Quick Start</h3>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {showTemplates ? 'Hide Templates' : 'Use Template'}
          </button>
        </div>

        {showTemplates && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{template.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="text-xs text-gray-500">
                  Budget: ${template.estimated_budget}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Basic Event Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter event title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your event..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Event location"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Category *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleInputChange('category', category.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    ${data.category === category.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {selectedCategory && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedCategory.color}`}>
                  {selectedCategory.icon} {selectedCategory.label}
                </span>
              </div>
            )}
          </div>

          {/* School Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={data.school_level}
              onChange={(e) => handleInputChange('school_level', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {schoolLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Visibility
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="public"
                  name="visibility"
                  value="public"
                  checked={data.visibility === 'public'}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="mr-3"
                />
                <label htmlFor="public" className="flex items-center text-sm">
                  <Eye className="w-4 h-4 mr-2 text-green-600" />
                  Public - Visible to all PTO members
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="private"
                  name="visibility"
                  value="private"
                  checked={data.visibility === 'private'}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                  className="mr-3"
                />
                <label htmlFor="private" className="flex items-center text-sm">
                  <EyeOff className="w-4 h-4 mr-2 text-gray-600" />
                  Private - Board members only
                </label>
              </div>
            </div>
          </div>

          {/* Share to Library */}
          <div className="border-t pt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="share_public"
                checked={data.share_public}
                onChange={(e) => handleInputChange('share_public', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="share_public" className="flex items-center text-sm">
                <Share2 className="w-4 h-4 mr-2 text-blue-600" />
                Share this event template with the PTO Connect community
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              Help other PTOs by sharing your successful event ideas
            </p>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {!data.title && (
        <div className="text-sm text-red-600">
          Event title is required to continue
        </div>
      )}
      {!data.category && (
        <div className="text-sm text-red-600">
          Please select an event category
        </div>
      )}
    </div>
  );
};

export default BasicInfoStep;
