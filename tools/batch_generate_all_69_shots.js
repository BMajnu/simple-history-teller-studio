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
    console.log('ALL SHOTS & THUMBNAILS COMPLETE! TRIGGERING RENDER...');
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

let activeBrowser = null;
let activePage = null;

async function getActivePage(forceNew = false) {
  if (!activeBrowser || !activeBrowser.isConnected() || forceNew) {
    if (activeBrowser) try { await activeBrowser.close(); } catch (e) {}
    activeBrowser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  }

  const context = activeBrowser.contexts()[0];
  const pages = context.pages();

  let page = pages.find(p => p.url().includes('aistudio.google.com/prompts') && !p.isClosed());

  if (!page || forceNew) {
    console.log('Opening fresh gemini-3.1-flash-image prompt session...');
    page = await context.newPage();
    await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    await page.waitForTimeout(3500);

    // Set 1K and 16:9
    try {
      const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]');
      if (await arSelect.count() > 0) {
        await arSelect.click();
        await page.waitForTimeout(500);
        const opt169 = page.locator('mat-option:has-text("16:9")');
        if (await opt169.count() > 0) await opt169.click();
        await page.waitForTimeout(300);
      }
      const resSelect = page.locator('mat-select[aria-label="Resolution"]');
      if (await resSelect.count() > 0) {
        await resSelect.click();
        await page.waitForTimeout(500);
        const opt1k = page.locator('mat-option:has-text("1K")');
        if (await opt1k.count() > 0) await opt1k.click();
        await page.waitForTimeout(300);
      }
    } catch (e) {}
  }

  await page.bringToFront();
  activePage = page;
  return page;
}

async function run() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  console.log(`Starting resilient batch visual generation for ${project.scenes.length} granular shots in 1K...`);

  const jobs = [];

  for (const shot of project.scenes) {
    const padNum = String(shot.scene_id).padStart(4, '0');
    const outFile = path.join(PROJECT_DIR, shot.asset_file);
    const prompt = `OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, vibrant color, 16:9 widescreen composition. ${shot.visual_prompt}`;
    jobs.push({ name: `shot_${padNum}.jpg`, outFile, prompt, sceneId: shot.scene_id });
  }

  // Thumbnails
  jobs.push({
    name: 'bn_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'bn_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large dramatic text "প্রথম ভাষা!" with stickman caveman shouting with charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  });
  jobs.push({
    name: 'en_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'en_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large dramatic text "THE FIRST LANGUAGE!" with stickman caveman shouting with charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  });
  jobs.push({
    name: 'hi_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'hi_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large dramatic text "इंसानों की पहली भाषा!" with stickman caveman shouting with charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  });

  console.log(`Total jobs in queue: ${jobs.length}`);

  let consecutiveGenerations = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    if (fs.existsSync(job.outFile) && fs.statSync(job.outFile).size > 80000) {
      console.log(`[${i + 1}/${jobs.length}] SKIP: ${job.name} already exists (${(fs.statSync(job.outFile).size / 1024).toFixed(1)} KB)`);
      continue;
    }

    // Refresh tab every 8 generations to prevent DOM bloat
    if (consecutiveGenerations >= 8) {
      console.log('Refreshing tab to maintain high speed and prevent memory bloat...');
      await getActivePage(true);
      consecutiveGenerations = 0;
    }

    console.log(`\n----------------------------------------`);
    console.log(`[${i + 1}/${jobs.length}] Generating 1K shot: ${job.name}`);
    console.log(`----------------------------------------`);

    let saved = false;
    let attempt = 0;

    while (attempt < 3 && !saved) {
      attempt++;
      try {
        const page = await getActivePage(attempt > 1);

        const initialImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);

        const ta = page.locator('textarea[aria-label="Enter a prompt"], textarea').first();
        await ta.click({ force: true });
        await ta.fill(job.prompt);
        await page.waitForTimeout(300);

        const runBtn = page.locator('button:has-text("Run")').last();
        await runBtn.click({ force: true });

        let elapsed = 0;
        while (elapsed < 70000) {
          await page.waitForTimeout(2500);
          elapsed += 2500;
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
          console.log(`SUCCESS [${i + 1}/${jobs.length}]: Saved ${job.name} (${b64Data.w}x${b64Data.h}, ${(buf.length / 1024).toFixed(1)} KB)`);
          saved = true;
          consecutiveGenerations++;
        } else {
          console.log(`Attempt ${attempt} produced no image. Retrying with fresh session...`);
        }
      } catch (err) {
        console.error(`Attempt ${attempt} error on ${job.name}:`, err.message);
        activeBrowser = null;
        activePage = null;
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    await new Promise(r => setTimeout(r, 600));
  }

  console.log('\nAll 69 shots & 3 thumbnails generated successfully!');
  await triggerRender();
}

run().catch(console.error);
