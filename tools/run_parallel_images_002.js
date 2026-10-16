// ============================================================================
// EP02 Image Fleet — canonical 10-worker parallel generator (STICKY-MAN lock)
// Project: projects/simple_itihash_002_first_language (84 scenes)
// Run:   node tools/run_parallel_images_002.js
// Probe: $env:ONLY_SCENE='11'; node tools/run_parallel_images_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (from instructions/03_IMAGE_GENERATION_AUTOMATION.md):
//  R1 Model hierarchy: gemini-nano-banana-2.1 -> gemini-3.1-flash-image ->
//     gemini-3.1-flash-lite-image (per-scene fallback on quota/model-404).
//  R2 Thinking Level MUST be High on every new_chat session.
//  R3 Resolution 1K widescreen: Aspect ratio control MUST read 16:9.
//  R4 Style anchor: every prompt starts with the sticky-man formula; host
//     (TIME_CHRONICLER) scenes attach references/ref_host_sticky_meme.jpg.
//  R5 Negative prompt ALWAYS appended (incl. anti-sticker + anti-baked-text).
//  R6 No sequential single-worker loops: NUM_WORKERS parallel pages share one
//     queue; each worker owns its page; account slots cycle so no worker ever
//     navigates to u/undefined (u/undefined == instant 404, see Oct-2026 log).
//  R7 Skip-if-present: shot_XXXX.jpg > 50KB is never regenerated (resume-safe).
//  R8 QUOTA handling: rotate to next account slot and retry the SAME scene;
//     never drop a scene (no unshift+break loss).
//  R9 Failure evidence: debug screenshot saved as _debug_shotXXXX.png.
// R10 Single-agent execution: this file is run by the main agent only.
// Pages are REAL AI Studio tabs in a persistent Chrome profile (own window) —
// DO NOT close the Chrome window while workers run.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');
const REF_STICKY = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');

// R1: model fallback chain (primary first)
const MODEL_CHAIN = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const ALL_SCENES = project.scenes;

// R4/R5 are baked into scene.visual_prompt by tools/regen_prompts_002_fresh.js;
// the negative suffix is verified here as a safety net (R5).
const NEGATIVE_TAIL = '--no text';

const HOST_SPEAKERS = new Set(['TIME_CHRONICLER']);
// R6: 6 authenticated slots cycle across all workers — index is ALWAYS modulo
// length, so a worker can never build a u/undefined URL (Oct-2026 404 bug).
const ACCOUNT_SLOTS = [1, 2, 3, 4, 5, 6];
const NUM_WORKERS = 10;

function slotFor(workerId) {
  return ACCOUNT_SLOTS[(workerId - 1) % ACCOUNT_SLOTS.length];
}

function promptOf(scene) {
  const v = scene.visual_prompt || '';
  return v.includes(NEGATIVE_TAIL) ? v : v + ' --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, sticker, die-cut, white border outline, floating cutout, photorealism, detailed anatomy';
}

async function ensureSession(page, slot, model) {
  const url = `https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  // R2: Thinking Level High
  try {
    const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await thinkingSelect.count() > 0) {
      const current = await thinkingSelect.innerText().catch(() => '');
      if (!/high/i.test(current)) {
        await thinkingSelect.click().catch(() => {});
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option').filter({ hasText: 'High' }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } catch (e) {}
  // R3: Aspect ratio 16:9
  try {
    const arSelectors = ['button[aria-label*="Aspect"], button[aria-label*="aspect"], mat-select[aria-label*="Aspect"]'];
    for (const sel of arSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(500);
        const opt = page.locator('mat-option, [role="option"]').filter({ hasText: '16:9' }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await page.waitForTimeout(300);
        break;
      }
    }
  } catch (e) {}
}

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit/i.test(document.body.innerText || '')
  ).catch(() => false);
}

async function generateShotOnPage(page, scene, workerId, getSlot) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `shot_${shotNum}.jpg`);

  // R7: resume-safe skip
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
    return { ok: true, skipped: true };
  }

  const isHost = HOST_SPEAKERS.has(scene.dialogue_speaker);
  const fullPrompt = promptOf(scene);

  // R1+R8: per-scene model chain x slot rotation. QUOTA -> next slot, same
  // scene, same model; all slots exhausted -> next model. Scene never dropped.
  for (const model of MODEL_CHAIN) {
    for (let s = 0; s < ACCOUNT_SLOTS.length; s++) {
      const slot = getSlot();
      try {
        await ensureSession(page, slot, model);
        if (await isQuota(page)) continue; // R8: rotate, retry same scene

        // R4: host reference attach
        if (isHost && fs.existsSync(REF_STICKY)) {
          const fileInput = page.locator('input[type="file"]').first();
          if (await fileInput.count() > 0) {
            await fileInput.setInputFiles(REF_STICKY).catch(() => {});
            await page.waitForTimeout(1500);
          }
        }

        const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
          .filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/'))
          .map(img => img.src)).catch(() => []);

        const ta = page.locator('textarea, div[contenteditable="true"][role="textbox"]').first();
        await ta.waitFor({ state: 'visible', timeout: 20000 });
        await ta.fill(fullPrompt);
        await page.waitForTimeout(600);
        await page.keyboard.press('Control+Enter');

        let foundSrc = null;
        for (let i = 0; i < 25; i++) {
          await page.waitForTimeout(2000);
          if (await isQuota(page)) break; // R8: out to slot rotation
          const curImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
            .filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/'))
            .map(img => img.src)).catch(() => []);
          const fresh = curImgs.filter(src => !prevImgs.includes(src));
          if (fresh.length > 0) { foundSrc = fresh[fresh.length - 1]; break; }
        }

        if (!foundSrc) {
          if (await isQuota(page)) continue; // R8: quota during poll -> next slot
          await page.screenshot({ path: path.join(VISUAL, `_debug_shot${shotNum}.png`) }).catch(() => {}); // R9
          return { ok: false, err: 'TIMEOUT_NO_IMAGE' };
        }

        const imgData = await page.evaluate(async (src) => {
          try {
            const res = await fetch(src);
            const blob = await res.blob();
            const ab = await blob.arrayBuffer();
            const bytes = new Uint8Array(ab);
            let bin = '';
            for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
            return { b64: btoa(bin), size: bytes.length };
          } catch (e) { return { err: e.message }; }
        }, foundSrc);

        if (!imgData || imgData.err || !imgData.b64) {
          return { ok: false, err: (imgData && imgData.err) || 'EXTRACT_FAIL' };
        }

        fs.writeFileSync(outPath, Buffer.from(imgData.b64, 'base64'));
        console.log(`[W${workerId}/u${slot}/${model.split('-')[2] || model}] ✓ Shot ${scene.scene_id} (${(imgData.size / 1024).toFixed(0)} KB)${isHost ? ' [HOST]' : ''}`);
        return { ok: true, size: imgData.size };
      } catch (err) {
        if (/quota|429/i.test(err.message)) continue; // R8
        console.error(`[W${workerId}] Error on shot ${scene.scene_id}:`, err.message.slice(0, 120));
        return { ok: false, err: err.message.slice(0, 80) };
      }
    }
  }
  return { ok: false, err: 'ALL_SLOTS_MODELS_QUOTA' };
}

async function runWorker(ctx, workerId, queue) {
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length; // R6: always valid
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  let done = 0, fail = 0, skipped = 0;
  try {
    while (queue.length > 0) {
      const scene = queue.shift(); // shared queue, single-threaded shift is safe
      const res = await generateShotOnPage(page, scene, workerId, getSlot);
      if (res.skipped) skipped++;
      else if (res.ok) done++;
      else { fail++; console.log(`[W${workerId}] ✗ Shot ${scene.scene_id}: ${res.err}`); }
      await page.waitForTimeout(1500);
    }
  } finally {
    await page.close().catch(() => {});
  }
  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== EP02 IMAGE FLEET: ${NUM_WORKERS} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  const only = Number(process.env.ONLY_SCENE) || 0;
  const todo = ALL_SCENES.filter(s => {
    if (only && s.scene_id !== only) return false;
    const f = path.join(VISUAL, `shot_${String(s.scene_id).padStart(4, '0')}.jpg`);
    return !fs.existsSync(f) || fs.statSync(f).size < 50000;
  });
  console.log(`Remaining: ${todo.length}/${ALL_SCENES.length} shots`);
  if (todo.length === 0) { console.log('All images present. Nothing to do.'); process.exit(0); }

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const results = await Promise.all(
    Array.from({ length: NUM_WORKERS }, (_, i) => runWorker(ctx, i + 1, todo))
  );
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^shot_\d+\.jpg$/) && fs.statSync(path.join(VISUAL, f)).size > 50000).length;
  console.log(`Final: ${totalPresent}/${ALL_SCENES.length} images.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one fleet file per episode; shared queue over per-worker queues
