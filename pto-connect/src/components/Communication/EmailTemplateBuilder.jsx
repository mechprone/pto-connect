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
            // Add hero header block
            convertedBlocks.push({
              id: blockId,
              type: 'header',
              content: {
                text: block.content.title || 'Hero Title',
                fontSize: '32px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: block.content.titleColor || '#ffffff',
                backgroundImage: block.content.backgroundImage || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                backgroundColor: block.content.backgroundColor || '#3b82f6',
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
                  backgroundColor: block.content.backgroundImage || block.content.backgroundColor || '#3b82f6',
                  padding: '0px 20px 40px 20px'
                }
              });
            }
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
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Template Library
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              onClick={() => onSave?.(template)}
              disabled={saving || !template.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Design Elements</h3>
          <p className="text-sm text-gray-600">Drag blocks to canvas or use Template Library</p>
        </div>

        <div className="flex-1 p-6">
          <div className="mx-auto bg-white shadow-lg rounded-lg min-h-96 max-w-2xl">
            {template.design_json.blocks.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <p className="text-lg font-medium">Start building your email</p>
                  <p className="text-sm">Choose a template or drag blocks from the sidebar</p>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p>Template loaded with {template.design_json.blocks.length} blocks</p>
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
