import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/500.css';
import 'katex/dist/katex.min.css';
import './index.css';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary';
import {installGlobalErrorHandlers, logger} from './utils/logger';

installGlobalErrorHandlers();

// Service worker: auto-updates in the background; new version activates on next launch.
registerSW({
  immediate: true,
  onRegisteredSW(url) {
    logger.info('pwa.sw_registered', {url});
  },
  onOfflineReady() {
    logger.info('pwa.offline_ready');
  },
  onRegisterError(error) {
    logger.warn('pwa.sw_register_error', {error: error instanceof Error ? error : String(error)});
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
