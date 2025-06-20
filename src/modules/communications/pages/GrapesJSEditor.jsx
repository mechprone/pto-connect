import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './GrapesJSEditor.css';

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
        blockManager: {
          appendTo: '#blocks',
          blocks: [
            {
              id: 'section',
              label: 'Section',
              category: 'Basic',
              content: `
                <section style="padding: 20px; background-color: #f8f9fa;">
                  <div style="max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; margin-bottom: 15px;">Section Title</h2>
                    <p style="color: #666; line-height: 1.6;">Add your content here...</p>
                  </div>
                </section>
              `,
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/></svg>`
            },
            {
              id: 'text',
              label: 'Text',
              category: 'Basic',
              content: '<div data-gjs-type="text" style="padding: 10px; color: #333;">Insert your text here</div>',
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4v3h5v12h3V7h5V4H2.5zM21.5 9h-9v3h3v7h3v-7h3V9z"/></svg>`
            },
            {
              id: 'image',
              label: 'Image',
              category: 'Basic',
              content: { type: 'image' },
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`
            },
            {
              id: 'button',
              label: 'Button',
              category: 'Basic',
              content: '<button data-gjs-type="button" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Click Here</button>',
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`
            },
            {
              id: 'divider',
              label: 'Divider',
              category: 'Basic',
              content: '<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">',
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`
            },
            {
              id: 'header',
              label: 'Header',
              category: 'Basic',
              content: '<header style="background-color: #333; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">Header Title</h1></header>',
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
            },
            {
              id: 'footer',
              label: 'Footer',
              category: 'Basic',
              content: '<footer style="background-color: #333; color: white; padding: 20px; text-align: center;"><p style="margin: 0;">© 2024 Your Organization</p></footer>',
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
            },
            {
              id: 'newsletter-section',
              label: 'Newsletter Section',
              category: 'PTO Specific',
              content: `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px;">School Newsletter</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Monthly Update</p>
                </div>
              `,
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
            },
            {
              id: 'event-card',
              label: 'Event Card',
              category: 'PTO Specific',
              content: `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Event Title</h3>
                  <p style="color: #666; margin-bottom: 10px;">Event description goes here...</p>
                  <button style="background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px;">Learn More</button>
                </div>
              `,
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`
            },
            {
              id: 'fundraiser-progress',
              label: 'Fundraiser Progress',
              category: 'PTO Specific',
              content: `
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #2d5a2d; margin-top: 0;">Fundraiser Progress</h3>
                  <div style="background: #ddd; height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: #28a745; height: 100%; width: 75%;"></div>
                  </div>
                  <p style="color: #2d5a2d; margin-top: 10px;">$3,750 of $5,000 raised</p>
                </div>
              `,
              media: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
            }
          ]
        },
        layerManager: {
          appendTo: '#layers-container'
        },
        traitManager: {
          appendTo: '#trait-manager-container',
        },
        panels: {
          defaults: [
            {
              id: 'panel-top',
              el: '.panel__top',
            },
            {
              id: 'panel-basic-actions',
              el: '.panel__basic-actions',
              buttons: [
                {
                  id: 'visibility',
                  active: true,
                  className: 'btn-toggle-borders',
                  label: '<u>B</u>',
                  command: 'sw-visibility',
                },
                {
                  id: 'export',
                  className: 'btn-open-export',
                  label: 'Exp',
                  command: 'export-template',
                  context: 'export-template',
                },
                {
                  id: 'show-json',
                  className: 'btn-show-json',
                  label: 'JSON',
                  context: 'show-json',
                  command(editor) {
                    editor.Modal.setTitle('Components JSON')
                      .setContent(`<textarea style="width:100%; height: 250px;">
                        ${JSON.stringify(editor.getComponents(), null, 2)}
                      </textarea>`)
                      .open();
                  },
                }
              ],
            },
            {
              id: 'panel-switcher',
              el: '.panel__switcher',
              buttons: [{
                  id: 'show-layers',
                  active: true,
                  label: 'Layers',
                  command: 'show-layers',
                  togglable: false,
                }, {
                  id: 'show-style',
                  label: 'Styles',
                  command: 'show-styles',
                  togglable: false,
                }, {
                  id: 'show-traits',
                  label: 'Traits',
                  command: 'show-traits',
                  togglable: false,
                }],
            },
            {
              id: 'panel-devices',
              el: '.panel__devices',
              buttons: [
                {
                  id: 'device-desktop',
                  label: '<u>D</u>',
                  command: 'set-device-desktop',
                  active: true,
                  togglable: false,
                },
                {
                  id: 'device-tablet',
                  label: '<u>T</u>',
                  command: 'set-device-tablet',
                  togglable: false,
                },
                {
                  id: 'device-mobile',
                  label: '<u>M</u>',
                  command: 'set-device-mobile',
                  togglable: false,
                }
              ],
            }
          ]
        },
        deviceManager: {
          devices: [
            {
              name: 'Desktop',
              width: '',
            },
            {
              name: 'Tablet',
              width: '768px',
              widthMedia: '992px',
            },
            {
              name: 'Mobile',
              width: '320px',
              widthMedia: '480px',
            },
          ],
        },
        styleManager: {
          appendTo: '#style-manager-container',
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
      });

      // Commands
      const commands = editor.Commands;
      commands.add('show-layers', {
        run(editor, sender) {
          sender.set('active', true);
          editor.Panels.getButton('panel-switcher', 'show-style').set('active', false);
          editor.Panels.getButton('panel-switcher', 'show-traits').set('active', false);
          document.querySelector('#layers-container').style.display = 'block';
          document.querySelector('#style-manager-container').style.display = 'none';
          document.querySelector('#trait-manager-container').style.display = 'none';
        },
      });
      commands.add('show-styles', {
        run(editor, sender) {
          sender.set('active', true);
          editor.Panels.getButton('panel-switcher', 'show-layers').set('active', false);
          editor.Panels.getButton('panel-switcher', 'show-traits').set('active', false);
          document.querySelector('#layers-container').style.display = 'none';
          document.querySelector('#style-manager-container').style.display = 'block';
          document.querySelector('#trait-manager-container').style.display = 'none';
        },
      });
      commands.add('show-traits', {
        run(editor, sender) {
          sender.set('active', true);
          editor.Panels.getButton('panel-switcher', 'show-layers').set('active', false);
          editor.Panels.getButton('panel-switcher', 'show-style').set('active', false);
          document.querySelector('#layers-container').style.display = 'none';
          document.querySelector('#style-manager-container').style.display = 'none';
          document.querySelector('#trait-manager-container').style.display = 'block';
        },
      });
      
      editor.on('load', () => {
        editor.runCommand('show-layers');
      });

      // When a component is selected, switch to the style manager
      editor.on('component:select', () => {
        editor.runCommand('show-styles');
      });

      // Add custom commands
      editor.Commands.add('export-template', {
        run: (editor) => {
          const html = editor.getHtml();
          const css = editor.getCss();
          console.log("Exporting template:", { html, css });
          alert('Template exported! Check console for output');
        }
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
            background: 'white', padding: '40px', borderRadius: '12px',
            textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            maxWidth: '600px', width: '90%'
          }}>
            <h2 style={{ marginTop: 0, fontSize: '1.8rem' }}>Welcome to the Template Builder</h2>
            <p style={{ marginBottom: '30px', fontSize: '1.1rem', color: '#555' }}>
              Choose a starting point or begin with a blank slate.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
              <button onClick={() => loadTemplate('newsletter')} style={templateButtonStyle}>
                <div style={{ fontSize: '2rem' }}>📰</div>
                <h3 style={{ margin: '10px 0 0' }}>Newsletter</h3>
              </button>
              <button onClick={() => loadTemplate('announcement')} style={templateButtonStyle}>
                <div style={{ fontSize: '2rem' }}>📢</div>
                <h3 style={{ margin: '10px 0 0' }}>Announcement</h3>
              </button>
              <button onClick={() => loadTemplate('event')} style={templateButtonStyle}>
                <div style={{ fontSize: '2rem' }}>🎉</div>
                <h3 style={{ margin: '10px 0 0' }}>Event</h3>
              </button>
            </div>
            <button onClick={startBlank} style={{
                background: 'transparent', border: 'none', color: '#007bff',
                marginTop: '30px', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem'
            }}>
              Or start from scratch
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
          <button onClick={() => setShowWelcome(true)} style={{}}>New Template</button>
          <button onClick={exportTemplate} style={{ marginLeft: '10px' }}>Export Template</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }} className="gjs-editor-main-flex">
        {/* Left Sidebar - Blocks */}
        <div id="blocks" style={{ width: '250px', backgroundColor: '#f5f5f5', borderRight: '1px solid #ddd', overflowY: 'auto' }} />
        
        {/* Main Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top Panel */}
          <div className="panel__top" style={{ backgroundColor: '#444', color: 'white', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="panel__basic-actions" style={{ display: 'flex', gap: '10px' }} />
            <div className="panel__devices" style={{ display: 'flex', gap: '10px' }} />
          </div>
          
          {/* Canvas */}
          <div id="gjs" style={{ flex: 1, overflow: 'hidden' }} />
        </div>
        
        {/* Right Sidebar - Layers and Style Manager */}
        <div className="gjs-editor-right-panel">
          <div className="panel__switcher" />
          <div id="layers-container" />
          <div id="style-manager-container" />
          <div id="trait-manager-container" />
        </div>
      </div>
    </div>
  );
};

const templateButtonStyle = {
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  background: '#f8f9fa',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'center'
};

export default GrapesJSEditor; 