const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('facebook.com'));

  const dialogInfo = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { found: false };
    const inputs = Array.from(dialog.querySelectorAll('input')).map(i => ({
      type: i.type,
      accept: i.accept,
      className: i.className
    }));
    const buttons = Array.from(dialog.querySelectorAll('[role="button"], [aria-label]')).map(b => ({
      text: b.innerText ? b.innerText.trim() : '',
      aria: b.getAttribute('aria-label') || ''
    })).filter(b => b.aria || b.text);
    return { found: true, inputs, buttons };
  });

  console.log('Dialog Info:', JSON.stringify(dialogInfo, null, 2));
  process.exit(0);
})();
