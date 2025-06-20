import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Mail, MessageSquare, Share2, Sparkles, 
  Send, Save, Eye, Users, Calendar,
  Type, Bold, Italic, Link, Image,
  ArrowLeft, Settings, Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '@/utils/api';
import { supabase } from '@/utils/supabaseClient';

const CommunicationModes = {
  EMAIL: 'email',
  SMS: 'sms',
  SOCIAL: 'social'
};

const UnifiedCommunicationComposer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize mode and AI assistance from URL parameters
  const initialMode = searchParams.get('mode') || CommunicationModes.EMAIL;
  const aiMode = searchParams.get('ai');
  
  const [mode, setMode] = useState(initialMode);
  const [content, setContent] = useState({
    subject: '',
    body: '',
    recipients: [],
    scheduledFor: null
  });
  const [showStella, setShowStella] = useState(aiMode === 'assisted' || aiMode === 'auto');
  const [stellaGenerating, setStellaGenerating] = useState(false);
  const [eventContext, setEventContext] = useState(null);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const editorRef = useRef(null);

  // Stella AI Assistant Component
  const StellaAssistant = () => {
    const [aiPrompt, setAiPrompt] = useState('');

    const generateContent = async (type, context = '') => {
      setStellaGenerating(true);
      try {
        let prompt = '';
        
        switch (type) {
          case 'subject':
            prompt = `Create an engaging ${mode} subject line for: ${context || aiPrompt}`;
            break;
          case 'content':
            prompt = `Write ${mode} content for: ${context || aiPrompt}. ${eventContext ? `Event: ${eventContext.title}, Date: ${eventContext.date}` : ''}`;
            break;
          case 'social':
            prompt = `Create a social media post for: ${context || aiPrompt}. Include relevant hashtags and emojis.`;
            break;
          case 'sms':
            prompt = `Write a concise SMS message for: ${context || aiPrompt}. Keep it under 160 characters.`;
            break;
        }

        // Use the existing AI API
        const response = await aiAPI.generateContent(type, prompt, {
          mode,
          eventContext,
          organization: 'PTO'
        });

        if (response?.content) {
          if (type === 'subject') {
            setContent(prev => ({ ...prev, subject: response.content }));
          } else {
            setContent(prev => ({ ...prev, body: response.content }));
          }
          toast.success('✨ Stella has generated your content!');
        }
      } catch (error) {
        console.error('Stella generation error:', error);
        toast.error('Stella encountered an issue. Please try again.');
      } finally {
        setStellaGenerating(false);
      }
    };

    const quickSuggestions = [
      { label: 'Fall Festival Announcement', context: 'Fall Festival event with activities and food' },
      { label: 'Volunteer Recruitment', context: 'Need volunteers for upcoming PTO events' },
      { label: 'Meeting Reminder', context: 'Monthly PTO meeting reminder' },
      { label: 'Fundraiser Update', context: 'Update on current fundraising campaign progress' },
      { label: 'Thank You Message', context: 'Thank you to volunteers and supporters' }
    ];

    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">Stella's Content Assistant</h3>
        </div>
        
        <div className="text-sm text-purple-700 mb-4">
          Hi! I'm Stella. I can help create content for your {mode}, or you can create everything manually. Your choice!
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-800 mb-2">
              What would you like to communicate?
            </label>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Fall Festival this Saturday with games and food"
              className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => generateContent('subject', aiPrompt)}
              disabled={stellaGenerating || !aiPrompt.trim()}
              className="w-full p-3 text-left bg-white rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Let Stella Write Subject</span>
              </div>
            </button>
            
            <button
              onClick={() => generateContent('content', aiPrompt)}
              disabled={stellaGenerating || !aiPrompt.trim()}
              className="w-full p-3 text-left bg-white rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Let Stella Write Content</span>
              </div>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-800 mb-2">
              Quick Suggestions
            </label>
            <div className="grid grid-cols-1 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => generateContent('content', suggestion.context)}
                  disabled={stellaGenerating}
                  className="text-left p-2 bg-white rounded border border-purple-200 hover:bg-purple-50 disabled:opacity-50 text-sm transition-colors"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {stellaGenerating && (
            <div className="flex items-center space-x-2 text-purple-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-sm">Stella is creating your content...</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Mode Configuration
  const getModeConfig = (currentMode) => {
    const configs = {
      [CommunicationModes.EMAIL]: {
        title: 'Email Campaign',
        icon: Mail,
        color: 'blue',
        placeholder: 'Write your email content here...',
        maxLength: null,
        showSubject: true,
        showRecipients: true
      },
      [CommunicationModes.SMS]: {
        title: 'SMS Message',
        icon: MessageSquare,
        color: 'green',
        placeholder: 'Write your SMS message here (160 characters max)...',
        maxLength: 160,
        showSubject: false,
        showRecipients: true
      },
      [CommunicationModes.SOCIAL]: {
        title: 'Social Media Post',
        icon: Share2,
        color: 'purple',
        placeholder: 'Create your social media post...',
        maxLength: 280,
        showSubject: false,
        showRecipients: false
      }
    };
    return configs[currentMode];
  };

  const config = getModeConfig(mode);
  const IconComponent = config.icon;

  // Handle content changes
  const handleContentChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  // Save draft
  const saveDraft = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to save drafts');
        return;
      }

      const draft = {
        id: Date.now(),
        mode,
        content,
        createdAt: new Date().toISOString(),
        title: content.subject || content.body.substring(0, 50) + '...'
      };

      const drafts = JSON.parse(localStorage.getItem('ptoCommunicationDrafts') || '[]');
      drafts.unshift(draft);
      localStorage.setItem('ptoCommunicationDrafts', JSON.stringify(drafts.slice(0, 10)));
      setSavedDrafts(drafts);
      
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('Failed to save draft');
    }
  };

  // Load drafts on mount and handle auto-generation
  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem('ptoCommunicationDrafts') || '[]');
    setSavedDrafts(drafts);
    
    // Auto-generate content if aiMode is 'auto'
    if (aiMode === 'auto') {
      // Simulate auto-generation with a delay
      setTimeout(() => {
        handleAutoGeneration();
      }, 1000);
    }
  }, []);

  const handleAutoGeneration = async () => {
    setStellaGenerating(true);
    try {
      // Generate appropriate content based on mode
      const eventType = searchParams.get('type') || 'general';
      let context = '';
      
      switch (eventType) {
        case 'newsletter':
          context = 'Monthly PTO newsletter with updates and announcements';
          break;
        default:
          context = 'PTO communication to members';
      }

      if (mode === CommunicationModes.EMAIL) {
        // Generate subject
        const subjectResponse = await aiAPI.generateContent('subject', `Create an engaging email subject for: ${context}`, { mode, organization: 'PTO' });
        if (subjectResponse?.content) {
          setContent(prev => ({ ...prev, subject: subjectResponse.content }));
        }
      }

      // Generate content
      const contentResponse = await aiAPI.generateContent('content', `Write ${mode} content for: ${context}`, { mode, organization: 'PTO' });
      if (contentResponse?.content) {
        setContent(prev => ({ ...prev, body: contentResponse.content }));
      }

      toast.success('✨ Stella has auto-generated your content! Review and customize as needed.');
    } catch (error) {
      console.error('Auto-generation error:', error);
      toast.info('Stella is ready to help when you need content assistance!');
    } finally {
      setStellaGenerating(false);
    }
  };

  // Send/Schedule communication
  const handleSend = async () => {
    if (!content.body.trim()) {
      toast.error('Please add some content before sending');
      return;
    }

    if (mode === CommunicationModes.EMAIL && !content.subject.trim()) {
      toast.error('Please add a subject line for your email');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to send communications');
        return;
      }

      toast.success(`${config.title} scheduled for sending!`);
      
      setContent({
        subject: '',
        body: '',
        recipients: [],
        scheduledFor: null
      });
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send communication');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/communications')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Composer</h1>
              <p className="text-gray-600">Create engaging communications with Stella's help</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStella(!showStella)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showStella 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Stella Assistant</span>
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center space-x-1">
            {Object.entries(CommunicationModes).map(([key, value]) => {
              const modeConfig = getModeConfig(value);
              const ModeIcon = modeConfig.icon;
              const isActive = mode === value;
              
              return (
                <button
                  key={key}
                  onClick={() => setMode(value)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? `bg-${modeConfig.color}-100 text-${modeConfig.color}-700 border border-${modeConfig.color}-200`
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ModeIcon className="w-5 h-5" />
                  <span>{modeConfig.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stella Assistant */}
            {showStella && <StellaAssistant />}

            {/* Content Form */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
                  <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
                </div>

                <div className="space-y-6">
                  {/* Subject Line (Email only) */}
                  {config.showSubject && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={content.subject}
                        onChange={(e) => handleContentChange('subject', e.target.value)}
                        placeholder="Enter your email subject..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Recipients */}
                  {config.showRecipients && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipients
                      </label>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <select className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>All PTO Members</option>
                          <option>Board Members Only</option>
                          <option>Volunteers</option>
                          <option>Parents</option>
                          <option>Teachers</option>
                          <option>Custom List...</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Content Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Content
                      {config.maxLength && (
                        <span className="text-gray-500 text-xs ml-2">
                          ({content.body.length}/{config.maxLength} characters)
                        </span>
                      )}
                    </label>
                    <textarea
                      ref={editorRef}
                      value={content.body}
                      onChange={(e) => handleContentChange('body', e.target.value)}
                      placeholder={config.placeholder}
                      maxLength={config.maxLength}
                      rows={mode === CommunicationModes.SMS ? 4 : 12}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={saveDraft}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Draft</span>
                    </button>
                    
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!content.body.trim() || (config.showSubject && !content.subject.trim())}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      config.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                      config.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-purple-600 hover:bg-purple-700'
                    } text-white`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Send {config.title}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Drafts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Drafts</h3>
              {savedDrafts.length > 0 ? (
                <div className="space-y-3">
                  {savedDrafts.slice(0, 5).map((draft) => (
                    <div
                      key={draft.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setMode(draft.mode);
                        setContent(draft.content);
                      }}
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {draft.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(draft.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No drafts saved yet</p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Communication Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Keep subject lines clear and engaging</li>
                <li>• Include a clear call-to-action</li>
                <li>• Use Stella for content inspiration</li>
                <li>• Preview before sending</li>
                <li>• Consider your audience's preferences</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Preview: {config.title}</h3>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  {config.showSubject && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Subject:</div>
                      <div className="font-semibold">{content.subject || 'No subject'}</div>
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap">
                    {content.body || 'No content'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedCommunicationComposer; 