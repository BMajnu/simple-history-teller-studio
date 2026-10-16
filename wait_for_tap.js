const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];
    
    console.log('Waiting for user to tap 16 on phone...');
    for (let i = 0; i < 40; i++) {
      const url = page.url();
      const title = await page.title();
      if (!url.includes('challenge/dp')) {
        console.log(`URL changed! Now at: ${url} | Title: ${title}`);
        await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/signin_after_tap_approved.png' });
        const text = await page.evaluate(() => document.body.innerText);
        console.log('Page text:\n', text.substring(0, 1000));
        process.exit(0);
      }
      await page.waitForTimeout(3000);
    }
    console.log('Timeout waiting for phone tap.');
    process.exit(1);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
