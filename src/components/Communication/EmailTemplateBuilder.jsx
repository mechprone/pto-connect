import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  EyeIcon, 
  DocumentDuplicateIcon,
  PhotoIcon,
  Bars3Icon,
  PaintBrushIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  StarIcon,
  HeartIcon,
  SparklesIcon,
  GiftIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useUserProfile } from '@/modules/hooks/useUserProfile';
import { supabase } from '../../utils/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const EmailTemplateBuilder = ({ templateId, onSave, onCancel }) => {
  const { profile, organization } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showPreview, setShowPreview] = useState(false);
  
  const [template, setTemplate] = useState({
    name: '',
    category: 'general',
    description: '',
    subject: '',
    design_json: {
      blocks: [],
      styles: {
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        primaryColor: '#3b82f6',
        secondaryColor: '#6b7280'
      }
    }
  });

  const [draggedBlock, setDraggedBlock] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const canvasRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Enhanced block types with more variety
  const blockTypes = [
    {
      type: 'header',
      name: 'Header',
      icon: Bars3Icon,
      category: 'basic',
      defaultContent: {
        text: 'Your PTO Header',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1f2937',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }
    },
    {
      type: 'text',
      name: 'Text Block',
      icon: Bars3Icon,
      category: 'basic',
      defaultContent: {
        text: 'Add your message here...',
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#374151',
        padding: '15px'
      }
    },
    {
      type: 'image',
      name: 'Image',
      icon: PhotoIcon,
      category: 'basic',
      defaultContent: {
        src: 'https://via.placeholder.com/600x300?text=Add+Your+Image',
        alt: 'Email Image',
        width: '100%',
        textAlign: 'center',
        padding: '15px'
      }
    },
    {
      type: 'button',
      name: 'Button',
      icon: PlusIcon,
      category: 'basic',
      defaultContent: {
        text: 'Click Here',
        href: '#',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '6px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: '600'
      }
    },
    {
      type: 'divider',
      name: 'Divider',
      icon: Bars3Icon,
      category: 'basic',
      defaultContent: {
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '20px 0'
      }
    },
    // Enhanced content blocks
    {
      type: 'hero',
      name: 'Hero Section',
      icon: StarIcon,
      category: 'enhanced',
      defaultContent: {
        title: 'Welcome to Our PTO!',
        subtitle: 'Building stronger communities together',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        titleColor: '#ffffff',
        subtitleColor: '#e2e8f0',
        padding: '60px 20px',
        textAlign: 'center'
      }
    },
    {
      type: 'card',
      name: 'Info Card',
      icon: DocumentDuplicateIcon,
      category: 'enhanced',
      defaultContent: {
        title: 'Event Title',
        description: 'Event description goes here...',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        margin: '15px',
        titleColor: '#1f2937',
        textColor: '#374151'
      }
    },
    {
      type: 'social',
      name: 'Social Links',
      icon: UserGroupIcon,
      category: 'enhanced',
      defaultContent: {
        platforms: ['facebook', 'instagram', 'twitter'],
        backgroundColor: '#f8fafc',
        padding: '20px',
        textAlign: 'center'
      }
    },
    {
      type: 'countdown',
      name: 'Event Countdown',
      icon: ClockIcon,
      category: 'enhanced',
      defaultContent: {
        eventName: 'Fall Festival',
        eventDate: '2024-11-15',
        backgroundColor: '#fef3c7',
        textColor: '#92400e',
        padding: '20px',
        textAlign: 'center'
      }
    },
    {
      type: 'testimonial',
      name: 'Testimonial',
      icon: HeartIcon,
      category: 'enhanced',
      defaultContent: {
        quote: 'This PTO has made such a difference in our school community!',
        author: 'Parent Name',
        role: 'Parent of 3rd Grader',
        backgroundColor: '#f0f9ff',
        textColor: '#1e40af',
        padding: '25px',
        textAlign: 'center'
      }
    },
    {
      type: 'donation',
      name: 'Donation Call',
      icon: GiftIcon,
      category: 'fundraising',
      defaultContent: {
        title: 'Support Our School',
        description: 'Your donation helps fund amazing programs for our students.',
        goalAmount: 5000,
        currentAmount: 2500,
        buttonText: 'Donate Now',
        buttonColor: '#10b981',
        backgroundColor: '#ecfdf5',
        padding: '25px'
      }
    },
    {
      type: 'volunteer',
      name: 'Volunteer Signup',
      icon: AcademicCapIcon,
      category: 'volunteers',
      defaultContent: {
        title: 'We Need Your Help!',
        description: 'Join our amazing volunteer team and make a difference.',
        opportunities: ['Event Setup', 'Classroom Helper', 'Fundraising'],
        buttonText: 'Sign Up',
        backgroundColor: '#fef7ff',
        textColor: '#7c3aed',
        padding: '20px'
      }
    },
    {
      type: 'announcement',
      name: 'Announcement',
      icon: MegaphoneIcon,
      category: 'communication',
      defaultContent: {
        title: 'Important Announcement',
        message: 'Please mark your calendars for our upcoming meeting.',
        priority: 'high',
        backgroundColor: '#fef2f2',
        titleColor: '#dc2626',
        textColor: '#991b1b',
        padding: '20px'
      }
    },
    {
      type: 'calendar',
      name: 'Calendar Event',
      icon: CalendarIcon,
      category: 'events',
      defaultContent: {
        eventTitle: 'PTO Meeting',
        eventDate: '2024-11-01',
        eventTime: '7:00 PM',
        location: 'School Library',
        backgroundColor: '#eff6ff',
        textColor: '#1d4ed8',
        padding: '20px'
      }
    }
  ];

  // Background patterns and templates
  const backgroundPatterns = [
    { name: 'Solid White', value: '#ffffff' },
    { name: 'Light Gray', value: '#f8fafc' },
    { name: 'School Blue', value: '#dbeafe' },
    { name: 'Warm Yellow', value: '#fef3c7' },
    { name: 'Soft Green', value: '#ecfdf5' },
    { name: 'Gentle Purple', value: '#faf5ff' },
    { name: 'Gradient Blue', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Gradient Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Gradient Forest', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'School Pattern', value: 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #e2e8f0 10px, #e2e8f0 20px)' }
  ];

  const prebuiltTemplates = [
    {
      name: 'Event Announcement',
      category: 'events',
      blocks: [
        {
          type: 'hero',
          content: {
            title: 'Fall Festival 2024',
            subtitle: 'Join us for a day of fun, food, and community!',
            backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fce7f3'
          }
        },
        {
          type: 'calendar',
          content: {
            eventTitle: 'Fall Festival',
            eventDate: '2024-11-15',
            eventTime: '10:00 AM - 4:00 PM',
            location: 'School Playground'
          }
        }
      ]
    },
    {
      name: 'Fundraising Campaign',
      category: 'fundraising',
      blocks: [
        {
          type: 'header',
          content: {
            text: 'Help Us Reach Our Goal!',
            backgroundColor: '#10b981',
            color: '#ffffff'
          }
        },
        {
          type: 'donation',
          content: {
            title: 'Support Our Technology Fund',
            description: 'Help us bring new computers and tablets to every classroom.',
            goalAmount: 10000,
            currentAmount: 6500
          }
        }
      ]
    },
    {
      name: 'Volunteer Recruitment',
      category: 'volunteers',
      blocks: [
        {
          type: 'hero',
          content: {
            title: 'We Need Amazing Volunteers!',
            subtitle: 'Join our team and make a difference in our school community',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }
        },
        {
          type: 'volunteer',
          content: {
            title: 'Volunteer Opportunities',
            description: 'Choose from various ways to help our school thrive.',
            opportunities: ['Event Planning', 'Classroom Support', 'Fundraising', 'Communications']
          }
        }
      ]
    }
  ];

  const categories = [
    'general',
    'events',
    'fundraising',
    'newsletters',
    'announcements',
    'volunteers',
    'meetings'
  ];

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!template.name || saving) return;
    
    try {
      setAutoSaveStatus('saving');
      
      const templateData = {
        ...template,
        html_content: generateHTML()
      };

      const url = templateId 
        ? `${import.meta.env.VITE_API_URL}/api/communications/templates/${templateId}`
        : `${import.meta.env.VITE_API_URL}/api/communications/templates`;
      
      const method = templateId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
      } else {
        setAutoSaveStatus('error');
      }
    } catch (err) {
      console.error('Auto-save error:', err);
      setAutoSaveStatus('error');
    }
  }, [template, templateId, saving]);

  // Trigger auto-save when template changes
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Auto-save after 3 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [template, autoSave]);

  // Save before window unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (autoSaveStatus !== 'saved') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && autoSaveStatus !== 'saved') {
        autoSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoSaveStatus, autoSave]);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/communications/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplate(data.data);
      } else {
        setError('Failed to load template');
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, blockType) => {
    setDraggedBlock(blockType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedBlock) {
      const newBlock = {
        id: Date.now().toString(),
        type: draggedBlock.type,
        content: { ...draggedBlock.defaultContent }
      };

      setTemplate(prev => ({
        ...prev,
        design_json: {
          ...prev.design_json,
          blocks: [...prev.design_json.blocks, newBlock]
        }
      }));

      setDraggedBlock(null);
    }
  };

  const updateBlock = (blockId, newContent) => {
    setTemplate(prev => ({
      ...prev,
      design_json: {
        ...prev.design_json,
        blocks: prev.design_json.blocks.map(block =>
          block.id === blockId ? { ...block, content: { ...block.content, ...newContent } } : block
        )
      }
    }));
  };

  const deleteBlock = (blockId) => {
    setTemplate(prev => ({
      ...prev,
      design_json: {
        ...prev.design_json,
        blocks: prev.design_json.blocks.filter(block => block.id !== blockId)
      }
    }));
    setSelectedBlock(null);
  };

  const moveBlock = (blockId, direction) => {
    const blocks = [...template.design_json.blocks];
    const index = blocks.findIndex(block => block.id === blockId);
    
    if (direction === 'up' && index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }

    setTemplate(prev => ({
      ...prev,
      design_json: {
        ...prev.design_json,
        blocks
      }
    }));
  };

  const generateHTML = () => {
    const { blocks, styles } = template.design_json;
    
    let html = `
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template.subject || 'Email Template'}</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: ${styles.fontFamily}; 
              background-color: ${styles.backgroundColor}; 
            }
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff; 
            }
            .block { margin: 0; }
            .button { 
              display: inline-block; 
              text-decoration: none; 
              border: none; 
              cursor: pointer; 
            }
          </style>
        </head>
        <body>
          <div class="email-container">
    `;

    blocks.forEach(block => {
      const { content } = block;
      
      switch (block.type) {
        case 'header':
          html += `
            <div class="block" style="background-color: ${content.backgroundColor}; padding: ${content.padding}; text-align: ${content.textAlign};">
              <h1 style="margin: 0; font-size: ${content.fontSize}; font-weight: ${content.fontWeight}; color: ${content.color};">
                ${content.text}
              </h1>
            </div>
          `;
          break;
        case 'text':
          html += `
            <div class="block" style="padding: ${content.padding}; text-align: ${content.textAlign};">
              <p style="margin: 0; font-size: ${content.fontSize}; font-weight: ${content.fontWeight}; color: ${content.color};">
                ${content.text}
              </p>
            </div>
          `;
          break;
        case 'image':
          html += `
            <div class="block" style="padding: ${content.padding}; text-align: ${content.textAlign};">
              <img src="${content.src}" alt="${content.alt}" style="width: ${content.width}; height: auto; display: block; margin: 0 auto;">
            </div>
          `;
          break;
        case 'button':
          html += `
            <div class="block" style="padding: ${content.padding}; text-align: ${content.textAlign};">
              <a href="${content.href}" class="button" style="background-color: ${content.backgroundColor}; color: ${content.color}; padding: ${content.padding}; border-radius: ${content.borderRadius}; font-size: ${content.fontSize}; font-weight: ${content.fontWeight}; text-decoration: none;">
                ${content.text}
              </a>
            </div>
          `;
          break;
        case 'divider':
          html += `
            <div class="block" style="margin: ${content.margin};">
              <hr style="border: none; height: ${content.height}; background-color: ${content.backgroundColor};">
            </div>
          `;
          break;
      }
    });

    html += `
          </div>
        </body>
      </html>
    `;

    return html;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const templateData = {
        ...template,
        html_content: generateHTML()
      };

      const url = templateId 
        ? `${import.meta.env.VITE_API_URL}/api/communications/templates/${templateId}`
        : `${import.meta.env.VITE_API_URL}/api/communications/templates`;
      
      const method = templateId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const data = await response.json();
        onSave?.(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save template');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Template Name"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-semibold border-none bg-transparent focus:outline-none focus:ring-0"
            />
            <select
              value={template.category}
              onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white shadow' : ''}`}
              >
                <ComputerDesktopIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white shadow' : ''}`}
              >
                <DevicePhoneMobileIcon className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4" />
              <span>Preview</span>
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || !template.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving && <LoadingSpinner size="sm" />}
              <span>{saving ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>
        </div>

        {/* Subject Line */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Email Subject Line"
            value={template.subject}
            onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Block Library */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          {/* Auto-save Status */}
          <div className="mb-4 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Auto-save:</span>
              <div className="flex items-center space-x-1">
                {autoSaveStatus === 'saving' && (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-600">Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircleIcon className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Saved</span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600">Error</span>
                  </>
                )}
              </div>
            </div>
            {lastSaved && (
              <div className="text-xs text-gray-500 mt-1">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Quick Templates */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Start Templates</h3>
            <div className="space-y-2">
              {prebuiltTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setTemplate(prev => ({
                      ...prev,
                      design_json: {
                        ...prev.design_json,
                        blocks: template.blocks.map((block, blockIndex) => ({
                          id: `${Date.now()}-${blockIndex}`,
                          type: block.type,
                          content: block.content
                        }))
                      }
                    }));
                  }}
                  className="w-full text-left p-2 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{template.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Block Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Content Blocks</h3>
            
            {/* Basic Blocks */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Basic</h4>
              <div className="space-y-1">
                {blockTypes.filter(block => block.category === 'basic').map((blockType) => {
                  const IconComponent = blockType.icon;
                  return (
                    <div
                      key={blockType.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, blockType)}
                      className="flex items-center space-x-2 p-2 border border-gray-200 rounded cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <IconComponent className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-900">{blockType.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Blocks */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Enhanced</h4>
              <div className="space-y-1">
                {blockTypes.filter(block => block.category === 'enhanced').map((blockType) => {
                  const IconComponent = blockType.icon;
                  return (
                    <div
                      key={blockType.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, blockType)}
                      className="flex items-center space-x-2 p-2 border border-purple-200 rounded cursor-move hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <IconComponent className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-900">{blockType.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specialized Blocks */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Specialized</h4>
              <div className="space-y-1">
                {blockTypes.filter(block => ['fundraising', 'volunteers', 'communication', 'events'].includes(block.category)).map((blockType) => {
                  const IconComponent = blockType.icon;
                  return (
                    <div
                      key={blockType.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, blockType)}
                      className="flex items-center space-x-2 p-2 border border-green-200 rounded cursor-move hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <IconComponent className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-900">{blockType.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Background Patterns */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Backgrounds</h3>
            <div className="grid grid-cols-2 gap-2">
              {backgroundPatterns.map((pattern, index) => (
                <button
                  key={index}
                  onClick={() => setTemplate(prev => ({
                    ...prev,
                    design_json: {
                      ...prev.design_json,
                      styles: {
                        ...prev.design_json.styles,
                        backgroundColor: pattern.value
                      }
                    }
                  }))}
                  className="p-2 border border-gray-200 rounded text-xs hover:border-gray-300 transition-colors"
                  style={{ 
                    background: pattern.value.includes('gradient') || pattern.value.includes('repeating') 
                      ? pattern.value 
                      : pattern.value,
                    color: pattern.value === '#ffffff' ? '#000' : '#fff'
                  }}
                  title={pattern.name}
                >
                  {pattern.name}
                </button>
              ))}
            </div>
          </div>

          {/* Style Controls */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Template Styles</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={template.design_json.styles.primaryColor}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    design_json: {
                      ...prev.design_json,
                      styles: {
                        ...prev.design_json.styles,
                        primaryColor: e.target.value
                      }
                    }
                  }))}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  value={template.design_json.styles.fontFamily}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    design_json: {
                      ...prev.design_json,
                      styles: {
                        ...prev.design_json.styles,
                        fontFamily: e.target.value
                      }
                    }
                  }))}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                  <option value="'Comic Sans MS', cursive">Comic Sans (Fun)</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
            }`}
            style={{ minHeight: '600px' }}
          >
            {template.design_json.blocks.length === 0 ? (
              <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Drag blocks here to start building your email</p>
                </div>
              </div>
            ) : (
              template.design_json.blocks.map((block, index) => (
                <EmailBlock
                  key={block.id}
                  block={block}
                  isSelected={selectedBlock === block.id}
                  onSelect={() => setSelectedBlock(block.id)}
                  onUpdate={(content) => updateBlock(block.id, content)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, 'up')}
                  onMoveDown={() => moveBlock(block.id, 'down')}
                  canMoveUp={index > 0}
                  canMoveDown={index < template.design_json.blocks.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedBlock && (
          <BlockPropertiesPanel
            block={template.design_json.blocks.find(b => b.id === selectedBlock)}
            onUpdate={(content) => updateBlock(selectedBlock, content)}
            onClose={() => setSelectedBlock(null)}
          />
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <EmailPreviewModal
          html={generateHTML()}
          subject={template.subject}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

// Email Block Component
const EmailBlock = ({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown 
}) => {
  const { content } = block;

  const renderBlock = () => {
    switch (block.type) {
      case 'header':
        return (
          <div 
            style={{ 
              backgroundColor: content.backgroundColor, 
              padding: content.padding, 
              textAlign: content.textAlign 
            }}
          >
            <h1 
              style={{ 
                margin: 0, 
                fontSize: content.fontSize, 
                fontWeight: content.fontWeight, 
                color: content.color 
              }}
            >
              {content.text}
            </h1>
          </div>
        );
      case 'text':
        return (
          <div style={{ padding: content.padding, textAlign: content.textAlign }}>
            <p 
              style={{ 
                margin: 0, 
                fontSize: content.fontSize, 
                fontWeight: content.fontWeight, 
                color: content.color 
              }}
            >
              {content.text}
            </p>
          </div>
        );
      case 'image':
        return (
          <div style={{ padding: content.padding, textAlign: content.textAlign }}>
            <img 
              src={content.src} 
              alt={content.alt} 
              style={{ width: content.width, height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </div>
        );
      case 'button':
        return (
          <div style={{ padding: content.padding, textAlign: content.textAlign }}>
            <a 
              href={content.href}
              style={{ 
                backgroundColor: content.backgroundColor, 
                color: content.color, 
                padding: content.padding, 
                borderRadius: content.borderRadius, 
                fontSize: content.fontSize, 
                fontWeight: content.fontWeight, 
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              {content.text}
            </a>
          </div>
        );
      case 'divider':
        return (
          <div style={{ margin: content.margin }}>
            <hr 
              style={{ 
                border: 'none', 
                height: content.height, 
                backgroundColor: content.backgroundColor 
              }} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onSelect}
    >
      {renderBlock()}
      
      {/* Block Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1 bg-white shadow-lg rounded-md p-1">
          {canMoveUp && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ↑
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ↓
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-red-100 rounded text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Block Properties Panel Component
const BlockPropertiesPanel = ({ block, onUpdate, onClose }) => {
  if (!block) return null;

  const { content } = block;

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Block Properties</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>

      <div className="space-y-4">
        {block.type === 'header' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <input
                type="text"
                value={content.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="text"
                value={content.fontSize}
                onChange={(e) => onUpdate({ fontSize: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={content.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="color"
                value={content.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        {block.type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <textarea
                value={content.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="text"
                value={content.fontSize}
                onChange={(e) => onUpdate({ fontSize: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={content.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        {block.type === 'image' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={content.src}
                onChange={(e) => onUpdate({ src: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={content.alt}
                onChange={(e) => onUpdate({ alt: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="text"
                value={content.width}
                onChange={(e) => onUpdate({ width: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        {block.type === 'button' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={content.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input
                type="url"
                value={content.href}
                onChange={(e) => onUpdate({ href: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="color"
                value={content.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={content.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        {block.type === 'divider' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="color"
                value={content.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="text"
                value={content.height}
                onChange={(e) => onUpdate({ height: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Email Preview Modal Component
const EmailPreviewModal = ({ html, subject, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
            <p className="text-sm text-gray-500">Subject: {subject || 'No subject'}</p>
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
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <iframe
              srcDoc={html}
              className="w-full h-96 border-none"
              title="Email Preview"
            />
          </div>
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

export default EmailTemplateBuilder;
