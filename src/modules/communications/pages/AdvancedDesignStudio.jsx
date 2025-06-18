import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Type, Image, Square, Minus, 
  Save, Eye, Sparkles, 
  ZoomIn, ZoomOut,
  Search, Palette,
  Mail, MessageSquare, Share2
} from 'lucide-react';

// Builder Modes
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
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSection, setTemplateSection] = useState('professional'); // professional, basic, shared
  const [builderMode, setBuilderMode] = useState(BuilderModes.EMAIL);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const canvasRef = useRef(null);

  // Console logging for debugging
  useEffect(() => {
    console.log('AdvancedDesignStudio mounted successfully');
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

  // Professional Unlayer-style templates
  const professionalTemplates = [
    // 1. Back to School Night
    {
      id: 'back-to-school-night',
      name: 'Back to School Night',
      category: 'Event',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmM4NjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzE3Mjg0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QmFjayB0byBTY2hvb2w8L3RleHQ+PC9zdmc+',
      description: 'Invite families to Back to School Night with this welcoming template.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Back to School Night', style: { fontSize: '36px', fontWeight: 'bold', color: '#172845', textAlign: 'center', padding: '30px', backgroundColor: '#fbc860', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Join us for an evening of fun, learning, and community as we kick off the new school year!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '32px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 2. Fall Festival
    {
      id: 'fall-festival',
      name: 'Fall Festival',
      category: 'Event',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmZTYyMDAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzg0NDMwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RmFsbCBGZXN0aXZhbDwvdGV4dD48L3N2Zz4=',
      description: 'Celebrate autumn with a festive invitation for your school community.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Fall Festival', style: { fontSize: '36px', fontWeight: 'bold', color: '#844300', textAlign: 'center', padding: '30px', backgroundColor: '#fe6200', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Games, food, and fun for the whole family! Don\'t miss our annual Fall Festival.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '32px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 3. Book Fair
    {
      id: 'book-fair',
      name: 'Book Fair',
      category: 'Fundraiser',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiM2YmM2ZWIiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzI2NTY2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Qm9vayBGYWlyPC90ZXh0Pjwvc3ZnPg==',
      description: 'Promote your school book fair and encourage reading!',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Book Fair', style: { fontSize: '36px', fontWeight: 'bold', color: '#265668', textAlign: 'center', padding: '30px', backgroundColor: '#6bc6eb', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Support our library and foster a love of reading. Shop the Book Fair this week!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '32px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 4. Fun Run
    {
      id: 'fun-run',
      name: 'Fun Run Fundraiser',
      category: 'Fundraiser',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYjYwNjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RnVuIFJ1bjwvdGV4dD48L3N2Zz4=',
      description: 'Get everyone moving and giving with a fun run event template.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Fun Run Fundraiser', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fb6060', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Lace up your sneakers and join us for a day of fitness and fun!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '32px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 5. Auction Night
    {
      id: 'auction-night',
      name: 'Auction Night',
      category: 'Fundraiser',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmYwYzAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwNTYwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QXVjdGlvbjwvdGV4dD48L3N2Zz4=',
      description: 'Elegant invitation for your annual auction fundraiser.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Auction Night', style: { fontSize: '36px', fontWeight: 'bold', color: '#605600', textAlign: 'center', padding: '30px', backgroundColor: '#fbf0c0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Bid on amazing items and support our school programs!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '32px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 6. Carnival
    {
      id: 'school-carnival',
      name: 'School Carnival',
      category: 'Event',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYjYwY2YiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwYyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2Fybml2YWw8L3RleHQ+PC9zdmc+',
      description: 'Bright and playful template for your school carnival.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'School Carnival', style: { fontSize: '36px', fontWeight: 'bold', color: '#60340c', textAlign: 'center', padding: '30px', backgroundColor: '#fb60cf', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Games, prizes, and fun for all ages! Join us for a day of excitement.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 7. Volunteer Signup
    {
      id: 'volunteer-signup',
      name: 'Volunteer Signup',
      category: 'Community',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiM2MGY2YjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzI2NTY2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Vm9sdW50ZWVyPC90ZXh0Pjwvc3ZnPg==',
      description: 'Encourage parents and community members to volunteer.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Volunteer Signup', style: { fontSize: '36px', fontWeight: 'bold', color: '#265668', textAlign: 'center', padding: '30px', backgroundColor: '#60f6b0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'We need your help! Sign up to volunteer and make a difference.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 8. Meeting Reminder
    {
      id: 'meeting-reminder',
      name: 'Meeting Reminder',
      category: 'Reminder',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiM2MGY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzI2NTY2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TWVldGluZzwvdGV4dD48L3N2Zz4=',
      description: 'Remind your group about upcoming meetings.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Meeting Reminder', style: { fontSize: '36px', fontWeight: 'bold', color: '#265668', textAlign: 'center', padding: '30px', backgroundColor: '#60f6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Don\'t forget our next meeting! Check the agenda and RSVP below.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 9. RSVP Request
    {
      id: 'rsvp-request',
      name: 'RSVP Request',
      category: 'Reminder',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2YjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UlNWUDwvdGV4dD48L3N2Zz4=',
      description: 'Request RSVPs for events and meetings.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'RSVP Request', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6b0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Please let us know if you can attend. Your response helps us plan!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 10. Principal's Message
    {
      id: 'principal-message',
      name: 'Principal\'s Message',
      category: 'Announcement',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJpbmNpcGFsPC90ZXh0Pjwvc3ZnPg==',
      description: 'Share a message from the principal or school leader.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'A Message from the Principal', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Dear families, we are excited to share important updates and celebrate our successes together.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 11. Thank You Volunteers
    {
      id: 'thank-you-volunteers',
      name: 'Thank You Volunteers',
      category: 'Community',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2YjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGhhbmsgWW91PC90ZXh0Pjwvc3ZnPg==',
      description: 'Show appreciation for your amazing volunteers.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Thank You, Volunteers!', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6b0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'We couldn\'t do it without you! Thank you for your time and dedication.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 12. Teacher Spotlight
    {
      id: 'teacher-spotlight',
      name: 'Teacher Spotlight',
      category: 'Announcement',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVhY2hlcjwvdGV4dD48L3N2Zz4=',
      description: 'Highlight a teacher or staff member making a difference.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Teacher Spotlight', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'This month, we celebrate the dedication and passion of our amazing teachers.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 13. Spirit Week
    {
      id: 'spirit-week',
      name: 'Spirit Week',
      category: 'Event',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3Bpcml0IFdlZWs8L3RleHQ+PC9zdmc+',
      description: 'Get everyone excited for Spirit Week with this colorful template.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Spirit Week', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Show your school spirit! Dress up, participate, and have fun all week long.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 14. Field Day
    {
      id: 'field-day',
      name: 'Field Day',
      category: 'Event',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RmllbGQgRGF5PC90ZXh0Pjwvc3ZnPg==',
      description: 'Announce your school\'s annual Field Day with this energetic template.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Field Day', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Join us for a day of games, teamwork, and outdoor fun!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 15. Donation Drive
    {
      id: 'donation-drive',
      name: 'Donation Drive',
      category: 'Fundraiser',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RG9uYXRpb24gRHJpdmU8L3RleHQ+PC9zdmc+',
      description: 'Encourage donations for your next drive or campaign.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Donation Drive', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Help us reach our goal! Every contribution makes a difference.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 16. Parent-Teacher Conference
    {
      id: 'parent-teacher-conference',
      name: 'Parent-Teacher Conference',
      category: 'Event',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGFyZW50LVRlYWNoZXI8L3RleHQ+PC9zdmc+',
      description: 'Schedule and remind families about conferences.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Parent-Teacher Conference', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Meet with your child\'s teacher to discuss progress and goals.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 17. School Newsletter
    {
      id: 'school-newsletter',
      name: 'School Newsletter',
      category: 'Newsletter',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2Nob29sIE5ld3NsZXR0ZXI8L3RleHQ+PC9zdmc+',
      description: 'A classic school newsletter template for regular updates.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'School Newsletter', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Stay up to date with the latest news, events, and announcements.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 18. Spirit Wear Sale
    {
      id: 'spirit-wear-sale',
      name: 'Spirit Wear Sale',
      category: 'Fundraiser',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3Bpcml0IFdlYXI8L3RleHQ+PC9zdmc+',
      description: 'Promote your spirit wear sale and boost school pride.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Spirit Wear Sale', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Show your school spirit! Order your spirit wear today.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 19. End of Year Celebration
    {
      id: 'end-of-year-celebration',
      name: 'End of Year Celebration',
      category: 'Event',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RW5kIG9mIFllYXI8L3RleHQ+PC9zdmc+',
      description: 'Celebrate the end of the school year with this festive template.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'End of Year Celebration', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Join us for a celebration of our students\' achievements and a great year!', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    },
    // 20. General Announcement
    {
      id: 'general-announcement',
      name: 'General Announcement',
      category: 'Announcement',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmYmY2ZjAiLz48dGV4dCB4PSIxNTAiIHk9IjcwIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzYwMzQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QW5ub3VuY2VtZW50PC90ZXh0Pjwvc3ZnPg==',
      description: 'A flexible template for any school-related announcement.',
      isProfessional: true,
      elements: [
        { type: 'header', content: 'Announcement', style: { fontSize: '36px', fontWeight: 'bold', color: '#603400', textAlign: 'center', padding: '30px', backgroundColor: '#fbf6f0', borderRadius: '8px', width: '100%', marginBottom: '20px' } },
        { type: 'text', content: 'Stay tuned for important updates and information.', style: { fontSize: '18px', color: '#374151', textAlign: 'center', padding: '20px', lineHeight: '1.6', width: '100%' } }
      ]
    }
  ];

  // Basic templates (current simple ones)
  const basicTemplates = [
    {
      id: 'welcome-newsletter',
      name: 'Welcome Back Newsletter',
      category: 'Newsletter',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZGJlYWZlIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzFlNDBhZiIgcng9IjQiLz4KPHRleHQgeD0iMTUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPldlbGNvbWUgQmFjayE8L3RleHQ+CjxyZWN0IHg9IjIwIiB5PSI4MCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNlNWU3ZWIiIHJ4PSI0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzM3NDE1MSI+V2UgYXJlIGV4Y2l0ZWQgdG8gc3RhcnQgYW5vdGhlcjwvdGV4dD4KPHRleHQgeD0iMzAiIHk9IjExNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzc0MTUxIj5hbWF6aW5nIHNjaG9vbCB5ZWFyIHRvZ2V0aGVyITwvdGV4dD4KPC9zdmc+',
      description: 'Professional welcome back newsletter',
      elements: [
        {
          type: 'header',
          content: 'Welcome Back to School!',
          style: { 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1e40af', 
            textAlign: 'center',
            padding: '30px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            width: '100%',
            marginBottom: '20px'
          }
        },
        {
          type: 'text',
          content: 'We are excited to start another amazing school year together! This year brings new opportunities, exciting events, and wonderful memories to be made.',
          style: { 
            fontSize: '18px', 
            color: '#374151', 
            textAlign: 'center',
            padding: '20px',
            lineHeight: '1.6',
            width: '100%'
          }
        }
      ]
    },
    {
      id: 'fall-festival',
      name: 'Fall Festival Invitation',
      category: 'Events',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmVmM2M3Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2Q5NzcwNiIgcng9IjQiLz4KPHRleHQgeD0iMTUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZhbGwgRmVzdGl2YWwgMjAyNDwvdGV4dD4KPGNpcmNsZSBjeD0iNzAiIGN5PSIxMjAiIHI9IjE1IiBmaWxsPSIjZjU5ZTBiIi8+CjxjaXJjbGUgY3g9IjIzMCIgY3k9IjEyMCIgcj0iMTUiIGZpbGw9IiNlZjQ0NDQiLz4KPHRleHQgeD0iMTUwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Sm9pbiB1cyBmb3IgZm9vZCwgZnVuLCBhbmQgY29tbXVuaXR5ITwvdGV4dD4KPC9zdmc+',
      description: 'Festive fall event invitation',
      elements: [
        {
          type: 'header',
          content: 'Fall Festival 2024',
          style: { 
            fontSize: '42px', 
            fontWeight: 'bold', 
            color: '#d97706', 
            textAlign: 'center',
            padding: '25px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            width: '100%',
            marginBottom: '20px'
          }
        },
        {
          type: 'text',
          content: 'Join us for food, fun, and community spirit! Games, prizes, delicious treats, and memories for the whole family.',
          style: { 
            fontSize: '20px', 
            color: '#374151', 
            textAlign: 'center',
            padding: '20px',
            lineHeight: '1.5',
            width: '100%'
          }
        }
      ]
    },
    {
      id: 'event-announcement',
      name: 'Event Announcement',
      category: 'Events',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmVlMmUyIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2RjMjYyNiIgcng9IjQiLz4KPHRleHQgeD0iMTUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNwZWNpYWwgRXZlbnQ8L3RleHQ+Cjxwb2x5Z29uIHBvaW50cz0iMTUwLDgwIDEzNSwxMTAgMTY1LDExMCIgZmlsbD0iI2RjMjYyNiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Kb2luIHVzIGZvciBhbiB1bmZvcmdldHRhYmxlIGV4cGVyaWVuY2UhPC90ZXh0Pgo8L3N2Zz4=',
      description: 'Eye-catching event announcement',
      elements: [
        {
          type: 'header',
          content: 'Important Announcement',
          style: { 
            fontSize: '38px', 
            fontWeight: 'bold', 
            color: '#dc2626', 
            textAlign: 'center',
            padding: '25px',
            backgroundColor: '#fee2e2',
            borderRadius: '8px',
            width: '100%',
            marginBottom: '20px'
          }
        },
        {
          type: 'text',
          content: 'Join us for an unforgettable experience! Mark your calendars for this special event.',
          style: { 
            fontSize: '18px', 
            color: '#374151', 
            textAlign: 'center',
            padding: '20px',
            lineHeight: '1.6',
            width: '100%'
          }
        }
      ]
    }
  ];

  // Shared templates from other PTOs
  const sharedTemplates = [
    {
      id: 'shared-fundraiser',
      name: 'Fundraiser Success Story',
      category: 'Fundraising',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnNCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZiYmYyNCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y1OWUwYiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2c0KSIvPjx0ZXh0IHg9IjE1MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XRSBESUQgSVQhPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4kNSxwMDA8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SQUlTRUQhPC90ZXh0PjxyZWN0IHg9IjIwIiB5PSIxNDAiIHdpZHRoPSIyNjAiIGhlaWdodD0iNDAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiIHJ4PSI0Ii8+PC9zdmc+',
      description: 'Shared by Oakwood Elementary PTO',
      isShared: true,
      sharedBy: 'Oakwood Elementary PTO',
      elements: [
        {
          type: 'header',
          content: 'FUNDRAISING SUCCESS!',
          style: { 
            fontSize: '42px', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            textAlign: 'center',
            padding: '35px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            borderRadius: '12px',
            width: '100%',
            marginBottom: '25px'
          }
        },
        {
          type: 'text',
          content: 'Thanks to your incredible support, we exceeded our fundraising goal! Your contributions will make a real difference in our students\' education.',
          style: { 
            fontSize: '18px', 
            color: '#374151', 
            textAlign: 'center',
            padding: '25px',
            lineHeight: '1.6',
            width: '100%',
            backgroundColor: '#fffbeb',
            borderRadius: '8px'
          }
        }
      ]
    },
    {
      id: 'shared-volunteer',
      name: 'Volunteer Appreciation',
      category: 'Community',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnNSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2VjNDg5OSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2RkMjQ3NiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2c1KSIvPjx0ZXh0IHg9IjE1MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5USEFOSYOU8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPllPVTwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZPUiBZT1VSIFNVUFBPUlQ8L3RleHQ+PHJlY3QgeD0iMjAiIHk9IjE0MCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIgcng9IjQiLz48L3N2Zz4=',
      description: 'Shared by Riverside Middle School PTO',
      isShared: true,
      sharedBy: 'Riverside Middle School PTO',
      elements: [
        {
          type: 'header',
          content: 'THANK YOU VOLUNTEERS!',
          style: { 
            fontSize: '38px', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            textAlign: 'center',
            padding: '35px',
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            borderRadius: '12px',
            width: '100%',
            marginBottom: '25px'
          }
        },
        {
          type: 'text',
          content: 'Your dedication and hard work make our school community stronger. We couldn\'t do it without amazing volunteers like you!',
          style: { 
            fontSize: '18px', 
            color: '#374151', 
            textAlign: 'center',
            padding: '25px',
            lineHeight: '1.6',
            width: '100%',
            backgroundColor: '#fdf2f8',
            borderRadius: '8px'
          }
        }
      ]
    }
  ];

  // Get current template set based on section
  const getCurrentTemplates = () => {
    switch (templateSection) {
      case 'professional':
        return professionalTemplates;
      case 'basic':
        return basicTemplates;
      case 'shared':
        return sharedTemplates;
      default:
        return basicTemplates;
    }
  };

  // Professional drag elements
  const dragElements = [
    { 
      type: 'text', 
      icon: Type, 
      label: 'Text', 
      defaultContent: 'Add your text here',
      defaultStyle: {
        fontSize: '16px',
        color: '#374151',
        lineHeight: '1.6',
        padding: '10px',
        width: '100%'
      }
    },
    { 
      type: 'header', 
      icon: Type, 
      label: 'Header', 
      defaultContent: 'Your Header Here',
      defaultStyle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        padding: '20px',
        width: '100%'
      }
    },
    { 
      type: 'image', 
      icon: Image, 
      label: 'Image', 
      defaultSrc: 'https://picsum.photos/400/250?random=99',
      defaultStyle: {
        width: '100%',
        borderRadius: '8px'
      }
    },
    { 
      type: 'button', 
      icon: Square, 
      label: 'Button', 
      defaultContent: 'Click Here',
      defaultStyle: {
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '15px 30px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        textAlign: 'center',
        border: 'none',
        cursor: 'pointer'
      }
    },
    { 
      type: 'divider', 
      icon: Minus, 
      label: 'Divider', 
      defaultContent: '',
      defaultStyle: {
        height: '2px',
        backgroundColor: '#e5e7eb',
        width: '100%',
        margin: '20px 0'
      }
    }
  ];

  // Use Template function
  const useTemplate = (template) => {
    try {
      console.log('Using template:', template.name);
      const newElements = template.elements.map((element, index) => ({
        ...element,
        id: `element_${Date.now()}_${index}`,
        x: 20, // Start closer to left edge
        y: 20 + (index * 80) // Tighter vertical spacing
      }));
      setCanvas(newElements);
      setSelectedElement(null);
      console.log('Template applied successfully', newElements);
    } catch (error) {
      console.error('Template error:', error);
    }
  };

  // Drag Element Component
  const DragElement = ({ element }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'element',
      item: { 
        elementType: element.type,
        defaultContent: element.defaultContent || '',
        defaultSrc: element.defaultSrc || '',
        defaultStyle: element.defaultStyle || {}
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
          isDragging ? 'opacity-50 bg-blue-100' : ''
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          <Icon className="w-6 h-6 text-gray-600" />
          <span className="text-sm text-gray-700">{element.label}</span>
          {isDragging && (
            <span className="text-xs text-blue-600 font-medium">Dragging...</span>
          )}
        </div>
      </div>
    );
  };

  // Canvas Drop Zone
  const DropZone = () => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'element',
      drop: (item, monitor) => {
        try {
          console.log('🎯 DROP EVENT TRIGGERED!', item);
          const offset = monitor.getClientOffset();
          const canvasRect = canvasRef.current?.getBoundingClientRect();
          
          console.log('📍 Drop details:', {
            offset,
            canvasRect,
            hasCanvasRef: !!canvasRef.current,
            itemType: item.elementType
          });
          
          if (!offset || !canvasRect) {
            console.log('❌ Missing offset or canvas rect');
            return;
          }
          
          const newElement = {
            id: `element_${Date.now()}_${Math.random()}`,
            type: item.elementType,
            content: item.defaultContent || 'New Content',
            src: item.defaultSrc || '',
            x: Math.max(10, offset.x - canvasRect.left - 50),
            y: Math.max(10, offset.y - canvasRect.top - 20),
            style: {
              ...item.defaultStyle,
              // Ensure proper positioning for elements
              position: item.defaultStyle?.width === '100%' ? 'static' : 'absolute'
            }
          };
          
          console.log('✅ Creating element:', newElement);
          setCanvas(prev => {
            const updated = [...prev, newElement];
            console.log('🎨 Canvas updated, total elements:', updated.length);
            return updated;
          });
          setSelectedElement(newElement);
        } catch (error) {
          console.error('❌ Drop error:', error);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }), []);

    return (
      <div
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        className={`relative bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-[600px] transition-colors ${
          isOver ? 'border-blue-500 bg-blue-50' : ''
        } ${canDrop ? 'border-green-400' : ''}`}
        style={{ 
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        {/* Debug overlays */}
        {isOver && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs z-50">
            🎯 DROP ZONE ACTIVE
          </div>
        )}
        {canDrop && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs z-50">
            ✅ CAN DROP
          </div>
        )}
        
        {canvas.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => setSelectedElement(element)}
            onUpdate={(updated) => {
              setCanvas(prev => prev.map(el => el.id === element.id ? updated : el));
              setSelectedElement(updated);
            }}
          />
        ))}
        
        {canvas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Drag elements here to start designing</p>
              <p className="text-sm">Choose from templates or build from scratch</p>
              <div className="mt-4 text-xs bg-gray-100 p-2 rounded">
                Canvas: {canvas.length} elements | Can Drop: {canDrop ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Canvas Element Component
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
      const baseStyle = {
        ...element.style,
        cursor: 'pointer',
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '2px',
        display: 'block',
        boxSizing: 'border-box'
      };

      switch (element.type) {
        case 'text':
          return isEditing ? (
            <textarea
              value={element.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              className="w-full bg-transparent border-none outline-none resize-none"
              style={{ ...baseStyle, minHeight: '100px' }}
              autoFocus
            />
          ) : (
            <div style={baseStyle}>
              {element.content.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          );
          
        case 'header':
          return isEditing ? (
            <input
              type="text"
              value={element.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="w-full bg-transparent border-none outline-none"
              style={{ ...baseStyle, fontSize: 'inherit', fontWeight: 'inherit' }}
              autoFocus
            />
          ) : (
            <h1 style={baseStyle}>
              {element.content}
            </h1>
          );
          
        case 'image':
          return (
            <img
              src={element.src}
              alt="Design element"
              style={{ 
                ...baseStyle, 
                maxWidth: element.style?.width || '100%', 
                height: 'auto',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200/f3f4f6/6b7280?text=Image+Placeholder';
              }}
            />
          );
          
        case 'button':
          return (
            <button
              style={{
                ...baseStyle,
                backgroundColor: element.style?.backgroundColor || '#3b82f6',
                color: element.style?.color || 'white',
                padding: element.style?.padding || '15px 30px',
                borderRadius: element.style?.borderRadius || '8px',
                border: 'none',
                fontSize: element.style?.fontSize || '16px',
                fontWeight: element.style?.fontWeight || '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
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
                ...baseStyle,
                border: 'none',
                height: element.style?.height || '2px',
                backgroundColor: element.style?.backgroundColor || '#e5e7eb',
                width: '100%',
                margin: element.style?.margin || '20px 0'
              }}
            />
          );
          
        default:
          return <div style={baseStyle}>Unknown element: {element.type}</div>;
      }
    };

    const elementWidth = element.style?.width === '100%' ? 'calc(100% - 40px)' : 'auto';
    const isFullWidth = element.style?.width === '100%';

    return (
      <div
        className="absolute"
        style={{
          left: isFullWidth ? 20 : element.x,
          top: element.y,
          width: elementWidth,
          minWidth: isFullWidth ? 'auto' : '50px',
          minHeight: '30px',
          zIndex: isSelected ? 10 : 1
        }}
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
      >
        {renderElement()}
        {isSelected && (
          <div className="absolute -top-6 -left-1 text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center space-x-2 z-20">
            <span>{element.type}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Delete element
                setCanvas(prev => prev.filter(el => el.id !== element.id));
                setSelectedElement(null);
              }}
              className="text-white hover:text-red-200 text-xs"
              title="Delete element"
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  };

  // Mode configuration
  const getModeConfig = (mode) => {
    const configs = {
      email: { label: '📧 Email', icon: Mail },
      sms: { label: '📱 SMS', icon: MessageSquare },
      flyer: { label: '📄 Flyer', icon: Square },
      social: { label: '📱 Social Post', icon: Share2 },
      announcement: { label: '📢 Announcement', icon: Type }
    };
    return configs[mode] || configs.email;
  };

  // Filter templates
  const getFilteredTemplates = () => {
    let filtered = getCurrentTemplates();
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getTemplateCategories = () => {
    const currentTemplates = getCurrentTemplates();
    const categories = ['all'];
    const counts = { all: currentTemplates.length };
    
    currentTemplates.forEach(template => {
      const category = template.category.toLowerCase();
      if (!categories.includes(category)) {
        categories.push(category);
        counts[category] = 0;
      }
      counts[category]++;
    });
    
    return categories.map(cat => ({
      id: cat,
      name: cat === 'all' ? 'All Templates' : cat.charAt(0).toUpperCase() + cat.slice(1),
      count: counts[cat]
    }));
  };

  const updateElementStyle = (styleUpdates) => {
    if (!selectedElement) return;
    
    const updated = {
      ...selectedElement,
      style: { ...selectedElement.style, ...styleUpdates }
    };
    
    setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
    setSelectedElement(updated);
  };

  // Error handling for the component
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('AdvancedDesignStudio error:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication Designer Error</h2>
          <p className="text-gray-600 mb-4">There was an issue loading the design studio.</p>
          <button 
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-100 flex">
        {/* Debug info in corner */}
        <div className="fixed bottom-4 right-4 bg-black text-green-400 p-2 rounded text-xs z-50">
          Elements: {canvas.length} | Mode: {builderMode}
        </div>

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
                {/* Templates Button */}
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Palette className="w-5 h-5" />
                  <span>Choose Template</span>
                </button>
                
                {/* Quick Template Preview */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-medium text-gray-900 mb-2">Quick Start</h3>
                  <p className="text-sm text-gray-600 mb-3">Start with a professional template or build from scratch</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setTemplateSection('professional');
                        setShowTemplateModal(true);
                      }}
                      className="p-2 border border-gray-300 rounded text-xs hover:bg-gray-50"
                    >
                      Professional
                    </button>
                    <button
                      onClick={() => {
                        setTemplateSection('basic');
                        setShowTemplateModal(true);
                      }}
                      className="p-2 border border-gray-300 rounded text-xs hover:bg-gray-50"
                    >
                      Basic
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'elements' && (
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Drag Elements</h3>
                <div className="text-xs bg-yellow-100 p-2 rounded mb-4">
                  🐛 Debug: React DnD Elements ({dragElements.length} available)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {dragElements.map(element => {
                    try {
                      return <DragElement key={element.type} element={element} />;
                    } catch (error) {
                      console.error('Error rendering drag element:', element.type, error);
                      return (
                        <div key={element.type} className="p-3 border border-red-200 rounded-lg bg-red-50">
                          <div className="flex flex-col items-center space-y-2">
                            <span className="text-sm text-red-600">Error: {element.label}</span>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'brand' && (
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Brand Assets</h3>
                <div>
                  <h4 className="font-medium text-sm mb-2">Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['#1f2937', '#374151', '#6b7280', '#d97706', '#059669', '#dc2626', '#7c3aed'].map(color => (
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
              </div>
            )}
          </div>
        </div>
        
        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Communication Designer</h1>
                <p className="text-sm text-gray-500">Create professional communications for your PTO</p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
                  <button
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
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
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Stella
                  </button>
                  
                  {showStellaPopup && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Stella's Content Assistant</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Hi! I'm Stella. I can help create content for your designs.
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
              <DropZone />
            </div>
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Properties</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedElement ? (
              <div className="space-y-6">
                {/* Content Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Content</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
                      <textarea
                        value={selectedElement.content || ''}
                        onChange={(e) => {
                          const updated = { ...selectedElement, content: e.target.value };
                          setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
                          setSelectedElement(updated);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                        rows="4"
                        placeholder="Enter your text here..."
                      />
                    </div>
                    
                    {selectedElement.type === 'image' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={selectedElement.src || ''}
                          onChange={(e) => {
                            const updated = { ...selectedElement, src: e.target.value };
                            setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
                            setSelectedElement(updated);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Typography Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Typography</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Size: {parseInt(selectedElement.style?.fontSize) || 16}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={parseInt(selectedElement.style?.fontSize) || 16}
                        onChange={(e) => updateElementStyle({ fontSize: `${e.target.value}px` })}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Font Weight</label>
                      <select
                        value={selectedElement.style?.fontWeight || 'normal'}
                        onChange={(e) => updateElementStyle({ fontWeight: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="300">Light</option>
                        <option value="normal">Normal</option>
                        <option value="600">Semi Bold</option>
                        <option value="bold">Bold</option>
                        <option value="800">Extra Bold</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                      <div className="flex space-x-1">
                        {['left', 'center', 'right', 'justify'].map(align => (
                          <button
                            key={align}
                            onClick={() => updateElementStyle({ textAlign: align })}
                            className={`flex-1 p-2 text-xs border rounded ${
                              selectedElement.style?.textAlign === align 
                                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Line Height: {parseFloat(selectedElement.style?.lineHeight) || 1.4}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={parseFloat(selectedElement.style?.lineHeight) || 1.4}
                        onChange={(e) => updateElementStyle({ lineHeight: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Colors Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Colors</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={selectedElement.style?.color || '#374151'}
                          onChange={(e) => updateElementStyle({ color: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={selectedElement.style?.color || '#374151'}
                          onChange={(e) => updateElementStyle({ color: e.target.value })}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-mono"
                          placeholder="#374151"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={selectedElement.style?.backgroundColor || 'transparent'}
                          onChange={(e) => updateElementStyle({ backgroundColor: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={selectedElement.style?.backgroundColor || 'transparent'}
                          onChange={(e) => updateElementStyle({ backgroundColor: e.target.value })}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-mono"
                          placeholder="transparent"
                        />
                      </div>
                      <button
                        onClick={() => updateElementStyle({ backgroundColor: 'transparent' })}
                        className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Remove background
                      </button>
                    </div>
                  </div>
                </div>

                {/* Layout Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Layout</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                      <select
                        value={selectedElement.style?.width || 'auto'}
                        onChange={(e) => updateElementStyle({ width: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="auto">Auto</option>
                        <option value="100%">Full Width</option>
                        <option value="75%">75%</option>
                        <option value="50%">50%</option>
                        <option value="25%">25%</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                      <input
                        type="text"
                        value={selectedElement.style?.padding || '10px'}
                        onChange={(e) => updateElementStyle({ padding: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="10px 20px"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Margin</label>
                      <input
                        type="text"
                        value={selectedElement.style?.margin || '0px'}
                        onChange={(e) => updateElementStyle({ margin: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="10px 0px"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                      <input
                        type="text"
                        value={selectedElement.style?.borderRadius || '0px'}
                        onChange={(e) => updateElementStyle({ borderRadius: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="8px"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setCanvas(prev => prev.filter(el => el.id !== selectedElement.id));
                      setSelectedElement(null);
                    }}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete Element
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Square className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-2">No element selected</p>
                <p className="text-gray-400 text-xs">Click on an element to edit its properties</p>
              </div>
            )}
          </div>
        </div>

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Template</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Section Slider */}
              <div className="flex items-center justify-center py-4 border-b border-gray-200">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { id: 'professional', label: 'Professional', desc: 'Unlayer-style templates' },
                    { id: 'basic', label: 'Basic', desc: 'Simple templates' },
                    { id: 'shared', label: 'Shared', desc: 'Community templates' }
                  ].map(section => (
                    <button
                      key={section.id}
                      onClick={() => setTemplateSection(section.id)}
                      className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                        templateSection === section.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{section.label}</div>
                        <div className="text-xs opacity-75">{section.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-2">
                  {getTemplateCategories().map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
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

              {/* Templates Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getFilteredTemplates().map(template => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all group"
                      onClick={() => {
                        useTemplate(template);
                        setShowTemplateModal(false);
                      }}
                    >
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Template';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                          <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100">
                            Use Template
                          </button>
                        </div>
                        
                        {/* Template badges */}
                        <div className="absolute top-2 left-2 flex space-x-1">
                          {template.isProfessional && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">PRO</span>
                          )}
                          {template.isShared && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">SHARED</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        {template.isShared && (
                          <p className="text-xs text-green-600 mb-2">Shared by {template.sharedBy}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{template.category}</span>
                          {template.isProfessional && (
                            <span className="text-xs text-purple-600 font-medium">Professional</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {getFilteredTemplates().length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                    <p className="text-gray-600">Try adjusting your search or category filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default AdvancedDesignStudio; 