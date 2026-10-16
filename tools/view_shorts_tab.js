const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(x => x.url().includes('studio.youtube.com'));
  if (p) {
    const shortsTab = p.locator('tp-yt-paper-tab:has-text("Shorts"), [tab-id="shorts"]').first();
    if (await shortsTab.isVisible().catch(() => false)) {
      await shortsTab.click();
      await p.waitForTimeout(3000);
      await p.screenshot({ path: 'tools/final_youtube_studio_shorts_table.png' });
      console.log('Saved tools/final_youtube_studio_shorts_table.png');
    }
  }
  process.exit(0);
})().catch(console.error);
