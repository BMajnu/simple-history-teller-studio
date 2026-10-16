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
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const comp = page.locator('div[role="button"]:has-text("What\'s on your mind"), span:has-text("What\'s on your mind")').first();
  console.log('Composer button visible:', await comp.isVisible().catch(() => false));
  if (await comp.isVisible().catch(() => false)) {
    console.log('Clicking composer button...');
    await comp.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/after_home_composer_click.png' });
  console.log('Saved tools/after_home_composer_click.png');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
