const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com'));
  const errorText = await page.evaluate(() => {
    const errImg = document.querySelector('img[src*="error_illustration"]');
    return errImg ? errImg.parentElement?.parentElement?.innerText : 'No error element';
  });
  console.log('Error text:', errorText);
  await page.screenshot({ path: 'tools/studio_branding_current_view.png' });
  process.exit(0);
})();
