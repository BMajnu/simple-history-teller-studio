const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Starting persistent Chrome daemon on port 9224...');
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
  console.log('Navigating to Facebook...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  console.log('Chrome daemon is live and listening on port 9224.');

  // Keep alive indefinitely
  await new Promise(() => {});
})();
