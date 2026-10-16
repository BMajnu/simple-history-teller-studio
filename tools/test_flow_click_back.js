const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = ctx.pages().find(p => p.url().includes('flow.google.com'));
    if (page) {
      const backBtn = page.locator('button:has(mat-icon:has-text("arrow_back")), [aria-label*="ফিরে যান"]').first();
      await backBtn.click();
      await page.waitForTimeout(2000);
      console.log('Clicked back, URL:', page.url());
      const tilesCount = await page.locator('flow-grid-tile-container').count();
      console.log('Tiles in gallery:', tilesCount);
      await page.screenshot({ path: 'tools/test_flow_after_back.png' });
    }
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
