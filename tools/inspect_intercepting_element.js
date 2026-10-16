const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('convert_to_professional_account'));
  if (p) {
    const dialogs = await p.evaluate(() => {
      const allModals = Array.from(document.querySelectorAll('div[role="dialog"], div[role="presentation"], div[class*="x1n2onr6"]'));
      return allModals.slice(0, 10).map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        text: el.innerText?.slice(0, 200),
        class: el.className
      }));
    });
    console.log('Dialogs/overlays:', dialogs);
  }
  process.exit(0);
})();
