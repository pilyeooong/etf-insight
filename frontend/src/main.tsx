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
      // innerHTML 대신 노드 생성 + textContent로 메시지 주입(XSS 방지)
      const wrap = document.createElement('div');
      wrap.style.cssText = 'padding:24px;font-family:sans-serif';
      const title = document.createElement('p');
      title.style.fontWeight = '600';
      title.textContent = '앱 초기화 실패';
      const pre = document.createElement('pre');
      pre.style.cssText = 'font-size:12px;color:#888;white-space:pre-wrap';
      pre.textContent = msg;
      wrap.append(title, pre);
      root.replaceChildren(wrap);
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
