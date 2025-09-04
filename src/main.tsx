import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize monitoring in production
if (import.meta.env.PROD) {
  // Initialize error tracking
  import('./utils/monitoring').then(({ errorTracker, analyticsTracker }) => {
    // Set up global error handlers
    console.log('Production monitoring initialized');
  });

  // Initialize performance monitoring
  import('./utils/buildOptimization').then(({ createPerformanceObserver }) => {
    createPerformanceObserver();
  });
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
