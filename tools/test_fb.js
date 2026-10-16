const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Facebook...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(4000);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/fb_check.png' });
  console.log('Saved tools/fb_check.png');

  await page.close();
  process.exit(0);
})();
