const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('convert_to_professional_account'));
  if (p) {
    const text = await p.evaluate(() => document.body.innerText);
    console.log('Page text:', text.slice(0, 500));
    await p.screenshot({ path: 'tools/ig_convert_page_state.png', timeout: 10000 });
  } else {
    console.log('No convert page found');
  }
  process.exit(0);
})();
