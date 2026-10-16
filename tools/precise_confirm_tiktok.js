const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('tiktok.com'));

  const btn = p.locator('button:has-text("Confirm")');
  console.log('Confirm btn count:', await btn.count());
  if (await btn.count() > 0) {
    const box = await btn.first().boundingBox();
    console.log('Bounding box:', box);
    if (box) {
      await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await btn.first().click({ force: true });
    }
  }

  await p.waitForTimeout(3000);
  await p.screenshot({ path: 'tools/tiktok_after_confirm_click.png' });
  console.log('Saved tools/tiktok_after_confirm_click.png');

  // Reload profile
  await p.goto('https://www.tiktok.com/@simplehistoryteller', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'tools/tiktok_profile_refreshed.png' });
  console.log('Saved tools/tiktok_profile_refreshed.png');

  process.exit(0);
})();
