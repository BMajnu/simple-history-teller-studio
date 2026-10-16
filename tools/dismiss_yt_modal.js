const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(x => x.url().includes('studio.youtube.com'));
  if (p) {
    const closeBtn = p.locator('ytcp-button:has-text("Close"), button:has-text("Close"), #close-button').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true });
      console.log('Clicked Close button!');
      await p.waitForTimeout(4000);
    }
    await p.screenshot({ path: 'tools/yt_channel_content_live.png' });
    console.log('Saved tools/yt_channel_content_live.png');
  }
  process.exit(0);
})().catch(console.error);
