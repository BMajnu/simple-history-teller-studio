// Production Google AI Studio 10-Worker Parallel TTS Fleet for Bronze Age Collapse
// Multilingual Fleet (BN, EN, HI)
// Follows canonical fleet pattern from Episode 002 (tools/run_parallel_tts_002.js)
// Modeled with:
//  - 10 concurrent workers across available account slots
//  - Automatic voice and style direction per character:
//      Anchor (TIME_CHRONICLER) -> Cruz + "An Old Story Teller, Old Man voice"
//      Narrator (NARRATOR) -> Charon + "An Authoritative Documentary Narrator, Deep Resonant voice"
//      Guest Ammurapi -> Charon + "Desperate King, Trembling Voice"
//      Guest Ramesses III -> Fenrir + "Mighty Pharaoh, Commanding Battle Roar"
//      Guest Queen Puduhepa -> Aoede + "Sorrowful Queen, Despairing Plea"
//  - Skips already generated audio (> 20KB)
//  - Real-time 24kHz PCM stream capture to lossless WAV

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse');

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const voiceMapJson = JSON.parse(fs.readFileSync(path.join(PROJ, 'CHARACTER_VOICE_MAP.json'), 'utf8'));

const ACCOUNT_SLOTS = [0, 1, 2, 3, 4];
const NUM_WORKERS = 10;

// Configurable target languages (default: en and hi if bn is already completed)
const TARGET_LANGS = process.env.LANGS ? process.env.LANGS.split(',').map(l => l.trim()) : ['en', 'hi'];

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitDepth, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(buffer, 44);

  return buffer;
}

// Build work queues across all target languages
const remainingJobs = [];
for (const lang of TARGET_LANGS) {
  const langDir = path.join(PROJ, 'audio', lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

  for (const scene of project.scenes) {
    const pad = String(scene.scene_id).padStart(4, '0');
    const outFile = path.join(langDir, `scene_${pad}.wav`);
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 20000) continue;

    const speakerKey = scene.dialogue_speaker || 'NARRATOR';
    const charMeta = voiceMapJson.cast[speakerKey] || {
      voice_id: 'Charon',
      style_prompt: 'An Authoritative Documentary Narrator, Deep Resonant voice'
    };

    const text = scene.narration[lang];
    if (!text) continue;

    remainingJobs.push({
      shot: scene.scene_id,
      lang,
      speaker: speakerKey,
      voice: charMeta.voice_id,
      style: charMeta.style_prompt,
      text,
      outFile
    });
  }
}

console.log(`================================================================================`);
console.log(`10-WORKER MULTILINGUAL TTS FLEET: BRONZE AGE COLLAPSE`);
console.log(`Target Languages: [${TARGET_LANGS.join(', ').toUpperCase()}]`);
console.log(`Remaining Scenes To Generate: ${remainingJobs.length}`);
console.log(`Slots: u/0 - u/4 | Workers: ${NUM_WORKERS}`);
console.log(`================================================================================\n`);

if (remainingJobs.length === 0) {
  console.log(`All audio scenes for [${TARGET_LANGS.join(', ')}] are already generated!`);
  process.exit(0);
}

// Partition jobs round-robin among workers
const workerBuckets = Array.from({ length: NUM_WORKERS }, () => []);
remainingJobs.forEach((job, idx) => {
  workerBuckets[idx % NUM_WORKERS].push(job);
});

async function runWorker(ctx, workerId, slot, jobs) {
  if (jobs.length === 0) {
    console.log(`[W${workerId}] No jobs assigned.`);
    return { workerId, done: 0, fail: 0 };
  }

  console.log(`[W${workerId}/u${slot}] Initializing with ${jobs.length} scenes...`);
  const page = await ctx.newPage();

  let activeChunks = [];
  let responseFinished = false;

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('GenerateContent') && res.status() === 200) {
      try {
        const text = await res.text();
        const regex = /\["audio\/l16[^"]*",\s*"([^"]+)"\]/g;
        let m;
        let count = 0;
        while ((m = regex.exec(text)) !== null) {
          activeChunks.push(m[1]);
          count++;
        }
        if (count > 0) responseFinished = true;
      } catch (e) {}
    }
  });

  const state = { voice: 'Fola', style: '' };
  let done = 0;
  let fail = 0;

  try {
    await page.goto(`https://aistudio.google.com/u/${slot}/generate-speech?model=gemini-3.8-flash-tts`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    await page.waitForTimeout(4000);

    const card = page.locator('[data-testid="create-new-dialog-card"]').first();
    if (await card.count() > 0) {
      await card.click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 20000 });

    for (let ji = 0; ji < jobs.length; ji++) {
      const job = jobs[ji];

      if (fs.existsSync(job.outFile) && fs.statSync(job.outFile).size > 20000) {
        console.log(`[W${workerId}] Scene ${job.shot} [${job.lang}] already present, skipping.`);
        done++;
        continue;
      }

      console.log(`[W${workerId}/u${slot}] Starting Scene ${job.shot} [${job.lang.toUpperCase()}] (${job.speaker} -> ${job.voice} | "${job.style}")`);

      // 1. Update Voice if needed
      if (state.voice !== job.voice) {
        try {
          const speakerBtn = page.locator('button:has-text("Speaker 1")').first();
          await speakerBtn.click({ timeout: 4000 });
          await page.waitForTimeout(800);

          const searchInput = page.locator('input[placeholder*="Search"]').first();
          if (await searchInput.count() > 0) {
            await searchInput.fill(job.voice);
            await page.waitForTimeout(600);

            const voiceOption = page.locator(`.cdk-overlay-container, mat-drawer, mat-sidenav, [role="region"], div`).getByText(job.voice, { exact: true }).first();
            if (await voiceOption.count() > 0) {
              await voiceOption.click();
              await page.waitForTimeout(400);
              state.voice = job.voice;
            }
          }

          const closeBtn = page.locator('button[aria-label="Close"], button:has-text("close")').first();
          if (await closeBtn.count() > 0) await closeBtn.click().catch(() => {});
          else await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        } catch (err) {
          console.warn(`[W${workerId}] Voice change warning: ${err.message}`);
        }
      }

      // 2. Update Style if needed
      if (state.style !== job.style) {
        try {
          const styleBtn = page.locator('button:has-text("Style"), button:has-text("An Old Story"), button:has-text("An Authoritative"), button:has-text("Desperate"), button:has-text("Mighty"), button:has-text("Sorrowful")').first();
          await styleBtn.click({ timeout: 4000 });
          await page.waitForTimeout(800);

          const styleTa = page.locator('textarea[placeholder*="Describe the voice style"], textarea[aria-label="Describe the voice style"]').first();
          if (await styleTa.count() > 0) {
            await styleTa.fill(job.style);
            await page.waitForTimeout(300);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(300);
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            state.style = job.style;
          }
        } catch (err) {
          console.warn(`[W${workerId}] Style change warning: ${err.message}`);
        }
      }

      // 3. Inject text & submit
      activeChunks = [];
      responseFinished = false;

      await ta.click();
      await ta.fill(job.text);
      await page.waitForTimeout(300);

      const runBtn = page.locator('button:has-text("Run")').first();
      await runBtn.click();

      // 4. Await streaming chunks
      const startTime = Date.now();
      let gotAudio = false;
      while (Date.now() - startTime < 40000) {
        if (responseFinished && activeChunks.length > 0) {
          gotAudio = true;
          break;
        }
        await page.waitForTimeout(600);
      }

      if (gotAudio && activeChunks.length > 0) {
        const buffers = activeChunks.map(c => Buffer.from(c, 'base64'));
        const totalPcm = Buffer.concat(buffers);
        const wav = pcmToWav(totalPcm, 24000, 1, 16);
        fs.writeFileSync(job.outFile, wav);
        const durSec = (totalPcm.length / 2 / 24000).toFixed(2);
        console.log(`[W${workerId}/u${slot}] ✓ Scene ${job.shot} [${job.lang.toUpperCase()}] -> ${path.basename(job.outFile)} (${durSec}s, ${(wav.length / 1024).toFixed(1)} KB)`);
        done++;
      } else {
        console.error(`[W${workerId}/u${slot}] ✗ Scene ${job.shot} [${job.lang.toUpperCase()}] timed out!`);
        fail++;
      }

      // Breathing delay (T5)
      await new Promise(r => setTimeout(r, 1200));
    }
  } catch (err) {
    console.error(`[W${workerId}] Worker error:`, err.message);
  } finally {
    await page.close().catch(() => {});
  }

  return { workerId, done, fail };
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--window-position=50,50',
      '--window-size=1280,850'
    ],
    viewport: { width: 1280, height: 850 }
  });

  const workerPromises = workerBuckets.map((bucket, idx) => {
    const workerId = idx + 1;
    const slot = ACCOUNT_SLOTS[idx % ACCOUNT_SLOTS.length];
    return new Promise(resolve => {
      setTimeout(() => {
        runWorker(ctx, workerId, slot, bucket).then(resolve);
      }, idx * 1500);
    });
  });

  const results = await Promise.all(workerPromises);
  console.log('\n================================================================================');
  console.log('MULTILINGUAL 10-WORKER FLEET COMPLETED!');
  console.log(JSON.stringify(results, null, 2));
  console.log('================================================================================\n');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal fleet error:', err);
  process.exit(1);
});
