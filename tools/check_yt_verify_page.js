const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to https://www.youtube.com/verify ...');
  await page.goto('https://www.youtube.com/verify', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/yt_verify_step1.png' });
  console.log('Saved tools/yt_verify_step1.png');

  process.exit(0);
})().catch(console.error);
