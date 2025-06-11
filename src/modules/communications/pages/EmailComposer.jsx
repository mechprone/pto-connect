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

    // Enhanced prompt with rich context
    return `
Create a professional, engaging email for ${orgName}, a ${schoolLevel} ${orgType}. 

Original request: "${userPrompt}"

Context to incorporate:
- This is for a ${schoolLevel} community (grades ${schoolType})
- Organization: ${orgName}
- Audience: Parents, teachers, and school community members
- Tone should be warm, professional, and community-focused

Design requirements:
- Use a modern, clean email template with proper header and footer
- Include the organization name prominently
- Use school-appropriate colors (blues, greens, or warm tones)
- Add relevant emojis where appropriate
- Include proper call-to-action buttons
- Make it mobile-responsive
- Add contact information and social links placeholders

Content requirements:
- Write in a friendly but professional tone appropriate for ${schoolLevel} parents
- Include specific details relevant to ${schoolLevel} activities
- Add urgency or excitement where appropriate
- Include clear next steps
- Fix any grammar or spelling issues
- Make the content engaging and actionable

Please create a complete, professional email that looks like it came from a premium email marketing service.
    `;
  };

  const generateProfessionalEmailDesign = (content, subject) => {
    const orgName = orgData?.name || 'Your PTO';
    
    return {
      body: {
        rows: [
          // Header Row
          {
            cells: [1],
            columns: [{
              contents: [{
                type: 'text',
                values: {
                  containerPadding: '20px',
                  anchor: '',
                  fontSize: '24px',
                  textAlign: 'center',
                  lineHeight: '120%',
                  linkStyle: {
                    inherit: true,
                    linkColor: '#0000ee',
                    linkHoverColor: '#0000ee',
                    linkUnderline: true,
                    linkHoverUnderline: true
                  },
                  _meta: {
                    htmlID: 'u_content_text_1',
                    htmlClassNames: 'u_content_text_1'
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideable: true,
                  text: `<p style="font-size: 24px; line-height: 120%; text-align: center; word-wrap: break-word;"><strong><span style="color: #2c5aa0; font-size: 28px;">${orgName}</span></strong></p>`
                }
              }],
              values: {
                backgroundColor: '#f8f9fa',
                padding: '20px',
                border: {},
                borderRadius: '8px 8px 0px 0px',
                _meta: {
                  htmlID: 'u_column_1',
                  htmlClassNames: 'u_column_1'
                }
              }
            }],
            values: {
              displayCondition: null,
              columns: false,
              backgroundColor: '',
              columnsBackgroundColor: '',
              backgroundImage: {
                url: '',
                fullWidth: true,
                repeat: false,
                center: true,
                cover: false
              },
              padding: '0px',
              _meta: {
                htmlID: 'u_row_1',
                htmlClassNames: 'u_row_1'
              }
            }
          },
          // Main Content Row
          {
            cells: [1],
            columns: [{
              contents: [{
                type: 'html',
                values: {
                  containerPadding: '30px',
                  anchor: '',
                  _meta: {
                    htmlID: 'u_content_html_1',
                    htmlClassNames: 'u_content_html_1'
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideable: true,
                  html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333;">
                    ${content}
                  </div>`
                }
              }],
              values: {
                backgroundColor: '#ffffff',
                padding: '0px',
                border: {},
                _meta: {
                  htmlID: 'u_column_2',
                  htmlClassNames: 'u_column_2'
                }
              }
            }],
            values: {
              displayCondition: null,
              columns: false,
              backgroundColor: '',
              columnsBackgroundColor: '',
              backgroundImage: {
                url: '',
                fullWidth: true,
                repeat: false,
                center: true,
                cover: false
              },
              padding: '0px',
              _meta: {
                htmlID: 'u_row_2',
                htmlClassNames: 'u_row_2'
              }
            }
          },
          // Footer Row
          {
            cells: [1],
            columns: [{
              contents: [{
                type: 'text',
                values: {
                  containerPadding: '20px',
                  anchor: '',
                  fontSize: '12px',
                  textAlign: 'center',
                  lineHeight: '120%',
                  linkStyle: {
                    inherit: true,
                    linkColor: '#0000ee',
                    linkHoverColor: '#0000ee',
                    linkUnderline: true,
                    linkHoverUnderline: true
                  },
                  _meta: {
                    htmlID: 'u_content_text_2',
                    htmlClassNames: 'u_content_text_2'
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideable: true,
                  text: `<p style="font-size: 12px; line-height: 120%; text-align: center; word-wrap: break-word; color: #666;">
                    <span style="color: #666;">© ${new Date().getFullYear()} ${orgName} | 
                    <a href="mailto:info@school.edu" style="color: #2c5aa0;">Contact Us</a> | 
                    <a href="#" style="color: #2c5aa0;">Unsubscribe</a></span>
                  </p>`
                }
              }],
              values: {
                backgroundColor: '#f8f9fa',
                padding: '20px',
                border: {},
                borderRadius: '0px 0px 8px 8px',
                _meta: {
                  htmlID: 'u_column_3',
                  htmlClassNames: 'u_column_3'
                }
              }
            }],
            values: {
              displayCondition: null,
              columns: false,
              backgroundColor: '',
              columnsBackgroundColor: '',
              backgroundImage: {
                url: '',
                fullWidth: true,
                repeat: false,
                center: true,
                cover: false
              },
              padding: '0px',
              _meta: {
                htmlID: 'u_row_3',
                htmlClassNames: 'u_row_3'
              }
            }
          }
        ],
        values: {
          textColor: '#000000',
          backgroundColor: '#e7e7e7',
          backgroundImage: {
            url: '',
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false
          },
          contentWidth: '600px',
          contentAlign: 'center',
          fontFamily: {
            label: 'Arial',
            value: 'arial,helvetica,sans-serif'
          },
          preheaderText: subject,
          linkStyle: {
            body: true,
            underline: true,
            color: '#2c5aa0'
          },
          _meta: {
            htmlID: 'u_body',
            htmlClassNames: 'u_body'
          }
        }
      },
      schemaVersion: 6
    };
  };

  const generateEnhancedContent = (prompt, mode) => {
    // This would normally call OpenAI API, but for now we'll create sophisticated mock content
    const enhancedPrompt = enhancePromptWithContext(prompt);
    
    let subject = '';
    let content = '';

    if (mode === 'auto') {
      // Auto mode: Create complete professional content
      if (prompt.toLowerCase().includes('popcorn')) {
        subject = '🍿 Popcorn Friday is This Week - Don\'t Forget Your $0.50!';
        content = `
          <h2 style="color: #2c5aa0; margin-bottom: 20px;">🍿 Popcorn Friday Alert!</h2>
          
          <p style="font-size: 16px; margin-bottom: 15px;">Dear Families,</p>
          
          <p style="margin-bottom: 15px;">Get ready for everyone's favorite day of the week - <strong>Popcorn Friday</strong> is this week!</p>
          
          <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5aa0;">
            <h3 style="color: #2c5aa0; margin-top: 0;">Quick Reminder:</h3>
            <ul style="margin: 10px 0;">
              <li>📅 <strong>When:</strong> This Friday during lunch</li>
              <li>💰 <strong>Cost:</strong> Just $0.50 per bag</li>
              <li>🎒 <strong>What to bring:</strong> Exact change in a labeled envelope</li>
            </ul>
          </div>
          
          <p style="margin-bottom: 15px;">Our delicious, freshly popped popcorn is the perfect Friday treat! All proceeds support our school programs and activities.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="#" style="background-color: #2c5aa0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">📋 View School Calendar</a>
          </div>
          
          <p style="margin-bottom: 15px;">Questions? Contact our volunteer coordinators or reply to this email.</p>
          
          <p style="margin-bottom: 5px;">Thank you for supporting our school community!</p>
          <p style="color: #666; font-style: italic;">The PTO Team</p>
        `;
      } else {
        // Generic enhanced content
        subject = `📢 Important Update: ${prompt}`;
        content = `
          <h2 style="color: #2c5aa0; margin-bottom: 20px;">📢 Important School Update</h2>
          
          <p style="font-size: 16px; margin-bottom: 15px;">Dear School Community,</p>
          
          <p style="margin-bottom: 15px;">We wanted to reach out with an important update regarding: <strong>${prompt}</strong></p>
          
          <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5aa0;">
            <p style="margin: 0;">We're working to provide you with all the details you need. Please stay tuned for more information coming soon.</p>
          </div>
          
          <p style="margin-bottom: 15px;">Your involvement and support make our school community stronger. We appreciate your patience as we finalize the details.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="#" style="background-color: #2c5aa0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">📞 Contact Us</a>
          </div>
          
          <p style="margin-bottom: 5px;">Thank you for being part of our amazing school community!</p>
          <p style="color: #666; font-style: italic;">The PTO Team</p>
        `;
      }
    } else {
      // Assisted mode: Use provided details
      subject = `📢 ${assistedData.goal}`;
      const keyPointsList = assistedData.keyPoints.split('\n').filter(p => p.trim()).map(point => 
        `<li style="margin-bottom: 8px;">${point.trim()}</li>`
      ).join('');
      
      content = `
        <h2 style="color: #2c5aa0; margin-bottom: 20px;">${assistedData.goal}</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">Dear School Community,</p>
        
        <p style="margin-bottom: 15px;">We're excited to share some important information with you!</p>
        
        ${keyPointsList ? `
        <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5aa0;">
          <h3 style="color: #2c5aa0; margin-top: 0;">Key Details:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${keyPointsList}
          </ul>
        </div>
        ` : ''}
        
        ${assistedData.cta ? `
        <div style="text-align: center; margin: 25px 0;">
          <a href="#" style="background-color: #2c5aa0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${assistedData.cta}</a>
        </div>
        ` : ''}
        
        <p style="margin-bottom: 15px;">Thank you for your continued support of our school community!</p>
        
        <p style="margin-bottom: 5px;">Best regards,</p>
        <p style="color: #666; font-style: italic;">The PTO Team</p>
      `;
    }

    return { subject, content };
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const prompt = mode === 'auto' ? autoPrompt : assistedData.goal;
      const { subject, content } = generateEnhancedContent(prompt, mode);
      
      const designJson = generateProfessionalEmailDesign(content, subject);
      
      onGenerate({ subject, designJson });
      setIsGenerating(false);
      onClose();
    }, 2500); // Longer delay to show sophisticated processing
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

  const handleAiGenerate = ({ subject, designJson }) => {
    setFormData(prev => ({ ...prev, subject }));
    
    // Load the professionally designed email template
    editorRef.current?.editor.loadDesign(designJson);
    setStatus('✨ Professional AI email loaded! Review and customize as needed.');
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
