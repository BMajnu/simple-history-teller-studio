const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('facebook.com')) || ctx.pages()[0];

  console.log('Navigating to facebook.com/login...');
  await page.goto('https://www.facebook.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const emailInp = page.locator('input[name="email"], input[id="email"]').first();
  await emailInp.click();
  await emailInp.fill('01833933521');
  await page.waitForTimeout(500);

  const passInp = page.locator('input[name="pass"], input[id="pass"], input[type="password"]').first();
  await passInp.click();
  await passInp.fill('M@jnu786');
  await page.waitForTimeout(500);

  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);

  console.log('URL after phone login:', page.url());
  await page.screenshot({ path: 'tools/fb_phone_login_result.png' });
  console.log('Saved tools/fb_phone_login_result.png');

  const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Page text:', text);

  process.exit(0);
})();
