import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './GrapesJSEditor.css';
import UnsplashGallery from './UnsplashGallery';

const GrapesJSEditor = () => {
  const editorRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [templateName, setTemplateName] = useState('New Template');
  const [leftPanelTab, setLeftPanelTab] = useState('blocks');

  // This should be moved to a .env file for security in a real application
  const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY || 'YOUR_UNSPLASH_ACCESS_KEY';

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
        </div>
      </div>
    `
  };

  const loadTemplate = (templateType) => {
    if (editorRef.current && defaultTemplates[templateType]) {
      editorRef.current.setComponents(defaultTemplates[templateType]);
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

  useEffect(() => {
    if (!editorRef.current) {
      const editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: 'auto',
        storageManager: false,
        panels: { defaults: [] }, // We will define panels manually
        blockManager: {
          appendTo: '#blocks-container',
          blocks: [
             { id: '2-columns', label: '2 Columns', category: 'Layout', content: `<div class="row" style="display: flex; padding: 10px;"><div class="cell" style="flex: 1; padding: 10px;"></div><div class="cell" style="flex: 1; padding: 10px;"></div></div>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,2V14H11V2M3,22H11V16H3M13,2V8H21V2M13,22H21V10H13V22Z" /></svg>` },
             { id: '3-columns', label: '3 Columns', category: 'Layout', content: `<div class="row" style="display: flex; padding: 10px;"><div class="cell" style="flex: 1; padding: 10px;"></div><div class="cell" style="flex: 1; padding: 10px;"></div><div class="cell" style="flex: 1; padding: 10px;"></div></div>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 2V22H9V2H3M11 2V12H21V2H11M11 14V22H21V14H11Z" /></svg>` },
             { id: 'divider', label: 'Divider', category: 'Layout', content: '<hr style="border: none; border-top: 2px solid #ddd; margin: 20px 0;">', media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 11H21V13H3z"/></svg>` },
             { id: 'text', label: 'Text', category: 'Basic', content: '<div data-gjs-type="text" style="padding: 10px; color: #333;">Insert your text here</div>', media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2.5 4v3h5v12h3V7h5V4H2.5zM21.5 9h-9v3h3v7h3v-7h3V9z"/></svg>` },
             { id: 'image', label: 'Image', category: 'Basic', content: { type: 'image' }, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>` },
             { id: 'button', label: 'Button', category: 'Basic', content: { type: 'link', content: 'Click me', style: { display: 'inline-block', padding: '12px 25px', 'background-color': '#007bff', color: 'white', 'text-align': 'center', 'text-decoration': 'none', 'border-radius': '5px' }}, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M12,19H5V5H19V19H12Z" /></svg>`},
             { id: 'hero', label: 'Hero Section', category: 'Content', content: `<section style="text-align: center; padding: 50px 20px; background-color: #f0f4f7;"><h1 style="font-size: 2.5em; margin-bottom: 15px;">Hero Title</h1><p style="font-size: 1.2em; margin-bottom: 25px;">This is a paragraph describing your hero section.</p><a href="#" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Call to Action</a></section>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v6h-2V6H6v4H4V4zm0 8h16v6h-2v-4H6v4H4v-6z"/></svg>`},
             { id: 'quote', label: 'Quote', category: 'Content', content: `<blockquote style="margin: 20px; padding: 15px; border-left: 5px solid #ccc; background-color: #f9f9f9;"><p style="font-style: italic;">"Your inspiring quote goes here."</p><cite style="display: block; text-align: right; margin-top: 10px;">- Author</cite></blockquote>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/></svg>`},
          ],
        },
        layerManager: { appendTo: '#layers-container' },
        traitManager: { appendTo: '#trait-manager-container' },
        styleManager: {
          appendTo: '#style-manager-container',
          sectors: [
            { name: 'Dimension', open: false, properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'] },
            { name: 'Typography', open: false, properties: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'] },
            { name: 'Decorations', open: false, properties: ['background-color', 'border-radius', 'border', 'box-shadow', 'background'] },
          ],
        },
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Tablet', width: '768px', widthMedia: '992px' },
            { name: 'Mobile', width: '320px', widthMedia: '480px' },
          ],
        },
      });

      // --- Define Panels and Commands ---
      const pn = editor.Panels;
      const commands = editor.Commands;

      pn.addPanel({ id: 'panel-top', el: '.panel__top' });
      const basicActions = pn.addPanel({ id: 'basic-actions', el: '.panel__basic-actions' });
      basicActions.get('buttons').add([
          { id: 'visibility', active: true, className: 'btn-toggle-borders', label: '<i class="fa fa-arrows-v"></i>', command: 'sw-visibility' },
          { id: 'export', className: 'btn-open-export', label: '<i class="fa fa-code"></i>', command: 'export-template' },
      ]);

      const devices = pn.addPanel({ id: 'devices-c', el: '.panel__devices' });
      devices.get('buttons').add([
          { id: 'device-desktop', command: 'set-device-desktop', active: true, label: '<i class="fa fa-desktop"></i>' },
          { id: 'device-tablet', command: 'set-device-tablet', label: '<i class="fa fa-tablet"></i>' },
          { id: 'device-mobile', command: 'set-device-mobile', label: '<i class="fa fa-mobile"></i>' },
      ]);
      
      const rightPanel = pn.addPanel({ id: 'panel-switcher', el: '.panel__switcher' });
      rightPanel.get('buttons').add([
          { id: 'show-layers', active: true, label: 'Layers', command: 'show-layers', togglable: true },
          { id: 'show-style', label: 'Styles', command: 'show-styles', togglable: true },
          { id: 'show-traits', label: 'Traits', command: 'show-traits', togglable: true },
      ]);
      
      const showPanel = (id) => {
        const containers = {
          layers: document.querySelector('#layers-container'),
          style: document.querySelector('#style-manager-container'),
          traits: document.querySelector('#trait-manager-container'),
        };
        Object.keys(containers).forEach(key => {
            const el = containers[key];
            if (el) {
                el.style.display = key === id ? 'block' : 'none';
            }
        });
      };
      
      const createCommand = (id) => ({
        run(editor, sender) {
          sender.set('active', true);
          showPanel(id);
        },
        stop(editor, sender) {
          sender.set('active', false);
        },
      });

      commands.add('show-layers', createCommand('layers'));
      commands.add('show-styles', createCommand('style'));
      commands.add('show-traits', createCommand('traits'));
      
      commands.add('set-device-desktop', { run: editor => editor.setDevice('Desktop') });
      commands.add('set-device-tablet', { run: editor => editor.setDevice('Tablet') });
      commands.add('set-device-mobile', { run: editor => editor.setDevice('Mobile') });

      commands.add('export-template', {
        run: (editor) => {
          const html = editor.getHtml();
          const css = editor.getCss();
          console.log("Exporting template:", { html, css });
          alert('Template exported! Check console for output.');
        }
      });
      
      editor.on('load', () => {
          // Activate layers tab on load
          const layersButton = pn.getButton('panel-switcher', 'show-layers');
          if (layersButton) {
              layersButton.set('active', true);
          }
      });

      editor.on('component:select', () => {
        const styleButton = pn.getButton('panel-switcher', 'show-style');
        if (styleButton && !styleButton.get('active')) {
          styleButton.trigger('run');
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
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {showWelcome && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '600px', width: '90%' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.8rem' }}>Welcome to the Template Builder</h2>
            <p style={{ marginBottom: '30px', fontSize: '1.1rem', color: '#555' }}>Choose a starting point or begin with a blank slate.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
              <button onClick={() => loadTemplate('newsletter')} style={templateButtonStyle}>Newsletter</button>
              <button onClick={() => loadTemplate('event')} style={templateButtonStyle}>Event</button>
            </div>
            <button onClick={startBlank} style={{ background: 'transparent', border: 'none', color: '#007bff', marginTop: '30px', cursor: 'pointer', fontSize: '1rem' }}>
              Or start from scratch
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '10px 20px', backgroundColor: '#fff', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Email Template Builder</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#666' }}>Template: {templateName}</p>
        </div>
        <div>
          <button onClick={() => setShowWelcome(true)}>New Template</button>
          <button onClick={() => editorRef.current?.runCommand('export-template')} style={{ marginLeft: '10px' }}>Export Template</button>
        </div>
      </div>

      <div className="gjs-editor-main-flex">
        {/* Left Panel */}
        <div className="gjs-editor-left-panel">
          <div className="gjs-editor-left-panel-tabs">
            <button onClick={() => setLeftPanelTab('blocks')} className={`gjs-editor-left-panel-tab ${leftPanelTab === 'blocks' ? 'active' : ''}`}>Blocks</button>
            <button onClick={() => setLeftPanelTab('images')} className={`gjs-editor-left-panel-tab ${leftPanelTab === 'images' ? 'active' : ''}`}>Images</button>
          </div>
          <div className="gjs-editor-left-panel-content">
            <div style={{ display: leftPanelTab === 'blocks' ? 'block' : 'none', height: '100%' }}>
              <div id="blocks-container" />
            </div>
            <div style={{ display: leftPanelTab === 'images' ? 'block' : 'none', height: '100%' }}>
              {editorRef.current && <UnsplashGallery editor={editorRef.current} apiKey={UNSPLASH_API_KEY} />}
            </div>
          </div>
        </div>
        
        {/* Center Panel */}
        <div className="gjs-editor-center-panel">
          <div className="panel__top">
            <div className="panel__basic-actions" />
            <div className="panel__devices" />
          </div>
          <div id="gjs" style={{ flex: 1 }} />
        </div>
        
        {/* Right Panel */}
        <div className="gjs-editor-right-panel">
          <div className="panel__switcher" />
          <div className="gjs-editor-right-panel-content">
            <div id="layers-container" />
            <div id="style-manager-container" />
            <div id="trait-manager-container" />
          </div>
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
};

export default GrapesJSEditor;