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

  console.log('Navigating to English Facebook Page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595202872996', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'tools/fb_en_current_feed.png' });

  // Scroll down a bit to see posts
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/fb_en_feed_scrolled.png' });

  console.log('Navigating to Hindi Facebook Page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595333157867', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'tools/fb_hi_current_feed.png' });

  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/fb_hi_feed_scrolled.png' });

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
