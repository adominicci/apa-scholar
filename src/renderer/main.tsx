import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@renderer/i18n';
import { App } from '@renderer/app/App';
import '@renderer/styles/index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element was not found.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
