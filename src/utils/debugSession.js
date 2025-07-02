// debugSession.js

export function logSessionDebug(context = '') {
  try {
    // Log context
    console.log(`\n[DEBUG][${context}] --- SESSION DEBUG START ---`);

    // Log localStorage/sessionStorage keys
    console.log('[DEBUG] localStorage keys:', Object.keys(localStorage));
    console.log('[DEBUG] sessionStorage keys:', Object.keys(sessionStorage));

    // Log Supabase session if available
    const supabaseSession = localStorage.getItem('sb-\n' + Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token')));
    if (supabaseSession) {
      try {
        const parsed = JSON.parse(supabaseSession);
        console.log('[DEBUG] Supabase session (from localStorage):', parsed);
      } catch (e) {
        console.log('[DEBUG] Supabase session (raw):', supabaseSession);
      }
    } else {
      console.log('[DEBUG] No Supabase session found in localStorage');
    }

    // Log cookies
    console.log('[DEBUG] document.cookie:', document.cookie);

    // Log service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        if (regs.length === 0) {
          console.log('[DEBUG] No service workers registered');
        } else {
          regs.forEach((reg, i) => {
            console.log(`[DEBUG] Service Worker #${i}:`, reg);
          });
        }
      });
    } else {
      console.log('[DEBUG] Service workers not supported');
    }

    console.log(`[DEBUG][${context}] --- SESSION DEBUG END ---\n`);
  } catch (err) {
    console.error('[DEBUG] Error in logSessionDebug:', err);
  }
} 