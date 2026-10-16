/**
 * Auto Account & Model Switching Speech Synthesizer
 * 
 * Strategy:
 * 1. Primary Model: gemini-3.8-flash-tts (Flagship Speech)
 * 2. Fallback Model: gemini-3.8-flash-lite-tts (3.8 Flash Lite Speech)
 * 3. Rotates across accounts: u/3, u/1, u/4, u/0, u/2, u/5, u/6
 * 4. Anchor Casting: Cruz with Style "An Old Story Teller, Old Man voice"
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const PJ_PATH = path.join(PROJ_DIR, 'project.json');
const RAW_DIR = path.join(PROJ_DIR, 'audio', 'raw');
fs.mkdirSync(RAW_DIR, { recursive: true });

const FFPROBE = fs.existsSync(path.join(ROOT, 'bin', 'ffprobe.exe')) ? path.join(ROOT, 'bin', 'ffprobe.exe') : 'ffprobe';

function probeDur(file) {
  if (!fs.existsSync(file)) return 0;
  try {
    const res = spawnSync(FFPROBE, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file
    ], { encoding: 'utf8' });
    const dur = parseFloat(res.stdout.trim());
    return isNaN(dur) ? 0 : dur;
  } catch (e) {
    return 0;
  }
}

const SLOTS = ['u/3', 'u/1', 'u/4', 'u/0', 'u/2', 'u/5', 'u/6'];
const MODELS = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];

let currentSlotIdx = 0;
let currentModelIdx = 0; // 0 = flash-tts, 1 = flash-lite-tts

async function navigateToCurrentSession(page) {
  const slot = SLOTS[currentSlotIdx];
  const model = MODELS[currentModelIdx];
  const url = `https://aistudio.google.com/${slot}/generate-speech?model=${model}`;
  console.log(`\n🔄 [Session Active] Slot: [${slot}] | Model: [${model}]`);
  
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Dismiss any dialogs
  for (let c = 0; c < 2; c++) {
    const dlg = page.locator('[role=dialog], mat-dialog-container').first();
    if (await dlg.isVisible().catch(() => false)) {
      const btn = dlg.locator('button:has-text("Continue"), button:has-text("Accept"), button:has-text("I agree"), button:has-text("close")').first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }
  }

  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    await createCard.click();
    await page.waitForTimeout(2000);
  }
}

async function setVoice(page, targetVoice) {
  const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
  if (await speakerBtn.count() === 0) return;
  const txt = (await speakerBtn.innerText()).trim();
  if (txt.toLowerCase().includes(targetVoice.toLowerCase())) return;

  await speakerBtn.click();
  await page.waitForTimeout(700);

  const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill(targetVoice);
    await page.waitForTimeout(600);
    const row = page.locator('.cdk-overlay-container').getByText(targetVoice, { exact: true }).first();
    if (await row.count() > 0) await row.click();
    await page.waitForTimeout(400);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
}

async function setStyle(page, stylePrompt) {
  const styleBtn = page.locator('button').filter({ hasText: 'Style' }).first();
  if (await styleBtn.count() === 0) return;

  const currentText = (await styleBtn.innerText()).trim();
  if (stylePrompt && currentText.toLowerCase().includes('old')) return; // already set

  await styleBtn.click();
  await page.waitForTimeout(700);

  const styleTextarea = page.locator('.cdk-overlay-container textarea').first();
  if (await styleTextarea.count() > 0) {
    await styleTextarea.fill(stylePrompt || '');
    await page.waitForTimeout(400);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

async function synthesizeLineWithFailover(page, text, voice, stylePrompt, outPath) {
  let attemptCount = 0;
  const maxTotalAttempts = SLOTS.length * MODELS.length;

  while (attemptCount < maxTotalAttempts) {
    const slot = SLOTS[currentSlotIdx];
    const model = MODELS[currentModelIdx];

    try {
      await setVoice(page, voice);
      if (stylePrompt) await setStyle(page, stylePrompt);

      const textarea = page.locator('textarea:visible').first();
      await textarea.click();
      await textarea.fill(text);
      await page.waitForTimeout(400);

      const runBtn = page.locator('button:has-text("Run")').last();
      const ariaDisabled = await runBtn.getAttribute('aria-disabled');
      if (ariaDisabled === 'true') {
        throw new Error('RUN_BUTTON_DISABLED');
      }

      await runBtn.click();

      // Monitor generation with rate-limit / upgrade modal interception
      let hitQuotaOrModal = false;
      let completed = false;
      let audioData = null;

      for (let i = 0; i < 35; i++) {
        await page.waitForTimeout(1200);

        const modal = page.locator('text="Upgrade to unlock more"').first();
        if (await modal.isVisible().catch(() => false)) {
          hitQuotaOrModal = true;
          break;
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

        if (state.err && /quota|exceeded|try again/i.test(state.err)) {
          hitQuotaOrModal = true;
          break;
        }

        if (state.hasAudio && !state.stop && state.src && state.src.startsWith('data:audio/wav;base64,')) {
          audioData = state.src.split(',')[1];
          completed = true;
          break;
        }
      }

      if (hitQuotaOrModal) {
        throw new Error('QUOTA_OR_UPGRADE_MODAL_HIT');
      }

      if (!completed || !audioData) {
        throw new Error('GENERATION_TIMEOUT');
      }

      // Success!
      fs.writeFileSync(outPath, Buffer.from(audioData, 'base64'));
      return; // done
    } catch (err) {
      console.warn(`\n⚠️ [${slot}][${model}] ${err.message}. Switching...`);
      attemptCount++;

      // Advance slot
      currentSlotIdx = (currentSlotIdx + 1) % SLOTS.length;

      // If we rotated through all slots on this model, switch to the next model (3.8 Flash Lite)
      if (attemptCount >= SLOTS.length && currentModelIdx === 0) {
        console.log(`\n📢 Flagship 3.8 Flash TTS exhausted across slots. Switching to 3.8 Flash Lite TTS!`);
        currentModelIdx = 1;
        currentSlotIdx = 0; // restart slots for lite model
      }

      await navigateToCurrentSession(page);
    }
  }

  throw new Error(`Failed to synthesize after rotating through all accounts and models!`);
}

async function main() {
  console.log('========================================================================');
  console.log('MULTI-TIER AUTO ACCOUNT & MODEL SWITCHING SPEECH ENGINE');
  console.log('Tier 1: gemini-3.8-flash-tts -> Tier 2: gemini-3.8-flash-lite-tts');
  console.log(`Account Pool: ${SLOTS.join(', ')}`);
  console.log('Anchor: Cruz + "An Old Story Teller, Old Man voice"');
  console.log('========================================================================');

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  await navigateToCurrentSession(page);

  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));

  // 1. All Anchor (TIME_CHRONICLER) scenes in Bengali, English, Hindi
  const tcScenes = pj.scenes.filter(s => s.dialogue_speaker === 'TIME_CHRONICLER');
  console.log(`\nFound ${tcScenes.length} Time Chronicler scenes requiring elderly Cruz voice.`);

  const langs = ['bn', 'en', 'hi'];
  for (const lang of langs) {
    console.log(`\n======================================================`);
    console.log(`🎙️ SYNTHESIZING ${lang.toUpperCase()} ANCHOR SCENES`);
    console.log(`======================================================`);

    for (const scene of tcScenes) {
      const pad = String(scene.scene_id).padStart(4, '0');
      const outPath = path.join(RAW_DIR, `${lang}_scene_${pad}.wav`);
      const text = scene.narration?.[lang] || scene.narration?.en || '';
      if (!text) continue;

      const preview = text.length > 40 ? text.slice(0, 40) + '...' : text;
      process.stdout.write(`[${lang.toUpperCase()}] Scene ${scene.scene_id} [${SLOTS[currentSlotIdx]}]: "${preview}" ... `);

      const t0 = Date.now();
      await synthesizeLineWithFailover(page, text, 'Cruz', 'An Old Story Teller, Old Man voice', outPath);
      const dur = probeDur(outPath);
      console.log(`✓ (${dur.toFixed(1)}s in ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      await page.waitForTimeout(400);
    }
  }

  // 2. Synthesize all missing Hindi scenes
  console.log(`\n======================================================`);
  console.log(`🎙️ SYNTHESIZING MISSING HINDI NARRATION SCENES`);
  console.log(`======================================================`);

  for (const scene of pj.scenes) {
    const pad = String(scene.scene_id).padStart(4, '0');
    const outPath = path.join(RAW_DIR, `hi_scene_${pad}.wav`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 15000) {
      continue; // already exists
    }

    const text = scene.narration?.hi || scene.narration?.en || '';
    if (!text) continue;

    const voice = scene.dialogue_speaker === 'TIME_CHRONICLER' ? 'Cruz' : (scene.dialogue_speaker === 'WARLORD' ? 'Fenrir' : 'Charon');
    const style = scene.dialogue_speaker === 'TIME_CHRONICLER' ? 'An Old Story Teller, Old Man voice' : '';

    const preview = text.length > 40 ? text.slice(0, 40) + '...' : text;
    process.stdout.write(`[HI] Scene ${scene.scene_id} [${voice}] [${SLOTS[currentSlotIdx]}]: "${preview}" ... `);

    const t0 = Date.now();
    await synthesizeLineWithFailover(page, text, voice, style, outPath);
    const dur = probeDur(outPath);
    console.log(`✓ (${dur.toFixed(1)}s in ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    await page.waitForTimeout(400);
  }

  console.log('\n🎉 ALL TRILINGUAL AUDIO NARRATIONS COMPLETED WITH AUTO ACCOUNT & MODEL SWITCHING!');
}

main().catch(console.error);
