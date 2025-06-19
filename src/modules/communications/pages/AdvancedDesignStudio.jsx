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
    setLoadingTemplates(true);
    communicationsTemplatesAPI.getTemplates()
      .then(({ data }) => {
        setMyTemplates(data?.myTemplates || []);
        setSharedTemplates(data?.sharedTemplates || []);
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  // --- Save as Template Handler ---
  const handleSaveAsTemplate = async () => {
    const payload = {
      ...templateMeta,
      design_json: JSON.stringify(canvas),
      template_type: builderMode,
      sharing_level: templateMeta.sharing_level,
      shared_with_orgs: templateMeta.sharing_level === 'orgs' ? templateMeta.shared_with_orgs : [],
    };
    if (editingTemplateId) {
      await communicationsTemplatesAPI.updateTemplate(editingTemplateId, payload);
    } else {
      await communicationsTemplatesAPI.createTemplate(payload);
    }
    setTemplateSaveModal(false);
    // Reload templates
    setLoadingTemplates(true);
    const { data } = await communicationsTemplatesAPI.getTemplates();
    setMyTemplates(data?.myTemplates || []);
    setSharedTemplates(data?.sharedTemplates || []);
    setLoadingTemplates(false);
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
    { type: 'charm', icon: () => <span role="img" aria-label="star" className="text-2xl">⭐</span>, label: 'Star Charm', defaultContent: '⭐', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
    { type: 'charm', icon: () => <span role="img" aria-label="apple" className="text-2xl">🍎</span>, label: 'Apple Charm', defaultContent: '🍎', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
    { type: 'charm', icon: () => <span role="img" aria-label="pencil" className="text-2xl">✏️</span>, label: 'Pencil Charm', defaultContent: '✏️', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
    { type: 'charm', icon: () => <span role="img" aria-label="book" className="text-2xl">📚</span>, label: 'Books Charm', defaultContent: '📚', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
    { type: 'charm', icon: () => <span role="img" aria-label="trophy" className="text-2xl">🏆</span>, label: 'Trophy Charm', defaultContent: '🏆', defaultStyle: { fontSize: '32px', textAlign: 'center', width: '100%' } },
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
      if (element.type === 'text' || element.type === 'header' || element.type === 'button') setIsEditing(true);
    };
    const handleContentChange = (newContent) => {
      onUpdate({ ...element, content: newContent });
      setIsEditing(false);
    };
    const baseStyle = {
      ...element.style,
      cursor: 'pointer',
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      outlineOffset: '2px',
      display: 'block',
      boxSizing: 'border-box',
      maxWidth: element.style?.width || '100%',
      margin: element.justification === 'center' ? '0 auto' : element.justification === 'flex-end' ? '0 0 0 auto' : '0',
    };
    const renderElement = () => {
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

    return (
      <div
        ref={ref}
        className={isSelected ? 'ring-2 ring-blue-500' : ''}
        style={{ width: '100%', opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
      >
        {renderElement()}
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-100 flex">
        {/* Debug info in corner */}
        <div className="fixed bottom-4 right-4 bg-black text-green-400 p-2 rounded text-xs z-50">
          Elements: {canvas.length} | Mode: {builderMode}
        </div>

        {/* Left Panel - Tools & Templates */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
          </div>
        </div>
        
        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-1.5 flex items-center space-x-2 border-b border-gray-200 bg-white">
              <button onClick={handleUndo} disabled={history.length < 2} className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-sm" title="Undo" aria-label="Undo">
                <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M9 4L4 9l5 5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 9h7a5 5 0 110 10H6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={handleRedo} disabled={future.length === 0} className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-sm" title="Redo" aria-label="Redo">
                <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M11 4l5 5-5 5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 9H9a5 5 0 100 10h7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={handleClearDraft} className="px-2.5 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-sm" title="Clear Draft" aria-label="Clear Draft">Clear</button>
              <button onClick={handleSaveDraft} className="px-2.5 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm" title="Save Draft" aria-label="Save Draft">Save</button>
              <button className="flex items-center px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm" onClick={() => console.log('Preview', builderMode)} title="Preview" aria-label="Preview"><Eye className="w-4 h-4 mr-1" />Preview</button>
              <button className="flex items-center px-2.5 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm" onClick={() => setShowStellaPopup(!showStellaPopup)} title="Stella" aria-label="Stella"><Sparkles className="w-4 h-4 mr-1" />Stella</button>
              <button onClick={() => { setTemplateMeta({ name: '', description: '', category: '', template_type: builderMode, sharing_level: 'private', shared_with_orgs: [] }); setEditingTemplateId(null); setTemplateSaveModal(true); }} className="px-2.5 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm" title="Save as Template" aria-label="Save as Template">Save as Template</button>
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
          
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex justify-center">
              <DropZone />
            </div>
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
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

                {/* Advanced Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Advanced</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wrap (Positioning)</label>
                      <select
                        value={selectedElement.style?.position || 'static'}
                        onChange={e => updateElementStyle({ position: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="static">None (No Overlap)</option>
                        <option value="absolute">Through (Allow Overlap)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Element Justification</label>
                      <div className="flex space-x-1">
                        {['flex-start', 'center', 'flex-end'].map(justify => (
                          <button
                            key={justify}
                            onClick={() => {
                              const updated = { ...selectedElement, justification: justify };
                              setCanvas(prev => prev.map(el => el.id === selectedElement.id ? updated : el));
                              setSelectedElement(updated);
                            }}
                            className={`flex-1 p-2 text-xs border rounded ${selectedElement.justification === justify ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                          >
                            {justify === 'flex-start' ? 'Left' : justify === 'center' ? 'Center' : 'Right'}
                </button>
                        ))}
                      </div>
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
                    { id: 'my', label: 'My Templates', desc: 'Saved by your PTO' },
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
                  {['professional', 'basic'].includes(templateSection) && getFilteredTemplates().map(template => (
                    <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all group relative"
                      onClick={() => useTemplate(template)}
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
                          <button
                            className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100"
                            onClick={e => {
                              e.stopPropagation();
                              useTemplate(template);
                              setShowTemplateModal(false);
                            }}
                          >
                            Use Template
                          </button>
                        </div>
                        {/* Template badges */}
                        <div className="absolute top-2 left-2 flex space-x-1">
                          {template.isProfessional && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">PRO</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{template.category}</span>
                          <span className="text-xs text-blue-600 font-medium">{templateSection === 'professional' ? 'Professional' : 'Basic'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {templateSection === 'my' && myTemplates.map(template => (
                    <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all group relative">
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
                          <button
                            className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100"
                            onClick={e => {
                              e.stopPropagation();
                              useTemplate(template);
                              setShowTemplateModal(false);
                            }}
                          >
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
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{template.category}</span>
                          <span className="text-xs text-blue-600 font-medium">My Template</span>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button onClick={e => { e.stopPropagation(); handleEditTemplate(template); }} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">Edit</button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteTemplate(template.id); }} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">Delete</button>
                          {template.sharing_level !== 'private' && (
                            <button onClick={e => { e.stopPropagation(); handleUnshareTemplate(template); }} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">Unshare</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {templateSection === 'shared' && sharedTemplates.map(template => (
                    <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all group relative">
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
                          <button
                            className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100"
                            onClick={e => {
                              e.stopPropagation();
                              useTemplate(template);
                              setShowTemplateModal(false);
                            }}
                          >
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
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{template.category}</span>
                          <span className="text-xs text-green-600 font-medium">Shared</span>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button onClick={e => { e.stopPropagation(); handleCopySharedTemplate(template); }} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Save to My Templates</button>
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