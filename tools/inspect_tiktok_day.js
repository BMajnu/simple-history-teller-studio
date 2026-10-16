const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const selectors = page.locator('div[class*="DivSelector"]');
  // Click Day selector
  console.log('Clicking Day selector...');
  await selectors.nth(1).click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/tiktok_day_dropdown.png' });
  console.log('Saved tools/tiktok_day_dropdown.png');

  const options = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[class*="Item"], li, [role="option"]')).map(el => el.innerText.trim()).filter(Boolean);
  });
  console.log('Day options:', options.slice(0, 20));

  await page.close();
  process.exit(0);
})();
