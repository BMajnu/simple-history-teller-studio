// ============================================================================
// EP02 Flow HARVEST v3 — downloads ship ZIPs: save, expand, pick best mp4
// Run:   node tools/harvest_flow_002.js   (scenes 18 + 84)
// ============================================================================
const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const VISUAL = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'visual_assets');
const AUDIT = path.join(VISUAL, '_audit');
const TMP = 'C:\\Users\\badiu\\AppData\\Local\\Temp\\opencode\\harvest_002';
const STATE = JSON.parse(fs.readFileSync(path.join(VISUAL, '_flow_submitted.json'), 'utf8'));

const JOBS = [18, 84].map(id => ({ id, url: STATE[String(id)].project }))
  .filter(j => !(Number(process.argv[2]) || Number(process.env.ONLY_SCENE) || 0) || Number(process.argv[2]) === j.id || Number(process.env.ONLY_SCENE) === j.id);
const POLL_MS = 45000;
const MAX_POLLS = 70;

function probeDur(file) {
  try {
    return +JSON.parse(execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`,
      { stdio: 'pipe', encoding: 'utf8' }).trim());
  } catch (e) { return 0; }
}

async function dismissOverlays(page) {
  for (const label of ['Not now', 'Skip', 'Got it', 'OK']) {
    const b = page.locator(`button:has-text("${label}")`).first();
    if (await b.count() > 0) await b.click({ timeout: 1200 }).catch(() => {});
  }
}

async function pageState(page) {
  return page.evaluate(() => {
    const txt = document.body.innerText || '';
    const busy = /generating|animating|processing|starting|thinking/i.test(txt);
    const targets = Array.from(document.querySelectorAll('button, [role="menuitem"], [role="button"], a'))
      .filter(b => /download|ডাউনলোড/i.test((b.getAttribute('aria-label') || '') + (b.textContent || '')))
      .length;
    return { busy, targets };
  });
}

// expand zip -> all video-ish files, probe, return biggest valid path
function bestVideoFromZip(zipPath) {
  const dest = path.join(TMP, 'x' + Date.now());
  fs.mkdirSync(dest, { recursive: true });
  execSync(`tar -xf "${zipPath}" -C "${dest}"`, { stdio: 'pipe' });
  const all = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (/\.(mp4|webm|m4v|mov)$/i.test(e.name)) all.push(f);
    }
  };
  walk(dest);
  const cands = [];
  for (const f of all) {
    const d = probeDur(f);
    if (d > 4 && d < 40) cands.push({ f, d });
  }
  cands.sort((a, b) => fs.statSync(b.f).size - fs.statSync(a.f).size);
  return cands[0] ? { file: cands[0].f, dur: cands[0].d, dir: dest } : { file: null, dir: dest };
}

(async () => {
  console.log('=== EP02 FLOW HARVEST v3 ===');
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null,
  });
  const page = await ctx.newPage();
  const results = [];

  for (const job of JOBS) {
    let done = false;
    for (let p = 1; p <= MAX_POLLS && !done; p++) {
      try {
        await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(8000);
        await dismissOverlays(page);
        const st = await pageState(page);
        console.log(`[S${job.id}] poll ${p}: busy=${st.busy} dlBtns=${st.targets}`);
        if (st.busy || st.targets === 0) { await page.waitForTimeout(POLL_MS); continue; }

        const targets = await page.evaluateHandle(() => {
          return Array.from(document.querySelectorAll('button, [role="menuitem"], [role="button"], a'))
            .filter(b => /download|ডাউনলোড/i.test((b.getAttribute('aria-label') || '') + (b.textContent || '')));
        });
        const handles = await targets.getProperties();
        for (const [key, handle] of handles) {
          const el = handle.asElement();
          const box = await el.boundingBox({ timeout: 5000 }).catch(() => null);
          if (!box) continue;
          const stamp = Date.now();
          const rawFile = path.join(TMP, `s${job.id}_${stamp}_${key}.zip`);
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 90000 }).catch(() => null),
            page.mouse.click(box.x + box.width / 2, box.y + box.height / 2),
          ]);
          if (!download) { console.log(`[S${job.id}] btn${key}: no download event`); continue; }
          const sugg = download.suggestedFilename();
          await download.saveAs(rawFile);
          const size = fs.statSync(rawFile).size;
          console.log(`[S${job.id}] btn${key}: "${sugg}" ${size}B`);
          const best = bestVideoFromZip(rawFile);
          if (!best.file) { console.log(`[S${job.id}] btn${key}: no valid video inside zip`); continue; }
          // frames for eyeball verify
          execSync(`ffmpeg -hide_banner -loglevel error -y -i "${best.file}" -vf "fps=${(2 / best.dur).toFixed(3)},scale=384:-2" "${AUDIT}\\harvest_s${job.id}_f%02d.jpg"`);
          const num = String(job.id).padStart(4, '0');
          const finalClip = path.join(VISUAL, `clip_shot_${num}.mp4`);
          const hist = path.join(VISUAL, '_history');
          fs.mkdirSync(hist, { recursive: true });
          if (fs.existsSync(finalClip)) fs.renameSync(finalClip, path.join(hist, `old_clip_${num}_${stamp}.mp4`));
          fs.copyFileSync(best.file, finalClip);
          fs.unlinkSync(best.file);
          console.log(`[S${job.id}] ✓ REPLACED clip_shot_${num}.mp4 (${(fs.statSync(finalClip).size / 1048576).toFixed(1)}MB, ${best.dur.toFixed(1)}s)`);
          results.push({ id: job.id, ok: true, src: sugg, dur: best.dur });
          done = true;
          break;
        }
        await page.waitForTimeout(4000);
      } catch (e) {
        console.log(`[S${job.id}] poll ${p} error: ${e.message.slice(0, 110)}`);
        await page.waitForTimeout(POLL_MS);
      }
    }
    if (!done) console.log(`[S${job.id}] ✗ NOT DOWNLOADED`);
  }
  await ctx.close().catch(() => {});
  console.log('HARVEST RESULTS:', JSON.stringify(results));
  process.exit(results.length === JOBS.length ? 0 : 1);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: zip-first flow; probe-guard keeps garbage out of visual_assets
