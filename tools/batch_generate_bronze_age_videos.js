// ============================================================================
// Bronze Age Collapse (Episode 004) — Parallel AI Video Generator (Veo 3.1)
// Project: projects/simple_itihash_004_bronze_age_collapse (17 dynamic video clips)
// Run:   node tools/batch_generate_bronze_age_videos.js
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse');
const VISUAL = path.join(PROJ, 'visual_assets');

if (!fs.existsSync(VISUAL)) fs.mkdirSync(VISUAL, { recursive: true });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const VIDEO_SCENES = project.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO');

const MODEL = 'veo-3.1-fast-generate-preview';
const ACCOUNT_SLOTS = [0, 1, 2]; // 0 is PRO (msrosyafrin@gmail.com), 1 & 2 are fallbacks
const NUM_WORKERS = 4; // 4 concurrent video generation pipelines

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit/i.test(document.body.innerText || '')
  ).catch(() => false);
}

async function setupVideoSession(page, slot) {
  const url = `https://aistudio.google.com/u/${slot}/prompts/new_video?model=${MODEL}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.keyboard.press('Escape').catch(() => {});

  // Dismiss any skip/modal
  try {
    const skip = page.locator('button:has-text("Skip")').first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  } catch(e) {}
}

async function generateClip(page, scene, workerId, getSlot) {
  const sceneNum = String(scene.scene_id).padStart(4, '0');
  const targetFile = scene.asset_file ? path.basename(scene.asset_file) : `clip_scene_${sceneNum}.mp4`;
  const outPath = path.join(VISUAL, targetFile);

  // Resume check (>100KB)
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) {
    return { ok: true, skipped: true, sceneId: scene.scene_id };
  }

  const prompt = scene.visual_prompt;

  for (let attempt = 0; attempt < ACCOUNT_SLOTS.length; attempt++) {
    const slot = getSlot(attempt > 0);
    try {
      await setupVideoSession(page, slot);
      if (await isQuota(page)) {
        console.log(`[W${workerId}/u${slot}] Quota detected on load, rotating slot...`);
        continue;
      }

      const ta = page.locator('textarea[placeholder="Describe your video"], textarea').first();
      await ta.waitFor({ state: 'visible', timeout: 45000 });
      await ta.click();
      await ta.fill(prompt);
      await page.waitForTimeout(800);

      // Trigger generation
      await page.keyboard.press('Control+Enter');

      let videoSrc = null;
      for (let p = 0; p < 50; p++) { // up to 150s
        await page.waitForTimeout(3000);
        if (await isQuota(page)) {
          console.log(`[W${workerId}/u${slot}] Quota triggered during generation, rotating slot...`);
          break;
        }

        const state = await page.evaluate(() => {
          const vid = document.querySelector('video');
          const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
          const err = document.querySelector('.error-message, mat-error, [role="alert"]');
          return {
            hasVid: !!vid && !!vid.src,
            src: vid ? vid.src : null,
            hasStop: stop,
            errText: err ? err.innerText : null
          };
        }).catch(() => ({}));

        if (state.errText) {
          console.log(`[W${workerId}/u${slot}] Alert on scene ${scene.scene_id}: ${state.errText}`);
          break;
        }

        if (state.hasVid && !state.hasStop && state.src) {
          videoSrc = state.src;
          break;
        }
      }

      if (!videoSrc) {
        if (await isQuota(page)) continue;
        await page.screenshot({ path: path.join(VISUAL, `_debug_clip_${sceneNum}.png`) }).catch(() => {});
        return { ok: false, err: 'TIMEOUT_NO_VIDEO', sceneId: scene.scene_id };
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
        } catch (e) {
          return { err: e.message };
        }
      }, videoSrc);

      if (!vData || !vData.b64) {
        return { ok: false, err: vData?.err || 'EXTRACTION_FAILED', sceneId: scene.scene_id };
      }

      fs.writeFileSync(outPath, Buffer.from(vData.b64, 'base64'));
      console.log(`[W${workerId}/u${slot}] ✓ Video Clip ${scene.scene_id} -> ${targetFile} (${(vData.size / 1024 / 1024).toFixed(2)} MB)`);
      return { ok: true, size: vData.size, sceneId: scene.scene_id };
    } catch (err) {
      if (/quota|429/i.test(err.message)) continue;
      console.error(`[W${workerId}] Error on video scene ${scene.scene_id}:`, err.message.slice(0, 100));
      return { ok: false, err: err.message.slice(0, 80), sceneId: scene.scene_id };
    }
  }

  return { ok: false, err: 'ALL_SLOTS_EXHAUSTED', sceneId: scene.scene_id };
}

async function runVideoWorker(ctx, workerId, queue, totalInitial) {
  // Stagger startup by 4s per worker
  await new Promise(r => setTimeout(r, (workerId - 1) * 4000));

  const page = await ctx.newPage();
  let currentSlotIdx = 0; // Prioritize slot 0 (PRO)
  const getSlot = (rotate = false) => {
    if (rotate) currentSlotIdx = (currentSlotIdx + 1) % ACCOUNT_SLOTS.length;
    return ACCOUNT_SLOTS[currentSlotIdx];
  };

  let done = 0, fail = 0, skipped = 0;

  try {
    while (queue.length > 0) {
      const scene = queue.shift();
      const res = await generateClip(page, scene, workerId, (rotate) => getSlot(rotate));
      if (res.skipped) {
        skipped++;
      } else if (res.ok) {
        done++;
      } else {
        fail++;
        console.log(`[W${workerId}] ✗ Video Scene ${scene.scene_id}: ${res.err} -> Re-queuing`);
        queue.push(scene); // Re-queue on error
      }
      const remaining = queue.length;
      console.log(`[Video Fleet] Clips remaining in queue: ${remaining}/${totalInitial}`);
      await page.waitForTimeout(2000);
    }
  } finally {
    await page.close().catch(() => {});
  }

  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== BRONZE AGE COLLAPSE (EP04) AI VIDEO FLEET ===`);
  console.log(`Model: ${MODEL} | Workers: ${NUM_WORKERS} | Account Slots: ${ACCOUNT_SLOTS.join(', ')}`);

  const only = Number(process.env.ONLY_SCENE) || 0;
  const todo = VIDEO_SCENES.filter(s => {
    if (only && s.scene_id !== only) return false;
    const targetFile = s.asset_file ? path.basename(s.asset_file) : `clip_scene_${String(s.scene_id).padStart(4, '0')}.mp4`;
    const f = path.join(VISUAL, targetFile);
    return !fs.existsSync(f) || fs.statSync(f).size < 100000;
  });

  console.log(`Video Scenes Total: ${VIDEO_SCENES.length}`);
  console.log(`Remaining to Generate: ${todo.length} clips`);

  if (todo.length === 0) {
    console.log('All video clips present and valid! Nothing to do.');
    process.exit(0);
  }

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: null
  });

  const totalInitial = todo.length;
  const workersToSpawn = Math.min(NUM_WORKERS, todo.length);

  console.log(`Launching ${workersToSpawn} concurrent video workers...`);
  const results = await Promise.all(
    Array.from({ length: workersToSpawn }, (_, i) => runVideoWorker(ctx, i + 1, todo, totalInitial))
  );

  console.log('\n=== VIDEO RUN SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));

  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_scene_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final Video Clips Count: ${totalPresent}/${VIDEO_SCENES.length} clips.`);

  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => {
  console.error('Fatal Video Fleet Error:', err);
  process.exit(1);
});
// ponytail: shared queue; re-queue on error; PRO priority routing; zero external API keys
