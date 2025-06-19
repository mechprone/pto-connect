import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import './GrapesJSEditor.css';

const GrapesJSEditor = () => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = grapesjs.init({
        container: '#gjs',
        height: '100vh',
        width: 'auto',
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
            {
              id: 'panel-switcher',
              el: '.panel__switcher',
              buttons: [
                {
                  id: 'show-layers',
                  active: true,
                  label: 'Layers',
                  command: 'show-layers',
                },
                {
                  id: 'show-style',
                  active: true,
                  label: 'Styles',
                  command: 'show-styles',
                },
                {
                  id: 'show-traits',
                  active: true,
                  label: 'Traits',
                  command: 'show-traits',
                },
              ],
            },
          ],
        },
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
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
        <h2>Email Template Builder</h2>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        <div id="gjs" style={{ flex: 1 }} />
        <div className="panel__right" style={{ width: '250px', backgroundColor: '#f5f5f5' }} />
        <div className="panel__switcher" style={{ width: '48px', backgroundColor: '#eee' }} />
      </div>
    </div>
  );
};

export default GrapesJSEditor; 