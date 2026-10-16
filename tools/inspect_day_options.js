const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  const regUrl = 'https://www.facebook.com/reg/?entry_point=login&next=https%3A%2F%2Fwww.facebook.com%2Fdialog%2Foauth%3Fapp_id%3D1217981644879628%26redirect_uri%3Dhttps%253A%252F%252Fwww.facebook.com%252Ffxauth%252F';
  await p.goto(regUrl, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  // Click day
  await p.locator('div[aria-label="Select day"]').click();
  await p.waitForTimeout(1000);

  const dayOptions = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('[role="option"], [role="listbox"] *')).map(el => el.innerText?.trim()).filter(Boolean);
  });
  console.log('Day options:', dayOptions.slice(0, 15));

  await p.screenshot({ path: 'tools/fb_day_dropdown.png' });
  await p.close();
  process.exit(0);
})();
