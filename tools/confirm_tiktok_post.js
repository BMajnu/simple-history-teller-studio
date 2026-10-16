const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('tiktok.com'));
  if (!page) {
    console.error('No TikTok page found!');
    process.exit(1);
  }

  // Click Cancel if exit dialog is visible
  const cancelBtn = page.locator('button:has-text("Cancel")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    console.log('Dismissing exit modal...');
    await cancelBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Remove any remaining tooltips / popups
  await page.evaluate(() => {
    document.querySelectorAll('[data-floating-ui-portal], #react-joyride-portal, .TUXModal-overlay').forEach(el => el.remove());
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1500);

  // Take screenshot of bottom area
  await page.screenshot({ path: 'tools/tiktok_bottom_view.png' });
  console.log('Saved tools/tiktok_bottom_view.png');

  // Look for Post button
  const postBtn = page.locator('button:has-text("Post"), div[role="button"]:has-text("Post"), .btn-post button').first();
  console.log('Is post button visible:', await postBtn.isVisible());
  if (await postBtn.isVisible()) {
    console.log('Clicking Post button...');
    await postBtn.click({ force: true });
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'tools/tiktok_final_success.png' });
    console.log('Saved tools/tiktok_final_success.png');
  }

  process.exit(0);
})().catch(console.error);
