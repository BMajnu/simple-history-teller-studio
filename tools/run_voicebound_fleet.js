// Production Google AI Studio 10-Worker Fleet using fallback: gemini-3.8-flash-lite-tts
// Follows Episode 002 rules: voice-bound tabs locked once at setup
// Generates English (EN) and Hindi (HI) audio scenes

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_004_bronze_age_collapse');

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const voiceMapJson = JSON.parse(fs.readFileSync(path.join(PROJ, 'CHARACTER_VOICE_MAP.json'), 'utf8'));

const TTS_MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-lite-tts';
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

// 10 Voice-bound workers
const WORKERS = [
  { id: 1, slot: 0, voice: 'Cruz', style: 'An Old Story Teller, Old Man voice' },
  { id: 2, slot: 1, voice: 'Cruz', style: 'An Old Story Teller, Old Man voice' },
  { id: 3, slot: 2, voice: 'Charon', style: 'An Authoritative Documentary Narrator, Deep Resonant voice' },
  { id: 4, slot: 3, voice: 'Charon', style: 'An Authoritative Documentary Narrator, Deep Resonant voice' },
  { id: 5, slot: 4, voice: 'Charon', style: 'An Authoritative Documentary Narrator, Deep Resonant voice' },
  { id: 6, slot: 0, voice: 'Charon', style: 'An Authoritative Documentary Narrator, Deep Resonant voice' },
  { id: 7, slot: 1, voice: 'Charon', style: 'An Authoritative Documentary Narrator, Deep Resonant voice' },
  { id: 8, slot: 2, voice: 'Charon', style: 'An Authoritative Documentary Narrator, Deep Resonant voice' },
  { id: 9, slot: 3, voice: 'Charon', style: 'An Authoritative Documentary Narrator, Deep Resonant voice' },
  { id: 10, slot: 4, voice: 'Charon', style: 'An Authoritative Documentary Narrator, Deep Resonant voice' }
];

const queues = { Cruz: [], Charon: [] };

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

    const targetVoice = charMeta.voice_id === 'Cruz' ? 'Cruz' : 'Charon';
    const text = scene.narration[lang];
    if (!text) continue;

    const job = {
      shot: scene.scene_id,
      lang,
      speaker: speakerKey,
      voice: targetVoice,
      text,
      outFile
    };

    queues[targetVoice].push(job);
  }
}

const cruzWorkers = WORKERS.filter(w => w.voice === 'Cruz');
queues.Cruz.forEach((job, i) => {
  const w = cruzWorkers[i % cruzWorkers.length];
  w.jobs = (w.jobs || []).concat(job);
});

const charonWorkers = WORKERS.filter(w => w.voice === 'Charon');
queues.Charon.forEach((job, i) => {
  const w = charonWorkers[i % charonWorkers.length];
  w.jobs = (w.jobs || []).concat(job);
});

WORKERS.forEach(w => w.jobs = w.jobs || []);
const totalJobs = WORKERS.reduce((a, w) => a + w.jobs.length, 0);

console.log(`================================================================================`);
console.log(`10-WORKER TTS FLEET: FALLBACK MODEL [${TTS_MODEL}]`);
console.log(`Target Languages: [${TARGET_LANGS.join(', ').toUpperCase()}] | Remaining Blocks: ${totalJobs}`);
console.log(`Cruz Jobs: ${queues.Cruz.length} | Charon Jobs: ${queues.Charon.length}`);
console.log(`================================================================================\n`);

if (totalJobs === 0) {
  console.log('All blocks already generated!');
  process.exit(0);
}

async function setupWorker(page, w) {
  console.log(`[W${w.id}/u${w.slot}:${w.voice}] Setting up session...`);
  await page.goto(`https://aistudio.google.com/u/${w.slot}/generate-speech?model=${TTS_MODEL}`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(4000);

  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Set Voice
  const speakerBtn = page.locator('button:has-text("Speaker 1")').first();
  const curSpk = await speakerBtn.innerText().catch(() => '');
  if (!curSpk.includes(w.voice)) {
    await speakerBtn.click().catch(() => {});
    await page.waitForTimeout(800);
    const search = page.locator('input[placeholder*="Search"]').first();
    if (await search.count() > 0) {
      await search.fill(w.voice).catch(() => {});
      await page.waitForTimeout(600);
      const row = page.locator(`.cdk-overlay-container, mat-drawer, mat-sidenav, [role="region"], div`).getByText(w.voice, { exact: true }).first();
      if (await row.count() > 0) await row.click().catch(() => {});
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(600);
  }

  // Set Style
  if (w.style) {
    const styleBtn = page.locator('button:has-text("Style")').first();
    if (await styleBtn.count() > 0) {
      await styleBtn.click().catch(() => {});
      await page.waitForTimeout(800);
      const styleTa = page.locator('textarea[placeholder*="Describe the voice style"], textarea[aria-label="Describe the voice style"]').first();
      if (await styleTa.count() > 0) {
        await styleTa.fill(w.style).catch(() => {});
        await page.waitForTimeout(300);
        await page.keyboard.press('Enter').catch(() => {});
        await page.waitForTimeout(300);
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(600);
      }
    }
  }

  console.log(`[W${w.id}/u${w.slot}:${w.voice}] ✓ Ready (${w.jobs.length} jobs)`);
  return true;
}

async function runWorker(ctx, w) {
  if (w.jobs.length === 0) return { workerId: w.id, done: 0, fail: 0 };
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

  let done = 0;
  let fail = 0;

  try {
    await setupWorker(page, w);
    const ta = page.locator('textarea').first();

    for (let i = 0; i < w.jobs.length; i++) {
      const job = w.jobs[i];
      if (fs.existsSync(job.outFile) && fs.statSync(job.outFile).size > 20000) {
        done++;
        continue;
      }

      activeChunks = [];
      responseFinished = false;

      await ta.click();
      await ta.fill(job.text);
      await page.waitForTimeout(300);

      const runBtn = page.locator('button:has-text("Run")').first();
      await runBtn.click();

      const startTime = Date.now();
      let gotAudio = false;
      while (Date.now() - startTime < 35000) {
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
        console.log(`[W${w.id}:${w.voice}] ✓ Scene ${job.shot} [${job.lang.toUpperCase()}] -> ${path.basename(job.outFile)} (${durSec}s, ${(wav.length / 1024).toFixed(1)} KB)`);
        done++;
      } else {
        console.error(`[W${w.id}:${w.voice}] ✗ Scene ${job.shot} [${job.lang.toUpperCase()}] timed out!`);
        fail++;
      }

      await new Promise(r => setTimeout(r, 1200));
    }
  } catch (err) {
    console.error(`[W${w.id}] Error:`, err.message);
  } finally {
    await page.close().catch(() => {});
  }

  return { workerId: w.id, done, fail };
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

  const workerPromises = WORKERS.map((w, idx) => {
    return new Promise(resolve => {
      setTimeout(() => {
        runWorker(ctx, w).then(resolve);
      }, idx * 1800);
    });
  });

  const results = await Promise.all(workerPromises);
  console.log('\n================================================================================');
  console.log('VOICE-BOUND MULTILINGUAL FLEET COMPLETED!');
  console.log(JSON.stringify(results, null, 2));
  console.log('================================================================================\n');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal fleet error:', err);
  process.exit(1);
});
