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
  await page.bringToFront();
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Let's test clicking "Use another profile"
  console.log('Clicking "Use another profile"...');
  await page.click('text=Use another profile');
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/ig_after_use_another.png' });
  console.log('URL:', page.url());

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
