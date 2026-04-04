import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrintRenderer } from '@renderer/print/PrintRenderer';
import '@renderer/print/print.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Print root element was not found.');
}

createRoot(container).render(
  <StrictMode>
    <PrintRenderer />
  </StrictMode>,
);
