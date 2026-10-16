const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching persistent visible Chrome...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();
  console.log('Navigating to Simple History Teller Bangla Facebook page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595162615338', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Page title:', await page.title());
  console.log('Page URL:', page.url());

  await page.screenshot({ path: 'tools/live_fb_state.png' });
  console.log('Saved tools/live_fb_state.png');

  // Keep open for 20 seconds while we inspect
  await page.waitForTimeout(20000);
  await ctx.close();
  console.log('Done test');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
