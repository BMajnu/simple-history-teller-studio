const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const VISUAL_DIR = path.join(PROJ_DIR, 'visual_assets');

async function runScene1() {
  console.log('--- GENERATING SCENE 1 WITH START FRAME + END FRAME ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  const startImage = path.join(VISUAL_DIR, 'scene_0001.jpg');
  const endImage = path.join(VISUAL_DIR, 'scene_0001_end.jpg');
  const outPath = path.join(VISUAL_DIR, 'clip_scene_0001.mp4');

  console.log('Start Image:', startImage, fs.existsSync(startImage));
  console.log('End Image:  ', endImage, fs.existsSync(endImage));

  const url = 'https://aistudio.google.com/u/3/prompts/new_chat?model=gemini-omni-1.1-flash';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');

  // Verify Thinking Level is High
  try {
    const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await thinkingSelect.count() > 0) {
      const currentThinking = await thinkingSelect.innerText();
      console.log('Thinking Level:', currentThinking);
      if (!currentThinking.includes('High')) {
        await thinkingSelect.click();
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option:has-text("High")').first();
        if (await opt.count() > 0) await opt.click();
      }
    }
  } catch (e) {}

  // Aspect ratio 16:9
  try {
    const aspectSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await aspectSelect.count() > 0) {
      await aspectSelect.click();
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option:has-text("16:9")').first();
      if (await opt.count() > 0) await opt.click();
    }
  } catch (e) {}

  // Resolution 720p
  try {
    const resSelect = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option:has-text("720p")').first();
      if (await opt.count() > 0) await opt.click();
    }
  } catch (e) {}

  // Attach Start Frame and End Frame
  console.log('Attaching Start Frame and End Frame...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles([startImage, endImage]);
  await page.waitForTimeout(3500);
  console.log('✓ Both keyframes attached!');

  const prompt = `Animate this 2D cartoon scene into a smooth 24fps motion video in OverSimplified style:
First frame is Image 1. Final frame is Image 2.
The Time Chronicler (elderly wise historian, full bushy white beard and mustache, round wire spectacles, bald crown with white hair on sides, brown scholar tunic) gently opens the antique leather history journal, with warm glowing golden light emanating from the pages as floating scrolls swirl softly in the cosmic library.
CRITICAL MANDATORY LOCK: The character MUST retain his full white beard, white mustache, spectacles, hair, and clothing throughout the entire video. Smooth 2D vector animation, 24fps motion, 16:9 widescreen.`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(500);

  console.log('Clicking Run button...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  console.log('Monitoring generation...');
  let videoSrc = null;
  const t0 = Date.now();

  for (let i = 0; i < 50; i++) {
    await page.waitForTimeout(3000);
    try {
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
        console.log(`🎉 Video successfully generated in ${elapsed}s!`);
        break;
      }
    } catch (evalErr) {
      console.warn('Poll notice:', evalErr.message);
    }
  }

  if (!videoSrc) {
    const vSrc = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? v.src : null;
    });
    if (vSrc) videoSrc = vSrc;
  }

  if (!videoSrc) {
    throw new Error('Video generation timed out!');
  }

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
  console.log(`💾 Saved genuine consistent AI video: ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
}

runScene1().catch(console.error);
