const { chromium } = require('playwright-core');

(async () => {
  console.log('=== LINKING INSTAGRAM TO FACEBOOK PAGE ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  // Navigate to Linked Accounts settings
  await p.goto('https://www.facebook.com/settings?tab=linked_accounts', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);

  console.log('Linked accounts URL:', p.url());
  await p.screenshot({ path: 'tools/fb_linked_accounts_screen.png' });
  console.log('Saved tools/fb_linked_accounts_screen.png');

  const pageText = await p.evaluate(() => document.body.innerText.slice(0, 600));
  console.log('Text on linked accounts page:', pageText);

  // Look for Connect account button
  const connectBtn = p.locator('div[role="button"]:has-text("Connect account"), button:has-text("Connect account"), div[aria-label="Connect account"]').first();
  if (await connectBtn.isVisible().catch(() => false)) {
    console.log('Clicking Connect account for Instagram...');
    await connectBtn.click();
    await p.waitForTimeout(4000);
    await p.screenshot({ path: 'tools/fb_connect_ig_modal.png' });
    console.log('Saved tools/fb_connect_ig_modal.png');
  }

  await p.close();
  process.exit(0);
})();
