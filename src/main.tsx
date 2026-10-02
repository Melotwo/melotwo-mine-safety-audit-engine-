import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/Toast';
import { CurrencyProvider } from './context/CurrencyContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="MeloTwo Engine Recovering...">
      <CurrencyProvider>
        <App />
        <ToastContainer position="bottom-right" />
      </CurrencyProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register Service Worker for offline capability & PWA installability
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[MeloTwo PWA] Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[MeloTwo PWA] Service Worker registration failed:', error);
      });
  });
}
