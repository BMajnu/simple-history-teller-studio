const { chromium } = require('playwright-core');

(async () => {
  console.log('=== TESTING TIKTOK SIGNUP FOR CHANNEL 2 (Bangla: bmajnu981) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.tiktok.com/signup', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const [popup] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 10000 }).catch(() => null),
    page.locator('div:has-text("Continue with Google")').last().click()
  ]);

  if (popup) {
    console.log('Google popup opened, selecting bmajnu981@gmail.com...');
    await popup.waitForTimeout(2000);
    const acc = popup.locator('div:has-text("bmajnu981@gmail.com")').first();
    if (await acc.isVisible()) {
      await acc.click();
      await popup.waitForTimeout(3000);
      console.log('Popup URL:', popup.url());

      // Look for Continue button on consent
      const continueBtn = popup.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue"), span:has-text("Continue")').first();
      if (await continueBtn.isVisible().catch(() => false)) {
        console.log('Clicking Continue on consent...');
        await continueBtn.click();
        await page.waitForTimeout(8000);
      }
    }
  }

  console.log('TikTok page URL:', page.url());
  await page.screenshot({ path: 'tools/tiktok_c2_result.png' });
  console.log('Saved tools/tiktok_c2_result.png');

  await page.close();
  process.exit(0);
})();
