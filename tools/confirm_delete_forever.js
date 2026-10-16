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

    // Click checkbox label or checkbox container
    const chk = page.locator('tp-yt-paper-checkbox, #checkbox, ytcp-checkbox').first();
    await chk.click({ force: true });
    await page.waitForTimeout(1000);

    // Confirm button
    const confirmBtn = page.locator('ytcp-button#confirm-button, button:has-text("Delete forever")').first();
    await confirmBtn.click({ force: true });
    console.log('Clicked confirm delete forever!');
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'tools/deleted_done.png' });
    console.log('Saved tools/deleted_done.png');
  } else {
    console.log('No delete button found!');
  }

  await ctx.close();
})();
