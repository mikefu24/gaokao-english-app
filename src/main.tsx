import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ── Capacitor iOS white-screen guard ─────────────────────────────────────────
// iOS can kill the WKWebView renderer process while the app is backgrounded.
// When the user returns, the WebView is blank until it reloads. We watch for
// this condition and force a reload so the user never sees a white screen.
function installWhiteScreenGuard() {
  // visibilitychange fires when the app is foregrounded from background
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const root = document.getElementById('root');
    // If root has no children React wasn't mounted — WebView was killed
    if (root && root.childElementCount === 0) {
      window.location.reload();
    }
  });

  // pageshow fires on bfcache restore (Safari back/forward cache)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      // Page was served from bfcache; force a fresh render
      window.location.reload();
    }
  });
}

installWhiteScreenGuard();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
