const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const EN_THUMB = path.resolve('projects/sample_first_king/metadata/en_thumbnail_optimized.jpg');
const HI_THUMB = path.resolve('projects/sample_first_king/metadata/hi_thumbnail_optimized.jpg');

async function switchChannel(page, channelName) {
  console.log(`\nSwitching YouTube channel to "${channelName}"...`);
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn, ytcp-avatar-button').first();
  await avatarBtn.waitFor({ state: 'visible', timeout: 15000 });
  await avatarBtn.click();
  await page.waitForTimeout(2000);

  const switchAccBtn = page.locator('tp-yt-paper-item:has-text("Switch account"), ytd-compact-link-renderer:has-text("Switch account")').first();
  await switchAccBtn.waitFor({ state: 'visible', timeout: 10000 });
  await switchAccBtn.click();
  await page.waitForTimeout(3000);

  const targetChannelItem = page.locator(`ytd-account-item-renderer:has-text("${channelName}")`).first();
  if (await targetChannelItem.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log(`Found account item for "${channelName}", clicking...`);
    await targetChannelItem.click();
    await page.waitForTimeout(6000);
    console.log(`Switched to "${channelName}"!`);
  } else {
    console.log(`Channel "${channelName}" item not found in switch modal, might already be active.`);
    await page.keyboard.press('Escape');
  }
}

async function uploadThumbnailForVideo(page, videoId, thumbPath, label) {
  console.log(`\n--- Setting thumbnail for ${label} (${videoId}) ---`);
  await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  // Scroll down to reveal thumbnail area
  await page.evaluate(() => {
    const main = document.querySelector('main#main, #scrollable-content, ytcp-video-metadata-editor');
    if (main) main.scrollTop = 400;
  });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: `tools/thumb_${label}_before.png` });

  // Look for upload file button / tile
  const uploadTile = page.locator('button#select-button, ytcp-button#select-button, #select-button, div#select-button, ytcp-thumbnails-compact-editor ytcp-button, ytcp-thumbnails-compact-editor div:has-text("Upload file")').first();
  console.log('Upload tile visible:', await uploadTile.isVisible().catch(() => false));

  // Also check for hidden file inputs
  const fileInput = page.locator('input#file-loader, input[type="file"][accept*="image"]').first();
  const fileInputExists = await fileInput.count() > 0;
  console.log('File input count:', await fileInput.count());

  if (fileInputExists) {
    console.log('Attaching thumbPath to file input directly...');
    await fileInput.setInputFiles(thumbPath);
    await page.waitForTimeout(4000);
  } else if (await uploadTile.isVisible().catch(() => false)) {
    console.log('Clicking upload tile with file chooser listener...');
    try {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 6000 }).catch(() => null),
        uploadTile.click({ force: true })
      ]);
      if (fileChooser) {
        console.log('FileChooser triggered! Setting files...');
        await fileChooser.setFiles(thumbPath);
        await page.waitForTimeout(4000);
      } else {
        console.log('No file chooser event triggered after click.');
      }
    } catch (e) {
      console.log('Click failed:', e.message);
    }
  }

  // Check if a modal or dialog appeared
  await page.waitForTimeout(2000);
  const dialog = page.locator('ytcp-dialog, tp-yt-paper-dialog, ytcp-confirmation-dialog, [role="dialog"]').first();
  if (await dialog.isVisible().catch(() => false)) {
    const text = await dialog.innerText();
    console.log(`\n[ALERT] Dialog appeared for ${label}:`);
    console.log(text);
    await page.screenshot({ path: `tools/thumb_${label}_dialog.png` });
  }

  // Check Save button
  const saveBtn = page.locator('#save, button#save-button, ytcp-button#save').first();
  const isSaveEnabled = await saveBtn.isEnabled().catch(() => false);
  console.log('Save button enabled:', isSaveEnabled);
  if (isSaveEnabled) {
    await saveBtn.click();
    await page.waitForTimeout(5000);
    console.log('Save button clicked successfully!');
  }

  await page.screenshot({ path: `tools/thumb_${label}_after.png` });
  console.log(`Saved screenshot: tools/thumb_${label}_after.png`);
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. English
  await switchChannel(page, 'Simple History Teller');
  await uploadThumbnailForVideo(page, 'lNNFHePozVs', EN_THUMB, 'en_master');

  // 2. Hindi
  await switchChannel(page, 'Simple History Teller Hindi');
  await uploadThumbnailForVideo(page, 'hjnYUIqdRAE', HI_THUMB, 'hi_master');

  await ctx.close();
  console.log('\n=== FINISHED THUMBNAIL UPLOAD PROCESS ===');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
