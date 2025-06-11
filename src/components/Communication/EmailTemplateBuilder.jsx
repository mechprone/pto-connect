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
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useUserProfile } from '@/modules/hooks/useUserProfile';
import { supabase } from '../../utils/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import TemplateLibraryModal from './TemplateLibraryModal';

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
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
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

  // Handle template selection from library
  const handleTemplateSelect = (selectedTemplate) => {
    setTemplate(prev => ({
      ...prev,
      name: selectedTemplate.name,
      category: selectedTemplate.category,
      design_json: {
        ...prev.design_json,
        blocks: selectedTemplate.blocks.map((block, index) => ({
          id: `${Date.now()}-${index}`,
          type: block.type,
          content: block.content
        }))
      }
    }));
    setShowTemplateLibrary(false);
  };

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
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [template, autoSave]);

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

  const renderBlock = (block) => {
    const { content } = block;
    
    switch (block.type) {
      case 'header':
        return (
          <div style={{ backgroundColor: content.backgroundColor, padding: content.padding, textAlign: content.textAlign }}>
            <h1 style={{ margin: 0, fontSize: content.fontSize, fontWeight: content.fontWeight, color: content.color }}>
              {content.text}
            </h1>
          </div>
        );
      case 'text':
        return (
          <div style={{ padding: content.padding, textAlign: content.textAlign }}>
            <p style={{ margin: 0, fontSize: content.fontSize, fontWeight: content.fontWeight, color: content.color }}>
              {content.text}
            </p>
          </div>
        );
      case 'image':
        return (
          <div style={{ padding: content.padding, textAlign: content.textAlign }}>
            <img src={content.src} alt={content.alt} style={{ width: content.width, height: 'auto', display: 'block', margin: '0 auto' }} />
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
            <hr style={{ border: 'none', height: content.height, backgroundColor: content.backgroundColor }} />
          </div>
        );
      case 'hero':
        return (
          <div style={{ background: content.backgroundImage, padding: content.padding, textAlign: content.textAlign }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: 'bold', color: content.titleColor }}>
              {content.title}
            </h1>
            <p style={{ margin: 0, fontSize: '18px', color: content.subtitleColor }}>
              {content.subtitle}
            </p>
          </div>
        );
      case 'donation':
        const progressPercentage = (content.currentAmount / content.goalAmount) * 100;
        return (
          <div style={{ backgroundColor: content.backgroundColor, padding: content.padding }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '24px', fontWeight: 'bold' }}>
              {content.title}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '16px' }}>
              {content.description}
            </p>
            <div style={{ backgroundColor: '#e5e7eb', borderRadius: '10px', height: '20px', marginBottom: '15px' }}>
              <div style={{ backgroundColor: content.buttonColor, height: '100%', borderRadius: '10px', width: `${progressPercentage}%` }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span>${content.currentAmount.toLocaleString()} raised</span>
              <span>Goal: ${content.goalAmount.toLocaleString()}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <a href="#" style={{ backgroundColor: content.buttonColor, color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                {content.buttonText}
              </a>
            </div>
          </div>
        );
      case 'volunteer':
        return (
          <div style={{ backgroundColor: content.backgroundColor, padding: content.padding }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '24px', fontWeight: 'bold', color: content.textColor }}>
              {content.title}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '16px', color: content.textColor }}>
              {content.description}
            </p>
            <div style={{ marginBottom: '20px' }}>
              {content.opportunities.map((opportunity, index) => (
                <div key={index} style={{ backgroundColor: '#ffffff', padding: '10px', margin: '5px 0', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                  • {opportunity}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <a href="#" style={{ backgroundColor: content.textColor, color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                {content.buttonText}
              </a>
            </div>
          </div>
        );
      case 'announcement':
        return (
          <div style={{ backgroundColor: content.backgroundColor, padding: content.padding }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold', color: content.titleColor }}>
              📢 {content.title}
            </h3>
            <p style={{ margin: 0, fontSize: '16px', color: content.textColor }}>
              {content.message}
            </p>
          </div>
        );
      case 'calendar':
        return (
          <div style={{ backgroundColor: content.backgroundColor, padding: content.padding }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold', color: content.textColor }}>
              📅 {content.eventTitle}
            </h3>
            <div style={{ fontSize: '16px', color: content.textColor }}>
              <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(content.eventDate).toLocaleDateString()}</p>
              <p style={{ margin: '5px 0' }}><strong>Time:</strong> {content.eventTime}</p>
              <p style={{ margin: '5px 0' }}><strong>Location:</strong> {content.location}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
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
            body { margin: 0; padding: 0; font-family: ${styles.fontFamily}; background-color: ${styles.backgroundColor}; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .block { margin: 0; }
            .button { display: inline-block; text-decoration: none; border: none; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="email-container">
    `;

    blocks.forEach(block => {
      html += `<div class="block">${renderBlock(block)}</div>`;
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
        {/* Block Library */}
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
            
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="w-full mt-3 p-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center"
            >
              <SparklesIcon className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-medium text-purple-700">Other Templates</div>
              <div className="text-xs text-purple
