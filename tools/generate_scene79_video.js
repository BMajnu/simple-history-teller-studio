const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');

async function generateScene79Video() {
  console.log('--- GENERATING SCENE 79 CONSISTENT AI VIDEO (START + END FRAME) ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const startImage = path.join(VISUAL_DIR, 'scene_0079.jpg');
  const endImage = path.join(VISUAL_DIR, 'scene_0079_end.jpg');
  const outPath = path.join(VISUAL_DIR, 'clip_scene_0079.mp4');

  const slots = ['u/1', 'u/2', 'u/4', 'u/5', 'u/3'];
  let success = false;

  for (const slot of slots) {
    console.log(`\nAttempting with slot: ${slot}...`);
    try {
      const url = `https://aistudio.google.com/${slot}/prompts/new_chat?model=gemini-omni-1.1-flash`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');

      // Set Thinking Level to High
      try {
        const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
        if (await thinkingSelect.count() > 0) {
          const currentThinking = await thinkingSelect.innerText();
          if (!currentThinking.includes('High')) {
            await thinkingSelect.click();
            await page.waitForTimeout(400);
            const highOpt = page.locator('mat-option:has-text("High")').first();
            if (await highOpt.count() > 0) await highOpt.click();
          }
        }
      } catch (e) {}

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

      // Upload start and end keyframes
      console.log('Attaching start and end keyframes...');
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles([startImage, endImage]);
      await page.waitForTimeout(3500);

      // Prompt
      const prompt = `Keyframe Animation: Transition smoothly from Image 1 (Starting Frame) to Image 2 (Ending Frame).
Animate this 2D cartoon scene into a smooth 24fps motion video in OverSimplified style:
The Time Chronicler (elderly wise historian: bald crown with white hair on sides, full bushy white beard and mustache, round wire-rim spectacles, brown scholar tunic) holds his illuminated golden feather quill, softly speaking his closing thoughts to the audience, and in a graceful motion raises his hand to wave goodbye as glowing ancient books and scrolls gently drift in the cosmic library.
CRITICAL MANDATORY LOCK: The character MUST retain his full white beard, white mustache, spectacles, hair, and brown scholar tunic from frame 1 to the final frame. DO NOT remove the beard. DO NOT change his facial features or turn him into a beardless young man. Pure 2D flat animation, 24fps motion, 16:9 widescreen.`;

      const textarea = page.locator('textarea.textarea, textarea').first();
      await textarea.fill(prompt);
      await page.waitForTimeout(1000);

      // Check Run button
      const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
      const isDisabled = await runBtn.getAttribute('aria-disabled') === 'true' || await runBtn.getAttribute('disabled');
      const pageText = await page.evaluate(() => document.body.innerText);
      if (isDisabled || pageText.includes('requires a paid API key')) {
        console.warn(`Slot ${slot} not available (disabled=${isDisabled}, paidAlert=${pageText.includes('requires a paid API key')}). Switching slot...`);
        continue;
      }

      console.log(`Clicking Run on slot ${slot}...`);
      await runBtn.click();
      console.log('Monitoring generation...');

      let videoSrc = null;
      const t0 = Date.now();

      for (let i = 0; i < 55; i++) {
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
            console.error(`AI Studio error: ${state.err}`);
            break;
          }

          if (state.hasVid && !state.hasStop) {
            videoSrc = state.src;
            console.log(`🎉 Video successfully generated in ${elapsed}s!`);
            break;
          }
        } catch (e) {
          console.warn('Poll notice:', e.message);
        }
      }

      if (!videoSrc) {
        console.warn(`Slot ${slot} did not produce video, trying next slot...`);
        continue;
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
      console.log(`💾 Saved consistent AI video to: ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
      success = true;
      break;

    } catch (slotErr) {
      console.error(`Error with slot ${slot}:`, slotErr.message);
    }
  }

  if (!success) {
    throw new Error('All account slots failed for Scene 79 video generation!');
  }
}

generateScene79Video().catch(console.error);
