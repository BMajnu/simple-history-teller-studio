const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('tiktok.com'));
  if (p) {
    const confirmBtn = p.locator('button:has-text("Confirm")').first();
    await confirmBtn.click();
    await p.waitForTimeout(4000);
    await p.screenshot({ path: 'tools/tiktok_confirmed_nickname.png' });
    console.log('Confirmed nickname! Screenshot saved.');
  }
  process.exit(0);
})();
