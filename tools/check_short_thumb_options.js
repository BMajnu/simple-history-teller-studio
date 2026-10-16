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

  // Switch to English channel
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const enChannel = page.locator('ytd-account-item-renderer:has-text("Simple History Teller")')
    .filter({ hasNotText: 'Bangla' })
    .filter({ hasNotText: 'Hindi' }).first();
  await enChannel.click();
  await page.waitForTimeout(6000);

  // Go to English Short Part 1 edit page
  console.log('Navigating to English Short Part 1 edit page (sln_ztxOAhQ)...');
  await page.goto('https://studio.youtube.com/video/sln_ztxOAhQ/edit', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Scroll to thumbnail
  await page.evaluate(() => {
    const main = document.querySelector('main#main');
    if (main) main.scrollTop = 500;
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'tools/yt_en_short_edit_page.png' });
  console.log('Saved tools/yt_en_short_edit_page.png');

  // Check what thumbnail options exist
  const thumbPicker = page.locator('ytcp-thumbnails-compact-editor, #thumbnail-picker').first();
  if (await thumbPicker.isVisible().catch(() => false)) {
    const text = await thumbPicker.innerText();
    console.log('Thumb picker text:', text);
  } else {
    console.log('Thumb picker not found or different');
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
