import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Prevent harmless Vite HMR WebSocket disconnect messages in sandbox environments
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = typeof reason === 'string' ? reason : reason?.message || String(reason || '');
  if (message.includes('WebSocket') || message.includes('closed without opened') || message.includes('failed to connect to websocket')) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

window.addEventListener('error', (event) => {
  const message = event.message || '';
  if (message.includes('WebSocket') || message.includes('closed without opened')) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');
  
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (err: any) {
  console.error('React Mount Error:', err);
  // Fallback if React completely fails to mount
  const fallback = document.getElementById('error-status');
  if (fallback) {
    fallback.innerText = "Fatal: " + (err.message || "React Crash");
    const actions = document.getElementById('recovery-actions');
    if (actions) actions.style.display = 'block';
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }
}
