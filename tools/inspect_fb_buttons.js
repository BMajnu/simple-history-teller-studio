const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com'));
  const btns = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('button, input[type="submit"]')).map(b => ({
      tag: b.tagName,
      id: b.id,
      name: b.name,
      text: b.innerText,
      type: b.type
    }));
  });
  console.log('FB buttons:', btns);
  process.exit(0);
})();
