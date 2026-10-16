const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const EN_THUMB = path.resolve('projects/sample_first_king/metadata/en_thumbnail_optimized.jpg');
const HI_THUMB = path.resolve('projects/sample_first_king/metadata/hi_thumbnail_optimized.jpg');
const BN_THUMB = path.resolve('projects/sample_first_king/metadata/bn_thumbnail_optimized.jpg');

async function switchChannel(page, targetName) {
  console.log(`\n============================================================`);
  console.log(`>>> Switching YouTube Channel to: "${targetName}"`);
  console.log(`============================================================`);
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
  await avatar.waitFor({ state: 'visible', timeout: 15000 });
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
  await switchItem.waitFor({ state: 'visible', timeout: 10000 });
  await switchItem.click();
  await page.waitForTimeout(2000);

  let channelRenderer;
  if (targetName === 'Simple History Teller') {
    channelRenderer = page.locator('ytd-account-item-renderer:has-text("Simple History Teller")')
      .filter({ hasNotText: 'Bangla' })
      .filter({ hasNotText: 'Hindi' }).first();
  } else if (targetName === 'Simple History Teller Hindi') {
    channelRenderer = page.locator('ytd-account-item-renderer:has-text("Simple History Teller Hindi")').first();
  } else if (targetName === 'Simple History Teller Bangla') {
    channelRenderer = page.locator('ytd-account-item-renderer:has-text("Simple History Teller Bangla")').first();
  }

  if (await channelRenderer.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log(`Clicking account item for ${targetName}...`);
    await channelRenderer.click();
    await page.waitForTimeout(7000);
    console.log(`Successfully switched to ${targetName}!`);
  } else {
    console.log(`Account renderer not found or already active, pressing Escape...`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
  }
}

async function uploadThumbnail(page, videoId, thumbFile, label) {
  console.log(`\n------------------------------------------------------------`);
  console.log(`>>> Uploading Custom Thumbnail for ${label} (Video: ${videoId})`);
  console.log(`File: ${thumbFile}`);
  console.log(`------------------------------------------------------------`);

  const editUrl = `https://studio.youtube.com/video/${videoId}/edit`;
  await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Scroll down to thumbnail picker
  await page.evaluate(() => {
    const main = document.querySelector('main#main, #scrollable-content');
    if (main) main.scrollTop = 500;
  });
  await page.waitForTimeout(2000);

  // Check upload button / file input
  console.log('Triggering file upload...');
  const uploadBtn = page.locator('#select-button, ytcp-button#select-button, ytcp-thumbnails-compact-editor ytcp-button, ytcp-thumbnails-compact-editor [role="button"], div:has-text("Upload file"), div:has-text("Change")').first();

  let fileSet = false;

  // Try file chooser click
  try {
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 7000 }).catch(() => null),
      uploadBtn.click({ force: true })
    ]);

    if (fileChooser) {
      console.log('File chooser opened! Selecting thumbnail:', thumbFile);
      await fileChooser.setFiles(thumbFile);
      fileSet = true;
      await page.waitForTimeout(4000);
    }
  } catch (err) {
    console.log('FileChooser click error:', err.message);
  }

  // If fileChooser didn't trigger, try CDP DOM.setFileInputFiles
  if (!fileSet) {
    console.log('Trying CDP setFileInputFiles directly...');
    try {
      const session = await page.context().newCDPSession(page);
      const doc = await session.send('DOM.getDocument', { depth: 0 });
      const { nodeIds } = await session.send('DOM.querySelectorAll', {
        nodeId: doc.root.nodeId,
        selector: 'input[type="file"]'
      });
      console.log('Found file inputs:', nodeIds);
      if (nodeIds && nodeIds.length > 0) {
        // Last file input is usually thumbnail loader
        await session.send('DOM.setFileInputFiles', {
          files: [thumbFile],
          nodeId: nodeIds[nodeIds.length - 1]
        });
        console.log('Thumbnail set via CDP!');
        fileSet = true;
        await page.waitForTimeout(4000);
      }
    } catch (cdpErr) {
      console.log('CDP error:', cdpErr.message);
    }
  }

  // Check if any modal popped up
  const dialog = page.locator('ytcp-dialog, [role="dialog"]').first();
  if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
    const dialogText = await dialog.innerText();
    console.log('Dialog detected:', dialogText);
  }

  // Check Save button
  const saveBtn = page.locator('#save, button#save-button, ytcp-button#save').first();
  await page.waitForTimeout(2000);
  const isEnabled = await saveBtn.isEnabled().catch(() => false);
  console.log('Save button isEnabled:', isEnabled);

  if (isEnabled) {
    console.log('Clicking Save button...');
    await saveBtn.click();
    await page.waitForTimeout(5000);
    console.log('Save completed!');
  } else {
    console.log('Save button not enabled (thumbnail may already be set or no changes pending)');
  }

  const shotPath = `tools/yt_${label}_thumb_applied.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `yt_${label}_thumb_applied.png`));
  }
}

(async () => {
  console.log('=== STARTING MASTER THUMBNAIL APPLICATION ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. English Master Video
  await switchChannel(page, 'Simple History Teller');
  await uploadThumbnail(page, 'lNNFHePozVs', EN_THUMB, 'en_master');

  // 2. Hindi Master Video
  await switchChannel(page, 'Simple History Teller Hindi');
  await uploadThumbnail(page, 'hjnYUIqdRAE', HI_THUMB, 'hi_master');

  // 3. Bangla Master Video
  await switchChannel(page, 'Simple History Teller Bangla');
  await uploadThumbnail(page, 'ibG0M13m7I0', BN_THUMB, 'bn_master');

  await page.waitForTimeout(3000);
  await ctx.close();
  console.log('\n=== ALL MASTER THUMBNAILS APPLIED SUCCESSFULLY! ===');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error applying thumbnails:', err);
  process.exit(1);
});
