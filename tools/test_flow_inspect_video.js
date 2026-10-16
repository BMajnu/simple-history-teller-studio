const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Click on the video tile
    const tile = page.locator('flow-media-tile, flow-video-tile, .media-tile, [class*="tile"]').first();
    console.log('Clicking tile...');
    await tile.click();
    await page.waitForTimeout(3000);

    const videoSrc = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? { src: v.src, currentSrc: v.currentSrc, duration: v.duration } : null;
    });
    console.log('Video src info:', JSON.stringify(videoSrc, null, 2));

    const btns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a')).map(b => ({
        text: (b.innerText || '').slice(0, 50),
        label: b.getAttribute('aria-label') || '',
        class: b.className
      })).filter(x => x.text.includes('ডাউনলোড') || x.label.includes('ডাউনলোড') || x.label.includes('Download') || x.text.includes('download'));
    });
    console.log('Download buttons:', JSON.stringify(btns, null, 2));

    await page.screenshot({ path: 'tools/test_flow_modal.png' });
    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
