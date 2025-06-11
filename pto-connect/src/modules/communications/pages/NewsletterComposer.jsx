import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmailEditor from 'react-email-editor';
import { supabase } from '@/utils/supabaseClient';
import { Sparkles, X, Loader2, Wand2, FileText, Calendar, Users } from 'lucide-react';

const AiWizardModal = ({ mode, onGenerate, onClose }) => {
  const [autoPrompt, setAutoPrompt] = useState('');
  const [assistedData, setAssistedData] = useState({
    theme: '',
    sections: '',
    highlights: '',
    tone: 'Professional',
    frequency: 'Monthly'
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

  const generateProfessionalNewsletterDesign = (content, subject) => {
    const orgName = orgData?.name || 'Your PTO';
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return {
      body: {
        rows: [
          // Header Row with Logo and Date
          {
            cells: [1],
            columns: [{
              contents: [{
                type: 'text',
                values: {
                  containerPadding: '30px 20px 20px 20px',
                  anchor: '',
                  fontSize: '32px',
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
                    htmlID: 'u_content_text_header',
                    htmlClassNames: 'u_content_text_header'
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideable: true,
                  text: `<p style="font-size: 32px; line-height: 120%; text-align: center; word-wrap: break-word; margin: 0;"><strong><span style="color: #1a365d; font-family: 'Georgia', serif;">${orgName}</span></strong></p>
                  <p style="font-size: 18px; line-height: 120%; text-align: center; word-wrap: break-word; margin: 10px 0 0 0; color: #4a5568; font-style: italic;">Newsletter • ${currentDate}</p>`
                }
              }],
              values: {
                backgroundColor: '#f7fafc',
                padding: '0px',
                border: {},
                borderRadius: '12px 12px 0px 0px',
                _meta: {
                  htmlID: 'u_column_header',
                  htmlClassNames: 'u_column_header'
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
                htmlID: 'u_row_header',
                htmlClassNames: 'u_row_header'
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
                  containerPadding: '40px 30px',
                  anchor: '',
                  _meta: {
                    htmlID: 'u_content_html_main',
                    htmlClassNames: 'u_content_html_main'
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideable: true,
                  html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2d3748;">
                    ${content}
                  </div>`
                }
              }],
              values: {
                backgroundColor: '#ffffff',
                padding: '0px',
                border: {},
                _meta: {
                  htmlID: 'u_column_main',
                  htmlClassNames: 'u_column_main'
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
                htmlID: 'u_row_main',
                htmlClassNames: 'u_row_main'
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
                  containerPadding: '30px 20px',
                  anchor: '',
                  fontSize: '14px',
                  textAlign: 'center',
                  lineHeight: '140%',
                  linkStyle: {
                    inherit: true,
                    linkColor: '#1a365d',
                    linkHoverColor: '#1a365d',
                    linkUnderline: true,
                    linkHoverUnderline: true
                  },
                  _meta: {
                    htmlID: 'u_content_text_footer',
                    htmlClassNames: 'u_content_text_footer'
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideable: true,
                  text: `<p style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word; color: #718096; margin: 0;">
                    <strong style="color: #1a365d;">${orgName}</strong><br>
                    Building stronger communities, one family at a time.<br><br>
                    <a href="mailto:info@school.edu" style="color: #1a365d; text-decoration: none;">📧 Contact Us</a> | 
                    <a href="#" style="color: #1a365d; text-decoration: none;">🌐 Visit Website</a> | 
                    <a href="#" style="color: #1a365d; text-decoration: none;">📱 Follow Us</a><br><br>
                    <span style="font-size: 12px; color: #a0aec0;">© ${new Date().getFullYear()} ${orgName} | 
                    <a href="#" style="color: #a0aec0;">Unsubscribe</a></span>
                  </p>`
                }
              }],
              values: {
                backgroundColor: '#f7fafc',
                padding: '0px',
                border: {},
                borderRadius: '0px 0px 12px 12px',
                _meta: {
                  htmlID: 'u_column_footer',
                  htmlClassNames: 'u_column_footer'
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
                htmlID: 'u_row_footer',
                htmlClassNames: 'u_row_footer'
              }
            }
          }
        ],
        values: {
          textColor: '#2d3748',
          backgroundColor: '#e2e8f0',
          backgroundImage: {
            url: '',
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false
          },
          contentWidth: '700px',
          contentAlign: 'center',
          fontFamily: {
            label: 'Arial',
            value: 'arial,helvetica,sans-serif'
          },
          preheaderText: subject,
          linkStyle: {
            body: true,
            underline: true,
            color: '#1a365d'
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

  const generateMarketingQualityNewsletter = (prompt, mode) => {
    let subject = '';
    let content = '';

    if (mode === 'auto') {
      // Auto mode: Create complete marketing-quality newsletters
      if (prompt.toLowerCase().includes('monthly') || prompt.toLowerCase().includes('november') || prompt.toLowerCase().includes('fall')) {
        subject = '🍂 November Newsletter: Amazing Things Happening at Our School!';
        content = `
          <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #4299e1; padding-bottom: 15px;">🍂 November Highlights</h1>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">📊 This Month's Impact</h2>
            <div style="display: flex; justify-content: space-around; margin-top: 20px;">
              <div><strong style="font-size: 32px; display: block;">127</strong>Volunteers</div>
              <div><strong style="font-size: 32px; display: block;">$8,450</strong>Raised</div>
              <div><strong style="font-size: 32px; display: block;">15</strong>Events</div>
            </div>
          </div>

          <h2 style="color: #1a365d; font-size: 22px; margin: 30px 0 15px 0; border-left: 4px solid #4299e1; padding-left: 15px;">🎉 Celebrating Our Wins</h2>
          
          <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;"><strong>🏆 Fall Festival Success!</strong> Our Fall Festival was absolutely incredible! Thanks to 89 amazing volunteers, we raised over $12,000 for new playground equipment. The kids had a blast, and our community came together in the most beautiful way!</p>
            
            <p style="margin: 0; font-style: italic; color: #2d5016;">"This was the best school event we've ever attended. The organization was flawless!" - Sarah M., Parent</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🙋‍♀️ Volunteer for Thanksgiving Events</a>
          </div>

          <div style="background: linear-gradient(135deg, #38b2ac 0%, #319795 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">💝 Thank You, Amazing Families!</h2>
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">Every volunteer hour, every donation, every word of encouragement makes our school community stronger. Together, we're not just supporting education – we're building the foundation for our children's bright futures!</p>
          </div>
        `;
      } else {
        // Generic enhanced newsletter
        subject = `📰 ${prompt.charAt(0).toUpperCase() + prompt.slice(1)} Newsletter - Exciting Updates Inside!`;
        content = `
          <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #4299e1; padding-bottom: 15px;">📰 School Newsletter</h1>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">🌟 What's New This Month</h2>
            <p style="margin: 0; font-size: 16px;">${prompt} and so much more! Our school community continues to amaze us with incredible achievements and heartwarming moments.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">📅 View Full Calendar</a>
          </div>

          <div style="background: linear-gradient(135deg, #38b2ac 0%, #319795 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">💝 Thank You!</h2>
            <p style="margin: 0; font-size: 16px;">Together, we're building an incredible community where every child can thrive!</p>
          </div>
        `;
      }
    } else {
      // Assisted mode: Use provided details with marketing flair
      subject = `📰 ${assistedData.theme} Newsletter - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      
      content = `
        <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #4299e1; padding-bottom: 15px;">📰 ${assistedData.theme}</h1>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px;">🌟 This Month's Focus</h2>
          <p style="margin: 0; font-size: 16px;">${assistedData.theme} - Building stronger connections and creating amazing opportunities for our school community!</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">🔗 Learn More</a>
        </div>

        <div style="background: linear-gradient(135deg, #38b2ac 0%, #319795 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px;">💝 Thank You, Amazing Community!</h2>
          <p style="margin: 0; font-size: 16px;">Your support and involvement make everything possible. Together, we're creating an incredible environment where every child can succeed!</p>
        </div>
      `;
    }

    return { subject, content };
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const prompt = mode === 'auto' ? autoPrompt : assistedData.theme;
      const { subject, content } = generateMarketingQualityNewsletter(prompt, mode);
      
      const designJson = generateProfessionalNewsletterDesign(content, subject);
      
      onGenerate({ subject, designJson });
      setIsGenerating(false);
      onClose();
    }, 3000); // Longer delay to show sophisticated processing
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stella's Newsletter Assistant</h2>
              <p className="text-gray-600">
                {mode === 'auto' ? 'Tell me the theme and I\'ll create a comprehensive newsletter.' : 'Provide details for a structured newsletter.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {mode === 'auto' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Theme/Topic</label>
            <textarea
              value={autoPrompt}
              onChange={(e) => setAutoPrompt(e.target.value)}
              placeholder="e.g., Monthly November update, Fall achievements, Holiday preparations"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Theme</label>
              <input 
                type="text" 
                value={assistedData.theme} 
                onChange={(e) => setAssistedData({...assistedData, theme: e.target.value})} 
                placeholder="e.g., November Community Highlights" 
                className="w-full p-2 border border-gray-300 rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Tone</label>
              <select 
                value={assistedData.tone} 
                onChange={(e) => setAssistedData({...assistedData, tone: e.target.value})} 
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option>Professional</option>
                <option>Friendly</option>
                <option>Inspiring</option>
                <option>Informative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select 
                value={assistedData.frequency} 
                onChange={(e) => setAssistedData({...assistedData, frequency: e.target.value})} 
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Quarterly</option>
                <option>Special Edition</option>
              </select>
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
                Stella is Designing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Newsletter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NewsletterComposer() {
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
    
    // Load the professionally designed newsletter template
    editorRef.current?.editor.loadDesign(designJson);
    setStatus('✨ Professional newsletter created! Review and customize as needed.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    editorRef.current?.editor.saveDesign(design => {
      console.log('Saving design:', design);
      setStatus('Newsletter draft saved to console.');
    });
  };

  const handleSend = () => {
    editorRef.current?.editor.exportHtml(data => {
      console.log('HTML to send:', data.html);
      setStatus('Newsletter "sent" to console.');
      alert('Newsletter sent! (Check console for HTML output)');
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
            <h1 className="text-3xl font-bold text-gray-900">Newsletter Composer</h1>
            <p className="text-sm text-gray-500">{status}</p>
          </div>
          <div className="space-x-3">
            <button onClick={handleSave} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Save Draft
            </button>
            <button onClick={handleSend} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Send Newsletter
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4">
          <input
            type="text"
            name="recipients"
            value={formData.recipients}
            onChange={handleInputChange}
            placeholder="To: (e.g., All Families, Subscribers)"
            className="w-full p-2 border-b border-gray-300 focus:border-blue-500 outline-none"
          />
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Newsletter Subject"
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
