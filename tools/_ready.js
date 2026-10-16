// Readiness probe: project URL -> tiles/ready/progress + screenshot.
const { chromium } = require('playwright-core');
const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.PURL;
const TAG = process.env.PTAG || 'chk';
(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: true, executablePath: CHROME_PATH, args: ['--disable-blink-features=AutomationControlled'] });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);
  const info = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('flow-video-tile'));
    return {
      tiles: tiles.length,
      ready: tiles.filter(t => { const v = t.querySelector('video'); return v && (v.currentSrc || v.src) && v.readyState >= 2; }).length,
      progress: (document.body.innerText.match(/\d+%/g) || []).slice(0, 6),
    };
  }).catch(e => ({ err: e.message }));
  console.log(TAG, '=>', JSON.stringify(info));
  await ctx.close();
  process.exit(0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
