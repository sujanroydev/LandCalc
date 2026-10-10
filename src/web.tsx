import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';

const rootTag = document.getElementById('root');

if (!rootTag) {
  throw new Error('Root element not found');
}

createRoot(rootTag).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
