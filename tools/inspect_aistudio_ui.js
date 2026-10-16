const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('aistudio'));
  const fileInputs = await page.locator('input[type="file"]').count();
  console.log('File inputs found in AI Studio:', fileInputs);
  const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.getAttribute('aria-label') || b.innerText).filter(Boolean));
  console.log('Insert/Upload buttons:', buttons.filter(b => b.toLowerCase().includes('insert') || b.toLowerCase().includes('add') || b.toLowerCase().includes('file') || b.toLowerCase().includes('upload')));
  process.exit(0);
})();
