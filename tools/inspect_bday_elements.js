const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(4000);

  const bdayElements = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('[role="combobox"], [role="button"], [aria-label*="Month"], [aria-label*="Day"], [aria-label*="Year"], [title*="Month"], [title*="Day"], [title*="Year"]').forEach(el => {
      list.push({ tag: el.tagName, role: el.getAttribute('role'), ariaLabel: el.getAttribute('aria-label'), title: el.getAttribute('title'), text: el.innerText });
    });
    return list;
  });
  console.log('Birthday elements:', bdayElements);

  await page.close();
  process.exit(0);
})();
