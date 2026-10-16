const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Starting visible Chrome on port 9225...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--remote-debugging-port=9225'
    ],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  console.log('Navigating to Facebook Bangla page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595162615338', { waitUntil: 'domcontentloaded' });
  console.log('Visible Chrome is ready on port 9225!');

  // Keep process alive indefinitely
  await new Promise(() => {});
})().catch(err => {
  console.error('Fatal launch error:', err);
  process.exit(1);
});
