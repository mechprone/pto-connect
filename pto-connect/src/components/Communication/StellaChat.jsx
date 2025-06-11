import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Stella's greeting library - rotated randomly
const STELLA_GREETINGS = [
  "Hey {firstName}! 👋 What communication magic can we create together today?",
  "Hi there, {firstName}! ✨ Ready to craft something amazing for your school community?",
  "Hello {firstName}! 🌟 I'm here to help you create engaging content. What's on your mind?",
  "Hey {firstName}! 💫 Need a creative spark? Tell me what you'd like to communicate!",
  "Hi {firstName}! 🎯 Let's make your message shine! What are you working on?",
  "Hello there, {firstName}! 🚀 Ready to create something that'll get your community excited?",
  "Hey {firstName}! ✨ I love helping with communications! What's your goal today?",
  "Hi {firstName}! 🌈 Whether it's an email, text, or social post - I'm here to help!",
  "Hello {firstName}! 💡 Got an idea brewing? Let's turn it into amazing content!",
  "Hey there, {firstName}! 🎨 Time to create something beautiful for your PTO!"
];

// Follow-up prompts when Stella needs more info
const STELLA_FOLLOW_UPS = [
  "That sounds great! Can you tell me a bit more about {topic}?",
  "I love that idea! What's the main message you want to get across?",
  "Perfect! Who's your target audience for this?",
  "Awesome! What tone are you going for - friendly, urgent, informative?",
  "Great topic! Any specific details you want to make sure I include?",
  "Nice! What's the most important thing families should know about this?",
  "Excellent! Is this time-sensitive or more of a general announcement?",
  "Love it! Should this feel more casual and fun, or professional?",
  "That's exciting! What action do you want people to take after reading this?",
  "Perfect choice! Any key dates or deadlines I should highlight?"
];

// Content safety keywords to filter out
const UNSAFE_KEYWORDS = [
  'inappropriate', 'explicit', 'sexual', 'violent', 'hate', 'discrimination',
  'illegal', 'drugs', 'alcohol', 'gambling', 'profanity', 'offensive',
  'harassment', 'bullying', 'threat', 'weapon', 'dangerous'
];

// School-appropriate topics Stella can help with
const APPROVED_TOPICS = [
  'events', 'fundraising', 'volunteer', 'meeting', 'announcement', 'newsletter',
  'reminder', 'celebration', 'achievement', 'calendar', 'schedule', 'activity',
  'education', 'learning', 'community', 'family', 'student', 'teacher',
  'school', 'pto', 'parent', 'safety', 'health', 'academic', 'extracurricular'
];

const StellaChat = ({ isOpen, onClose, onCreateCommunication }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState(null);
  const [conversationContext, setConversationContext] = useState({
    topic: '',
    type: '', // email, sms, social, newsletter
    details: [],
    readyToCreate: false
  });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, organization_id, organizations(name, type)')
          .eq('user_id', user.id)
          .single();
        
        setUserData(profile);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const initializeConversation = () => {
    const firstName = userData?.first_name || 'there';
    const greeting = STELLA_GREETINGS[Math.floor(Math.random() * STELLA_GREETINGS.length)]
      .replace('{firstName}', firstName);
    
    setMessages([{
      id: 1,
      sender: 'stella',
      text: greeting,
      timestamp: new Date()
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isContentSafe = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check for unsafe keywords
    const hasUnsafeContent = UNSAFE_KEYWORDS.some(keyword => 
      lowerText.includes(keyword)
    );
    
    if (hasUnsafeContent) {
      return false;
    }
    
    // Check if it's school-related
    const isSchoolRelated = APPROVED_TOPICS.some(topic => 
      lowerText.includes(topic)
    ) || lowerText.includes('school') || lowerText.includes('student') || lowerText.includes('parent');
    
    return isSchoolRelated;
  };

  const analyzeUserIntent = (text) => {
    const lowerText = text.toLowerCase();
    
    // Determine communication type
    let type = '';
    if (lowerText.includes('email') || lowerText.includes('newsletter') || lowerText.includes('long')) {
      type = lowerText.includes('newsletter') ? 'newsletter' : 'email';
    } else if (lowerText.includes('text') || lowerText.includes('sms') || lowerText.includes('quick') || lowerText.includes('short')) {
      type = 'sms';
    } else if (lowerText.includes('social') || lowerText.includes('facebook') || lowerText.includes('instagram') || lowerText.includes('post')) {
      type = 'social';
    }
    
    // Extract topic
    let topic = '';
    APPROVED_TOPICS.forEach(approvedTopic => {
      if (lowerText.includes(approvedTopic)) {
        topic = approvedTopic;
      }
    });
    
    return { type, topic };
  };

  const generateStellaResponse = (userMessage) => {
    const { type, topic } = analyzeUserIntent(userMessage);
    const firstName = userData?.first_name || 'there';
    
    // Update conversation context
    const newContext = { ...conversationContext };
    if (type) newContext.type = type;
    if (topic) newContext.topic = topic;
    newContext.details.push(userMessage);
    
    // Determine if we have enough info to create content
    const hasEnoughInfo = newContext.type && newContext.topic && newContext.details.length >= 2;
    newContext.readyToCreate = hasEnoughInfo;
    
    setConversationContext(newContext);
    
    if (hasEnoughInfo) {
      // Ready to create - ask final confirmation
      const typeText = newContext.type === 'sms' ? 'text message' : 
                      newContext.type === 'social' ? 'social media post' : 
                      newContext.type;
      
      return `Perfect! I have everything I need to create an amazing ${typeText} about ${newContext.topic}. 

Based on our conversation, I'll craft something that's engaging, professional, and perfect for your school community.

Would you like me to create this ${typeText} for you now? I'll open the composer with your content ready to review and send! ✨`;
    } else if (!newContext.type) {
      // Need to determine communication type
      return `That sounds like a great topic! What type of communication are you thinking? 

📧 **Email** - For detailed announcements or newsletters
📱 **Text Message** - For quick, urgent reminders  
📱 **Social Media Post** - To engage your community online

Just let me know which feels right for your message!`;
    } else if (!newContext.topic || newContext.details.length < 2) {
      // Need more details
      const followUp = STELLA_FOLLOW_UPS[Math.floor(Math.random() * STELLA_FOLLOW_UPS.length)]
        .replace('{topic}', newContext.topic || 'this');
      return followUp;
    }
    
    return "I'm here to help you create amazing communications for your school community! What would you like to work on?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    
    // Check content safety
    if (!isContentSafe(userMessage)) {
      const safetyMessage = {
        id: Date.now(),
        sender: 'stella',
        text: "I'm designed to help with school-related communications only. Let's focus on creating content for your PTO community - like event announcements, volunteer requests, or school updates! What would you like to communicate about? 😊",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, safetyMessage]);
      setInputValue('');
      return;
    }
    
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate Stella thinking
    setTimeout(() => {
      const stellaResponse = generateStellaResponse(userMessage);
      
      const stellaMessage = {
        id: Date.now() + 1,
        sender: 'stella',
        text: stellaResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, stellaMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleCreateCommunication = () => {
    if (!conversationContext.readyToCreate) return;
    
    // Create a summary of the conversation for the composer
    const conversationSummary = conversationContext.details.join(' ');
    
    // Navigate to appropriate composer with context
    const routes = {
      email: '/communications/email-composer',
      sms: '/communications/sms-composer', 
      social: '/communications/social-composer',
      newsletter: '/communications/newsletter-composer'
    };
    
    const route = routes[conversationContext.type];
    if (route) {
      navigate(`${route}?mode=auto&prompt=${encodeURIComponent(conversationSummary)}`);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-6 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Chat with Stella</h3>
              <p className="text-sm opacity-90">Your AI Communication Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                {message.sender === 'stella' && conversationContext.readyToCreate && 
                 message === messages[messages.length - 1] && (
                  <button
                    onClick={handleCreateCommunication}
                    className="mt-3 w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    ✨ Yes, Create This For Me!
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Stella is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StellaChat;
