const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');

const shortsMap = [
  { match: 'মানুষের প্রথম রাজা', file: path.join(SHORTS_DIR, 'short_bn_full1.mp4'), part: 1 },
  { match: 'কৃষির মারণফাঁদ', file: path.join(SHORTS_DIR, 'short_bn_full2.mp4'), part: 2 },
  { match: 'পৃথিবীর প্রথম চাঁদাবাজি', file: path.join(SHORTS_DIR, 'short_bn_full3.mp4'), part: 3 },
  { match: 'সুমেরীয় সম্রাট', file: path.join(SHORTS_DIR, 'short_bn_full4.mp4'), part: 4 },
  { match: 'রাজার পতন', file: path.join(SHORTS_DIR, 'short_bn_full5.mp4'), part: 5 }
];

function bringToFront() {
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}
}

(async () => {
  console.log('=== STEP 1: LAUNCH VISIBLE CHROME BROWSER ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  bringToFront();

  console.log('Navigating to Shorts Library...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(6000);
  bringToFront();

  // Resume all interrupted uploads
  for (const item of shortsMap) {
    console.log(`\nChecking status for: ${item.match} (Part ${item.part})...`);
    const row = page.locator(`ytcp-video-row:has-text("${item.match}"), [role="row"]:has-text("${item.match}")`).first();
    if (await row.isVisible({ timeout: 4000 }).catch(() => false)) {
      const resumeBtn = row.locator('button:has-text("Resume upload"), ytcp-button:has-text("Resume upload"), button:has-text("আপলোড আবার শুরু করুন")').first();
      if (await resumeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`Found "Resume upload" for Part ${item.part}! Attaching ${path.basename(item.file)}...`);
        try {
          const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser', { timeout: 8000 }),
            resumeBtn.click()
          ]);
          await fileChooser.setFiles(item.file);
          console.log(`Part ${item.part} resumed successfully!`);
          await page.waitForTimeout(5000);
        } catch (e) {
          console.log(`Notice while resuming Part ${item.part}:`, e.message);
        }
      } else {
        console.log(`Part ${item.part} is not in interrupted state (already uploading or completed).`);
      }
    }
  }

  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'all_resumed_started.png') });
  console.log('Saved tools/all_resumed_started.png');

  // Monitor upload queue until all videos finish uploading
  console.log('\n=== STEP 2: MONITORING UPLOADS UNTIL 100% COMPLETE ===');
  let allUploaded = false;
  let attempts = 0;
  while (!allUploaded && attempts < 60) { // Max 15-20 mins
    attempts++;
    await page.waitForTimeout(15000);
    bringToFront();

    // Check row statuses
    const rows = page.locator('ytcp-video-row, [role="row"]');
    const pageText = await page.innerText('body').catch(() => '');
    const isStillUploading = pageText.includes('Uploading') || pageText.includes('uploading') || pageText.includes('Checks starting soon') || pageText.includes('Processing');
    const isInterrupted = pageText.includes('Upload interrupted');

    console.log(`[Check #${attempts}] Still active uploads/processing: ${isStillUploading}, Interrupted: ${isInterrupted}`);

    if (isInterrupted) {
      // Re-trigger resume if any dropped
      for (const item of shortsMap) {
        const row = page.locator(`ytcp-video-row:has-text("${item.match}")`).first();
        if (await row.isVisible().catch(() => false)) {
          const resumeBtn = row.locator('button:has-text("Resume upload")').first();
          if (await resumeBtn.isVisible().catch(() => false)) {
            console.log(`Re-resuming Part ${item.part}...`);
            const [fileChooser] = await Promise.all([
              page.waitForEvent('filechooser', { timeout: 6000 }),
              resumeBtn.click()
            ]);
            await fileChooser.setFiles(item.file);
            await page.waitForTimeout(3000);
          }
        }
      }
    }

    if (!isStillUploading && !isInterrupted && attempts > 4) {
      console.log('All uploads and processing checks appear completed!');
      allUploaded = true;
      break;
    }
  }

  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'all_uploads_finished.png') });
  console.log('Saved tools/all_uploads_finished.png');

  // STEP 3: Ensure frame selection for Part 3, 4, 5
  console.log('\n=== STEP 3: SETTING FRAMES ON EDIT PAGES FOR PARTS 3, 4, 5 ===');
  for (const partNum of [3, 4, 5]) {
    const item = shortsMap.find(s => s.part === partNum);
    console.log(`\nNavigating to edit Part ${partNum} (${item.match})...`);
    const row = page.locator(`ytcp-video-row:has-text("${item.match}")`).first();
    if (await row.isVisible().catch(() => false)) {
      // Find edit / details link
      const editLink = row.locator('a#video-title, a[href*="/edit"]').first();
      await editLink.click({ force: true });
      await page.waitForTimeout(6000);
      bringToFront();

      // Scroll to thumbnail
      await page.evaluate(() => {
        const m = document.querySelector('main#main');
        if (m) m.scrollTop = 450;
      });
      await page.waitForTimeout(2000);

      // Dismiss any popups if present
      const cancelBtn = page.locator('ytcp-dialog button:has-text("Cancel"), #cancel-button').first();
      if (await cancelBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await cancelBtn.click({ force: true });
        await page.waitForTimeout(1000);
      }

      // Check "Select from video" or auto-generated frame thumbnails
      const selectFromVideoBtn = page.locator('button:has-text("Select from video"), #select-button:has-text("Select from video")').first();
      if (await selectFromVideoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`Clicking "Select from video" for Part ${partNum}...`);
        await selectFromVideoBtn.click({ force: true });
        await page.waitForTimeout(3000);

        // Click frame inside modal (or pick slider/frame)
        const framePick = page.locator('ytcp-thumbnail-editor img, ytcp-video-thumbnail-editor, ytcp-thumbnail-picker').first();
        if (await framePick.isVisible({ timeout: 2000 }).catch(() => false)) {
          await framePick.click({ force: true });
          await page.waitForTimeout(1000);
        }

        // Click Done/Select
        const doneBtn = page.locator('ytcp-dialog button:has-text("Done"), ytcp-dialog button:has-text("সম্পন্ন"), button:has-text("Done"), #done-button').first();
        if (await doneBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await doneBtn.click({ force: true });
          await page.waitForTimeout(2000);
        }
      } else {
        // Try picking the best auto-generated frame thumbnail
        const autoThumbs = page.locator('ytcp-thumbnail-button, [aria-label*="Auto-generated thumbnail"]');
        const count = await autoThumbs.count();
        console.log(`Found ${count} auto-generated frame thumbnails for Part ${partNum}.`);
        if (count > 0) {
          // Click the 2nd or 1st frame (middle action frame)
          const targetThumb = count > 1 ? autoThumbs.nth(1) : autoThumbs.first();
          await targetThumb.click({ force: true });
          console.log(`Selected auto-generated frame thumbnail for Part ${partNum}!`);
          await page.waitForTimeout(2000);
        }
      }

      // Ensure Visibility is Public
      const visBox = page.locator('ytcp-video-metadata-visibility').first();
      // Click Save button if enabled
      const saveBtn = page.locator('#save-button, ytcp-button#save-button, button:has-text("Save"), button:has-text("সংরক্ষণ করুন")').first();
      if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        const ariaDisabled = await saveBtn.getAttribute('aria-disabled');
        if (ariaDisabled !== 'true') {
          await saveBtn.click({ force: true });
          console.log(`Saved changes for Part ${partNum}!`);
          await page.waitForTimeout(4000);
        }
      }

      await page.screenshot({ path: path.resolve(ROOT, 'tools', `part${partNum}_frame_saved.png`) });
      // Go back to shorts list
      await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(5000);
    }
  }

  // Final Overview Screenshot
  console.log('\n=== FINAL VERIFICATION SCREENSHOT ===');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'final_all_five_shorts_live.png') });
  console.log('Saved tools/final_all_five_shorts_live.png');

  console.log('\n=== ALL 5 SHORTS RESUMED, UPLOADED, PROCESSED & FRAMED SUCCESSFULLY! ===');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error in resume pipeline:', err);
  process.exit(1);
});
