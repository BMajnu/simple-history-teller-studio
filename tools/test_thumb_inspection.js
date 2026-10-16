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

  // 1. Switch to English channel
  console.log('Navigating to studio.youtube.com...');
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const enChannel = page.locator('ytd-account-item-renderer:has-text("Simple History Teller")').filter({ hasNotText: 'Bangla' }).filter({ hasNotText: 'Hindi' }).first();
  await enChannel.click();
  await page.waitForTimeout(7000);
  console.log('Switched to Simple History Teller (English)!');

  // 2. Open English Master Video Edit Page
  console.log('Opening English master video edit page: lNNFHePozVs...');
  await page.goto('https://studio.youtube.com/video/lNNFHePozVs/edit', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Scroll down to see thumbnail
  await page.evaluate(() => {
    const main = document.querySelector('main#main');
    if (main) main.scrollTop = 500;
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'tools/en_master_scroll_thumb.png' });
  console.log('Saved tools/en_master_scroll_thumb.png');

  // Hover or check question mark
  const helpIcon = page.locator('tp-yt-iron-icon[icon*="help"], ytcp-icon-button[aria-label*="help"], ytcp-thumbnails-compact-editor tp-yt-iron-icon').first();
  if (await helpIcon.isVisible().catch(() => false)) {
    console.log('Hovering over help icon...');
    await helpIcon.hover();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/en_thumb_help_hover.png' });
  }

  // Check upload button click
  const uploadBtn = page.locator('#select-button, ytcp-button#select-button, ytcp-thumbnails-compact-editor ytcp-button, ytcp-thumbnails-compact-editor [role="button"]').first();
  if (await uploadBtn.isVisible().catch(() => false)) {
    console.log('Clicking upload button...');
    await uploadBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/en_thumb_after_click.png' });
  }

  // Also check if any dialog appeared
  const dialog = page.locator('ytcp-dialog, [role="dialog"]').first();
  if (await dialog.isVisible().catch(() => false)) {
    const text = await dialog.innerText();
    console.log('\nDIALOG DETECTED:\n', text);
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
