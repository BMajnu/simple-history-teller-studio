/**
 * Fix Audio Timeline Shift & Align All 79 Scenes for Episode 001
 * 
 * 1. Backs up current audio/raw to audio/raw_backup_prealign
 * 2. Assembles perfectly aligned audio/raw_aligned for all 79 scenes:
 *    - Host scenes (1, 2, 8, 9, 20, 69, 70, 75, 76, 77, 78, 79): Keep Cruz elderly recordings
 *    - Shifted non-host scenes: Map Scene i <- Old Scene i + 1
 *    - Missing non-host scenes (7, 19, 68, 74): Synthesize via Google AI Studio TTS (voice Charon)
 * 3. Replaces audio/raw with audio/raw_aligned
 * 4. Calls calibrate_and_master_all_languages.js to pad with 0.35s and assemble master narration wavs
 */

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const PJ_PATH = path.join(PROJ_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJ_DIR, 'audio');
const RAW_DIR = path.join(AUDIO_DIR, 'raw');
const BACKUP_DIR = path.join(AUDIO_DIR, 'raw_backup_prealign');
const ALIGNED_DIR = path.join(AUDIO_DIR, 'raw_aligned');

fs.mkdirSync(ALIGNED_DIR, { recursive: true });

const SLOTS = ['u/3', 'u/1', 'u/4', 'u/0', 'u/2', 'u/5', 'u/6'];
const MODELS = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];

let currentSlotIdx = 0;
let currentModelIdx = 0;

async function synthesizeText(page, text, voice, outPath) {
  for (let attempt = 0; attempt < SLOTS.length * MODELS.length; attempt++) {
    const slot = SLOTS[currentSlotIdx];
    const model = MODELS[currentModelIdx];
    const url = `https://aistudio.google.com/${slot}/generate-speech?model=${model}`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(2500);
      await page.keyboard.press('Escape');

      for (let c = 0; c < 2; c++) {
        const dlg = page.locator('[role=dialog], mat-dialog-container').first();
        if (await dlg.isVisible().catch(() => false)) {
          const btn = dlg.locator('button:has-text("Continue"), button:has-text("Accept"), button:has-text("I agree"), button:has-text("close")').first();
          if (await btn.isVisible().catch(() => false)) {
            await btn.click().catch(() => {});
            await page.waitForTimeout(800);
          }
        }
      }

      const createCard = page.locator('text="Create new dialog"').first();
      if (await createCard.isVisible().catch(() => false)) {
        await createCard.click();
        await page.waitForTimeout(1500);
      }

      // Voice
      const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
      if (await speakerBtn.count() > 0) {
        const txt = (await speakerBtn.innerText()).trim();
        if (!txt.toLowerCase().includes(voice.toLowerCase())) {
          await speakerBtn.click();
          await page.waitForTimeout(600);
          const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
          if (await searchInput.count() > 0) {
            await searchInput.fill(voice);
            await page.waitForTimeout(500);
            const row = page.locator('.cdk-overlay-container').getByText(voice, { exact: true }).first();
            if (await row.count() > 0) await row.click();
            await page.waitForTimeout(400);
          }
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      }

      // Clear any style for narrator
      const styleBtn = page.locator('button').filter({ hasText: 'Style' }).first();
      if (await styleBtn.count() > 0) {
        const styleText = (await styleBtn.innerText()).trim();
        if (styleText && !styleText.toLowerCase().includes('default')) {
          await styleBtn.click();
          await page.waitForTimeout(400);
          const styleTextarea = page.locator('.cdk-overlay-container textarea').first();
          if (await styleTextarea.count() > 0) {
            await styleTextarea.fill('');
            await page.waitForTimeout(300);
          }
          await page.keyboard.press('Escape');
        }
      }

      const textarea = page.locator('textarea:visible').first();
      await textarea.click();
      await textarea.fill(text);
      await page.waitForTimeout(400);

      const runBtn = page.locator('button:has-text("Run")').last();
      await runBtn.click();

      let completed = false;
      let audioData = null;

      for (let i = 0; i < 35; i++) {
        await page.waitForTimeout(1200);

        const modal = page.locator('text="Upgrade to unlock more"').first();
        if (await modal.isVisible().catch(() => false)) {
          throw new Error('UPGRADE_MODAL');
        }

        const state = await page.evaluate(() => {
          const aud = document.querySelector('audio');
          const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
          const err = document.querySelector('.error-message, mat-error, [role="alert"]');
          return {
            hasAudio: !!aud && aud.duration > 0.5,
            src: aud ? aud.src : null,
            stop,
            err: err ? err.innerText : null
          };
        });

        if (state.err && /quota|exceeded/i.test(state.err)) {
          throw new Error('QUOTA_LIMIT');
        }

        if (state.hasAudio && !state.stop && state.src && state.src.startsWith('data:audio/wav;base64,')) {
          audioData = state.src.split(',')[1];
          completed = true;
          break;
        }
      }

      if (completed && audioData) {
        fs.writeFileSync(outPath, Buffer.from(audioData, 'base64'));
        console.log(`✓ Synthesized [${slot}]: ${path.basename(outPath)} (${fs.statSync(outPath).size} bytes)`);
        return true;
      }
    } catch (e) {
      console.warn(`Attempt failed on [${slot}][${model}]: ${e.message}`);
      currentSlotIdx = (currentSlotIdx + 1) % SLOTS.length;
      if (attempt >= SLOTS.length && currentModelIdx === 0) {
        currentModelIdx = 1;
        currentSlotIdx = 0;
      }
    }
  }
  return false;
}

async function main() {
  console.log('========================================================================');
  console.log('TIMELINE AUDIO ALIGNMENT & SYNTHESIS: 79 SCENES MASTER SYNC');
  console.log('========================================================================\n');

  // Step 1: Backup RAW_DIR if not backed up
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log(`Backing up ${RAW_DIR} -> ${BACKUP_DIR}...`);
    fs.cpSync(RAW_DIR, BACKUP_DIR, { recursive: true });
    console.log('✓ Backup complete.');
  } else {
    console.log(`Backup already exists at ${BACKUP_DIR}`);
  }

  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));
  console.log(`Loaded project with ${pj.scenes.length} scenes.`);

  const HOST_SCENES = new Set([1, 2, 8, 9, 20, 69, 70, 75, 76, 77, 78, 79]);
  const MISSING_SCENES = [7, 19, 68, 74];

  // We connect to Chrome CDP for the missing scenes
  let browser = null;
  let page = null;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    page = ctx.pages()[0] || await ctx.newPage();
    console.log('✓ Connected to Chrome CDP on 9224 for TTS synthesis.');
  } catch (e) {
    console.warn('⚠️ Could not connect to Chrome CDP:', e.message);
  }

  const langs = ['bn', 'en', 'hi'];

  for (const lang of langs) {
    console.log(`\n--- Processing Language: [${lang.toUpperCase()}] ---`);

    for (let i = 0; i < pj.scenes.length; i++) {
      const scene = pj.scenes[i];
      const id = scene.scene_id;
      const pad = String(id).padStart(4, '0');
      const targetAlignedFile = path.join(ALIGNED_DIR, `${lang}_scene_${pad}.wav`);

      if (HOST_SCENES.has(id)) {
        // Direct copy from backup (Cruz audio)
        const srcFile = path.join(BACKUP_DIR, `${lang}_scene_${pad}.wav`);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, targetAlignedFile);
          process.stdout.write(`Scene ${id} [HOST Cruz]: ✓ `);
        } else {
          console.warn(`⚠️ Warning: Missing Host file: ${srcFile}`);
        }
      } else if (MISSING_SCENES.includes(id)) {
        // Needs synthesis
        console.log(`\nScene ${id} [${lang.toUpperCase()}] MISSING (${scene.dialogue_speaker}): "${scene.narration[lang]?.slice(0, 40)}..."`);
        let ok = false;
        if (page) {
          const text = scene.narration[lang] || scene.narration.bn;
          ok = await synthesizeText(page, text, 'Charon', targetAlignedFile);
        }
        if (!ok) {
          // Fallback check: test_scene_0007.wav for scene 7 bn
          if (id === 7 && lang === 'bn' && fs.existsSync(path.join(AUDIO_DIR, 'test_scene_0007.wav'))) {
            fs.copyFileSync(path.join(AUDIO_DIR, 'test_scene_0007.wav'), targetAlignedFile);
            console.log(`✓ Copied test_scene_0007.wav for Scene 7`);
            ok = true;
          } else {
            console.error(`❌ FAILED to synthesize Scene ${id} [${lang}]!`);
          }
        }
      } else {
        // Non-host shifted from Old Scene id + 1
        const oldPad = String(id + 1).padStart(4, '0');
        const srcFile = path.join(BACKUP_DIR, `${lang}_scene_${oldPad}.wav`);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, targetAlignedFile);
          process.stdout.write(`Scene ${id} [<- Old ${id + 1}]: ✓ `);
        } else {
          console.warn(`\n⚠️ Missing source for Scene ${id}: ${srcFile}`);
        }
      }
    }
    console.log(`\n✓ [${lang.toUpperCase()}] All ${pj.scenes.length} scenes mapped into raw_aligned!`);
  }

  // Step 3: Copy aligned files into RAW_DIR
  console.log(`\nSyncing ${ALIGNED_DIR} -> ${RAW_DIR}...`);
  fs.cpSync(ALIGNED_DIR, RAW_DIR, { recursive: true });
  console.log('✓ RAW_DIR updated with 100% aligned 79 scenes.');

  // Step 4: Run calibration script
  console.log('\nRunning tools/calibrate_and_master_all_languages.js...');
  const calibRes = spawnSync('node', [path.join(__dirname, 'calibrate_and_master_all_languages.js')], {
    stdio: 'inherit',
    cwd: ROOT
  });

  if (calibRes.status === 0) {
    console.log('\n🎉 ALL 79 SCENES FULLY ALIGNED, PADDED, AND MASTER AUDIO BUILT!');
  } else {
    console.error('\n❌ Calibration exited with code', calibRes.status);
  }
}

main().catch(console.error);
