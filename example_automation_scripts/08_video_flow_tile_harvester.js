const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const VISUAL = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse', 'visual_assets');
const OUT_FILE = path.join(VISUAL, 'clip_scene_0006.mp4');

(async () => {
  console.log('Harvesting Scene 6 Video from Google Flow...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  await page.goto('https://flow.google.com/project/fe696efb-895e-4a23-b95d-582220360465', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Monitor for completed video in tile
  console.log('Waiting for video generation to complete...');
  let videoFound = false;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const tileState = await page.evaluate(() => {
      const v = document.querySelector('video');
      const tiles = Array.from(document.querySelectorAll('flow-video-tile, flow-media-tile, [class*="tile"]'));
      const text = document.body.innerText || '';
      const isGenerating = /generating|rendering|(\d+)%/i.test(text);
      return {
        hasVideoTag: !!v,
        videoSrc: v ? (v.currentSrc || v.src) : null,
        videoDuration: v ? v.duration : 0,
        tilesCount: tiles.length,
        isGenerating
      };
    });

    console.log(`Poll ${i + 1}: hasVideo=${tileState.hasVideoTag}, duration=${tileState.videoDuration}, isGenerating=${tileState.isGenerating}`);

    if (tileState.hasVideoTag && tileState.videoDuration > 2) {
      console.log('Video tag is ready! Extracting directly...');
      videoFound = true;
      break;
    }
  }

  // Click the video tile to open editor/full view
  console.log('Locating video tile to click for download...');
  const tile = page.locator('flow-media-tile, flow-video-tile, [class*="media-tile"], [class*="video-tile"]').first();
  if (await tile.count() > 0) {
    await tile.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(__dirname, 'flow_tile_opened.png') });
    console.log('Saved flow_tile_opened.png');
  }

  // Look for download button
  const dlBtn = page.locator('button[aria-label*="Download"], button[aria-label*="ডাউনলোড"], button:has-text("Download")').first();
  if (await dlBtn.count() > 0) {
    console.log('Found Download button! Waiting for download event...');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }).catch(() => null),
      dlBtn.click()
    ]);

    if (download) {
      await download.saveAs(OUT_FILE);
      console.log(`✓ SUCCESS! Downloaded clip saved to: ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.log('Download event did not fire directly, checking video src extraction...');
    }
  }

  // Fallback: extract video src from DOM if download button didn't trigger event
  if (!fs.existsSync(OUT_FILE) || fs.statSync(OUT_FILE).size < 100000) {
    const vSrc = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? (v.currentSrc || v.src) : null;
    });

    if (vSrc) {
      console.log('Extracting video from src:', vSrc.slice(0, 80));
      const vData = await page.evaluate(async (src) => {
        try {
          const res = await fetch(src);
          const blob = await res.blob();
          const buf = await blob.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let bin = '';
          for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
          return { b64: btoa(bin), size: bytes.length };
        } catch(e) { return { err: e.message }; }
      }, vSrc);

      if (vData && vData.b64) {
        fs.writeFileSync(OUT_FILE, Buffer.from(vData.b64, 'base64'));
        console.log(`✓ SUCCESS! Extracted clip saved to: ${OUT_FILE} (${(vData.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
