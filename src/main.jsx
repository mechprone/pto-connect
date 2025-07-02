import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { logSessionDebug } from './utils/debugSession';

// Log session and storage state at app startup
logSessionDebug('main.jsx');

// Log service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    if (regs.length === 0) {
      console.log('[DEBUG] No service workers registered at startup');
    } else {
      regs.forEach((reg, i) => {
        console.log(`[DEBUG] Service Worker #${i} at startup:`, reg);
      });
    }
  });
}

// Log window unload and beforeunload
window.addEventListener('beforeunload', () => {
  console.log('[DEBUG] Window beforeunload: App is about to be unloaded or navigated away from.');
  logSessionDebug('main.jsx:beforeunload');
});
window.addEventListener('unload', () => {
  console.log('[DEBUG] Window unload: App is being unloaded.');
  logSessionDebug('main.jsx:unload');
});

const isDevelopment = import.meta.env.DEV;

const AppWithRouter = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  isDevelopment ? (
    <React.StrictMode>
      {AppWithRouter}
    </React.StrictMode>
  ) : (
    AppWithRouter
  )
); 