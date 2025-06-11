import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  EyeIcon, 
  PencilIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useUserProfile } from '../../modules/hooks/useUserProfile';
import { supabase } from '../../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmailTemplateBuilder from './EmailTemplateBuilder';

const EmailTemplateManager = () => {
  const { profile, organization } = useUserProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(null);

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'general', label: 'General' },
    { value: 'events', label: 'Events' },
    { value: 'fundraising', label: 'Fundraising' },
    { value: 'newsletters', label: 'Newsletters' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'volunteers', label: 'Volunteers' },
    { value: 'meetings', label: 'Meetings' }
  ];

  useEffect(() => {
    if (organization?.id) {
      fetchTemplates();
    }
  }, [organization?.id]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl || apiUrl.includes('localhost')) {
        // Skip API calls if API is not available or pointing to localhost
        console.log('Templates fetch skipped: API not available or in development mode');
        setTemplates([
          {
            id: 1,
            name: 'Fall Festival Announcement',
            category: 'events',
            description: 'Colorful fall festival template',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Volunteer Recruitment',
            category: 'volunteers',
            description: 'Call for volunteers template',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/communications/templates`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      } else {
        setError('Failed to load email templates');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleSaveTemplate = (savedTemplate) => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => 
        t.id === savedTemplate.id ? savedTemplate : t
      ));
    } else {
      // Add new template
      setTemplates(prev => [savedTemplate, ...prev]);
    }
    setShowCreateModal(false);
    setEditingTemplate(null);
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicateData = {
        name: `${template.name} (Copy)`,
        category: template.category,
        description: template.description,
        subject: template.subject,
        design_json: template.design_json
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/communications/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(prev => [data.data, ...prev]);
      } else {
        setError('Failed to duplicate template');
      }
    } catch (err) {
      console.error('Error duplicating template:', err);
      setError('Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/communications/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(template => template.id !== templateId));
      } else {
        setError('Failed to delete template');
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showCreateModal) {
    return (
      <EmailTemplateBuilder
        templateId={editingTemplate?.id}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setShowCreateModal(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600 mt-1">
              Create and manage reusable email templates for your communications
            </p>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <ErrorMessage message={error} onRetry={fetchTemplates} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {templates.length === 0 ? 'No email templates yet' : 'No templates match your search'}
            </h3>
            <p className="text-gray-500 mb-4">
              {templates.length === 0 
                ? 'Create your first email template to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {templates.length === 0 && (
              <button
                onClick={handleCreateTemplate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Template Preview */}
                <div className="h-48 bg-gray-50 border-b border-gray-200 relative overflow-hidden">
                  {template.html_content ? (
                    <iframe
                      srcDoc={template.html_content}
                      className="w-full h-full border-none transform scale-50 origin-top-left"
                      style={{ width: '200%', height: '200%' }}
                      title={`Preview of ${template.name}`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <DocumentDuplicateIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {template.name}
                    </h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {template.category}
                    </span>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowPreview(template)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className="text-green-600 hover:text-green-900"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <TemplatePreviewModal
          template={showPreview}
          onClose={() => setShowPreview(null)}
        />
      )}
    </div>
  );
};

// Template Preview Modal Component
const TemplatePreviewModal = ({ template, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500">Template Preview</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {template.html_content ? (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <iframe
                srcDoc={template.html_content}
                className="w-full h-96 border-none"
                title="Template Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 border border-gray-300 rounded-lg">
              <div className="text-center">
                <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No preview available</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;
