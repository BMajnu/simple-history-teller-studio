const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching Chrome to inspect Instagram status...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('Navigating to https://www.instagram.com/...');
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const url = page.url();
  console.log('Current URL:', url);

  const shotPath = 'tools/ig_session_status.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync(shotPath, path.join(artifactDir, 'ig_session_status.png'));

  // Print text snippet
  const text = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => '');
  console.log('Page snippet:\n', text.replace(/\n+/g, ' '));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
