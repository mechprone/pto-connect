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
  ArrowDownIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  TrophyIcon,
  ChevronDownIcon
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
  const [builderMode, setBuilderMode] = useState('email'); // New unified builder mode
  const [collapsedCategories, setCollapsedCategories] = useState({
    basic: true,
    design: true,
    fundraising: true,
    events: true,
    volunteers: true,
    announcements: true,
    interactive: true,
    academic: true,
  });
  const canvasRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Unified Builder Mode Configuration
  const builderModes = {
    email: {
      name: 'Email',
      icon: '📧',
      canvas: { width: '600px', maxWidth: '600px', responsive: true },
      blocks: ['header', 'text', 'image', 'button', 'divider', 'donation', 'volunteer', 'event', 'announcement', 'social', 'contact'],
      constraints: { maxWidth: '600px', emailSafe: true },
      description: 'Create professional email communications'
    },
    newsletter: {
      name: 'Newsletter',
      icon: '📰',
      canvas: { width: '800px', maxWidth: '800px', multiColumn: true },
      blocks: ['header', 'text', 'image', 'newsletter', 'divider', 'stats', 'achievement', 'grade', 'highlight'],
      constraints: { sections: true, multiColumn: true },
      description: 'Design comprehensive newsletters'
    },
    social: {
      name: 'Social Media',
      icon: '📱',
      canvas: { width: '1080px', height: '1080px', aspectRatio: '1:1' },
      blocks: ['header', 'text', 'image', 'quote', 'stats', 'social', 'highlight'],
      constraints: { aspectRatio: '1:1', socialOptimized: true },
      description: 'Create engaging social media posts'
    },
    flyer: {
      name: 'Flyer/Poster',
      icon: '📄',
      canvas: { width: '8.5in', height: '11in', printReady: true },
      blocks: ['header', 'text', 'image', 'event', 'contact', 'divider', 'highlight', 'stats'],
      constraints: { printSafe: true, highRes: true },
      description: 'Design print-ready flyers and posters'
    },
    announcement: {
      name: 'Announcement',
      icon: '📢',
      canvas: { width: '600px', maxWidth: '600px', compact: true },
      blocks: ['header', 'text', 'announcement', 'button', 'contact', 'divider'],
      constraints: { compact: true, urgent: true },
      description: 'Quick announcements and alerts'
    }
  };

  // Enhanced block types with professional design elements
  const blockTypes = [
    // Basic Content Blocks
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

    // Design Elements & Pizzazz
    {
      type: 'divider',
      name: 'Divider Line',
      icon: Bars3Icon,
      category: 'design',
      defaultContent: {
        style: 'solid',
        color: '#e5e7eb',
        thickness: '2px',
        width: '80%',
        margin: '20px auto'
      }
    },
    {
      type: 'spacer',
      name: 'Spacer',
      icon: ArrowUpIcon,
      category: 'design',
      defaultContent: {
        height: '30px',
        backgroundColor: 'transparent'
      }
    },
    {
      type: 'quote',
      name: 'Quote Block',
      icon: SparklesIcon,
      category: 'design',
      defaultContent: {
        text: '"Education is the most powerful weapon which you can use to change the world."',
        author: 'Nelson Mandela',
        backgroundColor: '#f8fafc',
        textColor: '#475569',
        authorColor: '#64748b',
        borderColor: '#3b82f6',
        padding: '25px',
        fontSize: '18px',
        fontStyle: 'italic'
      }
    },
    {
      type: 'highlight',
      name: 'Highlight Box',
      icon: StarIcon,
      category: 'design',
      defaultContent: {
        title: 'Important Notice',
        text: 'This is an important message that stands out from the rest of the content.',
        backgroundColor: '#fef3c7',
        titleColor: '#92400e',
        textColor: '#78350f',
        borderColor: '#f59e0b',
        padding: '20px',
        borderRadius: '8px'
      }
    },
    {
      type: 'stats',
      name: 'Statistics',
      icon: PresentationChartLineIcon,
      category: 'design',
      defaultContent: {
        title: 'Our Impact This Year',
        stats: [
          { number: '250', label: 'Students Served' },
          { number: '$15K', label: 'Funds Raised' },
          { number: '50', label: 'Volunteers' }
        ],
        backgroundColor: '#f0f9ff',
        titleColor: '#1e40af',
        numberColor: '#3b82f6',
        labelColor: '#64748b',
        padding: '25px'
      }
    },

    // PTO-Specific Blocks
    {
      type: 'donation',
      name: 'Donation Progress',
      icon: GiftIcon,
      category: 'fundraising',
      defaultContent: {
        title: 'Help Us Reach Our Goal!',
        description: 'Support our fundraising campaign',
        currentAmount: 15000,
        goalAmount: 25000,
        backgroundColor: '#fef3c7',
        titleColor: '#92400e',
        textColor: '#374151',
        progressColor: '#f59e0b',
        buttonText: 'Donate Now',
        buttonColor: '#f59e0b',
        padding: '20px'
      }
    },
    {
      type: 'volunteer',
      name: 'Volunteer Call',
      icon: UserGroupIcon,
      category: 'volunteers',
      defaultContent: {
        title: 'We Need Volunteers!',
        description: 'Help make our next event a success.',
        opportunities: ['Event Setup', 'Bake Sale', 'Clean Up'],
        backgroundColor: '#f0f9ff',
        titleColor: '#1e40af',
        textColor: '#374151',
        buttonText: 'Sign Up to Volunteer',
        buttonColor: '#2563eb',
        padding: '20px'
      }
    },
    {
      type: 'event',
      name: 'Event Card',
      icon: CalendarIcon,
      category: 'events',
      defaultContent: {
        title: 'Fall Festival 2024',
        date: '2024-11-15',
        time: '10:00 AM - 4:00 PM',
        location: 'School Playground',
        description: 'Join us for a day of fun, food, and community!',
        image: 'https://via.placeholder.com/400x200?text=Event+Image',
        backgroundColor: '#fef3c7',
        titleColor: '#92400e',
        textColor: '#374151',
        buttonText: 'RSVP Now',
        buttonColor: '#f59e0b',
        padding: '20px'
      }
    },
    {
      type: 'announcement',
      name: 'Announcement',
      icon: MegaphoneIcon,
      category: 'announcements',
      defaultContent: {
        title: 'Important Announcement',
        message: 'We have important news to share with our school community.',
        backgroundColor: '#fef2f2',
        titleColor: '#dc2626',
        textColor: '#991b1b',
        buttonText: 'Learn More',
        buttonColor: '#dc2626',
        padding: '20px'
      }
    },

    // Interactive Elements
    {
      type: 'social',
      name: 'Social Media',
      icon: HeartIcon,
      category: 'interactive',
      defaultContent: {
        title: 'Follow Us on Social Media',
        platforms: [
          { name: 'Facebook', url: '#', icon: '📘' },
          { name: 'Instagram', url: '#', icon: '📷' },
          { name: 'Twitter', url: '#', icon: '🐦' }
        ],
        backgroundColor: '#f8fafc',
        titleColor: '#1e293b',
        padding: '20px'
      }
    },
    {
      type: 'contact',
      name: 'Contact Info',
      icon: BuildingOfficeIcon,
      category: 'interactive',
      defaultContent: {
        title: 'Contact Us',
        email: 'pto@school.edu',
        phone: '(555) 123-4567',
        address: '123 School Street, City, State 12345',
        backgroundColor: '#f1f5f9',
        titleColor: '#334155',
        textColor: '#64748b',
        padding: '20px'
      }
    },
    {
      type: 'countdown',
      name: 'Event Countdown',
      icon: ClockIcon,
      category: 'interactive',
      defaultContent: {
        title: 'Event Starts In:',
        eventDate: '2024-12-01',
        backgroundColor: '#fef3c7',
        titleColor: '#92400e',
        numberColor: '#f59e0b',
        labelColor: '#78350f',
        padding: '25px'
      }
    },

    // Academic & School Elements
    {
      type: 'grade',
      name: 'Grade Level Info',
      icon: AcademicCapIcon,
      category: 'academic',
      defaultContent: {
        title: 'Kindergarten News',
        teacher: 'Mrs. Johnson',
        content: 'This week in Kindergarten, we are learning about letters and numbers!',
        backgroundColor: '#f0fdf4',
        titleColor: '#166534',
        textColor: '#374151',
        padding: '20px'
      }
    },
    {
      type: 'achievement',
      name: 'Student Achievement',
      icon: TrophyIcon,
      category: 'academic',
      defaultContent: {
        title: '🏆 Student Achievements',
        achievements: [
          'Math Olympiad Winners',
          'Perfect Attendance Awards',
          'Reading Challenge Champions'
        ],
        backgroundColor: '#fefce8',
        titleColor: '#a16207',
        textColor: '#374151',
        padding: '20px'
      }
    },
    {
      type: 'newsletter',
      name: 'Newsletter Section',
      icon: DocumentTextIcon,
      category: 'academic',
      defaultContent: {
        title: 'Principal\'s Message',
        content: 'Dear families, I hope this message finds you well. This month has been filled with exciting learning opportunities...',
        author: 'Dr. Smith, Principal',
        backgroundColor: '#f8fafc',
        titleColor: '#1e293b',
        textColor: '#475569',
        authorColor: '#64748b',
        padding: '25px'
      }
    }
  ];

  const toggleCategory = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedBlock) {
      addBlock(draggedBlock);
      setDraggedBlock(null);
    }
  };

  const handleDropAtPosition = (e, position) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedBlock) {
      addBlockAtPosition(draggedBlock, position);
      setDraggedBlock(null);
    }
  };

  // Block Management Functions
  const addBlock = (blockType) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType.type,
      content: { ...blockType.defaultContent }
    };
    
    setTemplate(prev => ({
      ...prev,
      design_json: {
        ...prev.design_json,
        blocks: [...prev.design_json.blocks, newBlock]
      }
    }));
  };

  const addBlockAtPosition = (blockType, position) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType.type,
      content: { ...blockType.defaultContent }
    };
    
    setTemplate(prev => {
      const newBlocks = [...prev.design_json.blocks];
      newBlocks.splice(position, 0, newBlock);
      return {
        ...prev,
        design_json: {
          ...prev.design_json,
          blocks: newBlocks
        }
      };
    });
  };

  const moveBlockUp = (index) => {
    if (index === 0) return;
    
    setTemplate(prev => {
      const newBlocks = [...prev.design_json.blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      return {
        ...prev,
        design_json: {
          ...prev.design_json,
          blocks: newBlocks
        }
      };
    });
  };

  const moveBlockDown = (index) => {
    if (index === template.design_json.blocks.length - 1) return;
    
    setTemplate(prev => {
      const newBlocks = [...prev.design_json.blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      return {
        ...prev,
        design_json: {
          ...prev.design_json,
          blocks: newBlocks
        }
      };
    });
  };

  const duplicateBlock = (index) => {
    const blockToDuplicate = template.design_json.blocks[index];
    const newBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setTemplate(prev => {
      const newBlocks = [...prev.design_json.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return {
        ...prev,
        design_json: {
          ...prev.design_json,
          blocks: newBlocks
        }
      };
    });
  };

  const deleteBlock = (index) => {
    setTemplate(prev => ({
      ...prev,
      design_json: {
        ...prev.design_json,
        blocks: prev.design_json.blocks.filter((_, i) => i !== index)
      }
    }));
  };

  // Block Rendering Function
  const renderBlock = (block) => {
    switch (block.type) {
      case 'header':
        return (
          <div
            style={{
              backgroundColor: block.content.backgroundColor || '#f9fafb',
              backgroundImage: block.content.backgroundImage,
              padding: block.content.padding || '20px',
              textAlign: block.content.textAlign || 'center'
            }}
          >
            {/* Main Title */}
            <div
              style={{
                color: block.content.color || '#1f2937',
                fontSize: block.content.fontSize || '24px',
                fontWeight: block.content.fontWeight || 'bold',
                marginBottom: block.content.subtitle ? '10px' : '0'
              }}
            >
              {block.content.title || block.content.text || 'Header Text'}
            </div>
            
            {/* Subtitle if it exists */}
            {block.content.subtitle && (
              <div
                style={{
                  color: block.content.subtitleColor || block.content.color || '#6b7280',
                  fontSize: '18px',
                  fontWeight: 'normal',
                  opacity: '0.9'
                }}
              >
                {block.content.subtitle}
              </div>
            )}
          </div>
        );
      
      case 'text':
        return (
          <div
            style={{
              backgroundColor: block.content.backgroundColor || '#ffffff',
              color: block.content.color || '#374151',
              fontSize: block.content.fontSize || '16px',
              fontWeight: block.content.fontWeight || 'normal',
              textAlign: block.content.textAlign || 'left',
              padding: block.content.padding || '15px',
              lineHeight: '1.6'
            }}
          >
            {block.content.text?.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            )) || 'Text content'}
          </div>
        );
      
      case 'image':
        return (
          <div style={{ textAlign: block.content.textAlign || 'center', padding: block.content.padding || '15px' }}>
            <img
              src={block.content.src || 'https://via.placeholder.com/600x300?text=Add+Your+Image'}
              alt={block.content.alt || 'Email Image'}
              style={{ width: block.content.width || '100%', maxWidth: '100%', height: 'auto' }}
            />
          </div>
        );
      
      case 'button':
        return (
          <div style={{ textAlign: block.content.textAlign || 'center', padding: '20px' }}>
            <button
              style={{
                backgroundColor: block.content.backgroundColor || '#3b82f6',
                color: block.content.color || '#ffffff',
                padding: block.content.padding || '12px 24px',
                borderRadius: block.content.borderRadius || '6px',
                fontSize: block.content.fontSize || '16px',
                fontWeight: block.content.fontWeight || '600',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {block.content.text || 'Click Here'}
            </button>
          </div>
        );
      
      case 'donation':
        const progressPercentage = (block.content.currentAmount / block.content.goalAmount) * 100;
        return (
          <div
            style={{
              backgroundColor: block.content.backgroundColor || '#f0f9ff',
              padding: block.content.padding || '20px',
              borderRadius: '8px'
            }}
          >
            <h3 style={{ color: block.content.titleColor || '#1e40af', marginBottom: '10px' }}>
              {block.content.title || 'Support Our Cause'}
            </h3>
            <p style={{ color: block.content.textColor || '#374151', marginBottom: '15px' }}>
              {block.content.description || 'Help us reach our goal'}
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Raised: ${block.content.currentAmount?.toLocaleString() || '0'}</span>
                <span>Goal: ${block.content.goalAmount?.toLocaleString() || '10,000'}</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                <div
                  style={{
                    width: `${Math.min(progressPercentage, 100)}%`,
                    backgroundColor: block.content.progressColor || '#3b82f6',
                    height: '8px',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                ></div>
              </div>
            </div>
            
            <button
              style={{
                backgroundColor: block.content.buttonColor || '#3b82f6',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {block.content.buttonText || 'Donate Now'}
            </button>
          </div>
        );
      
      default:
        return (
          <div style={{ padding: '20px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
            </div>
            <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '5px' }}>
              Content will be rendered here
            </div>
          </div>
        );
    }
  };

  const designElementCategories = [
    { id: 'basic', name: 'Basic Content', icon: Bars3Icon, color: 'blue-500' },
    { id: 'design', name: 'Design & Pizzazz', icon: PaintBrushIcon, color: 'purple-500' },
    { id: 'fundraising', name: 'Fundraising', icon: GiftIcon, color: 'green-500' },
    { id: 'events', name: 'Events', icon: CalendarIcon, color: 'orange-500' },
    { id: 'volunteers', name: 'Volunteers', icon: UserGroupIcon, color: 'indigo-500' },
    { id: 'announcements', name: 'Announcements', icon: MegaphoneIcon, color: 'red-500' },
    { id: 'interactive', name: 'Interactive', icon: HeartIcon, color: 'pink-500' },
    { id: 'academic', name: 'Academic', icon: AcademicCapIcon, color: 'teal-500' },
  ];

  const professionalTemplates = [
    {
      id: 'pro-parent-teacher-conference-chalkboard',
      name: 'Parent-Teacher Conference - Chalkboard Theme',
      category: 'events',
      style: 'educational-classic',
      description: 'Professional chalkboard design with educational motifs and elegant typography',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMmQzNzQ4Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TsiBQQVJFTlQtVEVBQ0hFUjwvdGV4dD4KPHR5ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q09ORkVSRU5DRVMg8J+TsjwvdGV4dD4KPHR5ZXh0IHg9IjEwMCIgeT0iOTAiIGZpbGw9IiNiZWUzZjgiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkpvaW4gdXMgZm9yIG1lYW5pbmdmdWwgY29udmVyc2F0aW9uczwvdGV4dD4KPHR5ZXh0IHg9IjEwMCIgeT0iMTEwIiBmaWxsPSIjYmVlM2Y4IiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5hYm91dCB5b3VyIGNoaWxkJ3MgYWNhZGVtaWMgcHJvZ3Jlc3M8L3RleHQ+Cjwvc3ZnPgo=',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '📚 PARENT-TEACHER CONFERENCES 📚', 
            backgroundColor: '#2d3748', 
            backgroundImage: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
            color: '#ffffff', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            padding: '40px 20px', 
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: 'Dear Parents & Guardians,\n\nJoin us for meaningful conversations about your child\'s academic progress and future goals. Our dedicated teachers are excited to share insights and collaborate with you.', 
            padding: '30px 25px', 
            fontSize: '16px', 
            textAlign: 'left',
            color: '#2d3748',
            lineHeight: '1.6',
            backgroundColor: '#f7fafc'
          } 
        },
        { 
          type: 'event', 
          content: { 
            title: 'Conference Details', 
            date: '2024-11-20', 
            time: '3:00 PM - 8:00 PM', 
            location: 'Individual Classrooms', 
            description: 'Schedule your 15-minute session with your child\'s teacher',
            backgroundColor: '#edf2f7',
            titleColor: '#2d3748',
            textColor: '#4a5568',
            buttonText: 'Schedule Your Conference',
            buttonColor: '#3182ce',
            padding: '25px'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '🎯 What to Expect', 
            text: '• Academic progress review\n• Goal setting for the semester\n• Questions & discussion time\n• Resource recommendations', 
            backgroundColor: '#bee3f8', 
            titleColor: '#2c5282', 
            textColor: '#2a4365', 
            borderColor: '#3182ce', 
            padding: '20px', 
            borderRadius: '8px' 
          } 
        }
      ]
    },
    {
      id: 'pro-science-fair-notebook',
      name: 'Science Fair - Notebook Paper Style',
      category: 'events',
      style: 'notebook-academic',
      description: 'Notebook paper texture with scientific elements and playful academic design',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNlNWU3ZWIiLz4KPGxpbmUgeDE9IjIwIiB5MT0iMzAiIHgyPSIxODAiIHkyPSIzMCIgc3Ryb2tlPSIjYTJmIiBzdHJva2Utd2lkdGg9IjEiLz4KPGxpbmUgeDE9IjIwIiB5MT0iNTAiIHgyPSIxODAiIHkyPSI1MCIgc3Ryb2tlPSIjYTJmIiBzdHJva2Utd2lkdGg9IjEiLz4KPGxpbmUgeDE9IjIwIiB5MT0iNzAiIHgyPSIxODAiIHkyPSI3MCIgc3Ryb2tlPSIjYTJmIiBzdHJva2Utd2lkdGg9IjEiLz4KPGxpbmUgeDE9IjIwIiB5MT0iOTAiIHgyPSIxODAiIHkyPSI5MCIgc3Ryb2tlPSIjYTJmIiBzdHJva2Utd2lkdGg9IjEiLz4KPGxpbmUgeDE9IjIwIiB5MT0iMTEwIiB4Mj0iMTgwIiB5Mj0iMTEwIiBzdHJva2U9IiNhMmYiIHN0cm9rZS13aWR0aD0iMSIvPgo8dGV4dCB4PSIxMDAiIHk9IjIwIiBmaWxsPSIjMWEzNjVkIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+UrCBTQ0lFTkNFIEZBSVIg8J+UrDwvdGV4dD4KPHR5ZXh0IHg9IjMwIiB5PSI0NSIgZmlsbD0iIzJkMzc0OCIgZm9udC1zaXplPSI4Ij5DYWxsaW5nIGFsbCB5b3VuZyBzY2llbnRpc3RzITwvdGV4dD4KPHR5ZXh0IHg9IjMwIiB5PSI2NSIgZmlsbD0iIzJkMzc0OCIgZm9udC1zaXplPSI4Ij5TaG93Y2FzZSB5b3VyIGFtYXppbmcgZGlzY292ZXJpZXM8L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSI4NSIgZmlsbD0iIzJkMzc0OCIgZm9udC1zaXplPSI4Ij5hbmQgZXhwZXJpbWVudHMgYXQgb3VyIGZhaXI8L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSIxMDUiIGZpbGw9IiMyZDM3NDgiIGZvbnQtc2l6ZT0iOCI+RnJvbSB2b2xjYW5vZXMgdG8gcm9ib3RpY3M8L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSIxMjUiIGZpbGw9IiMyZDM3NDgiIGZvbnQtc2l6ZT0iOCI+ZXZlcnkgcHJvamVjdCB0ZWxscyBhIHN0b3J5PC90ZXh0Pgo8L3N2Zz4K',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🔬 ANNUAL SCIENCE FAIR 🔬', 
            backgroundColor: '#ffffff', 
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 24px, #a2f 25px)',
            color: '#1a365d', 
            fontSize: '36px', 
            fontWeight: 'bold', 
            padding: '50px 20px 30px', 
            textAlign: 'center',
            borderLeft: '3px solid #e53e3e'
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: 'Calling all young scientists! 🧪\n\nShowcase your amazing discoveries and experiments at our annual Science Fair. From volcanoes to robotics, every project tells a story of curiosity and learning.', 
            padding: '20px 30px', 
            fontSize: '16px', 
            textAlign: 'left',
            color: '#2d3748',
            backgroundColor: '#f7fafc',
            borderLeft: '4px solid #4299e1'
          } 
        },
        { 
          type: 'stats', 
          content: { 
            title: '📊 Last Year\'s Amazing Results', 
            stats: [
              { number: '150+', label: 'Student Projects' },
              { number: '25', label: 'Categories' },
              { number: '500+', label: 'Visitors' }
            ],
            backgroundColor: '#ebf8ff',
            titleColor: '#2c5282',
            numberColor: '#3182ce',
            labelColor: '#4a5568',
            padding: '25px'
          } 
        },
        { 
          type: 'button', 
          content: { 
            text: '🚀 Register Your Project', 
            backgroundColor: '#38a169', 
            color: '#ffffff', 
            textAlign: 'center', 
            padding: '15px 30px', 
            borderRadius: '25px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(56, 161, 105, 0.3)'
          } 
        }
      ]
    },
    // Adding 10 more professional templates to reach our goal
    {
      id: 'pro-book-fair-literary',
      name: 'Book Fair - Literary Adventure',
      category: 'events',
      style: 'literary-themed',
      description: 'Enchanting book-themed design with literary elements and reading motifs',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjN2MyZDEyIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMzAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TsiBCT09LIEZBSVIg8J+TsjwvdGV4dD4KPHR5ZXh0IHg9IjEwMCIgeT0iNTAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RVhUUkFWQUdBTlpBPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9Ijc1IiBmaWxsPSIjZmVmN2VkIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OWIERpc2NvdmVyIE5ldyBXb3JsZHMg8J+TljwvdGV4dD4KPHR5ZXh0IHg9IjEwMCIgeT0iOTUiIGZpbGw9IiNmZWY3ZWQiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRocm91Z2ggUmVhZGluZyE8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTIwIiBmaWxsPSIjZWNmZGY1IiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJyb3dzZSB0aG91c2FuZHMgb2YgYm9va3M8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTM1IiBmaWxsPSIjZWNmZGY1IiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPm1lZXQgYXV0aG9ycywgYW5kIGVtYmFyayBvbiBhZHZlbnR1cmVzPC90ZXh0Pgo8L3N2Zz4K',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '📚 ANNUAL BOOK FAIR EXTRAVAGANZA 📚', 
            backgroundColor: '#7c2d12', 
            backgroundImage: 'linear-gradient(135deg, #7c2d12 0%, #a16207 100%)',
            color: '#ffffff', 
            fontSize: '30px', 
            fontWeight: 'bold', 
            padding: '40px 20px', 
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: '📖 Discover New Worlds Through Reading! 📖\n\nJoin us for our magical Book Fair where stories come alive! Browse thousands of books, meet authors, and embark on literary adventures that will spark imagination and foster a lifelong love of reading.', 
            padding: '30px 25px', 
            fontSize: '16px', 
            textAlign: 'center',
            color: '#7c2d12',
            backgroundColor: '#fef7ed',
            lineHeight: '1.6'
          } 
        },
        { 
          type: 'stats', 
          content: { 
            title: '📊 Amazing Book Collection', 
            stats: [
              { number: '2,500+', label: 'Books Available' },
              { number: '50+', label: 'Authors Featured' },
              { number: '15', label: 'Reading Levels' }
            ],
            backgroundColor: '#fff7ed',
            titleColor: '#9a3412',
            numberColor: '#ea580c',
            labelColor: '#7c2d12',
            padding: '25px'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '🎁 Special Book Fair Features', 
            text: '• Author meet & greet sessions\n• Interactive storytelling corner\n• Book recommendation station\n• Reading challenge kickoff\n• Special discounts for families', 
            backgroundColor: '#ecfdf5', 
            titleColor: '#14532d', 
            textColor: '#166534', 
            borderColor: '#22c55e', 
            padding: '25px', 
            borderRadius: '8px' 
          } 
        }
      ]
    },
    {
      id: 'pro-art-showcase-creative',
      name: 'Art Showcase - Creative Expression',
      category: 'events',
      style: 'artistic-vibrant',
      description: 'Colorful, artistic design celebrating student creativity and artistic expression',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjYzAyNmQzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMzAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OqCBTVFVERU5UIEFSVCBTSE9XQ0FTRSAyMDI0IPCfjqg8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4yIIENlbGVicmF0aW5nIFlvdW5nIEFydGlzdHMhIPCfjIg8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iOTAiIGZpbGw9IiNmZWYzYzciIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXhwZXJpZW5jZSB0aGUgaW5jcmVkaWJsZSBjcmVhdGl2aXR5PC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZmlsbD0iI2ZlZjNjNyIgZm9udC1zaXplPSI4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5vZiBvdXIgc3R1ZGVudHMgYXQgdGhpcyB5ZWFyJ3MgQXJ0IFNob3djYXNlPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjEzMCIgZmlsbD0iI2ZlZjNjNyIgZm9udC1zaXplPSI4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Gcm9tIHBhaW50aW5ncyB0byBzY3VscHR1cmVzPC90ZXh0Pgo8L3N2Zz4K',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🎨 STUDENT ART SHOWCASE 2024 🎨', 
            backgroundColor: '#c026d3', 
            backgroundImage: 'linear-gradient(45deg, #c026d3 0%, #f59e0b 25%, #10b981 50%, #3b82f6 75%, #c026d3 100%)',
            color: '#ffffff', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            padding: '45px 20px', 
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: '🌈 Celebrating Young Artists! 🌈\n\nExperience the incredible creativity of our students at this year\'s Art Showcase. From paintings to sculptures, digital art to photography, witness the amazing talent and imagination of our young artists.', 
            padding: '25px', 
            fontSize: '17px', 
            textAlign: 'center',
            color: '#1f2937',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            margin: '20px'
          } 
        },
        { 
          type: 'achievement', 
          content: { 
            title: '🏆 Featured Art Categories', 
            achievements: [
              'Painting & Drawing Masterpieces',
              'Sculpture & 3D Art Creations',
              'Digital Art & Photography',
              'Mixed Media Innovations',
              'Collaborative Class Projects'
            ],
            backgroundColor: '#f0f9ff',
            titleColor: '#1e40af',
            textColor: '#1e3a8a',
            padding: '25px'
          } 
        },
        { 
          type: 'event', 
          content: { 
            title: 'Opening Reception & Awards Ceremony', 
            date: '2024-12-05', 
            time: '6:00 PM - 8:00 PM', 
            location: 'School Gymnasium & Art Hallways', 
            description: 'Join us for refreshments and the presentation of special recognition awards',
            backgroundColor: '#fdf4ff',
            titleColor: '#86198f',
            textColor: '#a21caf',
            buttonText: '🎨 RSVP for Reception',
            buttonColor: '#c026d3',
            padding: '25px'
          } 
        }
      ]
    },
    // Adding more professional templates to reach 40+ total
    {
      id: 'pro-fundraising-gala',
      name: 'Annual Fundraising Gala',
      category: 'fundraising',
      style: 'elegant-formal',
      description: 'Sophisticated black-tie event invitation with elegant design elements',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMWEyMDJjIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMzAiIGZpbGw9ImdvbGQiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+GIEFOTlVBTCBGVU5EUkFJU0lORyBHQUxBIPCfj4Y8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZpbGw9ImdvbGQiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFuIEVsZWdhbnQgRXZlbmluZyBvZiBHaXZpbmc8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iOTAiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Sm9pbiB1cyBmb3IgYSBtYWdpY2FsIGV2ZW5pbmcgb2YgZGluaW5nLCBkYW5jaW5nPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZmlsbD0iI2ZmZmZmZiIgZm9udC1zaXplPSI4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5hbmQgc3VwcG9ydGluZyBvdXIgc2Nob29sIGNvbW11bml0eTwvdGV4dD4KPHR5ZXh0IHg9IjEwMCIgeT0iMTMwIiBmaWxsPSJnb2xkIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJsYWNrLVRpZSBPcHRpb25hbDwvdGV4dD4KPC9zdmc+Cg==',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🏆 ANNUAL FUNDRAISING GALA 🏆', 
            backgroundColor: '#1a202c', 
            backgroundImage: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
            color: 'gold', 
            fontSize: '34px', 
            fontWeight: 'bold', 
            padding: '50px 20px', 
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: '✨ An Elegant Evening of Giving ✨\n\nJoin us for a magical evening of dining, dancing, and supporting our school community. This black-tie optional event will feature gourmet cuisine, live entertainment, and inspiring stories of student success.', 
            padding: '30px', 
            fontSize: '17px', 
            textAlign: 'center',
            color: '#1a202c',
            backgroundColor: '#f7fafc',
            lineHeight: '1.7'
          } 
        },
        { 
          type: 'donation', 
          content: { 
            title: '🎯 Our Fundraising Goal', 
            description: 'Help us raise funds for new technology and learning resources',
            currentAmount: 45000,
            goalAmount: 75000,
            backgroundColor: '#fef3c7',
            titleColor: '#92400e',
            textColor: '#78350f',
            progressColor: '#f59e0b',
            buttonText: '💳 Purchase Tickets',
            buttonColor: '#d97706',
            padding: '25px'
          } 
        },
        { 
          type: 'event', 
          content: { 
            title: 'Gala Details', 
            date: '2024-11-30', 
            time: '6:00 PM - 11:00 PM', 
            location: 'Grand Ballroom, Downtown Hotel', 
            description: 'Cocktail hour, dinner, silent auction, and dancing',
            backgroundColor: '#f8fafc',
            titleColor: '#1e293b',
            textColor: '#475569',
            buttonText: '🎫 Reserve Your Table',
            buttonColor: '#1e293b',
            padding: '25px'
          } 
        }
      ]
    },
    {
      id: 'pro-volunteer-appreciation',
      name: 'Volunteer Appreciation Dinner',
      category: 'volunteers',
      style: 'warm-gratitude',
      description: 'Heartwarming design to thank and celebrate dedicated volunteers',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZWNmZGY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMzAiIGZpbGw9IiMxNjUzNGQiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OKIE9VUiBBTUFaSU5HIFZPTFVOVEVFUlMg8J+TojwvdGV4dD4KPHR5ZXh0IHg9IjEwMCIgeT0iNTAiIGZpbGw9IiMxNjUzNGQiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFwcHJlY2lhdGlvbiBEaW5uZXI8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZpbGw9IiMxNjUzNGQiIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGhhbmsgeW91IGZvciB5b3VyIGRlZGljYXRpb248L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmaWxsPSIjMTY1MzRkIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmFuZCBjb21taXRtZW50IHRvIG91ciBzY2hvb2w8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTIwIiBmaWxsPSIjMTY1MzRkIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPllvdSBtYWtlIGEgZGlmZmVyZW5jZSE8L3RleHQ+Cjwvc3ZnPgo=',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🙏 CELEBRATING OUR AMAZING VOLUNTEERS 🙏', 
            backgroundColor: '#ecfdf5', 
            backgroundImage: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            color: '#14532d', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            padding: '40px 20px', 
            textAlign: 'center'
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: '💚 Thank You for Your Dedication! 💚\n\nYour countless hours of service, unwavering commitment, and generous spirit have made an incredible impact on our school community. This special evening is our way of saying thank you for all that you do.', 
            padding: '25px', 
            fontSize: '16px', 
            textAlign: 'center',
            color: '#14532d',
            backgroundColor: '#f0fdf4',
            lineHeight: '1.6'
          } 
        },
        { 
          type: 'stats', 
          content: { 
            title: '📊 Your Amazing Impact This Year', 
            stats: [
              { number: '2,500+', label: 'Volunteer Hours' },
              { number: '150', label: 'Active Volunteers' },
              { number: '50+', label: 'Events Supported' }
            ],
            backgroundColor: '#f0fdf4',
            titleColor: '#166534',
            numberColor: '#16a34a',
            labelColor: '#15803d',
            padding: '25px'
          } 
        },
        { 
          type: 'event', 
          content: { 
            title: 'Appreciation Dinner Details', 
            date: '2024-12-15', 
            time: '6:00 PM - 9:00 PM', 
            location: 'School Cafeteria (Beautifully Decorated!)', 
            description: 'Dinner, recognition ceremony, and heartfelt thanks',
            backgroundColor: '#ecfdf5',
            titleColor: '#14532d',
            textColor: '#166534',
            buttonText: '✅ Confirm Attendance',
            buttonColor: '#16a34a',
            padding: '25px'
          } 
        }
      ]
    },
    {
      id: 'pro-spring-carnival',
      name: 'Spring Carnival Extravaganza',
      category: 'events',
      style: 'festive-colorful',
      description: 'Vibrant, fun-filled design perfect for spring carnival celebrations',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZmVmM2M3Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMjUiIGZpbGw9IiNkOTc3MDYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn46gIFNQUklORyBDQVJOSVZBTCDwn46gPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjQ1IiBmaWxsPSIjZDk3NzA2IiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RVhUUkFWQUdBTlpBPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjcwIiBmaWxsPSIjOTI0MDA5IiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn46qIEZ1biwgRm9vZCAmIEZhbWlseSBGdW4hIPCfjqo8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iOTUiIGZpbGw9IiM5MjQwMDkiIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R2FtZXMsIHByaXplcywgZGVsaWNpb3VzIGZvb2Q8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTE1IiBmaWxsPSIjOTI0MDA5IiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmFuZCBtZW1vcmllcyB0byBsYXN0IGEgbGlmZXRpbWU8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTM1IiBmaWxsPSIjZDk3NzA2IiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJyaW5nIHRoZSB3aG9sZSBmYW1pbHkhPC90ZXh0Pgo8L3N2Zz4K',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🎠 SPRING CARNIVAL EXTRAVAGANZA 🎠', 
            backgroundColor: '#fef3c7', 
            backgroundImage: 'linear-gradient(45deg, #fef3c7 0%, #fed7aa 25%, #fecaca 50%, #ddd6fe 75%, #fef3c7 100%)',
            color: '#d97706', 
            fontSize: '30px', 
            fontWeight: 'bold', 
            padding: '45px 20px', 
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: '🎪 Fun, Food & Family Fun! 🎪\n\nStep right up to the most exciting event of the year! Our Spring Carnival features thrilling games, delicious food, amazing prizes, and memories to last a lifetime. Bring the whole family for a day of pure joy and community celebration!', 
            padding: '25px', 
            fontSize: '16px', 
            textAlign: 'center',
            color: '#92400e',
            backgroundColor: '#fffbeb',
            lineHeight: '1.6'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '🎯 Carnival Attractions', 
            text: '• Ring Toss & Duck Pond Games\n• Face Painting & Balloon Artists\n• Bounce Houses & Obstacle Course\n• Cotton Candy & Popcorn Stands\n• Prize Wheel & Photo Booth\n• Live Music & Entertainment', 
            backgroundColor: '#fef2f2', 
            titleColor: '#dc2626', 
            textColor: '#991b1b', 
            borderColor: '#f87171', 
            padding: '25px', 
            borderRadius: '12px' 
          } 
        },
        { 
          type: 'event', 
          content: { 
            title: 'Carnival Information', 
            date: '2024-05-18', 
            time: '11:00 AM - 4:00 PM', 
            location: 'School Playground & Gymnasium', 
            description: 'Rain or shine - indoor backup plan ready!',
            backgroundColor: '#f0f9ff',
            titleColor: '#1e40af',
            textColor: '#1e3a8a',
            buttonText: '🎫 Get Your Wristbands',
            buttonColor: '#2563eb',
            padding: '25px'
          } 
        }
      ]
    }
  ];

  const basicTemplates = [
    {
      id: 'basic-summer-school',
      name: 'Summer School Enrollment',
      category: 'events',
      style: 'energetic',
      description: 'A vibrant, engaging template for summer school enrollment.',
      blocks: [
        { type: 'header', content: { text: '☀️ EDUCARE SUMMER SCHOOL ☀️', backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '28px', fontWeight: 'bold', padding: '20px', textAlign: 'center' } },
        { type: 'image', content: { src: 'https://via.placeholder.com/600x300?text=Kids+Learning+&+Playing', alt: 'Kids learning and playing' } },
        { type: 'text', content: { text: 'Join us for an exciting summer of learning, creativity, and fun! Our summer program offers a variety of courses to spark your child\'s curiosity.', padding: '20px', fontSize: '16px', textAlign: 'center' } },
        { type: 'button', content: { text: 'Enroll Now!', backgroundColor: '#16a34a', color: '#ffffff', textAlign: 'center', padding: '15px 30px', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold' } },
        { type: 'divider', content: { style: 'dashed', color: '#e5e7eb', thickness: '2px', width: '80%', margin: '20px auto' } },
        { type: 'highlight', content: { title: 'Featured Courses', text: 'Art Exploration, STEM Adventures, Creative Writing, and Outdoor Sports.', backgroundColor: '#f0f9ff', titleColor: '#1e40af', textColor: '#1e3a8a', borderColor: '#93c5fd', padding: '20px', borderRadius: '8px' } },
      ]
    },
    {
      id: 'basic-back-to-school',
      name: 'Back to School Bash',
      category: 'events',
      style: 'playful',
      description: 'A fun and colorful template for a back-to-school event.',
      blocks: [
        { type: 'header', content: { text: 'Countdown to the Ultimate', fontSize: '24px', color: '#4f46e5', textAlign: 'center', padding: '20px 20px 0' } },
        { type: 'header', content: { text: 'BACK TO SCHOOL BASH!', fontSize: '48px', fontWeight: 'bold', color: '#4f46e5', textAlign: 'center', padding: '0 20px 20px' } },
        { type: 'image', content: { src: 'https://via.placeholder.com/600x250?text=Students+with+Backpacks', alt: 'Students with backpacks' } },
        { type: 'countdown', content: { title: 'The Bash Begins In:', eventDate: '2024-08-20', backgroundColor: '#fefce8', titleColor: '#ca8a04', numberColor: '#facc15', labelColor: '#a16207', padding: '25px' } },
        { type: 'text', content: { text: 'Join us for a day of fun, games, and free school supplies to kick off the new school year!', padding: '20px', fontSize: '16px', textAlign: 'center' } },
        { type: 'button', content: { text: 'I\'m Coming!', backgroundColor: '#f97316', color: '#ffffff', textAlign: 'center', padding: '15px 30px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' } },
      ]
    },
    {
      id: 'basic-announcement',
      name: 'Simple Announcement',
      category: 'announcements',
      style: 'basic',
      description: 'A clean, simple announcement template.',
      blocks: [
        { type: 'header', content: { text: 'Announcement Title' } },
        { type: 'text', content: { text: 'Your message here.' } },
        { type: 'button', content: { text: 'Learn More' } }
      ]
    },
    {
      id: 'basic-event',
      name: 'Basic Event',
      category: 'events',
      style: 'basic',
      description: 'A basic template for event invitations.',
      blocks: [
        { type: 'header', content: { text: 'Event Name' } },
        { type: 'event', content: { title: 'Event Details' } }
      ]
    },
    {
      id: 'basic-newsletter',
      name: 'Basic Newsletter',
      category: 'newsletters',
      style: 'basic',
      description: 'A simple newsletter layout.',
      blocks: [
        { type: 'header', content: { text: 'Our Newsletter' } },
        { type: 'text', content: { text: 'A few updates for you.' } },
        { type: 'divider', content: {} },
        { type: 'text', content: { text: 'Another news item.' } },
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
    console.log('🔍 DEBUG: Template selected:', selectedTemplate);
    
    try {
      // Validate template structure
      if (!selectedTemplate || typeof selectedTemplate !== 'object') {
        console.error('❌ DEBUG: Invalid template object:', selectedTemplate);
        alert('Error: Invalid template data received');
        return;
      }

      if (!selectedTemplate.blocks || !Array.isArray(selectedTemplate.blocks)) {
        console.error('❌ DEBUG: Template missing blocks array:', selectedTemplate);
        alert('Error: Template has no blocks to convert');
        return;
      }

      console.log('✅ DEBUG: Template validation passed, converting blocks...');
      
      // Convert template blocks to our format - handle ALL blocks from the template
      const convertedBlocks = [];
      
      selectedTemplate.blocks.forEach((block, index) => {
        console.log(`🔄 DEBUG: Converting block ${index}:`, block);
        
        try {
          const blockId = `${Date.now()}-${index}`;
          
          // Validate block structure
          if (!block || typeof block !== 'object' || !block.type) {
            console.warn(`⚠️ DEBUG: Invalid block at index ${index}:`, block);
            return; // Skip invalid blocks
          }

          if (!block.content || typeof block.content !== 'object') {
            console.warn(`⚠️ DEBUG: Block missing content at index ${index}:`, block);
            return; // Skip blocks without content
          }
          
          // Convert different block types to our standard format
          if (block.type === 'hero') {
            console.log('🎨 DEBUG: Converting hero block');
            // Combine title and subtitle into a single header block
            let headerText = block.content.title || 'Hero Title';
            if (block.content.subtitle) {
              headerText += `\n${block.content.subtitle}`;
            }
            
            convertedBlocks.push({
              id: blockId,
              type: 'header',
              content: {
                text: headerText,
                title: block.content.title || 'Hero Title',
                subtitle: block.content.subtitle || '',
                fontSize: '32px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: block.content.titleColor || '#ffffff',
                subtitleColor: block.content.subtitleColor || '#ffffff',
                backgroundImage: block.content.backgroundImage || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                backgroundColor: block.content.backgroundColor || '#3b82f6',
                padding: '40px'
              }
            });
          } else if (block.type === 'header') {
            console.log('📝 DEBUG: Converting header block');
            convertedBlocks.push({
              id: blockId,
              type: 'header',
              content: {
                text: block.content.text || 'Header Text',
                fontSize: block.content.fontSize || '24px',
                fontWeight: block.content.fontWeight || 'bold',
                textAlign: block.content.textAlign || 'center',
                color: block.content.color || '#1f2937',
                backgroundColor: block.content.backgroundColor || '#f9fafb',
                padding: block.content.padding || '20px'
              }
            });
          } else if (block.type === 'text') {
            console.log('📄 DEBUG: Converting text block');
            convertedBlocks.push({
              id: blockId,
              type: 'text',
              content: {
                text: block.content.text || 'Text content',
                fontSize: block.content.fontSize || '16px',
                fontWeight: block.content.fontWeight || 'normal',
                textAlign: block.content.textAlign || 'left',
                color: block.content.color || '#374151',
                backgroundColor: block.content.backgroundColor || '#ffffff',
                padding: block.content.padding || '15px'
              }
            });
          } else if (block.type === 'calendar') {
            console.log('📅 DEBUG: Converting calendar block');
            // Convert calendar block to proper format
            const calendarContent = {
              title: block.content.eventTitle || 'Upcoming Events',
              backgroundColor: block.content.backgroundColor || '#fef3c7',
              titleColor: block.content.textColor || '#92400e',
              textColor: block.content.textColor || '#92400e',
              padding: '20px',
              events: [{
                title: block.content.eventTitle || 'Event',
                date: block.content.eventDate ? (() => {
                  try {
                    return new Date(block.content.eventDate).toLocaleDateString();
                  } catch (e) {
                    console.warn('⚠️ DEBUG: Invalid date format:', block.content.eventDate);
                    return 'TBD';
                  }
                })() : 'TBD',
                time: block.content.eventTime || '',
                location: block.content.location || '',
                description: block.content.description || ''
              }]
            };
            
            convertedBlocks.push({
              id: blockId,
              type: 'calendar',
              content: calendarContent
            });
          } else if (block.type === 'donation') {
            console.log('💰 DEBUG: Converting donation block');
            // Ensure donation block has required fields
            const donationContent = {
              title: block.content.title || 'Support Our Cause',
              description: block.content.description || 'Help us reach our goal',
              currentAmount: Number(block.content.currentAmount) || 0,
              goalAmount: Number(block.content.goalAmount) || 10000,
              backgroundColor: block.content.backgroundColor || '#f0f9ff',
              titleColor: block.content.titleColor || '#1e40af',
              textColor: block.content.textColor || '#374151',
              progressColor: block.content.progressColor || '#3b82f6',
              buttonText: block.content.buttonText || 'Donate Now',
              buttonColor: block.content.buttonColor || '#3b82f6',
              padding: block.content.padding || '20px'
            };
            
            convertedBlocks.push({
              id: blockId,
              type: 'donation',
              content: donationContent
            });
          } else {
            console.log(`🔧 DEBUG: Converting generic block type: ${block.type}`);
            // Default handling for any other block types
            const safeContent = {};
            
            // Safely copy content properties
            Object.keys(block.content).forEach(key => {
              try {
                const value = block.content[key];
                // Only copy serializable values
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
                  safeContent[key] = value;
                }
              } catch (e) {
                console.warn(`⚠️ DEBUG: Skipping non-serializable property ${key}:`, e);
              }
            });
            
            convertedBlocks.push({
              id: blockId,
              type: block.type,
              content: safeContent
            });
          }
          
          console.log(`✅ DEBUG: Successfully converted block ${index}`);
        } catch (blockError) {
          console.error(`❌ DEBUG: Error converting block ${index}:`, blockError);
          console.error('Block data:', block);
        }
      });

      console.log(`✅ DEBUG: Conversion complete. ${convertedBlocks.length} blocks converted:`, convertedBlocks);

      // Create the new template object
      const newTemplate = {
        name: selectedTemplate.name || 'New Template',
        category: selectedTemplate.category || 'general',
        subject: `${selectedTemplate.name || 'Template'} - ${new Date().toLocaleDateString()}`,
        design_json: {
          blocks: convertedBlocks,
          styles: {
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            primaryColor: '#3b82f6',
            secondaryColor: '#6b7280'
          }
        }
      };

      console.log('🎯 DEBUG: Final template object:', newTemplate);

      // Update the template with the selected template data
      setTemplate(prev => ({
        ...prev,
        ...newTemplate
      }));
      
      setShowTemplateLibrary(false);
      
      console.log('✅ DEBUG: Template selection completed successfully');
      
    } catch (error) {
      console.error('❌ DEBUG: Critical error in handleTemplateSelect:', error);
      console.error('Error stack:', error.stack);
      console.error('Template data that caused error:', selectedTemplate);
      alert(`Error applying template: ${error.message}`);
    }
  };

  // Rest of the component implementation would go here...
  // For now, let's add a basic render method to complete the component

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
            
            {/* Unified Builder Mode Selector */}
            <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
              {Object.entries(builderModes).map(([modeKey, mode]) => (
                <button
                  key={modeKey}
                  onClick={() => setBuilderMode(modeKey)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-1 ${
                    builderMode === modeKey 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={mode.description}
                >
                  <span className="text-base">{mode.icon}</span>
                  <span className="hidden sm:inline">{mode.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Prominent Templates Button */}
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
            >
              <StarIcon className="h-5 w-5" />
              <span>Templates</span>
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={() => onSave?.(template)}
              disabled={saving || !template.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Design Elements Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
              Design Elements
            </h3>
            <p className="text-sm text-gray-600">Drag blocks to canvas or use Template Library</p>
          </div>

          {/* Design Element Categories */}
          <div className="space-y-2">
            {designElementCategories.map((category) => {
              const categoryBlocks = blockTypes.filter(block => block.category === category.id);
              const isCollapsed = collapsedCategories[category.id];
              const CategoryIcon = category.icon;

              return (
                <div key={category.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className={`h-4 w-4 text-${category.color}`} />
                      <span className="font-medium text-gray-900 text-sm">{category.name}</span>
                      <span className="text-xs text-gray-500">({categoryBlocks.length})</span>
                    </div>
                    <ChevronDownIcon 
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        isCollapsed ? '' : 'rotate-180'
                      }`} 
                    />
                  </button>
                  
                  {!isCollapsed && (
                    <div className="px-3 pb-3 space-y-2">
                      {categoryBlocks.map((block) => {
                        const BlockIcon = block.icon;
                        return (
                          <div
                            key={block.type}
                            draggable
                            onDragStart={(e) => {
                              setDraggedBlock(block);
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            <BlockIcon className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">{block.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 text-sm">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="w-full flex items-center space-x-2 p-2 text-left text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                <StarIcon className="h-4 w-4" />
                <span>Browse Templates</span>
              </button>
              <button
                onClick={() => {
                  setTemplate(prev => ({
                    ...prev,
                    design_json: { ...prev.design_json, blocks: [] }
                  }));
                }}
                className="w-full flex items-center space-x-2 p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Clear Canvas</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div 
            ref={canvasRef}
            className="mx-auto bg-white shadow-lg rounded-lg min-h-96 max-w-2xl"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
          >
            {template.design_json.blocks.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Start building your email</p>
                  <p className="text-sm">Choose a template or drag blocks from the sidebar</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {template.design_json.blocks.map((block, index) => (
                  <div
                    key={block.id || index}
                    className={`relative group hover:outline hover:outline-2 hover:outline-blue-300 transition-all ${
                      selectedBlock === block.id ? 'outline outline-2 outline-blue-500 ring-2 ring-blue-200' : ''
                    }`}
                    onClick={() => setSelectedBlock(block.id)}
                  >
                    {/* Block Controls - Positioned outside the block content */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlockUp(index);
                        }}
                        disabled={index === 0}
                        className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        title="Move Up"
                      >
                        <ArrowUpIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlockDown(index);
                        }}
                        disabled={index === template.design_json.blocks.length - 1}
                        className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        title="Move Down"
                      >
                        <ArrowDownIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateBlock(index);
                        }}
                        className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(index);
                        }}
                        className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-red-50 text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Render Block Content - Full Width */}
                    {renderBlock(block)}
                  </div>
                ))}
                
                {/* Drop Zone at Bottom */}
                <div
                  className="h-16 border-2 border-dashed border-gray-300 mx-4 my-4 rounded-lg flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  onDrop={(e) => handleDropAtPosition(e, template.design_json.blocks.length)}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                >
                  <PlusIcon className="h-6 w-6 mr-2" />
                  <span>Drop blocks here to add to bottom</span>
                </div>
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
          professionalTemplates={professionalTemplates}
          basicTemplates={basicTemplates}
        />
      )}
    </div>
  );
};

export default EmailTemplateBuilder;
