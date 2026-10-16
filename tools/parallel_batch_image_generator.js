const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { transformToRichStickyPrompt } = require('./enrich_prompts');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const VISUAL_DIR = path.join(PROJECT_DIR, 'visual_assets');
fs.mkdirSync(VISUAL_DIR, { recursive: true });

// 6 Parallel workers mapped to 6 authenticated Google AI Studio accounts
const WORKER_SLOTS = [
  { id: 1, userSlot: 'u/0' },
  { id: 2, userSlot: 'u/1' },
  { id: 3, userSlot: 'u/2' },
  { id: 4, userSlot: 'u/3' },
  { id: 5, userSlot: 'u/7' },
  { id: 6, userSlot: 'u/8' }
];

async function runWorker(worker, queue, browser, stats) {
  const ctx = browser.contexts()[0];
  console.log(`[Worker ${worker.id} (${worker.userSlot})] Online and ready for batch queue.`);

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;

    const outFile = path.join(VISUAL_DIR, `scene_${String(item.scene_id).padStart(4, '0')}.jpg`);

    // Skip if already generated with high quality (> 50 KB)
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 50000) {
      console.log(`[Worker ${worker.id}] Scene ${item.scene_id} already exists (${(fs.statSync(outFile).size / 1024).toFixed(0)} KB), skipping.`);
      stats.completed++;
      continue;
    }

    const richPrompt = transformToRichStickyPrompt(item);
    console.log(`[Worker ${worker.id} (${worker.userSlot})] Generating Scene ${item.scene_id} (Queue left: ${queue.length})...`);

    let page = null;
    const startTime = Date.now();
    try {
      page = await ctx.newPage();
      const targetUrl = `https://aistudio.google.com/${worker.userSlot}/prompts/new_chat?model=gemini-3.1-flash-image`;
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 40000 });
      await page.waitForTimeout(3000);

      // Dismiss modals if any
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Set Aspect Ratio to 16:9
      const arSelect = page.locator('mat-select[aria-label*="Aspect ratio"], mat-select[aria-label*="aspect"]').first();
      if (await arSelect.count() > 0) {
        await arSelect.click();
        await page.waitForTimeout(400);
        const opt169 = page.locator('mat-option:has-text("16:9")').first();
        if (await opt169.count() > 0) await opt169.click();
        await page.waitForTimeout(300);
      }

      // Set Resolution to 1K
      const resSelect = page.locator('mat-select[aria-label*="Resolution"], mat-select[aria-label*="resolution"]').first();
      if (await resSelect.count() > 0) {
        await resSelect.click();
        await page.waitForTimeout(400);
        const opt1k = page.locator('mat-option:has-text("1K")').first();
        if (await opt1k.count() > 0) await opt1k.click();
        await page.waitForTimeout(300);
      }

      // Fill prompt
      const textarea = page.locator('textarea, div[contenteditable="true"]').first();
      await textarea.fill(richPrompt);
      await page.waitForTimeout(400);

      const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(i => i.src));

      // Click Run
      const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').last();
      await runBtn.click();

      // Wait for image generation (up to 45s)
      let newSrc = null;
      for (let t = 0; t < 25; t++) {
        await page.waitForTimeout(2000);
        const isGenerating = (await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count()) > 0;
        const currentImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(i => i.naturalWidth >= 300).map(i => i.src));
        const diff = currentImgs.filter(s => !prevImgs.includes(s));
        if (diff.length > 0 && !isGenerating) {
          newSrc = diff[diff.length - 1];
          break;
        }
      }

      if (!newSrc) {
        throw new Error(`Generation timed out after 50s for Scene ${item.scene_id}`);
      }

      // Extract image via Canvas to 1K JPEG
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
      }, newSrc);

      if (!base64Data || !base64Data.data) {
        throw new Error(`Failed to extract canvas base64 for Scene ${item.scene_id}`);
      }

      fs.writeFileSync(outFile, Buffer.from(base64Data.data, 'base64'));
      const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
      stats.completed++;
      console.log(`✓ [Worker ${worker.id} (${worker.userSlot})] Saved Scene ${item.scene_id}: ${path.basename(outFile)} (${base64Data.w}x${base64Data.h}, ${durationSec}s) [Total Done: ${stats.completed}/${stats.total}]`);

    } catch (err) {
      console.error(`✗ [Worker ${worker.id}] Error on Scene ${item.scene_id}:`, err.message);
      if (!item._retried) {
        item._retried = true;
        queue.push(item);
        console.log(`[Worker ${worker.id}] Re-queued Scene ${item.scene_id} for retry.`);
      } else {
        stats.failed++;
      }
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  console.log(`[Worker ${worker.id} (${worker.userSlot})] Finished all assigned work.`);
}

async function startParallelFleet() {
  console.log('======================================================================');
  console.log('STARTING RICH GRAPHICS + STICKY CHARACTER MULTI-WORKER FLEET');
  console.log('Project: sample_first_king (80 Scenes)');
  console.log(`Active Parallel Workers: ${WORKER_SLOTS.length} agents`);
  console.log('======================================================================');

  const pData = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const allScenes = pData.scenes || [];

  // Identify scenes that need generating
  const queue = [];
  for (const sc of allScenes) {
    const outFile = path.join(VISUAL_DIR, `scene_${String(sc.scene_id).padStart(4, '0')}.jpg`);
    if (!fs.existsSync(outFile) || fs.statSync(outFile).size < 50000) {
      queue.push({ ...sc });
    }
  }

  const stats = {
    total: allScenes.length,
    completed: allScenes.length - queue.length,
    failed: 0
  };

  console.log(`Total Scenes: ${stats.total}`);
  console.log(`Already Completed (High Quality): ${stats.completed}`);
  console.log(`Queued to Generate: ${queue.length}`);

  if (queue.length === 0) {
    console.log('All visual assets already generated and verified! Exiting.');
    return;
  }

  console.log('Connecting to Chrome on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');

  const workerPromises = WORKER_SLOTS.map(worker => runWorker(worker, queue, browser, stats));
  await Promise.all(workerPromises);

  console.log('======================================================================');
  console.log('PARALLEL IMAGE FLEET RUN COMPLETED!');
  console.log(`Completed: ${stats.completed}/${stats.total}`);
  console.log(`Failed: ${stats.failed}`);
  console.log('======================================================================');
}

startParallelFleet().catch(err => {
  console.error('Fleet Fatal Error:', err);
  process.exit(1);
});
