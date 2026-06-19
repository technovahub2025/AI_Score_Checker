import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import AppProviders from './context/AppProviders';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename="/ai_score_checker">
        <AppProviders>
          <App />
        </AppProviders>
      </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>
);
