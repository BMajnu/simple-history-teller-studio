const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const deleteBtn = page.locator('button:has-text("Delete video"), ytcp-button:has-text("Delete video")').first();
  if (await deleteBtn.isVisible()) {
    console.log('Clicking Delete video button...');
    await deleteBtn.click();
    await page.waitForTimeout(2000);

    // Evaluate click inside browser
    const res = await page.evaluate(() => {
      const dialog = document.querySelector('ytcp-video-delete-dialog') || document.querySelector('ytcp-confirmation-dialog');
      const cb = dialog ? dialog.querySelector('tp-yt-paper-checkbox, #checkbox') : document.querySelector('tp-yt-paper-checkbox');
      if (cb) {
        cb.click();
        return 'checkbox clicked';
      }
      return 'checkbox not found';
    });
    console.log('Result of clicking checkbox:', res);
    await page.waitForTimeout(1000);

    // Now click confirm button
    const confirmRes = await page.evaluate(() => {
      const btn = document.querySelector('ytcp-video-delete-dialog #confirm-button, ytcp-confirmation-dialog #confirm-button, #confirm-button');
      if (btn) {
        btn.click();
        return 'confirm button clicked';
      }
      return 'confirm button not found';
    });
    console.log('Result of clicking confirm button:', confirmRes);
    await page.waitForTimeout(6000);

    await page.screenshot({ path: 'tools/deleted_verified.png' });
    console.log('Saved tools/deleted_verified.png');
  }

  await ctx.close();
})();
