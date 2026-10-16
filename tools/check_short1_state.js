const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(x => x.url().includes('studio.youtube.com'));
  if (p) {
    await p.screenshot({ path: 'tools/short1_current_state.png' });
    console.log('Saved tools/short1_current_state.png');

    // Click Publish / Save if visible
    const doneBtn = p.locator('#done-button').first();
    if (await doneBtn.isVisible().catch(() => false)) {
      console.log('Clicking done button...');
      await doneBtn.click({ force: true });
      await p.waitForTimeout(5000);
      await p.screenshot({ path: 'tools/short1_after_publish.png' });
      console.log('Saved tools/short1_after_publish.png');
    }
  }
  process.exit(0);
})().catch(console.error);
