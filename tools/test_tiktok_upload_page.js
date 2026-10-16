const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to TikTok upload page...');
  await page.goto('https://www.tiktok.com/creator-center/upload', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/tiktok_upload_page.png' });

  await page.close();
  process.exit(0);
})().catch(err => {
  console.error('TikTok error:', err);
  process.exit(1);
});
