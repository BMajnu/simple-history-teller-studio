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
  await page.waitForTimeout(4000);

  // Click avatar
  const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  // Click Switch account
  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  // Click "Simple History Teller" (English channel under bmajnu980@gmail.com)
  console.log('Selecting English channel Simple History Teller...');
  const targetChannel = page.locator('ytd-account-item-renderer:has-text("Simple History Teller")').filter({ hasNotText: 'Bangla' }).filter({ hasNotText: 'Hindi' }).first();
  await targetChannel.click();
  console.log('Waiting 8s for YouTube Studio reload into English channel...');
  await page.waitForTimeout(8000);

  console.log('Current URL after switch:', page.url());
  await page.screenshot({ path: 'tools/yt_studio_switched_en.png' });

  const title = await page.locator('#channel-title, ytcp-entity-page-header .title, #entity-name').first().textContent().catch(() => 'unknown');
  console.log('Switched Channel Title:', title.trim());

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
