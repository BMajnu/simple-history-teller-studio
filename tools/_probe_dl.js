// Probe DOWNLOAD: newest profile_3 project -> click tile -> full view -> download.
const { chromium } = require('playwright-core');
const fs = require('fs');
const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VISUAL = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\simple_itihash_002_first_language\\visual_assets';
(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: false, executablePath: CHROME_PATH, args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null });
  const page = await ctx.newPage();
  await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  const first = await page.evaluate(() => {
    const a = document.querySelector('a[href*="/project/"]');
    return a ? a.href : null;
  }).catch(() => null);
  console.log('newest project:', first);
  if (!first) { await ctx.close(); process.exit(1); }
  await page.goto(first, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'C:\\Users\\badiu\\AppData\\Local\\Temp\\opencode\\dl_tiles.png' }).catch(() => {});
  const tiles = page.locator('flow-video-tile');
  console.log('tiles:', await tiles.count().catch(() => -1));
  const tb = await tiles.first().boundingBox({ timeout: 8000 }).catch(() => null);
  console.log('tile box:', JSON.stringify(tb));
  if (tb) await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'C:\\Users\\badiu\\AppData\\Local\\Temp\\opencode\\dl_fullview.png' }).catch(() => {});
  const info = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).map(b => ((b.innerText || '').trim() + '|' + (b.getAttribute('aria-label') || '')).slice(0, 60)).filter(x => x.length > 2);
    return { btns: btns.slice(0, 30), videos: document.querySelectorAll('video').length };
  }).catch(e => ({ err: e.message }));
  console.log(JSON.stringify(info, null, 1).slice(0, 2000));
  await ctx.close();
  process.exit(0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
