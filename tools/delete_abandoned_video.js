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
    await page.screenshot({ path: 'tools/delete_dialog.png' });
    console.log('Saved tools/delete_dialog.png');

    // Check checkbox inside dialog
    const checkbox = page.locator('ytcp-dialog ytcp-checkbox, ytcp-dialog paper-checkbox, ytcp-dialog tp-yt-paper-checkbox').first();
    if (await checkbox.isVisible()) {
      console.log('Clicking confirmation checkbox...');
      await checkbox.click();
      await page.waitForTimeout(1000);
    }

    // Click confirm delete
    const confirmBtn = page.locator('ytcp-dialog button:has-text("Delete forever"), ytcp-dialog button:has-text("Delete video"), ytcp-dialog #confirm-button').first();
    if (await confirmBtn.isVisible()) {
      console.log('Clicking Delete Forever button...');
      await confirmBtn.click();
      await page.waitForTimeout(4000);
    }
    await page.screenshot({ path: 'tools/after_delete_confirmed.png' });
    console.log('Saved tools/after_delete_confirmed.png');
  }

  await ctx.close();
})();
