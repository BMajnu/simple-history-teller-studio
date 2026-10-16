// Harvest ONE ready tile: project URL + tile idx + scene id -> clip file.
const { chromium } = require('playwright-core');
const fs = require('fs');
const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VISUAL = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\simple_itihash_002_first_language\\visual_assets';
const URL = process.env.PURL;
const IDX = Number(process.env.TILE || '0');
const ID = Number(process.env.SID);
(async () => {
  const shotNum = String(ID).padStart(4, '0');
  const outPath = `${VISUAL}\\clip_shot_${shotNum}.mp4`;
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: false, executablePath: CHROME_PATH, args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(10000);
  const tiles = page.locator('flow-video-tile');
  console.log('tiles:', await tiles.count().catch(() => -1));
  const tb = await tiles.nth(IDX).boundingBox({ timeout: 8000 }).catch(() => null);
  if (!tb) { console.log('NO_TILE'); await ctx.close(); process.exit(1); }
  await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await page.waitForTimeout(6000);
  const dlBtn = page.locator('button[aria-label*="ডাউনলোড"], button[aria-label*="Download"]').first();
  console.log('dl visible:', await dlBtn.isVisible().catch(() => false));
  const bb = await dlBtn.boundingBox({ timeout: 8000 }).catch(() => null);
  let download = null;
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
  console.log('download event:', !!download);
  if (download) {
    const tmp = `${VISUAL}\\_hv_${shotNum}.mp4`;
    await download.saveAs(tmp).catch(() => null);
    if (fs.existsSync(tmp) && fs.statSync(tmp).size > 100000) {
      const buf = fs.readFileSync(tmp); fs.unlinkSync(tmp);
      const ok = buf.slice(4, 12).toString() === 'ftypmp42' || buf.includes(Buffer.from('moov'));
      console.log('bytes:', buf.length, 'valid:', ok);
      if (ok) { fs.writeFileSync(outPath, buf); console.log('SAVED', outPath); }
    }
  }
  await ctx.close();
  process.exit(fs.existsSync(outPath) ? 0 : 1);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
