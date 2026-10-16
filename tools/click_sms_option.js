const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (!igPage) {
    console.log('No IG page found');
    process.exit(1);
  }

  console.log('Clicking "Send code via SMS"...');
  const smsLink = igPage.locator('div:has-text("Send code via SMS"), span:has-text("Send code via SMS"), button:has-text("Send code via SMS")').last();
  await smsLink.click({ force: true });
  await igPage.waitForTimeout(4000);

  console.log('IG URL now:', igPage.url());
  await igPage.screenshot({ path: 'tools/ig_sms_sent.png' });
  console.log('Saved tools/ig_sms_sent.png');

  process.exit(0);
})();
