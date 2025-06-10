import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmailEditor from 'react-email-editor';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';
import { Sparkles, X, Loader2, Wand2, FileText } from 'lucide-react';

const AiWizardModal = ({ mode, onGenerate, onClose }) => {
  const [autoPrompt, setAutoPrompt] = useState('');
  const [assistedData, setAssistedData] = useState({
    goal: '',
    keyPoints: '',
    tone: 'Friendly',
    cta: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI call
    setTimeout(() => {
      let subject = '';
      let body = '';

      if (mode === 'auto') {
        subject = `Regarding: ${autoPrompt}`;
        body = `<h1>${autoPrompt}</h1><p>This is an automatically generated email about "${autoPrompt}". Please fill in the details.</p><p>Thank you!</p>`;
      } else {
        subject = `Important: ${assistedData.goal}`;
        body = `
          <h1>${assistedData.goal}</h1>
          <p>Here are the key points for you:</p>
          <ul>
            ${assistedData.keyPoints.split('\n').map(p => `<li>${p}</li>`).join('')}
          </ul>
          <p>The desired tone for this message is: <strong>${assistedData.tone}</strong>.</p>
          <p>Next step: <strong>${assistedData.cta}</strong>.</p>
          <p><em>This draft was generated with Stella's assistance.</em></p>
        `;
      }
      
      onGenerate({ subject, body });
      setIsGenerating(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stella's AI Assistant</h2>
              <p className="text-gray-600">
                {mode === 'auto' ? 'Provide a simple prompt to generate a complete draft.' : 'Provide some details and I\'ll create a structured draft for you.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {mode === 'auto' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What is this email about?</label>
            <textarea
              value={autoPrompt}
              onChange={(e) => setAutoPrompt(e.target.value)}
              placeholder="e.g., A reminder about Popcorn Friday this week"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Goal/Subject</label>
              <input type="text" value={assistedData.goal} onChange={(e) => setAssistedData({...assistedData, goal: e.target.value})} placeholder="e.g., Recruit volunteers for the Fall Festival" className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Points (one per line)</label>
              <textarea value={assistedData.keyPoints} onChange={(e) => setAssistedData({...assistedData, keyPoints: e.target.value})} placeholder="e.g., Event is on Oct 15th&#10;We need help with setup&#10;Shifts are 2 hours long" className="w-full p-2 border border-gray-300 rounded-lg" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
                <select value={assistedData.tone} onChange={(e) => setAssistedData({...assistedData, tone: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg">
                  <option>Friendly</option>
                  <option>Formal</option>
                  <option>Urgent</option>
                  <option>Excited</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call to Action</label>
                <input type="text" value={assistedData.cta} onChange={(e) => setAssistedData({...assistedData, cta: e.target.value})} placeholder="e.g., Sign up using the link below" className="w-full p-2 border border-gray-300 rounded-lg" />
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
                Stella is Writing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Content
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EmailComposer() {
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Ready');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMode, setAiMode] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    recipients: '',
  });

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'auto' || mode === 'assisted') {
      setAiMode(mode);
      setShowAiModal(true);
    }
  }, [searchParams]);

  const handleAiGenerate = ({ subject, body }) => {
    setFormData(prev => ({ ...prev, subject }));
    
    // Create a simple Unlayer design JSON from the HTML body
    const designJson = {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: 'html',
                    values: {
                      _meta: {
                        htmlID: "u_html_1",
                        htmlClassNames: "u_html_1"
                      },
                      html: `<div style="padding: 15px;">${body}</div>`
                    }
                  }
                ],
                values: {
                  backgroundColor: "",
                  padding: "0px",
                  border: {},
                  _meta: {
                    htmlID: "u_column_1",
                    htmlClassNames: "u_column_1"
                  }
                }
              }
            ],
            values: {
              displayCondition: null,
              columns: false,
              backgroundColor: "",
              columnsBackgroundColor: "",
              backgroundImage: {
                url: "",
                fullWidth: true,
                repeat: false,
                center: true,
                cover: false
              },
              padding: "0px",
              hideDesktop: false,
              _meta: {
                htmlID: "u_row_1",
                htmlClassNames: "u_row_1"
              },
              selectable: true,
              draggable: true,
              duplicatable: true,
              deletable: true,
              hideable: true
            }
          }
        ],
        values: {
          textColor: "#000000",
          backgroundColor: "#e7e7e7",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false
          },
          contentWidth: "600px",
          contentAlign: "center",
          fontFamily: {
            label: "Arial",
            value: "arial,helvetica,sans-serif"
          },
          preheaderText: "",
          linkStyle: {
            body: true,
            underline: true,
            color: "#0000ee"
          },
          _meta: {
            htmlID: "u_body",
            htmlClassNames: "u_body"
          }
        }
      },
      schemaVersion: 6
    };

    editorRef.current?.editor.loadDesign(designJson);
    setStatus('AI draft loaded. Review and make edits.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    editorRef.current?.editor.saveDesign(design => {
      console.log('Saving design:', design);
      setStatus('Draft saved to console.');
    });
  };

  const handleSend = () => {
    editorRef.current?.editor.exportHtml(data => {
      console.log('HTML to send:', data.html);
      setStatus('Email "sent" to console.');
      alert('Email sent! (Check console for HTML output)');
    });
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
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Composer</h1>
            <p className="text-sm text-gray-500">{status}</p>
          </div>
          <div className="space-x-3">
            <button onClick={handleSave} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Save Draft
            </button>
            <button onClick={handleSend} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Send Email
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4">
          <input
            type="text"
            name="recipients"
            value={formData.recipients}
            onChange={handleInputChange}
            placeholder="To: (e.g., All Families, Board Members)"
            className="w-full p-2 border-b border-gray-300 focus:border-blue-500 outline-none"
          />
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Subject"
            className="w-full p-2 border-b border-gray-300 focus:border-blue-500 outline-none font-medium"
          />
        </div>

        <div className="border rounded-lg shadow-md overflow-hidden h-[700px]">
          <EmailEditor ref={editorRef} />
        </div>
      </div>
    </>
  );
}
