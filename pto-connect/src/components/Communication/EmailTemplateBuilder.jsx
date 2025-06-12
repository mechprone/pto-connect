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
    // Event Invitations - Professional Canva-Level Templates
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
    },
    {
      id: 'pro-summer-camp-vibrant',
      name: 'Summer Camp - Vibrant Adventure',
      category: 'events',
      style: 'colorful-energetic',
      description: 'Bright, energetic design with summer camp themes and adventure elements',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🏕️ SUMMER ADVENTURE CAMP 🏕️', 
            backgroundColor: '#fd7f6f', 
            backgroundImage: 'linear-gradient(45deg, #fd7f6f 0%, #7eb77f 50%, #7eb77f 100%)',
            color: '#ffffff', 
            fontSize: '34px', 
            fontWeight: 'bold', 
            padding: '45px 20px', 
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: '🌟 Adventure Awaits! 🌟\n\nJoin us for the ultimate summer experience filled with outdoor adventures, creative arts, STEM exploration, and lifelong friendships. Every day brings new discoveries!', 
            padding: '25px', 
            fontSize: '17px', 
            textAlign: 'center',
            color: '#2d3748',
            backgroundColor: '#fffbeb',
            borderRadius: '12px',
            margin: '20px'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '🎨 Weekly Themes', 
            text: 'Week 1: Nature Explorers 🌿\nWeek 2: Mad Scientists 🧪\nWeek 3: Creative Artists 🎨\nWeek 4: Adventure Athletes ⚽', 
            backgroundColor: '#f0fff4', 
            titleColor: '#22543d', 
            textColor: '#2f855a', 
            borderColor: '#48bb78', 
            padding: '25px', 
            borderRadius: '12px' 
          } 
        },
        { 
          type: 'countdown', 
          content: { 
            title: '⏰ Camp Starts In:', 
            eventDate: '2024-06-15', 
            backgroundColor: '#fef5e7', 
            titleColor: '#c05621', 
            numberColor: '#dd6b20', 
            labelColor: '#9c4221', 
            padding: '30px' 
          } 
        }
      ]
    },

    // Newsletter Templates - Professional Designs
    {
      id: 'pro-monthly-newsletter-academic',
      name: 'Monthly Newsletter - Academic Excellence',
      category: 'newsletters',
      style: 'professional-academic',
      description: 'Sophisticated newsletter design with academic themes and clean typography',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '📖 MONTHLY ACADEMIC DIGEST 📖', 
            backgroundColor: '#1a365d', 
            color: '#ffffff', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            padding: '35px 20px', 
            textAlign: 'center' 
          } 
        },
        { 
          type: 'newsletter', 
          content: { 
            title: 'Principal\'s Message', 
            content: 'Dear School Community,\n\nThis month has been filled with remarkable achievements and exciting learning opportunities. Our students continue to excel academically while developing important life skills through our comprehensive programs.\n\nWe are particularly proud of our recent science fair winners and our reading program participants who have shown tremendous growth.', 
            author: 'Dr. Sarah Johnson, Principal',
            backgroundColor: '#f7fafc',
            titleColor: '#2d3748',
            textColor: '#4a5568',
            authorColor: '#718096',
            padding: '25px'
          } 
        },
        { 
          type: 'achievement', 
          content: { 
            title: '🏆 Student Achievements This Month', 
            achievements: [
              'Math Olympiad Regional Champions',
              'Perfect Attendance Recognition (45 students)',
              'Reading Challenge Completions (120 students)',
              'Science Fair State Qualifiers (8 projects)'
            ],
            backgroundColor: '#f0fff4',
            titleColor: '#22543d',
            textColor: '#2f855a',
            padding: '25px'
          } 
        },
        { 
          type: 'stats', 
          content: { 
            title: '📈 Academic Progress Highlights', 
            stats: [
              { number: '95%', label: 'Reading Proficiency' },
              { number: '88%', label: 'Math Scores' },
              { number: '100%', label: 'Graduation Rate' }
            ],
            backgroundColor: '#ebf8ff',
            titleColor: '#2c5282',
            numberColor: '#3182ce',
            labelColor: '#4a5568',
            padding: '25px'
          } 
        }
      ]
    },
    {
      id: 'pro-classroom-news-creative',
      name: 'Classroom News - Creative Learning',
      category: 'newsletters',
      style: 'creative-classroom',
      description: 'Playful classroom-themed design with educational elements and bright colors',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🎨 MRS. SMITH\'S 3RD GRADE NEWS 🎨', 
            backgroundColor: '#ed8936', 
            backgroundImage: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
            color: '#ffffff', 
            fontSize: '26px', 
            fontWeight: 'bold', 
            padding: '30px 20px', 
            textAlign: 'center' 
          } 
        },
        { 
          type: 'grade', 
          content: { 
            title: '📚 This Week in Learning', 
            teacher: 'Mrs. Sarah Smith',
            content: 'Our young scholars have been diving deep into the world of fractions in math, exploring character development in our novel study, and conducting exciting experiments about plant growth in science. The enthusiasm for learning is contagious!',
            backgroundColor: '#fff5f5',
            titleColor: '#c53030',
            textColor: '#2d3748',
            padding: '25px'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '⭐ Student Spotlight', 
            text: 'This week we celebrate Emma Rodriguez for her outstanding creativity in our writing workshop. Her story about a time-traveling pencil had the whole class laughing and inspired many other creative tales!', 
            backgroundColor: '#f0fff4', 
            titleColor: '#22543d', 
            textColor: '#2f855a', 
            borderColor: '#48bb78', 
            padding: '20px', 
            borderRadius: '8px' 
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: '📝 Upcoming Events:\n• Math Game Day - Friday\n• Author Visit - Next Tuesday\n• Field Trip Permission Slips Due - Monday', 
            padding: '20px', 
            fontSize: '16px', 
            textAlign: 'left',
            color: '#2d3748',
            backgroundColor: '#edf2f7'
          } 
        }
      ]
    },

    // Welcome Templates - Professional Designs
    {
      id: 'pro-new-student-welcome-warm',
      name: 'New Student Welcome - Warm Community',
      category: 'welcome',
      style: 'warm-welcoming',
      description: 'Warm, inviting design that makes new families feel part of the school community',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🏫 WELCOME TO OUR SCHOOL FAMILY! 🏫', 
            backgroundColor: '#4299e1', 
            backgroundImage: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
            color: '#ffffff', 
            fontSize: '30px', 
            fontWeight: 'bold', 
            padding: '40px 20px', 
            textAlign: 'center' 
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: 'Dear New Families,\n\nWe are absolutely thrilled to welcome you to our vibrant school community! 🎉 Your journey with us begins now, and we can\'t wait to see the amazing things your child will accomplish here.\n\nOur dedicated team is here to support you every step of the way.', 
            padding: '30px 25px', 
            fontSize: '16px', 
            textAlign: 'left',
            color: '#2d3748',
            backgroundColor: '#f7fafc',
            lineHeight: '1.6'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '🌟 What Makes Us Special', 
            text: '• Personalized learning approaches\n• Strong community partnerships\n• Innovative STEAM programs\n• Caring, experienced educators\n• Safe, inclusive environment', 
            backgroundColor: '#e6fffa', 
            titleColor: '#234e52', 
            textColor: '#285e61', 
            borderColor: '#4fd1c7', 
            padding: '25px', 
            borderRadius: '8px' 
          } 
        },
        { 
          type: 'button', 
          content: { 
            text: '📋 Complete New Family Checklist', 
            backgroundColor: '#38a169', 
            color: '#ffffff', 
            textAlign: 'center', 
            padding: '15px 30px', 
            borderRadius: '8px', 
            fontSize: '16px', 
            fontWeight: 'bold' 
          } 
        }
      ]
    },

    // Fundraising Templates - Professional Designs
    {
      id: 'pro-fundraising-campaign-impact',
      name: 'Fundraising Campaign - Community Impact',
      category: 'fundraising',
      style: 'impact-focused',
      description: 'Professional fundraising design emphasizing community impact and transparency',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '💝 BUILDING BRIGHTER FUTURES TOGETHER 💝', 
            backgroundColor: '#805ad5', 
            backgroundImage: 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)',
            color: '#ffffff', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            padding: '35px 20px', 
            textAlign: 'center' 
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: 'Dear School Community,\n\nEvery child deserves access to exceptional educational opportunities. Your support helps us provide cutting-edge technology, enriching programs, and resources that make learning come alive for every student.', 
            padding: '25px', 
            fontSize: '16px', 
            textAlign: 'left',
            color: '#2d3748',
            backgroundColor: '#faf5ff',
            lineHeight: '1.6'
          } 
        },
        { 
          type: 'donation', 
          content: { 
            title: '🎯 Our Goal: New STEM Lab Equipment', 
            description: 'Help us create a state-of-the-art learning environment for our students',
            currentAmount: 18500,
            goalAmount: 35000,
            backgroundColor: '#f0fff4',
            titleColor: '#22543d',
            textColor: '#2f855a',
            progressColor: '#48bb78',
            buttonText: '💚 Donate Now',
            buttonColor: '#38a169',
            padding: '25px'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '🌟 Your Impact', 
            text: '$25 - Supplies for one student\n$50 - Science experiment kit\n$100 - Classroom technology upgrade\n$250 - Full STEM project materials', 
            backgroundColor: '#ebf8ff', 
            titleColor: '#2c5282', 
            textColor: '#2a4365', 
            borderColor: '#4299e1', 
            padding: '20px', 
            borderRadius: '8px' 
          } 
        }
      ]
    },

    // Announcement Templates - Professional Designs
    {
      id: 'pro-policy-update-official',
      name: 'Policy Update - Official Communication',
      category: 'announcements',
      style: 'official-professional',
      description: 'Clean, official design for important policy communications and updates',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '📋 IMPORTANT POLICY UPDATE 📋', 
            backgroundColor: '#2d3748', 
            color: '#ffffff', 
            fontSize: '26px', 
            fontWeight: 'bold', 
            padding: '30px 20px', 
            textAlign: 'center' 
          } 
        },
        { 
          type: 'announcement', 
          content: { 
            title: 'Updated Health & Safety Protocols', 
            message: 'Effective immediately, we are implementing enhanced health and safety measures to ensure the wellbeing of all students, staff, and families. These updates reflect current best practices and regulatory requirements.',
            backgroundColor: '#edf2f7',
            titleColor: '#2d3748',
            textColor: '#4a5568',
            buttonText: 'View Full Policy Document',
            buttonColor: '#3182ce',
            padding: '25px'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '📌 Key Changes', 
            text: '• Updated visitor check-in procedures\n• Enhanced cleaning protocols\n• Modified pickup/drop-off procedures\n• New emergency contact requirements', 
            backgroundColor: '#fff5f5', 
            titleColor: '#c53030', 
            textColor: '#742a2a', 
            borderColor: '#fc8181', 
            padding: '20px', 
            borderRadius: '8px' 
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: 'Questions? Please contact our main office at (555) 123-4567 or email admin@school.edu. We appreciate your cooperation in keeping our school community safe and healthy.', 
            padding: '20px', 
            fontSize: '14px', 
            textAlign: 'center',
            color: '#4a5568',
            backgroundColor: '#f7fafc',
            fontStyle: 'italic'
          } 
        }
      ]
    },

    // Additional Professional Templates...
    {
      id: 'pro-workshop-series-academic',
      name: 'Workshop Series - Academic Excellence',
      category: 'events',
      style: 'workshop-professional',
      description: 'Sophisticated design for academic workshops and professional development events',
      blocks: [
        { 
          type: 'header', 
          content: { 
            text: '🎓 PARENT EDUCATION WORKSHOP SERIES 🎓', 
            backgroundColor: '#1a365d', 
            backgroundImage: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
            color: '#ffffff', 
            fontSize: '26px', 
            fontWeight: 'bold', 
            padding: '35px 20px', 
            textAlign: 'center' 
          } 
        },
        { 
          type: 'text', 
          content: { 
            text: 'Empowering Parents, Enriching Education 📚\n\nJoin our expert-led workshop series designed to help parents support their children\'s academic journey. Learn practical strategies, connect with other families, and discover resources that make a difference.', 
            padding: '25px', 
            fontSize: '16px', 
            textAlign: 'left',
            color: '#2d3748',
            backgroundColor: '#ebf8ff',
            lineHeight: '1.6'
          } 
        },
        { 
          type: 'event', 
          content: { 
            title: 'Upcoming Workshop: "Supporting Math Learning at Home"', 
            date: '2024-11-25', 
            time: '6:30 PM - 8:00 PM', 
            location: 'School Library', 
            description: 'Learn fun, effective ways to reinforce math concepts at home',
            backgroundColor: '#f0f9ff',
            titleColor: '#1e3a8a',
            textColor: '#1e40af',
            buttonText: 'Reserve Your Spot',
            buttonColor: '#3b82f6',
            padding: '25px'
          } 
        },
        { 
          type: 'highlight', 
          content: { 
            title: '📅 Complete Series Schedule', 
            text: 'Nov 25: Math Support Strategies\nDec 9: Reading Comprehension Tips\nJan 13: Study Skills & Organization\nFeb 10: Technology & Learning', 
            backgroundColor: '#fef3c7', 
            titleColor: '#92400e', 
            textColor: '#a16207', 
            borderColor: '#f59e0b', 
            padding: '20px', 
            borderRadius: '8px' 
          } 
        }
      ]
    }
  ];

  const basicTemplates = [
    // Move previous "professional" templates to basic
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
          } else if (block.type === 'volunteer') {
            console.log('🤝 DEBUG: Converting volunteer block');
            const volunteerContent = {
              title: block.content.title || 'We Need Volunteers!',
              description: block.content.description || 'Join our team',
              opportunities: Array.isArray(block.content.opportunities) ? block.content.opportunities : ['General Volunteering'],
              backgroundColor: block.content.backgroundColor || '#f0f9ff',
              titleColor: block.content.titleColor || '#1e40af',
              textColor: block.content.textColor || '#374151',
              buttonText: block.content.buttonText || 'Sign Up',
              buttonColor: block.content.buttonColor || '#2563eb',
              padding: block.content.padding || '20px'
            };
            
            convertedBlocks.push({
              id: blockId,
              type: 'volunteer',
              content: volunteerContent
            });
          } else if (block.type === 'announcement') {
            console.log('📢 DEBUG: Converting announcement block');
            const announcementContent = {
              title: block.content.title || 'Important Announcement',
              message: block.content.message || block.content.text || 'Important information',
              backgroundColor: block.content.backgroundColor || '#f0f9ff',
              titleColor: block.content.titleColor || '#1e40af',
              textColor: block.content.textColor || '#374151',
              buttonText: block.content.buttonText || '',
              buttonLink: block.content.buttonLink || '#',
              buttonColor: block.content.buttonColor || '#2563eb',
              padding: block.content.padding || '20px'
            };
            
            convertedBlocks.push({
              id: blockId,
              type: 'announcement',
              content: announcementContent
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

      // Validate converted blocks
      const invalidBlocks = convertedBlocks.filter(block => !block.id || !block.type || !block.content);
      if (invalidBlocks.length > 0) {
        console.error('❌ DEBUG: Found invalid converted blocks:', invalidBlocks);
        alert('Error: Some template blocks could not be converted properly');
        return;
      }

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

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!template.name || saving) return;
    
    try {
      console.log('🔄 DEBUG: Auto-save triggered for template:', template.name);
      setAutoSaveStatus('saving');
      
      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('🔍 DEBUG: API URL:', apiUrl);
      
      if (!apiUrl || apiUrl.includes('localhost')) {
        // Skip auto-save if API is not configured or pointing to localhost
        console.log('✅ DEBUG: Auto-save skipped - API not available or in development mode');
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        return;
      }
      
      const templateData = {
        ...template,
        html_content: generateHTML()
      };

      const url = templateId 
        ? `${apiUrl}/communications/templates/${templateId}`
        : `${apiUrl}/communications/templates`;
      
      const method = templateId ? 'PUT' : 'POST';

      console.log('🌐 DEBUG: Making auto-save request to:', url);
      console.log('🔧 DEBUG: Method:', method);
      console.log('📦 DEBUG: Template data size:', JSON.stringify(templateData).length, 'characters');

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      console.log('📡 DEBUG: Auto-save response status:', response.status);
      console.log('📡 DEBUG: Auto-save response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        console.log('✅ DEBUG: Auto-save successful');
        const responseData = await response.json();
        console.log('📄 DEBUG: Auto-save response data:', responseData);
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
      } else {
        console.warn('⚠️ DEBUG: Auto-save failed with status:', response.status, response.statusText);
        
        // Try to read the response as text to see what we're getting
        try {
          const responseText = await response.text();
          console.error('❌ DEBUG: Auto-save error response body:', responseText);
          
          // Check if we're getting HTML instead of JSON
          if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('🚨 DEBUG: FOUND THE ISSUE! Auto-save is receiving HTML instead of JSON');
            console.error('🚨 DEBUG: This is likely a routing/server configuration issue');
          }
        } catch (textError) {
          console.error('❌ DEBUG: Could not read error response as text:', textError);
        }
        
        setAutoSaveStatus('error');
      }
    } catch (err) {
      console.error('❌ DEBUG: Auto-save critical error:', err);
      console.error('❌ DEBUG: Error stack:', err.stack);
      
      // Check if this is the JSON parsing error we're looking for
      if (err.message && err.message.includes('Unexpected token')) {
        console.error('🚨 DEBUG: CONFIRMED! This is the JSON parsing error source');
        console.error('🚨 DEBUG: Auto-save is trying to parse HTML as JSON');
      }
      
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

  // Clear saved state only when explicitly saving or canceling
  useEffect(() => {
    return () => {
      // Don't automatically clear localStorage on unmount
      // This allows users to switch windows/tabs without losing work
      console.log('Component unmounting - preserving saved template state');
    };
  }, []);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      
      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl || apiUrl.includes('localhost')) {
        console.log('Template fetch skipped: API not available or in development mode');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${apiUrl}/communications/templates/${templateId}`, {
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
    console.log('🔄 DEBUG: Moving block', blockId, direction);
    
    setTemplate(prev => {
      const blocks = [...prev.design_json.blocks];
      const currentIndex = blocks.findIndex(block => block.id === blockId);
      
      console.log('📍 DEBUG: Current index:', currentIndex, 'Total blocks:', blocks.length);
      
      if (currentIndex === -1) {
        console.warn('⚠️ DEBUG: Block not found');
        return prev;
      }
      
      let newIndex;
      if (direction === 'up' && currentIndex > 0) {
        newIndex = currentIndex - 1;
        console.log('⬆️ DEBUG: Moving up to index:', newIndex);
      } else if (direction === 'down' && currentIndex < blocks.length - 1) {
        newIndex = currentIndex + 1;
        console.log('⬇️ DEBUG: Moving down to index:', newIndex);
      } else {
        console.log('🚫 DEBUG: Cannot move - at boundary');
        return prev; // Can't move
      }
      
      // Swap blocks
      const blockToMove = blocks[currentIndex];
      const blockToReplace = blocks[newIndex];
      
      console.log('🔄 DEBUG: Swapping blocks:', {
        moving: blockToMove.type,
        replacing: blockToReplace.type
      });
      
      blocks[currentIndex] = blockToReplace;
      blocks[newIndex] = blockToMove;
      
      const newTemplate = {
        ...prev,
        design_json: {
          ...prev.design_json,
          blocks
        }
      };
      
      console.log('✅ DEBUG: Block move completed');
      return newTemplate;
    });
  };

  const renderBlock = (block) => {
    const { content } = block;
    
    switch (block.type) {
      case 'header':
        return (
          <div style={{ 
            background: content.backgroundImage || content.backgroundColor || '#f9fafb', 
            padding: content.padding || '20px', 
            textAlign: content.textAlign || 'center' 
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: content.fontSize || '24px', 
              fontWeight: content.fontWeight || 'bold', 
              color: content.color || '#1f2937' 
            }}>
              {content.text}
            </h1>
          </div>
        );
      case 'text':
        return (
          <div style={{ 
            padding: content.padding, 
            textAlign: content.textAlign,
            background: content.backgroundImage || content.backgroundColor || 'transparent'
          }}>
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
      case 'donation':
        const progressPercentage = Math.round((content.currentAmount / content.goalAmount) * 100);
        return (
          <div style={{ 
            padding: content.padding, 
            backgroundColor: content.backgroundColor,
            borderRadius: '8px',
            margin: '10px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <h2 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: content.titleColor 
              }}>
                {content.title}
              </h2>
              <p style={{ 
                margin: '0 0 15px 0', 
                fontSize: '16px', 
                color: content.textColor 
              }}>
                {content.description}
              </p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                <span style={{ color: content.textColor }}>
                  Raised: ${content.currentAmount?.toLocaleString()}
                </span>
                <span style={{ color: content.textColor }}>
                  Goal: ${content.goalAmount?.toLocaleString()}
                </span>
              </div>
              
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${Math.min(progressPercentage, 100)}%`, 
                  height: '100%', 
                  backgroundColor: content.progressColor,
                  borderRadius: '10px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: content.textColor
              }}>
                {progressPercentage}% of goal reached
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <a 
                href="#donate" 
                style={{ 
                  backgroundColor: content.buttonColor, 
                  color: '#ffffff', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                {content.buttonText}
              </a>
            </div>
          </div>
        );
      case 'volunteer':
        return (
          <div style={{ 
            padding: content.padding, 
            backgroundColor: content.backgroundColor,
            borderRadius: '8px',
            margin: '10px',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: content.titleColor 
            }}>
              {content.title}
            </h2>
            <p style={{ 
              margin: '0 0 15px 0', 
              fontSize: '16px', 
              color: content.textColor 
            }}>
              {content.description}
            </p>
            <h3 style={{
              margin: '20px 0 10px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: content.titleColor,
              textAlign: 'left'
            }}>
              Volunteer Opportunities:
            </h3>
            <ul style={{
              margin: '0 0 20px 0',
              paddingLeft: '20px',
              listStyleType: 'disc',
              textAlign: 'left',
              color: content.textColor
            }}>
              {content.opportunities?.map((opp, i) => <li key={i} style={{ marginBottom: '5px' }}>{opp}</li>)}
            </ul>
            <a 
              href="#volunteer" 
              style={{ 
                backgroundColor: content.buttonColor, 
                color: '#ffffff', 
                padding: '12px 24px', 
                borderRadius: '6px', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              {content.buttonText}
            </a>
          </div>
        );
      case 'announcement':
        return (
          <div style={{ 
            padding: content.padding || '20px', 
            backgroundColor: content.backgroundColor || '#f0f9ff',
            borderRadius: '8px',
            margin: '10px',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              margin: '0 0 15px 0', 
              fontSize: content.titleSize || '24px', 
              fontWeight: 'bold', 
              color: content.titleColor || '#1e40af'
            }}>
              {content.title || 'Important Announcement'}
            </h2>
            <p style={{ 
              margin: '0 0 20px 0', 
              fontSize: content.textSize || '16px', 
              color: content.textColor || '#374151',
              lineHeight: '1.6'
            }}>
              {content.message || content.text || 'Your announcement message here.'}
            </p>
            {content.buttonText && (
              <a 
                href={content.buttonLink || '#'} 
                style={{ 
                  backgroundColor: content.buttonColor || '#2563eb', 
                  color: '#ffffff', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                {content.buttonText}
              </a>
            )}
          </div>
        );
      case 'calendar':
        return (
          <div style={{ 
            padding: content.padding || '20px', 
            backgroundColor: content.backgroundColor || '#fef3c7',
            borderRadius: '8px',
            margin: '10px'
          }}>
            <h2 style={{ 
              margin: '0 0 15px 0', 
              fontSize: content.titleSize || '22px', 
              fontWeight: 'bold', 
              color: content.titleColor || '#92400e',
              textAlign: 'center'
            }}>
              {content.title || 'Upcoming Events'}
            </h2>
            {content.events?.map((event, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '6px',
                borderLeft: `4px solid ${content.accentColor || '#f59e0b'}`
              }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: content.eventTitleColor || '#1f2937'
                }}>
                  {event.title}
                </h3>
                <p style={{
                  margin: '0 0 5px 0',
                  fontSize: '14px',
                  color: content.dateColor || '#6b7280',
                  fontWeight: 'bold'
                }}>
                  📅 {event.date} {event.time && `• ⏰ ${event.time}`}
                </p>
                {event.location && (
                  <p style={{
                    margin: '0 0 5px 0',
                    fontSize: '14px',
                    color: content.locationColor || '#6b7280'
                  }}>
                    📍 {event.location}
                  </p>
                )}
                {event.description && (
                  <p style={{
                    margin: '5px 0 0 0',
                    fontSize: '14px',
                    color: content.textColor || '#374151'
                  }}>
                    {event.description}
                  </p>
                )}
              </div>
            ))}
            {content.buttonText && (
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <a 
                  href={content.buttonLink || '#'} 
                  style={{ 
                    backgroundColor: content.buttonColor || '#f59e0b', 
                    color: '#ffffff', 
                    padding: '12px 24px', 
                    borderRadius: '6px', 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  {content.buttonText}
                </a>
              </div>
            )}
          </div>
        );
      case 'divider':
        return (
          <div style={{ padding: '10px 0', textAlign: 'center' }}>
            <hr style={{
              border: 'none',
              borderTop: `${content.thickness || '2px'} ${content.style || 'solid'} ${content.color || '#e5e7eb'}`,
              width: content.width || '80%',
              margin: content.margin || '20px auto'
            }} />
          </div>
        );
      case 'spacer':
        return (
          <div style={{
            height: content.height || '30px',
            backgroundColor: content.backgroundColor || 'transparent'
          }}></div>
        );
      case 'quote':
        return (
          <div style={{
            padding: content.padding || '25px',
            backgroundColor: content.backgroundColor || '#f8fafc',
            borderLeft: `4px solid ${content.borderColor || '#3b82f6'}`,
            margin: '10px',
            borderRadius: '4px'
          }}>
            <blockquote style={{
              margin: '0 0 10px 0',
              fontSize: content.fontSize || '18px',
              fontStyle: content.fontStyle || 'italic',
              color: content.textColor || '#475569',
              lineHeight: '1.6'
            }}>
              {content.text}
            </blockquote>
            {content.author && (
              <cite style={{
                fontSize: '14px',
                color: content.authorColor || '#64748b',
                fontStyle: 'normal',
                fontWeight: 'bold'
              }}>
                — {content.author}
              </cite>
            )}
          </div>
        );
      case 'highlight':
        return (
          <div style={{
            padding: content.padding || '20px',
            backgroundColor: content.backgroundColor || '#fef3c7',
            border: `2px solid ${content.borderColor || '#f59e0b'}`,
            borderRadius: content.borderRadius || '8px',
            margin: '10px'
          }}>
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: content.titleColor || '#92400e'
            }}>
              {content.title}
            </h3>
            <p style={{
              margin: '0',
              fontSize: '16px',
              color: content.textColor || '#78350f',
              lineHeight: '1.5'
            }}>
              {content.text}
            </p>
          </div>
        );
      case 'stats':
        return (
          <div style={{
            padding: content.padding || '25px',
            backgroundColor: content.backgroundColor || '#f0f9ff',
            borderRadius: '8px',
            margin: '10px',
            textAlign: 'center'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: content.titleColor || '#1e40af'
            }}>
              {content.title}
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              {content.stats?.map((stat, i) => (
                <div key={i} style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: content.numberColor || '#3b82f6',
                    marginBottom: '5px'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: content.labelColor || '#64748b',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'event':
        return (
          <div style={{
            padding: content.padding || '20px',
            backgroundColor: content.backgroundColor || '#fef3c7',
            borderRadius: '8px',
            margin: '10px'
          }}>
            {content.image && (
              <img 
                src={content.image} 
                alt={content.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  marginBottom: '15px'
                }}
              />
            )}
            <h2 style={{
              margin: '0 0 10px 0',
              fontSize: '22px',
              fontWeight: 'bold',
              color: content.titleColor || '#92400e'
            }}>
              {content.title}
            </h2>
            <div style={{
              marginBottom: '10px',
              fontSize: '14px',
              color: content.textColor || '#374151'
            }}>
              <p style={{ margin: '5px 0' }}>📅 {content.date}</p>
              <p style={{ margin: '5px 0' }}>⏰ {content.time}</p>
              <p style={{ margin: '5px 0' }}>📍 {content.location}</p>
            </div>
            <p style={{
              margin: '15px 0',
              fontSize: '16px',
              color: content.textColor || '#374151',
              lineHeight: '1.5'
            }}>
              {content.description}
            </p>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a 
                href="#rsvp"
                style={{
                  backgroundColor: content.buttonColor || '#f59e0b',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                {content.buttonText || 'RSVP Now'}
              </a>
            </div>
          </div>
        );
      case 'social':
        return (
          <div style={{
            padding: content.padding || '20px',
            backgroundColor: content.backgroundColor || '#f8fafc',
            borderRadius: '8px',
            margin: '10px',
            textAlign: 'center'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: content.titleColor || '#1e293b'
            }}>
              {content.title}
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              {content.platforms?.map((platform, i) => (
                <a 
                  key={i}
                  href={platform.url}
                  style={{
                    display: 'inline-block',
                    padding: '10px 15px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ marginRight: '8px' }}>{platform.icon}</span>
                  {platform.name}
                </a>
              ))}
            </div>
          </div>
        );
      case 'contact':
        return (
          <div style={{
            padding: content.padding || '20px',
            backgroundColor: content.backgroundColor || '#f1f5f9',
            borderRadius: '8px',
            margin: '10px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: content.titleColor || '#334155',
              textAlign: 'center'
            }}>
              {content.title}
            </h3>
            <div style={{
              fontSize: '14px',
              color: content.textColor || '#64748b',
              lineHeight: '1.6'
            }}>
              {content.email && (
                <p style={{ margin: '8px 0' }}>
                  📧 <a href={`mailto:${content.email}`} style={{ color: 'inherit' }}>{content.email}</a>
                </p>
              )}
              {content.phone && (
                <p style={{ margin: '8px 0' }}>
                  📞 <a href={`tel:${content.phone}`} style={{ color: 'inherit' }}>{content.phone}</a>
                </p>
              )}
              {content.address && (
                <p style={{ margin: '8px 0' }}>
                  📍 {content.address}
                </p>
              )}
            </div>
          </div>
        );
      case 'countdown':
        const eventDate = new Date(content.eventDate);
        const now = new Date();
        const timeDiff = eventDate - now;
        const days = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)));
        
        return (
          <div style={{
            padding: content.padding || '25px',
            backgroundColor: content.backgroundColor || '#fef3c7',
            borderRadius: '8px',
            margin: '10px',
            textAlign: 'center'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: content.titleColor || '#92400e'
            }}>
              {content.title}
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: content.numberColor || '#f59e0b'
                }}>
                  {days}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: content.labelColor || '#78350f',
                  fontWeight: '500'
                }}>
                  DAYS
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: content.numberColor || '#f59e0b'
                }}>
                  {hours}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: content.labelColor || '#78350f',
                  fontWeight: '500'
                }}>
                  HOURS
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: content.numberColor || '#f59e0b'
                }}>
                  {minutes}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: content.labelColor || '#78350f',
                  fontWeight: '500'
                }}>
                  MINUTES
                </div>
              </div>
            </div>
          </div>
        );
      case 'grade':
        return (
          <div style={{
            padding: content.padding || '20px',
            backgroundColor: content.backgroundColor || '#f0fdf4',
            borderRadius: '8px',
            margin: '10px'
          }}>
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: content.titleColor || '#166534'
            }}>
              {content.title}
            </h3>
            {content.teacher && (
              <p style={{
                margin: '0 0 15px 0',
                fontSize: '14px',
                color: content.textColor || '#374151',
                fontWeight: '500'
              }}>
                Teacher: {content.teacher}
              </p>
            )}
            <p style={{
              margin: '0',
              fontSize: '16px',
              color: content.textColor || '#374151',
              lineHeight: '1.5'
            }}>
              {content.content}
            </p>
          </div>
        );
      case 'achievement':
        return (
          <div style={{
            padding: content.padding || '20px',
            backgroundColor: content.backgroundColor || '#fefce8',
            borderRadius: '8px',
            margin: '10px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: content.titleColor || '#a16207',
              textAlign: 'center'
            }}>
              {content.title}
            </h3>
            <ul style={{
              margin: '0',
              paddingLeft: '20px',
              listStyleType: 'none',
              color: content.textColor || '#374151'
            }}>
              {content.achievements?.map((achievement, i) => (
                <li key={i} style={{
                  marginBottom: '8px',
                  fontSize: '16px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '-20px',
                    color: content.titleColor || '#a16207'
                  }}>
                    ⭐
                  </span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'newsletter':
        return (
          <div style={{
            padding: content.padding || '25px',
            backgroundColor: content.backgroundColor || '#f8fafc',
            borderRadius: '8px',
            margin: '10px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: content.titleColor || '#1e293b'
            }}>
              {content.title}
            </h3>
            <div style={{
              fontSize: '16px',
              color: content.textColor || '#475569',
              lineHeight: '1.6',
              marginBottom: '15px'
            }}>
              {content.content?.split('\n').map((paragraph, i) => (
                <p key={i} style={{ margin: '0 0 15px 0' }}>{paragraph}</p>
              ))}
            </div>
            {content.author && (
              <div style={{
                fontSize: '14px',
                color: content.authorColor || '#64748b',
                fontStyle: 'italic',
                textAlign: 'right',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '10px'
              }}>
                — {content.author}
              </div>
            )}
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

      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl || apiUrl.includes('localhost')) {
        // For development mode, just simulate a successful save
        console.log('Save simulated: API not available or in development mode');
        
        // Clear saved state since we're "saving"
        localStorage.removeItem('emailTemplateBuilder_state');
        
        // Call onSave callback with mock data
        onSave?.({
          id: templateId || `mock-${Date.now()}`,
          ...template,
          html_content: generateHTML()
        });
        
        setSaving(false);
        return;
      }

      const templateData = {
        ...template,
        html_content: generateHTML()
      };

      const url = templateId 
        ? `${apiUrl}/communications/templates/${templateId}`
        : `${apiUrl}/communications/templates`;
      
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
        // Clear saved state since we successfully saved
        localStorage.removeItem('emailTemplateBuilder_state');
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
              onClick={() => {
                if (confirm('Are you sure you want to clear all content and start over? This cannot be undone.')) {
                  setTemplate(prev => ({
                    ...prev,
                    name: '',
                    subject: '',
                    design_json: {
                      ...prev.design_json,
                      blocks: []
                    }
                  }));
                  setSelectedBlock(null);
                  // Clear saved state
                  localStorage.removeItem('emailTemplateBuilder_state');
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
              title="Clear All Content"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Clear</span>
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

          {/* Professional Templates Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="w-full group relative p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10 text-center">
                <SparklesIcon className="h-6 w-6 text-white mx-auto mb-1 transition-transform duration-300 group-hover:rotate-12" />
                <div className="text-base font-bold text-white">Template Library</div>
                <div className="text-xs text-purple-100">Browse 40+ stunning designs</div>
              </div>
            </button>
          </div>

          {/* Enhanced Block Library with Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
              Design Elements
            </h3>
            
            <div className="space-y-2">
              {designElementCategories.map(category => (
                <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <category.icon className={`h-4 w-4 mr-2 text-${category.color}`} />
                      <span>{category.name}</span>
                    </div>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                        collapsedCategories[category.id] ? '' : 'rotate-180'
                      }`}
                    />
                  </button>
                  {!collapsedCategories[category.id] && (
                    <div className="p-2 space-y-1">
                      {blockTypes.filter(block => block.category === category.id).map((blockType) => (
                        <div
                          key={blockType.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, blockType)}
                          className={`flex items-center p-2 border border-gray-200 rounded-lg cursor-move hover:border-${category.color.split('-')[0]}-300 hover:bg-${category.color.split('-')[0]}-50 transition-colors group`}
                        >
                          <blockType.icon className={`h-4 w-4 text-gray-500 mr-2 group-hover:text-${category.color}`} />
                          <span className={`text-sm font-medium text-gray-700 group-hover:text-${category.color.split('-')[0]}-700`}>{blockType.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                              moveBlock(block.id, 'up');
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
                              moveBlock(block.id, 'down');
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

        {/* Right-Side Properties Panel */}
        {selectedBlock && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <PaintBrushIcon className="h-5 w-5 mr-2 text-blue-600" />
                Block Properties
              </h3>
              <div className="text-sm text-gray-600 mb-4">
                Editing: {blockTypes.find(bt => bt.type === template.design_json.blocks.find(b => b.id === selectedBlock)?.type)?.name || 'Block'}
              </div>
            </div>

            {(() => {
              const block = template.design_json.blocks.find(b => b.id === selectedBlock);
              if (!block) return null;

              const { content } = block;

              return (
                <div className="space-y-4">
                  {/* Common Properties for All Blocks */}
                  {(block.type === 'header' || block.type === 'text' || block.type === 'announcement') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
                        <textarea
                          value={content.text || content.title || content.message || ''}
                          onChange={(e) => {
                            const key = content.text !== undefined ? 'text' : 
                                       content.title !== undefined ? 'title' : 'message';
                            updateBlock(selectedBlock, { [key]: e.target.value });
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                          <select
                            value={content.fontSize || '16px'}
                            onChange={(e) => updateBlock(selectedBlock, { fontSize: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="12px">12px</option>
                            <option value="14px">14px</option>
                            <option value="16px">16px</option>
                            <option value="18px">18px</option>
                            <option value="20px">20px</option>
                            <option value="24px">24px</option>
                            <option value="28px">28px</option>
                            <option value="32px">32px</option>
                            <option value="36px">36px</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                          <select
                            value={content.fontWeight || 'normal'}
                            onChange={(e) => updateBlock(selectedBlock, { fontWeight: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="600">Semi-Bold</option>
                            <option value="300">Light</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
                        <div className="flex space-x-2">
                          {['left', 'center', 'right'].map(align => (
                            <button
                              key={align}
                              onClick={() => updateBlock(selectedBlock, { textAlign: align })}
                              className={`px-3 py-2 text-sm border rounded-md ${
                                (content.textAlign || 'left') === align 
                                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {align.charAt(0).toUpperCase() + align.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                        <input
                          type="color"
                          value={content.color || content.titleColor || '#374151'}
                          onChange={(e) => {
                            const key = content.color !== undefined ? 'color' : 'titleColor';
                            updateBlock(selectedBlock, { [key]: e.target.value });
                          }}
                          className="w-full h-10 border border-gray-300 rounded-md"
                        />
                      </div>
                    </>
                  )}

                  {/* Background Color for All Blocks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <input
                      type="color"
                      value={content.backgroundColor || '#ffffff'}
                      onChange={(e) => updateBlock(selectedBlock, { backgroundColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Padding Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                    <input
                      type="text"
                      value={content.padding || '20px'}
                      onChange={(e) => updateBlock(selectedBlock, { padding: e.target.value })}
                      placeholder="e.g., 20px or 10px 20px"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  {/* Image-specific properties */}
                  {block.type === 'image' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                        <input
                          type="url"
                          value={content.src || ''}
                          onChange={(e) => updateBlock(selectedBlock, { src: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                        <input
                          type="text"
                          value={content.alt || ''}
                          onChange={(e) => updateBlock(selectedBlock, { alt: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Describe the image"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                        <select
                          value={content.width || '100%'}
                          onChange={(e) => updateBlock(selectedBlock, { width: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="100%">Full Width</option>
                          <option value="75%">75%</option>
                          <option value="50%">50%</option>
                          <option value="25%">25%</option>
                          <option value="300px">300px</option>
                          <option value="400px">400px</option>
                          <option value="500px">500px</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Button-specific properties */}
                  {block.type === 'button' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                        <input
                          type="text"
                          value={content.text || ''}
                          onChange={(e) => updateBlock(selectedBlock, { text: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                        <input
                          type="url"
                          value={content.href || ''}
                          onChange={(e) => updateBlock(selectedBlock, { href: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
                          <input
                            type="color"
                            value={content.backgroundColor || '#3b82f6'}
                            onChange={(e) => updateBlock(selectedBlock, { backgroundColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                          <input
                            type="color"
                            value={content.color || '#ffffff'}
                            onChange={(e) => updateBlock(selectedBlock, { color: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                        <select
                          value={content.borderRadius || '6px'}
                          onChange={(e) => updateBlock(selectedBlock, { borderRadius: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="0px">Square</option>
                          <option value="4px">Slightly Rounded</option>
                          <option value="6px">Rounded</option>
                          <option value="12px">Very Rounded</option>
                          <option value="50px">Pill Shape</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Donation-specific properties */}
                  {block.type === 'donation' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
                        <input
                          type="text"
                          value={content.title || ''}
                          onChange={(e) => updateBlock(selectedBlock, { title: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={content.description || ''}
                          onChange={(e) => updateBlock(selectedBlock, { description: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount</label>
                          <input
                            type="number"
                            value={content.currentAmount || 0}
                            onChange={(e) => updateBlock(selectedBlock, { currentAmount: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Goal Amount</label>
                          <input
                            type="number"
                            value={content.goalAmount || 10000}
                            onChange={(e) => updateBlock(selectedBlock, { goalAmount: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Progress Bar Color</label>
                        <input
                          type="color"
                          value={content.progressColor || '#f59e0b'}
                          onChange={(e) => updateBlock(selectedBlock, { progressColor: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                        <input
                          type="text"
                          value={content.buttonText || ''}
                          onChange={(e) => updateBlock(selectedBlock, { buttonText: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Volunteer-specific properties */}
                  {block.type === 'volunteer' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={content.title || ''}
                          onChange={(e) => updateBlock(selectedBlock, { title: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={content.description || ''}
                          onChange={(e) => updateBlock(selectedBlock, { description: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Opportunities (one per line)</label>
                        <textarea
                          value={content.opportunities?.join('\n') || ''}
                          onChange={(e) => updateBlock(selectedBlock, { 
                            opportunities: e.target.value.split('\n').filter(line => line.trim()) 
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          rows={3}
                          placeholder="Event Setup&#10;Bake Sale&#10;Clean Up"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                        <input
                          type="text"
                          value={content.buttonText || ''}
                          onChange={(e) => updateBlock(selectedBlock, { buttonText: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Event-specific properties */}
                  {block.type === 'event' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                        <input
                          type="text"
                          value={content.title || ''}
                          onChange={(e) => updateBlock(selectedBlock, { title: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                          <input
                            type="date"
                            value={content.date || ''}
                            onChange={(e) => updateBlock(selectedBlock, { date: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                          <input
                            type="text"
                            value={content.time || ''}
                            onChange={(e) => updateBlock(selectedBlock, { time: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            placeholder="10:00 AM - 4:00 PM"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={content.location || ''}
                          onChange={(e) => updateBlock(selectedBlock, { location: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={content.description || ''}
                          onChange={(e) => updateBlock(selectedBlock, { description: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Image URL</label>
                        <input
                          type="url"
                          value={content.image || ''}
                          onChange={(e) => updateBlock(selectedBlock, { image: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="https://example.com/event-image.jpg"
                        />
                      </div>
                    </>
                  )}

                  {/* Divider-specific properties */}
                  {block.type === 'divider' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Line Style</label>
                        <select
                          value={content.style || 'solid'}
                          onChange={(e) => updateBlock(selectedBlock, { style: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Thickness</label>
                          <select
                            value={content.thickness || '2px'}
                            onChange={(e) => updateBlock(selectedBlock, { thickness: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="1px">1px</option>
                            <option value="2px">2px</option>
                            <option value="3px">3px</option>
                            <option value="4px">4px</option>
                            <option value="5px">5px</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                          <select
                            value={content.width || '80%'}
                            onChange={(e) => updateBlock(selectedBlock, { width: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="100%">Full Width</option>
                            <option value="80%">80%</option>
                            <option value="60%">60%</option>
                            <option value="40%">40%</option>
                            <option value="20%">20%</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Line Color</label>
                        <input
                          type="color"
                          value={content.color || '#e5e7eb'}
                          onChange={(e) => updateBlock(selectedBlock, { color: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded-md"
                        />
                      </div>
                    </>
                  )}

                  {/* Spacer-specific properties */}
                  {block.type === 'spacer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                      <select
                        value={content.height || '30px'}
                        onChange={(e) => updateBlock(selectedBlock, { height: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="10px">10px</option>
                        <option value="20px">20px</option>
                        <option value="30px">30px</option>
                        <option value="40px">40px</option>
                        <option value="50px">50px</option>
                        <option value="60px">60px</option>
                        <option value="80px">80px</option>
                        <option value="100px">100px</option>
                      </select>
                    </div>
                  )}

                  {/* Quote-specific properties */}
                  {block.type === 'quote' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                        <textarea
                          value={content.text || ''}
                          onChange={(e) => updateBlock(selectedBlock, { text: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                        <input
                          type="text"
                          value={content.author || ''}
                          onChange={(e) => updateBlock(selectedBlock, { author: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quote Color</label>
                          <input
                            type="color"
                            value={content.textColor || '#475569'}
                            onChange={(e) => updateBlock(selectedBlock, { textColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
                          <input
                            type="color"
                            value={content.borderColor || '#3b82f6'}
                            onChange={(e) => updateBlock(selectedBlock, { borderColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Delete Block Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        deleteBlock(selectedBlock);
                        setSelectedBlock(null);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Block
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
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
