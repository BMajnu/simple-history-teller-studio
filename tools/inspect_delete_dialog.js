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
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(5000);

  const row = page.locator('ytcp-video-row:has-text("পৃথিবীর প্রথম চাঁদাবাজি")').first();
  const delBtn = row.locator('button:has-text("Delete video"), ytcp-button:has-text("Delete video")').first();
  console.log('Delete button visible:', await delBtn.isVisible());
  await delBtn.click({ force: true });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/delete_dialog_screenshot.png' });
  console.log('Saved tools/delete_dialog_screenshot.png');

  const dialogText = await page.locator('ytcp-dialog, [role="dialog"]').first().innerText().catch(() => 'No dialog');
  console.log('Dialog Text:\n', dialogText);

  // If checkbox is present
  const chk = page.locator('ytcp-dialog tp-yt-paper-checkbox, [role="dialog"] input[type="checkbox"]').first();
  if (await chk.isVisible().catch(() => false)) {
    console.log('Clicking checkbox...');
    await chk.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Click confirm delete button
  const confirmBtn = page.locator('ytcp-dialog button:has-text("Delete"), ytcp-dialog #confirm-button, [role="dialog"] button:has-text("Delete")').last();
  console.log('Confirm button visible:', await confirmBtn.isVisible().catch(() => false));
  if (await confirmBtn.isVisible().catch(() => false)) {
    console.log('Clicking confirm delete button...');
    await confirmBtn.click({ force: true });
    await page.waitForTimeout(5000);
  }

  // Also on Part 1: click Cancel upload
  const row1 = page.locator('ytcp-video-row:has-text("মানুষের প্রথম রাজা")').first();
  const cancelBtn = row1.locator('button:has-text("Cancel upload"), ytcp-button:has-text("Cancel upload")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    console.log('Clicking Cancel upload on Part 1...');
    await cancelBtn.click({ force: true });
    await page.waitForTimeout(2000);
    const confirmCancel = page.locator('ytcp-dialog button:has-text("Cancel upload"), #confirm-button, ytcp-button:has-text("CANCEL")').last();
    if (await confirmCancel.isVisible().catch(() => false)) {
      await confirmCancel.click({ force: true });
      await page.waitForTimeout(3000);
    }
  }

  await page.screenshot({ path: 'tools/after_cleanup_screenshot.png' });
  console.log('Saved tools/after_cleanup_screenshot.png');

  await ctx.close();
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
