// Live headed progress check on the main submit project + screenshots.
const { chromium } = require('playwright-core');
const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: false, executablePath: CHROME_PATH, args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null });
  const page = await ctx.newPage();
  await page.goto('https://flow.google.com/project/f5d31b52-280f-48b5-9855-8dbad6fe2983', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);
  const info = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('flow-video-tile'));
    return {
      tiles: tiles.length,
      ready: tiles.filter(t => { const v = t.querySelector('video'); return v && (v.currentSrc || v.src) && v.readyState >= 2; }).length,
      progress: (document.body.innerText.match(/\d+%/g) || []).slice(0, 8),
    };
  }).catch(e => ({ err: e.message }));
  console.log(JSON.stringify(info));
  await page.screenshot({ path: 'C:\\Users\\badiu\\AppData\\Local\\Temp\\opencode\\live_progress.png' }).catch(() => {});
  await ctx.close();
  process.exit(0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
