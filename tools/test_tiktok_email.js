const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const phoneOrEmail = page.locator('div:has-text("Use phone or email")').last();
  await phoneOrEmail.click();
  await page.waitForTimeout(3000);

  console.log('URL:', page.url());
  await page.screenshot({ path: 'tools/tiktok_phone_email.png' });
  console.log('Saved tools/tiktok_phone_email.png');

  await page.close();
  process.exit(0);
})();
