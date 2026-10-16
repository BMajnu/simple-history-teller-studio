const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  console.log('Total pages before cleanup:', pages.length);

  for (const p of pages) {
    const url = p.url();
    if (url.includes('accounts.google.com/signin/oauth') || url.includes('tiktok.com/signup') || url.includes('about:blank')) {
      console.log('Closing:', url.slice(0, 80));
      await p.close().catch(() => {});
    }
  }

  console.log('Remaining pages:', ctx.pages().length);
  process.exit(0);
})();
