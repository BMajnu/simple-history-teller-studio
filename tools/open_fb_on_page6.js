const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[6];
  await page.bringToFront();
  console.log('Navigating page 6 to https://www.facebook.com/ ...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Page 6 URL:', page.url());
  await page.screenshot({ path: 'tools/page6_fb_screen.png' });
  console.log('Saved tools/page6_fb_screen.png');

  process.exit(0);
})();
