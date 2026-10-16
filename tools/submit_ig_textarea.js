const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (igPage) {
    const textarea = igPage.locator('textarea[placeholder*="Enter the code"]').first();
    console.log('Found textarea! Typing 041650...');
    await textarea.click();
    await textarea.fill('041650');
    await igPage.waitForTimeout(1000);

    const nextBtn = igPage.locator('div[aria-label="Next"], button:has-text("Next"), div[role="button"]:has-text("Next")').first();
    console.log('Clicking Next...');
    await nextBtn.click();
    await igPage.waitForTimeout(8000);

    console.log('IG URL after Captcha Next:', igPage.url());
    await igPage.screenshot({ path: 'tools/ig_after_captcha_next.png' });
    console.log('Saved tools/ig_after_captcha_next.png');
  }
  process.exit(0);
})();
