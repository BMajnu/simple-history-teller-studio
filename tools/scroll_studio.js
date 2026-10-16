const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com'));

  console.log('Scrolling down...');
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/studio_branding_scrolled.png' });
  console.log('Saved scrolled screenshot');
  process.exit(0);
})();
