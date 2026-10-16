const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('facebook.com')) || ctx.pages()[0];

  console.log('Navigating to facebook.com/login...');
  await page.goto('https://www.facebook.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const email = page.locator('#email, input[name="email"]').first();
  await email.focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/fb_autofill_check.png' });
  console.log('Saved tools/fb_autofill_check.png');

  process.exit(0);
})();
