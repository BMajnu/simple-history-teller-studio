const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('generate-speech'));
  if (page) {
    const text = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const ta = document.querySelector('textarea');
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      const btns = Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim()).filter(Boolean);
      return {
        url: window.location.href,
        hasAudio: !!aud,
        audioSrc: aud ? aud.src : null,
        textareaVal: ta ? ta.value.slice(0, 80) : null,
        error: err ? err.innerText : null,
        buttons: btns.slice(0, 10)
      };
    });
    console.log(text);
  } else {
    console.log('No generate-speech page found');
  }
  process.exit(0);
})().catch(console.error);
