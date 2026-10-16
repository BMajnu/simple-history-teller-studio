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

  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('Current Studio URL:', page.url());
  await page.screenshot({ path: 'tools/yt_studio_home.png' });

  // Get channel title
  const title = await page.locator('#channel-title, ytcp-entity-page-header .title, #entity-name').first().textContent().catch(() => 'unknown');
  console.log('Current Studio Title:', title);

  // Click top right user avatar
  const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
  if (await avatar.isVisible().catch(() => false)) {
    console.log('Clicking avatar...');
    await avatar.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/yt_studio_avatar_menu.png' });

    // Look for switch account option
    const switchAccount = page.locator('ytcp-text-menu-item:has-text("Switch account"), ytp-menu-item:has-text("Switch account"), tp-yt-paper-item:has-text("Switch account"), [aria-label*="Switch account"], text="Switch account"').first();
    if (await switchAccount.isVisible().catch(() => false)) {
      console.log('Clicking Switch account...');
      await switchAccount.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tools/yt_studio_switch_list.png' });
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
