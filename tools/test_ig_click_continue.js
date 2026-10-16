const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching Chrome to log into Instagram...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const continueBtn = page.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue")').first();
  if (await continueBtn.isVisible().catch(() => false)) {
    console.log('Clicking Continue button...');
    await continueBtn.click();
    await page.waitForTimeout(6000);
  }

  // Dismiss "Save info" or "Not now" if shown
  const notNowBtn = page.locator('button:has-text("Not Now"), button:has-text("Not now")').first();
  if (await notNowBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Not now"...');
    await notNowBtn.click();
    await page.waitForTimeout(2000);
  }

  const shotPath = 'tools/ig_logged_in_check.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);
  console.log('Current URL:', page.url());

  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync(shotPath, path.join(artifactDir, 'ig_logged_in_check.png'));

  // Keep open 3s
  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
