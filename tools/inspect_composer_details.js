const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('facebook.com'));

  await page.evaluate(() => window.scrollBy(0, 450));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/fb_composer_view.png' });
  console.log('Saved tools/fb_composer_view.png');

  // Find clickable elements for Photo/video or What's on your mind
  const composerBox = page.locator('div:has-text("What\'s on your mind?"), span:has-text("What\'s on your mind?"), div[role="button"]:has-text("Photo/video")').first();
  console.log('Composer box found:', await composerBox.count());

  // Click Photo/video or What's on your mind
  const photoVideo = page.locator('div[role="button"]:has-text("Photo/video"), span:has-text("Photo/video")').first();
  if (await photoVideo.isVisible()) {
    console.log('Clicking Photo/video...');
    await photoVideo.click();
  } else {
    console.log('Clicking What\'s on your mind box...');
    await composerBox.click();
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/fb_dialog_opened.png' });
  console.log('Saved tools/fb_dialog_opened.png');

  process.exit(0);
})();
