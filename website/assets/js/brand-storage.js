// Preserve browser-local sessions and edits created before the SIGNAL rebrand.
(function () {
 try {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('hori-'));
  for (const key of keys) {
   const next = 'signal-' + key.slice(5);
   if (localStorage.getItem(next) === null) localStorage.setItem(next, localStorage.getItem(key));
  }
 } catch { /* Private-mode storage must not block startup. */ }
})();
