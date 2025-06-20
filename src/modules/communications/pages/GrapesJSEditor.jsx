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

  const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY || '68sA-etqfTs_6cZuBsD7WoWvobDhnh_6jFygGICSpfw';

  const loadTemplate = (templateType) => {
    if (editorRef.current) {
      editorRef.current.setComponents('<div style="padding: 20px; text-align: center; color: #666;">Start building your email template here...</div>');
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
        panels: { defaults: [] },
        blockManager: {
          appendTo: '#blocks-container',
          blocks: [
            // Layout Blocks
            { id: '2-columns', label: '2 Columns', category: 'Layout', content: `<div class="row" style="display: flex; padding: 10px;"><div class="cell" style="flex: 1; padding: 10px; border: 1px dashed #ccc;"></div><div class="cell" style="flex: 1; padding: 10px; border: 1px dashed #ccc;"></div></div>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,2V14H11V2M3,22H11V16H3M13,2V8H21V2M13,22H21V10H13V22Z" /></svg>` },
            { id: '3-columns', label: '3 Columns', category: 'Layout', content: `<div class="row" style="display: flex; padding: 10px;"><div class="cell" style="flex: 1; padding: 10px; border: 1px dashed #ccc;"></div><div class="cell" style="flex: 1; padding: 10px; border: 1px dashed #ccc;"></div><div class="cell" style="flex: 1; padding: 10px; border: 1px dashed #ccc;"></div></div>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 2V22H9V2H3M11 2V12H21V2H11M11 14V22H21V14H11Z" /></svg>` },
            { id: 'divider', label: 'Divider', category: 'Layout', content: '<hr style="border: none; border-top: 2px solid #ddd; margin: 20px 0;">', media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 11H21V13H3z"/></svg>` },
            // Basic Content Blocks
            { id: 'text', label: 'Text', category: 'Basic', content: '<div data-gjs-type="text" style="padding: 10px; color: #333;">Insert your text here</div>', media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2.5 4v3h5v12h3V7h5V4H2.5zM21.5 9h-9v3h3v7h3v-7h3V9z"/></svg>` },
            { id: 'image', label: 'Image', category: 'Basic', content: { type: 'image' }, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>` },
            { id: 'button', label: 'Button', category: 'Basic', content: { type: 'link', content: 'Click me', style: { display: 'inline-block', padding: '12px 25px', 'background-color': '#007bff', color: 'white', 'text-align': 'center', 'text-decoration': 'none', 'border-radius': '5px' }}, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M12,19H5V5H19V19H12Z" /></svg>`},
            // Advanced Content Blocks
            { id: 'hero-section', label: 'Hero Section', category: 'Content', content: `<section style="text-align: center; padding: 50px 20px; background-color: #f0f4f7;"><h1 style="font-size: 2.5em; margin-bottom: 15px; color: #333;">Hero Title</h1><p style="font-size: 1.2em; color: #666; margin-bottom: 25px; max-width: 600px; margin-left: auto; margin-right: auto;">This is a paragraph describing your hero section.</p><a href="#" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Call to Action</a></section>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v6h-2V6H6v4H4V4zm0 8h16v6h-2v-4H6v4H4v-6z"/></svg>`},
            { id: 'quote', label: 'Quote', category: 'Content', content: `<blockquote style="margin: 20px; padding: 15px; border-left: 5px solid #ccc; background-color: #f9f9f9;"><p style="font-style: italic; color: #555;">"Your inspiring quote goes here."</p><cite style="display: block; text-align: right; margin-top: 10px; color: #777;">- Author Name</cite></blockquote>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/></svg>`},
            // PTO Specific Blocks
            { id: 'newsletter-header', label: 'Newsletter Header', category: 'PTO Specific', content: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;"><h1 style="margin: 0; font-size: 28px;">School Newsletter</h1><p style="margin: 10px 0 0 0; opacity: 0.9;">Monthly Update</p></div>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`},
            { id: 'event-card', label: 'Event Card', category: 'PTO Specific', content: `<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="color: #333; margin-top: 0;">Event Title</h3><p style="color: #666; margin-bottom: 10px;">Event description goes here...</p><button style="background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px;">Learn More</button></div>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`},
            { id: 'fundraiser-progress', label: 'Fundraiser Progress', category: 'PTO Specific', content: `<div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3 style="color: #2d5a2d; margin-top: 0;">Fundraiser Progress</h3><div style="background: #ddd; height: 20px; border-radius: 10px; overflow: hidden;"><div style="background: #28a745; height: 100%; width: 75%;"></div></div><p style="color: #2d5a2d; margin-top: 10px;">$3,750 of $5,000 raised</p></div>`, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`}
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

      const pn = editor.Panels;
      const commands = editor.Commands;

      pn.addPanel({ id: 'panel-top', el: '.panel__top' });
      const basicActions = pn.addPanel({ id: 'basic-actions', el: '.panel__basic-actions' });
      basicActions.get('buttons').add([
          { id: 'visibility', active: true, className: 'btn-toggle-borders', label: '<i class="fas fa-eye"></i>', command: 'sw-visibility' },
          { id: 'export', className: 'btn-open-export', label: '<i class="fas fa-code"></i>', command: 'export-template' },
          { id: 'undo', className: 'btn-undo', label: '<i class="fas fa-undo"></i>', command: 'core:undo' },
          { id: 'redo', className: 'btn-redo', label: '<i class="fas fa-redo"></i>', command: 'core:redo' },
      ]);

      const devices = pn.addPanel({ id: 'devices-c', el: '.panel__devices' });
      devices.get('buttons').add([
          { id: 'device-desktop', command: 'set-device-desktop', active: true, label: '<i class="fas fa-desktop"></i>' },
          { id: 'device-tablet', command: 'set-device-tablet', label: '<i class="fas fa-tablet-alt"></i>' },
          { id: 'device-mobile', command: 'set-device-mobile', label: '<i class="fas fa-mobile-alt"></i>' },
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
        run(editor, sender) { sender.set('active', true); showPanel(id); },
        stop(editor, sender) { sender.set('active', false); },
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
            console.log("HTML:", html);
            console.log("CSS:", css);
            alert('Template exported to console.');
        },
      });
      
      editor.on('load', () => pn.getButton('panel-switcher', 'show-layers').set('active', true));
      editor.on('component:select', () => {
        const styleButton = pn.getButton('panel-switcher', 'show-style');
        if (styleButton && !styleButton.get('active')) styleButton.trigger('run');
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '30px 0' }}>
              <button onClick={() => loadTemplate('Newsletter')} style={templateButtonStyle}>Newsletter</button>
              <button onClick={() => loadTemplate('Event')} style={templateButtonStyle}>Event</button>
            </div>
            <button onClick={startBlank} style={{ ...templateButtonStyle, background: '#e9e9e9', width: '100%' }}>
              Start from Scratch
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '10px 20px', backgroundColor: '#fff', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Email Template Builder: {templateName}</h2>
        </div>
        <div>
          <button onClick={() => setShowWelcome(true)}>New Template</button>
        </div>
      </div>

      <div className="gjs-editor-main-flex">
        <div className="gjs-editor-left-panel">
          <div className="gjs-editor-left-panel-tabs">
            <button onClick={() => setLeftPanelTab('blocks')} className={`gjs-editor-left-panel-tab ${leftPanelTab === 'blocks' ? 'active' : ''}`}>
                <i className="fas fa-cubes"></i> Blocks
            </button>
            <button onClick={() => setLeftPanelTab('images')} className={`gjs-editor-left-panel-tab ${leftPanelTab === 'images' ? 'active' : ''}`}>
                <i className="fas fa-image"></i> Images
            </button>
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
        
        <div className="gjs-editor-center-panel">
          <div className="panel__top">
            <div className="panel__basic-actions" />
            <div className="panel__devices" />
          </div>
          <div id="gjs" style={{ flex: 1 }} />
        </div>
        
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
  fontSize: '1rem'
};

export default GrapesJSEditor;