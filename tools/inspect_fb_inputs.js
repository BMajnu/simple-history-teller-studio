const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  console.log('Pages count:', pages.length);
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    console.log(i, p.url());
  }
  const fbPage = pages.find(p => p.url().includes('facebook.com'));
  if (fbPage) {
    const inputs = await fbPage.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea')).map(el => ({
        tag: el.tagName,
        type: el.type,
        ariaLabel: el.getAttribute('aria-label'),
        placeholder: el.placeholder,
        name: el.name,
        rect: el.getBoundingClientRect()
      }));
    });
    console.log('Inputs found on FB page:', inputs);
  }
  process.exit(0);
})();
