import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Prevent harmless Vite HMR WebSocket disconnect messages in sandbox environments
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (String(event.reason).includes('WebSocket') || String(event.reason?.message).includes('WebSocket'))) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
