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
  await page.goto('https://www.facebook.com/profile.php?id=61595162615338', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Scroll down to see the latest post
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'tools/fb_page_live_post_verified.png' });
  console.log('Saved tools/fb_page_live_post_verified.png');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
