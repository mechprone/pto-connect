import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

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