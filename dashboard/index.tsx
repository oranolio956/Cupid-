import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Ensure root element exists and has proper styling
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Create root element if it doesn't exist
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  newRoot.style.width = '100%';
  newRoot.style.height = '100%';
  document.body.appendChild(newRoot);
  const root = createRoot(newRoot);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // Ensure root has proper styling
  rootElement.style.width = '100%';
  rootElement.style.height = '100%';
  
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #050505; color: #e4e4e7; font-family: Inter, sans-serif;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">Error Loading Dashboard</h1>
          <p style="color: #a1a1aa;">Please refresh the page or contact support if the issue persists.</p>
          <pre style="margin-top: 1rem; color: #71717a; font-size: 0.875rem;">${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </div>
    `;
  }
}