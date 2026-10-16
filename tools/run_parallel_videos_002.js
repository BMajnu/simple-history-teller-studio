// ============================================================================
// EP02 Video Fleet — canonical 10-worker parallel AI-video generator
// Project: projects/simple_itihash_002_first_language (16 DYNAMIC_AI_VIDEO)
// Run:   node tools/run_parallel_videos_002.js
// Probe: $env:ONLY_SCENE='12'; node tools/run_parallel_videos_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (from instructions/04_VIDEO_GENERATION_AUTOMATION.md):
//  V1 Engine hierarchy: gemini-omni-1.1-flash -> veo-3.1-fast-generate-preview
//     -> veo-3.1-generate-preview -> veo-3.1-lite (per-clip fallback on quota).
//     Google Flow is the secondary fallback (manual, not in this script).
//  V2 Thinking Level MUST be High on every session.
//  V3 Config: Aspect 16:9, Duration 5s/10s, Resolution 720p+, 24fps motion.
//  V4 Style: sticky-man formula (OverSimplified 2D, 5px outlines, flat motion);
//     host clips feature the beard+glasses scholar; anchor image attached.
//  V5 Anchor: ALWAYS attach the scene's own shot_XXXX.jpg (Phase-2 output).
//  V6 Parallelism: 10 workers x 8 slots (u/0-u/7), slot index ALWAYS modulo
//     (never u/undefined -> 404). Shared queue, each worker owns its page.
//  V7 Skip-if-present: clip_shot_XXXX.mp4 > 100KB never regenerated.
//  V8 QUOTA rotation: next slot, SAME clip retried; clips never dropped.
//  V9 Failure evidence: _debug_clipXXXX.png screenshot on failure.
// V10 Single-agent execution; do NOT close the Chrome window mid-run.
// V11 Real AI video ONLY — no local pan/zoom re-exports (04 §2 mandate).
// V12 Upload-then-Run: wait until anchor "Loading..." finishes, dismiss the
//     info banner, and VERIFY generation started (Stop button) with up to 3
//     fill+click retries — a missed click burns NO quota but causes timeouts.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');

// V1: engine fallback chain
const VIDEO_CHAIN = ['gemini-omni-1.1-flash', 'veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite'];

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const VIDEO_SCENES = project.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO');

// V4-DETAILED: every motion body directs exact character action beats +
// camera + secondary physics (dust/flame/water/cloth). Bodies wrapped by MOTION_FORMULA.
const MOTION = {
1:'Time Chronicler stick-man scholar with white beard and glasses stepping forward toward camera in his cosmic library, raising his wooden torch high as its flame flares, old book pages fluttering in his other hand, galaxy light swirling through tall windows, slow camera push-in',
6:'stick-man caveman in close-up with heaving chest opening his mouth wide at dawn, glowing golden sound waves expanding outward ring by ring, birds scattering from a tree, morning light rising behind him',
12:'stick-man caveman waving both arms up and sideways in frantic silent mime, his companion leaning in squinting then swatting a fly with a stick, dry bushes shaking around them',
18:'grand parisian lecture hall where stick-man gentlemen in top hats rise from their seats shouting and shaking papers, president banging a huge gavel, chandelier swaying overhead, sheets of paper fluttering down',
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
27:'stick-man cavemen jumping and slapping a mid-air high-five on a hilltop, dust bursting under their feet, the boulder wobbling slightly behind them, bright sun flare',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
47:'emperor akbar stick-man with emerald turban walking steadily along his red sandstone courtyard at sunrise, robe flowing behind him, pigeons bursting upward, curtains billowing inside the arches',
55:'a golden helix of light rotating slowly above a stick-man london family holding hands and swaying, clock hands turning on a tower behind them, night clouds drifting past the moon',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
63:'san stick-man hunters with bows walking single file through kalahari desert at sunrise, red sand swirling at their feet, dry grass bending in the wind, sun climbing higher',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const MOTION_FORMULA = (b) => `Animate this 2D sticky-man cartoon scene in OverSimplified style with 5px black outlines and flat vector motion: ${b}. Smooth character motion, dust and light physics, 24fps motion, 16:9 widescreen --no text, typography, labels, words, speech bubbles, watermarks, sticker, die-cut, photorealism`;

// V6: all 8 authenticated slots cycle across workers (u/0 .. u/7).
const ACCOUNT_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];
const NUM_WORKERS = 10;

async function ensureVideoSession(page, slot, model) {
  // PROBED 2026-10-14: /app/prompts/... 404s; /prompts/new_chat is canonical
  // (veo models auto-redirect to /prompts/new_video). Never use /app/ or /gen-media.
  const url = `https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  // PROBED 2026-10-15: ?model= can silently fall back to a TEXT model
  // (drawer showed Gemini 3.8 Flash instead of omni) - verify, else gated.
  const drawerModel = await page.evaluate(() => {
    const t = document.body.innerText || '';
    const m = t.match(/Gemini (Omni[\w .]*|3\.8 Flash|Veo[\w .]*)/i);
    return m ? m[0] : '';
  }).catch(() => '');
  const want = model.includes('omni') ? /omni/i : /veo/i;
  if (!want.test(drawerModel)) {
    const err = new Error('MODEL_MISMATCH:' + (drawerModel || 'unknown'));
    err.code = 'MODEL_MISMATCH';
    throw err;
  }
  try { // V2: Thinking High
    const sel = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await sel.count() > 0) {
      const cur = await sel.innerText().catch(() => '');
      if (!/high/i.test(cur)) {
        await sel.click().catch(() => {});
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option').filter({ hasText: 'High' }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } catch (e) {}
  try { // V3: 16:9
    const ar = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await ar.count() > 0) {
      await ar.click().catch(() => {});
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option').filter({ hasText: '16:9' }).first();
      if (await opt.count() > 0) await opt.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (e) {}
  try { // V3: 720p
    const rs = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await rs.count() > 0) {
      await rs.click().catch(() => {});
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option').filter({ hasText: '720p' }).first();
      if (await opt.count() > 0) await opt.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (e) {}
}

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit|requires a paid API key|link an api key|set up billing/i.test(document.body.innerText || '')
  ).catch(() => false);
}

// PROBED 2026-10-14: the composer re-renders while the anchor uploads
// ("shot_XXXX.jpg Loading...") and omni tabs remount on instability. Clicking
// Run before upload finishes (or on a stale handle after remount) silently
// starts NOTHING — no quota burns, but the poll loop times out. So: wait for
// upload, dismiss the info banner, and VERIFY Run actually started (Stop btn).
async function waitForUploadDone(page, ms = 30000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const loading = await page.evaluate(() =>
      /Loading\.\.\./.test(document.body.innerText || '')
    ).catch(() => false);
    if (!loading) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

async function dismissInfoBanner(page) {
  try {
    const x = page.locator('div:has-text("Feature Availability")').locator('button').first();
    if (await x.isVisible().catch(() => false)) await x.click({ force: true }).catch(() => {});
  } catch (e) {}
}

async function clickRunVerified(page, fullPrompt, tries = 3) {
  for (let t = 0; t < tries; t++) {
    const ta = page.locator('textarea.textarea, textarea, div[contenteditable="true"][role="textbox"]').first();
    await ta.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await ta.fill(fullPrompt).catch(() => {});
    await page.waitForTimeout(1000);
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    const dis = await runBtn.getAttribute('aria-disabled').catch(() => null);
    if (dis === 'true' || await isQuota(page)) return 'gated';
    await runBtn.click({ force: true }).catch(() => {});
    for (let i = 0; i < 10; i++) { // ~20s: did generation actually start?
      await page.waitForTimeout(2000);
      const started = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'))
      ).catch(() => false);
      if (started) return 'started';
      if (await isQuota(page)) return 'gated';
    }
  }
  return 'nostart';
}

// V8a: billing-gate modal ("Link an API key" / "Set up billing") blocks Run.
// Click Skip when offered; true when the gate is gone, false when still gated.
async function dismissBillingGate(page) {
  try {
    const gate = await page.evaluate(() =>
      /link an api key|set up billing/i.test(document.body.innerText || '')
    ).catch(() => false);
    if (!gate) return true;
    const skip = page.locator('button:has-text("Skip")').first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
      return page.evaluate(() =>
        !/link an api key|set up billing/i.test(document.body.innerText || '')
      ).catch(() => false);
    }
    return false;
  } catch (e) { return false; }
}

async function generateClipOnPage(page, scene, workerId, getSlot) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) return { ok: true, skipped: true }; // V7
  const anchor = path.join(VISUAL, `shot_${shotNum}.jpg`); // V5
  if (!fs.existsSync(anchor)) return { ok: false, err: 'ANCHOR_MISSING' };
  const body = MOTION[scene.scene_id];
  if (!body) return { ok: false, err: 'NO_MOTION_PROMPT' };
  const fullPrompt = MOTION_FORMULA(body);
  // session learning: if omni is wall-to-wall gated, skip it for rest of run
  const chain = global.__omniDead ? VIDEO_CHAIN.slice(1) : VIDEO_CHAIN;

  for (const model of chain) { // V1+V8
    for (let s = 0; s < ACCOUNT_SLOTS.length; s++) {
      const slot = getSlot();
      try {
        await ensureVideoSession(page, slot, model);
        const quotaHit = await isQuota(page);
        if (quotaHit && model === 'gemini-omni-1.1-flash') {
          global.__omniQuota = (global.__omniQuota || 0) + 1;
          if (global.__omniQuota >= 3) global.__omniDead = true;
        }
        if (quotaHit) continue;
        if (!await dismissBillingGate(page)) continue; // V8a: still gated -> next slot
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(anchor).catch(() => {});
          await page.waitForTimeout(2500);
          const ack = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
          if (await ack.isVisible().catch(() => false)) { await ack.click().catch(() => {}); await page.waitForTimeout(500); }
        }
        await dismissInfoBanner(page);
        if (!await waitForUploadDone(page)) return { ok: false, err: 'ANCHOR_UPLOAD_STUCK' };
        const runState = await clickRunVerified(page, fullPrompt);
        if (runState === 'gated') continue; // V8: quota/billing appeared -> next slot
        if (runState !== 'started') {
          await page.screenshot({ path: path.join(VISUAL, `_debug_clip${shotNum}.png`) }).catch(() => {}); // V9
          return { ok: false, err: 'RUN_NOSTART' };
        }
        let videoSrc = null;
        for (let i = 0; i < 100; i++) { // up to ~5min
          await page.waitForTimeout(3000);
          if (await isQuota(page)) break;
          const st = await page.evaluate(() => {
            const vid = document.querySelector('video');
            const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
            const err = document.querySelector('.error-message, mat-error, [role="alert"]');
            return { hasVid: !!vid && !!vid.src, src: vid ? vid.src : null, hasStop: stop, err: err ? err.innerText : null };
          }).catch(() => ({}));
          if (st.err) break;
          if (st.hasVid && !st.hasStop) { videoSrc = st.src; break; }
          if (!st.hasStop && !st.hasVid && i >= 8) break;
        }
        if (!videoSrc) {
          if (await isQuota(page)) continue; // V8
          await page.screenshot({ path: path.join(VISUAL, `_debug_clip${shotNum}.png`) }).catch(() => {}); // V9
          return { ok: false, err: 'TIMEOUT_NO_VIDEO' };
        }
        const vData = await page.evaluate(async (src) => {
          try {
            const res = await fetch(src);
            const blob = await res.blob();
            const ab = await blob.arrayBuffer();
            const bytes = new Uint8Array(ab);
            let bin = '';
            for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
            return { b64: btoa(bin), size: bytes.length };
          } catch (e) { return { err: e.message }; }
        }, videoSrc);
        if (!vData || vData.err || !vData.b64) return { ok: false, err: (vData && vData.err) || 'EXTRACT_FAIL' };
        fs.writeFileSync(outPath, Buffer.from(vData.b64, 'base64'));
        console.log(`[W${workerId}/u${slot}/${model}] ✓ Clip ${scene.scene_id} (${(vData.size / 1048576).toFixed(2)} MB)`);
        return { ok: true, size: vData.size };
      } catch (err) {
        if (/quota|429|MODEL_MISMATCH/i.test(err.message)) continue; // V8
        return { ok: false, err: err.message.slice(0, 80) };
      }
    }
  }
  return { ok: false, err: 'ALL_SLOTS_MODELS_QUOTA' };
}

async function runWorker(ctx, workerId, queue) {
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length; // V6
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  let done = 0, fail = 0, skipped = 0;
  try {
    while (queue.length > 0) {
      const scene = queue.shift();
      const res = await generateClipOnPage(page, scene, workerId, getSlot);
      if (res.skipped) skipped++;
      else if (res.ok) done++;
      else { fail++; console.log(`[W${workerId}] ✗ Clip ${scene.scene_id}: ${res.err}`); }
      await page.waitForTimeout(1500);
    }
  } finally {
    await page.close().catch(() => {});
  }
  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== EP02 VIDEO FLEET: ${NUM_WORKERS} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  const only = Number(process.env.ONLY_SCENE) || 0;
  const todo = VIDEO_SCENES.filter(s => {
    if (only && s.scene_id !== only) return false;
    const f = path.join(VISUAL, `clip_shot_${String(s.scene_id).padStart(4, '0')}.mp4`);
    return !fs.existsSync(f) || fs.statSync(f).size < 100000;
  });
  console.log(`Remaining: ${todo.length}/${VIDEO_SCENES.length} clips`);
  if (todo.length === 0) { console.log('All clips present. Nothing to do.'); process.exit(0); }
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const results = await Promise.all(
    Array.from({ length: NUM_WORKERS }, (_, i) => runWorker(ctx, i + 1, todo))
  );
  console.log(JSON.stringify(results, null, 2));
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final: ${totalPresent}/${VIDEO_SCENES.length} clips.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one fleet file per episode; anchor attach + shared queue
