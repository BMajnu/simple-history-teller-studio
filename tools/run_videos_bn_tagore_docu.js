// Video-clip fleet for bn_tagore_bangladesh_docu (PRESET_SIMPLE_HISTORY documentary)
// Target: DYNAMIC scenes with shot_XXXX.jpg anchor present, clip missing.
// Motion bodies auto-derived from each scene's visual_prompt (action beats already in prompts).
// Usage: node tools/run_videos_bn_tagore_docu.js [--dry-run]
//   $env:NUM_WORKERS='10'; $env:ONLY_SCENE='7'; node tools/run_videos_bn_tagore_docu.js
// Rules V1-V12 from instructions/04_VIDEO_GENERATION_AUTOMATION.md §6C.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'bn_tagore_bangladesh_docu');
const VISUAL = path.join(PROJ, 'visual_assets');
fs.mkdirSync(VISUAL, { recursive: true });

const VIDEO_CHAIN = ['gemini-omni-1.1-flash', 'veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite'];
const ACCOUNT_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];
const NUM_WORKERS = Math.max(1, Math.min(10, Number(process.env.NUM_WORKERS) || 10));
const ONLY_SCENE = Number(process.env.ONLY_SCENE) || 0;

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const VIDEO_SCENES = project.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO');
const todo = VIDEO_SCENES.filter(s => {
  if (ONLY_SCENE && s.scene_id !== ONLY_SCENE) return false;
  const f = path.join(VISUAL, `clip_shot_${String(s.scene_id).padStart(4, '0')}.mp4`);
  return !fs.existsSync(f) || fs.statSync(f).size < 100000;
});

const DRY = process.argv.includes('--dry-run');
const noAnchor = todo.filter(s => !fs.existsSync(path.join(VISUAL, `shot_${String(s.scene_id).padStart(4, '0')}.jpg`))).length;
console.log(`VIDEO fleet: ${todo.length}/${VIDEO_SCENES.length} clips missing, anchors missing for ${noAnchor} (workers=${NUM_WORKERS}${ONLY_SCENE ? ` probe=${ONLY_SCENE}` : ''})`);
if (DRY || todo.length === 0) { console.log(DRY ? 'dry-run ok' : 'All clips present. Nothing to do.'); process.exit(0); }

const bodyOf = (scene) => (scene.visual_prompt || '').split('--no ')[0].replace(/^Dynamic 2D documentary motion,\s*/i, '').trim();
const MOTION_FORMULA = (b) => `Animate this 2D documentary graphic-novel scene in Simple History style (cel-shaded, clean ink contours, elderly scholar host with white beard and glasses where present): ${b} Smooth character motion with dust, light, water and cloth physics, slow cinematic push-in, 24fps motion, 16:9 widescreen --no text, typography, labels, words, speech bubbles, watermarks, photorealism`;

async function ensureVideoSession(page, slot, model) {
  await page.goto(`https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  try {
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
  for (const [label, want] of [['Aspect ratio', '16:9'], ['Video Resolution', '720p']]) {
    try {
      const ar = page.locator(`mat-select[aria-label="${label}"]`).first();
      if (await ar.count() > 0) {
        await ar.click().catch(() => {});
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option').filter({ hasText: want }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    } catch (e) {}
  }
}

const isQuota = (page) => page.evaluate(() => /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit|requires a paid API key|link an api key|set up billing/i.test(document.body.innerText || '')).catch(() => false);

async function waitForUploadDone(page, ms = 30000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const loading = await page.evaluate(() => /Loading\.\.\./.test(document.body.innerText || '')).catch(() => false);
    if (!loading) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

async function dismissBillingGate(page) {
  try {
    const gate = await page.evaluate(() => /link an api key|set up billing/i.test(document.body.innerText || '')).catch(() => false);
    if (!gate) return true;
    const skip = page.locator('button:has-text("Skip")').first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
      return page.evaluate(() => !/link an api key|set up billing/i.test(document.body.innerText || '')).catch(() => false);
    }
    return false;
  } catch (e) { return false; }
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
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(2000);
      const started = await page.evaluate(() => Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'))).catch(() => false);
      if (started) return 'started';
      if (await isQuota(page)) return 'gated';
    }
  }
  return 'nostart';
}

async function generateClipOnPage(page, scene, workerId, getSlot) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) return { ok: true, skipped: true };
  const anchor = path.join(VISUAL, `shot_${shotNum}.jpg`);
  if (!fs.existsSync(anchor)) return { ok: false, err: 'ANCHOR_MISSING' };
  const fullPrompt = MOTION_FORMULA(bodyOf(scene));
  for (const model of VIDEO_CHAIN) {
    for (let s = 0; s < ACCOUNT_SLOTS.length; s++) {
      const slot = getSlot();
      try {
        await ensureVideoSession(page, slot, model);
        if (await isQuota(page)) continue;
        if (!await dismissBillingGate(page)) continue;
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(anchor).catch(() => {});
          await page.waitForTimeout(2500);
          const ack = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
          if (await ack.isVisible().catch(() => false)) { await ack.click().catch(() => {}); await page.waitForTimeout(500); }
        }
        if (!await waitForUploadDone(page)) return { ok: false, err: 'ANCHOR_UPLOAD_STUCK' };
        const runState = await clickRunVerified(page, fullPrompt);
        if (runState === 'gated') continue;
        if (runState !== 'started') {
          await page.screenshot({ path: path.join(VISUAL, `_debug_clip${shotNum}.png`) }).catch(() => {});
          return { ok: false, err: 'RUN_NOSTART' };
        }
        let videoSrc = null;
        for (let i = 0; i < 100; i++) {
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
          if (await isQuota(page)) continue;
          await page.screenshot({ path: path.join(VISUAL, `_debug_clip${shotNum}.png`) }).catch(() => {});
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
        if (/quota|429/i.test(err.message)) continue;
        return { ok: false, err: err.message.slice(0, 80) };
      }
    }
  }
  return { ok: false, err: 'ALL_SLOTS_MODELS_QUOTA' };
}

async function runWorker(ctx, workerId, jobs) {
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length;
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  let done = 0, fail = 0, skipped = 0;
  try {
    while (jobs.length > 0) {
      const scene = jobs.shift();
      const res = await generateClipOnPage(page, scene, workerId, getSlot);
      if (res.skipped) skipped++;
      else if (res.ok) done++;
      else { fail++; console.log(`[W${workerId}] ✗ Clip ${scene.scene_id}: ${res.err}`); }
      await page.waitForTimeout(1500);
    }
  } finally { await page.close().catch(() => {}); }
  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== TAGORE VIDEO FLEET: ${NUM_WORKERS} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: false, executablePath: CHROME_PATH, args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null });
  const buckets = Array.from({ length: NUM_WORKERS }, () => []);
  todo.forEach((j, i) => buckets[i % NUM_WORKERS].push(j));
  const results = await Promise.all(buckets.map((b, i) => runWorker(ctx, i + 1, b)));
  console.log(JSON.stringify(results, null, 2));
  const present = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final: ${present}/${VIDEO_SCENES.length} clips.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
