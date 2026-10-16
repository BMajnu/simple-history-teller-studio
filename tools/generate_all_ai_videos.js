const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const VISUAL_DIR = path.join(PROJ_DIR, 'visual_assets');
const PJ_PATH = path.join(PROJ_DIR, 'project.json');

const SLOTS = ['u/3', 'u/1', 'u/4', 'u/0', 'u/2', 'u/5', 'u/6'];
let currentSlotIdx = 0;

// Dynamic scenes in sample_first_king
// Priority: Mandatory cold open (1) and outros (77, 78, 79), then story climax scenes
const DYNAMIC_SCENE_IDS = [1, 77, 78, 79, 2, 5, 11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 69, 73];

function getActionPrompt(scene) {
  const base = scene.visual_prompt || '';
  const cleanBase = base.split('--no')[0].trim();
  return `Animate this 2D cartoon scene dynamically into a smooth 24fps motion clip in OverSimplified style: ${cleanBase}, 2D cartoon animation, 24fps motion, 16:9 widescreen, bold clean vector outlines, no realistic 3D, no text overlays.`;
}

async function configureSettings(page) {
  // Set Aspect Ratio to 16:9
  try {
    const aspectSelect = page.locator('mat-select[aria-label="Aspect ratio"], mat-select').filter({ hasText: /Auto|16:9|1:1/i }).first();
    if (await aspectSelect.count() > 0) {
      await aspectSelect.click();
      await page.waitForTimeout(400);
      const opt169 = page.locator('mat-option:has-text("16:9"), [role="option"]:has-text("16:9")').first();
      if (await opt169.count() > 0) {
        await opt169.click();
        await page.waitForTimeout(400);
      }
    }
  } catch (e) {}

  // Set Resolution to 720p
  try {
    const resSelect = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(400);
      const opt720 = page.locator('mat-option:has-text("720p"), [role="option"]:has-text("720p")').first();
      if (await opt720.count() > 0) {
        await opt720.click();
        await page.waitForTimeout(400);
      }
    }
  } catch (e) {}
}

async function generateClipWithFailover(page, sceneId, imagePath, outPath, prompt) {
  let attemptCount = 0;

  while (attemptCount < SLOTS.length) {
    const slot = SLOTS[currentSlotIdx];
    const url = `https://aistudio.google.com/${slot}/prompts/new_chat?model=gemini-omni-1.1-flash`;

    try {
      console.log(`\n[Scene ${sceneId}] Connecting to slot [${slot}] -> ${url}...`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');

      // Check for upgrade/quota modal immediately
      const hasModal = await page.evaluate(() => {
        const modal = document.querySelector('.mat-mdc-dialog-container, mat-dialog-container, [role="dialog"]');
        return modal && /upgrade|quota|unlock more/i.test(modal.innerText);
      });
      if (hasModal) {
        throw new Error('QUOTA_OR_UPGRADE_MODAL_HIT');
      }

      await configureSettings(page);

      // Directly attach anchor reference image via input[type="file"]
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(imagePath);
      await page.waitForTimeout(2500);

      // Enter action prompt
      const textarea = page.locator('textarea.textarea, textarea').first();
      await textarea.fill(prompt);
      await page.waitForTimeout(500);

      // Click Run
      const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
      await runBtn.click();
      console.log(`[Scene ${sceneId}][${slot}] Run triggered, awaiting 24fps AI video generation...`);

      // Monitor generation
      let videoSrc = null;
      const t0 = Date.now();
      for (let i = 0; i < 45; i++) {
        await page.waitForTimeout(3000);

        const state = await page.evaluate(() => {
          const vid = document.querySelector('video');
          const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
          const err = document.querySelector('.error-message, mat-error, [role="alert"]');
          const modal = document.querySelector('.mat-mdc-dialog-container, mat-dialog-container, [role="dialog"]');
          const isModal = modal && /upgrade|quota|unlock more/i.test(modal.innerText);

          return {
            hasVid: !!vid && !!vid.src,
            src: vid ? vid.src : null,
            hasStop: stop,
            err: err ? err.innerText : (isModal ? 'UPGRADE_MODAL' : null)
          };
        });

        if (state.err && /quota|exceeded|try again|upgrade/i.test(state.err)) {
          throw new Error('QUOTA_OR_UPGRADE_MODAL_HIT');
        }

        const elapsed = Math.round((Date.now() - t0) / 1000);
        if (i % 3 === 0) {
          process.stdout.write(`[${elapsed}s: Stop=${state.hasStop}, Vid=${state.hasVid}] `);
        }

        if (state.hasVid && !state.hasStop) {
          videoSrc = state.src;
          console.log(`\n🎉 [Scene ${sceneId}] Video rendered successfully in ${elapsed}s!`);
          break;
        }
      }

      if (!videoSrc) {
        throw new Error('VIDEO_GENERATION_TIMEOUT');
      }

      // Extract video blob via browser fetch into base64
      const videoBase64 = await page.evaluate(async (src) => {
        const res = await fetch(src);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });
      }, videoSrc);

      const buffer = Buffer.from(videoBase64, 'base64');
      fs.writeFileSync(outPath, buffer);
      console.log(`💾 Saved genuine AI video: ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
      return; // Success
    } catch (err) {
      console.warn(`\n⚠️ [Scene ${sceneId}][${slot}] ${err.message}. Rotating account...`);
      attemptCount++;
      currentSlotIdx = (currentSlotIdx + 1) % SLOTS.length;
    }
  }

  throw new Error(`Failed to generate Scene ${sceneId} after rotating across all account slots!`);
}

async function main() {
  console.log('========================================================================');
  console.log('GENUINE AI VIDEO GENERATION ENGINE (Google AI Studio Gemini Omni 1.1 Flash)');
  console.log(`Account Pool: ${SLOTS.join(', ')}`);
  console.log(`Dynamic Scene Targets: ${DYNAMIC_SCENE_IDS.length} scenes`);
  console.log('========================================================================\n');

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));

  for (const sceneId of DYNAMIC_SCENE_IDS) {
    const scene = pj.scenes.find(s => s.scene_id === sceneId);
    if (!scene) continue;

    const pad = String(sceneId).padStart(4, '0');
    const imagePath = path.join(VISUAL_DIR, `scene_${pad}.jpg`);
    const outPath = path.join(VISUAL_DIR, `clip_scene_${pad}.mp4`);

    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️ Anchor image not found for Scene ${sceneId}: ${imagePath}. Skipping.`);
      continue;
    }

    // Check if genuine AI video already exists
    let needsGen = true;
    if (fs.existsSync(outPath)) {
      const stats = fs.statSync(outPath);
      const content = fs.readFileSync(outPath, { encoding: 'binary', flag: 'r' });
      // Genuine AI videos from Google contain ISO Media handler from Google, NOT Lavf
      if (!content.includes('Lavf') && stats.size > 1000000) {
        console.log(`✓ Scene ${sceneId} already has genuine Google AI video (${(stats.size / (1024 * 1024)).toFixed(2)} MB). Skipping.`);
        needsGen = false;
      }
    }

    if (!needsGen) continue;

    const prompt = getActionPrompt(scene);
    console.log(`\n======================================================`);
    console.log(`🎬 GENERATING GENUINE AI VIDEO: SCENE ${sceneId}`);
    console.log(`Anchor Image: ${imagePath}`);
    console.log(`Output Clip:  ${outPath}`);
    console.log(`Action Prompt: ${prompt.slice(0, 100)}...`);
    console.log(`======================================================`);

    await generateClipWithFailover(page, sceneId, imagePath, outPath, prompt);

    // Update project.json asset_file pointer
    scene.asset_file = `visual_assets/clip_scene_${pad}.mp4`;
    scene.type = 'DYNAMIC_AI_VIDEO';
    scene.motion_effect = 'ai_video';
    fs.writeFileSync(PJ_PATH, JSON.stringify(pj, null, 2), 'utf8');
  }

  console.log('\n🎉 ALL DYNAMIC AI VIDEO CLIPS GENERATED & LINKED IN PROJECT.JSON!');
}

main().catch(console.error);
