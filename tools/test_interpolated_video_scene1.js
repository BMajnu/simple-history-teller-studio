const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const VISUAL_DIR = path.join(PROJ_DIR, 'visual_assets');

async function testInterpolatedVideoScene1() {
  console.log('--- GENERATING SCENE 1 VIDEO WITH START FRAME + END FRAME ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  const startImage = path.join(VISUAL_DIR, 'scene_0001.jpg');
  const endImage = path.join(VISUAL_DIR, 'scene_0001_end.jpg');
  const outPath = path.join(VISUAL_DIR, 'clip_scene_0001.mp4');

  console.log('Start Image:', startImage);
  console.log('End Image:  ', endImage);

  // Navigate to Omni 1.1 Flash
  const url = 'https://aistudio.google.com/u/3/prompts/new_chat?model=gemini-omni-1.1-flash';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Verify Thinking Level is High
  const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
  if (await thinkingSelect.count() > 0) {
    const currentThinking = await thinkingSelect.innerText();
    console.log('Current Thinking Level:', currentThinking);
    if (!currentThinking.includes('High')) {
      await thinkingSelect.click();
      await page.waitForTimeout(400);
      const highOpt = page.locator('mat-option:has-text("High"), [role="option"]:has-text("High")').first();
      if (await highOpt.count() > 0) {
        await highOpt.click();
        await page.waitForTimeout(400);
      }
    }
  }

  // Set Aspect Ratio to 16:9
  const aspectSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
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

  // Set Resolution to 720p
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

  // Upload Start Frame and End Frame
  console.log('Attaching Start Frame and End Frame...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles([startImage, endImage]);
  await page.waitForTimeout(3000);
  console.log('✓ Attached both keyframes!');

  // Prompt for smooth transition
  const prompt = `Animate this 2D cartoon scene dynamically into a smooth 24fps motion video in OverSimplified style:
First frame is Image 1. Final frame is Image 2.
The Time Chronicler (elderly wise historian, full bushy white beard, wire spectacles, bald crown with white hair on sides, brown scholar tunic) gently raises and opens the antique leather history journal, causing warm mystical golden light to emanate outward from the pages as floating scrolls swirl softly in the cosmic library.
CRITICAL MANDATORY RULE: The character MUST retain his full white beard, spectacles, hair, and clothing throughout the entire video. Smooth 2D vector animation, 24fps motion, 16:9 widescreen.`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(500);

  // Click Run
  console.log('Clicking Run button...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  // Monitor generation
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
      console.log(`🎉 Scene 1 Video generated in ${elapsed}s!`);
      break;
    }
  }

  if (!videoSrc) {
    // Check if video element exists now
    const vSrc = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? v.src : null;
    });
    if (vSrc) {
      videoSrc = vSrc;
    } else {
      throw new Error('Video generation timed out!');
    }
  }

  // Extract video blob
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

testInterpolatedVideoScene1().catch(console.error);
