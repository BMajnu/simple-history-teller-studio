const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');
const REF_MASCOT = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');

async function run() {
  console.log('--- GENERATING SCENE 78 CONSISTENT KEYFRAMES & AI VIDEO ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const s78Start = path.join(VISUAL_DIR, 'scene_0078_start.jpg');
  const s78End = path.join(VISUAL_DIR, 'scene_0078_end.jpg');
  const s78Video = path.join(VISUAL_DIR, 'clip_scene_0078.mp4');

  // STEP 1: Generate Start Frame if not present
  if (!fs.existsSync(s78Start)) {
    console.log('\n[1/3] Generating Scene 78 Start Frame with Nano Banana 2.1...');
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

    // Attach reference mascot
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles([REF_MASCOT]);
    await page.waitForTimeout(2500);

    const ackBtn = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
    if (await ackBtn.isVisible().catch(() => false)) await ackBtn.click();

    const prompt1 = `OverSimplified 2D cartoon style, 16:9 widescreen composition.
STARTING KEYFRAME: The Time Chronicler (elderly wise historian: bald crown with fluffy white hair on sides, full bushy white beard and mustache, circular wire spectacles, warm inviting smile, wearing brown scholar tunic over muted shirt, stick figure legs, bold 5px black vector outlines) standing in a cozy medieval stone study chamber in front of a warm stone fireplace with glowing fire, holding his antique leather history journal under one arm.
He looks directly at the viewers with a curious, engaging expression.
CRITICAL MANDATORY CONSISTENCY: The character MUST EXACTLY match the reference character: full bushy white beard, white mustache, round wire glasses, bald crown with white side hair, brown scholar tunic. Pure 2D flat vector art, clean white cartoon head, no photorealism. --no text, words, captions, watermark, labels`;

    const textarea = page.locator('textarea.textarea, textarea').first();
    await textarea.fill(prompt1);
    await page.waitForTimeout(1000);

    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    await runBtn.click({ force: true });
    console.log('Run clicked for Start Frame. Waiting for generation...');

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
        console.log('🎉 Start Frame generated!');
        break;
      }
    }

    if (!imgSrc) throw new Error('Start frame generation timed out!');

    const base64Data = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
    }, imgSrc);

    fs.writeFileSync(s78Start, Buffer.from(base64Data, 'base64'));
    console.log('💾 Saved:', s78Start);
  }

  // STEP 2: Generate End Frame if not present
  if (!fs.existsSync(s78End)) {
    console.log('\n[2/3] Generating Scene 78 End Frame with Nano Banana 2.1...');
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

    // Attach start image and reference mascot
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles([s78Start, REF_MASCOT]);
    await page.waitForTimeout(2500);

    const ackBtn = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
    if (await ackBtn.isVisible().catch(() => false)) {
      console.log('Dismissing media modal...');
      await ackBtn.click();
      await page.waitForTimeout(500);
    }

    const prompt2 = `OverSimplified 2D cartoon style, 16:9 widescreen composition.
ENDING KEYFRAME: The Time Chronicler (elderly wise historian: bald crown with fluffy white hair on sides, full bushy white beard and mustache, circular wire spectacles, warm inviting smile, wearing brown scholar tunic over muted shirt, stick figure legs, bold 5px black vector outlines) in the cozy stone study chamber near the fireplace.
In this ending frame, he has playfully cupped one ear with his hand in an inquisitive, listening gesture, smiling warmly at the viewers, inviting them to comment, as cartoon question bubbles softly pop up around him.
CRITICAL MANDATORY CONSISTENCY: The character MUST EXACTLY match the character in Image 1 and Image 2: full bushy white beard, mustache, wire glasses, brown scholar tunic. Pure 2D flat vector art, clean white cartoon head, no photorealism. --no text, words, captions, watermark, labels`;

    const textarea = page.locator('textarea.textarea, textarea').first();
    await textarea.fill(prompt2);
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
        console.log('🎉 End Frame generated!');
        break;
      }
    }

    if (!imgSrc) throw new Error('End frame generation timed out!');

    const base64Data = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
    }, imgSrc);

    fs.writeFileSync(s78End, Buffer.from(base64Data, 'base64'));
    console.log('💾 Saved:', s78End);
  }

  // STEP 3: Generate Video with Start + End Frames on Omni 1.1 Flash
  console.log('\n[3/3] Generating Scene 78 Video on Gemini Omni 1.1 Flash...');
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
  await fileInput.setInputFiles([s78Start, s78End]);
  await page.waitForTimeout(2500);

  const promptVid = `Keyframe Animation: Transition smoothly from Image 1 (Starting Frame) to Image 2 (Ending Frame).
Animate this 2D cartoon scene into a smooth 24fps motion video in OverSimplified style:
The Time Chronicler (elderly wise historian: bald crown with white hair on sides, full bushy white beard and mustache, round wire-rim spectacles, brown scholar tunic) smiles and playfully cups one ear with his hand to ask the audience for their thoughts in the comments in the cozy stone study.
CRITICAL MANDATORY LOCK: The character MUST retain his full white beard, white mustache, spectacles, hair, and brown scholar tunic from frame 1 to the final frame. DO NOT remove the beard. Pure 2D flat animation, 24fps motion, 16:9 widescreen.`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(promptVid);
  await page.waitForTimeout(1000);

  console.log('Clicking Run for Scene 78 video...');
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
      console.log(`🎉 Scene 78 video successfully generated in ${elapsed}s!`);
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

  if (!videoSrc) throw new Error('Scene 78 video timed out!');

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

  fs.writeFileSync(s78Video, Buffer.from(videoBase64, 'base64'));
  console.log(`💾 Saved genuine AI video: ${s78Video}`);
}

run().catch(console.error);
