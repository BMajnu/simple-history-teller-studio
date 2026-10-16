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
    console.log('Popup opened, waiting for bmajnu980...');
    await popup.waitForTimeout(2000);
    const acc = popup.locator('div:has-text("bmajnu980@gmail.com")').first();
    if (await acc.isVisible()) {
      console.log('Clicking bmajnu980@gmail.com in OAuth...');
      await acc.click();
      await popup.waitForTimeout(5000);
      console.log('Popup URL now:', popup.url());
      if (!popup.isClosed()) {
        await popup.screenshot({ path: 'tools/tiktok_popup_after_click.png' });
        console.log('Saved popup screenshot');
      }
    }
  }

  await page.waitForTimeout(5000);
  console.log('Main page URL:', page.url());
  await page.screenshot({ path: 'tools/tiktok_main_final.png' });

  await page.close();
  process.exit(0);
})();
