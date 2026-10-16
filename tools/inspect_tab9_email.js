const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('FMfcgzQhWnwcWzRlsxzlCqRVWnBTSgSB'));
  if (p) {
    const text = await p.innerText('body');
    console.log('Tab 9 text:\n', text.slice(0, 1500).replace(/\n+/g, ' '));
  } else {
    console.log('Tab 9 not found directly');
  }
  process.exit(0);
})();
