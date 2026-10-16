const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const VISUAL_DIR = path.join(PROJ_DIR, 'visual_assets');

async function generateEndFrameScene1() {
  console.log('--- GENERATING ENDING FRAME FOR SCENE 1 WITH NANO BANANA 2.1 (THINKING: HIGH) ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  const startImage = path.join(VISUAL_DIR, 'scene_0001.jpg');
  const refHostImage = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');
  const outPath = path.join(VISUAL_DIR, 'scene_0001_end.jpg');

  console.log('Start Image:', startImage);
  console.log('Reference Host:', refHostImage);

  // Navigate to Nano Banana 2.1
  const url = 'https://aistudio.google.com/u/3/prompts/new_chat?model=gemini-nano-banana-2.1';
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

  // Upload Reference Image and Scene 1 Image
  console.log('Attaching Reference Images...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles([startImage, refHostImage]);
  await page.waitForTimeout(3000);
  console.log('✓ Uploaded reference images!');

  // Prompt for ending frame
  const prompt = `Generate the ending frame for this exact scene in 16:9 widescreen OverSimplified 2D cartoon style:
The Time Chronicler (exact same elderly wise historian from the reference images: bald crown, fluffy white hair on the sides, full bushy white beard and mustache, round circular wire-rim spectacles, brown tweed scholar tunic over white collared shirt) in the exact same mystical cosmic library with gothic stone arches and floating glowing books.
Ending action pose: He has opened the heavy antique leather history journal in his hands, with glowing warm golden light emanating from the pages, smiling warmly at the camera, wire glasses gleaming.
CRITICAL CHARACTER CONSISTENCY: The character MUST retain his full white beard, white mustache, spectacles, hair, and brown scholar tunic exactly as shown in the reference images. Bold 5px solid black vector ink outlines, clean 2D flat comic art, vibrant saturated colors, no text, no subtitles, 16:9 widescreen.`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(500);

  // Click Run
  console.log('Clicking Run button...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  // Monitor generation
  console.log('Monitoring image generation...');
  let imgSrc = null;
  const t0 = Date.now();
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
        return img.src && (img.src.startsWith('blob:') || img.src.startsWith('data:image'));
      });
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      return {
        hasImg: imgs.length > 0,
        imgs: imgs.map(i => i.src),
        hasStop: stop,
        err: err ? err.innerText : null
      };
    });

    const elapsed = Math.round((Date.now() - t0) / 1000);
    console.log(`[${elapsed}s] StopBtn: ${state.hasStop} | GeneratedImgs: ${state.hasImg ? state.imgs.length : 0}`);

    if (state.err) {
      throw new Error(`AI Studio error: ${state.err}`);
    }

    if (state.hasImg && !state.hasStop && state.imgs.length > 0) {
      // The last image is the generated one
      imgSrc = state.imgs[state.imgs.length - 1];
      console.log(`🎉 Image successfully generated in ${elapsed}s!`);
      break;
    }
  }

  if (!imgSrc) {
    throw new Error('Image generation timed out!');
  }

  // Extract image
  console.log('Extracting generated image...');
  let buffer;
  if (imgSrc.startsWith('data:image')) {
    const b64 = imgSrc.split(',')[1];
    buffer = Buffer.from(b64, 'base64');
  } else {
    const b64 = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
    }, imgSrc);
    buffer = Buffer.from(b64, 'base64');
  }

  fs.writeFileSync(outPath, buffer);
  console.log(`💾 Saved Ending Frame to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);

  await page.screenshot({ path: 'tools/end_frame_scene1_result.png' });
  console.log('Saved tools/end_frame_scene1_result.png');
}

generateEndFrameScene1().catch(console.error);
