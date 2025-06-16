import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Type, Image, Square, Circle, Minus, Link, 
  Palette, Download, Save, Eye, Sparkles, 
  Layers, ZoomIn, ZoomOut, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Mail, MessageSquare, FileImage, Share2, Megaphone,
  Grid, Layout, Star, Search, Filter, Upload, Plus,
  Calendar, Users, Target
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';

const API_BASE_URL = 'https://api.ptoconnect.com';

// Multi-Format Builder Modes
const BuilderModes = {
  EMAIL: 'email',
  SMS: 'sms',
  FLYER: 'flyer',
  SOCIAL: 'social',
  ANNOUNCEMENT: 'announcement'
};

const AdvancedDesignStudio = () => {
  const [canvas, setCanvas] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('templates');
  const [showStellaPopup, setShowStellaPopup] = useState(false);
  const [builderMode, setBuilderMode] = useState(BuilderModes.EMAIL);
  const [unlayerTemplates, setUnlayerTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orgId, setOrgId] = useState(null);
  const [token, setToken] = useState(null);
  const canvasRef = useRef(null);

  // Initialize authentication and load data
  useEffect(() => {
    initializeAuth();
    loadUnlayerTemplates();
  }, []);

  // Close Stella popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStellaPopup && !event.target.closest('.stella-popup-container')) {
        setShowStellaPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStellaPopup]);

  const initializeAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const orgId = session.user.user_metadata?.org_id || session.user.app_metadata?.org_id;
      setOrgId(orgId);
      setToken(session.access_token);
    }
  };

  // Template data for different formats
  const smsTemplates = [
    {
      id: 'sms-1',
      name: 'Event Reminder',
      category: 'Events',
      source: 'pto-connect',
      description: 'Simple event reminder message',
      elements: [
        { type: 'text', content: 'Reminder: Fall Festival tomorrow at 11 AM! See you there! 🎃', style: { fontSize: '16px' } }
      ]
    }
  ];

  const flyerTemplates = [
    {
      id: 'flyer-1',
      name: 'Event Flyer',
      category: 'Events',
      source: 'pto-connect',
      description: 'Print-ready event flyer',
      elements: [
        { type: 'header', content: 'FALL FESTIVAL 2024', style: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center' } }
      ]
    }
  ];

  const socialTemplates = [
    {
      id: 'social-1',
      name: 'Instagram Post',
      category: 'Social',
      source: 'pto-connect',
      description: 'Square social media post',
      elements: [
        { type: 'header', content: 'Follow Us!', style: { fontSize: '32px', textAlign: 'center' } }
      ]
    }
  ];

  const announcementTemplates = [
    {
      id: 'announcement-1',
      name: 'Urgent Notice',
      category: 'Announcements',
      source: 'pto-connect',
      description: 'Important announcement template',
      elements: [
        { type: 'header', content: 'IMPORTANT NOTICE', style: { fontSize: '28px', color: '#dc2626', fontWeight: 'bold' } }
      ]
    }
  ];

  // Mode configuration for multi-format builder
  const getModeConfig = (mode) => ({
    email: {
      label: '📧 Email',
      description: 'Professional email campaigns and newsletters',
      templates: [...professionalTemplates, ...unlayerTemplates],
      blocks: enhancedBlocks,
      preview: 'email-preview',
      export: ['html', 'pdf'],
      canvasStyle: { maxWidth: '600px', backgroundColor: '#f7f7f7' }
    },
    sms: {
      label: '📱 SMS',
      description: 'Text message campaigns with character limits',
      templates: smsTemplates,
      blocks: enhancedBlocks.filter(b => b.category === 'content'),
      preview: 'sms-preview',
      export: ['text'],
      canvasStyle: { maxWidth: '320px', backgroundColor: '#ffffff' }
    },
    flyer: {
      label: '📄 Flyer',
      description: 'Print-ready designs and announcements',
      templates: flyerTemplates,
      blocks: enhancedBlocks,
      preview: 'print-preview',
      export: ['pdf', 'png'],
      canvasStyle: { width: '8.5in', height: '11in', backgroundColor: '#ffffff' }
    },
    social: {
      label: '📱 Social Post',
      description: 'Platform-specific social media designs',
      templates: socialTemplates,
      blocks: enhancedBlocks.filter(b => ['visual', 'content', 'design'].includes(b.category)),
      preview: 'social-preview',
      export: ['png', 'jpg'],
      canvasStyle: { width: '1080px', height: '1080px', backgroundColor: '#ffffff' }
    },
    announcement: {
      label: '📢 Announcement',
      description: 'Urgent notices and important updates',
      templates: announcementTemplates,
      blocks: enhancedBlocks.filter(b => ['content', 'layout'].includes(b.category)),
      preview: 'announcement-preview',
      export: ['html', 'pdf', 'png'],
      canvasStyle: { maxWidth: '600px', backgroundColor: '#fff3cd' }
    }
  }[mode]);

  // Load Unlayer templates via API
  const loadUnlayerTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      
      // For now, use placeholder data until we implement the Unlayer API integration
      // This will be replaced with actual API calls once we set up the backend integration
             const placeholderTemplates = [
         {
           id: 'unlayer-1',
           name: 'School Newsletter',
           category: 'Newsletter',
           source: 'unlayer',
           thumbnail: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=Newsletter',
           description: 'Professional school newsletter template',
           elements: [
             { type: 'header', content: 'Monthly Newsletter', style: { fontSize: '32px', color: '#2563eb', fontWeight: 'bold', textAlign: 'center', padding: '20px' } },
             { type: 'image', src: 'https://via.placeholder.com/600x200/dbeafe/2563eb?text=School+Image', style: { width: '100%', height: '200px' } },
             { type: 'text', content: 'Stay connected with the latest news and updates from our school community.', style: { fontSize: '18px', color: '#374151', padding: '20px' } }
           ]
         },
         {
           id: 'unlayer-2',
           name: 'Event Announcement',
           category: 'Events',
           source: 'unlayer',
           thumbnail: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Event',
           description: 'Eye-catching event announcement template',
           elements: [
             { type: 'header', content: 'Special Event', style: { fontSize: '28px', color: '#dc2626', fontWeight: 'bold', textAlign: 'center', padding: '20px' } },
             { type: 'text', content: 'Join us for an unforgettable experience!', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '10px' } },
             { type: 'button', content: 'RSVP Now', style: { backgroundColor: '#dc2626', color: 'white', padding: '12px 24px', borderRadius: '6px', margin: '20px auto', display: 'block' } }
           ]
         },
         {
           id: 'unlayer-3',
           name: 'Fundraiser Progress',
           category: 'Fundraising',
           source: 'unlayer',
           thumbnail: 'https://via.placeholder.com/300x200/059669/ffffff?text=Fundraiser',
           description: 'Professional fundraising campaign template',
           elements: [
             { type: 'header', content: 'Fundraiser Update', style: { fontSize: '28px', color: '#059669', fontWeight: 'bold', textAlign: 'center', padding: '20px' } },
             { type: 'progress-bar', value: 75, goal: 5000, style: { backgroundColor: '#d1fae5', margin: '20px', borderRadius: '10px' } },
             { type: 'text', content: 'We\'re 75% to our goal! Thank you for your amazing support.', style: { fontSize: '16px', textAlign: 'center', padding: '20px' } }
           ]
         },
         {
           id: 'unlayer-4',
           name: 'Volunteer Recruitment',
           category: 'Volunteers',
           source: 'unlayer',
           thumbnail: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=Volunteers',
           description: 'Engaging volunteer recruitment template',
           elements: [
             { type: 'header', content: 'Volunteers Needed!', style: { fontSize: '30px', color: '#7c3aed', fontWeight: 'bold', textAlign: 'center', padding: '20px' } },
             { type: 'text', content: 'Help make our events successful by volunteering your time and talents.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '15px' } },
             { type: 'button', content: 'Sign Up to Volunteer', style: { backgroundColor: '#7c3aed', color: 'white', padding: '15px 30px', borderRadius: '8px', margin: '20px auto', display: 'block' } }
           ]
         }
       ];

      setUnlayerTemplates(placeholderTemplates);
    } catch (error) {
      console.error('Error loading Unlayer templates:', error);
      setUnlayerTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Enhanced template system with professional templates
  const professionalTemplates = [
    {
      id: 'pto-1',
      name: 'Welcome Back Newsletter',
      category: 'Newsletter',
      source: 'pto-connect',
      thumbnail: '/api/placeholder/300/200',
      description: 'Professional welcome back to school newsletter',
      elements: [
        { type: 'header', content: 'Welcome Back to School!', style: { fontSize: '36px', color: '#1e40af', fontWeight: 'bold', textAlign: 'center', padding: '30px', backgroundColor: '#dbeafe' } },
        { type: 'text', content: 'We\'re excited to start another amazing school year together!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px' } },
        { type: 'image', src: '/api/placeholder/600/300', style: { width: '100%', height: '300px', borderRadius: '8px', margin: '20px 0' } }
      ]
    },
    {
      id: 'pto-2', 
      name: 'Fall Festival Invitation',
      category: 'Events',
      source: 'pto-connect',
      thumbnail: '/api/placeholder/300/200',
      description: 'Festive fall event invitation template',
      elements: [
        { type: 'header', content: 'Fall Festival 2024', style: { fontSize: '32px', color: '#d97706', fontWeight: 'bold', textAlign: 'center', padding: '25px', backgroundColor: '#fef3c7' } },
        { type: 'text', content: 'Join us for a day of fun, food, and community spirit!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px' } },
        { type: 'text', content: 'Date: October 15th | Time: 11 AM - 4 PM | Location: School Playground', style: { fontSize: '16px', color: '#6b7280', textAlign: 'center', padding: '10px', fontWeight: 'bold' } }
      ]
    }
  ];

  // Enhanced block library with PTO-specific blocks
  const enhancedBlocks = [
    // Content Blocks
    { type: 'text', icon: Type, label: 'Text Block', category: 'content', defaultContent: 'Add your message here' },
    { type: 'header', icon: Type, label: 'Header', category: 'content', defaultContent: 'Header Text' },
    { type: 'subheader', icon: Type, label: 'Subheader', category: 'content', defaultContent: 'Subheader Text' },
    
    // Visual Blocks
    { type: 'image', icon: Image, label: 'Image', category: 'visual', defaultSrc: '/api/placeholder/400/300' },
    { type: 'gallery', icon: Grid, label: 'Image Gallery', category: 'visual' },
    { type: 'video', icon: Square, label: 'Video', category: 'visual' },
    
    // Interactive Blocks
    { type: 'button', icon: Square, label: 'Button', category: 'interactive', defaultContent: 'Click Here' },
    { type: 'social-links', icon: Share2, label: 'Social Links', category: 'interactive' },
    { type: 'contact-info', icon: Mail, label: 'Contact Info', category: 'interactive' },
    
    // PTO-Specific Blocks
    { type: 'event-details', icon: Calendar, label: 'Event Details', category: 'pto-specific' },
    { type: 'volunteer-signup', icon: Users, label: 'Volunteer Signup', category: 'pto-specific' },
    { type: 'fundraiser-progress', icon: Target, label: 'Fundraiser Progress', category: 'pto-specific' },
    { type: 'teacher-spotlight', icon: Star, label: 'Teacher Spotlight', category: 'pto-specific' },
    { type: 'calendar-widget', icon: Calendar, label: 'Calendar Widget', category: 'pto-specific' },
    
    // Layout Blocks
    { type: 'divider', icon: Minus, label: 'Divider', category: 'layout' },
    { type: 'spacer', icon: Layout, label: 'Spacer', category: 'layout' },
    { type: 'columns', icon: Grid, label: 'Columns', category: 'layout' },
    
    // Design Elements
    { type: 'shape', icon: Circle, label: 'Shape', category: 'design' },
    { type: 'icon', icon: Star, label: 'Icon', category: 'design' },
    { type: 'border', icon: Square, label: 'Border', category: 'design' }
  ];

  // Get filtered templates based on search and category
  const getFilteredTemplates = () => {
    let allTemplates = [...professionalTemplates, ...unlayerTemplates];
    
    if (selectedCategory !== 'all') {
      allTemplates = allTemplates.filter(template => 
        template.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (searchTerm) {
      allTemplates = allTemplates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return allTemplates;
  };

  // Template categories for filtering
  const templateCategories = [
    { id: 'all', name: 'All Templates', count: professionalTemplates.length + unlayerTemplates.length },
    { id: 'newsletter', name: 'Newsletter', count: 3 },
    { id: 'events', name: 'Events', count: 2 },
    { id: 'fundraising', name: 'Fundraising', count: 2 },
    { id: 'volunteers', name: 'Volunteers', count: 1 },
    { id: 'announcements', name: 'Announcements', count: 1 }
  ];

  // Draggable Elements
  const designElements = [
    { type: 'text', icon: Type, label: 'Text', defaultContent: 'Add your text here' },
    { type: 'header', icon: Type, label: 'Header', defaultContent: 'Header Text' },
    { type: 'image', icon: Image, label: 'Image', defaultSrc: '/placeholder-image.jpg' },
    { type: 'button', icon: Square, label: 'Button', defaultContent: 'Click Here' },
    { type: 'divider', icon: Minus, label: 'Divider' },
    { type: 'shape', icon: Circle, label: 'Shape' },
    { type: 'link', icon: Link, label: 'Link', defaultContent: 'Link Text' }
  ];

  // Brand Assets
  const brandAssets = {
    colors: ['#1f2937', '#374151', '#6b7280', '#d97706', '#059669', '#dc2626', '#7c3aed'],
    fonts: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'],
    logos: [
      { id: 1, name: 'School Logo', src: '/logos/school-logo.png' },
      { id: 2, name: 'PTO Logo', src: '/logos/pto-logo.png' }
    ]
  };

  // Drag and Drop Handlers
  const DraggableElement = ({ element }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'design-element',
      item: { 
        type: element.type, 
        defaultContent: element.defaultContent || '',
        defaultSrc: element.defaultSrc || '',
        label: element.label
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }), [element]);

    const Icon = element.icon;

    return (
      <div
        ref={drag}
        className={`p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          <Icon className="w-6 h-6 text-gray-600" />
          <span className="text-sm text-gray-700">{element.label}</span>
        </div>
      </div>
    );
  };

  const CanvasDropZone = () => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'design-element',
      drop: (item, monitor) => {
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (!canvasRect) return;
        
        const newElement = {
          id: Date.now() + Math.random(), // More unique ID
          type: item.type,
          x: Math.max(0, offset.x - canvasRect.left - 50), // Center the element
          y: Math.max(0, offset.y - canvasRect.top - 20),
          content: item.defaultContent || 'New Content',
          src: item.defaultSrc || '',
          style: {
            fontSize: '16px',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '12px',
            borderRadius: '4px',
            fontFamily: 'Inter, sans-serif'
          }
        };
        
        setCanvas(prev => [...prev, newElement]);
        setSelectedElement(newElement);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }), [canvasRef]);

    return (
      <div
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        className={`relative bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-[600px] w-full ${
          isOver ? 'border-blue-500 bg-blue-50' : ''
        }`}
        style={{ 
          transform: `scale(${zoomLevel / 100})`, 
          transformOrigin: 'top left',
          minHeight: '600px'
        }}
      >
        {canvas.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => setSelectedElement(element)}
            onUpdate={(updatedElement) => {
              setCanvas(prev => prev.map(el => el.id === element.id ? updatedElement : el));
              setSelectedElement(updatedElement);
            }}
          />
        ))}
        
        {canvas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Drag elements here to start designing</p>
              <p className="text-sm">Choose from templates or build from scratch</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CanvasElement = ({ element, isSelected, onSelect, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleDoubleClick = () => {
      if (element.type === 'text' || element.type === 'header' || element.type === 'button') {
        setIsEditing(true);
      }
    };

    const handleContentChange = (newContent) => {
      onUpdate({ ...element, content: newContent });
      setIsEditing(false);
    };

    const renderElement = () => {
      switch (element.type) {
        case 'text':
          return isEditing ? (
            <input
              type="text"
              value={element.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="w-full bg-transparent border-none outline-none"
              autoFocus
            />
          ) : (
            <p style={element.style}>{element.content}</p>
          );
          
        case 'header':
          return isEditing ? (
            <input
              type="text"
              value={element.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="w-full bg-transparent border-none outline-none text-2xl font-bold"
              autoFocus
            />
          ) : (
            <h2 style={{ ...element.style, fontSize: '24px', fontWeight: 'bold' }}>
              {element.content}
            </h2>
          );
          
        case 'image':
          return (
            <img
              src={element.src}
              alt="Design element"
              style={element.style}
              className="max-w-full h-auto"
            />
          );
          
        case 'button':
          return (
            <button
              style={{
                ...element.style,
                backgroundColor: element.style.backgroundColor || '#3b82f6',
                color: element.style.color || 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={element.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="bg-transparent border-none outline-none text-white"
                  autoFocus
                />
              ) : (
                element.content
              )}
            </button>
          );
          
        case 'divider':
          return (
            <hr
              style={{
                ...element.style,
                border: 'none',
                height: '2px',
                backgroundColor: element.style.backgroundColor || '#e5e7eb',
                margin: '16px 0'
              }}
            />
          );
          
        default:
          return <div>Unknown element</div>;
      }
    };

    return (
      <div
        className={`absolute cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          minWidth: '100px',
          minHeight: '30px'
        }}
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
      >
        {renderElement()}
        
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-move"></div>
        )}
      </div>
    );
  };

  // Stella AI Assistant Component
  const StellaAssistant = () => {
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateContent = async (type) => {
      setIsGenerating(true);
      // Simulate AI generation
      setTimeout(() => {
        const generatedContent = {
          'email-subject': 'Join Us for an Amazing Fall Festival!',
          'email-body': 'Dear PTO Community,\n\nWe\'re excited to invite you to our annual Fall Festival! Join us for a day filled with fun activities, delicious food, and community spirit.\n\nDate: Saturday, October 15th\nTime: 10 AM - 4 PM\nLocation: School Playground\n\nWe hope to see you there!',
          'social-post': '🍂 Fall Festival Alert! 🍂\n\nJoin us for food, fun, and community spirit! October 15th, 10 AM - 4 PM at the school playground. Bring the whole family! #PTOFallFestival #CommunityFun',
          'flyer-text': 'FALL FESTIVAL 2024\n\nFood • Games • Fun\nOctober 15th | 10 AM - 4 PM\nSchool Playground\n\nBring the whole family!'
        };
        
        // Add generated content to canvas
        const newElement = {
          id: Date.now(),
          type: 'text',
          x: 50,
          y: 50,
          content: generatedContent[type] || 'Generated content',
          style: {
            fontSize: '16px',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '8px'
          }
        };
        
        setCanvas(prev => [...prev, newElement]);
        setIsGenerating(false);
      }, 2000);
    };

    return (
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">Stella's Content Assistant</h3>
        </div>
        
        <div className="text-xs text-purple-700 mb-3">
          Hi! I'm Stella. I can help create content for your designs, or you can create everything manually. Your choice!
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => generateContent('email-subject')}
            disabled={isGenerating}
            className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Let Stella Write Email Subject
          </button>
          <button
            onClick={() => generateContent('email-body')}
            disabled={isGenerating}
            className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Let Stella Write Email Content
          </button>
          <button
            onClick={() => generateContent('social-post')}
            disabled={isGenerating}
            className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Let Stella Create Social Post
          </button>
          <button
            onClick={() => generateContent('flyer-text')}
            disabled={isGenerating}
            className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
          >
            Let Stella Write Flyer Content
          </button>
        </div>
        
        {isGenerating && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-purple-600">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Stella is writing content...</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Properties Panel
  const PropertiesPanel = () => {
    if (!selectedElement) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select an element to edit properties</p>
        </div>
      );
    }

    const updateElementStyle = (styleUpdates) => {
      const updatedElement = {
        ...selectedElement,
        style: { ...selectedElement.style, ...styleUpdates }
      };
      setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updatedElement : el));
      setSelectedElement(updatedElement);
    };

    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Element Properties</h3>
        
        {/* Text Properties */}
        {(selectedElement.type === 'text' || selectedElement.type === 'header' || selectedElement.type === 'button') && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="range"
                min="12"
                max="48"
                value={parseInt(selectedElement.style.fontSize) || 16}
                onChange={(e) => updateElementStyle({ fontSize: `${e.target.value}px` })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={selectedElement.style.color || '#374151'}
                onChange={(e) => updateElementStyle({ color: e.target.value })}
                className="w-full h-10 rounded border"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => updateElementStyle({ fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={`p-2 rounded border ${selectedElement.style.fontWeight === 'bold' ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'}`}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateElementStyle({ fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
                className={`p-2 rounded border ${selectedElement.style.fontStyle === 'italic' ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'}`}
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
          <input
            type="color"
            value={selectedElement.style.backgroundColor || '#ffffff'}
            onChange={(e) => updateElementStyle({ backgroundColor: e.target.value })}
            className="w-full h-10 rounded border"
          />
        </div>
        
        {/* Padding */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
          <input
            type="range"
            min="0"
            max="32"
            value={parseInt(selectedElement.style.padding) || 8}
            onChange={(e) => updateElementStyle({ padding: `${e.target.value}px` })}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-100 flex">
        {/* Left Panel - Tools & Templates */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'templates' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('elements')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'elements' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Elements
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'brand' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Brand
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'templates' && (
              <div className="p-4 space-y-4">
                {/* Template Search and Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {templateCategories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Professional Templates Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Professional Templates</h3>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Unlayer Powered</span>
                  </div>
                  
                  {isLoadingTemplates ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="border border-gray-200 rounded-lg p-3 animate-pulse">
                          <div className="aspect-video bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {getFilteredTemplates().map(template => (
                        <div
                          key={template.id}
                          className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                          onClick={() => setCanvas(template.elements.map((el, idx) => ({ ...el, id: Date.now() + idx, x: 0, y: idx * 20 })))}
                        >
                          <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center relative overflow-hidden">
                            {template.thumbnail ? (
                              <img 
                                src={template.thumbnail} 
                                alt={template.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Image className="w-8 h-8 text-gray-400" />
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                              <button className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all">
                                Use Template
                              </button>
                            </div>
                          </div>
                          <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{template.category}</span>
                            {template.source === 'unlayer' && (
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'elements' && (
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Enhanced Block Library</h3>
                
                {/* Group blocks by category */}
                {['content', 'visual', 'interactive', 'pto-specific', 'layout', 'design'].map(category => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">
                      {category.replace('-', ' ')} Blocks
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {enhancedBlocks
                        .filter(block => block.category === category)
                        .map(element => (
                          <DraggableElement key={`${element.type}-${element.category}`} element={element} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'brand' && (
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Brand Assets</h3>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">School Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {brandAssets.colors.map(color => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => selectedElement && updateElementStyle({ color })}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Typography</h4>
                  <div className="space-y-1">
                    {brandAssets.fonts.map(font => (
                      <button
                        key={font}
                        className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded transition-colors"
                        style={{ fontFamily: font }}
                        onClick={() => selectedElement && updateElementStyle({ fontFamily: font })}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Logos & Assets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {brandAssets.logos.map(logo => (
                      <div key={logo.id} className="border border-gray-200 rounded p-2 cursor-pointer hover:bg-gray-50">
                        <div className="aspect-square bg-gray-100 rounded mb-1 flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600">{logo.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Toolbar */}
          <div className="bg-white border-b border-gray-200">
            {/* Header Section */}
            <div className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Communication Designer</h1>
                  <p className="text-sm text-gray-500">Create professional communications for your PTO</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Undo"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Redo"
                  >
                    <Redo className="w-4 h-4" />
                  </button>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Clear Canvas"
                    onClick={() => setCanvas([])}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
                  <button
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Action Buttons */}
                <button 
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => console.log('Save draft')}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </button>
                <button 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => console.log('Preview', builderMode)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
                {/* Stella AI Assistant */}
                <div className="relative stella-popup-container">
                  <button 
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={() => setShowStellaPopup(!showStellaPopup)}
                    title="Stella AI Assistant"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Stella
                  </button>
                  
                  {/* Stella Popup */}
                  {showStellaPopup && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Stella's Content Assistant</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Hi! I'm Stella. I can help create content for your designs, or you can create everything manually. Your choice!
                        </p>
                        
                        <div className="space-y-2">
                          <button className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                            Let Stella Write Email Subject
                          </button>
                          <button className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                            Let Stella Write Email Content
                          </button>
                          <button className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                            Let Stella Create Social Post
                          </button>
                          <button className="w-full py-2 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                            Let Stella Write Flyer Content
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => setShowStellaPopup(false)}
                          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
                        >
                          <span className="text-gray-400">×</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
                         {/* Communication Type Tabs */}
             <div className="px-6">
               <div className="flex border-b border-gray-200">
                 {Object.values(BuilderModes).map(mode => {
                   const config = getModeConfig(mode);
                   return (
                     <button
                       key={mode}
                       onClick={() => setBuilderMode(mode)}
                       className={`flex-1 py-4 px-4 border-b-2 font-medium text-sm transition-colors text-center ${
                         builderMode === mode 
                           ? 'border-blue-600 text-blue-600' 
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                       }`}
                     >
                       {config.label}
                     </button>
                   );
                 })}
               </div>
             </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex justify-center">
              <div style={getModeConfig(builderMode).canvasStyle}>
                <CanvasDropZone />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        <div className="w-80 bg-white border-l border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Properties</h2>
          </div>
          <PropertiesPanel />
        </div>
      </div>
    </DndProvider>
  );
};

export default AdvancedDesignStudio;