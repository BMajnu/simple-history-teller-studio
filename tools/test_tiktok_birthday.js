const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Inspect the birthday elements
  const bdayControls = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('[class*="age"], [class*="birthday"], [class*="select"], [aria-label*="Month"], [aria-label*="Day"], [aria-label*="Year"]').forEach(el => {
      list.push({ tag: el.tagName, className: el.className, text: el.innerText.slice(0, 30) });
    });
    return list;
  });
  console.log('Birthday controls:', bdayControls);

  await page.close();
  process.exit(0);
})();
