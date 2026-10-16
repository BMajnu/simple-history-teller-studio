const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to facebook.com...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Fill email / phone
  const emailInput = page.locator('input[name="email"]').first();
  const passInput = page.locator('input[name="pass"]').first();

  await emailInput.fill('01833933521');
  await passInput.fill('***REMOVED***');
  await page.waitForTimeout(500);

  // Submit form
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);

  console.log('FB URL after login attempt:', page.url());
  await page.screenshot({ path: 'tools/fb_after_login_phone.png' });
  console.log('Saved tools/fb_after_login_phone.png');

  await page.close();
  process.exit(0);
})();
