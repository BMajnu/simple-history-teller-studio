const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'hi_thumbnail_optimized.jpg');

(async () => {
  console.log('=== SETTING HINDI VIDEO THUMBNAIL & PUBLIC VISIBILITY ===');
  console.log('Thumbnail:', THUMB_PATH);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Navigate to edit page of the Hindi video
  console.log('Navigating to Hindi video edit page...');
  await page.goto('https://studio.youtube.com/video/hjnYUIqdRAE/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Upload thumbnail
  console.log('Checking thumbnail upload button...');
  const uploadFileBtn = page.locator('button#select-button, [aria-label*="Upload thumbnail"], div:has-text("Upload file")').first();
  if (await uploadFileBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking upload thumbnail button...');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 6000 }).catch(() => null),
      uploadFileBtn.click()
    ]);
    if (fileChooser) {
      await fileChooser.setFiles(THUMB_PATH);
      console.log('Thumbnail set via file chooser!');
    }
  }

  await page.waitForTimeout(3000);

  // Check visibility dropdown
  console.log('Checking visibility...');
  const visTrigger = page.locator('#visibility-trigger, [aria-label*="Visibility"]').first();
  if (await visTrigger.isVisible().catch(() => false)) {
    const text = await visTrigger.textContent();
    console.log('Current visibility text:', text);
    if (!text.toLowerCase().includes('public')) {
      await visTrigger.click();
      await page.waitForTimeout(1000);
      const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
      if (await publicRadio.isVisible().catch(() => false)) {
        await publicRadio.click();
        await page.waitForTimeout(1000);
        const doneBtn = page.locator('#done-button, button:has-text("Done")').first();
        if (await doneBtn.isVisible().catch(() => false)) await doneBtn.click();
      }
    }
  }

  // Click Save
  console.log('Clicking Save...');
  const saveBtn = page.locator('#save, button#save-button, ytcp-button#save').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    const isEnabled = await saveBtn.isEnabled().catch(() => false);
    console.log('Save button isEnabled:', isEnabled);
    if (isEnabled) {
      await saveBtn.click();
      await page.waitForTimeout(5000);
      console.log('Save clicked!');
    }
  }

  await page.screenshot({ path: 'tools/hi_video_public_and_thumb_saved.png' });
  console.log('Screenshot saved: tools/hi_video_public_and_thumb_saved.png');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
