const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('business.facebook.com')) || ctx.pages()[0];

  console.log('Clicking Continue with Facebook...');
  const btn = page.locator('button:has-text("Continue with Facebook"), a:has-text("Continue with Facebook"), [role="button"]:has-text("Continue with Facebook")').first();
  if (await btn.isVisible()) {
    await btn.click();
    await page.waitForTimeout(6000);
    console.log('Current URL after click:', page.url());
    await page.screenshot({ path: 'tools/after_meta_login_click.png' });
    console.log('Saved tools/after_meta_login_click.png');
  } else {
    console.log('Button not visible');
  }

  process.exit(0);
})();
