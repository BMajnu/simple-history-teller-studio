const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const THUMBS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');

// List of shorts: [part, videoId, thumbFile]
const shortsToUpdate = [
  { part: 2, id: 'j-_H_lnSzpA', thumb: path.join(THUMBS_DIR, 'thumb_bn_full2.jpg') },
  { part: 3, id: 'bVvYynbjSKk', thumb: path.join(THUMBS_DIR, 'thumb_bn_full3.jpg') },
  { part: 4, id: 'Kuc5FRoYJW0', thumb: path.join(THUMBS_DIR, 'thumb_bn_full4.jpg') },
  { part: 5, id: 'VYgdHe1I1p4', thumb: path.join(THUMBS_DIR, 'thumb_bn_full5.jpg') }
];

async function switchChannel(page, targetName) {
  console.log(`\nSwitching YouTube Channel to: "${targetName}"`);
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const channelRenderer = page.locator(`ytd-account-item-renderer:has-text("${targetName}")`).first();
  if (await channelRenderer.isVisible({ timeout: 5000 }).catch(() => false)) {
    await channelRenderer.click();
    await page.waitForTimeout(6000);
    console.log(`Switched to ${targetName}!`);
  } else {
    await page.keyboard.press('Escape');
  }
}

(async () => {
  console.log('=== APPLYING BANGLA SHORTS THUMBNAILS ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  await switchChannel(page, 'Simple History Teller Bangla');

  for (const s of shortsToUpdate) {
    console.log(`\n--- Setting thumbnail for Part ${s.part} (Video ID: ${s.id}) ---`);
    console.log(`File: ${s.thumb}`);

    await page.goto(`https://studio.youtube.com/video/${s.id}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    // Scroll to thumbnail picker
    await page.evaluate(() => {
      const m = document.querySelector('main#main');
      if (m) m.scrollTop = 500;
    });
    await page.waitForTimeout(1500);

    // Check file input or select button
    const fileInput = page.locator('input#file-loader, input[type="file"]').first();
    const uploadBtn = page.locator('#select-button, ytcp-button#select-button, [aria-label*="Upload thumbnail"], div:has-text("Upload file"), div:has-text("Change")').first();

    let uploaded = false;
    try {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 6000 }).catch(() => null),
        uploadBtn.click({ force: true })
      ]);
      if (fileChooser) {
        console.log(`FileChooser opened! Attaching ${s.thumb}...`);
        await fileChooser.setFiles(s.thumb);
        uploaded = true;
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('FileChooser click error:', e.message);
    }

    if (!uploaded) {
      try {
        const session = await page.context().newCDPSession(page);
        const doc = await session.send('DOM.getDocument', { depth: 0 });
        const { nodeIds } = await session.send('DOM.querySelectorAll', {
          nodeId: doc.root.nodeId,
          selector: 'input[type="file"]'
        });
        if (nodeIds && nodeIds.length > 0) {
          await session.send('DOM.setFileInputFiles', {
            files: [s.thumb],
            nodeId: nodeIds[nodeIds.length - 1]
          });
          console.log(`Thumbnail attached via CDP to node ${nodeIds[nodeIds.length - 1]}!`);
          uploaded = true;
          await page.waitForTimeout(3000);
        }
      } catch (cdpErr) {
        console.log('CDP attach error:', cdpErr.message);
      }
    }

    // Save button
    const saveBtn = page.locator('#save, button#save-button, ytcp-button#save').first();
    const isSaveEnabled = await saveBtn.isEnabled().catch(() => false);
    console.log(`Part ${s.part} Save button enabled:`, isSaveEnabled);
    if (isSaveEnabled) {
      await saveBtn.click();
      await page.waitForTimeout(4000);
      console.log(`>>> Part ${s.part} Save clicked!`);
    }

    const shotPath = `tools/yt_bn_short_part${s.part}_thumb_applied.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  await ctx.close();
  console.log('\n=== ALL BANGLA SHORTS THUMBNAILS UPDATED! ===');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
