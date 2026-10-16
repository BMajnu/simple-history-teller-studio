const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const selectors = page.locator('div[class*="DivSelector"]');
  await selectors.nth(0).click();
  await page.waitForTimeout(1000);

  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'January').map(el => ({
      tag: el.tagName,
      className: el.className,
      id: el.id,
      role: el.getAttribute('role'),
      parentTag: el.parentElement?.tagName,
      parentClass: el.parentElement?.className
    }));
  });
  console.log('January elements:', items);

  await page.close();
  process.exit(0);
})();
