const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    let fullUrl = '';
    page.on('response', res => {
      if (res.url().includes('flow-content.google/video')) {
        fullUrl = res.url();
        console.log('Captured full URL:', fullUrl);
      }
    });

    const tile = page.locator('flow-grid-tile-container').first();
    await tile.click();
    await page.waitForTimeout(2000);

    const dlBtn = page.locator('button:has(mat-icon:has-text("download"))').first();
    await dlBtn.click();
    await page.waitForTimeout(800);

    const menuItem = page.locator('.mat-mdc-menu-item:has-text("720p")').first();
    await menuItem.click();
    await page.waitForTimeout(4000);

    if (fullUrl) {
      console.log('Downloading via page evaluate...');
      const b64 = await page.evaluate(async (u) => {
        const res = await fetch(u);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });
      }, fullUrl);
      const buf = Buffer.from(b64, 'base64');
      const outPath = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'visual_assets', 'clip_shot_0005.mp4');
      fs.writeFileSync(outPath, buf);
      console.log('✓ Successfully saved clip_shot_0005.mp4! Size:', buf.length, 'bytes');
    }
    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
