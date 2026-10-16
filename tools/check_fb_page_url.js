const { chromium } = require('playwright-core');
const { execSync } = require('child_process');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching visible Chrome with user profile...');
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

  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  console.log('Navigating to Facebook...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  console.log('Current FB URL:', page.url());
  await page.screenshot({ path: 'tools/fb_home_current.png' });
  console.log('Saved tools/fb_home_current.png');

  // Navigate to pages or directly to Simple History Teller Bangla
  // Let's check pages
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/fb_your_pages.png' });
  console.log('Saved tools/fb_your_pages.png');

  const pageLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/"]')).map(a => ({
      text: a.innerText.trim(),
      href: a.getAttribute('href')
    })).filter(a => a.text.includes('Simple') || a.text.includes('History') || a.href.includes('SimpleHistory'));
  });
  console.log('Found page links:', pageLinks);

  // Keep browser running or we can connect via CDP for subsequent actions
})();
