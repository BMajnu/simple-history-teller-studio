const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');

async function run() {
  console.log('--- GENERATING SCENE 2 CONSISTENT KEYFRAMES & AI VIDEO ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const s2Start = path.join(VISUAL_DIR, 'scene_0002_start.jpg');
  const s2End = path.join(VISUAL_DIR, 'scene_0002_end.jpg');
  const s2Video = path.join(VISUAL_DIR, 'clip_scene_0002.mp4');

  // Copy scene2_old_9s.jpg as start frame if start doesn't exist
  const existingThrone = path.join(ROOT, 'tools', 'scene2_old_9s.jpg');
  if (fs.existsSync(existingThrone) && !fs.existsSync(s2Start)) {
    fs.copyFileSync(existingThrone, s2Start);
    console.log('✓ Copied throne image as scene_0002_start.jpg');
  }

  // Generate End Frame if not present
  if (!fs.existsSync(s2End)) {
    console.log('\nGenerating Scene 2 End Frame with Nano Banana 2.1...');
    await page.goto('https://aistudio.google.com/u/5/prompts/new_chat?model=gemini-nano-banana-2.1', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');

    // Thinking: High
    try {
      const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
      if (await thinkingSelect.count() > 0) {
        const cur = await thinkingSelect.innerText();
        if (!cur.includes('High')) {
          await thinkingSelect.click();
          await page.waitForTimeout(400);
          const opt = page.locator('mat-option:has-text("High")').first();
          if (await opt.count() > 0) await opt.click();
        }
      }
    } catch (e) {}

    // Attach start image
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles([s2Start]);
    await page.waitForTimeout(2500);

    const ackBtn = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
    if (await ackBtn.isVisible().catch(() => false)) await ackBtn.click();

    const promptEnd = `OverSimplified 2D cartoon style, 16:9 widescreen composition.
ENDING KEYFRAME: The exact same scene as Image 1. An empty red-cushioned golden royal throne sits abandoned on top of a lonely dusty grassy hill under a vast open blue sky with white clouds. In the foreground on the grass rests the ancient broken stone crown. A gentle prairie wind blows wisps of dry grass and dust across the quiet empty landscape.
CRITICAL MANDATORY CONSISTENCY: Pure 2D flat vector cartoon art, bold 5px black vector outlines, identical throne and hill, NO human beings, NO new characters. --no text, words, captions, watermark, labels`;

    const textarea = page.locator('textarea.textarea, textarea').first();
    await textarea.fill(promptEnd);
    await page.waitForTimeout(1000);

    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    await runBtn.click({ force: true });
    console.log('Run clicked for End Frame. Waiting for generation...');

    let imgSrc = null;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(2500);
      const state = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img')).filter(img => 
          img.src && (img.src.startsWith('blob:') || img.src.includes('googleusercontent.com')) &&
          img.naturalWidth > 400
        );
        const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
        return { hasImg: imgs.length > 0, src: imgs.length > 0 ? imgs[imgs.length - 1].src : null, hasStop: stop };
      });
      if (state.hasImg && !state.hasStop) {
        imgSrc = state.src;
        console.log('🎉 Scene 2 End Frame generated!');
        break;
      }
    }

    if (!imgSrc) throw new Error('Scene 2 End frame generation timed out!');

    const base64Data = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
    }, imgSrc);

    fs.writeFileSync(s2End, Buffer.from(base64Data, 'base64'));
    console.log('💾 Saved:', s2End);
  }

  // Generate Video on Omni 1.1 Flash
  console.log('\nGenerating Scene 2 Video on Gemini Omni 1.1 Flash...');
  await page.goto('https://aistudio.google.com/u/5/prompts/new_chat?model=gemini-omni-1.1-flash', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Aspect ratio: 16:9
  try {
    const aspectSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await aspectSelect.count() > 0) {
      await aspectSelect.click();
      await page.waitForTimeout(400);
      const opt169 = page.locator('mat-option:has-text("16:9")').first();
      if (await opt169.count() > 0) await opt169.click();
    }
  } catch (e) {}

  // Resolution: 720p
  try {
    const resSelect = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(400);
      const opt720 = page.locator('mat-option:has-text("720p")').first();
      if (await opt720.count() > 0) await opt720.click();
    }
  } catch (e) {}

  // Thinking Level: High
  try {
    const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await thinkingSelect.count() > 0) {
      const cur = await thinkingSelect.innerText();
      if (!cur.includes('High')) {
        await thinkingSelect.click();
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option:has-text("High")').first();
        if (await opt.count() > 0) await opt.click();
      }
    }
  } catch (e) {}

  // Attach start and end frames
  console.log('Attaching Start Frame and End Frame...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles([s2Start, s2End]);
  await page.waitForTimeout(2500);

  const promptVid = `Keyframe Animation: Transition smoothly from Image 1 (Starting Frame) to Image 2 (Ending Frame).
Animate this 2D cartoon scene into a smooth 24fps motion video in OverSimplified style:
A cinematic gentle zoom out across the empty golden throne on top of the lonely hill under the wide blue sky. The wind gently rustles the grass around the abandoned throne and broken stone crown as soft clouds drift across the sunny sky.
CRITICAL MANDATORY LOCK: Smooth 2D cartoon animation, 24fps motion, 16:9 widescreen, no sudden changes in art style, no random humans.`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(promptVid);
  await page.waitForTimeout(1000);

  console.log('Clicking Run for Scene 2 video...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click({ force: true });

  let videoSrc = null;
  const t0 = Date.now();
  for (let i = 0; i < 55; i++) {
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      const vid = document.querySelector('video');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      return { hasVid: !!vid && !!vid.src, src: vid ? vid.src : null, hasStop: stop, err: err ? err.innerText : null };
    });

    const elapsed = Math.round((Date.now() - t0) / 1000);
    console.log(`[${elapsed}s] StopBtn: ${state.hasStop} | VideoReady: ${state.hasVid}`);

    if (state.err) throw new Error(`AI Studio error: ${state.err}`);
    if (state.hasVid && !state.hasStop) {
      videoSrc = state.src;
      console.log(`🎉 Scene 2 video successfully generated in ${elapsed}s!`);
      break;
    }
  }

  if (!videoSrc) {
    const vSrc = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? v.src : null;
    });
    if (vSrc) videoSrc = vSrc;
  }

  if (!videoSrc) throw new Error('Scene 2 video timed out!');

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

  fs.writeFileSync(s2Video, Buffer.from(videoBase64, 'base64'));
  console.log(`💾 Saved genuine AI video: ${s2Video}`);
}

run().catch(console.error);
