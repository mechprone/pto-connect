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