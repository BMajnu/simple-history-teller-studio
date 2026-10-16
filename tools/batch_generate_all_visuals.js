const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const VISUAL_DIR = path.join(PROJECT_DIR, 'visual_assets');
const METADATA_DIR = path.join(PROJECT_DIR, 'metadata');

fs.mkdirSync(VISUAL_DIR, { recursive: true });
fs.mkdirSync(METADATA_DIR, { recursive: true });

async function run() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  console.log(`Starting batch visual generation for ${project.project_id}...`);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const pages = context.pages();
  
  let page = pages.find(p => p.url().includes('aistudio.google.com/prompts'));
  if (!page) {
    console.log('No prompt tab found, creating new one...');
    page = await context.newPage();
    await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
  }

  await page.bringToFront();
  console.log('Connected to AI Studio page:', page.url());

  // Ensure aspect ratio 16:9 and 2K are selected
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
      const opt2k = page.locator('mat-option:has-text("2K")');
      if (await opt2k.count() > 0) await opt2k.click();
      await page.waitForTimeout(300);
    }
  } catch (e) {
    console.log('Settings already applied or modal closed.');
  }

  // Prepare list of jobs
  const jobs = [];

  for (const scene of project.scenes) {
    const sceneNum = String(scene.scene_id).padStart(4, '0');
    const outFile = path.join(VISUAL_DIR, `scene_${sceneNum}.jpg`);
    const prompt = `OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, vibrant color, 16:9 widescreen composition. ${scene.visual_prompt}`;
    jobs.push({ name: `scene_${sceneNum}.jpg`, outFile, prompt });
  }

  // Add 3 thumbnails
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

  console.log(`Total jobs: ${jobs.length}`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    if (fs.existsSync(job.outFile) && fs.statSync(job.outFile).size > 100000) {
      console.log(`[${i + 1}/${jobs.length}] SKIP: ${job.name} already exists (${(fs.statSync(job.outFile).size / 1024 / 1024).toFixed(2)} MB)`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`[${i + 1}/${jobs.length}] Generating ${job.name}...`);
    console.log(`========================================`);

    try {
      const initialImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 300).map(el => el.src));

      const ta = page.locator('textarea[aria-label="Enter a prompt"], textarea').first();
      await ta.click({ force: true });
      await ta.fill(job.prompt);
      await page.waitForTimeout(400);

      const runBtn = page.locator('button:has-text("Run")').last();
      await runBtn.click({ force: true });

      let elapsed = 0;
      let newImgFound = false;

      while (elapsed < 90000) {
        await page.waitForTimeout(3000);
        elapsed += 3000;
        const isGenerating = await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count() > 0;
        const curImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 300).map(el => el.src));
        const diff = curImgs.filter(s => !initialImgs.includes(s));

        if (diff.length > 0 && !isGenerating) {
          newImgFound = true;
          break;
        }
      }

      await page.waitForTimeout(1500);

      const b64Data = await page.evaluate(async (oldList) => {
        const allLarge = Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 300);
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
      }, initialImgs);

      if (b64Data && b64Data.data) {
        const buffer = Buffer.from(b64Data.data, 'base64');
        fs.writeFileSync(job.outFile, buffer);
        console.log(`SUCCESS [${i + 1}/${jobs.length}]: Saved ${job.name} (${b64Data.w}x${b64Data.h}, ${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        console.error(`ERROR [${i + 1}/${jobs.length}]: No image data returned for ${job.name}`);
      }
    } catch (err) {
      console.error(`ERROR [${i + 1}/${jobs.length}] on ${job.name}:`, err.message);
    }

    await page.waitForTimeout(1500);
  }

  console.log('\nAll visual assets and thumbnails successfully generated!');
}

run().catch(console.error);
