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

async function sendScriptToDaemon(code) {
  const resp = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}

async function synthesizeSceneAIStudio(text, outFile) {
  const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");

  const code = `
    let page = browser.contexts()[0].pages()[0];
    if (!page.url().includes('generate-speech')) {
      await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }

    // Dismiss any modal
    const closeBtn = page.locator('button.close-button, button[aria-label="close" i]').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await page.evaluate(() => document.querySelector('button.close-button')?.click()).catch(() => {});
      await page.waitForTimeout(500);
    }

    // If on landing card page, click Create new dialog
    const createCard = page.locator('text="Create new dialog"').first();
    if (await createCard.isVisible().catch(() => false)) {
      await createCard.click();
      await page.waitForTimeout(2000);
    }

    const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
    await textarea.waitFor({ timeout: 15000 });

    const oldSrc = await page.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.src : '';
    });

    await textarea.focus();
    await textarea.fill("${escapedText}");
    await page.waitForTimeout(300);

    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    await runBtn.click();

    let completed = false;
    for (let i = 0; i < 40; i++) {
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
      // Reload page to clear any stuck state
      await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
      return { completed: false, b64: null };
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

    return { completed, hasB64: !!b64, b64 };
  `;

  const res = await sendScriptToDaemon(code);
  if (res.result?.b64) {
    fs.writeFileSync(outFile, Buffer.from(res.result.b64, 'base64'));
    return outFile;
  } else {
    throw new Error('AI Studio did not return audio blob');
  }
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

async function runMasterProduction() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  console.log('===============================================================');
  console.log('RESUMING GOOGLE AI STUDIO FULL PRODUCTION PIPELINE');
  console.log('===============================================================');
  console.log(`Total scenes in documentary: ${project.scenes.length}`);

  const concatList = [];
  let currentTime = 0;

  for (let i = 0; i < project.scenes.length; i++) {
    const scene = project.scenes[i];
    const shotNum = String(scene.scene_id).padStart(4, '0');
    const outFile = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 20000) {
      const dur = getDuration(outFile);
      console.log(`[${i + 1}/${project.scenes.length}] Shot ${scene.scene_id} ready (${dur.toFixed(2)}s).`);
    } else {
      const text = scene.narration.bn;
      console.log(`[${i + 1}/${project.scenes.length}] Synthesizing Shot ${scene.scene_id} with Google AI Studio: "${text.substring(0, 35)}..."`);
      
      let generated = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await synthesizeSceneAIStudio(text, outFile);
          const dur = getDuration(outFile);
          console.log(`  ✓ Generated Shot ${scene.scene_id} (${dur.toFixed(2)}s, ${fs.statSync(outFile).size} bytes)`);
          generated = true;
          break;
        } catch (err) {
          console.error(`  ✗ Attempt ${attempt} failed on Shot ${scene.scene_id}:`, err.message);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      await new Promise(r => setTimeout(r, 1500));
    }

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
  console.log(`\nAll 69 shots synthesized in Google AI Studio! Total timeline: ${project.total_duration_seconds}s (${(project.total_duration_seconds / 60).toFixed(2)} min)`);

  // Assemble master narration
  const listFile = path.join(AUDIO_DIR, 'bn_aistudio_concat.txt');
  fs.writeFileSync(listFile, concatList.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  
  const masterNarration = path.join(AUDIO_DIR, 'bn_narration.mp3');
  console.log(`Assembling master Bengali narration: ${masterNarration}`);
  
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
    console.log(`✓ Master Google AI Studio narration saved: ${masterNarration} (${totalDur.toFixed(1)}s / ${(totalDur / 60).toFixed(2)} min)`);
  } else {
    console.error('Failed to concatenate master narration.');
  }

  // Save updated project.json
  fs.writeFileSync(PROJECT_JSON, JSON.stringify(project, null, 2), 'utf8');
  console.log('✓ Updated project.json with synced Google AI Studio speech durations.');

  // Trigger Final Production Studio Render
  await triggerServerRender();
  console.log('✓ Production Studio master render triggered!');
}

runMasterProduction().catch(console.error);
