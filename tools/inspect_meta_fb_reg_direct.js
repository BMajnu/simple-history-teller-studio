const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  const regUrl = 'https://www.facebook.com/reg/?entry_point=login&next=https%3A%2F%2Fwww.facebook.com%2Fdialog%2Foauth%3Fapp_id%3D1217981644879628%26redirect_uri%3Dhttps%253A%252F%252Fwww.facebook.com%252Ffxauth%252F';
  await p.goto(regUrl, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);

  const controls = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, button, div[role="combobox"], div[role="button"]')).map((el, i) => ({
      index: i,
      tag: el.tagName,
      type: el.type,
      placeholder: el.placeholder,
      ariaLabel: el.getAttribute('aria-label'),
      role: el.getAttribute('role'),
      text: el.innerText?.slice(0, 50).trim(),
      id: el.id
    })).filter(x => x.type || x.placeholder || x.text || x.ariaLabel);
  });
  console.log('Controls:', JSON.stringify(controls, null, 2));

  await p.close();
  process.exit(0);
})();
