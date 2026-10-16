const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = ctx.pages().find(p => p.url().includes('flow.google.com')) || await ctx.newPage();
    if (!page.url().includes('flow.google.com')) {
      await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128');
    }

    console.log('Monitoring Flow generation...');
    let elapsed = 0;
    while (elapsed < 90000) {
      await page.waitForTimeout(3000);
      elapsed += 3000;
      process.stdout.write(`.${elapsed / 1000}s `);

      const isBusy = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('ভেবে দেখা হচ্ছে') || text.includes('তৈরি করা হচ্ছে') || text.includes('জেনারেট করা হচ্ছে') || text.includes('বন্ধ করুন');
      });

      if (!isBusy) {
        console.log('\nGeneration complete or idle!');
        break;
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/test_flow_after_generation.png' });
    console.log('Saved screenshot tools/test_flow_after_generation.png');

    const tilesCount = await page.locator('flow-grid-tile-container').count();
    console.log('Total tiles in gallery now:', tilesCount);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
