const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    console.log('Navigating to YouTube Studio...');
    await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log('Current Studio URL:', currentUrl);
    await page.screenshot({ path: 'tools/yt_studio_current.png' });

    // Let's check channel name / title
    const channelName = await page.locator('#channel-title, #entity-name, ytcp-entity-page-header .title').first().textContent().catch(() => 'unknown');
    console.log('Current Studio Channel Name:', channelName ? channelName.trim() : 'not found');

    await page.close();
  } catch (err) {
    console.error('Error checking YouTube Studio:', err);
  }
})();
