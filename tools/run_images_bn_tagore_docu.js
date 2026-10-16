// Image-keyframe fleet for bn_tagore_bangladesh_docu (PRESET_SIMPLE_HISTORY documentary)
// Target: DYNAMIC scenes with video_origin=AI_GENERATED_VIDEO missing shot_XXXX.jpg anchors.
// Archival/document scenes excluded (archival download manifest + local docs, not AI Studio).
// Usage: node tools/run_images_bn_tagore_docu.js [--dry-run]
//   $env:NUM_WORKERS='10'; $env:ONLY_SCENE='7'; node tools/run_images_bn_tagore_docu.js
// Rules R1-R10 from instructions/03_IMAGE_GENERATION_AUTOMATION.md §4B.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'bn_tagore_bangladesh_docu');
const VISUAL = path.join(PROJ, 'visual_assets');
const REF_HOST = path.join(ROOT, 'references', 'ref_host_simple_history.jpg');
fs.mkdirSync(VISUAL, { recursive: true });

const MODEL_CHAIN = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];
const ACCOUNT_SLOTS = [1, 2, 3, 4, 5, 6];
const NUM_WORKERS = Math.max(1, Math.min(10, Number(process.env.NUM_WORKERS) || 10));
const ONLY_SCENE = Number(process.env.ONLY_SCENE) || 0;
const NEG_TAIL = '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions';
const HOST_SPEAKERS = new Set(['TIME_CHRONICLER']);

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const todo = project.scenes.filter(s => {
  if (ONLY_SCENE && s.scene_id !== ONLY_SCENE) return false;
  if (s.video_origin !== 'AI_GENERATED_VIDEO') return false; // archival + doc-legibility excluded
  const f = path.join(VISUAL, `shot_${String(s.scene_id).padStart(4, '0')}.jpg`);
  return !fs.existsSync(f) || fs.statSync(f).size < 50000;
});

const DRY = process.argv.includes('--dry-run');
console.log(`IMAGE fleet: ${todo.length} keyframes missing (workers=${NUM_WORKERS}${ONLY_SCENE ? ` probe=${ONLY_SCENE}` : ''})`);
if (DRY || todo.length === 0) { console.log(DRY ? 'dry-run ok' : 'All keyframes present. Nothing to do.'); process.exit(0); }

const promptOf = (scene) => (scene.visual_prompt || '').includes('--no text') ? scene.visual_prompt : `${scene.visual_prompt} ${NEG_TAIL}`;

async function ensureSession(page, slot, model) {
  await page.goto(`https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
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
  try {
    for (const sel of ['button[aria-label*="Aspect"], mat-select[aria-label*="Aspect"]']) {
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

const isQuota = (page) => page.evaluate(() => /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit|requires a paid API key|link an api key|set up billing/i.test(document.body.innerText || '')).catch(() => false);

async function generateShotOnPage(page, scene, workerId, getSlot) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `shot_${shotNum}.jpg`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) return { ok: true, skipped: true };
  const isHost = HOST_SPEAKERS.has(scene.dialogue_speaker);
  const fullPrompt = promptOf(scene);
  for (const model of MODEL_CHAIN) {
    for (let s = 0; s < ACCOUNT_SLOTS.length; s++) {
      const slot = getSlot();
      try {
        await ensureSession(page, slot, model);
        if (await isQuota(page)) continue;
        if (isHost && fs.existsSync(REF_HOST)) {
          const fileInput = page.locator('input[type="file"]').first();
          if (await fileInput.count() > 0) { await fileInput.setInputFiles(REF_HOST).catch(() => {}); await page.waitForTimeout(1500); }
        }
        const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/')).map(img => img.src)).catch(() => []);
        const ta = page.locator('textarea, div[contenteditable="true"][role="textbox"]').first();
        await ta.waitFor({ state: 'visible', timeout: 20000 });
        await ta.fill(fullPrompt);
        await page.waitForTimeout(600);
        await page.keyboard.press('Control+Enter');
        let foundSrc = null;
        for (let i = 0; i < 25; i++) {
          await page.waitForTimeout(2000);
          if (await isQuota(page)) break;
          const curImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/')).map(img => img.src)).catch(() => []);
          const fresh = curImgs.filter(src => !prevImgs.includes(src));
          if (fresh.length > 0) { foundSrc = fresh[fresh.length - 1]; break; }
        }
        if (!foundSrc) {
          if (await isQuota(page)) continue;
          await page.screenshot({ path: path.join(VISUAL, `_debug_shot${shotNum}.png`) }).catch(() => {});
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
        if (!imgData || imgData.err || !imgData.b64) return { ok: false, err: (imgData && imgData.err) || 'EXTRACT_FAIL' };
        fs.writeFileSync(outPath, Buffer.from(imgData.b64, 'base64'));
        console.log(`[W${workerId}/u${slot}] Shot ${scene.scene_id} (${(imgData.size / 1024).toFixed(0)} KB)${isHost ? ' [HOST]' : ''}`);
        return { ok: true, size: imgData.size };
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
      const res = await generateShotOnPage(page, scene, workerId, getSlot);
      if (res.skipped) skipped++;
      else if (res.ok) done++;
      else { fail++; console.log(`[W${workerId}] Shot ${scene.scene_id}: ${res.err}`); }
      await page.waitForTimeout(1500);
    }
  } finally { await page.close().catch(() => {}); }
  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== TAGORE IMAGE FLEET: ${NUM_WORKERS} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: false, executablePath: CHROME_PATH, args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null });
  const buckets = Array.from({ length: NUM_WORKERS }, () => []);
  todo.forEach((j, i) => buckets[i % NUM_WORKERS].push(j));
  const results = await Promise.all(buckets.map((b, i) => runWorker(ctx, i + 1, b)));
  console.log(JSON.stringify(results, null, 2));
  const present = fs.readdirSync(VISUAL).filter(f => f.match(/^shot_\d+\.jpg$/) && fs.statSync(path.join(VISUAL, f)).size > 50000).length;
  console.log(`Final: ${present} keyframes on disk.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
