const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Dismiss notification popup
  const notNow = page.locator('button:has-text("Not Now"), button:has-text("Cancel")').first();
  if (await notNow.isVisible().catch(() => false)) {
    console.log('Clicking Not Now on modal...');
    await notNow.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'tools/ig_home_feed.png' });
  console.log('Saved tools/ig_home_feed.png');

  await page.close();
  process.exit(0);
})();
