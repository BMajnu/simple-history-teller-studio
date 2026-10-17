// Automated Google AI Studio TTS Generation Fleet for Bronze Age Collapse
// Model: gemini-3.8-flash-tts
// Target: projects/simple_itihash_004_bronze_age_collapse/audio/bn/scene_00XX.wav
// Supports: dry-run, single scene probe, multi-worker parallel slots

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse');
const AUDIO_BN = path.join(PROJ, 'audio', 'bn');
const RAW = path.join(PROJ, 'audio', 'raw');
[AUDIO_BN, RAW].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';
const VOICE_MAP = {
  TIME_CHRONICLER: 'Cruz',
  NARRATOR: 'Charon',
  PHARAOH_RAMESSES_III: 'Fenrir',
  HITTITE_QUEEN_PUDUHEPA: 'Aoede',
  KING_AMMURAPI: 'Charon'
};
const STYLE_PROMPTS = {
  Cruz: 'An Old Story Teller, Old Man voice',
  Charon: 'An Authoritative Documentary Narrator, Deep Resonant voice',
  Fenrir: 'commanding, aggressive, deep booming voice',
  Aoede: 'sorrowful, desperate, pleading voice'
};

const ACCOUNT_SLOTS = [0, 1, 2, 3, 4];
const NUM_WORKERS = Math.max(1, Math.min(6, Number(process.env.NUM_WORKERS) || 2));
const ONLY_SCENE = Number(process.env.ONLY_SCENE) || 0;
const LANG = process.env.LANG || 'bn';

const queue = [];
for (const s of project.scenes) {
  if (ONLY_SCENE && s.scene_id !== ONLY_SCENE) continue;
  const pad = String(s.scene_id).padStart(4, '0');
  const outFile = path.join(PROJ, 'audio', LANG, `scene_${pad}.wav`);
  if (!process.argv.includes('--force') && fs.existsSync(outFile) && fs.statSync(outFile).size > 20000) continue;
  const voice = VOICE_MAP[s.dialogue_speaker] || 'Charon';
  const style = STYLE_PROMPTS[voice] || '';
  queue.push({
    shot: s.scene_id,
    speaker: s.dialogue_speaker,
    voice,
    style,
    text: s.narration[LANG],
    outFile
  });
}

const DRY = process.argv.includes('--dry-run');
console.log(`================================================================================`);
console.log(`BRONZE AGE TTS GENERATION: ${queue.length} scenes pending for [${LANG.toUpperCase()}]`);
console.log(`Workers: ${NUM_WORKERS} | Voice Model: ${TTS_MODEL}`);
console.log(`================================================================================`);

if (DRY) {
  console.log('Dry-run completed successfully.');
  process.exit(0);
}

if (queue.length === 0) {
  console.log(`All audio scenes for [${LANG}] are already synthesized!`);
  process.exit(0);
}

async function textareaVisible(page) {
  return page.locator("textarea[aria-label='Speech block text'], textarea").first().isVisible().catch(() => false);
}

async function ensureSpeechSession(page, slot) {
  await page.goto(`https://aistudio.google.com/u/${slot}/generate-speech?model=${TTS_MODEL}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  if (await textareaVisible(page)) return true;

  const createCard = page.locator('text=Create new dialog, text="Create new dialog"').first();
  if (await createCard.count() > 0) {
    await createCard.click({ force: true }).catch(() => {});
    await page.waitForTimeout(3000);
  }
  if (await textareaVisible(page)) return true;

  for (const label of ['The Master Storyteller', 'Storyteller', 'Single speaker', 'Narrator']) {
    const card = page.locator(`text=${label}`).first();
    if (await card.count() > 0) {
      await card.click({ force: true }).catch(() => {});
      await page.waitForTimeout(3000);
      break;
    }
  }
  return await textareaVisible(page);
}

async function setVoiceAndStyle(page, voiceName, stylePrompt) {
  try {
    const voiceChip = page.locator('.voice-chip, button.voice-playground-chip, button:has-text("Speaker")').first();
    if (await voiceChip.count() > 0) {
      const cur = ((await voiceChip.innerText().catch(() => '')) || '').trim();
      if (!cur.toLowerCase().includes(voiceName.toLowerCase())) {
        await voiceChip.click().catch(() => {});
        await page.waitForTimeout(600);
        const searchInput = page.locator('input[placeholder*="Search"], input[aria-label="Search voices"]').first();
        if (await searchInput.count() > 0) {
          await searchInput.fill(voiceName);
          await page.waitForTimeout(500);
          const row = page.locator(`.cdk-overlay-container, [role="listbox"]`).getByText(voiceName, { exact: false }).first();
          if (await row.count() > 0) await row.click().catch(() => {});
          await page.waitForTimeout(400);
        }
        await page.keyboard.press('Escape');
      }
    }

    if (stylePrompt) {
      const styleBtn = page.locator('button:has-text("Style"), button:has-text("Default")').first();
      if (await styleBtn.count() > 0) {
        await styleBtn.click().catch(() => {});
        await page.waitForTimeout(400);
        const styleInput = page.locator('input[placeholder*="Describe style"], textarea[placeholder*="Describe style"]').first();
        if (await styleInput.count() > 0) {
          await styleInput.fill(stylePrompt);
          await page.keyboard.press('Enter');
        }
        await page.keyboard.press('Escape');
      }
    }
  } catch (err) {
    console.warn(`[Warning] Could not set voice/style: ${err.message}`);
  }
}

async function synthesizeBlock(page, job, workerId, slot) {
  const prevAudioSrcs = await page.evaluate(() => Array.from(document.querySelectorAll('audio')).map(a => a.src || a.currentSrc)).catch(() => []);
  await setVoiceAndStyle(page, job.voice, job.style);

  const ta = page.locator("textarea[aria-label='Speech block text'], textarea").first();
  await ta.click({ force: true });
  await ta.fill('');
  await page.waitForTimeout(200);
  await ta.fill(job.text);
  await page.waitForTimeout(400);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run"), button[aria-label="Generate audio"]').first();
  if (await runBtn.count() > 0) await runBtn.click({ force: true });
  else await page.keyboard.press('Control+Enter');

  let audioData = null;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(2000);
    const quota = await page.evaluate(() => /exceeded quota|Upgrade to unlock|try again later|daily limit/i.test(document.body.innerText || '')).catch(() => false);
    if (quota) return { ok: false, err: 'QUOTA' };

    const result = await page.evaluate(async (prevs) => {
      const auds = Array.from(document.querySelectorAll('audio')).filter(a => a.duration > 0.5 && !isNaN(a.duration));
      if (auds.length === 0) return null;
      const fresh = auds.filter(a => !prevs.includes(a.src || a.currentSrc));
      const target = fresh.length > 0 ? fresh[fresh.length - 1] : auds[auds.length - 1];
      if (!target) return null;
      try {
        const res = await fetch(target.src || target.currentSrc);
        const blob = await res.blob();
        const ab = await blob.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), dur: target.duration, size: bytes.length };
      } catch (e) { return { err: e.message }; }
    }, prevAudioSrcs).catch(() => null);

    if (result && result.b64) {
      audioData = result;
      break;
    }
  }

  if (!audioData) {
    return { ok: false, err: 'TIMEOUT_NO_AUDIO' };
  }

  fs.writeFileSync(job.outFile, Buffer.from(audioData.b64, 'base64'));
  console.log(`[W${workerId}/u${slot}:${job.voice}] ✓ Scene ${job.shot} (${audioData.dur.toFixed(1)}s, ${(audioData.size / 1024).toFixed(0)}KB) -> ${path.basename(job.outFile)}`);
  return { ok: true };
}

async function runWorker(ctx, workerId, jobs) {
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length;
  let slot = ACCOUNT_SLOTS[slotIdx];
  let done = 0, fail = 0;
  console.log(`[Worker ${workerId}] starting u/${slot} with ${jobs.length} scenes...`);

  if (!await ensureSpeechSession(page, slot)) {
    console.log(`[Worker ${workerId}] u/${slot} entry failed, check login.`);
  }

  while (jobs.length > 0) {
    const job = jobs[0];
    let res;
    try {
      res = await synthesizeBlock(page, job, workerId, slot);
    } catch (e) {
      res = { ok: false, err: e.message.slice(0, 60) };
    }

    if (res.ok) {
      jobs.shift();
      done++;
    } else if (res.err === 'QUOTA') {
      slotIdx++;
      slot = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length];
      console.log(`[Worker ${workerId}] Rotating to u/${slot} due to quota...`);
      await ensureSpeechSession(page, slot);
      if (slotIdx > ACCOUNT_SLOTS.length * 2) {
        jobs.shift();
        fail++;
      }
    } else {
      console.log(`[Worker ${workerId}] ✗ Scene ${job.shot} failed: ${res.err}`);
      jobs.shift();
      fail++;
    }
    await page.waitForTimeout(1000);
  }

  await page.close().catch(() => {});
  return { workerId, done, fail };
}

async function main() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1280, height: 720 }
  });

  const buckets = Array.from({ length: NUM_WORKERS }, () => []);
  queue.forEach((j, i) => buckets[i % NUM_WORKERS].push(j));

  console.log(`Launching ${NUM_WORKERS} parallel TTS generation workers...`);
  const results = await Promise.all(buckets.map((b, i) => runWorker(ctx, i + 1, b)));
  console.log(`Results summary:`, JSON.stringify(results, null, 2));

  await ctx.close();
}

if (!DRY) {
  main().catch(err => {
    console.error('Fatal Runner Error:', err.message);
    process.exit(1);
  });
}
