const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'visual_assets');

// Account pool indexes
const USER_SLOTS = [1, 2, 3, 0];
let currentSlotIndex = 0;

const REMAINING_TASKS = [
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

async function generateWithFailover(ctx, task) {
  const imagePath = path.join(VISUAL_DIR, task.image);
  const outPath = path.join(VISUAL_DIR, task.output);

  for (let attempt = 0; attempt < USER_SLOTS.length; attempt++) {
    const slot = USER_SLOTS[currentSlotIndex];
    const url = `https://aistudio.google.com/u/${slot}/prompts/new_chat?model=gemini-omni-1.1-flash`;
    console.log(`\n======================================================`);
    console.log(`🎬 Scene ${task.sceneId} | Account Slot: /u/${slot}/`);
    console.log(`Anchor: ${task.image} -> Output: ${task.output}`);
    console.log(`======================================================`);

    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');

      // Aspect ratio 16:9
      const aspectSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: 'Auto' }).first();
      if (await aspectSelect.count() > 0) {
        await aspectSelect.click();
        await page.waitForTimeout(400);
        const opt169 = page.locator('mat-option:has-text("16:9"), [role="option"]:has-text("16:9")').first();
        if (await opt169.count() > 0) {
          await opt169.click();
          await page.waitForTimeout(400);
        }
      }

      // Resolution 720p
      const resSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: '360p' }).first();
      if (await resSelect.count() > 0) {
        await resSelect.click();
        await page.waitForTimeout(400);
        const opt720 = page.locator('mat-option:has-text("720p"), [role="option"]:has-text("720p")').first();
        if (await opt720.count() > 0) {
          await opt720.click();
          await page.waitForTimeout(400);
        }
      }

      // Upload image
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

      // Fill prompt
      const textarea = page.locator('textarea.textarea, textarea').first();
      await textarea.fill(task.prompt);
      await page.waitForTimeout(500);

      // Run
      const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').first();
      await runBtn.click();
      console.log(`[Scene ${task.sceneId}] Triggered generation on /u/${slot}/, monitoring...`);

      let videoSrc = null;
      let hitRateLimit = false;
      const startTime = Date.now();

      for (let i = 0; i < 40; i++) {
        await page.waitForTimeout(3000);
        const state = await page.evaluate(() => {
          const vid = document.querySelector('video');
          const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
          const text = document.body.innerText;
          const rateLimit = text.includes('rate limit') || text.includes('exceeded quota') || text.includes('quota for the day');
          return {
            hasVid: !!vid && !!vid.src,
            src: vid ? vid.src : null,
            hasStop: stop,
            rateLimit
          };
        });

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        if (state.rateLimit) {
          console.log(`⚠️ [Scene ${task.sceneId}] RATE LIMIT DETECTED on /u/${slot}/! Rotating account...`);
          hitRateLimit = true;
          break;
        }

        if (i % 2 === 0) {
          console.log(`[Scene ${task.sceneId}][${elapsed}s] Stop: ${state.hasStop} | Vid: ${state.hasVid}`);
        }

        if (state.hasVid && !state.hasStop) {
          videoSrc = state.src;
          console.log(`✅ [Scene ${task.sceneId}] Finished in ${elapsed}s!`);
          break;
        }
      }

      if (hitRateLimit) {
        currentSlotIndex = (currentSlotIndex + 1) % USER_SLOTS.length;
        await page.close();
        continue; // try next account slot
      }

      if (!videoSrc) {
        throw new Error(`Timeout waiting for video on Scene ${task.sceneId}`);
      }

      // Download blob
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
      await page.close();
      return true;
    } catch (e) {
      console.error(`❌ [Scene ${task.sceneId} on /u/${slot}/] Error:`, e.message);
      await page.close().catch(() => {});
    }
  }
  return false;
}

async function main() {
  console.log('Connecting to Chrome CDP on 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];

  console.log(`Processing remaining ${REMAINING_TASKS.length} scenes with automatic multi-account failover...`);
  for (const task of REMAINING_TASKS) {
    const ok = await generateWithFailover(ctx, task);
    if (!ok) {
      console.log(`Failed to generate Scene ${task.sceneId} after trying all accounts.`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n🎉 ALL 14 DYNAMIC AI VIDEO CLIPS GENERATED SUCCESSFULLY!');
}

main().catch(console.error);
