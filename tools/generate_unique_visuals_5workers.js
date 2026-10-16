const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PROJECT_JSON = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'project.json');
const VISUAL_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'visual_assets');

const NUM_WORKERS = 5;

const WORKER_URLS = [
  'https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-3.1-flash-image',
  'https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-3.1-flash-image',
  'https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-3.1-flash-image',
  'https://aistudio.google.com/u/2/prompts/new_chat?model=gemini-3.1-flash-image',
  'https://aistudio.google.com/u/2/prompts/new_chat?model=gemini-3.1-flash-image'
];

function sanitizePrompt(rawPrompt) {
  let prompt = rawPrompt.replace(/^(Simple\s+Itihash\s+)?(Scene|Shot|Part)\s*\d+[:\-.]*\s*/i, '').trim();
  prompt = prompt.replace(/--no .*$/i, '').trim();
  return `OverSimplified cartoon sticky meme style: ${prompt}, clean flat 2D vector, bold solid outlines, vibrant color, 16:9 widescreen --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks`;
}

async function setupTab(ctx, workerId, url) {
  console.log(`[Worker ${workerId}] Launching tab on ${url.includes('/u/2/') ? 'Account 2' : 'Account 1'}...`);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3500);

  // Dismiss any modal dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Set 16:9 Aspect ratio
  try {
    const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await arSelect.count() > 0) {
      await arSelect.click();
      await page.waitForTimeout(500);
      const opt169 = page.locator('mat-option:has-text("16:9")').first();
      if (await opt169.count() > 0) await opt169.click();
      await page.waitForTimeout(300);
    }
  } catch (e) {}

  // Set 1K Resolution
  try {
    const resSelect = page.locator('mat-select[aria-label="Resolution"]').first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(500);
      const opt1k = page.locator('mat-option:has-text("1K")').first();
      if (await opt1k.count() > 0) await opt1k.click();
      await page.waitForTimeout(300);
    }
  } catch (e) {}

  console.log(`[Worker ${workerId}] Tab configured and ready.`);
  return page;
}

async function generateShotImage(page, workerId, shot) {
  const shotNum = String(shot.scene_id).padStart(4, '0');
  const targetFile = path.join(VISUAL_DIR, `shot_${shotNum}.jpg`);
  const finalPrompt = sanitizePrompt(shot.visual_prompt);

  console.log(`\n[Worker ${workerId}] ▶ Starting Shot ${shot.scene_id}: ${finalPrompt.slice(0, 80)}...`);

  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    try {
      const prevImgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .filter(img => img.naturalWidth >= 300)
          .map(img => img.src);
      }).catch(() => []);

      const textarea = page.locator('textarea').first();
      await textarea.click({ force: true });
      await textarea.fill(finalPrompt);
      await page.waitForTimeout(400);

      // Trigger run using Control+Enter directly on the textarea to avoid navigation wait
      await textarea.press('Control+Enter');

      let elapsed = 0;
      let newImgSrc = null;
      while (elapsed < 50000) {
        await page.waitForTimeout(2000);
        elapsed += 2000;

        const isGenerating = await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count() > 0;
        const currentImgs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('img'))
            .filter(img => img.naturalWidth >= 300)
            .map(img => img.src);
        }).catch(() => []);

        const diff = currentImgs.filter(src => !prevImgs.includes(src));
        if (diff.length > 0 && !isGenerating) {
          newImgSrc = diff[diff.length - 1];
          break;
        }
      }

      if (!newImgSrc) {
        throw new Error('Image generation timed out after 50s');
      }

      const base64Data = await page.evaluate(async (src) => {
        const img = document.querySelector(`img[src="${src}"]`) || document.querySelector('img[src*="blob:"], img[src*="googleusercontent"]');
        if (!img) return null;
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return {
          data: canvas.toDataURL('image/jpeg', 0.95).replace(/^data:image\/jpeg;base64,/, ''),
          w: img.naturalWidth,
          h: img.naturalHeight
        };
      }, newImgSrc);

      if (!base64Data || !base64Data.data) {
        throw new Error('Could not extract image data from canvas');
      }

      const buf = Buffer.from(base64Data.data, 'base64');
      fs.writeFileSync(targetFile, buf);
      console.log(`[Worker ${workerId}] ✓ SUCCESS Shot ${shot.scene_id} saved (${base64Data.w}x${base64Data.h}, ${buf.length} bytes)`);
      return true;
    } catch (err) {
      console.error(`[Worker ${workerId}] ⚠ Attempt ${attempts} failed for Shot ${shot.scene_id}: ${err.message}`);
      await page.waitForTimeout(2000);
    }
  }

  return false;
}

async function runWorker(workerId, shots, ctx) {
  const url = WORKER_URLS[workerId] || WORKER_URLS[0];
  let page = await setupTab(ctx, workerId, url);
  let count = 0;

  for (const shot of shots) {
    if (count > 0 && count % 5 === 0) {
      console.log(`[Worker ${workerId}] Refreshing tab to prevent RAM leak...`);
      try { await page.close(); } catch (e) {}
      page = await setupTab(ctx, workerId, url);
    }

    const ok = await generateShotImage(page, workerId, shot);
    if (!ok) {
      console.error(`[Worker ${workerId}] Failed to generate Shot ${shot.scene_id} after all attempts.`);
    }
    count++;
    await new Promise(r => setTimeout(r, 600));
  }

  try { await page.close(); } catch (e) {}
  console.log(`\n========================================`);
  console.log(`[Worker ${workerId}] 🎉 ALL ${shots.length} SHOTS COMPLETED!`);
  console.log(`========================================\n`);
}

async function main() {
  const proj = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));

  // Audit current unique shots to only generate what is truly duplicate/missing
  const hashes = {};
  const duplicateShotIds = [];
  for (const scene of proj.scenes) {
    const file = path.join(VISUAL_DIR, `shot_${String(scene.scene_id).padStart(4, '0')}.jpg`);
    if (fs.existsSync(file)) {
      const buf = fs.readFileSync(file);
      const h = crypto.createHash('md5').update(buf).digest('hex');
      if (!hashes[h]) {
        hashes[h] = scene.scene_id;
      } else {
        duplicateShotIds.push(scene.scene_id);
      }
    } else {
      duplicateShotIds.push(scene.scene_id);
    }
  }

  console.log(`Currently missing/duplicate shots (${duplicateShotIds.length}):`, duplicateShotIds);
  if (duplicateShotIds.length === 0) {
    console.log('All 69 shots are 100% unique! Nothing to generate.');
    return;
  }

  const targetShots = proj.scenes.filter(s => duplicateShotIds.includes(s.scene_id));

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];

  // Distribute among 5 workers
  const queues = [[], [], [], [], []];
  targetShots.forEach((s, idx) => {
    queues[idx % NUM_WORKERS].push(s);
  });

  queues.forEach((q, idx) => {
    console.log(`Worker ${idx}: ${q.length} shots (${q.map(s => s.scene_id).join(', ')})`);
  });

  const workerPromises = queues.map((q, idx) => runWorker(idx, q, ctx));
  await Promise.all(workerPromises);

  console.log('\nAll 5 workers completed visual generation!');
}

main().catch(err => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
