const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');

async function generateScene79EndFrame() {
  console.log('--- GENERATING SCENE 79 END FRAME (NANO BANANA 2.1, THINKING HIGH) ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const startImage = path.join(VISUAL_DIR, 'scene_0079.jpg');
  const refMascot = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');
  const outPath = path.join(VISUAL_DIR, 'scene_0079_end.jpg');

  // Navigate to Nano Banana 2.1 on u/1
  const url = 'https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-nano-banana-2.1';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
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

  // Attach start frame and reference mascot
  console.log('Attaching start image and reference mascot...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles([startImage, refMascot]);
  await page.waitForTimeout(3500);

  const prompt = `OverSimplified 2D cartoon style, 16:9 widescreen composition.
ENDING KEYFRAME: The Time Chronicler (elderly wise historian: bald crown with fluffy white hair on sides, full bushy white beard and mustache, circular wire spectacles, warm smile, wearing brown scholar tunic over muted shirt, stick figure legs, bold 5px black vector outlines) in the cosmic mystical library.
In this ending frame, he has written the final word with his illuminated golden feather quill, gently bowing with a warm reassuring smile and waving farewell to the viewers as the glowing magical books and ancient scrolls hover peacefully around him against the stained glass windows and starry cosmos.
CRITICAL MANDATORY CONSISTENCY: The character MUST EXACTLY match the character in Image 1 and Image 2. MUST have the full bushy white beard, mustache, wire glasses, and scholar tunic. Do NOT shave the beard. Do NOT make him a beardless young man. Pure 2D flat vector art, clean white cartoon head, no photorealism. --no text, words, captions, watermark, labels`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(1000);

  console.log('Clicking Run...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  console.log('Waiting for image generation...');
  let imgSrc = null;
  const t0 = Date.now();

  for (let i = 0; i < 45; i++) {
    await page.waitForTimeout(2500);
    const state = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).filter(img => 
        img.src && (img.src.startsWith('blob:') || img.src.includes('googleusercontent.com')) &&
        img.naturalWidth > 400
      );
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      return {
        hasImg: imgs.length > 0,
        src: imgs.length > 0 ? imgs[imgs.length - 1].src : null,
        hasStop: stop
      };
    });

    const elapsed = Math.round((Date.now() - t0) / 1000);
    console.log(`[${elapsed}s] StopBtn: ${state.hasStop} | GeneratedImg: ${state.hasImg}`);

    if (state.hasImg && !state.hasStop) {
      imgSrc = state.src;
      console.log(`🎉 Image generated in ${elapsed}s!`);
      break;
    }
  }

  if (!imgSrc) {
    await page.screenshot({ path: 'tools/scene79_img_timeout.png' });
    throw new Error('Image generation timed out!');
  }

  console.log('Extracting image base64...');
  const base64Data = await page.evaluate(async (src) => {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  }, imgSrc);

  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(outPath, buffer);
  console.log(`💾 Saved scene_0079_end.jpg to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

generateScene79EndFrame().catch(console.error);
