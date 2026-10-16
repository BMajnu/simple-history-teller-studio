const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com'));

  const doneBtn = page.locator('#done-button').first();
  console.log('Done btn count:', await doneBtn.count());
  if (await doneBtn.count() > 0) {
    await doneBtn.click({ force: true });
    console.log('Clicked Done on banner modal!');
    await page.waitForTimeout(3000);
  }

  const pubBtn = page.locator('#publish-button, button:has-text("Publish")').first();
  console.log('Publish btn enabled:', await pubBtn.isEnabled());
  if (await pubBtn.isEnabled()) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish!');
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: 'tools/c1_final_published_check.png' });
  process.exit(0);
})();
