const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'visual_assets');

const ALL_TASKS = [
  {
    sceneId: 20,
    image: 'shot_0020.jpg',
    output: 'clip_shot_0020.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Caveman on left hops on one foot screaming in cartoon agony after stubbing bare toe on a sharp rock, while caveman on right pinches nose in extreme disgust from a stinky green odor cloud, 2D cartoon animation, 24fps.'
  },
  {
    sceneId: 23,
    image: 'shot_0023.jpg',
    output: 'clip_shot_0023.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Four primitive cavemen jumping joyfully, cheering with arms raised in victory atop the grassy hilltop after successfully pulling the giant boulder, 2D cartoon animation, 24fps.'
  },
  {
    sceneId: 27,
    image: 'shot_0027.jpg',
    output: 'clip_shot_0027.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Pharaoh Psamtik I in his majestic golden Egyptian palace hall walking forward proudly, royal gold robes shimmering, looking around imperial and smug, 2D cartoon animation, 24fps.'
  },
  {
    sceneId: 32,
    image: 'shot_0032.jpg',
    output: 'clip_shot_0032.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Pharaoh Psamtiks jaw drops in comic shock, his eyes popping out as his golden goblet slips from his hand, while priests hold up an ancient scroll showing the Phrygian bread symbol, 2D cartoon animation, 24fps.'
  },
  {
    sceneId: 36,
    image: 'shot_0036.jpg',
    output: 'clip_shot_0036.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Dark stormy ocean waves crashing violently against the rocky cliffs of Inchkeith island as a small wooden rowboat navigates through rain towards the desolate shore, 2D cartoon animation, 24fps.'
  },
  {
    sceneId: 39,
    image: 'shot_0039.jpg',
    output: 'clip_shot_0039.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Emperor Akbar the Great in luxurious Mughal robes pacing through a white marble arched corridor in Agra, stroking his chin thoughtfully with royal authority, 2D cartoon animation, 24fps.'
  },
  {
    sceneId: 46,
    image: 'shot_0046.jpg',
    output: 'clip_shot_0046.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: 3D scientific visualization of a glowing double-helix DNA strand gently rotating, with the FOXP2 gene segment illuminating in bright glowing neon emerald green, 2D scientific cartoon animation, 24fps.'
  },
  {
    sceneId: 48,
    image: 'shot_0048.jpg',
    output: 'clip_shot_0048.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Split comparison showing Neanderthal and modern human side by side, glowing vocal tract and larynx diagrams pulsating in sync inside their throats as they vocalize, 2D animation, 24fps.'
  },
  {
    sceneId: 52,
    image: 'shot_0052.jpg',
    output: 'clip_shot_0052.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: San Bushman hunter in the warm golden Kalahari desert sunset smiling and clicking his tongue, subtle rhythmic soundwave rings rippling out from his lips across the dunes, 2D cartoon animation, 24fps.'
  },
  {
    sceneId: 58,
    image: 'shot_0058.jpg',
    output: 'clip_shot_0058.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Early Ice Age human nomadic tribe trudging through swirling snowdrifts and howling winds along the rugged rocky shoreline of the Red Sea, 2D cartoon animation, 24fps.'
  },
  {
    sceneId: 66,
    image: 'shot_0066.jpg',
    output: 'clip_shot_0066.mp4',
    prompt: 'Animate this 2D cartoon scene into a dynamic 24fps motion clip: Cinematic view of planet Earth floating in space, with glowing golden and cyan neural synaptic networks pulsing across continents, connecting human minds like a cosmic living internet, 2D animation, 24fps.'
  }
];

async function generateSingleClip(ctx, task) {
  const imagePath = path.join(VISUAL_DIR, task.image);
  const outPath = path.join(VISUAL_DIR, task.output);

  console.log(`\n========================================`);
  console.log(`🎬 [START] Scene ${task.sceneId}: ${task.output}`);
  console.log(`Anchor Image: ${task.image}`);
  console.log(`========================================`);

  const page = await ctx.newPage();
  try {
    await page.goto('https://aistudio.google.com/app/prompts/new_chat?model=gemini-omni-1.1-flash', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');

    // 16:9 Aspect Ratio
    const aspectSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: 'Auto' }).first();
    if (await aspectSelect.count() > 0) {
      await aspectSelect.click();
      await page.waitForTimeout(500);
      const option169 = page.locator('mat-option:has-text("16:9"), [role="option"]:has-text("16:9")').first();
      if (await option169.count() > 0) {
        await option169.click();
        await page.waitForTimeout(500);
      }
    }

    // Resolution 720p
    const resSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: '360p' }).first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(500);
      const opt720 = page.locator('mat-option:has-text("720p"), [role="option"]:has-text("720p")').first();
      if (await opt720.count() > 0) {
        await opt720.click();
        await page.waitForTimeout(500);
      }
    }

    // Upload Image
    const addBtn = page.locator('button[aria-label*="Insert images"], button:has-text("add_circle")').first();
    await addBtn.click();
    await page.waitForTimeout(1000);
    const uploadItem = page.locator('button:has-text("Upload"), [role="menuitem"]:has-text("Upload"), span:has-text("Upload")').first();
    const [fc] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 10000 }),
      uploadItem.click()
    ]);
    await fc.setFiles(imagePath);
    await page.waitForTimeout(3000);

    // Fill Prompt
    const textarea = page.locator('textarea.textarea, textarea').first();
    await textarea.click();
    await textarea.fill(task.prompt);
    await page.waitForTimeout(500);

    // Click Run
    const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').first();
    await runBtn.click();
    console.log(`[Scene ${task.sceneId}] Clicked Run, waiting for video rendering...`);

    let videoSrc = null;
    const startTime = Date.now();
    for (let i = 0; i < 45; i++) {
      await page.waitForTimeout(3000);
      const state = await page.evaluate(() => {
        const vid = document.querySelector('video');
        const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
        return {
          hasVid: !!vid && !!vid.src,
          src: vid ? vid.src : null,
          hasStop: stop
        };
      });

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      if (i % 2 === 0) {
        console.log(`[Scene ${task.sceneId}][${elapsed}s] StopBtn: ${state.hasStop} | Video: ${state.hasVid}`);
      }

      if (state.hasVid && !state.hasStop) {
        videoSrc = state.src;
        console.log(`✅ [Scene ${task.sceneId}] Finished in ${elapsed}s!`);
        break;
      }
    }

    if (!videoSrc) {
      throw new Error(`[Scene ${task.sceneId}] Timeout waiting for video`);
    }

    // Extract blob
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
    console.log(`💾 [Scene ${task.sceneId}] Saved ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
    return true;
  } catch (err) {
    console.error(`❌ [Scene ${task.sceneId}] Error:`, err.message);
    try {
      await page.screenshot({ path: `tools/error_scene_${task.sceneId}.png` });
    } catch (e) {}
    return false;
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  console.log('Connecting to Chrome CDP on 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];

  // Close extra blank pages
  const existingPages = ctx.pages();
  for (let i = 1; i < existingPages.length; i++) {
    await existingPages[i].close().catch(() => {});
  }

  console.log(`Queue: ${ALL_TASKS.length} remaining video scenes to render...`);
  for (const task of ALL_TASKS) {
    const success = await generateSingleClip(ctx, task);
    if (!success) {
      console.log(`Retrying Scene ${task.sceneId} once...`);
      await new Promise(r => setTimeout(r, 4000));
      await generateSingleClip(ctx, task);
    }
    // Brief cooldown between generations
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n🎉 ALL REMAINING DYNAMIC VIDEO CLIPS COMPLETED!');
}

main().catch(console.error);
