const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to facebook.com...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const formInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, button')).map(el => ({
      tag: el.tagName,
      id: el.id,
      name: el.name,
      type: el.type,
      text: el.innerText
    }));
  });
  console.log('FB form info:', formInfo);
  await page.screenshot({ path: 'tools/fb_home_screen.png' });

  await page.close();
  process.exit(0);
})();
