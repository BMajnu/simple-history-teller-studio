const { chromium } = require('playwright-core');

(async () => {
  console.log('Connecting over CDP to running Chrome...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to Meta Business Suite Composer...');
  await page.goto('https://business.facebook.com/latest/composer', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);

  console.log('Composer URL:', page.url());
  await page.screenshot({ path: 'tools/meta_composer_landing.png' });
  console.log('Saved tools/meta_composer_landing.png');

  process.exit(0);
})();
