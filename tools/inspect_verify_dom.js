const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(x => x.url().includes('youtube.com/verify')) || ctx.pages()[0];

  await p.screenshot({ path: 'tools/current_verify_dom.png' });
  console.log('Saved tools/current_verify_dom.png');

  const text = await p.evaluate(() => document.body.innerText);
  console.log('Page body text:', text);

  const buttons = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(e => e.innerText && (e.innerText.trim() === 'SUBMIT' || e.innerText.trim() === 'Submit'))
      .map(e => ({ tag: e.tagName, id: e.id, cls: e.className }));
  });
  console.log('SUBMIT buttons:', buttons);

  process.exit(0);
})().catch(console.error);
