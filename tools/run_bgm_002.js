// ============================================================================
// EP02 BGM - canonical Lyria 3.5 custom soundtrack generator
// Project: projects/simple_itihash_002_first_language -> audio/bgm.mp3
// Run:   node tools/run_bgm_002.js
// ----------------------------------------------------------------------------
// RULES (instructions/07_BGM_AND_SOUNDTRACK_CURATION.md):
//  B1 Primary engine Lyria 3.5 via /u/N/new_music (PROBED: /app/ 404s).
//  B2 Timestamp-arc prompt: prehistory drums -> Egypt ney/oud -> medieval lute
//     -> Mughal tabla/flute -> modern lab strings. Instrumental, NO vocals.
//  B3 Skip-if-present: bgm.mp3 > 500KB never regenerated.
//  B4 Master: loop to full runtime (~3170s), 48kHz stereo 192k MP3, -18dB RMS.
//  B5 Single-agent; do NOT close Chrome mid-run.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const OUT = path.join(PROJ, 'audio', 'bgm.mp3');
const RAW = path.join(PROJ, 'audio', '_bgm_lyria_raw.mp3');
const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];

const BGM_PROMPT = `[0:00 - 0:40] Intro, intensity 3/10: primal hollow log drums and low bamboo flute over desert wind drone, mysterious ancient curiosity. No vocals. Instrumental.
[0:40 - 1:20] Build, intensity 6/10: Middle Eastern ney reed flute and oud join over frame-drum rhythm, regal enigmatic desert atmosphere. No vocals. Instrumental.
[1:20 - 2:00] Development, intensity 5/10: medieval lute and chamber strings, curious royal court mood. No vocals. Instrumental.
[2:00 - 2:40] Variation, intensity 6/10: Mughal tabla with bansuri flute over warm strings, majestic garden court. No vocals. Instrumental.
[2:40 - 3:20] Outro, intensity 3/10: modern soft lab strings resolving to calm, reverent fade with decaying echoes. No vocals. Instrumental.`;

function ff(args) {
  const r = spawnSync('ffmpeg', args, { stdio: 'pipe' });
  if (r.status !== 0) throw new Error('ffmpeg: ' + (r.stderr || '').toString().slice(0, 200));
}

(async () => {
  if (fs.existsSync(OUT) && fs.statSync(OUT).size > 500000) {
    console.log('bgm.mp3 present, nothing to do.');
    process.exit(0);
  }
  const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
  const totalDur = Math.ceil(project.total_duration_seconds || 3170);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null,
  });
  const page = await ctx.newPage();
  let ok = false;
  for (const slot of SLOTS) {
    try {
      await page.goto(`https://aistudio.google.com/u/${slot}/new_music?model=lyria-3.5`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(9000);
      // open composer via Cinematic score template if no textarea yet
      let ta = page.locator('textarea').first();
      if (await ta.count() === 0) {
        const card = page.locator('button, div').filter({ hasText: 'Cinematic score' }).first();
        const box = await card.boundingBox({ timeout: 8000 }).catch(() => null);
        if (box) { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(8000); }
        ta = page.locator('textarea').first();
      }
      await ta.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
      const taN = await page.locator('textarea').count().catch(() => -1);
      if (taN === 0) { console.log(`slot ${slot}: no textarea`); continue; }
      await ta.fill(BGM_PROMPT);
      await page.waitForTimeout(1000);
      // baseline: ignore stale tracks already in the player from prior sessions
      const baseSrcs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('audio')).map(a => a.currentSrc || a.src || '')
      ).catch(() => []);
      const gen = page.locator('button').filter({ hasText: 'Generate' }).first();
      await gen.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(800);
      const gb = await gen.boundingBox({ timeout: 8000 }).catch(() => null);
      if (!gb) { console.log(`slot ${slot}: no Generate button`); continue; }
      await page.mouse.click(gb.x + gb.width / 2, gb.y + gb.height / 2);
      // wait for a NEW audio (different src) with real duration
      let dur = 0;
      for (let i = 0; i < 90; i++) {
        await page.waitForTimeout(2000);
        const st = await page.evaluate((base) => {
          const all = Array.from(document.querySelectorAll('audio'));
          const fresh = all.filter(a => !(base.includes(a.currentSrc || a.src || '')) && (a.duration || 0) > 10);
          const t = document.body.innerText || '';
          return {
            dur: fresh.length ? fresh[0].duration : 0,
            quota: /exceeded quota|Upgrade to unlock|try again later|daily limit/i.test(t),
          };
        }, baseSrcs).catch(() => ({}));
        if (st.quota) break;
        if (st.dur > 10) { dur = st.dur; break; }
      }
      if (!(dur > 10)) { console.log(`slot ${slot}: no fresh audio (dur=${dur})`); continue; }
      // download icon in player bar
      const dlBtn = page.locator('button[aria-label*="ownload" i], button[aria-label*="Download" i]').first();
      await dlBtn.scrollIntoViewIfNeeded().catch(() => {});
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 120000 }).catch(() => null),
        (async () => { const b = await dlBtn.boundingBox({ timeout: 8000 }).catch(() => null); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); })(),
      ]);
      if (!download) { console.log(`slot ${slot}: no download event`); continue; }
      await download.saveAs(RAW).catch(() => null);
      if (fs.existsSync(RAW) && fs.statSync(RAW).size > 200000) { ok = true; break; }
    } catch (e) { console.log(`slot ${slot}: ${e.message.slice(0, 60)}`); }
  }
  await ctx.close().catch(() => {});
  if (!ok) { console.error('BGM generation failed on all slots'); process.exit(1); }
  // B4: loop to full runtime + normalize to -18dB RMS, 48kHz stereo 192k
  console.log('mastering...');
  ff(['-hide_banner', '-y', '-stream_loop', '-1', '-i', RAW,
    '-t', String(totalDur),
    '-filter:a', 'loudnorm=I=-18:TP=-2:LRA=11,aresample=48000,aformat=channel_layouts=stereo',
    '-c:a', 'libmp3lame', '-b:a', '192k', OUT]);
  fs.unlinkSync(RAW);
  console.log('SAVED', OUT, fs.statSync(OUT).size, 'bytes');
  process.exit(0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one BGM file per episode; Lyria master looped to runtime
