import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, X, Send, Minimize2, Maximize2, HelpCircle,
  MessageCircle, Search, FileText, Calculator, Calendar,
  Users, Settings, TrendingUp, Archive, Lightbulb
} from 'lucide-react';

const StellaAssistant = ({ isOpen, onClose, onMinimize, isMinimized }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState({});
  const messagesEndRef = useRef(null);

  // Determine current module context
  const getCurrentModule = () => {
    const path = location.pathname;
    if (path.includes('/communications')) return 'communications';
    if (path.includes('/events')) return 'events';
    if (path.includes('/budgets')) return 'budgets';
    if (path.includes('/admin')) return 'admin';
    return 'general';
  };

  const currentModule = getCurrentModule();

  // Module-specific configurations
  const moduleConfigs = {
    communications: {
      name: 'Communications',
      icon: MessageCircle,
      color: 'purple',
      capabilities: [
        'Create email campaigns, SMS messages, social posts, and newsletters',
        'Analyze communication performance and engagement metrics',
        'Find past communications and templates in your library',
        'Suggest optimal send times and audience targeting',
        'Help troubleshoot delivery issues and improve open rates',
        'Provide content ideas and writing assistance'
      ],
      greetings: [
        "Hi! I'm Stella, your communication assistant. Ready to create amazing content together?",
        "Hello! Let's make your PTO communications shine. What can I help you with today?",
        "Hey there! I'm here to help with all your communication needs. What's on your mind?",
        "Hi! Whether you need content ideas or help finding old campaigns, I'm here for you!",
        "Hello! I can help create, find, or improve any of your PTO communications. What would you like to do?"
      ]
    },
    events: {
      name: 'Events',
      icon: Calendar,
      color: 'blue',
      capabilities: [
        'Generate creative event ideas and themes',
        'Help plan event logistics and volunteer coordination',
        'Find past successful events in your history',
        'Suggest event timing and scheduling optimization',
        'Create event promotion strategies',
        'Troubleshoot RSVP and attendance issues'
      ],
      greetings: [
        "Hi! I'm Stella, your event planning assistant. Let's create something amazing!",
        "Hello! Ready to plan an unforgettable event? I'm here to help every step of the way.",
        "Hey there! From brainstorming to execution, I'll help make your events spectacular.",
        "Hi! Need event ideas or help finding past events? I've got you covered!",
        "Hello! Let's turn your event vision into reality. What are you planning?"
      ]
    },
    budgets: {
      name: 'Budget & Finance',
      icon: Calculator,
      color: 'green',
      capabilities: [
        'Help create and manage budgets and financial plans',
        'Find missing transactions and reconcile accounts',
        'Generate custom financial reports and spreadsheets',
        'Troubleshoot budget discrepancies and issues',
        'Analyze spending patterns and suggest optimizations',
        'Assist with fundraising financial planning'
      ],
      greetings: [
        "Hi! I'm Stella, your financial assistant. Let's keep your PTO finances organized!",
        "Hello! Whether it's budgets, reports, or finding transactions, I'm here to help.",
        "Hey there! I can help with any financial questions or tasks you have.",
        "Hi! From budget planning to troubleshooting, I'll help keep your finances on track.",
        "Hello! Let's make managing your PTO finances simple and stress-free."
      ]
    },
    admin: {
      name: 'Administration',
      icon: Settings,
      color: 'indigo',
      capabilities: [
        'Help configure system settings and permissions',
        'Assist with user management and role assignments',
        'Guide through administrative workflows',
        'Help find and organize administrative documents',
        'Troubleshoot system issues and user problems',
        'Provide training and how-to guidance'
      ],
      greetings: [
        "Hi! I'm Stella, your admin assistant. Let's keep your PTO running smoothly!",
        "Hello! I'm here to help with all your administrative needs and questions.",
        "Hey there! From settings to user management, I'll guide you through everything.",
        "Hi! Need help with admin tasks or system configuration? I'm your assistant!",
        "Hello! Let's make PTO administration simple and efficient together."
      ]
    },
    general: {
      name: 'PTO Connect',
      icon: Sparkles,
      color: 'purple',
      capabilities: [
        'Provide general help and guidance for using PTO Connect',
        'Help you navigate between different modules and features',
        'Find information across your entire PTO system',
        'Suggest workflows and best practices',
        'Answer questions about PTO Connect features',
        'Provide training and onboarding assistance'
      ],
      greetings: [
        "Hi! I'm Stella, your PTO Connect assistant. How can I help you today?",
        "Hello! I'm here to help you get the most out of PTO Connect. What do you need?",
        "Hey there! Whether it's navigation, features, or general help, I'm here for you!",
        "Hi! I can help you with anything related to PTO Connect. What's on your mind?",
        "Hello! Let's make your PTO management easier. How can I assist you?"
      ]
    }
  };

  const config = moduleConfigs[currentModule];

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = config.greetings[Math.floor(Math.random() * config.greetings.length)];
      setMessages([{
        id: 1,
        type: 'ai',
        content: greeting,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, config.greetings, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle user input
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  // Generate contextual AI responses
  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Help and guidance responses
    if (input.includes('help') || input.includes('how to') || input.includes('how do i')) {
      return `I'd be happy to help you with that! Based on what you're asking, I can guide you through the process step by step. 

For detailed help with specific features, I can:
• Walk you through any workflow in ${config.name}
• Show you where to find specific tools and options
• Explain how different features work together
• Provide best practices and tips

What specific task would you like help with?`;
    }

    // Finding/searching responses
    if (input.includes('find') || input.includes('search') || input.includes('looking for') || input.includes('can\'t find')) {
      return `I can definitely help you find what you're looking for! I have access to your entire ${config.name} system and can search through:

• Past records and historical data
• Templates and saved content
• Reports and documents
• User information and settings

Can you tell me more about what you're trying to find? For example:
• What type of item (event, transaction, communication, etc.)
• Any details you remember (dates, names, amounts)
• Where you think it might be located`;
    }

    // Module-specific responses
    switch (currentModule) {
      case 'communications':
        if (input.includes('email') || input.includes('message') || input.includes('send')) {
          return `Great! I can help you create amazing communications. What type are you thinking?

📧 **Email Campaign** - Reach all families with newsletters, announcements, or updates
📱 **SMS Message** - Quick, direct text messages for urgent communications  
📱 **Social Media Post** - Engage your community on Facebook and Instagram
📰 **Newsletter** - Comprehensive monthly or weekly updates

What would you like to create, or do you need help with an existing communication?`;
        }
        break;

      case 'events':
        if (input.includes('event') || input.includes('plan') || input.includes('idea')) {
          return `Exciting! I love helping plan events. Let me help you brainstorm:

🎉 **Event Ideas**: Seasonal celebrations, fundraisers, family fun nights, educational workshops
📅 **Planning Help**: Timeline creation, volunteer coordination, logistics planning
🔍 **Past Events**: I can find successful events from your history for inspiration
📊 **Optimization**: Best timing, promotion strategies, and attendance boosting

What kind of event are you thinking about, or would you like me to suggest some ideas based on the season?`;
        }
        break;

      case 'budgets':
        if (input.includes('budget') || input.includes('money') || input.includes('transaction') || input.includes('report')) {
          return `I'm here to help with all your financial needs! I can assist with:

💰 **Budget Planning**: Create comprehensive budgets and financial plans
🔍 **Find Transactions**: Locate missing or misplaced financial records
📊 **Custom Reports**: Generate specific financial reports and spreadsheets
🔧 **Troubleshooting**: Help reconcile accounts and fix discrepancies
📈 **Analysis**: Review spending patterns and suggest optimizations

What financial task can I help you with today?`;
        }
        break;
    }

    // General helpful response
    return `I understand you're looking for help with "${userInput}". I'm designed to assist with everything in the ${config.name} module, including:

${config.capabilities.map(cap => `• ${cap}`).join('\n')}

Could you tell me a bit more about what you're trying to accomplish? The more details you provide, the better I can help you!`;
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const colorClasses = {
    purple: 'from-purple-600 to-purple-700 border-purple-500',
    blue: 'from-blue-600 to-blue-700 border-blue-500',
    green: 'from-green-600 to-green-700 border-green-500',
    indigo: 'from-indigo-600 to-indigo-700 border-indigo-500'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 h-full flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorClasses[config.color]} text-white p-4 rounded-t-lg flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Stella Assistant</h3>
              <p className="text-xs opacity-90">{config.name} Helper</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onMinimize}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask Stella about ${config.name.toLowerCase()}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StellaAssistant;
