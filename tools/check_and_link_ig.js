const { chromium } = require('playwright-core');

(async () => {
  console.log('=== CHECKING LINKED ACCOUNTS FOR HISTORY TELLER PAGE ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  // Navigate to Facebook
  await page.goto('https://www.facebook.com/profile.php?id=61595202872996', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // If there's a "Switch now" button to act as the Page, click it
  const switchBtn = page.locator('div[aria-label*="Switch"], div[role="button"]:has-text("Switch")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log('Clicking Switch to Page profile...');
    await switchBtn.click();
    await page.waitForTimeout(4000);
  }

  // Navigate to Linked Accounts
  console.log('Navigating to linked accounts settings...');
  await page.goto('https://www.facebook.com/settings?tab=linked_accounts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/fb_linked_accounts_live.png' });
  console.log('Saved tools/fb_linked_accounts_live.png. URL:', page.url());

  const pageText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Linked accounts page text:\n', pageText);

  // Look for Connect account
  const connectBtn = page.locator('div[role="button"]:has-text("Connect account"), button:has-text("Connect account")').first();
  if (await connectBtn.isVisible().catch(() => false)) {
    console.log('Found Connect account button, clicking...');
    await connectBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/fb_connect_account_modal.png' });
    console.log('Saved tools/fb_connect_account_modal.png');
  }

  await page.close();
  process.exit(0);
})();
