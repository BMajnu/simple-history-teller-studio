const { chromium } = require('playwright-core');
const { execSync } = require('child_process');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const THUMB_PATH = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\sample_first_king\\metadata\\shorts_full\\thumb_full_part3.jpg';

(async () => {
  console.log('Launching Chrome with verification dialog open on desktop...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--remote-debugging-port=9224'
    ],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/video/jg48SOofyDk/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Scroll to thumbnail
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 450;
  });
  await page.waitForTimeout(1000);

  // Trigger modal
  const fileLoader = page.locator('input#file-loader').first();
  await fileLoader.setInputFiles(THUMB_PATH).catch(() => {});
  await page.waitForTimeout(2000);

  // Click Next to show options
  const nextBtn = page.locator('button:has-text("Next"), ytcp-button:has-text("Next"), #next-button').first();
  if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nextBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  console.log('Verification dialog is now active and in foreground for the user.');
  // Keep open indefinitely for the user
  while (true) {
    await page.waitForTimeout(60000);
  }
})().catch(e => {
  console.error(e);
});
