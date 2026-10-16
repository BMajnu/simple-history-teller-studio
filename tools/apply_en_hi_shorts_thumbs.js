const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const THUMBS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

async function switchChannel(page, targetName) {
  console.log(`\n============================================================`);
  console.log(`>>> Switching YouTube Channel to: "${targetName}"`);
  console.log(`============================================================`);
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
    console.log(`Successfully switched to ${targetName}!`);
  } else {
    await page.keyboard.press('Escape');
  }
}

async function getShortsList(page) {
  await page.goto('https://studio.youtube.com/channel/videos', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const shortsTab = page.locator('tp-yt-paper-tab:has-text("Shorts"), div[role="tab"]:has-text("Shorts")').first();
  if (await shortsTab.isVisible().catch(() => false)) {
    await shortsTab.click();
    await page.waitForTimeout(3000);
  }

  const items = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('ytcp-video-row, #row-container'));
    return rows.map(r => {
      const link = r.querySelector('a[href*="/video/"]');
      const title = r.querySelector('#video-title, #title');
      return {
        title: title ? title.innerText.trim() : '',
        href: link ? link.getAttribute('href') : ''
      };
    }).filter(v => v.href);
  });

  return items;
}

async function applyThumbnailToVideo(page, videoHref, thumbFile, label) {
  const editUrl = `https://studio.youtube.com${videoHref}`;
  console.log(`\nNavigating to ${editUrl} for ${label}...`);
  await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1500);

  const uploadBtn = page.locator('#select-button, ytcp-button#select-button, [aria-label*="Upload thumbnail"], div:has-text("Upload file"), div:has-text("Change")').first();
  let uploaded = false;

  try {
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
      uploadBtn.click({ force: true })
    ]);
    if (fileChooser) {
      console.log(`FileChooser opened! Attaching ${thumbFile}...`);
      await fileChooser.setFiles(thumbFile);
      uploaded = true;
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    console.log('FileChooser notice:', e.message);
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
          files: [thumbFile],
          nodeId: nodeIds[nodeIds.length - 1]
        });
        console.log(`Attached via CDP to node ${nodeIds[nodeIds.length - 1]}!`);
        uploaded = true;
        await page.waitForTimeout(3000);
      }
    } catch (cdpErr) {
      console.log('CDP notice:', cdpErr.message);
    }
  }

  // Save button
  const saveBtn = page.locator('#save, button#save-button, ytcp-button#save').first();
  const isSaveEnabled = await saveBtn.isEnabled().catch(() => false);
  console.log(`${label} Save enabled:`, isSaveEnabled);
  if (isSaveEnabled) {
    await saveBtn.click();
    await page.waitForTimeout(4000);
    console.log(`>>> ${label} Saved!`);
  }

  const shotPath = `tools/yt_${label}_thumb_saved.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `yt_${label}_thumb_saved.png`));
  }
}

(async () => {
  console.log('=== APPLYING ENGLISH & HINDI SHORTS THUMBNAILS ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. English Shorts
  await switchChannel(page, 'Simple History Teller');
  const enShorts = await getShortsList(page);
  console.log('Found English Shorts:', enShorts);

  // Match Part 1 to 4
  for (let p = 1; p <= 4; p++) {
    const thumbFile = path.join(THUMBS_DIR, `thumb_en_part${p}.jpg`);
    // Find matching video row by title part or reverse order (part 4 is newest, part 1 is oldest)
    const match = enShorts.find(s => s.title.includes(`Part ${p}`) || s.title.includes(`[Part ${p}]`)) 
      || enShorts[enShorts.length - p]; // fallback
    if (match) {
      await applyThumbnailToVideo(page, match.href, thumbFile, `en_short_part${p}`);
    }
  }

  // 2. Hindi Shorts
  await switchChannel(page, 'Simple History Teller Hindi');
  const hiShorts = await getShortsList(page);
  console.log('Found Hindi Shorts:', hiShorts);

  for (let p = 1; p <= 4; p++) {
    const thumbFile = path.join(THUMBS_DIR, `thumb_hi_part${p}.jpg`);
    const match = hiShorts.find(s => s.title.includes(`भाग ${p}`) || s.title.includes(`[भाग ${p}]`))
      || hiShorts[hiShorts.length - p]; // fallback
    if (match) {
      await applyThumbnailToVideo(page, match.href, thumbFile, `hi_short_part${p}`);
    }
  }

  await ctx.close();
  console.log('\n=== ALL ENGLISH & HINDI SHORTS THUMBNAILS COMPLETED! ===');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
