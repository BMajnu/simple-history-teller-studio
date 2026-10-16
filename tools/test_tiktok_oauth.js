const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to TikTok signup...');
  await page.goto('https://www.tiktok.com/signup', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Listen for popup
  const [popup] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 10000 }).catch(() => null),
    page.locator('div:has-text("Continue with Google")').last().click()
  ]);

  if (popup) {
    console.log('Popup opened! URL:', popup.url());
    await popup.waitForTimeout(3000);
    await popup.screenshot({ path: 'tools/tiktok_google_oauth.png' });
    console.log('Saved tools/tiktok_google_oauth.png');
    
    // Check accounts in popup
    const accounts = await popup.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-identifier], [data-email], .identity, div[role="link"]')).map(el => el.innerText.trim()).filter(Boolean);
    });
    console.log('Accounts in OAuth popup:', accounts);
    await popup.close();
  } else {
    console.log('No popup opened.');
    await page.screenshot({ path: 'tools/tiktok_no_popup.png' });
  }

  await page.close();
  process.exit(0);
})();
