// ============================================================================
// Google Flow Automated Video Generator for Remaining 6 Scenes
// Project: projects/simple_itihash_004_bronze_age_collapse
// Scenes: [9, 16, 38, 54, 72, 85]
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const VISUAL = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse', 'visual_assets');

const REMAINING_SCENES = [
  {
    id: 9,
    prompt: 'Dynamic 2D animation in Simple History graphic novel style. Hundreds of two-wheeled Egyptian and Hittite bronze war chariots thundering across a dusty desert battlefield, horses galloping at full sprint, arrows flying, heavy dust clouds billowing, 24fps motion. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients'
  },
  {
    id: 16,
    prompt: 'Dynamic 2D animation in Simple History graphic novel style. A merchant pack caravan of mules and bearded traders struggling against freezing mountain blizzards along treacherous narrow cliff paths in the Hindu Kush, 24fps motion. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients'
  },
  {
    id: 38,
    prompt: 'Dynamic 2D animation in Simple History graphic novel style. Masked mountain raiders with crude spears and torches galloping past thatched mud-brick houses, flames licking thatched roofs, orange firelight casting chaotic shadows, 24fps motion. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients'
  },
  {
    id: 54,
    prompt: 'Dynamic 2D animation in Simple History graphic novel style. Raging inferno devouring the cedar-wood roofs and limestone pillars of Ugarit\'s royal palace, sparks billowing into the black night sky, collapsing stone lintel, 24fps motion. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients'
  },
  {
    id: 72,
    prompt: 'Dynamic 2D animation in Simple History graphic novel style. An ancient bearded blacksmith forcefully hammering a glowing red-hot iron bloom on a crude stone anvil, bright yellow sparks flying into the air, dark forge illuminated by orange coals, 24fps motion. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients'
  },
  {
    id: 85,
    prompt: 'Dynamic 2D animation in Simple History graphic novel style. Time Chronicler closing a heavy leather-bound history book with a gentle knowing smile, blowing out a glowing bronze lantern on his wooden desk, camera slowly pulling back as twilight engulfs the ancient library, warm golden embers fading, 24fps motion. --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients'
  }
];

(async () => {
  console.log(`=== GOOGLE FLOW VIDEO BATCH GENERATOR (${REMAINING_SCENES.length} SCENES) ===`);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  // Open existing Flow project
  await page.goto('https://flow.google.com/project/fe696efb-895e-4a23-b95d-582220360465', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Ensure Video mode is active
  try {
    const trigger = page.locator('button[aria-label="Settings trigger"], button:has-text("crop_16_9")').first();
    const triggerText = await trigger.innerText().catch(() => '');
    if (!triggerText.includes('Video') && !triggerText.includes('ভিডিও')) {
      await trigger.click();
      await page.waitForTimeout(1000);
      const vidBtn = page.locator('button:has-text("Video"), [role="tab"]:has-text("Video")').first();
      if (await vidBtn.count() > 0) {
        await vidBtn.click();
        await page.waitForTimeout(800);
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }
  } catch(e) {}

  for (const item of REMAINING_SCENES) {
    const pad = String(item.id).padStart(4, '0');
    const outFile = path.join(VISUAL, `clip_scene_${pad}.mp4`);

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 100000) {
      console.log(`✓ Scene ${item.id} already exists (${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB), skipping.`);
      continue;
    }

    console.log(`\n------------------------------------------------------------`);
    console.log(`[Google Flow] Generating Scene ${item.id}...`);
    console.log(`------------------------------------------------------------`);

    // Count existing tiles before generating
    const prevTileCount = await page.locator('flow-media-tile, flow-video-tile, [class*="media-tile"], [class*="video-tile"]').count();

    // Type prompt
    const pm = page.locator('div.ProseMirror').first();
    await pm.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(400);
    await page.keyboard.type(item.prompt, { delay: 3 });
    await page.waitForTimeout(800);

    // Click Start generation
    const startBtn = page.locator('button[aria-label="Start generation"], button:has-text("arrow_forward")').first();
    await startBtn.click();
    console.log(`Submitted prompt for Scene ${item.id}, waiting for generation...`);

    // Poll for generation completion (up to ~3 minutes)
    let finished = false;
    for (let p = 0; p < 36; p++) {
      await page.waitForTimeout(5000);
      const curTileCount = await page.locator('flow-media-tile, flow-video-tile, [class*="media-tile"], [class*="video-tile"]').count();
      const isGenerating = await page.evaluate(() => {
        const text = document.body.innerText || '';
        return /generating|rendering|(\d+)%/i.test(text);
      });

      process.stdout.write(`.${isGenerating ? '(busy)' : ''}`);

      if (curTileCount > prevTileCount && !isGenerating && p >= 4) {
        console.log(`\nNew tile finished in poll ${p + 1}!`);
        finished = true;
        break;
      }
    }

    await page.waitForTimeout(3000);

    // Click the newest tile (first tile in grid)
    const latestTile = page.locator('flow-media-tile, flow-video-tile, [class*="media-tile"], [class*="video-tile"]').first();
    await latestTile.click();
    await page.waitForTimeout(2500);

    // Click Download button
    const dlBtn = page.locator('button[aria-label*="Download"], button[aria-label*="ডাউনলোড"], button:has-text("Download")').first();
    if (await dlBtn.count() > 0) {
      await dlBtn.click();
      await page.waitForTimeout(1000);

      const btn720 = page.locator('button, [role="menuitem"]').filter({ hasText: '720p' }).first();
      if (await btn720.count() > 0) {
        console.log(`Downloading 720p for Scene ${item.id}...`);
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 60000 }).catch(() => null),
          btn720.click()
        ]);

        if (download) {
          await download.saveAs(outFile);
          console.log(`✓ SUCCESS! Scene ${item.id} saved to: ${outFile} (${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB)`);
        } else {
          console.error(`Download event timeout on Scene ${item.id}`);
        }
      }
    }

    // Close full view
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
  }

  console.log('\n=== ALL REMAINING FLOW VIDEOS PROCESSED ===');
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal Flow batch error:', err);
  process.exit(1);
});
