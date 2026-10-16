const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  const page = pages[6];

  console.log('Navigating to TikTok upload page...');
  await page.goto('https://www.tiktok.com/creator-center/upload?from=upload', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('TikTok upload URL:', page.url());
  await page.screenshot({ path: 'tools/tiktok_upload_state.png' });
  console.log('Saved tools/tiktok_upload_state.png');

  process.exit(0);
})();
