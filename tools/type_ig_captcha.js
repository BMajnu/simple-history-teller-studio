const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (igPage) {
    console.log('Focusing textarea and typing via keyboard...');
    await igPage.evaluate(() => {
      const textarea = document.querySelector('textarea, input[placeholder*="Enter the code"]');
      if (textarea) {
        textarea.value = '';
        textarea.focus();
      }
    });
    await igPage.waitForTimeout(500);

    // Type using keyboard
    await igPage.keyboard.type('041650', { delay: 100 });
    await igPage.waitForTimeout(1000);

    await igPage.screenshot({ path: 'tools/ig_typed_screen.png' });
    console.log('Saved tools/ig_typed_screen.png');

    // Click Next
    const nextBtn = igPage.locator('div[aria-label="Next"], button:has-text("Next"), div[role="button"]:has-text("Next")').first();
    console.log('Clicking Next...');
    await nextBtn.click({ force: true });
    await igPage.waitForTimeout(8000);

    console.log('IG URL after Next:', igPage.url());
    await igPage.screenshot({ path: 'tools/ig_post_captcha_click.png' });
    console.log('Saved tools/ig_post_captcha_click.png');
  }
  process.exit(0);
})();
