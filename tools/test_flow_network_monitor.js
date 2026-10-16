const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const tile = page.locator('flow-grid-tile-container').first();
    await tile.click();
    await page.waitForTimeout(3000);

    page.on('response', async res => {
      const url = res.url();
      const ct = res.headers()['content-type'] || '';
      if (url.includes('.mp4') || ct.includes('video') || url.includes('videoplayback') || url.includes('blob:')) {
        console.log('Video network response:', url.slice(0, 100), 'Content-Type:', ct, 'Content-Length:', res.headers()['content-length']);
        try {
          const buf = await res.body();
          const outPath = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'visual_assets', 'clip_shot_0005.mp4');
          fs.writeFileSync(outPath, buf);
          console.log('✓ Successfully intercepted and saved video buffer! Size:', buf.length);
        } catch (e) {
          console.log('Could not read body:', e.message);
        }
      }
    });

    const dlBtn = page.locator('button:has(mat-icon:has-text("download"))').first();
    await dlBtn.click();
    await page.waitForTimeout(1000);

    const menuItem = page.locator('.mat-mdc-menu-item:has-text("720p")').first();
    console.log('Clicking 720p...');
    await menuItem.click();
    await page.waitForTimeout(10000);

    const videoElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('video')).map(v => ({
        src: v.src,
        currentSrc: v.currentSrc,
        duration: v.duration
      }));
    });
    console.log('Video elements on page:', JSON.stringify(videoElements, null, 2));

    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
