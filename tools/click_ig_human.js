const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (igPage) {
    const btn = igPage.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue")').first();
    await btn.click();
    await igPage.waitForTimeout(6000);
    console.log('IG URL after Confirm human Continue:', igPage.url());
    await igPage.screenshot({ path: 'tools/ig_human_check.png' });
    console.log('Saved tools/ig_human_check.png');
  } else {
    console.log('No IG page found');
  }
  process.exit(0);
})();
