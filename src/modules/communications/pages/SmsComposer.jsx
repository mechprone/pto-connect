import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabaseClient';
import { Sparkles, X, Loader2, Wand2, Smartphone } from 'lucide-react';

const AiWizardModal = ({ mode, onGenerate, onClose }) => {
  const [autoPrompt, setAutoPrompt] = useState('');
  const [assistedData, setAssistedData] = useState({
    goal: '',
    keyInfo: '',
    urgency: 'Normal',
    includeLink: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [orgData, setOrgData] = useState(null);

  useEffect(() => {
    // Fetch organization data for context enhancement
    const fetchOrgData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select(`
              organization_id,
              organizations (
                name,
                type,
                schools (
                  name,
                  grade_levels
                )
              )
            `)
            .eq('user_id', user.id)
            .single();
          
          setOrgData(profile?.organizations);
        }
      } catch (error) {
        console.error('Error fetching org data:', error);
      }
    };

    fetchOrgData();
  }, []);

  const enhancePromptWithContext = (userPrompt) => {
    const schoolType = orgData?.schools?.grade_levels || 'K-12';
    const orgName = orgData?.name || 'Your PTO';
    const orgType = orgData?.type || 'PTO';
    
    // Determine school level context
    let schoolLevel = 'elementary';
    if (schoolType.includes('6') || schoolType.includes('7') || schoolType.includes('8')) {
      schoolLevel = 'middle school';
    } else if (schoolType.includes('9') || schoolType.includes('10') || schoolType.includes('11') || schoolType.includes('12')) {
      schoolLevel = 'high school';
    }

    return `
Create a professional, engaging SMS message for ${orgName}, a ${schoolLevel} ${orgType}.

Original request: "${userPrompt}"

Context to incorporate:
- This is for a ${schoolLevel} community (grades ${schoolType})
- Organization: ${orgName}
- Audience: Parents and school community members
- SMS character limit: 160 characters maximum

SMS Requirements:
- Keep it short, punchy, and to the point
- Use appropriate emojis to make it engaging
- Include clear action items or next steps
- Make it urgent but friendly
- Use school-appropriate language for ${schoolLevel} parents
- Include relevant details but stay concise
- Make it informative but fun and engaging
- Fix any grammar or spelling issues
- Create urgency or excitement where appropriate

Please create a professional SMS that feels personal and engaging while staying within character limits.
    `;
  };

  const generateEnhancedSMS = (prompt, mode) => {
    const enhancedPrompt = enhancePromptWithContext(prompt);
    let message = '';

    if (mode === 'auto') {
      // Auto mode: Create complete professional SMS
      if (prompt.toLowerCase().includes('popcorn')) {
        message = '🍿 POPCORN FRIDAY! Don\'t forget $0.50 for your kiddo. Fresh popped goodness awaits! 🎒✨';
      } else if (prompt.toLowerCase().includes('early dismissal') || prompt.toLowerCase().includes('dismissal')) {
        message = '🚨 EARLY DISMISSAL ALERT! Pickup at 1PM Friday. Set those alarms! 📱⏰ Questions? Reply here!';
      } else if (prompt.toLowerCase().includes('volunteer')) {
        message = '🙋‍♀️ VOLUNTEERS NEEDED! Help make our event amazing. 2-hour shifts available. Sign up: [link] 💪';
      } else if (prompt.toLowerCase().includes('meeting')) {
        message = '📅 PTO MEETING TONIGHT! 7PM in the library. Pizza provided! Come shape our school\'s future 🍕✨';
      } else if (prompt.toLowerCase().includes('fundraiser') || prompt.toLowerCase().includes('fundraising')) {
        message = '💰 FUNDRAISER ALERT! Help us reach our goal. Every dollar counts for our kids! Details: [link] 🎯';
      } else {
        // Generic enhanced content
        message = `📢 ${prompt.toUpperCase()}! More details coming soon. Stay tuned! 🎉`;
      }
    } else {
      // Assisted mode: Use provided details
      const urgencyEmoji = assistedData.urgency === 'High' ? '🚨' : assistedData.urgency === 'Low' ? 'ℹ️' : '📢';
      const actionEmoji = assistedData.includeLink ? '👆' : '✨';
      
      message = `${urgencyEmoji} ${assistedData.goal.toUpperCase()}! ${assistedData.keyInfo}${assistedData.includeLink ? ' Link: [URL]' : ''} ${actionEmoji}`;
    }

    // Ensure message is within 160 characters
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }

    return message;
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const prompt = mode === 'auto' ? autoPrompt : assistedData.goal;
      const message = generateEnhancedSMS(prompt, mode);
      
      onGenerate({ message });
      setIsGenerating(false);
      onClose();
    }, 2000); // Longer delay to show sophisticated processing
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stella's SMS Assistant</h2>
              <p className="text-gray-600">
                {mode === 'auto' ? 'Tell me the topic and I\'ll craft an engaging SMS.' : 'Provide details for a targeted message.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {mode === 'auto' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What is this SMS about?</label>
            <textarea
              value={autoPrompt}
              onChange={(e) => setAutoPrompt(e.target.value)}
              placeholder="e.g., Popcorn Friday reminder, Early dismissal alert, Volunteer recruitment"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal of Message</label>
              <input 
                type="text" 
                value={assistedData.goal} 
                onChange={(e) => setAssistedData({...assistedData, goal: e.target.value})} 
                placeholder="e.g., Remind about early dismissal" 
                className="w-full p-2 border border-gray-300 rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Information</label>
              <input 
                type="text" 
                value={assistedData.keyInfo} 
                onChange={(e) => setAssistedData({...assistedData, keyInfo: e.target.value})} 
                placeholder="e.g., Pickup at 1 PM on Friday" 
                className="w-full p-2 border border-gray-300 rounded-lg" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                <select 
                  value={assistedData.urgency} 
                  onChange={(e) => setAssistedData({...assistedData, urgency: e.target.value})} 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Include Link?</label>
                <label className="flex items-center mt-2">
                  <input 
                    type="checkbox" 
                    checked={assistedData.includeLink} 
                    onChange={(e) => setAssistedData({...assistedData, includeLink: e.target.checked})} 
                    className="h-4 w-4 text-blue-600 rounded" 
                  />
                  <span className="ml-2 text-sm">Add link placeholder</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Stella is Crafting...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate SMS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SmsComposer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Ready');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMode, setAiMode] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    recipients: '',
  });

  const charLimit = 160;
  const charsLeft = charLimit - formData.message.length;

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'auto' || mode === 'assisted') {
      setAiMode(mode);
      setShowAiModal(true);
    }
  }, [searchParams]);

  const handleAiGenerate = ({ message }) => {
    setFormData(prev => ({ ...prev, message }));
    setStatus('✨ Professional SMS crafted! Review and customize as needed.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {showAiModal && (
        <AiWizardModal
          mode={aiMode}
          onClose={() => setShowAiModal(false)}
          onGenerate={handleAiGenerate}
        />
      )}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SMS Composer</h1>
            <p className="text-sm text-gray-500">{status}</p>
          </div>
          <div className="space-x-3">
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Save Draft
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Send SMS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Composer */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
              <input
                type="text"
                name="recipients"
                value={formData.recipients}
                onChange={handleInputChange}
                placeholder="e.g., All Families, Board Members"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type your SMS message here..."
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={8}
                maxLength={charLimit}
              />
              <p className={`text-sm mt-1 ${charsLeft < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                {charsLeft} characters remaining
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2">SMS Preview</p>
            <div className="w-72 bg-gray-800 rounded-3xl p-2 shadow-2xl">
              <div className="bg-white rounded-2xl h-full p-4">
                <div className="flex flex-col h-full">
                  <div className="text-center text-xs text-gray-400 mb-4">9:41 AM</div>
                  <div className="flex-grow overflow-y-auto">
                    <div className="bg-gray-200 rounded-lg p-2 max-w-xs self-start">
                      <p className="text-sm text-gray-800 break-words">
                        {formData.message || "Your message will appear here..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
