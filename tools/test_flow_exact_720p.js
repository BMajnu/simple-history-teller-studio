const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const VISUAL = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse', 'visual_assets');
const OUT_FILE = path.join(VISUAL, 'clip_scene_0006.mp4');

(async () => {
  console.log('Testing specific 720p click in Google Flow...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://flow.google.com/project/fe696efb-895e-4a23-b95d-582220360465', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Click the video tile
  const tile = page.locator('flow-media-tile, flow-video-tile, [class*="media-tile"], [class*="video-tile"]').first();
  await tile.click();
  await page.waitForTimeout(3000);

  // Find download button
  const dlBtn = page.locator('button[aria-label*="Download"], button[aria-label*="ডাউনলোড"], button:has-text("Download")').first();
  console.log('Clicking Download button...');
  await dlBtn.click();
  await page.waitForTimeout(1000);

  // Filter specifically for the 720p menuitem/button
  const btn720 = page.locator('button, [role="menuitem"]').filter({ hasText: '720p' }).first();
  console.log('Found 720p button count:', await btn720.count());

  if (await btn720.count() > 0) {
    console.log('Clicking 720p button and listening for download...');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      btn720.click()
    ]);

    if (download) {
      await download.saveAs(OUT_FILE);
      console.log(`✓ SUCCESS! Clip saved to: ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2)} MB)`);
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
