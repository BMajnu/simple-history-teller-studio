const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  console.log('Launching Chrome with profile 3...');
  let ctx;
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 2000 });
    ctx = browser.contexts()[0];
    console.log('Connected to existing Chrome CDP');
  } catch (e) {
    ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      executablePath: CHROME_PATH,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--remote-debugging-port=9224'
      ],
      viewport: null
    });
    console.log('Launched new persistent Chrome context');
  }

  const p = ctx.pages()[0] || await ctx.newPage();
  console.log('Navigating to Facebook Pages list...');
  await p.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  const screenshotPath = path.join(ARTIFACTS_DIR, 'fb_pages_before_avatar_update.png');
  await p.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  // Print current page titles / text
  const pageText = await p.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Page text excerpt:\n', pageText);

  // Keep browser running, do not close
  process.exit(0);
})();
