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

  // 2. Open English Master Video Edit Page
  console.log('Opening English master video edit page...');
  await page.goto('https://studio.youtube.com/video/lNNFHePozVs/edit', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  await page.evaluate(() => {
    const main = document.querySelector('main#main');
    if (main) main.scrollTop = 500;
  });
  await page.waitForTimeout(1500);

  // Click Upload file tile
  const uploadBtn = page.locator('#select-button, ytcp-button#select-button, ytcp-thumbnails-compact-editor ytcp-button, ytcp-thumbnails-compact-editor [role="button"]').first();
  await uploadBtn.click();
  await page.waitForTimeout(2000);

  // Click Verify button in modal
  const verifyBtn = page.locator('ytcp-button:has-text("Verify"), button:has-text("Verify"), [aria-label*="Verify"]').first();
  console.log('Verify button visible:', await verifyBtn.isVisible().catch(() => false));

  // Listen for popup or new page
  const [newPage] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 10000 }).catch(() => null),
    verifyBtn.click()
  ]);

  await page.waitForTimeout(4000);
  const targetPage = newPage || ctx.pages().find(p => p.url().includes('verify')) || page;
  console.log('Target verification page URL:', targetPage.url());

  await targetPage.screenshot({ path: 'tools/yt_verify_page.png' });
  console.log('Saved tools/yt_verify_page.png');

  // Inspect verify page elements
  const pageText = await targetPage.innerText('body');
  console.log('Verification page summary:', pageText.substring(0, 300));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
