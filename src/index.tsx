import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('postMessage') ||
    message.includes('youtube.com') ||
    message.includes('aria-hidden') ||
    message.includes('ERR_BLOCKED_BY_CLIENT')
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('postMessage') ||
    message.includes('youtube.com') ||
    message.includes('aria-hidden')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
