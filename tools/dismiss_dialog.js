const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  for (const p of pages) {
    if (p.url().includes('aistudio.google.com')) {
      await p.evaluate(() => {
        // Try clicking close button or backdrop
        const closeBtns = Array.from(document.querySelectorAll('button')).filter(b => (b.innerText || '').toLowerCase().includes('close') || (b.getAttribute('aria-label') || '').toLowerCase().includes('close'));
        closeBtns.forEach(b => b.click());
        // Remove overlay containers/backdrops
        document.querySelectorAll('.cdk-overlay-backdrop, mat-dialog-container').forEach(el => el.remove());
      }).catch(() => {});
      await p.keyboard.press('Escape');
    }
  }
  console.log('Dialogs dismissed across all tabs.');
  process.exit(0);
})().catch(console.error);
