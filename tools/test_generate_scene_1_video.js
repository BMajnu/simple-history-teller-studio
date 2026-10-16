const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const VISUAL_DIR = path.join(PROJ_DIR, 'visual_assets');

async function testScene1() {
  console.log('--- GENERATING SCENE 1 WITH GEMINI OMNI 1.1 FLASH (THINKING: HIGH) ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  const imagePath = path.join(VISUAL_DIR, 'scene_0001.jpg');
  const outPath = path.join(VISUAL_DIR, 'clip_scene_0001.mp4');

  console.log('Anchor Image:', imagePath);
  console.log('Output Video:', outPath);

  // 1. Navigate directly to Omni 1.1 Flash on u/3
  const url = 'https://aistudio.google.com/u/3/prompts/new_chat?model=gemini-omni-1.1-flash';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // 2. Configure Aspect Ratio to 16:9
  console.log('Configuring Aspect Ratio to 16:9...');
  try {
    const aspectSelect = page.locator('mat-select[aria-label="Aspect ratio"], mat-select').filter({ hasText: /Auto|16:9|1:1/i }).first();
    if (await aspectSelect.count() > 0) {
      await aspectSelect.click();
      await page.waitForTimeout(400);
      const opt169 = page.locator('mat-option:has-text("16:9"), [role="option"]:has-text("16:9")').first();
      if (await opt169.count() > 0) {
        await opt169.click();
        await page.waitForTimeout(400);
        console.log('✓ Aspect Ratio set to 16:9');
      }
    }
  } catch (e) {
    console.warn('Aspect ratio config warning:', e.message);
  }

  // 3. Configure Resolution to 720p
  console.log('Configuring Resolution to 720p...');
  try {
    const resSelect = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(400);
      const opt720 = page.locator('mat-option:has-text("720p"), [role="option"]:has-text("720p")').first();
      if (await opt720.count() > 0) {
        await opt720.click();
        await page.waitForTimeout(400);
        console.log('✓ Resolution set to 720p');
      }
    }
  } catch (e) {
    console.warn('Resolution config warning:', e.message);
  }

  // 4. Directly attach image via file input
  console.log('Attaching scene_0001.jpg via input[type="file"]...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(imagePath);
  await page.waitForTimeout(3000);
  console.log('✓ Anchor image attached!');

  // 5. Fill Prompt
  const prompt = 'Animate this 2D cartoon scene dynamically into a smooth 24fps motion clip in OverSimplified style: The Time Chronicler (OverSimplified cartoon host, smooth white egg-shaped head, round circular brass spectacles, expressive dot eyes with arched comic eyebrow, wry smile, wearing a brown tweed vest over a white collared shirt with rolled-up sleeves and a tiny brass pocket watch chain, holding a thick antique leather history journal, stick figure limbs, bold 5px black comic ink outlines, clean 2D flat vector art) stepping through a glowing mystical cosmic library portal, brass spectacles gleaming, opening a heavy illuminated history journal, warm comic lighting, 24fps motion, 16:9 widescreen.';
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'tools/ready_to_run_scene1.png' });
  console.log('Saved tools/ready_to_run_scene1.png');

  // 6. Click Run
  console.log('Clicking Run button...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  // 7. Monitor generation
  console.log('Monitoring 24fps AI video generation...');
  let videoSrc = null;
  const t0 = Date.now();
  for (let i = 0; i < 45; i++) {
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      const vid = document.querySelector('video');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      return {
        hasVid: !!vid && !!vid.src,
        src: vid ? vid.src : null,
        hasStop: stop,
        err: err ? err.innerText : null
      };
    });

    const elapsed = Math.round((Date.now() - t0) / 1000);
    console.log(`[${elapsed}s] StopBtn: ${state.hasStop} | VideoElement: ${state.hasVid}`);

    if (state.err) {
      throw new Error(`AI Studio error: ${state.err}`);
    }

    if (state.hasVid && !state.hasStop) {
      videoSrc = state.src;
      console.log(`🎉 Scene 1 Video successfully generated in ${elapsed}s!`);
      break;
    }
  }

  if (!videoSrc) {
    throw new Error('Video generation timed out after 135s!');
  }

  // 8. Download video blob
  console.log('Extracting video blob...');
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
  console.log(`💾 Saved genuine AI video to ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  await page.screenshot({ path: 'tools/scene1_generated_success.png' });
  console.log('Saved tools/scene1_generated_success.png');
}

testScene1().catch(console.error);
