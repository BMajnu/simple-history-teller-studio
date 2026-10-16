const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click the more menu (hamburger in bottom left)
  const moreBtn = page.locator('svg[aria-label="Settings"], div:has-text("More"), span:has-text("More")').last();
  if (await moreBtn.isVisible()) {
    console.log('Clicking More menu...');
    await moreBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tools/ig_more_menu.png' });
    console.log('Saved tools/ig_more_menu.png');
  }

  await page.close();
  process.exit(0);
})();
