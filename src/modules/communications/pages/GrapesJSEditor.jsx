import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import './GrapesJSEditor.css';

const GrapesJSEditor = () => {
  const editorRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentTemplate, setCurrentTemplate] = useState('');

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
    if (editorRef.current) {
      const template = defaultTemplates[templateType];
      editorRef.current.setComponents(template);
      setCurrentTemplate(templateType);
      setShowWelcome(false);
    }
  };

  const startFromScratch = () => {
    if (editorRef.current) {
      editorRef.current.setComponents('<div style="padding: 20px; text-align: center; color: #666;">Start building your email template here...</div>');
      setCurrentTemplate('blank');
      setShowWelcome(false);
    }
  };

  useEffect(() => {
    if (!editorRef.current) {
      const editor = grapesjs.init({
        container: '#gjs',
        height: 'calc(100vh - 60px)',
        width: '100%',
        storageManager: false,
        plugins: [gjsPresetWebpage, gjsPresetNewsletter],
        pluginsOpts: {
          [gjsPresetNewsletter]: {
            modalTitleImport: 'Import template',
            modalBtnImport: 'Import',
            modalLabelImport: 'Paste your HTML template here',
            importPlaceholder: '<table><tr><td>Hello</td></tr></table>',
            cellStyle: {
              padding: '0',
              margin: '0',
              'vertical-align': 'top',
            },
          },
          [gjsPresetWebpage]: {},
        },
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
          ],
          frameOffset: 25,
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
        panels: {
          defaults: [
            // Top-left basic actions
            {
              id: 'commands',
              el: '.panel__commands',
              buttons: [
                { id: 'undo', className: 'fa fa-undo', command: 'core:undo' },
                { id: 'redo', className: 'fa fa-repeat', command: 'core:redo' },
                { id: 'import', className: 'fa fa-download', command: 'gjs-open-import-template' },
                { id: 'clean-all', className: 'fa fa-trash', command: 'core:canvas-clear' },
              ],
            },
            // Device Manager
            {
              id: 'devices-c',
              el: '.panel__devices',
              buttons: [
                { id: 'device-desktop', command: 'set-device-desktop', className: 'fa fa-desktop', active: true },
                { id: 'device-tablet', command: 'set-device-tablet', className: 'fa fa-tablet' },
                { id: 'device-mobile', command: 'set-device-mobile', className: 'fa fa-mobile' },
              ],
            },
            // Right-side blocks
            {
              id: 'blocks',
              el: '.panel__right',
              resizable: {
                tc: false,
                cr: true,
                cl: false,
                bc: false,
              },
            },
            // Right-side layers
            {
              id: 'layers',
              el: '.panel__right',
              resizable: {
                tc: false,
                cr: true,
                cl: false,
                bc: false,
              },
            },
            // Right-side styles
            {
              id: 'styles',
              el: '.panel__right',
              resizable: {
                tc: false,
                cr: true,
                cl: false,
                bc: false,
              },
            },
            // Right-side traits
            {
              id: 'traits',
              el: '.panel__right',
              resizable: {
                tc: false,
                cr: true,
                cl: false,
                bc: false,
              },
            },
            // Panel switcher
            {
              id: 'panel-switcher',
              el: '.panel__switcher',
              buttons: [
                { id: 'show-blocks', active: true, label: 'Blocks', command: 'show-blocks' },
                { id: 'show-layers', active: true, label: 'Layers', command: 'show-layers' },
                { id: 'show-style', active: true, label: 'Styles', command: 'show-styles' },
                { id: 'show-traits', active: true, label: 'Traits', command: 'show-traits' },
              ],
            },
          ],
        },
        blockManager: {
          appendTo: '.panel__right',
          blocks: [
            {
              id: 'section',
              label: 'Section',
              category: 'Basic',
              content: '<section class="section"><div class="container"></div></section>',
            },
            {
              id: 'text',
              label: 'Text',
              category: 'Basic',
              content: '<div data-gjs-type="text">Insert your text here</div>',
            },
            {
              id: 'image',
              label: 'Image',
              category: 'Basic',
              content: { type: 'image' },
              activate: true,
            },
            {
              id: 'button',
              label: 'Button',
              category: 'Basic',
              content: '<button class="button">Click me</button>',
            },
          ],
        },
        styleManager: {
          appendTo: '.panel__right',
          sectors: [
            {
              name: 'Dimension',
              open: false,
              properties: ['width', 'height', 'min-width', 'min-height', 'margin', 'padding'],
            },
            {
              name: 'Typography',
              open: false,
              properties: [
                'font-family',
                'font-size',
                'font-weight',
                'letter-spacing',
                'color',
                'line-height',
                'text-align',
                'text-decoration',
                'text-shadow',
              ],
            },
            {
              name: 'Decorations',
              open: false,
              properties: [
                'background-color',
                'border-radius',
                'border',
                'box-shadow',
                'background',
              ],
            },
          ],
        },
        layerManager: {
          appendTo: '.panel__right',
        },
        traitManager: {
          appendTo: '.panel__right',
        },
      });

      editor.Panels.addButton('options', {
        id: 'save-btn',
        className: 'btn-save',
        command: 'save-template',
        attributes: { title: 'Save Template' },
        label: '💾 Save',
      });

      editor.Panels.addButton('options', {
        id: 'preview-btn',
        className: 'btn-preview',
        command: 'preview',
        attributes: { title: 'Preview' },
        label: '👁️ Preview',
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showWelcome && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
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
              onClick={startFromScratch}
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
        padding: '15px 20px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px',
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>Email Template Builder</h2>
          {currentTemplate && (
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              Template: {currentTemplate.charAt(0).toUpperCase() + currentTemplate.slice(1)}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowWelcome(true)}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            New Template
          </button>
          <button
            onClick={() => {
              if (editorRef.current) {
                const html = editorRef.current.getHtml();
                const css = editorRef.current.getCss();
                console.log('Template HTML:', html);
                console.log('Template CSS:', css);
                alert('Template exported! Check console for HTML/CSS output.');
              }
            }}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Export Template
          </button>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div className="panel__top" style={{
            padding: '0 15px',
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div className="panel__commands" style={{ display: 'flex', alignItems: 'center' }}></div>
            <div className="panel__devices" style={{ display: 'flex', alignItems: 'center' }}></div>
          </div>

          <div id="gjs" style={{ flex: 1 }} />
        </div>

        <div className="panel__right" style={{ 
          width: '300px',
          backgroundColor: '#f5f5f5',
          borderLeft: '1px solid #e9ecef',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }} />
        
        <div className="panel__switcher" style={{ 
          width: '48px',
          backgroundColor: '#eee',
          borderLeft: '1px solid #e9ecef',
          flexShrink: 0
        }} />
      </div>
    </div>
  );
};

export default GrapesJSEditor; 