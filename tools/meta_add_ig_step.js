const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto('https://accountscenter.facebook.com/account_overview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click row to open modal
  const profileRow = page.locator('div:has-text("bmajnu980@gmail.com")').last();
  await profileRow.click();
  await page.waitForTimeout(1500);

  // Click Add more
  const addMore = page.locator('div[role="button"]:has-text("Add more"), span:has-text("Add more")').first();
  await addMore.click();
  await page.waitForTimeout(1500);

  // Click Add Instagram
  console.log('Clicking Add Instagram...');
  const addIg = page.locator('div[role="button"]:has-text("Add Instagram"), span:has-text("Add Instagram")').first();
  await addIg.click();
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/meta_add_ig_screen.png' });
  console.log('Saved tools/meta_add_ig_screen.png. URL:', page.url());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Screen text after clicking Add Instagram:\n', text);

  // If there is a Continue / Confirm button, look for it
  const continueBtn = page.locator('div[role="button"]:has-text("Continue"), button:has-text("Continue"), div[role="button"]:has-text("Confirm")').first();
  if (await continueBtn.isVisible().catch(() => false)) {
    console.log('Found Continue/Confirm button, clicking...');
    await continueBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tools/meta_add_ig_continued.png' });
    console.log('Saved tools/meta_add_ig_continued.png');
  }

  await page.close();
  process.exit(0);
})();
