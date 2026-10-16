const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('facebook.com'));

  // Click the "What's on your mind?" field
  const inputDiv = page.locator('div:has-text("What\'s on your mind?")[role="button"], span:has-text("What\'s on your mind?")').first();
  console.log('Clicking What\'s on your mind...');
  await inputDiv.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/fb_modal_opened.png' });
  console.log('Saved tools/fb_modal_opened.png');

  process.exit(0);
})();
