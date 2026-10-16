const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  for (const page of pages) {
    const u = page.url();
    if (u.includes('facebook.com/reg') || u.includes('facebook.com/confirmemail') || u.includes('facebook.com/login')) {
      console.log('Closing old tab:', u);
      await page.close();
    }
  }

  // Open fresh page create tab
  const p = await ctx.newPage();
  await p.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);

  console.log('Now at:', p.url());
  await p.screenshot({ path: 'tools/fb_clean_create_page.png' });
  console.log('Saved tools/fb_clean_create_page.png');

  // Check what overlays or elements exist
  const text = await p.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Text:', text);

  process.exit(0);
})();
