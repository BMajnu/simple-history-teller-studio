const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com')) || await ctx.newPage();

  console.log('Navigating to Channel Content overview...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/final_youtube_studio_content_all.png' });
  console.log('Saved tools/final_youtube_studio_content_all.png');

  process.exit(0);
})().catch(console.error);
