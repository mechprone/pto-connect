import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './GrapesJSEditor.css';
// Import plugins by name for side-effects (registration)
import 'grapesjs-preset-webpage';
import 'grapesjs-preset-newsletter';

const GrapesJSEditor = () => {
  const editorRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [templateName, setTemplateName] = useState('New Template');

  const defaultTemplates = {
    newsletter: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">School Newsletter</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Monthly Update</p>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-top: 0;">What's New This Month</h2>
          <p style="color: #666; line-height: 1.6;">Welcome to our monthly newsletter! Here you'll find all the latest updates, upcoming events, and important announcements from our school community.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Upcoming Events</h3>
            <ul style="color: #666;">
              <li>Parent-Teacher Conference - October 15th</li>
              <li>Fall Festival - October 22nd</li>
              <li>Book Fair - October 25-29th</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Learn More</a>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
          <p style="margin: 0;">© 2024 School Name. All rights reserved.</p>
        </div>
      </div>
    `,
    announcement: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #e74c3c; color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Important Announcement</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-top: 0;">Attention Parents and Students</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">We have an important announcement regarding upcoming changes to our school schedule and procedures.</p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Key Points:</h3>
            <ul style="color: #856404;">
              <li>New drop-off procedures effective Monday</li>
              <li>Updated lunch menu options</li>
              <li>After-school program registration now open</li>
            </ul>
          </div>
          <p style="color: #666;">Please review the attached documents and contact us if you have any questions.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Read Full Details</a>
          </div>
        </div>
      </div>
    `,
    event: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">You're Invited!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Annual School Fundraiser</p>
        </div>
        <div style="padding: 30px; background: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; display: inline-block;">
              <div style="font-size: 24px; font-weight: bold; color: #333;">Saturday, November 5th</div>
              <div style="color: #666; margin-top: 5px;">6:00 PM - 9:00 PM</div>
            </div>
          </div>
          <h2 style="color: #333; text-align: center;">Join us for an evening of fun and fundraising!</h2>
          <p style="color: #666; line-height: 1.6; text-align: center;">Help us raise funds for new playground equipment while enjoying great food, live music, and exciting activities for the whole family.</p>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d5a2d; margin-top: 0;">Event Highlights:</h3>
            <ul style="color: #2d5a2d;">
              <li>Silent auction with amazing prizes</li>
              <li>Live entertainment by local artists</li>
              <li>Delicious food and refreshments</li>
              <li>Activities for children of all ages</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background: #f093fb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">RSVP Now</a>
          </div>
        </div>
      </div>
    `
  };

  const loadTemplate = (templateType) => {
    if (editorRef.current && defaultTemplates[templateType]) {
      const template = defaultTemplates[templateType];
      editorRef.current.setComponents(template);
      setTemplateName(templateType.charAt(0).toUpperCase() + templateType.slice(1));
      setShowWelcome(false);
    }
  };

  const startBlank = () => {
    if (editorRef.current) {
      editorRef.current.setComponents('<div style="padding: 20px; text-align: center; color: #666;">Start building your email template here...</div>');
      setTemplateName('New Template');
      setShowWelcome(false);
    }
  };

  const exportTemplate = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHtml();
      const css = editorRef.current.getCss();
      console.log('Template HTML:', html);
      console.log('Template CSS:', css);
      alert('Template exported! Check console for HTML/CSS output.');
    }
  };

  useEffect(() => {
    if (!editorRef.current) {
      const editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: 'auto',
        storageManager: false,
        // Use STRINGS to identify plugins
        plugins: ['gjs-preset-webpage', 'gjs-preset-newsletter'],
        // Use STRINGS for plugin options keys
        pluginsOpts: {
          'gjs-preset-webpage': {
            styleManager: {
              sectors: [{
                name: 'Dimension',
                open: false,
                properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
              }, {
                name: 'Typography',
                open: false,
                properties: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'],
              }, {
                name: 'Decorations',
                open: false,
                properties: ['background-color', 'border-radius', 'border', 'box-shadow'],
              }],
            },
          },
          'gjs-preset-newsletter': {
            // Options for the newsletter preset can go here
          },
        },
      });

      editor.Commands.add('save-template', {
        run: (editor) => {
          const html = editor.getHtml();
          const css = editor.getCss();
          console.log("Saving template:", { html, css });
          alert('Template Saved! (Check console for output)');
        }
      });
      
      const panels = editor.Panels;
      panels.addButton('options', {
        id: 'save-btn',
        className: 'fa fa-save',
        command: 'save-template',
        attributes: { title: 'Save Template' },
      });
      panels.addButton('options', {
        id: 'preview-btn',
        className: 'fa fa-eye',
        command: 'core:preview',
        attributes: { title: 'Preview' },
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showWelcome && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            textAlign: 'center',
          }}>
            <h1 style={{ color: '#333', marginBottom: '20px' }}>Welcome to the Email Template Builder!</h1>
            <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
              Choose a template to get started, or start from scratch. You can drag and drop elements, 
              edit text, and customize styles to create your perfect email template.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <button
                onClick={() => loadTemplate('newsletter')}
                style={{
                  padding: '20px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
                onMouseOut={(e) => e.target.style.borderColor = '#e0e0e0'}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📰</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Newsletter</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Perfect for monthly updates</p>
              </button>
              
              <button
                onClick={() => loadTemplate('announcement')}
                style={{
                  padding: '20px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#e74c3c'}
                onMouseOut={(e) => e.target.style.borderColor = '#e0e0e0'}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📢</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Announcement</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>For important updates</p>
              </button>
              
              <button
                onClick={() => loadTemplate('event')}
                style={{
                  padding: '20px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#f093fb'}
                onMouseOut={(e) => e.target.style.borderColor = '#e0e0e0'}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎉</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Event Invitation</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>For special occasions</p>
              </button>
            </div>
            
            <button
              onClick={startBlank}
              style={{
                padding: '15px 30px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              Start from Scratch
            </button>
          </div>
        </div>
      )}

      <div style={{
        padding: '10px 20px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Email Template Builder</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#666' }}>Template: {templateName}</p>
        </div>
        <div>
          <button onClick={() => setShowWelcome(true)} style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}>New Template</button>
          <button onClick={exportTemplate} style={{
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: '10px'
          }}>Export Template</button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <div id="gjs" />
      </div>
    </div>
  );
};

export default GrapesJSEditor; 