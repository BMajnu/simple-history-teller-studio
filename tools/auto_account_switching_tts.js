/**
 * Auto-Account Switching Speech Synthesizer
 * Rotates across authenticated Google slots (u/3, u/0, u/1, u/2, u/4, u/5, u/6)
 * Anchor Voice: Cruz with Style Prompt "An Old Story Teller, Old Man voice"
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
let currentSlotIdx = 0;

async function preparePageForSlot(page, slot) {
  const url = `https://aistudio.google.com/${slot}/generate-speech?model=gemini-3.8-flash-tts`;
  console.log(`\n🔄 Navigating to account slot [${slot}] -> ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Dismiss dialogs if any
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

async function synthesizeWithAutoSwitch(page, text, voice, stylePrompt, outPath) {
  let attempts = 0;
  const maxAttempts = SLOTS.length;

  while (attempts < maxAttempts) {
    const slot = SLOTS[currentSlotIdx];
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

      // Check if upgrade modal immediately intercepts
      let hitModal = false;
      let completed = false;
      let audioData = null;

      for (let i = 0; i < 35; i++) {
        await page.waitForTimeout(1200);

        const modal = page.locator('text="Upgrade to unlock more"').first();
        if (await modal.isVisible().catch(() => false)) {
          hitModal = true;
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

        if (state.err && /quota|exceeded/i.test(state.err)) {
          hitModal = true;
          break;
        }

        if (state.hasAudio && !state.stop && state.src && state.src.startsWith('data:audio/wav;base64,')) {
          audioData = state.src.split(',')[1];
          completed = true;
          break;
        }
      }

      if (hitModal) {
        throw new Error('UPGRADE_MODAL_HIT');
      }

      if (!completed || !audioData) {
        throw new Error('GENERATION_TIMEOUT');
      }

      // Success! Save audio file
      fs.writeFileSync(outPath, Buffer.from(audioData, 'base64'));
      return; // done
    } catch (err) {
      console.warn(`\n⚠️ [Slot ${slot}] ${err.message}. Auto-switching to next account...`);
      currentSlotIdx = (currentSlotIdx + 1) % SLOTS.length;
      attempts++;
      const nextSlot = SLOTS[currentSlotIdx];
      await preparePageForSlot(page, nextSlot);
    }
  }

  throw new Error(`Failed to synthesize after rotating through all accounts!`);
}

async function main() {
  console.log('===============================================================');
  console.log('AUTO-ACCOUNT SWITCHING TRILINGUAL SPEECH SYNTHESIS');
  console.log('Anchor: Cruz + "An Old Story Teller, Old Man voice"');
  console.log(`Available Account Slots: ${SLOTS.join(', ')}`);
  console.log('===============================================================');

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  // Initialize first working slot
  await preparePageForSlot(page, SLOTS[currentSlotIdx]);

  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));

  // 1. All Anchor (TIME_CHRONICLER) scenes in bn, en, hi
  const tcScenes = pj.scenes.filter(s => s.dialogue_speaker === 'TIME_CHRONICLER');
  console.log(`\nFound ${tcScenes.length} Time Chronicler scenes requiring elderly Cruz voice.`);

  const langs = ['bn', 'en', 'hi'];
  for (const lang of langs) {
    console.log(`\n>>> Processing [${lang.toUpperCase()}] Anchor Scenes <<<`);
    for (const scene of tcScenes) {
      const pad = String(scene.scene_id).padStart(4, '0');
      const outPath = path.join(RAW_DIR, `${lang}_scene_${pad}.wav`);
      const text = scene.narration?.[lang] || scene.narration?.en || '';
      if (!text) continue;

      const preview = text.length > 40 ? text.slice(0, 40) + '...' : text;
      process.stdout.write(`[${lang.toUpperCase()}] Scene ${scene.scene_id} [Slot ${SLOTS[currentSlotIdx]}]: "${preview}" ... `);

      const t0 = Date.now();
      await synthesizeWithAutoSwitch(page, text, 'Cruz', 'An Old Story Teller, Old Man voice', outPath);
      const dur = probeDur(outPath);
      console.log(`✓ (${dur.toFixed(1)}s in ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      await page.waitForTimeout(500);
    }
  }

  // 2. Synthesize all missing Hindi narration scenes
  console.log('\n>>> Checking and Synthesizing Missing Hindi Narration Scenes <<<');
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
    process.stdout.write(`[HI] Scene ${scene.scene_id} [${voice}] [Slot ${SLOTS[currentSlotIdx]}]: "${preview}" ... `);

    const t0 = Date.now();
    await synthesizeWithAutoSwitch(page, text, voice, style, outPath);
    const dur = probeDur(outPath);
    console.log(`✓ (${dur.toFixed(1)}s in ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    await page.waitForTimeout(500);
  }

  console.log('\n🎉 ALL TRILINGUAL AUDIO NARRATIONS GENERATED WITH 100% ACCOUNT FAILOVER SUCCESS!');
}

main().catch(console.error);
