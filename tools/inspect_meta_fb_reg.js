const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/reg'));
  if (!p) {
    console.log('No reg page found');
    process.exit(1);
  }

  const inputs = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, button, div[role="combobox"], div[role="button"]')).map(el => ({
      tag: el.tagName,
      type: el.type,
      placeholder: el.placeholder,
      ariaLabel: el.getAttribute('aria-label'),
      role: el.getAttribute('role'),
      text: el.innerText?.slice(0, 50),
      id: el.id
    }));
  });
  console.log('Reg inputs & controls:', inputs);

  process.exit(0);
})();
