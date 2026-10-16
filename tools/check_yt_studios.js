const { chromium } = require('playwright-core');
const fs = require('fs');

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
  await page.bringToFront();

  // Test Channel 1 (English)
  console.log('Testing Channel 1 (English: UCvEQdVnctkuYZw3iNDo5krg)...');
  await page.goto('https://studio.youtube.com/channel/UCvEQdVnctkuYZw3iNDo5krg/videos/upload?d=pt', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(5000);
  console.log('Channel 1 URL:', page.url());
  await page.screenshot({ path: 'tools/yt_studio_c1.png' });

  // Test Channel 3 (Hindi)
  console.log('Testing Channel 3 (Hindi: UCkG4y9NJQ5yCys3jxFDUOcg)...');
  await page.goto('https://studio.youtube.com/channel/UCkG4y9NJQ5yCys3jxFDUOcg/videos/upload?d=pt', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(5000);
  console.log('Channel 3 URL:', page.url());
  await page.screenshot({ path: 'tools/yt_studio_c3.png' });

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
