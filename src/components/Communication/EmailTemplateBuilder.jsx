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
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced block types
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
    }
  ];

  const prebuiltTemplates = [
    {
      name: 'Event Announcement',
      category: 'events',
      blocks: [
        {
          type: 'header',
          content: {
            text: 'Fall Festival 2024',
            backgroundColor: '#3b82f6',
            color: '#ffffff'
          }
        },
        {
          type: 'text',
          content: {
            text: 'Join us for a day of fun, food, and community!'
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
    console.log('Template selected:', selectedTemplate);
    
    // Convert template blocks to our format - handle ALL blocks from the template
    const convertedBlocks = [];
    
    selectedTemplate.blocks.forEach((block, index) => {
      const blockId = `${Date.now()}-${index}`;
      
      // Convert different block types to our standard format
      if (block.type === 'hero') {
        // Add hero header block
        convertedBlocks.push({
          id: blockId,
          type: 'header',
          content: {
            text: block.content.title,
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: block.content.titleColor || '#ffffff',
            backgroundColor: block.content.backgroundImage || '#3b82f6',
            padding: '40px'
          }
        });
        
        // Add subtitle block if it exists
        if (block.content.subtitle) {
          convertedBlocks.push({
            id: `${blockId}-subtitle`,
            type: 'text',
            content: {
              text: block.content.subtitle,
              fontSize: '18px',
              fontWeight: 'normal',
              textAlign: 'center',
              color: block.content.subtitleColor || '#6b7280',
              backgroundColor: '#ffffff',
              padding: '15px'
            }
          });
        }
      } else if (block.type === 'header') {
        convertedBlocks.push({
          id: blockId,
          type: 'header',
          content: {
            text: block.content.text,
            fontSize: block.content.fontSize || '24px',
            fontWeight: block.content.fontWeight || 'bold',
            textAlign: block.content.textAlign || 'center',
            color: block.content.color || '#1f2937',
            backgroundColor: block.content.backgroundColor || '#f9fafb',
            padding: block.content.padding || '20px'
          }
        });
      } else if (block.type === 'text') {
        convertedBlocks.push({
          id: blockId,
          type: 'text',
          content: {
            text: block.content.text,
            fontSize: block.content.fontSize || '16px',
            fontWeight: block.content.fontWeight || 'normal',
            textAlign: block.content.textAlign || 'left',
            color: block.content.color || '#374151',
            backgroundColor: block.content.backgroundColor || '#ffffff',
            padding: block.content.padding || '15px'
          }
        });
      } else if (block.type === 'calendar') {
        convertedBlocks.push({
          id: blockId,
          type: 'text',
          content: {
            text: `📅 ${block.content.eventTitle}\n🕐 ${block.content.eventTime}\n📍 ${block.content.location}`,
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'center',
            color: block.content.textColor || '#374151',
            backgroundColor: block.content.backgroundColor || '#f9fafb',
            padding: '20px'
          }
        });
      } else if (block.type === 'donation') {
        const progressPercentage = Math.round((block.content.currentAmount / block.content.goalAmount) * 100);
        convertedBlocks.push({
          id: blockId,
          type: 'text',
          content: {
            text: `${block.content.title}\n\n${block.content.description}\n\nGoal: $${block.content.goalAmount?.toLocaleString()}\nRaised: $${block.content.currentAmount?.toLocaleString()} (${progressPercentage}%)`,
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#374151',
            backgroundColor: block.content.backgroundColor || '#f0f9ff',
            padding: '20px'
          }
        });
      } else if (block.type === 'volunteer') {
        convertedBlocks.push({
          id: blockId,
          type: 'text',
          content: {
            text: `${block.content.title}\n\n${block.content.description}\n\nOpportunities:\n• ${block.content.opportunities?.join('\n• ') || 'Various volunteer opportunities available'}`,
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: block.content.textColor || '#7c3aed',
            backgroundColor: block.content.backgroundColor || '#faf5ff',
            padding: '20px'
          }
        });
      } else if (block.type === 'announcement') {
        convertedBlocks.push({
          id: blockId,
          type: 'text',
          content: {
            text: `${block.content.title}\n\n${block.content.message}`,
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: block.content.titleColor || '#dc2626',
            backgroundColor: block.content.backgroundColor || '#fef2f2',
            padding: '25px'
          }
        });
      } else {
        // Default handling for any other block types
        convertedBlocks.push({
          id: blockId,
          type: block.type,
          content: { ...block.content }
        });
      }
    });

    // Update the template with the selected template data
    setTemplate(prev => ({
      ...prev,
      name: selectedTemplate.name || 'New Template',
      category: selectedTemplate.category || 'general',
      subject: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
      design_json: {
        ...prev.design_json,
        blocks: convertedBlocks,
        styles: {
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          primaryColor: '#3b82f6',
          secondaryColor: '#6b7280'
        }
      }
    }));
    
    setShowTemplateLibrary(false);
    
    // Show success message
    setTimeout(() => {
      alert(`Template "${selectedTemplate.name}" applied successfully! All ${convertedBlocks.length} blocks loaded.`);
    }, 100);
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

  // Load saved state from localStorage on component mount
  useEffect(() => {
    if (!templateId && !isInitialized) {
      const savedState = localStorage.getItem('emailTemplateBuilder_state');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          // Only restore if it's recent (within last 24 hours)
          const isRecent = Date.now() - parsedState.timestamp < 24 * 60 * 60 * 1000;
          if (isRecent && parsedState.template) {
            console.log('Restoring saved template state:', parsedState.template);
            setTemplate(parsedState.template);
            setAutoSaveStatus('saved');
            setLastSaved(new Date(parsedState.timestamp));
          }
        } catch (error) {
          console.error('Error loading saved state:', error);
          localStorage.removeItem('emailTemplateBuilder_state');
        }
      }
      setIsInitialized(true);
    } else if (templateId) {
      fetchTemplate();
    }
  }, [templateId, isInitialized]);

  // Save state to localStorage whenever template changes (but not during initial load)
  useEffect(() => {
    if (isInitialized && !templateId && (template.name || template.design_json.blocks.length > 0)) {
      const stateToSave = {
        template,
        timestamp: Date.now()
      };
      localStorage.setItem('emailTemplateBuilder_state', JSON.stringify(stateToSave));
      console.log('Template state saved to localStorage');
    }
  }, [template, isInitialized, templateId]);

  // Clear saved state when component unmounts or when template is saved
  useEffect(() => {
    return () => {
      // Only clear if we're not editing an existing template
      if (!templateId) {
        console.log('Clearing saved template state on unmount');
        localStorage.removeItem('emailTemplateBuilder_state');
      }
    };
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
          </style>
        </head>
        <body>
          <div class="email-container">
    `;

    blocks.forEach(block => {
      const blockHtml = renderBlock(block);
      if (blockHtml) {
        html += `<div class="block">${blockHtml.props.dangerouslySetInnerHTML?.__html || ''}</div>`;
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
                title="Desktop Preview"
              >
                <ComputerDesktopIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white shadow' : ''}`}
                title="Mobile Preview"
              >
                <DevicePhoneMobileIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              title="Browse Templates"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Templates</span>
            </button>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              title="Preview Email"
            >
              <EyeIcon className="h-4 w-4" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => {
                // Copy template functionality
                navigator.clipboard.writeText(JSON.stringify(template.design_json));
                alert('Template copied to clipboard!');
              }}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              title="Copy Template"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              <span>Copy</span>
            </button>

            <button
              onClick={() => {
                // Export as HTML functionality
                const htmlContent = generateHTML();
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${template.name || 'email-template'}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              title="Export HTML"
            >
              <ArrowDownIcon className="h-4 w-4" />
              <span>Export</span>
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
              <div className="text-xs text-purple-600">Browse 40+ professional templates</div>
            </button>
          </div>

          {/* Block Types */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Content Blocks</h3>
            <div className="space-y-2">
              {blockTypes.map((blockType) => (
                <div
                  key={blockType.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, blockType)}
                  className="flex items-center p-2 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <blockType.icon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{blockType.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`mx-auto bg-white shadow-lg rounded-lg min-h-96 ${
              previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
            }`}
          >
            {template.design_json.blocks.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <DocumentDuplicateIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Start building your email</p>
                  <p className="text-sm">Drag blocks from the sidebar or choose a template</p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {template.design_json.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={`relative group ${selectedBlock === block.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedBlock(block.id)}
                  >
                    {renderBlock(block)}
                    
                    {/* Block Controls */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        {index > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // moveBlock(block.id, 'up');
                            }}
                            className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
                          >
                            <ArrowUpIcon className="h-3 w-3" />
                          </button>
                        )}
                        {index < template.design_json.blocks.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // moveBlock(block.id, 'down');
                            }}
                            className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
                          >
                            <ArrowDownIcon className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                          className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-red-50 hover:border-red-300"
                        >
                          <TrashIcon className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibraryModal
          isOpen={showTemplateLibrary}
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
    </div>
  );
};

export default EmailTemplateBuilder;
