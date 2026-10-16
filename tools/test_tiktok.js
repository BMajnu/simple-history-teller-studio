const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to TikTok signup...');
  await page.goto('https://www.tiktok.com/signup', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(4000);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/tiktok_check.png' });
  console.log('Saved tools/tiktok_check.png');

  await page.close();
  process.exit(0);
})();
