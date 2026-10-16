const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const gmailPage = ctx.pages().find(p => p.url().includes('mail.google.com/mail/u/1'));
  if (gmailPage) {
    console.log('Found u/1 tab:', await gmailPage.title());
    // Find avatar in top right
    const avatar = gmailPage.locator('a[aria-label*="Google Account"], a[href*="SignOutOptions"]').first();
    if (await avatar.isVisible().catch(() => false)) {
      await avatar.click();
      await gmailPage.waitForTimeout(2000);
      await gmailPage.screenshot({ path: 'tools/gmail_account_list.png' });
      console.log('Saved tools/gmail_account_list.png');
    }
  } else {
    console.log('No u/1 tab found');
  }
  process.exit(0);
})();
