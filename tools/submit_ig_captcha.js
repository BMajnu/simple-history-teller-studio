const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (igPage) {
    const input = igPage.locator('input[type="text"]:visible, input:visible').first();
    console.log('Entering captcha: 041650...');
    await input.fill('041650');
    await igPage.waitForTimeout(1000);

    const nextBtn = igPage.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
    console.log('Clicking Next...');
    await nextBtn.click();
    await igPage.waitForTimeout(8000);

    console.log('IG URL after Captcha:', igPage.url());
    await igPage.screenshot({ path: 'tools/ig_after_captcha.png' });
    console.log('Saved tools/ig_after_captcha.png');
  } else {
    console.log('No IG page found');
  }
  process.exit(0);
})();
