const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to TikTok signup...');
  await page.goto('https://www.tiktok.com/signup', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const [popup] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 10000 }).catch(() => null),
    page.locator('div:has-text("Continue with Google")').last().click()
  ]);

  if (popup) {
    console.log('Popup opened, selecting bmajnu980@gmail.com...');
    await popup.waitForTimeout(2000);
    const acc = popup.locator('div:has-text("bmajnu980@gmail.com")').first();
    if (await acc.isVisible()) {
      await acc.click();
      await popup.waitForTimeout(3000);
    }

    // Now look for "Continue" button on the consent screen
    const continueBtn = popup.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue"), span:has-text("Continue")').first();
    if (await continueBtn.isVisible().catch(() => false)) {
      console.log('Clicking Continue on Google Consent...');
      await continueBtn.click();
      await page.waitForTimeout(7000);
    }
  }

  console.log('Main page URL after consent:', page.url());
  await page.screenshot({ path: 'tools/tiktok_after_consent.png' });
  console.log('Saved tools/tiktok_after_consent.png');

  await page.close();
  process.exit(0);
})();
