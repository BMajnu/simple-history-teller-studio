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
  await page.waitForTimeout(4000);

  // Click top right profile avatar to see all profiles and pages
  console.log('Clicking top right profile icon...');
  const avatar = page.locator('div[role="button"][aria-label*="Your profile"], top_right_profile').first();
  if (await avatar.isVisible().catch(() => false)) {
    await avatar.click();
    await page.waitForTimeout(2000);

    // Click "See all profiles" if visible
    const seeAll = page.locator('span:has-text("See all profiles"), div:has-text("See all profiles")').first();
    if (await seeAll.isVisible().catch(() => false)) {
      console.log('Clicking See all profiles...');
      await seeAll.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: 'tools/fb_all_profiles_view.png' });
  console.log('Saved tools/fb_all_profiles_view.png');

  // Extract all profile / page names visible in the list
  const list = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="dialog"] span, div[role="menu"] span')).map(s => s.innerText.trim()).filter(Boolean);
  });
  console.log('Visible profiles/pages in menu:', JSON.stringify([...new Set(list)], null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
