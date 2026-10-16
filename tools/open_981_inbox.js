const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const gmailPage = ctx.pages().find(p => p.url().includes('mail.google.com/mail/u/1'));
  if (!gmailPage) {
    console.log('No u/1 page');
    process.exit(1);
  }

  // Make sure menu is open
  const menuVisible = await gmailPage.locator('text=bmajnu981@gmail.com').isVisible().catch(() => false);
  if (!menuVisible) {
    const avatar = gmailPage.locator('a[aria-label*="Google Account"], a[href*="SignOutOptions"]').first();
    await avatar.click();
    await gmailPage.waitForTimeout(1500);
  }

  console.log('Clicking bmajnu981@gmail.com...');
  const item981 = gmailPage.locator('div:has-text("bmajnu981@gmail.com")').last();
  await item981.click();
  await gmailPage.waitForTimeout(4000);

  // Now check open pages
  console.log('Open pages now:');
  ctx.pages().forEach(p => console.log(' - ', p.url()));

  process.exit(0);
})();
