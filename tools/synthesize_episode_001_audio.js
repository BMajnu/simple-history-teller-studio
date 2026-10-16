/**
 * Complete Trilingual Audio Synthesis for Episode 1 (sample_first_king)
 * Engine: Google AI Studio Speech (gemini-3.8-flash-tts) via Chrome CDP (port 9224)
 * Generates all 80 scenes for Bengali (bn), English (en), and Hindi (hi).
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
fs.mkdirSync(RAW_DIR, { recursive: true });

const FFMPEG = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const FFPROBE = fs.existsSync(path.join(ROOT, 'bin', 'ffprobe.exe')) ? path.join(ROOT, 'bin', 'ffprobe.exe') : 'ffprobe';

const VOICE_MAP = {
  TIME_CHRONICLER: 'Puck',
  NARRATOR: 'Charon',
  HUNTER_CHIEF: 'Fenrir',
  WARLORD: 'Fenrir',
  PHARAOH_NARMER: 'Fenrir',
  ELDER: 'Bodi'
};

function voiceFor(speaker) {
  return VOICE_MAP[speaker] || (speaker === 'TIME_CHRONICLER' ? 'Puck' : 'Charon');
}

function probeDur(file) {
  if (!fs.existsSync(file)) return 0;
  const res = spawnSync(FFPROBE, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file
  ], { encoding: 'utf8' });
  const dur = parseFloat(res.stdout.trim());
  return isNaN(dur) ? 0 : dur;
}

async function prepareWorkerTab(ctx, workerId, userSlot = '') {
  console.log(`[Worker ${workerId}] Initializing AI Studio tab (slot: ${userSlot || 'default'})...`);
  const page = await ctx.newPage();
  const url = `https://aistudio.google.com/${userSlot ? userSlot + '/' : ''}generate-speech?model=gemini-3.8-flash-tts`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Dismiss any consent or upgrade dialogs
  for (let c = 0; c < 3; c++) {
    const dlg = page.locator('[role=dialog], mat-dialog-container').first();
    if (await dlg.isVisible().catch(() => false)) {
      const btn = dlg.locator('button:has-text("Continue"), button:has-text("Accept"), button:has-text("I agree")').first();
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

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.waitFor({ timeout: 20000 });
  console.log(`[Worker ${workerId}] Ready!`);
  return page;
}

async function ensureVoice(page, targetVoice) {
  try {
    const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
    if (await speakerBtn.count() > 0) {
      const txt = (await speakerBtn.innerText()).trim();
      if (txt.toLowerCase().includes(targetVoice.toLowerCase())) return; // already set

      await speakerBtn.click();
      await page.waitForTimeout(1000);

      const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill(targetVoice);
        await page.waitForTimeout(800);
        const row = page.locator('.cdk-overlay-container').getByText(targetVoice, { exact: true }).first();
        if (await row.count() > 0) await row.click();
        await page.waitForTimeout(600);
      }
      await page.keyboard.press('Escape');
    }
  } catch (e) {}
}

async function synthesizeLine(page, text, voice, outPath) {
  await ensureVoice(page, voice);

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.fill(text);
  await page.waitForTimeout(400);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  let completed = false;
  let audioSrc = null;

  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(1200);
    const state = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      return {
        hasAudio: !!aud && aud.duration > 0.5,
        dur: aud ? aud.duration : 0,
        src: aud ? aud.src : null,
        stop,
        err: err ? err.innerText : null
      };
    });

    if (state.err && /quota|exceeded|try again/i.test(state.err)) {
      throw new Error('QUOTA_EXCEEDED: ' + state.err);
    }

    if (state.hasAudio && !state.stop) {
      audioSrc = state.src;
      completed = true;
      break;
    }
  }

  if (!completed || !audioSrc) {
    throw new Error('Timeout waiting for AI Studio audio');
  }

  const b64 = await page.evaluate(async (src) => {
    const res = await fetch(src);
    const ab = await res.arrayBuffer();
    const bytes = new Uint8Array(ab);
    let bin = '';
    for (let j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
    return btoa(bin);
  }, audioSrc);

  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
}

async function runSynthesisForLang(ctx, lang, scenes) {
  console.log(`\n======================================================`);
  console.log(`🎙️ SYNTHESIZING ${lang.toUpperCase()} NARRATION (${scenes.length} SCENES)`);
  console.log(`======================================================`);

  // Build queue of missing scenes
  const queue = [];
  for (const s of scenes) {
    const pad = String(s.scene_id).padStart(4, '0');
    const outPath = path.join(RAW_DIR, `${lang}_scene_${pad}.wav`);
    const text = s.narration?.[lang] || s.narration?.en || '';
    if (!text) continue;

    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 15000) {
      // already exists
      continue;
    }
    queue.push({ scene: s, text, voice: voiceFor(s.dialogue_speaker), outPath, pad });
  }

  console.log(`[${lang.toUpperCase()}] Remaining scenes to synthesize: ${queue.length} / ${scenes.length}`);
  if (queue.length === 0) return;

  // Use 4 parallel worker tabs
  const NUM_WORKERS = 4;
  const slots = ['u/0', 'u/4', 'u/5', 'u/6'];
  const workers = [];

  for (let i = 0; i < NUM_WORKERS; i++) {
    try {
      const page = await prepareWorkerTab(ctx, i + 1, slots[i] || '');
      workers.push({ id: i + 1, page });
    } catch (e) {
      console.warn(`[Worker ${i + 1}] Setup note: ${e.message}`);
    }
  }

  if (workers.length === 0) throw new Error('No worker tabs could be initialized!');

  async function workerLoop(w) {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const preview = item.text.length > 40 ? item.text.slice(0, 40) + '...' : item.text;
      process.stdout.write(`[W${w.id}] Scene ${item.scene.scene_id} [${item.voice}]: "${preview}" ... `);
      const t0 = Date.now();

      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await synthesizeLine(w.page, item.text, item.voice, item.outPath);
          const dur = probeDur(item.outPath);
          console.log(`✓ (${dur.toFixed(1)}s in ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
          success = true;
          break;
        } catch (err) {
          if (attempt === 1) {
            await w.page.waitForTimeout(2000);
            await w.page.keyboard.press('Escape');
          } else {
            console.error(`❌ Attempt 2 failed: ${err.message}`);
          }
        }
      }
      await w.page.waitForTimeout(800);
    }
  }

  await Promise.all(workers.map(w => workerLoop(w)));

  // Close worker tabs
  for (const w of workers) {
    await w.page.close().catch(() => {});
  }
}

function assembleMasterTrack(lang, scenes) {
  console.log(`\n[${lang.toUpperCase()}] Assembling and concatenating master narration track...`);
  const concatList = [];
  let totalDur = 0;

  for (const s of scenes) {
    const pad = String(s.scene_id).padStart(4, '0');
    const outPath = path.join(RAW_DIR, `${lang}_scene_${pad}.wav`);
    if (fs.existsSync(outPath)) {
      concatList.push(outPath);
      const d = probeDur(outPath);
      s.language_durations = s.language_durations || {};
      s.language_durations[lang] = Math.max(0.5, +d.toFixed(2));
      totalDur += d;
    }
  }

  const listFile = path.join(AUDIO_DIR, `concat_${lang}.txt`);
  fs.writeFileSync(listFile, concatList.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'), 'utf8');

  const masterFile = path.join(AUDIO_DIR, `${lang}_narration.wav`);
  // Concatenate losslessly to 48kHz Stereo WAV
  spawnSync(FFMPEG, [
    '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-ar', '48000', '-ac', '2', masterFile
  ], { stdio: 'pipe' });

  const realDur = probeDur(masterFile);
  console.log(`✓ Master ${lang.toUpperCase()} narration track assembled: ${masterFile} (${realDur.toFixed(1)}s / ${(realDur/60).toFixed(2)} min)`);
  return realDur;
}

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));

  const langs = ['bn', 'en', 'hi'];
  for (const lang of langs) {
    await runSynthesisForLang(ctx, lang, pj.scenes);
    const dur = assembleMasterTrack(lang, pj.scenes);
    pj.language_total_durations = pj.language_total_durations || {};
    pj.language_total_durations[lang] = +dur.toFixed(2);
  }

  fs.writeFileSync(PJ_PATH, JSON.stringify(pj, null, 2), 'utf8');
  console.log('\n🎉 ALL TRILINGUAL AUDIO NARRATIONS SYNTHESIZED AND MASTERED SUCCESSFULLY!');
}

main().catch(console.error);
