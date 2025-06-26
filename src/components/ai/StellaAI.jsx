import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Textarea, Badge, LoadingSpinner } from '@/components/common';
import { getFeatureFlags } from '@/config/environment.js';
import api from '@/utils/api';

// Stella AI Component - Comprehensive AI Assistant
const StellaAI = ({ 
  context = 'general', 
  initialMessage = '', 
  onResponse = null,
  showHistory = true,
  maxHeight = '400px',
  className = ''
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialMessage);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const featureFlags = getFeatureFlags();

  // Context-specific configurations
  const contextConfig = {
    general: {
      title: 'Stella AI Assistant',
      description: 'Your PTO planning partner',
      systemPrompt: 'You are Stella, a helpful PTO assistant. Provide friendly, practical advice for PTO management.'
    },
    events: {
      title: 'Event Planning Assistant',
      description: 'Event planning and coordination',
      systemPrompt: 'You are Stella, an experienced PTO event planner. Help with event planning, coordination, and management.'
    },
    budget: {
      title: 'Budget Assistant',
      description: 'Budget planning and tracking',
      systemPrompt: 'You are Stella, a PTO budget expert. Help with budget planning, tracking, and financial management.'
    },
    communications: {
      title: 'Communications Assistant',
      description: 'Communication and outreach',
      systemPrompt: 'You are Stella, a PTO communications specialist. Help with messaging, outreach, and communication strategies.'
    },
    fundraising: {
      title: 'Fundraising Assistant',
      description: 'Fundraising and development',
      systemPrompt: 'You are Stella, a PTO fundraising expert. Help with fundraising strategies, campaigns, and donor management.'
    }
  };

  const config = contextConfig[context] || contextConfig.general;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I'm ${config.title}. ${config.description}. How can I help you today?`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [config]);

  // Send message to Stella AI
  const sendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Show typing indicator
      setIsTyping(true);
      
      const response = await api.post('/ai/stella', {
        message: messageContent,
        context: context,
        systemPrompt: config.systemPrompt,
        history: messages.slice(-5) // Send last 5 messages for context
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.content,
        timestamp: new Date().toISOString(),
        metadata: response.data.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Call onResponse callback if provided
      if (onResponse) {
        onResponse(assistantMessage);
      }

    } catch (err) {
      console.error('Stella AI error:', err);
      setError('Sorry, I encountered an error. Please try again.');
      
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Quick action buttons
  const quickActions = {
    general: [
      { label: 'Help with events', action: 'Can you help me plan an event?' },
      { label: 'Budget advice', action: 'I need help with budget planning' },
      { label: 'Communication tips', action: 'How can I improve PTO communications?' }
    ],
    events: [
      { label: 'Event ideas', action: 'Give me some event ideas for this semester' },
      { label: 'Timeline help', action: 'Help me create an event timeline' },
      { label: 'Volunteer coordination', action: 'How should I coordinate volunteers?' }
    ],
    budget: [
      { label: 'Budget template', action: 'Help me create a budget template' },
      { label: 'Expense tracking', action: 'How should I track expenses?' },
      { label: 'Revenue planning', action: 'Help me plan revenue sources' }
    ],
    communications: [
      { label: 'Email templates', action: 'Help me create email templates' },
      { label: 'Social media', action: 'How can I use social media effectively?' },
      { label: 'Newsletter ideas', action: 'Give me newsletter content ideas' }
    ],
    fundraising: [
      { label: 'Fundraiser ideas', action: 'What are some good fundraiser ideas?' },
      { label: 'Donor management', action: 'How should I manage donor relationships?' },
      { label: 'Campaign planning', action: 'Help me plan a fundraising campaign' }
    ]
  };

  const actions = quickActions[context] || quickActions.general;

  return (
    <Card className={`stella-ai ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{config.title}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {featureFlags.previewFeatures?.advancedStellaAI && (
            <Badge variant="preview" className="text-xs">
              Advanced
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? '🔽' : '🔼'}
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            className="p-4 space-y-4 overflow-y-auto"
            style={{ maxHeight }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.isError
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.metadata && (
                    <div className="mt-2 text-xs opacity-70">
                      Model: {message.metadata.model_used}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
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

          {/* Quick Actions */}
          {actions.length > 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(action.action)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Stella anything..."
                disabled={isLoading}
                className="flex-1 resize-none"
                rows={2}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="self-end"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Send'}
              </Button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="px-4 pb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default StellaAI; 