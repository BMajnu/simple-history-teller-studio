// ============================================================================
// Bronze Age Collapse (Episode 004) — 10-Worker Parallel Image Generator
// Project: projects/simple_itihash_004_bronze_age_collapse (68 static scenes)
// Run:   node tools/batch_generate_bronze_age_images.js
// Probe: $env:ONLY_SCENE='4'; node tools/batch_generate_bronze_age_images.js
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
const STATIC_SCENES = project.scenes.filter(s => s.type === 'STATIC_IMAGE');

// Model Hierarchy: Default: Nano Banana 2.1 | 1st Fallback: Nano Banana 2 | 2nd Fallback: Nano Banana 2 Lite
const MODEL_CHAIN = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];
const ACCOUNT_SLOTS = [0, 1, 2]; // 0 is PRO (msrosyafrin@gmail.com), 1 & 2 are fallbacks
const NUM_WORKERS = 10;

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit/i.test(document.body.innerText || '')
  ).catch(() => false);
}

async function setupPageSession(page, slot, model) {
  const url = `https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape').catch(() => {});

  // Select "Images only" if visible
  try {
    const imagesOnlyBtn = page.locator('button:has-text("Images only")').first();
    if (await imagesOnlyBtn.count() > 0) {
      await imagesOnlyBtn.click().catch(() => {});
      await page.waitForTimeout(400);
    }
  } catch (e) {}

  // Select Aspect ratio 16:9
  try {
    const arBtn = page.locator('button:has-text("Auto"), [aria-label*="Aspect"]').first();
    if (await arBtn.count() > 0) {
      const text = await arBtn.innerText().catch(() => '');
      if (!text.includes('16:9')) {
        await arBtn.click().catch(() => {});
        await page.waitForTimeout(500);
        const opt169 = page.locator('.cdk-overlay-container, mat-option, [role="option"]').filter({ hasText: '16:9' }).first();
        if (await opt169.count() > 0) {
          await opt169.click().catch(() => {});
          await page.waitForTimeout(400);
        }
      }
    }
  } catch (e) {}
}

async function generateSceneImage(page, scene, workerId, getSlot) {
  const sceneNum = String(scene.scene_id).padStart(4, '0');
  const targetFile = scene.asset_file ? path.basename(scene.asset_file) : `scene_${sceneNum}.png`;
  const outPath = path.join(VISUAL, targetFile);

  // Resume safety check (>50KB)
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
    return { ok: true, skipped: true, sceneId: scene.scene_id };
  }

  const prompt = scene.visual_prompt;

  for (const model of MODEL_CHAIN) {
    for (let attempt = 0; attempt < ACCOUNT_SLOTS.length; attempt++) {
      const slot = getSlot(attempt > 0);
      try {
        await setupPageSession(page, slot, model);
        if (await isQuota(page)) {
          console.log(`[W${workerId}/u${slot}] Quota detected on load, rotating slot...`);
          continue;
        }

        const prevImgs = await page.evaluate(() =>
          Array.from(document.querySelectorAll('img'))
            .filter(i => i.naturalWidth > 300 && !i.src.includes('googleusercontent.com/a/'))
            .map(i => i.src)
        ).catch(() => []);

        const input = page.locator('textarea, rich-textarea, div[contenteditable="true"][role="textbox"]').first();
        await input.waitFor({ state: 'visible', timeout: 45000 });
        await input.click();
        await input.fill(prompt);
        await page.waitForTimeout(600);

        // Submit via Control+Enter (clean & universal)
        await page.keyboard.press('Control+Enter');

        let freshSrc = null;
        for (let p = 0; p < 30; p++) {
          await page.waitForTimeout(2000);
          if (await isQuota(page)) {
            console.log(`[W${workerId}/u${slot}] Quota triggered during generation, rotating slot...`);
            break;
          }
          const curImgs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('img'))
              .filter(i => i.naturalWidth > 300 && !i.src.includes('googleusercontent.com/a/'))
              .map(i => i.src)
          ).catch(() => []);

          const diff = curImgs.filter(s => !prevImgs.includes(s));
          if (diff.length > 0) {
            freshSrc = diff[diff.length - 1];
            break;
          }
        }

        if (!freshSrc) {
          if (await isQuota(page)) continue;
          await page.screenshot({ path: path.join(VISUAL, `_debug_scene_${sceneNum}.png`) }).catch(() => {});
          return { ok: false, err: 'TIMEOUT_NO_IMAGE', sceneId: scene.scene_id };
        }

        const b64Data = await page.evaluate(async (src) => {
          try {
            const r = await fetch(src);
            const b = await r.blob();
            const buf = await b.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let bin = '';
            for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
            return { b64: btoa(bin), size: bytes.length };
          } catch (e) {
            return { err: e.message };
          }
        }, freshSrc);

        if (!b64Data || !b64Data.b64) {
          return { ok: false, err: b64Data?.err || 'EXTRACTION_FAILED', sceneId: scene.scene_id };
        }

        fs.writeFileSync(outPath, Buffer.from(b64Data.b64, 'base64'));
        console.log(`[W${workerId}/u${slot}] ✓ Scene ${scene.scene_id} -> ${targetFile} (${(b64Data.size / 1024).toFixed(0)} KB)`);
        return { ok: true, size: b64Data.size, sceneId: scene.scene_id };
      } catch (err) {
        if (/quota|429/i.test(err.message)) continue;
        console.error(`[W${workerId}] Error on scene ${scene.scene_id}:`, err.message.slice(0, 100));
        return { ok: false, err: err.message.slice(0, 80), sceneId: scene.scene_id };
      }
    }
  }

  return { ok: false, err: 'ALL_SLOTS_EXHAUSTED', sceneId: scene.scene_id };
}

async function runWorker(ctx, workerId, queue, totalInitial) {
  // Stagger startup by 2.5s per worker to prevent simultaneous DOM storm
  await new Promise(r => setTimeout(r, (workerId - 1) * 2500));

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
      const res = await generateSceneImage(page, scene, workerId, (rotate) => getSlot(rotate));
      if (res.skipped) {
        skipped++;
      } else if (res.ok) {
        done++;
      } else {
        fail++;
        console.log(`[W${workerId}] ✗ Scene ${scene.scene_id}: ${res.err} -> Re-queuing`);
        // R8: Never drop a scene! Put back in queue to retry
        queue.push(scene);
      }
      const remaining = queue.length;
      console.log(`[Fleet Progress] Scenes remaining in queue: ${remaining}/${totalInitial}`);
      await page.waitForTimeout(1000);
    }
  } finally {
    await page.close().catch(() => {});
  }

  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== BRONZE AGE COLLAPSE (EP04) IMAGE FLEET ===`);
  console.log(`Fleet Config: ${NUM_WORKERS} Parallel Workers | Account Slots: ${ACCOUNT_SLOTS.join(', ')}`);

  const only = Number(process.env.ONLY_SCENE) || 0;
  const todo = STATIC_SCENES.filter(s => {
    if (only && s.scene_id !== only) return false;
    const targetFile = s.asset_file ? path.basename(s.asset_file) : `scene_${String(s.scene_id).padStart(4, '0')}.png`;
    const f = path.join(VISUAL, targetFile);
    return !fs.existsSync(f) || fs.statSync(f).size < 50000;
  });

  console.log(`Static Scenes Total: ${STATIC_SCENES.length}`);
  console.log(`Remaining to Generate: ${todo.length} scenes`);

  if (todo.length === 0) {
    console.log('All static images present and valid! Nothing to do.');
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

  console.log(`Launching ${workersToSpawn} concurrent workers (staggered by 2.5s)...`);
  const results = await Promise.all(
    Array.from({ length: workersToSpawn }, (_, i) => runWorker(ctx, i + 1, todo, totalInitial))
  );

  console.log('\n=== BATCH RUN SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));

  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^scene_\d+\.png$/) && fs.statSync(path.join(VISUAL, f)).size > 50000).length;
  console.log(`Final Assets Count: ${totalPresent}/${STATIC_SCENES.length} images.`);

  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => {
  console.error('Fatal Fleet Error:', err);
  process.exit(1);
});
// ponytail: shared queue over per-worker splits; resume-safe skip; re-queue on error; zero external API keys
