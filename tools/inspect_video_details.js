const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to Video Details edit page: https://studio.youtube.com/video/ibG0M13m7I0/edit');
  await page.goto('https://studio.youtube.com/video/ibG0M13m7I0/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Dismiss any dialog
  try {
    const dialogBtn = page.locator('#confirm-button, button:has-text("Dismiss"), button:has-text("Continue")').first();
    if (await dialogBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dialogBtn.click({ force: true }).catch(() => {});
    }
  } catch (e) {}

  // Take screenshot of top
  await page.screenshot({ path: 'tools/yt_edit_page_top.png' });
  console.log('Saved tools/yt_edit_page_top.png');

  // Scroll down to thumbnail area
  const thumbArea = page.locator('ytcp-thumbnails-compact, [name="thumbnail"], #still-list, #thumbnails').first();
  if (await thumbArea.isVisible().catch(() => false)) {
    await thumbArea.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  } else {
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'tools/yt_edit_page_thumbnails.png' });
  console.log('Saved tools/yt_edit_page_thumbnails.png');

  // Check what thumbnails exist or if there is an error/warning
  const thumbButtons = await page.locator('ytcp-thumbnails-compact button, ytcp-thumbnails-compact [role="button"], #select-button').allInnerTexts().catch(() => []);
  console.log('Thumbnail buttons/text:', thumbButtons);

  process.exit(0);
})().catch(console.error);
