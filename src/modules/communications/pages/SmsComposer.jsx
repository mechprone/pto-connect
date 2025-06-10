import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, X, Loader2, Wand2, Smartphone } from 'lucide-react';

const AiWizardModal = ({ mode, onGenerate, onClose }) => {
  const [autoPrompt, setAutoPrompt] = useState('');
  const [assistedData, setAssistedData] = useState({
    goal: '',
    keyInfo: '',
    link: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI call
    setTimeout(() => {
      let message = '';
      if (mode === 'auto') {
        message = `Reminder: ${autoPrompt}. See you there!`;
      } else {
        message = `PTO Update: ${assistedData.goal}. ${assistedData.keyInfo}. More info: ${assistedData.link || '(add link here)'}`;
      }
      
      onGenerate({ message });
      setIsGenerating(false);
      onClose();
    }, 1500);
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
                {mode === 'auto' ? 'Provide a simple prompt for a quick SMS.' : 'Give me a few details for a structured message.'}
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
            <input
              type="text"
              value={autoPrompt}
              onChange={(e) => setAutoPrompt(e.target.value)}
              placeholder="e.g., Popcorn Friday"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal of Message</label>
              <input type="text" value={assistedData.goal} onChange={(e) => setAssistedData({...assistedData, goal: e.target.value})} placeholder="e.g., Remind about early dismissal" className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Info</label>
              <input type="text" value={assistedData.keyInfo} onChange={(e) => setAssistedData({...assistedData, keyInfo: e.target.value})} placeholder="e.g., Dismissal is at 1 PM on Friday" className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Optional Link</label>
              <input type="text" value={assistedData.link} onChange={(e) => setAssistedData({...assistedData, link: e.target.value})} placeholder="e.g., https://pto.school/details" className="w-full p-2 border border-gray-300 rounded-lg" />
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
                Stella is Writing...
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
    setStatus('AI draft loaded. Review and make edits.');
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
