const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const u = p.url();
    if (u.includes('generate-speech')) {
      const info = await p.evaluate(() => {
        const err = document.querySelector('.error-message, mat-error, [role="alert"], .toast-container, .notification');
        const aud = document.querySelector('audio');
        const ta = document.querySelector('textarea');
        const btn = document.querySelector('button.ctrl-enter-submits');
        return {
          url: window.location.href,
          err: err ? err.innerText : null,
          hasAudio: !!aud,
          audSrc: aud ? aud.src : null,
          taVal: ta ? ta.value.slice(0, 50) : null,
          btnText: btn ? btn.innerText.replace(/\n+/g, ' ') : null
        };
      });
      console.log(`Tab ${i}:`, info);
    }
  }
  process.exit(0);
})().catch(console.error);
