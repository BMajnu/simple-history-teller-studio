const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('tiktok.com'));
  if (!page) {
    console.error('No TikTok page found!');
    process.exit(1);
  }

  console.log('Clicking Exit button to confirm navigation...');
  const exitBtn = page.locator('button:has-text("Exit")').first();
  if (await exitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await exitBtn.click({ force: true });
    console.log('Exit clicked!');
    await page.waitForTimeout(6000);
  }

  console.log('Current URL after exit:', page.url());
  await page.screenshot({ path: 'tools/tiktok_post_published_live.png' });
  console.log('Saved tools/tiktok_post_published_live.png');
  process.exit(0);
})().catch(console.error);
