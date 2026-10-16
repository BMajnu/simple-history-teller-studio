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

  console.log('Navigating to History Teller English Page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595202872996', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Check if we need to switch
  const switchBtn = page.locator('div[aria-label*="Switch"], div[role="button"]:has-text("Switch"), button:has-text("Switch")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log('Clicking Switch into History Teller Page...');
    await switchBtn.click();
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/fb_after_switch_page.png' });
  console.log('Current URL:', page.url());

  // Now go to reels create
  console.log('Going to https://www.facebook.com/reels/create ...');
  await page.goto('https://www.facebook.com/reels/create', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/fb_reels_create_screen.png' });

  // Check inputs
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map(i => i.outerHTML);
  });
  console.log('File inputs found:', inputs.length);
  inputs.forEach(i => console.log('Input:', i));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
