const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  await p.goto('https://www.facebook.com/settings?tab=linked_accounts', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  const linkedBtn = p.locator('span:text-is("Linked accounts"), div:has-text("Linked accounts")').first();
  console.log('Clicking Linked accounts in sidebar...');
  await linkedBtn.click();
  await p.waitForTimeout(3000);

  console.log('URL now:', p.url());
  await p.screenshot({ path: 'tools/fb_linked_accounts_detail.png' });
  console.log('Saved tools/fb_linked_accounts_detail.png');

  const text = await p.evaluate(() => document.body.innerText.slice(0, 600));
  console.log('Detail text:', text);

  // Check for Connect account button
  const connectBtn = p.locator('div[role="button"]:has-text("Connect account"), button:has-text("Connect account"), div[aria-label="Connect account"]').first();
  if (await connectBtn.isVisible().catch(() => false)) {
    console.log('Clicking Connect account button...');
    await connectBtn.click();
    await p.waitForTimeout(4000);
    await p.screenshot({ path: 'tools/fb_connect_modal.png' });
    console.log('Saved tools/fb_connect_modal.png');
  }

  await p.close();
  process.exit(0);
})();
