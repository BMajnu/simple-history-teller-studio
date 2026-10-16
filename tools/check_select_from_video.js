const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages()[0];

  console.log('Navigating to Video Details edit page: https://studio.youtube.com/video/ibG0M13m7I0/edit');
  await p.goto('https://studio.youtube.com/video/ibG0M13m7I0/edit', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);

  // Scroll down to thumbnail
  await p.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await p.waitForTimeout(1000);

  // Click "Select from video"
  const selectFromVideoBtn = p.locator('button:has-text("Select from video"), [aria-label*="Select from video"]').first();
  if (await selectFromVideoBtn.isVisible().catch(() => false)) {
    console.log('Clicking Select from video...');
    await selectFromVideoBtn.click();
    await p.waitForTimeout(2000);
    await p.screenshot({ path: 'tools/yt_select_from_video_modal.png' });
    console.log('Saved tools/yt_select_from_video_modal.png');
  }

  process.exit(0);
})().catch(console.error);
