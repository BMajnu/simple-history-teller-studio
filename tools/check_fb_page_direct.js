const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('facebook.com')) || ctx.pages()[0];

  console.log('Navigating directly to Simple History Teller Bangla page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595162615338', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  console.log('Page URL:', page.url());
  await page.screenshot({ path: 'tools/fb_page_direct_view.png' });
  console.log('Saved tools/fb_page_direct_view.png');

  // Check if there is a "Switch" button to switch to page profile
  const switchBtn = page.locator('div[aria-label*="Switch"], div[role="button"]:has-text("Switch"), div[aria-label*="Switch now"]').first();
  console.log('Switch button visible:', await switchBtn.isVisible().catch(() => false));

  process.exit(0);
})();
