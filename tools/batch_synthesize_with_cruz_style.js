/**
 * Batch Synthesizer with Cruz & Style Prompt
 * Speaker: Cruz
 * Style: "An Old Story Teller, Old Man voice"
 * Targets all TIME_CHRONICLER scenes for Episode 001 (sample_first_king)
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

async function setVoice(page, targetVoice) {
  const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
  const txt = (await speakerBtn.innerText()).trim();
  if (txt.toLowerCase().includes(targetVoice.toLowerCase())) return;

  await speakerBtn.click();
  await page.waitForTimeout(600);

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
  await page.waitForTimeout(600);

  const styleTextarea = page.locator('.cdk-overlay-container textarea').first();
  if (await styleTextarea.count() > 0) {
    await styleTextarea.fill(stylePrompt || '');
    await page.waitForTimeout(400);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

async function synthesizeLine(page, text, voice, stylePrompt, outPath) {
  await setVoice(page, voice);
  await setStyle(page, stylePrompt);

  const textarea = page.locator('textarea:visible').first();
  await textarea.click();
  await textarea.fill(text);
  await page.waitForTimeout(400);

  const runBtn = page.locator('button:has-text("Run")').last();
  await runBtn.click();

  let completed = false;
  let audioData = null;

  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(1200);
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
      throw new Error('QUOTA_LIMIT: ' + state.err);
    }

    if (state.hasAudio && !state.stop && state.src && state.src.startsWith('data:audio/wav;base64,')) {
      audioData = state.src.split(',')[1];
      completed = true;
      break;
    }
  }

  if (!completed || !audioData) {
    throw new Error('Timeout waiting for Speech synthesis audio');
  }

  fs.writeFileSync(outPath, Buffer.from(audioData, 'base64'));
}

async function run() {
  console.log('===============================================================');
  console.log('CRUZ ELDERLY MALE VOICE SYNTHESIS FOR TIME CHRONICLER SCENES');
  console.log('Voice: Cruz | Style: "An Old Story Teller, Old Man voice"');
  console.log('===============================================================');

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  console.log('Ensuring u/1 playground session is active...');
  await page.goto('https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    await createCard.click();
    await page.waitForTimeout(2000);
  }

  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));
  const tcScenes = pj.scenes.filter(s => s.dialogue_speaker === 'TIME_CHRONICLER');
  console.log(`Found ${tcScenes.length} Time Chronicler scenes.`);

  const langs = ['bn', 'en', 'hi'];

  for (const lang of langs) {
    console.log(`\n--- Synthesizing ${lang.toUpperCase()} Anchor Scenes ---`);
    for (const scene of tcScenes) {
      const pad = String(scene.scene_id).padStart(4, '0');
      const outPath = path.join(RAW_DIR, `${lang}_scene_${pad}.wav`);
      const text = scene.narration?.[lang] || scene.narration?.en || '';
      if (!text) continue;

      const preview = text.length > 45 ? text.slice(0, 45) + '...' : text;
      process.stdout.write(`Scene ${scene.scene_id} [${lang.toUpperCase()}]: "${preview}" ... `);

      const t0 = Date.now();
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await synthesizeLine(page, text, 'Cruz', 'An Old Story Teller, Old Man voice', outPath);
          const dur = probeDur(outPath);
          console.log(`✓ (${dur.toFixed(1)}s in ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
          success = true;
          break;
        } catch (e) {
          if (attempt === 1) {
            await page.waitForTimeout(2000);
            await page.keyboard.press('Escape');
          } else {
            console.error(`❌ Attempt 2 failed: ${e.message}`);
          }
        }
      }
      await page.waitForTimeout(600);
    }
  }

  console.log('\n🎉 ALL TIME CHRONICLER SCENES RE-SYNTHESIZED WITH CRUZ ELDERLY MALE VOICE!');
}

run().catch(console.error);
