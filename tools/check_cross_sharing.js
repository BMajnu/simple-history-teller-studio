const { chromium } = require('playwright-core');

(async () => {
  console.log('=== CONFIGURING CROSS-PROFILE SHARING ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://accountscenter.facebook.com/cross_app_sharing', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/meta_cross_sharing_screen.png' });
  console.log('Saved tools/meta_cross_sharing_screen.png. URL:', page.url());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Cross sharing screen text:\n', text);

  // Look for Sharing across profiles or rows
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], a')).map(el => el.innerText ? el.innerText.trim() : '').filter(t => t.length > 0 && t.length < 80);
  });
  console.log('Options on page:', rows);

  await page.close();
  process.exit(0);
})();
