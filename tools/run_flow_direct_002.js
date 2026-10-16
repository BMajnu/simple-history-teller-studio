// ============================================================================
// EP02 Flow DIRECT Fleet - canonical direct-mode (agent-OFF) video generator
// Project: projects/simple_itihash_002_first_language (8 remaining DYNAMIC)
// Run:   node tools/run_flow_direct_002.js
// Probe: $env:ONLY_SCENE='23'; node tools/run_flow_direct_002.js
// ----------------------------------------------------------------------------
// RULES (instructions/04 S6E + user direction 2026-10-15):
//  D0 One PROJECT per worker; submit ALL assigned scenes in it one after
//     another (drop frame + paste prompt + submit each), harvest at the end.
//     Never 1-project-per-scene.
//  D1 Agent-OFF: Space-toggle chip until aria-pressed=false (persists per
//     account; enforce idempotently every run).
//  D2 Settings ONCE per profile: verify composer chip reads video-720p-8s-x1;
//     open the model menu ONLY when it is missing/wrong. Defaults: 16:9,
//     Omni 1.1 Flash, 720p, 8s, x1 (~12 credits; more/longer costs more).
//  D3 Start frame: tap শুরু/Start -> picker asks upload/select -> click the
//     dropped file -> প্রম্পটে যোগ করুন/Add to prompt.
//  D4 Submit: paste DETAILED prompt -> arrow. Direct generation, credits at
//     once, NO approval card. Verify tile count +1 before next scene.
//  D5 Harvest (Flow download != AI Studio): click tile -> FULL VIEW opens ->
//     click its download button (or three-dot -> 720p) -> Playwright download
//     event -> save. In-page fetch does NOT work here. Verify ftyp+moov.
//  D6 NO HANGS: every boundingBox carries a 5s timeout; no blind 20-30s fixed
//     waits - poll for the state change instead. Log project URL always.
//  D7 Shared queue in chunks across 3 PROFILES (F8); skip-if-present > 100KB.
//     Probe mode = 1 worker, 1 scene. Log every project URL for adoption.
//  D8 Single-agent; do NOT close Chrome windows mid-run.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');
const PROFILES = [
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3',
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile',
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_2',
];

const MOTION = {
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const DIRECT_FORMULA = (b) => `Animate this image into video, 2D sticky-man cartoon style, OverSimplified, 5px black outlines, flat vector motion: ${b}. Smooth character motion, dust and light physics, 24fps, 16:9, no text, no watermarks`;

// D6: fast trusted click, 5s box timeout max - never hangs 30s on hiddenels
async function tclick(page, txts, timeoutMs = 5000) {
  for (const t of Array.isArray(txts) ? txts : [txts]) {
    const el = page.locator('button').filter({ hasText: t }).first();
    if (!await el.isVisible().catch(() => false)) continue;
    const b = await el.boundingBox({ timeout: timeoutMs }).catch(() => null);
    if (!b) continue;
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForTimeout(2000);
    return t;
  }
  return null;
}
async function waitState(page, fn, label, tries = 40, gap = 2000) {
  for (let i = 0; i < tries; i++) {
    if (await fn().catch(() => false)) return true;
    await page.waitForTimeout(gap);
  }
  console.log(`  ... still waiting: ${label}`);
  return false;
}

const AGENT_CHIP_RE = /^(এজেন্ট মোড|Agent mode|Agent)$/;

async function agentOff(page) { // D1 (bn+en chips, exact match)
  const chip = page.locator('button').filter({ hasText: AGENT_CHIP_RE }).first();
  for (let i = 0; i < 5; i++) {
    const p = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /^(এজেন্ট মোড|Agent mode|Agent)$/.test((b.innerText || '').trim())).map(b => b.getAttribute('aria-pressed'))).catch(() => []);
    if (p.includes('false') || (p.length && !p.includes('true'))) return true;
    if (!await chip.isVisible().catch(() => false)) return true;
    await chip.focus().catch(() => {});
    await page.keyboard.press('Space').catch(() => {});
    await page.waitForTimeout(2000);
  }
  return false;
}

// PROBED 2026-10-15: fresh/EN sessions show an onboarding card
// ("You're generating with Gemini Omni Flash..." + Got it) that covers the
// composer and eats all clicks. Dismiss FIRST, before anything else.
async function dismissOverlays(page) {
  for (let i = 0; i < 4; i++) {
    let hit = false;
    for (const t of ['Got it', 'Acknowledge', 'Accept', 'বুঝেছি', 'ঠিক আছে']) {
      const b = page.locator('button').filter({ hasText: new RegExp(`^${t}$`) }).first();
      if (await b.isVisible().catch(() => false)) {
        const box = await b.boundingBox({ timeout: 5000 }).catch(() => null);
        if (box) { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); hit = true; }
        await page.waitForTimeout(1500);
        break;
      }
    }
    if (!hit) break;
  }
}

// User step 1: CLOSE the agent side panel first - otherwise its own composer
// steals typing/clicks (PROBED 2026-10-15: EN sessions greet with panel open).
async function closeAgentPanel(page) {
  for (let i = 0; i < 3; i++) {
    const header = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('*')).filter(e =>
        /^শিরোনামহীন সেশন$|^Untitled session$/.test((e.innerText || '').trim().split('\n')[0] || ''));
      return els.length > 0;
    }).catch(() => false);
    if (!header) return true;
    // X sits at the panel header top-right (beside the edit icon)
    const x = page.locator('button[aria-label*="Close"], button[aria-label*="বন্ধ"]').last();
    if (await x.isVisible().catch(() => false)) {
      const b = await x.boundingBox({ timeout: 5000 }).catch(() => null);
      if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      await page.waitForTimeout(2500);
    } else return false;
  }
  return false;
}

async function settingsOnce(page) { // D2: verify chip; touch menu ONLY if wrong
  const chipOk = await page.evaluate(() => {
    const t = document.body.innerText || '';
    return /ভিডিও • 720p • 8 সেকেন্ড|Video • 720p • 8/.test(t);
  }).catch(() => false);
  // frame slots (শুরু/শেষ buttons) must exist for D3 - ensure frame mode regardless
  const frameOk = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).some(b => ['শুরু', 'শেষ', 'Start', 'End'].includes((b.innerText || '').trim()))
  ).catch(() => false);
  if (chipOk && frameOk) { console.log('  settings already correct - skipping menu'); return true; }
  console.log('  settings missing/wrong - opening model menu once');
  const nano = page.locator('button').filter({ hasText: 'Nano Banana' }).first();
  const nbox = await nano.boundingBox({ timeout: 5000 }).catch(() => null);
  if (!nbox) return false;
  await page.mouse.click(nbox.x + nbox.width / 2, nbox.y + nbox.height / 2);
  await page.waitForTimeout(2500);
  await tclick(page, ['ভিডিও', 'Video']);
  await tclick(page, ['ফ্রেম', 'Frame']); // frame mode exposes start/end slots
  // set 16:9, Omni, 720p, 8s, x1 only if not already selected
  for (const t of ['16:9', 'Omni 1.1 Flash', '720p', '8 সেকেন্ড', '8 seconds', 'x১', 'x1']) {
    await tclick(page, t);
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(1500);
  return true;
}

async function dropAnchor(page, shotFile) { // verified thumbnail, fast poll
  const baseImgs = await page.evaluate(() => document.querySelectorAll('img').length).catch(() => 0);
  const b64 = fs.readFileSync(path.join(VISUAL, shotFile)).toString('base64');
  for (let d = 0; d < 2; d++) {
    await page.evaluate(async (dd) => {
      const bc = atob(dd.b64); const arr = new Uint8Array(bc.length);
      for (let i = 0; i < bc.length; i++) arr[i] = bc.charCodeAt(i);
      const dt = new DataTransfer(); dt.items.add(new File([arr], dd.name, { type: 'image/jpeg' }));
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      for (const t of ['dragenter', 'dragover', 'drop']) (el || document.body).dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, { b64, name: shotFile });
    const ok = await waitState(page, async () => {
      const st = await page.evaluate((base) => ({
        busy: /(\d+)%/.test(document.body.innerText || ''),
        imgs: document.querySelectorAll('img').length,
      }), baseImgs).catch(() => ({}));
      return !st.busy && (st.imgs || 0) > baseImgs;
    }, `upload ${shotFile}`, 150);
    if (ok) return true;
  }
  return false;
}

async function startLinked(page) { // PROBED: linked start = THUMBNAIL replaces শুরু btn
  return page.evaluate(() => {
    const ed = document.querySelector('div.ProseMirror');
    if (!ed) return false;
    let scope = ed;
    for (let i = 0; i < 5 && scope.parentElement; i++) scope = scope.parentElement;
    const imgs = Array.from(scope.querySelectorAll('img')).filter(im => {
      const r = im.getBoundingClientRect();
      return r.width > 24 && r.height > 24; // real thumbnail, not icon
    });
    return imgs.length > 0;
  }).catch(() => false);
}

async function setStartFrame(page, shotFile, dbgTag) { // D3: START slot -> pick file -> add, VERIFIED
  for (let f = 0; f < 3; f++) {
    if (!await tclick(page, ['শুরু', 'Start'])) break;
    await page.waitForTimeout(2000);
    const row = page.locator('button, div[role="button"]').filter({ hasText: shotFile }).first();
    if (await row.isVisible().catch(() => false)) {
      const b = await row.boundingBox({ timeout: 5000 }).catch(() => null);
      if (b) { await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(2000); }
    }
    await tclick(page, ['প্রম্পটে যোগ করুন', 'Add to prompt']);
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(2000);
      if (await startLinked(page)) return true;
    }
  }
  await page.screenshot({ path: path.join(VISUAL, `_debug_${dbgTag}_noframe.png`) }).catch(() => {});
  return false;
}

async function submitScene(page, promptText) { // D4: paste + arrow, ONE attempt
  const pm = page.locator('div.ProseMirror').first();
  await pm.click().catch(() => {});
  const cur = await pm.textContent().catch(() => '');
  if (!cur || cur.trim().length < 50) {
    await page.keyboard.press('Control+a').catch(() => {});
    await page.keyboard.type(promptText, { delay: 3 }).catch(() => {});
    await page.waitForTimeout(1200);
  }
  const arrow = page.locator('button[aria-label="জেনারেট করা শুরু করুন"], button[aria-label*="Start generating"], button[aria-label*="Submit"], button[aria-label*="Send"]').first();
  const ab = await arrow.boundingBox({ timeout: 8000 }).catch(() => null);
  // single click only - a blind retry double-submits and burns 2x credits
  if (!ab) return false;
  const dis = await arrow.getAttribute('aria-disabled').catch(() => null);
  if (dis === 'true') { // dead button (frame unlinked?) - evidence, don't loop
    await page.screenshot({ path: path.join(VISUAL, '_debug_arrow_disabled.png') }).catch(() => {});
    return false;
  }
  await page.mouse.click(ab.x + ab.width / 2, ab.y + ab.height / 2);
  return waitState(page, async () => {
    const ed = document.querySelector('div.ProseMirror');
    return !ed || (ed.textContent || '').trim().length < 50;
  }, 'submit->composer empty', 90);
}

async function downloadTile(page, projectUrl, tileIdx, id) { // D5: tile -> editor -> download icon
  const shotNum = String(id).padStart(4, '0');
  const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
  await page.goto(projectUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(6000);
  const tiles = page.locator('flow-video-tile');
  if (await tiles.count().catch(() => 0) <= tileIdx) return { id, ok: false, err: 'NO_TILE' };
  const tb = await tiles.nth(tileIdx).boundingBox({ timeout: 8000 }).catch(() => null);
  if (!tb) return { id, ok: false, err: 'TILE_HIDDEN' };
  await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
  // editor view: download icon in top bar (bn/en aria), else three-dot -> 720p
  const dlBtn = page.locator('button[aria-label*="ডাউনলোড"], button[aria-label*="Download"]').first();
  const dlOk = await waitState(page, async () =>
    await dlBtn.isVisible().catch(() => false), 'editor download icon', 30);
  let download = null;
  if (dlOk) {
    const bb = await dlBtn.boundingBox({ timeout: 8000 }).catch(() => null);
    if (bb) {
      // icon may download directly OR open a menu (720p আসল সাইজ / 1080p)
      [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }).catch(() => null),
        page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2),
      ]);
      if (!download) {
        await page.waitForTimeout(2500);
        const res720 = page.locator('button, [role="menuitem"]').filter({ hasText: '720p' }).first();
        if (await res720.isVisible().catch(() => false)) {
          const rb = await res720.boundingBox({ timeout: 8000 }).catch(() => null);
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
  if (!download) { // fallback: three-dot -> resolution
    await tclick(page, 'more_vert');
    for (const r of ['720p', '1080p']) {
      const rb = page.locator('button').filter({ hasText: r }).first();
      if (await rb.isVisible().catch(() => false)) {
        const box = await rb.boundingBox({ timeout: 5000 }).catch(() => null);
        if (box) {
          [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 180000 }).catch(() => null),
            page.mouse.click(box.x + box.width / 2, box.y + box.height / 2),
          ]);
          if (download) break;
        }
      }
    }
  }
  if (!download) return { id, ok: false, err: 'NO_DOWNLOAD_EVENT' };
  const tmp = path.join(VISUAL, `_flowdl_${shotNum}.mp4`);
  await download.saveAs(tmp).catch(() => null);
  if (!fs.existsSync(tmp) || fs.statSync(tmp).size < 100000) return { id, ok: false, err: 'DL_TOO_SMALL' };
  const buf = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  if (!(buf.slice(4, 12).toString() === 'ftypmp42' || buf.includes(Buffer.from('moov')))) return { id, ok: false, err: 'BAD_MP4' };
  fs.writeFileSync(outPath, buf);
  console.log(`  ✓ Clip ${id} (${(buf.length / 1048576).toFixed(2)} MB)`);
  return { id, ok: true };
}

async function harvestAll(page, projectUrl, ids) { // tiles render in submit order
  // wait until all submitted tiles show ready videos
  for (let k = 0; k < 80; k++) {
    await page.waitForTimeout(30000);
    const n = await page.evaluate(() => {
      const tiles = document.querySelectorAll('flow-video-tile');
      let ready = 0;
      tiles.forEach(t => { const v = t.querySelector('video'); if (v && (v.currentSrc || v.src) && v.readyState >= 2) ready++; });
      return { tiles: tiles.length, ready };
    }).catch(() => ({}));
    if (k % 4 === 0) console.log(`  ... tiles: ${n.tiles || 0}, ready videos: ${n.ready || 0}/${ids.length}`);
    if ((n.tiles || 0) >= ids.length && (n.ready || 0) >= ids.length) break;
  }
  const out = [];
  for (let i = 0; i < ids.length; i++) out.push(await downloadTile(page, projectUrl, i, ids[i]));
  return out;
}

async function runProject(profileDir, workerId, ids) { // D0: ONE project, submit all, harvest
  let ctx = null;
  try {
    ctx = await chromium.launchPersistentContext(profileDir, {
      headless: false, executablePath: CHROME_PATH,
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null,
    });
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    if (!await tclick(page, ['নতুন প্রোজেক্ট', 'New project'])) throw new Error('NO_NEW_PROJECT');
    await page.waitForTimeout(10000);
    console.log(`[D${workerId}] project: ${page.url()}`); // D7: always log for adoption
    const projectUrl = page.url();
    await dismissOverlays(page); // onboarding card eats clicks if present
    await closeAgentPanel(page); // user step 1: panel steals composer if open
    if (!await agentOff(page)) throw new Error('AGENT_STUCK_ON');
    await dismissOverlays(page); // card can appear after agent toggle too
    await settingsOnce(page); // D2: once, verified
    const submitted = [];
    for (const id of ids) {
      const shot = `shot_${String(id).padStart(4, '0')}.jpg`;
      console.log(`[D${workerId}] scene ${id}: frame...`);
      if (!await dropAnchor(page, shot)) throw new Error(`UPLOAD_STUCK_${id}`);
      if (!await setStartFrame(page, shot, `direct${id}`)) throw new Error(`NOFRAME_${id}`);
      const body = MOTION[id];
      if (!body) throw new Error('NO_MOTION_PROMPT');
      console.log(`[D${workerId}] scene ${id}: submit...`);
      if (!await submitScene(page, DIRECT_FORMULA(body))) throw new Error(`SUBMIT_NOSHOW_${id}`);
      submitted.push(id);
    }
    const res = await harvestAll(page, projectUrl, submitted);
    await ctx.close().catch(() => {});
    return { workerId, done: res.filter(r => r.ok).length, fail: res.filter(r => !r.ok).length, detail: res };
  } catch (err) {
    try { if (ctx) await ctx.close(); } catch (_) {}
    if (/existing browser session|profile.*in use/i.test(err.message)) return { workerId, done: 0, fail: ids.length, err: 'PROFILE_BUSY' };
    return { workerId, done: 0, fail: ids.length, err: err.message.slice(0, 80) };
  }
}

async function main() {
  const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
  const only = Number(process.env.ONLY_SCENE) || 0;
  const missing = project.scenes
    .filter(s => s.type === 'DYNAMIC_AI_VIDEO')
    .map(s => s.scene_id)
    .filter(id => {
      if (only && id !== only) return false;
      const f = path.join(VISUAL, `clip_shot_${String(id).padStart(4, '0')}.mp4`);
      return !fs.existsSync(f) || fs.statSync(f).size < 100000;
    });
  console.log(`=== EP02 FLOW-DIRECT FLEET: ${only ? 1 : PROFILES.length} projects, ${missing.length} clips ===`);
  if (missing.length === 0) { console.log('All clips present. Nothing to do.'); process.exit(0); }
  // chunk queue across workers (D7)
  const jobs = only ? [[PROFILES[0], 1, missing]]
    : PROFILES.map((p, i) => [p, i + 1, missing.filter((_, k) => k % PROFILES.length === i)]);
  const results = await Promise.all(jobs.map(([prof, wid, chunk]) => runProject(prof, wid, chunk)));
  console.log(JSON.stringify(results.map(({ detail, ...r }) => r), null, 2));
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final: ${totalPresent}/16 clips.`);
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
}
main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one direct-mode fleet file; project-batch over scene-projects
