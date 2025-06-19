import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Type, Image, Square, Minus, 
  Save, Eye, Sparkles, 
  ZoomIn, ZoomOut,
  Search, Palette,
  Mail, MessageSquare, Share2, Circle
} from 'lucide-react';
import { communicationsTemplatesAPI } from '@/services/api/communicationsTemplates';
import { toast } from 'react-toastify';

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
  const [history, setHistory] = useState([]); // for undo
  const [future, setFuture] = useState([]); // for redo

  // --- Persistent Template State ---
  const [myTemplates, setMyTemplates] = useState([]);
  const [sharedTemplates, setSharedTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateSaveModal, setTemplateSaveModal] = useState(false);
  const [templateMeta, setTemplateMeta] = useState({ name: '', description: '', category: '', template_type: builderMode, sharing_level: 'private', shared_with_orgs: [] });
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  // --- Load Templates on Mount ---
  useEffect(() => {
    console.log('Loading templates...');
    setLoadingTemplates(true);
    communicationsTemplatesAPI.getTemplates()
      .then((response) => {
        console.log('Templates API response:', response);
        if (!response || !response.data) {
          console.error('Invalid response from getTemplates:', response);
          toast.error('Failed to load templates: Invalid response');
          return;
        }
        const { data } = response;
        console.log('Setting templates:', data);
        setMyTemplates(data?.myTemplates || []);
        setSharedTemplates(data?.sharedTemplates || []);
      })
      .catch(error => {
        console.error('Error loading templates:', error);
        toast.error('Failed to load templates: ' + (error.message || 'Unknown error'));
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  // Update the validateColor function to be more permissive
  const validateColor = (color) => {
    if (!color) return undefined;
    if (color === 'transparent') return 'transparent';
    if (color.toLowerCase() === 'transparent') return 'transparent';
    if (color === 'white') return '#ffffff';
    if (color.startsWith('#')) return color;
    if (color.startsWith('rgb')) return color;
    if (color.startsWith('rgba')) return color;
    return color; // Return as is if none of the above
  };

  // Add a function to clean the canvas data
  const cleanCanvasData = (elements) => {
    return elements.map(element => {
      // Create a clean copy of the element
      const cleanElement = { ...element };
      
      // Clean up the style object
      if (cleanElement.style) {
        cleanElement.style = Object.entries(cleanElement.style).reduce((acc, [key, value]) => {
          // Handle color properties
          if (key.toLowerCase().includes('color')) {
            const cleanColor = validateColor(value);
            if (cleanColor) acc[key] = cleanColor;
          } else {
            // Keep non-color properties as they are
            acc[key] = value;
          }
          return acc;
        }, {});
      }

      return cleanElement;
    });
  };

  // Update the handleSaveAsTemplate function
  const handleSaveAsTemplate = async () => {
    try {
      if (!canvas || canvas.length === 0) {
        toast.error('Cannot save empty template. Add some elements first.');
        return;
      }

      if (!templateMeta.name || !templateMeta.category) {
        toast.error('Please provide both a name and category for the template.');
        return;
      }

      setLoadingTemplates(true);

      // Clean and prepare the canvas data
      const cleanCanvas = cleanCanvasData(canvas);
      
      const payload = {
        name: templateMeta.name.trim(),
        description: templateMeta.description?.trim() || '',
        category: templateMeta.category.trim(),
        template_type: builderMode || 'email',
        sharing_level: templateMeta.sharing_level || 'private',
        shared_with_orgs: templateMeta.sharing_level === 'orgs' ? templateMeta.shared_with_orgs : [],
        design_json: JSON.stringify(cleanCanvas)
      };

      // Log the payload for debugging
      console.log('Saving template with payload:', payload);

      if (editingTemplateId) {
        await communicationsTemplatesAPI.updateTemplate(editingTemplateId, payload);
        toast.success('Template updated successfully!');
      } else {
        await communicationsTemplatesAPI.createTemplate(payload);
        toast.success('Template created successfully!');
      }

      // Close modal and refresh templates
      setTemplateSaveModal(false);
      const { data } = await communicationsTemplatesAPI.getTemplates();
      setMyTemplates(data?.myTemplates || []);
      setSharedTemplates(data?.sharedTemplates || []);
    } catch (error) {
      console.error('Template save error:', error);
      toast.error(`Failed to save template: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingTemplates(false);
    }
  };

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
    {
      id: 'back-to-school-night',
      name: 'Back to School Night',
      category: 'Event',
      thumbnail: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=300&q=80',
      description: 'Invite families to Back to School Night with this welcoming template.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Back to School Night', style: { fontSize: '24px', fontWeight: 'bold', color: '#172845', textAlign: 'center', padding: '20px', backgroundColor: '#fbc860', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #2563eb', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Join us for an evening of fun, learning, and community as we kick off the new school year!', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'RSVP Now', url: 'https://example.com/rsvp', style: { backgroundColor: '#2563eb', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #2563eb', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'fall-festival',
      name: 'Fall Festival',
      category: 'Event',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
      description: 'Celebrate autumn with a festive school event!',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Fall Festival', style: { fontSize: '24px', fontWeight: 'bold', color: '#b45309', textAlign: 'center', padding: '20px', backgroundColor: '#fde68a', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #b45309', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Games, food, and fun for the whole family! Don\'t miss our annual Fall Festival.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'Volunteer', url: 'https://example.com/volunteer', style: { backgroundColor: '#b45309', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(180,83,9,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #b45309', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'book-fair',
      name: 'Book Fair',
      category: 'Fundraising',
      thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80',
      description: 'Support our library and foster a love of reading. Shop the Book Fair this week!',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Book Fair', style: { fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8', textAlign: 'center', padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #1d4ed8', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Support our library and foster a love of reading. Shop the Book Fair this week!', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'Shop Now', url: 'https://example.com/bookfair', style: { backgroundColor: '#1d4ed8', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(29,78,216,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #1d4ed8', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'teacher-appreciation',
      name: 'Teacher Appreciation Week',
      category: 'Appreciation',
      thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80',
      description: 'Celebrate and thank your teachers for all they do.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Teacher Appreciation Week', style: { fontSize: '24px', fontWeight: 'bold', color: '#be185d', textAlign: 'center', padding: '20px', backgroundColor: '#fbcfe8', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #be185d', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Join us in celebrating our dedicated teachers! Let\'s show them how much we care.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'Send Thanks', url: 'https://example.com/thanks', style: { backgroundColor: '#be185d', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(190,24,93,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #be185d', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'halloween-party',
      name: 'Halloween Party',
      category: 'Holiday',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
      description: 'Spooky fun for all ages! Invite families to your school Halloween party.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Halloween Party', style: { fontSize: '24px', fontWeight: 'bold', color: '#f59e42', textAlign: 'center', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #f59e42', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Costume contest, games, and treats! All families welcome.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'RSVP', url: 'https://example.com/halloween', style: { backgroundColor: '#f59e42', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(245,158,66,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #f59e42', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'thanksgiving-feast',
      name: 'Thanksgiving Feast',
      category: 'Holiday',
      thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80',
      description: 'Invite families to a school Thanksgiving celebration.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Thanksgiving Feast', style: { fontSize: '24px', fontWeight: 'bold', color: '#92400e', textAlign: 'center', padding: '20px', backgroundColor: '#fde68a', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #92400e', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Join us for a delicious meal and community gathering to give thanks together.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'Sign Up', url: 'https://example.com/thanksgiving', style: { backgroundColor: '#92400e', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(146,64,14,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #92400e', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'winter-holiday',
      name: 'Winter Holiday',
      category: 'Holiday',
      thumbnail: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=300&q=80',
      description: 'Celebrate the season with a festive winter holiday event.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Winter Holiday Party', style: { fontSize: '24px', fontWeight: 'bold', color: '#2563eb', textAlign: 'center', padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #2563eb', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Join us for crafts, music, and holiday cheer! All are welcome.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'RSVP', url: 'https://example.com/winter', style: { backgroundColor: '#2563eb', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #2563eb', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'spring-break',
      name: 'Spring Break',
      category: 'Announcement',
      thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80',
      description: 'Announce spring break dates and activities.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Spring Break', style: { fontSize: '24px', fontWeight: 'bold', color: '#059669', textAlign: 'center', padding: '20px', backgroundColor: '#bbf7d0', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #059669', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'School will be closed for spring break. Enjoy your time off!', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'See Calendar', url: 'https://example.com/calendar', style: { backgroundColor: '#059669', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(5,150,105,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #059669', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'popcorn-day',
      name: 'Popcorn Day',
      category: 'Event',
      thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80',
      description: 'Celebrate Popcorn Day with a fun treat for students!',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Popcorn Day', style: { fontSize: '24px', fontWeight: 'bold', color: '#f59e42', textAlign: 'center', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #f59e42', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Students will receive a free popcorn treat during lunch!', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'Volunteer', url: 'https://example.com/popcorn', style: { backgroundColor: '#f59e42', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(245,158,66,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #f59e42', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'picture-day',
      name: 'Picture Day',
      category: 'Announcement',
      thumbnail: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=300&q=80',
      description: 'Remind families about upcoming school picture day.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Picture Day', style: { fontSize: '24px', fontWeight: 'bold', color: '#2563eb', textAlign: 'center', padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #2563eb', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Don\'t forget to dress your best for school pictures!', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'Order Photos', url: 'https://example.com/pictures', style: { backgroundColor: '#2563eb', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #2563eb', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'family-movie-night',
      name: 'Family Movie Night',
      category: 'Event',
      thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80',
      description: 'Invite families to a fun movie night at school.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Family Movie Night', style: { fontSize: '24px', fontWeight: 'bold', color: '#be185d', textAlign: 'center', padding: '20px', backgroundColor: '#fbcfe8', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #be185d', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Bring your blankets and enjoy a family-friendly movie in the gym!', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'RSVP', url: 'https://example.com/movie', style: { backgroundColor: '#be185d', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(190,24,93,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #be185d', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'science-fair',
      name: 'Science Fair',
      category: 'Event',
      thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80',
      description: 'Encourage curiosity and discovery at your school science fair.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Science Fair', style: { fontSize: '24px', fontWeight: 'bold', color: '#059669', textAlign: 'center', padding: '20px', backgroundColor: '#bbf7d0', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #059669', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Students will showcase their science projects and experiments.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'Sign Up', url: 'https://example.com/science', style: { backgroundColor: '#059669', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(5,150,105,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #059669', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'spirit-week',
      name: 'Spirit Week',
      category: 'Event',
      thumbnail: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=300&q=80',
      description: 'Boost school spirit with themed dress-up days and activities.',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Spirit Week', style: { fontSize: '24px', fontWeight: 'bold', color: '#be185d', textAlign: 'center', padding: '20px', backgroundColor: '#fbcfe8', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #be185d', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Each day has a different theme! Show your school pride.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'See Themes', url: 'https://example.com/spirit', style: { backgroundColor: '#be185d', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(190,24,93,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #be185d', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
    {
      id: 'field-day',
      name: 'Field Day',
      category: 'Event',
      thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80',
      description: 'A day of outdoor games and fun for all students!',
      isProfessional: true,
      elements: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80', style: { width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '220px', objectFit: 'cover' } },
        { type: 'header', content: 'Field Day', style: { fontSize: '24px', fontWeight: 'bold', color: '#059669', textAlign: 'center', padding: '20px', backgroundColor: '#bbf7d0', borderRadius: '8px', width: '100%', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } },
        { type: 'divider', style: { borderTop: '2px solid #059669', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Students will participate in a variety of outdoor games and activities.', style: { fontSize: '16px', color: '#374151', textAlign: 'center', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', margin: '0 auto 12px auto', width: '90%' } },
        { type: 'button', content: 'Volunteer', url: 'https://example.com/fieldday', style: { backgroundColor: '#059669', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 16px auto', display: 'block', border: 'none', boxShadow: '0 2px 8px rgba(5,150,105,0.08)' } },
        { type: 'divider', style: { borderTop: '1px solid #059669', margin: '16px 0', width: '100%' } },
        { type: 'text', content: 'Sunset PTO • info@sunsetpto.com', style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '16px', marginBottom: '0', padding: '8px 0 0 0' } }
      ]
    },
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

  // Get current template set based on section
  const getCurrentTemplates = () => {
    switch (templateSection) {
      case 'professional':
        return professionalTemplates;
      case 'basic':
        return basicTemplates;
      case 'my':
        return myTemplates;
      case 'shared':
        return sharedTemplates;
      default:
        return basicTemplates;
    }
  };

  // --- Updated Drag Elements ---
  const dragElements = [
    { type: 'text', icon: Type, label: 'Text', defaultContent: 'Add your text here', defaultStyle: { fontSize: '16px', color: '#374151', lineHeight: '1.6', padding: '10px', width: '100%' } },
    { type: 'header', icon: Type, label: 'Header', defaultContent: 'Your Header Here', defaultStyle: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', padding: '20px', width: '100%' } },
    { type: 'image', icon: Image, label: 'Image', defaultSrc: 'https://picsum.photos/400/250?random=99', defaultStyle: { width: '100%', borderRadius: '8px' } },
    { type: 'button', icon: Square, label: 'Button', defaultContent: 'Click Here', defaultStyle: { backgroundColor: '#3b82f6', color: 'white', padding: '15px 30px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', textAlign: 'center', border: 'none', cursor: 'pointer' } },
    { type: 'divider', icon: Minus, label: 'Divider', defaultContent: '', defaultStyle: { height: '2px', backgroundColor: '#e5e7eb', width: '100%', margin: '20px 0' } },
    // Fun/Modern
    { type: 'emoji', icon: () => <span role="img" aria-label="emoji" className="text-2xl">🎉</span>, label: 'Emoji', defaultContent: '🎉', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
    // Updated Charms with better implementation
    { 
      type: 'charm',
      icon: () => <div className="w-8 h-8 flex items-center justify-center text-2xl">⭐</div>,
      label: 'Star Charm',
      defaultContent: '⭐',
      defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%', padding: '10px', backgroundColor: 'transparent' }
    },
    { 
      type: 'charm',
      icon: () => <div className="w-8 h-8 flex items-center justify-center text-2xl">🍎</div>,
      label: 'Apple Charm',
      defaultContent: '🍎',
      defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%', padding: '10px', backgroundColor: 'transparent' }
    },
    { 
      type: 'charm',
      icon: () => <div className="w-8 h-8 flex items-center justify-center text-2xl">✏️</div>,
      label: 'Pencil Charm',
      defaultContent: '✏️',
      defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%', padding: '10px', backgroundColor: 'transparent' }
    },
    { 
      type: 'charm',
      icon: () => <div className="w-8 h-8 flex items-center justify-center text-2xl">📚</div>,
      label: 'Books Charm',
      defaultContent: '📚',
      defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%', padding: '10px', backgroundColor: 'transparent' }
    },
    { 
      type: 'charm',
      icon: () => <div className="w-8 h-8 flex items-center justify-center text-2xl">🏆</div>,
      label: 'Trophy Charm',
      defaultContent: '🏆',
      defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%', padding: '10px', backgroundColor: 'transparent' }
    },
    // Social icons (SVG or emoji fallback)
    { type: 'icon', icon: () => <span role="img" aria-label="facebook" className="text-2xl">📘</span>, label: 'Facebook', defaultContent: '📘', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
    { type: 'icon', icon: () => <span role="img" aria-label="instagram" className="text-2xl">📸</span>, label: 'Instagram', defaultContent: '📸', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
    { type: 'icon', icon: () => <span role="img" aria-label="twitter" className="text-2xl">🐦</span>, label: 'Twitter', defaultContent: '🐦', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
    // Shapes
    { type: 'shape', icon: Circle, label: 'Circle', defaultContent: '', defaultStyle: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fbbf24', margin: '0 auto' } },
    { type: 'shape', icon: Square, label: 'Square', defaultContent: '', defaultStyle: { width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#60a5fa', margin: '0 auto' } },
    // Utility
    { type: 'spacer', icon: Minus, label: 'Spacer', defaultContent: '', defaultStyle: { height: '32px', width: '100%' } },
    { type: 'quote', icon: () => <span className="text-2xl">❝</span>, label: 'Quote', defaultContent: 'Inspirational quote here...', defaultStyle: { fontStyle: 'italic', fontSize: '18px', color: '#6b7280', textAlign: 'center', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', width: '100%' } },
    { type: 'list', icon: () => <span className="text-2xl">•</span>, label: 'List', defaultContent: 'List item 1\nList item 2\nList item 3', defaultStyle: { fontSize: '16px', color: '#374151', textAlign: 'left', padding: '10px', width: '100%' } },
  ];

  // Use Template function
  const useTemplate = (template) => {
    try {
      console.log('Using template:', template);
      
      if (!template) {
        throw new Error('No template provided');
      }

      let templateData;
      
      // Handle built-in templates (professional and basic)
      if (template.elements) {
        templateData = template.elements;
      } 
      // Handle saved templates with design_json
      else if (template.design_json) {
        try {
          templateData = typeof template.design_json === 'string' ? JSON.parse(template.design_json) : template.design_json;
        } catch (error) {
          console.error('Failed to parse template design_json:', error, template.design_json);
          throw new Error('Invalid template data format');
        }
      } else {
        throw new Error('Template is missing design data');
      }

      if (!Array.isArray(templateData)) {
        console.error('Template data is not an array:', templateData);
        throw new Error('Invalid template data structure');
      }

      if (templateData.length === 0) {
        console.warn('Template has no elements');
        toast.warning('This template is empty');
        return;
      }

      const newElements = templateData.map((element, index) => {
        if (!element || typeof element !== 'object') {
          console.error('Invalid element in template:', element);
          throw new Error('Invalid element in template');
        }

        console.log('Processing element:', element);
        return {
          ...element,
          id: `element_${Date.now()}_${index}`,
          x: element.x || 20,
          y: element.y || (20 + (index * 80)),
          style: {
            ...element.style,
            width: element.style?.width || '100%'
          }
        };
      });

      console.log('Setting canvas with elements:', newElements);
      setCanvas(newElements);
      setSelectedElement(null);
      toast.success('Template loaded successfully!');
      
    } catch (error) {
      console.error('Template error:', error);
      toast.error('Failed to load template: ' + error.message);
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

  // --- Sortable CanvasElement for Drag-and-Drop Reordering ---
  const moveElement = (fromIndex, toIndex) => {
    setCanvas(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const CanvasElement = ({ element, isSelected, onSelect, onUpdate, index, moveElement }) => {
    const [isEditing, setIsEditing] = useState(false);
    const ref = useRef(null);

    // Restore drag and drop functionality
    const [{ isDragging }, drag, preview] = useDrag(() => ({
      type: 'canvas-element',
      item: { id: element.id, index },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }), [element, index]);

    const [, drop] = useDrop({
      accept: 'canvas-element',
      hover: (item, monitor) => {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        moveElement(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    drag(drop(ref));
    
    const handleDoubleClick = () => {
      if (element.type === 'text' || element.type === 'header') {
        setIsEditing(true);
      }
    };

    const handleContentChange = (newContent) => {
      onUpdate({ ...element, content: newContent });
      setIsEditing(false);
    };

    // Outer container style for full width background
    const outerContainerStyle = {
      width: element.type === 'button' ? '100%' : (element.containerWidth || '100%'),
      backgroundColor: element.type === 'button' ? undefined : element.style?.backgroundColor,
      padding: element.type === 'button' ? undefined : (element.style?.padding || '10px'),
      margin: element.style?.margin || '0px',
      borderRadius: element.type === 'button' ? undefined : (element.style?.borderRadius || '0px'),
      cursor: isDragging ? 'move' : 'pointer',
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      outlineOffset: '2px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: element.zIndex || 1,
      opacity: isDragging ? 0.5 : 1
    };

    // Inner container style for content alignment
    const innerContainerStyle = {
      width: '100%',
      display: 'flex',
      justifyContent: element.justification || 'center',
      alignItems: 'center'
    };

    // Content style for the actual element
    const contentStyle = {
      ...element.style,
      width: element.style?.textWidth || 'auto',
      backgroundColor: undefined,
      padding: undefined,
      margin: undefined,
      borderRadius: undefined,
    };

    return (
      <div
        ref={ref}
        style={outerContainerStyle}
        onClick={() => onSelect(element)}
        onDoubleClick={handleDoubleClick}
        className="canvas-element"
      >
        <div style={innerContainerStyle}>
          {renderElement()}
        </div>
        {isSelected && (
          <div className="absolute -top-6 -left-1 text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center space-x-2 z-20">
            <span>{element.type}</span>
            <button
              onClick={e => {
                e.stopPropagation();
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

    function renderElement() {
      try {
        switch (element.type) {
          case 'text':
            return isEditing ? (
              <textarea
                value={element.content}
                onChange={(e) => handleContentChange(e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="w-full bg-transparent border-none outline-none resize-none"
                style={{ ...contentStyle, minHeight: '100px' }}
                autoFocus
              />
            ) : (
              <div style={contentStyle}>
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
                style={{ ...contentStyle, fontSize: 'inherit', fontWeight: 'inherit' }}
                autoFocus
              />
            ) : (
              <h1 style={contentStyle}>
                {element.content}
              </h1>
            );
            
          case 'image':
            return (
              <img
                src={element.src}
                alt="Design element"
                style={{ 
                  ...contentStyle, 
                  maxWidth: element.style?.width || '100%', 
                  height: 'auto',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x200/f3f4f6/6b7280?text=Image+Placeholder';
                }}
              />
            );
            
          case 'charm':
          case 'emoji':
          case 'icon':
            return (
              <div 
                style={{ 
                  ...contentStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: element.style?.padding || '10px',
                  backgroundColor: element.style?.backgroundColor || 'transparent'
                }}
                className="charm-container"
              >
                <span 
                  role="img" 
                  aria-label={element.label}
                  style={{
                    fontSize: element.style?.fontSize || '32px',
                    lineHeight: 1
                  }}
                >
                  {element.content}
                </span>
              </div>
            );
            
          case 'button':
            const buttonStyle = {
              ...contentStyle,
              backgroundColor: element.style?.backgroundColor || '#3b82f6',
              color: element.style?.color || 'white',
              padding: element.style?.padding || '15px 30px',
              borderRadius: element.style?.borderRadius || '8px',
              border: 'none',
              fontSize: element.style?.fontSize || '16px',
              fontWeight: element.style?.fontWeight || '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: 'auto', // Override any full-width settings
              minWidth: '200px' // Give it a reasonable minimum width
            };

            return (
              <div style={{ display: 'flex', justifyContent: element.justification || 'center', width: '100%' }}>
                <button style={buttonStyle}>
                  {element.content}
                </button>
              </div>
            );
            
          case 'divider':
            return (
              <hr
                style={{
                  ...contentStyle,
                  border: 'none',
                  height: element.style?.height || '2px',
                  backgroundColor: element.style?.backgroundColor || '#e5e7eb',
                  margin: element.style?.margin || '20px 0'
                }}
              />
            );
            
          case 'shape':
            return (
              <div
                style={{
                  ...contentStyle,
                  width: element.style?.width || '60px',
                  height: element.style?.height || '60px',
                  backgroundColor: element.style?.backgroundColor || '#fbbf24',
                  borderRadius: element.style?.borderRadius || '0',
                  margin: element.style?.margin || '0 auto'
                }}
              />
            );
            
          case 'spacer':
            return (
              <div
                style={{
                  ...contentStyle,
                  height: element.style?.height || '32px',
                  width: '100%'
                }}
              />
            );
            
          case 'quote':
            return (
              <blockquote
                style={{
                  ...contentStyle,
                  fontStyle: 'italic',
                  padding: element.style?.padding || '16px',
                  backgroundColor: element.style?.backgroundColor || '#f3f4f6',
                  borderRadius: element.style?.borderRadius || '8px'
                }}
              >
                {element.content}
              </blockquote>
            );
            
          case 'list':
            return (
              <div style={contentStyle}>
                {element.content.split('\n').map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            );
            
          default:
            console.warn(`Unknown element type: ${element.type}`);
            return (
              <div style={contentStyle}>
                Unknown element type: {element.type}
              </div>
            );
        }
      } catch (error) {
        console.error('Error rendering element:', error, element);
        return (
          <div style={{ ...contentStyle, color: 'red', padding: '10px', border: '1px solid red' }}>
            Error rendering element
          </div>
        );
      }
    }
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

  // Update the style update handler
  const updateElementStyle = (styleUpdates) => {
    if (!selectedElement) return;
    
    // Validate color values before updating
    const validatedUpdates = { ...styleUpdates };
    if ('backgroundColor' in validatedUpdates) {
      validatedUpdates.backgroundColor = validateColor(validatedUpdates.backgroundColor);
    }
    if ('color' in validatedUpdates) {
      validatedUpdates.color = validateColor(validatedUpdates.color);
    }
    
    const updated = {
      ...selectedElement,
      style: { ...selectedElement.style, ...validatedUpdates }
    };
    
    setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
    setSelectedElement(updated);
  };

  // Improve autosave functionality
  useEffect(() => {
    let autosaveTimeout;
    
    const saveToLocalStorage = () => {
      try {
        const canvasData = JSON.stringify(canvas);
        localStorage.setItem('pto-advanced-design-canvas', canvasData);
        localStorage.setItem('pto-advanced-design-timestamp', Date.now().toString());
        console.log('Design autosaved');
      } catch (error) {
        console.error('Error autosaving design:', error);
      }
    };

    // Clear previous timeout
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
    }

    // Set new timeout for autosave
    autosaveTimeout = setTimeout(saveToLocalStorage, 1000);

    // Cleanup
    return () => {
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }
    };
  }, [canvas]);

  // Add restore from autosave on mount
  useEffect(() => {
    try {
      const savedCanvas = localStorage.getItem('pto-advanced-design-canvas');
      const savedTimestamp = localStorage.getItem('pto-advanced-design-timestamp');
      
      if (savedCanvas && savedTimestamp) {
        const parsedCanvas = JSON.parse(savedCanvas);
        const timestamp = parseInt(savedTimestamp);
        
        // Only restore if the save is less than 24 hours old
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setCanvas(parsedCanvas);
          console.log('Restored autosaved design');
        }
      }
    } catch (error) {
      console.error('Error restoring autosaved design:', error);
    }
  }, []);

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

  // Add beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Update autosave and versioning on canvas change
  useEffect(() => {
    localStorage.setItem('pto-advanced-design-canvas', JSON.stringify(canvas));
    // Only push to history if not triggered by undo/redo
    setHistory(prev => {
      if (prev.length > 0 && JSON.stringify(prev[prev.length - 1]) === JSON.stringify(canvas)) return prev;
      const newHistory = [...prev, canvas];
      return newHistory.length > 5 ? newHistory.slice(newHistory.length - 5) : newHistory;
    });
    setFuture([]); // clear redo stack on new change
  }, [canvas]);

  // Undo/Redo handlers
  const handleUndo = () => {
    setHistory(prev => {
      if (prev.length < 2) return prev;
      setFuture(f => [canvas, ...f].slice(0, 5));
      setCanvas(prev[prev.length - 2]);
      return prev.slice(0, prev.length - 1);
    });
  };
  const handleRedo = () => {
    setFuture(f => {
      if (f.length === 0) return f;
      setHistory(h => [...h, f[0]].slice(-5));
      setCanvas(f[0]);
      return f.slice(1);
    });
  };

  // Clear Draft handler
  const handleClearDraft = () => {
    setCanvas([]);
    setHistory([]);
    setFuture([]);
    localStorage.removeItem('pto-advanced-design-canvas');
  };

  // Add this function near other handlers (e.g., handleUndo, handleClearDraft):
  const handleSaveDraft = () => {
    localStorage.setItem('pto-advanced-design-canvas', JSON.stringify(canvas));
    // Optionally show a confirmation (replace with toast if available)
    console.log('Draft saved!');
  };

  // --- Template Management Handlers ---
  const handleEditTemplate = (template) => {
    setTemplateMeta({
      name: template.name,
      description: template.description,
      category: template.category,
      template_type: template.template_type,
      sharing_level: template.sharing_level,
      shared_with_orgs: template.shared_with_orgs || []
    });
    setEditingTemplateId(template.id);
    setTemplateSaveModal(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template? This cannot be undone.')) {
      await communicationsTemplatesAPI.deleteTemplate(templateId);
      // Reload templates
      setLoadingTemplates(true);
      const { data } = await communicationsTemplatesAPI.getTemplates();
      setMyTemplates(data?.myTemplates || []);
      setSharedTemplates(data?.sharedTemplates || []);
      setLoadingTemplates(false);
    }
  };

  const handleUnshareTemplate = async (template) => {
    if (window.confirm('Unshare this template? It will no longer appear in the shared library.')) {
      await communicationsTemplatesAPI.updateTemplate(template.id, { ...template, sharing_level: 'private', shared_with_orgs: [] });
      setLoadingTemplates(true);
      const { data } = await communicationsTemplatesAPI.getTemplates();
      setMyTemplates(data?.myTemplates || []);
      setSharedTemplates(data?.sharedTemplates || []);
      setLoadingTemplates(false);
    }
  };

  const handleCopySharedTemplate = async (template) => {
    // Copy the shared template to org's library for editing
    const payload = {
      name: template.name + ' (Copy)',
      description: template.description,
      category: template.category,
      template_type: template.template_type,
      sharing_level: 'private',
      shared_with_orgs: [],
      design_json: template.design_json,
      html_content: template.html_content || '',
      thumbnail_url: template.thumbnail_url || '',
    };
    await communicationsTemplatesAPI.createTemplate(payload);
    setLoadingTemplates(true);
    const { data } = await communicationsTemplatesAPI.getTemplates();
    setMyTemplates(data?.myTemplates || []);
    setSharedTemplates(data?.sharedTemplates || []);
    setLoadingTemplates(false);
    alert('Template copied to your library! You can now edit and save it.');
  };

  // Restore DropZone component
  const DropZone = () => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'element',
      drop: (item, monitor) => {
        const newElement = {
          id: `element_${Date.now()}_${Math.random()}`,
          type: item.elementType,
          content: item.defaultContent || 'New Content',
          src: item.defaultSrc || '',
          style: { ...item.defaultStyle },
          justification: 'center',
        };
        setCanvas(prev => [...prev, newElement]);
        setSelectedElement(newElement);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }), []);

    return (
      <div
        ref={node => { drop(node); canvasRef.current = node; }}
        className={`relative bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-[600px] transition-colors flex flex-col items-stretch` +
          (isOver ? ' border-blue-500 bg-blue-50' : '') +
          (canDrop ? ' border-green-400' : '')}
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {canvas.map((element, idx) => (
          <div
            key={element.id}
            className="w-full flex"
            style={{ justifyContent: element.justification || 'center' }}
          >
            <CanvasElement
              element={element}
              isSelected={selectedElement?.id === element.id}
              onSelect={() => setSelectedElement(element)}
              onUpdate={updated => {
                setCanvas(prev => prev.map(el => el.id === element.id ? updated : el));
                setSelectedElement(updated);
              }}
              index={idx}
              moveElement={moveElement}
            />
          </div>
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

  // --- Template Selection Modal ---
  const handleTemplateSelect = (template) => {
    console.log('Template selected:', template);
    if (!template) {
      console.error('No template selected');
      return;
    }

    try {
      // Close template modal first
      setShowTemplateModal(false);

      // Then load the template with a slight delay to allow modal to close
      setTimeout(() => {
        useTemplate(template);
      }, 100);
    } catch (error) {
      console.error('Error in template selection:', error);
      toast.error('Failed to select template: ' + error.message);
    }
  };

  // Template Grid Component
  const TemplateGrid = ({ templates }) => {
    if (loadingTemplates) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!templates || templates.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
            onClick={() => handleTemplateSelect(template)}
          >
            {template.thumbnail_url ? (
              <img
                src={template.thumbnail_url}
                alt={template.name}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Template+Preview';
                }}
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No Preview</span>
              </div>
            )}
            <div className="p-3 bg-white">
              <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
              <p className="text-sm text-gray-500 truncate">{template.description || 'No description'}</p>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CharmButton = ({ charm, onClick }) => (
    <button
      onClick={() => onClick(charm)}
      className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all w-full h-full gap-2"
    >
      <span className="text-2xl">{charm.content}</span>
      <span className="text-sm text-center text-gray-600">{charm.label}</span>
    </button>
  );

  const renderCharms = () => {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {charms.map((charm) => (
          <CharmButton
            key={charm.id}
            charm={charm}
            onClick={(charm) => {
              const newElement = {
                id: Date.now(),
                type: 'charm',
                content: charm.content,
                label: charm.label,
                style: {
                  fontSize: '32px',
                  textAlign: 'center'
                }
              };
              setCanvas(prev => [...prev, newElement]);
            }}
          />
        ))}
      </div>
    );
  };

  // Template categories for the modal
  const templateCategories = [
    'Event',
    'Fundraising',
    'Newsletter',
    'Announcement',
    'Holiday',
    'Appreciation',
    'Other'
  ];

  // Template Save Modal Component
  const TemplateSaveModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Save as Template</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={templateMeta.name}
                onChange={(e) => setTemplateMeta(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={templateMeta.category}
                onChange={(e) => setTemplateMeta(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a category</option>
                {templateCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={templateMeta.description}
                onChange={(e) => setTemplateMeta(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter template description (optional)"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sharing Level
              </label>
              <select
                value={templateMeta.sharing_level}
                onChange={(e) => setTemplateMeta(prev => ({ ...prev, sharing_level: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="private">Private</option>
                <option value="organization">Organization</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleSaveAsTemplate();
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update the toolbar section to include the modal
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <button onClick={() => handleUndo()} disabled={history.length < 2} className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50" title="Undo">↩</button>
          <button onClick={() => handleRedo()} disabled={future.length === 0} className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50" title="Redo">↪</button>
          <button onClick={() => setCanvas([])} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">Clear</button>
          <button onClick={() => handleSaveDraft()} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">Save</button>
          <button onClick={() => setPreviewMode(true)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Preview</button>
          <button onClick={() => setShowStellaPopup(true)} className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">Stella</button>
          <button onClick={() => setTemplateSaveModal(true)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Save as Template</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Elements & Templates */}
        <div className="w-64 border-r bg-white overflow-y-auto flex flex-col">
          <div className="p-4 border-b">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('elements')}
                className={`flex-1 px-3 py-1 text-sm rounded ${activeTab === 'elements' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Elements
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 px-3 py-1 text-sm rounded ${activeTab === 'templates' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Templates
              </button>
            </div>
          </div>

          {activeTab === 'elements' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                <DragElement element={{ type: 'header', defaultContent: 'New Header', defaultStyle: { fontSize: '24px', fontWeight: 'bold', color: '#172845' } }} />
                <DragElement element={{ type: 'text', defaultContent: 'New Text Block', defaultStyle: { fontSize: '16px', color: '#374151' } }} />
                <DragElement element={{ type: 'image', defaultSrc: 'https://via.placeholder.com/400x200', defaultStyle: { width: '100%', borderRadius: '8px' } }} />
                <DragElement element={{ type: 'button', defaultContent: 'New Button', defaultStyle: { backgroundColor: '#2563eb', color: '#fff', padding: '12px 32px', borderRadius: '6px', display: 'inline-block' } }} />
                <DragElement element={{ type: 'divider', defaultStyle: { borderTop: '2px solid #e5e7eb', margin: '16px 0' } }} />
              </div>
              {renderCharms()}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                >
                  <option value="all">All Categories</option>
                  {getTemplateCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <TemplateGrid templates={getFilteredTemplates()} />
            </div>
          )}
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <DndProvider backend={HTML5Backend}>
            <DropZone />
          </DndProvider>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 border-l bg-white overflow-y-auto">
          {selectedElement ? (
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Element Properties</h3>
              <div className="space-y-4">
                {selectedElement.type !== 'divider' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={selectedElement.content}
                      onChange={(e) => {
                        const updated = { ...selectedElement, content: e.target.value };
                        setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
                        setSelectedElement(updated);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                    />
                  </div>
                )}
                {selectedElement.type === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={selectedElement.src}
                      onChange={(e) => {
                        const updated = { ...selectedElement, src: e.target.value };
                        setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
                        setSelectedElement(updated);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size
                  </label>
                  <input
                    type="text"
                    value={selectedElement.style?.fontSize || '16px'}
                    onChange={(e) => updateElementStyle({ fontSize: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={selectedElement.style?.color || '#000000'}
                    onChange={(e) => updateElementStyle({ color: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="text"
                    value={selectedElement.style?.backgroundColor || 'transparent'}
                    onChange={(e) => updateElementStyle({ backgroundColor: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alignment
                  </label>
                  <select
                    value={selectedElement.justification || 'center'}
                    onChange={(e) => {
                      const updated = { ...selectedElement, justification: e.target.value };
                      setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
                      setSelectedElement(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="flex-start">Left</option>
                    <option value="center">Center</option>
                    <option value="flex-end">Right</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setCanvas(prev => prev.filter(el => el.id !== selectedElement.id));
                    setSelectedElement(null);
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Element
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-gray-500 text-center">
              Select an element to edit its properties
            </div>
          )}
        </div>
      </div>

      {/* Template Save Modal */}
      <TemplateSaveModal
        isOpen={templateSaveModal}
        onClose={() => setTemplateSaveModal(false)}
      />
    </div>
  );
};

export default AdvancedDesignStudio;