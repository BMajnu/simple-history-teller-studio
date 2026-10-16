const fs = require('fs');
const path = require('path');
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
    // Record current audio src before submission
    const oldSrc = await page.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.src : '';
    });

    // Set text
    const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
    await textarea.focus();
    await textarea.fill("${escapedText}");
    await page.waitForTimeout(300);

    // Click Run
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    await runBtn.click();

    // Wait for generation: either src changes or Stop button disappears
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

    // Extract blob
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
    throw new Error('AI Studio failed to return audio blob');
  }
}

async function runBatch(startScene = 1, endScene = 69, lang = 'bn') {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  console.log(`Starting AI Studio Speech Batch for ${lang.toUpperCase()} (Scenes ${startScene} to ${endScene})...`);

  for (let i = startScene - 1; i < endScene; i++) {
    const scene = project.scenes[i];
    const shotNum = String(scene.scene_id).padStart(4, '0');
    const outFile = path.join(RAW_DIR, `${lang}_shot_${shotNum}.wav`);

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 20000) {
      const dur = getDuration(outFile);
      console.log(`[${i + 1}/${endScene}] Shot ${scene.scene_id} already exists (${dur.toFixed(2)}s). Skipping.`);
      continue;
    }

    const text = scene.narration[lang];
    console.log(`[${i + 1}/${endScene}] Synthesizing Shot ${scene.scene_id} with Google AI Studio: "${text.substring(0, 35)}..."`);

    try {
      await synthesizeSceneAIStudio(text, outFile);
      const dur = getDuration(outFile);
      console.log(`  ✓ Generated Shot ${scene.scene_id} (${dur.toFixed(2)}s, ${fs.statSync(outFile).size} bytes)`);
    } catch (err) {
      console.error(`  ✗ Failed Shot ${scene.scene_id}:`, err.message);
    }

    // Friendly delay to maintain quota health
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('Batch complete!');
}

if (require.main === module) {
  // Test first 3 scenes to confirm
  runBatch(1, 3, 'bn').catch(console.error);
}

module.exports = { runBatch };
