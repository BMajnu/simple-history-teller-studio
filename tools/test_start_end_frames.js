const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const VISUAL_DIR = path.join(PROJ_DIR, 'visual_assets');

async function testStartEndFrames() {
  console.log('--- TESTING OMNI 1.1 FLASH WITH START + END/REFERENCE FRAMES ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  const startImage = path.join(VISUAL_DIR, 'scene_0001.jpg');
  const refHostImage = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');

  console.log('Start Image:', startImage);
  console.log('Ref/End Image:', refHostImage);

  // Navigate to Omni 1.1 Flash
  const url = 'https://aistudio.google.com/u/3/prompts/new_chat?model=gemini-omni-1.1-flash';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Verify Thinking Level is High
  const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
  console.log('Thinking Level select count:', await thinkingSelect.count());
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
        console.log('✓ Set Thinking Level to High');
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

  // Upload BOTH Start Frame and End/Reference Frame
  console.log('Attaching Start Frame and End Frame...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles([startImage, refHostImage]);
  await page.waitForTimeout(3000);
  console.log('✓ Uploaded both images!');

  await page.screenshot({ path: 'tools/two_keyframes_attached.png' });
  console.log('Saved tools/two_keyframes_attached.png');

  // Fill Prompt with strict character preservation
  const prompt = `Keyframe Animation: Transition from Image 1 (Starting Frame) to Image 2 (Ending Reference Frame).
Animate this 2D cartoon scene into a smooth 24fps motion clip in OverSimplified style:
The Time Chronicler (elderly wise historian, bald crown with white fluffy hair on the sides, full bushy white beard and mustache, round wire-rim spectacles, brown scholar tunic over earthy shirt, holding an antique history book and quill) speaks to the audience, gently gesturing with the quill while holding the book, warm lighting inside the cosmic mystical library.
MANDATORY CHARACTER LOCK: The character MUST retain his full white beard, white mustache, spectacles, hair, and brown scholar tunic from the first frame to the last frame. Do NOT remove the beard. Do NOT morph the character into a different person or modern suit. Bold 5px black vector outlines, 2D flat animation, 24fps motion, 16:9 widescreen.`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(500);

  // Click Run
  console.log('Clicking Run button...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  // Monitor generation
  console.log('Monitoring generation with Start + End keyframes...');
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
      console.log(`🎉 Video successfully generated in ${elapsed}s!`);
      break;
    }
  }

  if (!videoSrc) {
    throw new Error('Video generation timed out!');
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

  const outPath = path.join(VISUAL_DIR, 'clip_scene_0001_consistent.mp4');
  const buffer = Buffer.from(videoBase64, 'base64');
  fs.writeFileSync(outPath, buffer);
  console.log(`💾 Saved consistent AI video to ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  await page.screenshot({ path: 'tools/consistent_video_success.png' });
  console.log('Saved tools/consistent_video_success.png');
}

testStartEndFrames().catch(console.error);
