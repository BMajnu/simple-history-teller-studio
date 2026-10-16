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
  await page.goto('https://studio.youtube.com/video/Kuc5FRoYJW0/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Scroll main
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1000);

  // Click on "Select from video"
  const selectFromVideoBtn = page.locator('div:has-text("Select from video"), button:has-text("Select from video")').first();
  console.log('Select from video visible:', await selectFromVideoBtn.isVisible().catch(() => false));
  if (await selectFromVideoBtn.isVisible().catch(() => false)) {
    await selectFromVideoBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/select_from_video_clicked.png' });
    console.log('Saved tools/select_from_video_clicked.png');
  }

  await ctx.close();
})();
