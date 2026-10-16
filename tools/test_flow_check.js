const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    console.log('Navigating to flow.google.com...');
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    await page.screenshot({ path: 'tools/test_flow_page.png' });
    console.log('Saved screenshot tools/test_flow_page.png');
    await page.close();
  } catch (err) {
    console.error('Flow test error:', err.message);
  }
  process.exit(0);
})();
