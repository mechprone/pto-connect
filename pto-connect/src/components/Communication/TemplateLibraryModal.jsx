import React, { useState } from 'react';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  StarIcon,
  HeartIcon,
  GiftIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  PhotoIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  CakeIcon,
  TrophyIcon,
  BookOpenIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  SunIcon,
  FireIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const TemplateLibraryModal = ({ isOpen, onClose, onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [activeTab, setActiveTab] = useState('professional');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Comprehensive template library with 40+ professional templates
  const professionalTemplates = [
    // Event Templates
    {
      id: 'event-fall-festival',
      name: 'Fall Festival Celebration',
      category: 'events',
      style: 'festive',
      description: 'Warm autumn colors with festival theme',
      preview: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Fall+Festival',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🍂 Fall Festival 2024',
            subtitle: 'Join us for a magical autumn celebration!',
            backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fef3c7',
            padding: '60px 20px',
            textAlign: 'center'
          }
        },
        {
          type: 'calendar',
          content: {
            eventTitle: 'Fall Festival',
            eventDate: '2024-11-15',
            eventTime: '10:00 AM - 4:00 PM',
            location: 'School Playground',
            backgroundColor: '#fef3c7',
            textColor: '#92400e'
          }
        }
      ]
    },
    {
      id: 'event-spring-carnival',
      name: 'Spring Carnival',
      category: 'events',
      style: 'bright',
      description: 'Vibrant spring colors with carnival theme',
      preview: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Spring+Carnival',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🌸 Spring Carnival',
            subtitle: 'Celebrate the season with games, food, and fun!',
            backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#d1fae5'
          }
        }
      ]
    },
    {
      id: 'event-winter-wonderland',
      name: 'Winter Wonderland',
      category: 'events',
      style: 'elegant',
      description: 'Cool winter theme with elegant styling',
      preview: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Winter+Wonderland',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '❄️ Winter Wonderland',
            subtitle: 'A magical winter celebration for all families',
            backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#dbeafe'
          }
        }
      ]
    },
    {
      id: 'event-graduation',
      name: 'Graduation Celebration',
      category: 'events',
      style: 'formal',
      description: 'Formal graduation ceremony announcement',
      preview: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=Graduation',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🎓 Graduation Day',
            subtitle: 'Celebrating our amazing students!',
            backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#e9d5ff'
          }
        }
      ]
    },
    {
      id: 'event-talent-show',
      name: 'Talent Show',
      category: 'events',
      style: 'creative',
      description: 'Creative and colorful talent show theme',
      preview: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=Talent+Show',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🎭 Annual Talent Show',
            subtitle: 'Showcase your amazing talents!',
            backgroundImage: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fce7f3'
          }
        }
      ]
    },

    // Fundraising Templates
    {
      id: 'fundraising-technology',
      name: 'Technology Fund Drive',
      category: 'fundraising',
      style: 'modern',
      description: 'Modern tech-focused fundraising campaign',
      preview: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Tech+Fund',
      blocks: [
        {
          type: 'header',
          content: {
            text: '💻 Technology Fund Drive',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            fontSize: '28px',
            padding: '30px'
          }
        },
        {
          type: 'donation',
          content: {
            title: 'Bring Technology to Every Classroom',
            description: 'Help us purchase new computers, tablets, and interactive whiteboards.',
            goalAmount: 25000,
            currentAmount: 12500,
            buttonColor: '#6366f1',
            backgroundColor: '#f0f9ff'
          }
        }
      ]
    },
    {
      id: 'fundraising-playground',
      name: 'Playground Renovation',
      category: 'fundraising',
      style: 'playful',
      description: 'Fun playground renovation campaign',
      preview: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Playground',
      blocks: [
        {
          type: 'donation',
          content: {
            title: '🏰 New Playground Fund',
            description: 'Help us build a safe, modern playground for our children.',
            goalAmount: 50000,
            currentAmount: 28000,
            buttonColor: '#f59e0b',
            backgroundColor: '#fffbeb'
          }
        }
      ]
    },
    {
      id: 'fundraising-library',
      name: 'Library Enhancement',
      category: 'fundraising',
      style: 'academic',
      description: 'Academic library improvement campaign',
      preview: 'https://via.placeholder.com/300x200/059669/ffffff?text=Library',
      blocks: [
        {
          type: 'donation',
          content: {
            title: '📚 Library Enhancement Project',
            description: 'Expand our library with new books and reading spaces.',
            goalAmount: 15000,
            currentAmount: 8500,
            buttonColor: '#059669',
            backgroundColor: '#ecfdf5'
          }
        }
      ]
    },

    // Newsletter Templates
    {
      id: 'newsletter-monthly-classic',
      name: 'Classic Monthly Newsletter',
      category: 'newsletters',
      style: 'professional',
      description: 'Clean, professional monthly newsletter',
      preview: 'https://via.placeholder.com/300x200/374151/ffffff?text=Newsletter',
      blocks: [
        {
          type: 'header',
          content: {
            text: 'Monthly PTO Newsletter',
            backgroundColor: '#374151',
            color: '#ffffff',
            fontSize: '24px',
            padding: '25px'
          }
        },
        {
          type: 'text',
          content: {
            text: 'Dear PTO Families,\n\nWelcome to our monthly newsletter! Here are the latest updates from our school community.',
            fontSize: '16px',
            padding: '20px'
          }
        }
      ]
    },
    {
      id: 'newsletter-colorful',
      name: 'Colorful Family Newsletter',
      category: 'newsletters',
      style: 'bright',
      description: 'Bright and engaging family newsletter',
      preview: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Family+News',
      blocks: [
        {
          type: 'hero',
          content: {
            title: 'Family Newsletter',
            subtitle: 'Keeping our community connected',
            backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#d1fae5'
          }
        }
      ]
    },

    // Volunteer Templates
    {
      id: 'volunteer-general',
      name: 'General Volunteer Call',
      category: 'volunteers',
      style: 'friendly',
      description: 'Warm and inviting volunteer recruitment',
      preview: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=Volunteers',
      blocks: [
        {
          type: 'volunteer',
          content: {
            title: '🤝 We Need Amazing Volunteers!',
            description: 'Join our incredible team and make a difference in our school community.',
            opportunities: ['Event Planning', 'Classroom Support', 'Fundraising', 'Communications'],
            backgroundColor: '#faf5ff',
            textColor: '#7c3aed'
          }
        }
      ]
    },
    {
      id: 'volunteer-urgent',
      name: 'Urgent Volunteer Need',
      category: 'volunteers',
      style: 'urgent',
      description: 'Eye-catching urgent volunteer request',
      preview: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Urgent+Help',
      blocks: [
        {
          type: 'announcement',
          content: {
            title: 'Urgent: Volunteers Needed!',
            message: 'We need immediate help for our upcoming event. Can you spare a few hours?',
            backgroundColor: '#fef2f2',
            titleColor: '#dc2626',
            textColor: '#991b1b'
          }
        }
      ]
    },

    // Announcement Templates
    {
      id: 'announcement-important',
      name: 'Important School Notice',
      category: 'announcements',
      style: 'formal',
      description: 'Formal important announcement template',
      preview: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Important+Notice',
      blocks: [
        {
          type: 'announcement',
          content: {
            title: 'Important School Notice',
            message: 'Please read this important information regarding upcoming changes.',
            backgroundColor: '#f9fafb',
            titleColor: '#1f2937',
            textColor: '#374151'
          }
        }
      ]
    },
    {
      id: 'announcement-celebration',
      name: 'Celebration Announcement',
      category: 'announcements',
      style: 'festive',
      description: 'Joyful celebration announcement',
      preview: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Celebration',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🎉 Celebrating Our Success!',
            subtitle: 'Amazing news to share with our community',
            backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fef3c7'
          }
        }
      ]
    },

    // Meeting Templates
    {
      id: 'meeting-monthly',
      name: 'Monthly PTO Meeting',
      category: 'meetings',
      style: 'professional',
      description: 'Professional monthly meeting invitation',
      preview: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=PTO+Meeting',
      blocks: [
        {
          type: 'calendar',
          content: {
            eventTitle: 'Monthly PTO Meeting',
            eventDate: '2024-11-01',
            eventTime: '7:00 PM',
            location: 'School Library',
            backgroundColor: '#eff6ff',
            textColor: '#1d4ed8'
          }
        }
      ]
    },
    {
      id: 'meeting-emergency',
      name: 'Emergency Meeting',
      category: 'meetings',
      style: 'urgent',
      description: 'Urgent emergency meeting notice',
      preview: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Emergency+Meeting',
      blocks: [
        {
          type: 'announcement',
          content: {
            title: 'Emergency PTO Meeting',
            message: 'An urgent meeting has been called to discuss important matters.',
            backgroundColor: '#fef2f2',
            titleColor: '#dc2626',
            textColor: '#991b1b'
          }
        }
      ]
    },

    // Seasonal Templates
    {
      id: 'seasonal-back-to-school',
      name: 'Back to School Welcome',
      category: 'seasonal',
      style: 'academic',
      description: 'Welcoming back-to-school template',
      preview: 'https://via.placeholder.com/300x200/059669/ffffff?text=Back+to+School',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '📚 Welcome Back to School!',
            subtitle: 'Starting a new year of learning and growth',
            backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#d1fae5'
          }
        }
      ]
    },
    {
      id: 'seasonal-holiday',
      name: 'Holiday Greetings',
      category: 'seasonal',
      style: 'festive',
      description: 'Warm holiday greetings template',
      preview: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Holiday+Greetings',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🎄 Happy Holidays!',
            subtitle: 'Wishing all families joy and peace this season',
            backgroundImage: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fecaca'
          }
        }
      ]
    },
    {
      id: 'seasonal-summer',
      name: 'Summer Break',
      category: 'seasonal',
      style: 'bright',
      description: 'Bright summer break template',
      preview: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Summer+Break',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '☀️ Have a Great Summer!',
            subtitle: 'Enjoy your well-deserved break',
            backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fef3c7'
          }
        }
      ]
    },

    // Thank You Templates
    {
      id: 'thankyou-volunteers',
      name: 'Thank You Volunteers',
      category: 'thankyou',
      style: 'grateful',
      description: 'Heartfelt volunteer appreciation',
      preview: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=Thank+You',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '💖 Thank You Volunteers!',
            subtitle: 'Your dedication makes all the difference',
            backgroundImage: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fce7f3'
          }
        }
      ]
    },
    {
      id: 'thankyou-donors',
      name: 'Thank You Donors',
      category: 'thankyou',
      style: 'grateful',
      description: 'Appreciation for generous donors',
      preview: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Thank+Donors',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🙏 Thank You Donors!',
            subtitle: 'Your generosity supports our students',
            backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#d1fae5'
          }
        }
      ]
    },

    // Special Event Templates
    {
      id: 'special-science-fair',
      name: 'Science Fair',
      category: 'special',
      style: 'educational',
      description: 'Educational science fair template',
      preview: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Science+Fair',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🔬 Science Fair 2024',
            subtitle: 'Discover, Experiment, Learn!',
            backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#e0e7ff'
          }
        }
      ]
    },
    {
      id: 'special-art-show',
      name: 'Art Show Exhibition',
      category: 'special',
      style: 'creative',
      description: 'Creative art show template',
      preview: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=Art+Show',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🎨 Student Art Exhibition',
            subtitle: 'Celebrating creativity and imagination',
            backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#e9d5ff'
          }
        }
      ]
    },
    {
      id: 'special-book-fair',
      name: 'Book Fair',
      category: 'special',
      style: 'academic',
      description: 'Academic book fair template',
      preview: 'https://via.placeholder.com/300x200/059669/ffffff?text=Book+Fair',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '📖 Annual Book Fair',
            subtitle: 'Discover new worlds through reading',
            backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#d1fae5'
          }
        }
      ]
    },
    {
      id: 'special-sports-day',
      name: 'Sports Day',
      category: 'special',
      style: 'energetic',
      description: 'Energetic sports day template',
      preview: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Sports+Day',
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🏆 Sports Day 2024',
            subtitle: 'Get ready for fun and competition!',
            backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fef3c7'
          }
        }
      ]
    }
  ];

  const basicTemplates = [
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
    }
  ];

  // Community Shared Templates - Templates shared by other PTOs in district/platform
  const communityTemplates = [
    {
      id: 'community-movie-night',
      name: 'Family Movie Night',
      category: 'events',
      style: 'fun',
      description: 'Shared by Lincoln Elementary PTO - Great for outdoor movie events',
      author: 'Lincoln Elementary PTO',
      district: 'Metro School District',
      likes: 24,
      uses: 156,
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🍿 Family Movie Night Under the Stars',
            subtitle: 'Bring blankets and join us for a magical evening!',
            backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#ddd6fe'
          }
        },
        {
          type: 'calendar',
          content: {
            eventTitle: 'Outdoor Movie Night',
            eventDate: '2024-11-22',
            eventTime: '7:00 PM - 10:00 PM',
            location: 'School Football Field',
            backgroundColor: '#ede9fe',
            textColor: '#5b21b6'
          }
        }
      ]
    },
    {
      id: 'community-teacher-appreciation',
      name: 'Teacher Appreciation Week',
      category: 'thankyou',
      style: 'grateful',
      description: 'Shared by Riverside PTO - Perfect for showing teacher appreciation',
      author: 'Riverside Elementary PTO',
      district: 'Metro School District',
      likes: 89,
      uses: 342,
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🌟 Teacher Appreciation Week',
            subtitle: 'Celebrating our incredible educators!',
            backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#d1fae5'
          }
        },
        {
          type: 'text',
          content: {
            text: 'This week, we celebrate the amazing teachers who inspire, educate, and care for our children every day. Thank you for your dedication and passion!',
            fontSize: '16px',
            padding: '20px',
            backgroundColor: '#f0fdf4',
            color: '#166534'
          }
        }
      ]
    },
    {
      id: 'community-bake-sale',
      name: 'Ultimate Bake Sale',
      category: 'fundraising',
      style: 'sweet',
      description: 'Shared by Oakwood PTO - Raised $3,200 with this template!',
      author: 'Oakwood Elementary PTO',
      district: 'Metro School District',
      likes: 67,
      uses: 234,
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🧁 Ultimate Bake Sale Extravaganza',
            subtitle: 'Sweet treats for a sweet cause!',
            backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fef3c7'
          }
        },
        {
          type: 'donation',
          content: {
            title: 'Support Our Music Program',
            description: 'Every cupcake sold helps fund new instruments and music education.',
            goalAmount: 5000,
            currentAmount: 3200,
            buttonColor: '#f59e0b',
            backgroundColor: '#fffbeb'
          }
        }
      ]
    },
    {
      id: 'community-reading-challenge',
      name: 'Summer Reading Challenge',
      category: 'academic',
      style: 'educational',
      description: 'Shared by Maplewood PTO - Boosted reading participation by 40%',
      author: 'Maplewood Elementary PTO',
      district: 'Metro School District',
      likes: 45,
      uses: 189,
      blocks: [
        {
          type: 'hero',
          content: {
            title: '📚 Summer Reading Challenge 2024',
            subtitle: 'Read your way to amazing prizes!',
            backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#e9d5ff'
          }
        },
        {
          type: 'achievement',
          content: {
            title: '🏆 Reading Milestones',
            achievements: [
              '5 Books: Bookmark & Stickers',
              '10 Books: Library Tote Bag',
              '20 Books: $25 Bookstore Gift Card',
              '30+ Books: Special Recognition Ceremony'
            ],
            backgroundColor: '#faf5ff',
            titleColor: '#7c3aed',
            textColor: '#5b21b6'
          }
        }
      ]
    },
    {
      id: 'community-field-day',
      name: 'Epic Field Day',
      category: 'events',
      style: 'energetic',
      description: 'Shared by Sunnydale PTO - Students loved this format!',
      author: 'Sunnydale Elementary PTO',
      district: 'Metro School District',
      likes: 78,
      uses: 267,
      blocks: [
        {
          type: 'hero',
          content: {
            title: '🏃‍♂️ Epic Field Day 2024',
            subtitle: 'Games, fun, and friendly competition!',
            backgroundImage: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#fecaca'
          }
        },
        {
          type: 'highlight',
          content: {
            title: '🎯 Field Day Activities',
            text: '• Relay Races & Obstacle Courses\n• Water Balloon Toss\n• Three-Legged Race\n• Tug of War Championship\n• Face Painting Station\n• Healthy Snack Bar',
            backgroundColor: '#fef2f2',
            titleColor: '#dc2626',
            textColor: '#991b1b',
            borderColor: '#f87171'
          }
        }
      ]
    },
    {
      id: 'community-grandparents-day',
      name: 'Grandparents Day Celebration',
      category: 'events',
      style: 'heartwarming',
      description: 'Shared by Valley View PTO - Brought tears of joy to many families',
      author: 'Valley View Elementary PTO',
      district: 'Metro School District',
      likes: 92,
      uses: 178,
      blocks: [
        {
          type: 'hero',
          content: {
            title: '👴👵 Grandparents Day Celebration',
            subtitle: 'Honoring the wisdom and love of our grandparents',
            backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            titleColor: '#ffffff',
            subtitleColor: '#d1fae5'
          }
        },
        {
          type: 'calendar',
          content: {
            eventTitle: 'Grandparents Day Program',
            eventDate: '2024-11-08',
            eventTime: '2:00 PM - 4:00 PM',
            location: 'School Auditorium',
            backgroundColor: '#ecfdf5',
            textColor: '#166534'
          }
        }
      ]
    }
  ];

  const getTemplateLibrary = () => {
    switch (activeTab) {
      case 'professional':
        return professionalTemplates;
      case 'basic':
        return basicTemplates;
      case 'community':
        return communityTemplates;
      default:
        return professionalTemplates;
    }
  };

  const templateLibrary = getTemplateLibrary();

  const categories = [
    { value: 'all', label: 'All Templates', icon: StarIcon },
    { value: 'events', label: 'Events', icon: CalendarIcon },
    { value: 'fundraising', label: 'Fundraising', icon: GiftIcon },
    { value: 'newsletters', label: 'Newsletters', icon: DocumentTextIcon },
    { value: 'volunteers', label: 'Volunteers', icon: UserGroupIcon },
    { value: 'announcements', label: 'Announcements', icon: MegaphoneIcon },
    { value: 'meetings', label: 'Meetings', icon: BuildingOfficeIcon },
    { value: 'seasonal', label: 'Seasonal', icon: BeakerIcon },
    { value: 'thankyou', label: 'Thank You', icon: HeartIcon },
    { value: 'special', label: 'Special Events', icon: SparklesIcon }
  ];

  const styles = [
    { value: 'all', label: 'All Styles' },
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'festive', label: 'Festive' },
    { value: 'modern', label: 'Modern' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'playful', label: 'Playful' },
    { value: 'academic', label: 'Academic' },
    { value: 'creative', label: 'Creative' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'grateful', label: 'Grateful' }
  ];

  const filteredTemplates = templateLibrary.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStyle = selectedStyle === 'all' || template.style === selectedStyle;
    
    return matchesSearch && matchesCategory && matchesStyle;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
            <div className="flex items-center space-x-1 mt-2 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('professional')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'professional' ? 'bg-purple-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <SparklesIcon className="w-4 h-4 inline-block mr-1" />
                Professional
              </button>
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'basic' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 inline-block mr-1" />
                Basic
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'community' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserGroupIcon className="w-4 h-4 inline-block mr-1" />
                Community
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Style Filter */}
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {styles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map(template => {
                const categoryInfo = categories.find(cat => cat.value === template.category);
                const CategoryIcon = categoryInfo?.icon || StarIcon;
                
                return (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => onSelectTemplate(template)}
                  >
                    {/* Actual Template Thumbnail Preview */}
                    <div className="aspect-video bg-white relative overflow-hidden border-b border-gray-200">
                      {/* Generate actual template thumbnail */}
                      <div className="w-full h-full transform scale-[0.3] origin-top-left" style={{ width: '333%', height: '333%' }}>
                        <div className="w-full h-full bg-white">
                          {/* Render actual template blocks in miniature */}
                          {template.blocks.map((block, blockIndex) => {
                            switch (block.type) {
                              case 'hero':
                                return (
                                  <div
                                    key={blockIndex}
                                    className="text-center text-white px-8 py-12"
                                    style={{ 
                                      background: block.content.backgroundImage || '#3b82f6',
                                      color: block.content.titleColor || '#ffffff'
                                    }}
                                  >
                                    <h1 className="text-4xl font-bold mb-4" style={{ color: block.content.titleColor }}>
                                      {block.content.title}
                                    </h1>
                                    <p className="text-xl opacity-90" style={{ color: block.content.subtitleColor }}>
                                      {block.content.subtitle}
                                    </p>
                                  </div>
                                );
                              
                              case 'header':
                                return (
                                  <div
                                    key={blockIndex}
                                    className="text-center px-8 py-6"
                                    style={{ 
                                      backgroundColor: block.content.backgroundColor || '#f9fafb',
                                      color: block.content.color || '#1f2937'
                                    }}
                                  >
                                    <h2 className="text-3xl font-bold">
                                      {block.content.text}
                                    </h2>
                                  </div>
                                );
                              
                              case 'calendar':
                                return (
                                  <div
                                    key={blockIndex}
                                    className="px-8 py-6 mx-4 my-4 rounded-lg text-center"
                                    style={{ 
                                      backgroundColor: block.content.backgroundColor || '#eff6ff',
                                      color: block.content.textColor || '#1d4ed8'
                                    }}
                                  >
                                    <h3 className="text-2xl font-semibold mb-3">{block.content.eventTitle}</h3>
                                    <div className="space-y-2 text-lg">
                                      <p>📅 {new Date(block.content.eventDate).toLocaleDateString()}</p>
                                      <p>🕐 {block.content.eventTime}</p>
                                      <p>📍 {block.content.location}</p>
                                    </div>
                                  </div>
                                );
                              
                              case 'donation':
                                const progressPercentage = (block.content.currentAmount / block.content.goalAmount) * 100;
                                return (
                                  <div
                                    key={blockIndex}
                                    className="px-8 py-6 mx-4 my-4 rounded-lg"
                                    style={{ backgroundColor: block.content.backgroundColor || '#f0f9ff' }}
                                  >
                                    <h3 className="text-2xl font-bold mb-3">{block.content.title}</h3>
                                    <p className="text-gray-700 mb-4 text-lg">{block.content.description}</p>
                                    
                                    <div className="mb-4">
                                      <div className="flex justify-between text-base mb-2">
                                        <span>Raised: ${block.content.currentAmount?.toLocaleString()}</span>
                                        <span>Goal: ${block.content.goalAmount?.toLocaleString()}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                          className="h-4 rounded-full"
                                          style={{ 
                                            width: `${Math.min(progressPercentage, 100)}%`,
                                            backgroundColor: block.content.progressColor || '#3b82f6'
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                    
                                    <button
                                      className="w-full py-3 px-6 rounded-lg text-white font-semibold text-lg"
                                      style={{ backgroundColor: block.content.buttonColor || '#3b82f6' }}
                                    >
                                      {block.content.buttonText || 'Donate Now'}
                                    </button>
                                  </div>
                                );
                              
                              case 'volunteer':
                                return (
                                  <div
                                    key={blockIndex}
                                    className="px-8 py-6 mx-4 my-4 rounded-lg"
                                    style={{ 
                                      backgroundColor: block.content.backgroundColor || '#faf5ff',
                                      color: block.content.textColor || '#7c3aed'
                                    }}
                                  >
                                    <h3 className="text-2xl font-bold mb-3">{block.content.title}</h3>
                                    <p className="mb-4 text-lg">{block.content.description}</p>
                                    
                                    {block.content.opportunities && (
                                      <div className="mb-4">
                                        <h4 className="font-semibold mb-2 text-lg">Volunteer Opportunities:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-base">
                                          {block.content.opportunities.slice(0, 3).map((opportunity, idx) => (
                                            <li key={idx}>{opportunity}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    <button 
                                      className="py-3 px-6 rounded-lg text-white font-semibold text-lg"
                                      style={{ backgroundColor: block.content.buttonColor || '#7c3aed' }}
                                    >
                                      {block.content.buttonText || 'Sign Up'}
                                    </button>
                                  </div>
                                );
                              
                              case 'announcement':
                                return (
                                  <div
                                    key={blockIndex}
                                    className="px-8 py-6 mx-4 my-4 rounded-lg text-center"
                                    style={{ 
                                      backgroundColor: block.content.backgroundColor || '#fef2f2',
                                      color: block.content.textColor || '#991b1b'
                                    }}
                                  >
                                    <h3 
                                      className="text-2xl font-bold mb-3"
                                      style={{ color: block.content.titleColor || '#dc2626' }}
                                    >
                                      {block.content.title}
                                    </h3>
                                    <p className="text-lg">{block.content.message}</p>
                                  </div>
                                );
                              
                              default:
                                return (
                                  <div key={blockIndex} className="px-8 py-4 bg-gray-50 border-l-4 border-blue-500">
                                    <div className="text-lg text-gray-700">
                                      {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
                                    </div>
                                  </div>
                                );
                            }
                          })}
                          
                          {/* Mini footer */}
                          <div className="px-8 py-4 bg-gray-100 text-center text-sm text-gray-600 border-t">
                            <p>© 2024 Your PTO</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Overlay gradient for better text visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                      
                      {/* Preview Icon */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(template);
                          }}
                          className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                          title="Preview Template"
                        >
                          <PhotoIcon className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                          {template.style}
                        </span>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {template.description}
                      </p>
                      
                      {/* Community Template Metadata */}
                      {activeTab === 'community' && template.author && (
                        <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between text-xs text-green-700 mb-1">
                            <span className="font-medium">👥 {template.author}</span>
                            <span className="text-green-600">{template.district}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-green-600">
                            <span className="flex items-center">
                              <HeartIcon className="w-3 h-3 mr-1" />
                              {template.likes} likes
                            </span>
                            <span className="flex items-center">
                              <DocumentTextIcon className="w-3 h-3 mr-1" />
                              {template.uses} uses
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 capitalize">
                          {template.category}
                        </span>
                        <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                          Use Template
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredTemplates.length} of {templateLibrary.length} templates
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-600">{previewTemplate.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    onSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use This Template
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-100">
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Render Template Preview */}
                {previewTemplate.blocks.map((block, index) => {
                  switch (block.type) {
                    case 'hero':
                      return (
                        <div
                          key={index}
                          className="text-center text-white p-12"
                          style={{ 
                            background: block.content.backgroundImage || '#3b82f6',
                            color: block.content.titleColor || '#ffffff'
                          }}
                        >
                          <h1 className="text-3xl font-bold mb-4" style={{ color: block.content.titleColor }}>
                            {block.content.title}
                          </h1>
                          <p className="text-lg opacity-90" style={{ color: block.content.subtitleColor }}>
                            {block.content.subtitle}
                          </p>
                        </div>
                      );
                    
                    case 'header':
                      return (
                        <div
                          key={index}
                          className="text-center p-8"
                          style={{ 
                            backgroundColor: block.content.backgroundColor || '#f9fafb',
                            color: block.content.color || '#1f2937'
                          }}
                        >
                          <h2 className="text-2xl font-bold">
                            {block.content.text}
                          </h2>
                        </div>
                      );
                    
                    case 'text':
                      return (
                        <div key={index} className="p-6">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {block.content.text}
                          </p>
                        </div>
                      );
                    
                    case 'calendar':
                      return (
                        <div
                          key={index}
                          className="p-6 m-4 rounded-lg text-center"
                          style={{ 
                            backgroundColor: block.content.backgroundColor || '#eff6ff',
                            color: block.content.textColor || '#1d4ed8'
                          }}
                        >
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">{block.content.eventTitle}</h3>
                            <p className="text-lg">📅 {new Date(block.content.eventDate).toLocaleDateString()}</p>
                            <p className="text-lg">🕐 {block.content.eventTime}</p>
                            <p className="text-lg">📍 {block.content.location}</p>
                          </div>
                        </div>
                      );
                    
                    case 'donation':
                      const progressPercentage = (block.content.currentAmount / block.content.goalAmount) * 100;
                      return (
                        <div
                          key={index}
                          className="p-6 m-4 rounded-lg"
                          style={{ backgroundColor: block.content.backgroundColor || '#f0f9ff' }}
                        >
                          <h3 className="text-xl font-bold mb-3">{block.content.title}</h3>
                          <p className="text-gray-700 mb-4">{block.content.description}</p>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Raised: ${block.content.currentAmount?.toLocaleString()}</span>
                              <span>Goal: ${block.content.goalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="h-3 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(progressPercentage, 100)}%`,
                                  backgroundColor: block.content.buttonColor || '#3b82f6'
                                }}
                              ></div>
                            </div>
                            <div className="text-center mt-2 text-sm text-gray-600">
                              {Math.round(progressPercentage)}% of goal reached
                            </div>
                          </div>
                          
                          <button
                            className="w-full py-3 px-6 rounded-lg text-white font-semibold"
                            style={{ backgroundColor: block.content.buttonColor || '#3b82f6' }}
                          >
                            Donate Now
                          </button>
                        </div>
                      );
                    
                    case 'volunteer':
                      return (
                        <div
                          key={index}
                          className="p-6 m-4 rounded-lg"
                          style={{ 
                            backgroundColor: block.content.backgroundColor || '#faf5ff',
                            color: block.content.textColor || '#7c3aed'
                          }}
                        >
                          <h3 className="text-xl font-bold mb-3">{block.content.title}</h3>
                          <p className="mb-4">{block.content.description}</p>
                          
                          {block.content.opportunities && (
                            <div className="mb-4">
                              <h4 className="font-semibold mb-2">Volunteer Opportunities:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {block.content.opportunities.map((opportunity, idx) => (
                                  <li key={idx}>{opportunity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <button className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                            Sign Up to Volunteer
                          </button>
                        </div>
                      );
                    
                    case 'announcement':
                      return (
                        <div
                          key={index}
                          className="p-6 m-4 rounded-lg text-center"
                          style={{ 
                            backgroundColor: block.content.backgroundColor || '#fef2f2',
                            color: block.content.textColor || '#991b1b'
                          }}
                        >
                          <h3 
                            className="text-xl font-bold mb-3"
                            style={{ color: block.content.titleColor || '#dc2626' }}
                          >
                            {block.content.title}
                          </h3>
                          <p className="text-lg">{block.content.message}</p>
                        </div>
                      );
                    
                    default:
                      return null;
                  }
                })}
                
                {/* Footer */}
                <div className="p-6 bg-gray-50 text-center text-sm text-gray-600 border-t">
                  <p>© 2024 Your PTO | <a href="#" className="text-blue-600">Contact Us</a> | <a href="#" className="text-blue-600">Unsubscribe</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibraryModal;
