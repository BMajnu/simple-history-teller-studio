const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('facebook.com')) || await ctx.newPage();

  console.log('FB URL now:', page.url());
  await page.screenshot({ path: 'tools/fb_current_result.png' });
  console.log('Saved tools/fb_current_result.png');

  const text = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('Text on page:', text);

  process.exit(0);
})();
