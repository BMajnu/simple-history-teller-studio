const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto('https://accountscenter.facebook.com/account_overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // If modal not open, click row
  let addMore = page.locator('div[role="button"]:has-text("Add more"), span:has-text("Add more")').first();
  if (!await addMore.isVisible().catch(() => false)) {
    const profileRow = page.locator('div:has-text("bmajnu980@gmail.com")').last();
    await profileRow.click();
    await page.waitForTimeout(2000);
  }

  console.log('Clicking Add more...');
  addMore = page.locator('div[role="button"]:has-text("Add more"), span:has-text("Add more")').first();
  await addMore.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/meta_add_more_clicked.png' });
  console.log('Saved tools/meta_add_more_clicked.png. URL:', page.url());
  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Add more screen text:\n', text);
  await page.close();
  process.exit(0);
})();
