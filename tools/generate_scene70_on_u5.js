const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');

async function run() {
  console.log('--- GENERATING SCENE 70 CONSISTENT AI VIDEO ON u/5 ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const startImage = path.join(VISUAL_DIR, 'scene_0070.jpg');
  const endImage = path.join(VISUAL_DIR, 'scene_0070_end.jpg');
  const outPath = path.join(VISUAL_DIR, 'clip_scene_0070.mp4');

  const url = 'https://aistudio.google.com/u/5/prompts/new_chat?model=gemini-omni-1.1-flash';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Set Aspect Ratio to 16:9
  try {
    const aspectSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await aspectSelect.count() > 0) {
      await aspectSelect.click();
      await page.waitForTimeout(400);
      const opt169 = page.locator('mat-option:has-text("16:9")').first();
      if (await opt169.count() > 0) await opt169.click();
    }
  } catch (e) {}

  // Set Resolution to 720p
  try {
    const resSelect = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(400);
      const opt720 = page.locator('mat-option:has-text("720p")').first();
      if (await opt720.count() > 0) await opt720.click();
    }
  } catch (e) {}

  // Set Thinking Level to High
  try {
    const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await thinkingSelect.count() > 0) {
      const current = await thinkingSelect.innerText();
      if (!current.includes('High')) {
        await thinkingSelect.click();
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option:has-text("High")').first();
        if (await opt.count() > 0) await opt.click();
      }
    }
  } catch (e) {}

  // Attach Start Frame and End Frame
  console.log('Attaching start and end keyframes...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles([startImage, endImage]);
  await page.waitForTimeout(2500);

  // Dismiss acknowledgment if present
  const ackBtn = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
  if (await ackBtn.isVisible().catch(() => false)) {
    console.log('Dismissing media modal...');
    await ackBtn.click();
    await page.waitForTimeout(500);
  }

  // Fill Prompt
  const prompt = `Keyframe Animation: Transition smoothly from Image 1 (Starting Frame) to Image 2 (Ending Frame).
Animate this 2D cartoon scene into a smooth 24fps motion video in OverSimplified style:
The Time Chronicler (elderly wise historian: bald crown with white hair on sides, full bushy white beard and mustache, round wire-rim spectacles, brown scholar tunic) stands between the ancient Mesopotamian ziggurat and the towering modern skyscraper metropolis, speaking thoughtfully to the viewer, stroking his white beard with one hand and touching the ancient book on the stone pedestal with the other, as atmospheric twilight clouds drift across the horizon.
CRITICAL MANDATORY LOCK: The character MUST retain his full white beard, white mustache, spectacles, hair, and brown scholar tunic from frame 1 to the final frame. DO NOT remove the beard. DO NOT change facial features. Pure 2D flat animation, 24fps motion, 16:9 widescreen.`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(1000);

  console.log('Clicking Run button...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click({ force: true });
  console.log('Run clicked! Monitoring generation...');

  let videoSrc = null;
  const t0 = Date.now();

  for (let i = 0; i < 60; i++) {
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
    console.log(`[${elapsed}s] StopBtn: ${state.hasStop} | VideoReady: ${state.hasVid}`);

    if (state.err) {
      throw new Error(`AI Studio error: ${state.err}`);
    }

    if (state.hasVid && !state.hasStop) {
      videoSrc = state.src;
      console.log(`🎉 Video successfully generated in ${elapsed}s!`);
      break;
    }
  }

  if (!videoSrc) {
    // Check if video element is present
    const vSrc = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? v.src : null;
    });
    if (vSrc) videoSrc = vSrc;
  }

  if (!videoSrc) {
    await page.screenshot({ path: 'tools/u5_scene70_timeout.png' });
    throw new Error('Video generation timed out!');
  }

  console.log('Extracting video blob from:', videoSrc);
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
  console.log(`💾 Saved genuine AI video to: ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
}

run().catch(console.error);
