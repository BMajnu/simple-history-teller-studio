const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  const page = pages[6]; // reuse Facebook tab

  // Check Instagram
  console.log('Navigating page to Instagram...');
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  console.log('Instagram URL:', page.url());
  await page.screenshot({ path: 'tools/ig_current_check.png' });
  console.log('Saved tools/ig_current_check.png');

  // Check TikTok
  console.log('Navigating page to TikTok...');
  await page.goto('https://www.tiktok.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  console.log('TikTok URL:', page.url());
  await page.screenshot({ path: 'tools/tiktok_current_check.png' });
  console.log('Saved tools/tiktok_current_check.png');

  // Return to Facebook login
  await page.goto('https://www.facebook.com/login', { waitUntil: 'domcontentloaded' });

  process.exit(0);
})();
