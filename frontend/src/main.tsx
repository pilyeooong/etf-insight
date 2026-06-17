import React from 'react';
import ReactDOM from 'react-dom/client';
import { TDSMobileProvider } from '@toss/tds-mobile';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { isTossApp } from '@/lib/env';
import App from './App';
import './index.css';

async function render() {
  let Provider: React.ComponentType<{ children: React.ReactNode }>;

  try {
    if (isTossApp()) {
      const { TDSMobileAITProvider } = await import('@toss/tds-mobile-ait');
      Provider = TDSMobileAITProvider;
    } else {
      Provider = ({ children }: { children: React.ReactNode }) => (
        <TDSMobileProvider
          userAgent={{
            fontA11y: undefined,
            fontScale: 100,
            isAndroid: false,
            isIOS: false,
            colorPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
          }}
        >
          {children}
        </TDSMobileProvider>
      );
    }
  } catch (err) {
    console.error('[main] Provider init failed:', err);
    const root = document.getElementById('root');
    if (root) {
      const msg = err instanceof Error ? err.message : String(err);
      root.innerHTML = `<div style="padding:24px;font-family:sans-serif"><p style="font-weight:600">앱 초기화 실패</p><pre style="font-size:12px;color:#888;white-space:pre-wrap">${msg}</pre></div>`;
    }
    return;
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider>
          <App />
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

render().catch((err) => {
  console.error('[main] Unhandled render error:', err);
});
