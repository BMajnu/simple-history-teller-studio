const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PROJECT_DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const VISUAL_DIR = path.join(PROJECT_DIR, 'visual_assets');
const METADATA_DIR = path.join(PROJECT_DIR, 'metadata');

fs.mkdirSync(VISUAL_DIR, { recursive: true });
fs.mkdirSync(METADATA_DIR, { recursive: true });

function triggerRender() {
  return new Promise((resolve) => {
    console.log('\n======================================================');
    console.log('🎉 ALL PARALLEL SHOTS COMPLETE! TRIGGERING RENDER...');
    console.log('======================================================');
    const payload = JSON.stringify({
      langs: ['bn', 'en', 'hi'],
      bgmDb: -20,
      duck: true,
      useBgm: true
    });
    const req = http.request('http://localhost:4000/api/project/simple_itihash_002_first_language/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Render trigger response:', data);
        resolve(true);
      });
    });
    req.on('error', (err) => {
      console.error('Render request error:', err.message);
      resolve(false);
    });
    req.write(payload);
    req.end();
  });
}

async function setupWorkerTab(context, workerId) {
  console.log(`[Worker ${workerId}] Initializing dedicated AI Studio tab...`);
  const page = await context.newPage();
  await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(4000);

  // Set Aspect ratio 16:9
  try {
    const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]');
    if (await arSelect.count() > 0) {
      await arSelect.click();
      await page.waitForTimeout(600);
      const opt169 = page.locator('mat-option:has-text("16:9")');
      if (await opt169.count() > 0) await opt169.click();
      await page.waitForTimeout(400);
    }
    const resSelect = page.locator('mat-select[aria-label="Resolution"]');
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(600);
      const opt1k = page.locator('mat-option:has-text("1K")');
      if (await opt1k.count() > 0) await opt1k.click();
      await page.waitForTimeout(400);
    }
  } catch (e) {
    console.log(`[Worker ${workerId}] Settings config warning:`, e.message);
  }

  console.log(`[Worker ${workerId}] Tab ready!`);
  return page;
}

async function runWorker(workerId, jobs, context) {
  let page = await setupWorkerTab(context, workerId);
  let consecutive = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];

    if (fs.existsSync(job.outFile) && fs.statSync(job.outFile).size > 80000) {
      console.log(`[Worker ${workerId}] [${i + 1}/${jobs.length}] SKIP: ${job.name} already exists`);
      continue;
    }

    if (consecutive >= 8) {
      console.log(`[Worker ${workerId}] Recycling tab to prevent memory buildup...`);
      try { await page.close(); } catch (e) {}
      page = await setupWorkerTab(context, workerId);
      consecutive = 0;
    }

    console.log(`[Worker ${workerId}] [${i + 1}/${jobs.length}] Generating: ${job.name}`);

    let saved = false;
    let attempts = 0;

    while (attempts < 2 && !saved) {
      attempts++;
      try {
        const initialImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);

        const ta = page.locator('textarea[aria-label="Enter a prompt"], textarea').first();
        await ta.click({ force: true });
        await ta.fill(job.prompt);
        await page.waitForTimeout(300);

        const runBtn = page.locator('button:has-text("Run")').last();
        await runBtn.click({ force: true });

        let elapsed = 0;
        while (elapsed < 65000) {
          await page.waitForTimeout(2000);
          elapsed += 2000;
          const isGenerating = await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count() > 0;
          const curImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);
          const diff = curImgs.filter(s => !initialImgs.includes(s));
          if (diff.length > 0 && !isGenerating) {
            break;
          }
        }

        await page.waitForTimeout(1000);

        const b64Data = await page.evaluate(async (oldList) => {
          const allLarge = Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 200);
          const newOnly = allLarge.filter(el => !oldList.includes(el.src));
          const target = newOnly.length > 0 ? newOnly[newOnly.length - 1] : allLarge[allLarge.length - 1];
          if (!target) return null;
          const res = await fetch(target.src);
          const blob = await res.blob();
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({
              data: reader.result.split(',')[1],
              w: target.naturalWidth,
              h: target.naturalHeight
            });
            reader.readAsDataURL(blob);
          });
        }, initialImgs).catch(() => null);

        if (b64Data && b64Data.data) {
          const buf = Buffer.from(b64Data.data, 'base64');
          fs.writeFileSync(job.outFile, buf);
          console.log(`[Worker ${workerId}] SUCCESS: Saved ${job.name} (${b64Data.w}x${b64Data.h}, ${(buf.length / 1024).toFixed(1)} KB)`);
          saved = true;
          consecutive++;
        } else {
          console.log(`[Worker ${workerId}] No image on attempt ${attempts} for ${job.name}`);
        }
      } catch (err) {
        console.error(`[Worker ${workerId}] Error on ${job.name}:`, err.message);
        try { await page.close(); } catch (e) {}
        page = await setupWorkerTab(context, workerId);
      }
    }

    await new Promise(r => setTimeout(r, 500));
  }

  try { await page.close(); } catch (e) {}
  console.log(`[Worker ${workerId}] All assigned jobs finished!`);
}

async function run() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  console.log(`Launching 3 Parallel Batch Workers for ${project.scenes.length} shots + 3 thumbnails in 1K...`);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];

  const allJobs = [];

  for (const shot of project.scenes) {
    const padNum = String(shot.scene_id).padStart(4, '0');
    const outFile = path.join(PROJECT_DIR, shot.asset_file);
    const prompt = `OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, vibrant color, 16:9 widescreen composition. ${shot.visual_prompt}`;
    allJobs.push({ name: `shot_${padNum}.jpg`, outFile, prompt, sceneId: shot.scene_id });
  }

  // Thumbnails
  allJobs.push({
    name: 'bn_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'bn_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large dramatic text "প্রথম ভাষা!" with stickman caveman shouting with charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  });
  allJobs.push({
    name: 'en_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'en_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large dramatic text "THE FIRST LANGUAGE!" with stickman caveman shouting with charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  });
  allJobs.push({
    name: 'hi_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'hi_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large dramatic text "इंसानों की पहली भाषा!" with stickman caveman shouting with charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  });

  console.log(`Total jobs: ${allJobs.length}. Splitting across 3 parallel workers:`);

  // Split into 3 buckets
  const worker1Jobs = allJobs.slice(0, 24);
  const worker2Jobs = allJobs.slice(24, 48);
  const worker3Jobs = allJobs.slice(48);

  console.log(`- Worker 1: ${worker1Jobs.length} jobs (1 to 24)`);
  console.log(`- Worker 2: ${worker2Jobs.length} jobs (25 to 48)`);
  console.log(`- Worker 3: ${worker3Jobs.length} jobs (49 to ${allJobs.length})`);

  // Run all 3 workers in parallel
  await Promise.all([
    runWorker(1, worker1Jobs, context),
    runWorker(2, worker2Jobs, context),
    runWorker(3, worker3Jobs, context)
  ]);

  console.log('\nAll 3 workers completed successfully!');
  await triggerRender();
}

run().catch(console.error);
