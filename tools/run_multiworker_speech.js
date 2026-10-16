const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');
const RAW_DIR = path.join(AUDIO_DIR, 'raw_aistudio');
fs.mkdirSync(RAW_DIR, { recursive: true });

const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');

const NUM_WORKERS = 5;

function getDuration(file) {
  const res = spawnSync(FFPROBE, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file
  ], { encoding: 'utf8' });
  const dur = parseFloat(res.stdout.trim());
  return isNaN(dur) ? 0 : dur;
}

async function prepareWorkerTab(context, id) {
  console.log(`[Worker ${id}] Initializing Google AI Studio tab...`);
  const page = await context.newPage();
  await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { 
    waitUntil: 'domcontentloaded', 
    timeout: 35000 
  });
  await page.waitForTimeout(2000);
  await page.keyboard.press('Escape');

  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    await createCard.click();
    await page.waitForTimeout(2000);
  }

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.waitFor({ timeout: 15000 });
  console.log(`[Worker ${id}] Ready for parallel synthesis!`);
  return page;
}

async function synthesizeShotOnTab(page, text, outFile, workerId, sceneId) {
  const oldSrc = await page.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? a.src : '';
  });

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.focus();
  await textarea.fill(text);
  await page.waitForTimeout(200);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  let completed = false;
  for (let i = 0; i < 45; i++) {
    await page.waitForTimeout(1000);
    const isStillRunning = await page.locator('button:has-text("Stop")').count() > 0;
    const currentSrc = await page.evaluate(() => document.querySelector('audio')?.src || '');
    const audioDuration = await page.evaluate(() => document.querySelector('audio')?.duration || 0);

    if (!isStillRunning && currentSrc && currentSrc !== oldSrc && audioDuration > 0.5) {
      completed = true;
      break;
    }
  }

  if (!completed) {
    throw new Error('Timeout waiting for AI Studio speech generation');
  }

  const b64 = await page.evaluate(async () => {
    const audio = document.querySelector('audio');
    if (!audio || !audio.src) return null;
    const resp = await fetch(audio.src);
    const arrayBuffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  });

  if (!b64) throw new Error('Could not extract audio blob');

  fs.writeFileSync(outFile, Buffer.from(b64, 'base64'));
}

async function triggerServerRender() {
  return new Promise((resolve, reject) => {
    console.log('Sending render request to Production Studio (http://127.0.0.1:4000)...');
    const payload = JSON.stringify({
      langs: ['bn', 'en', 'hi'],
      bgmDb: -20,
      duck: true,
      useBgm: true
    });

    const req = http.request('http://127.0.0.1:4000/api/project/simple_itihash_002_first_language/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Production Studio render response:', data);
        resolve(data);
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runMultiWorkerProduction() {
  console.log('===============================================================');
  console.log(`LAUNCHING ${NUM_WORKERS}-WORKER PARALLEL GOOGLE AI STUDIO FLEET`);
  console.log('===============================================================');

  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));

  // Build work queue of missing or empty shots
  const workQueue = [];
  for (let i = 0; i < project.scenes.length; i++) {
    const scene = project.scenes[i];
    const shotNum = String(scene.scene_id).padStart(4, '0');
    const outFile = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);

    if (!fs.existsSync(outFile) || fs.statSync(outFile).size < 20000) {
      workQueue.push({ scene, outFile, index: i });
    } else {
      const dur = getDuration(outFile);
      console.log(`Shot ${scene.scene_id} already exists (${dur.toFixed(2)}s, ${fs.statSync(outFile).size} bytes).`);
    }
  }

  console.log(`\nRemaining shots to generate in parallel: ${workQueue.length} / ${project.scenes.length}`);

  if (workQueue.length > 0) {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const context = browser.contexts()[0];

    // Spawn 5 worker tabs
    const workerPages = [];
    for (let i = 1; i <= NUM_WORKERS; i++) {
      const p = await prepareWorkerTab(context, i);
      workerPages.push({ id: i, page: p });
    }

    console.log(`\nAll ${NUM_WORKERS} workers initialized! Commencing parallel generation...`);

    // Worker loop function
    async function workerTask(worker) {
      while (workQueue.length > 0) {
        const item = workQueue.shift();
        if (!item) break;

        const { scene, outFile, index } = item;
        const text = scene.narration.bn;
        console.log(`[Worker ${worker.id}] -> Starting Shot ${scene.scene_id}: "${text.substring(0, 35)}..."`);

        let success = false;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            await synthesizeShotOnTab(worker.page, text, outFile, worker.id, scene.scene_id);
            const dur = getDuration(outFile);
            console.log(`[Worker ${worker.id}] ✓ Finished Shot ${scene.scene_id} (${dur.toFixed(2)}s, ${fs.statSync(outFile).size} bytes)`);
            success = true;
            break;
          } catch (err) {
            console.error(`[Worker ${worker.id}] Attempt ${attempt} failed on Shot ${scene.scene_id}:`, err.message);
            await worker.page.waitForTimeout(2000);
          }
        }
        if (!success) {
          console.error(`[Worker ${worker.id}] ✗ Failed Shot ${scene.scene_id} after 2 attempts.`);
        }
        await worker.page.waitForTimeout(1000);
      }
    }

    // Run all 5 workers concurrently
    await Promise.all(workerPages.map(w => workerTask(w)));

    // Close worker tabs
    for (const w of workerPages) {
      await w.page.close().catch(() => {});
    }
    console.log(`\nAll ${NUM_WORKERS} workers finished!`);
  }

  // Update timestamps and durations in project.json
  console.log('\nRecalculating master timeline from generated audio files...');
  let currentTime = 0;
  const concatList = [];

  for (let i = 0; i < project.scenes.length; i++) {
    const scene = project.scenes[i];
    const shotNum = String(scene.scene_id).padStart(4, '0');
    const outFile = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);

    const dur = getDuration(outFile);
    scene.audio_duration = dur;
    scene.duration = Math.max(Math.round((dur + 0.4) * 100) / 100, 4.5);
    scene.timestamp_start = Math.round(currentTime * 100) / 100;
    currentTime += scene.duration;
    scene.timestamp_end = Math.round(currentTime * 100) / 100;

    if (!scene.language_durations) scene.language_durations = {};
    scene.language_durations.bn = scene.duration;

    concatList.push(outFile);
  }

  project.total_duration_seconds = Math.round(currentTime * 100) / 100;
  console.log(`Total master timeline: ${project.total_duration_seconds}s (${(project.total_duration_seconds / 60).toFixed(2)} min)`);

  // Assemble master Bengali narration
  const listFile = path.join(AUDIO_DIR, 'bn_aistudio_concat.txt');
  fs.writeFileSync(listFile, concatList.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const masterNarration = path.join(AUDIO_DIR, 'bn_narration.mp3');
  console.log(`Concatenating master narration: ${masterNarration}`);

  const r = spawnSync(FFMPEG, [
    '-hide_banner', '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    masterNarration
  ]);

  if (r.status === 0) {
    const totalDur = getDuration(masterNarration);
    console.log(`✓ Master Google AI Studio Bengali narration saved: ${masterNarration} (${totalDur.toFixed(1)}s / ${(totalDur / 60).toFixed(2)} min)`);
  } else {
    console.error('Failed to concatenate master narration.');
  }

  // Write updated project.json
  fs.writeFileSync(PROJECT_JSON, JSON.stringify(project, null, 2), 'utf8');
  console.log('✓ Saved synchronized project.json.');

  // Trigger Production Studio Render
  await triggerServerRender();
  console.log('✓ Master Production Studio render triggered!');
}

runMultiWorkerProduction().catch(console.error);
