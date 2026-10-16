const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Instagram profile...');
  await page.goto('https://www.instagram.com/simplehistorytellerofficial/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Profile URL:', page.url());
  await page.screenshot({ path: 'tools/ig_approved_profile.png' });
  console.log('Saved tools/ig_approved_profile.png');

  await page.close();
  process.exit(0);
})();
