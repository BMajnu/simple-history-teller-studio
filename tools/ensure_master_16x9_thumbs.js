const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const EN_THUMB = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'en_thumbnail_optimized.jpg');
const HI_THUMB = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'hi_thumbnail_optimized.jpg');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

async function switchChannel(page, targetName) {
  console.log(`\nSwitching to ${targetName}...`);
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  let channelRenderer;
  if (targetName === 'Simple History Teller') {
    channelRenderer = page.locator('ytd-account-item-renderer:has-text("Simple History Teller")')
      .filter({ hasNotText: 'Bangla' })
      .filter({ hasNotText: 'Hindi' }).first();
  } else {
    channelRenderer = page.locator('ytd-account-item-renderer:has-text("Simple History Teller Hindi")').first();
  }

  if (await channelRenderer.isVisible({ timeout: 5000 }).catch(() => false)) {
    await channelRenderer.click();
    await page.waitForTimeout(6000);
  } else {
    await page.keyboard.press('Escape');
  }
}

async function setMasterThumb(page, videoId, thumbFile, label) {
  console.log(`Setting 16:9 master thumbnail for ${label} (${videoId})...`);
  await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1500);

  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });
  if (nodeIds && nodeIds.length > 0) {
    await session.send('DOM.setFileInputFiles', {
      files: [thumbFile],
      nodeId: nodeIds[nodeIds.length - 1]
    });
    console.log(`Attached ${thumbFile} via CDP to node ${nodeIds[nodeIds.length - 1]}`);
    await page.waitForTimeout(4000);
  }

  const saveBtn = page.locator('#save, button#save-button, ytcp-button#save').first();
  const isSaveEnabled = await saveBtn.isEnabled().catch(() => false);
  console.log(`Save enabled: ${isSaveEnabled}`);
  if (isSaveEnabled) {
    await saveBtn.click();
    await page.waitForTimeout(5000);
    console.log(`Saved master thumbnail for ${label}!`);
  }

  const shotPath = `tools/yt_${label}_master_final_thumb.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `yt_${label}_master_final_thumb.png`));
  }
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
  await setMasterThumb(page, 'lNNFHePozVs', EN_THUMB, 'en');

  // 2. Hindi
  await switchChannel(page, 'Simple History Teller Hindi');
  await setMasterThumb(page, 'hjnYUIqdRAE', HI_THUMB, 'hi');

  await ctx.close();
  console.log('Finished ensuring master 16:9 thumbnails!');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
