// Finish ONE scene: monitor its project until video ready, then download.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VISUAL = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\simple_itihash_002_first_language\\visual_assets';
const PROJECT_URL = process.env.PURL;
const ID = Number(process.env.PID);
(async () => {
  const shotNum = String(ID).padStart(4, '0');
  const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: false, executablePath: CHROME_PATH, args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null });
  const page = await ctx.newPage();
  await page.goto(PROJECT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  for (let k = 0; k < 100; k++) { // ~50 min
    await page.waitForTimeout(30000);
    const st = await page.evaluate(() => {
      const vids = Array.from(document.querySelectorAll('video')).map(v => ({ src: !!(v.currentSrc || v.src), rs: v.readyState }));
      return { tiles: document.querySelectorAll('flow-video-tile').length, vids };
    }).catch(() => ({}));
    if (k % 4 === 0) console.log(`  ... tiles:${st.tiles} videos:${JSON.stringify(st.vids)}`);
    if ((st.vids || []).some(v => v.src && v.rs >= 2)) break;
  }
  await page.screenshot({ path: `C:\\Users\\badiu\\AppData\\Local\\Temp\\opencode\\finish_${ID}.png` }).catch(() => {});
  // click first video tile -> editor -> download icon -> 720p -> download event
  const tiles = page.locator('flow-video-tile');
  const tb = await tiles.first().boundingBox({ timeout: 8000 }).catch(() => null);
  if (tb) await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await page.waitForTimeout(6000);
  const dlBtn = page.locator('button[aria-label*="ডাউনলোড"], button[aria-label*="Download"]').first();
  let download = null;
  if (await dlBtn.isVisible().catch(() => false)) {
    const bb = await dlBtn.boundingBox({ timeout: 8000 }).catch(() => null);
    if (bb) {
      [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }).catch(() => null),
        page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2),
      ]);
      if (!download) {
        await page.waitForTimeout(2500);
        const r720 = page.locator('button, [role="menuitem"]').filter({ hasText: '720p' }).first();
        if (await r720.isVisible().catch(() => false)) {
          const rb = await r720.boundingBox({ timeout: 8000 }).catch(() => null);
          if (rb) {
            [download] = await Promise.all([
              page.waitForEvent('download', { timeout: 180000 }).catch(() => null),
              page.mouse.click(rb.x + rb.width / 2, rb.y + rb.height / 2),
            ]);
          }
        }
      }
    }
  }
  console.log('download event:', !!download);
  if (download) {
    const tmp = path.join(VISUAL, `_flowdl_${shotNum}.mp4`);
    await download.saveAs(tmp).catch(() => null);
    if (fs.existsSync(tmp) && fs.statSync(tmp).size > 100000) {
      const buf = fs.readFileSync(tmp); fs.unlinkSync(tmp);
      console.log('bytes:', buf.length, 'mp4:', buf.slice(4, 12).toString());
      if (buf.includes(Buffer.from('moov'))) { fs.writeFileSync(outPath, buf); console.log('SAVED', outPath); }
    }
  }
  await ctx.close();
  process.exit(fs.existsSync(outPath) ? 0 : 1);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
