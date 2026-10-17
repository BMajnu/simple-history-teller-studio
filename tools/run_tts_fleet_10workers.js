// 10-worker parallel Google AI Studio TTS fleet — parameterized, ONE language
// per run, resumable (skips wav > 20KB).
// Model chain (forward-only on quota; dead models are never retried):
//   1. gemini-3.8-flash-tts              — canonical T1 (.Style prompt, Speaker dropdown w/ search)
//   2. gemini-3.8-flash-lite-tts         — same UI as #1
//   3. gemini-3.1-flash-tts-preview      — DIFFERENT UI: Scene field for style steering,
//                                          speech-block textarea accepts [expr] tags and
//                                          may lack this codebase's named voices, so a
//                                          voice-fallback list is used (see VOICE_FALLBACK_31).
//
// Usage:
//   node tools/run_tts_fleet_10workers.js <project_id> <lang>     // lang: bn | en | hi
// Env:  TTS_MODEL=... (force single model) | TTS_SLOTS=3,4 | TTS_PROFILE_DIR=... | ONLY_SCENE=nn | ONLY_LANG first run style
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ID = process.argv[2] || 'simple_itihash_004_first_city';
const LANG = (process.argv[3] || 'bn').toLowerCase();
if (!['bn', 'en', 'hi'].includes(LANG)) {
  console.error('lang must be bn, en or hi');
  process.exit(1);
}

const PROFILE_DIR = process.env.TTS_PROFILE_DIR
  || path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', ID);
const OUT_DIR = path.join(PROJ, 'audio', LANG);

if (!fs.existsSync(path.join(PROJ, 'project.json'))) {
  console.error(`project.json not found for ${ID}`);
  process.exit(1);
}
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const voiceMapJson = JSON.parse(fs.readFileSync(path.join(PROJ, 'CHARACTER_VOICE_MAP.json'), 'utf8'));

const ACCOUNT_SLOTS = (process.env.TTS_SLOTS
  ? process.env.TTS_SLOTS.split(',').map((n) => parseInt(n.trim(), 10))
  : [0, 1, 2, 3, 4]);
const NUM_WORKERS = 10;
const MODEL_CHAIN = (process.env.TTS_MODEL
  ? [process.env.TTS_MODEL]
  : ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts', 'gemini-3.1-flash-tts-preview']
);
const QUOTA_RE = /quota exceeded|exceeded quota|daily limit|Failed to generate content|Upgrade to unlock/i;
const IS_31 = (m) => /3\.1-flash-tts/.test(m);

// 3.1 preview ships a different voice family; try project voice first, then fallbacks.
const VOICE_FALLBACK_31 = {
  TIME_CHRONICLER: ['Cruz', 'Charon', 'Orus', 'Puck', 'Zephyr'],
  NARRATOR: ['Charon', 'Orus', 'Puck', 'Charon Kore', 'Kore'],
  CAT_NEIGHBOR: ['Aoede', 'Leda', 'Callirrhoe', 'Kore', 'Zephyr'],
  URUK_SCRIBE: ['Fenrir', 'Puck', 'Zephyr', 'Enceladus'],
  URUK_KING: ['Fenrir', 'Puck', 'Zephyr', 'Enceladus']
};
const VOICE_FALLBACK_31_DEFAULT = ['Charon', 'Puck', 'Zephyr'];

function buildVoiceMap(vm) {
  const map = {};
  if (vm.cast && typeof vm.cast === 'object') {
    for (const [k, v] of Object.entries(vm.cast)) {
      map[k] = { voice_id: v.voice_id || v.aistudio_voice || 'Charon', style_prompt: v.style_prompt || 'An Authoritative Documentary Narrator, Deep Resonant voice' };
    }
    return map;
  }
  for (const c of vm.characters || []) {
    map[c.id] = {
      voice_id: c.aistudio_voice || c.voice_id || 'Charon',
      style_prompt: c.style_prompt || 'An Authoritative Documentary Narrator, Deep Resonant voice'
    };
  }
  return map;
}
const voiceMap = buildVoiceMap(voiceMapJson);

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
  buffer.writeUInt16LE(1, 20);
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

// Build work queues
const remainingJobs = [];
for (const scene of project.scenes) {
  const pad = String(scene.scene_id).padStart(4, '0');
  const outFile = path.join(OUT_DIR, `scene_${pad}.wav`);
  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 20000) continue;

  const speakerKey = scene.dialogue_speaker || 'NARRATOR';
  const charMeta = voiceMap[speakerKey] || { voice_id: 'Charon', style_prompt: 'An Authoritative Documentary Narrator, Deep Resonant voice' };
  const text = ((scene.narration || {})[LANG] || '').trim();
  if (!text) continue;

  remainingJobs.push({
    shot: scene.scene_id,
    speaker: speakerKey,
    voice: charMeta.voice_id,
    style: charMeta.style_prompt,
    text,
    outFile
  });
}

console.log(`================================================================================`);
console.log(`10-WORKER TTS FLEET PROJECT: ${ID} | LANG: ${LANG}`);
console.log(`Remaining Scenes: ${remainingJobs.length}/${project.scenes.length}`);
console.log(`Model chain (forward-only): ${MODEL_CHAIN.join(' -> ')}`);
console.log(`Slots: u/${ACCOUNT_SLOTS.join(' u/')} | Workers: ${NUM_WORKERS} | Profile: ${path.basename(PROFILE_DIR)}`);
console.log(`Output: ${OUT_DIR}`);
console.log(`================================================================================\n`);

if (remainingJobs.length === 0) {
  console.log(`All ${project.scenes.length} ${LANG.toUpperCase()} audio scenes are already generated!`);
  process.exit(0);
}

const workerBuckets = Array.from({ length: NUM_WORKERS }, () => []);
remainingJobs.forEach((job, idx) => {
  workerBuckets[idx % NUM_WORKERS].push(job);
});

async function runWorker(ctx, workerId, jobs) {
  if (jobs.length === 0) {
    console.log(`[W${workerId}] No jobs assigned.`);
    return { workerId, done: 0, fail: 0 };
  }

  let slot = ACCOUNT_SLOTS[(workerId - 1) % ACCOUNT_SLOTS.length];
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
        if (count > 0) {
          responseFinished = true;
        }
      } catch (e) {}
    }
  });

  const modelDead = new Set();
  let currentModel = null;
  const state = { voice: 'Fola', style: '', sceneStyle: '', substituteFor: null };
  let done = 0;
  let fail = 0;

  const aliveModels = () => MODEL_CHAIN.filter((m) => !modelDead.has(m));

  // Select a voice in the Speaker dropdown with an optional fallback list.
  async function selectVoice(targetVoice, fallbacks) {
    const order = [targetVoice, ...(fallbacks || [])];
    for (const v of order) {
      const speakerBtn = page.locator('button:has-text("Speaker 1")').first();
      await speakerBtn.click({ timeout: 4000 });
      await page.waitForTimeout(800);

      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill(v);
        await page.waitForTimeout(600);

        const voiceOption = page.locator(`.cdk-overlay-container, mat-drawer, mat-sidenav, [role="region"], div`).getByText(v, { exact: true }).first();
        if (await voiceOption.count() > 0) {
          await voiceOption.click();
          await page.waitForTimeout(400);
          const closeBtn = page.locator('button[aria-label="Close"], button:has-text("close")').first();
          if (await closeBtn.count() > 0) await closeBtn.click().catch(() => {});
          else await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          return v;
        }
      } else {
        // no search box: look for the option text directly
        const voiceOption = page.locator(`.cdk-overlay-container, mat-drawer, mat-sidenav, [role="region"], div`).getByText(v, { exact: true }).first();
        if (await voiceOption.count() > 0) {
          await voiceOption.click();
          await page.waitForTimeout(400);
          return v;
        }
      }

      const closeBtn = page.locator('button[aria-label="Close"], button:has-text("close")').first();
      if (await closeBtn.count() > 0) await closeBtn.click().catch(() => {});
      else await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    return null;
  }

  async function failScene(job) {
    const padJ = String(job.shot).padStart(4, '0');
    try { await page.screenshot({ path: path.join(OUT_DIR, `_debug_tts_${LANG}${padJ}.png`) }); } catch (e) {}
  }

  try {
    for (let ji = 0; ji < jobs.length; ji++) {
      const job = jobs[ji];

      if (fs.existsSync(job.outFile) && fs.statSync(job.outFile).size > 20000) {
        console.log(`[W${workerId}] Scene ${job.shot} already present, skipping.`);
        done++;
        continue;
      }

      if (aliveModels().length === 0) {
        console.error(`[W${workerId}] All models quota-dead, aborting remaining jobs.`);
        fail += jobs.length - done - ji;
        break;
      }

      const triedSlotsForLastModel = new Set();
      let sceneDone = false;
      let sceneFailed = false;
      let attemptsOnModel = 0;

      while (!sceneDone && !sceneFailed) {
        const models = aliveModels();
        const model = models[0];
        if (!model) {
          console.error(`[W${workerId}] FAIL Scene ${job.shot}: no alive model left.`);
          sceneFailed = true;
          break;
        }
        const is31 = IS_31(model);

        try {
          if (currentModel !== model) {
            await page.goto(`https://aistudio.google.com/u/${slot}/generate-speech?model=${model}`, {
              waitUntil: 'domcontentloaded',
              timeout: 45000
            });
            await page.waitForTimeout(4000);

            const card = page.locator('[data-testid="create-new-dialog-card"]').first();
            if (await card.count() > 0) {
              await card.click().catch(() => {});
              await page.waitForTimeout(2000);
            }

            await page.locator('textarea').first().waitFor({ state: 'visible', timeout: 20000 });
            currentModel = model;
            state.voice = 'Fola';
            state.style = '';
            state.sceneStyle = '';
            attemptsOnModel = 0;
            console.log(`[W${workerId}/u${slot}] Landed on model ${model}`);
          }

          attemptsOnModel++;
          const attemptStart = Date.now();
          activeChunks = [];
          responseFinished = false;
          let quotaSeen = false;

          // ---- Voice selection ----
          if (state.voice !== job.voice && state.substituteFor !== job.voice) {
            const applied = await selectVoice(job.voice, is31 ? (VOICE_FALLBACK_31[job.speaker] || VOICE_FALLBACK_31_DEFAULT) : null);
            if (applied) {
              if (applied !== job.voice) {
                console.log(`[W${workerId}/u${slot}] Voice ${job.voice} unavailable on ${model}, substituted: ${applied}`);
                state.substituteFor = job.voice;
              }
              state.voice = applied;
            }
          }

          // ---- Style ----
          if (is31) {
            // steer via Scene field
            if (state.sceneStyle !== job.style) {
              const sceneTa = page.locator('textarea').filter({ hasText: '' }).first(); // placeholder check below
              const byPlaceholder = page.locator('textarea[placeholder*="bustling street"], textarea[placeholder*="Scene"]').first();
              const target = (await byPlaceholder.count() > 0) ? byPlaceholder : sceneTa;
              await target.click().catch(() => {});
              await target.fill(`Voice direction for speaker: ${job.style}`).catch(() => {});
              await page.waitForTimeout(400);
              state.sceneStyle = job.style;
            }
          } else {
            if (state.style !== job.style) {
              const styleBtn = page.locator('button:has-text("Style"), button:has-text("An Old Story"), button:has-text("An Authoritative"), button:has-text("deep, resonant")').first();
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
            }
          }

          // ---- Text injection target ----
          let textTa;
          if (is31) {
            // speech block textarea: placeholder contains expression tags examples
            const byExp = page.locator('textarea[placeholder*="amused"], textarea[placeholder*="Expression"], textarea[placeholder*="tags"]').first();
            if (await byExp.count() > 0) textTa = byExp;
            else {
              const tas = page.locator('textarea');
              const n = await tas.count();
              textTa = tas.nth(Math.max(0, n - 1)); // last textarea = speech block
            }
          } else {
            textTa = page.locator('textarea').first();
          }

          await textTa.click().catch(() => {});
          await textTa.fill(job.text);
          await page.waitForTimeout(300);

          await page.locator('button:has-text("Run")').first().click();

          while (Date.now() - attemptStart < 40000) {
            if (!quotaSeen) {
              quotaSeen = await page.evaluate((re) => re.test(document.body.innerText || ''), QUOTA_RE).catch(() => false);
            }
            if ((responseFinished && activeChunks.length > 0) || quotaSeen) break;
            await page.waitForTimeout(600);
          }

          if (!quotaSeen && activeChunks.length > 0) {
            const buffers = activeChunks.map(c => Buffer.from(c, 'base64'));
            const totalPcm = Buffer.concat(buffers);
            const wav = pcmToWav(totalPcm, 24000, 1, 16);
            if (wav.length > 20000) {
              fs.writeFileSync(job.outFile, wav);
              const durSec = (totalPcm.length / 2 / 24000).toFixed(2);
              console.log(`[W${workerId}/u${slot}] OK Scene ${job.shot} -> ${path.basename(job.outFile)} (${durSec}s, ${(wav.length / 1024).toFixed(1)} KB) [${model}]`);
              done++;
              sceneDone = true;
            } else {
              console.error(`[W${workerId}/u${slot}] Scene ${job.shot} audio too small (${wav.length}B).`);
            }
          }

          if (sceneDone) continue;

          if (quotaSeen) {
            console.log(`[W${workerId}/u${slot}] QUOTA: ${model} is dead for today (u/${slot}). Switching forward.`);
            modelDead.add(model);
            currentModel = null;
            attemptsOnModel = 0;
          } else if (attemptsOnModel < 2) {
            console.log(`[W${workerId}/u${slot}] Scene ${job.shot} no audio on ${model} (attempt ${attemptsOnModel}), retrying once.`);
            currentModel = null;
          } else {
            const modelsNow = aliveModels();
            const lastModel = modelsNow[modelsNow.length - 1];
            if (model === lastModel) {
              triedSlotsForLastModel.add(slot);
              let nextSlot = null;
              for (const s of ACCOUNT_SLOTS) {
                if (!triedSlotsForLastModel.has(s)) { nextSlot = s; break; }
              }
              if (nextSlot === null) {
                console.error(`[W${workerId}/u${slot}] FAIL Scene ${job.shot}: all slots tried on ${model}.`);
                sceneFailed = true;
              } else {
                console.log(`[W${workerId}/u${slot}] Scene ${job.shot}: rotating slot u/${slot} -> u/${nextSlot} on ${model}.`);
                slot = nextSlot;
                currentModel = null;
                attemptsOnModel = 0;
              }
            } else {
              console.log(`[W${workerId}/u${slot}] Scene ${job.shot}: escaping unstable model ${model} for this scene.`);
              currentModel = null;
              attemptsOnModel = 0;
              state.voice = 'Fola'; state.style = ''; state.sceneStyle = '';
              // mark scene failed if this was near end of chain (avoid infinite loop)
              sceneFailed = modelsNow.length <= 1;
              if (!sceneFailed) modelDead.add(model); // unstable, stop using it this run
            }
          }
        } catch (err) {
          console.error(`[W${workerId}/u${slot}] Scene ${job.shot} interaction error: ${err.message.slice(0, 120)}`);
          if (attemptsOnModel <= 1) {
            // transient page-load problem: retry the navigation/model once
            currentModel = null;
            state.voice = 'Fola'; state.style = ''; state.sceneStyle = '';
            await page.waitForTimeout(3000);
          } else {
            sceneFailed = true;
          }
        }
      }

      if (sceneFailed) {
        fail++;
        await failScene(job);
      }

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
    return new Promise(resolve => {
      setTimeout(() => {
        runWorker(ctx, workerId, bucket).then(resolve);
      }, idx * 1500);
    });
  });

  const results = await Promise.all(workerPromises);
  console.log('\n================================================================================');
  console.log('10-WORKER FLEET COMPLETED!');
  console.log(JSON.stringify(results, null, 2));
  console.log('================================================================================\n');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal fleet error:', err);
  process.exit(1);
});
