const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(x => x.url().includes('studio.youtube.com'));
  if (p) {
    await p.keyboard.press('Escape');
    await p.waitForTimeout(2000);
    // Reload content page to show the video in the table
    await p.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(4000);
    await p.screenshot({ path: 'tools/yt_channel_table_refreshed.png' });
    console.log('Saved tools/yt_channel_table_refreshed.png');
  }
  process.exit(0);
})().catch(console.error);
