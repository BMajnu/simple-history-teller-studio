const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto('https://accountscenter.facebook.com/home/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const profileRow = page.locator('div:has-text("bmajnu980@gmail.com")').last();
  await profileRow.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/meta_profiles_clicked.png' });
  console.log('Saved tools/meta_profiles_clicked.png. URL:', page.url());
  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Profiles detail text:\n', text);
  await page.close();
  process.exit(0);
})();
