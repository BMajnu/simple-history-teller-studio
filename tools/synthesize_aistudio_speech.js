const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');
const RAW_DIR = path.join(AUDIO_DIR, 'raw_aistudio');

fs.mkdirSync(RAW_DIR, { recursive: true });

const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');

const VOICE_MAP = {
  TIME_CHRONICLER: 'Puck',
  NARRATOR: 'Charon',
  ARCHAEOLOGIST: 'Charon',
  SAN_HUNTER: 'Charon',
  HUNTER_CHIEF: 'Fenrir',
  PRESIDENT_PARIS: 'Fenrir',
  PHARAOH_PSAMTIK: 'Fenrir',
  KING_JAMES: 'Fenrir',
  EMPEROR_AKBAR: 'Fenrir',
  SHEPHERD: 'Puck'
};

async function sendScriptToDaemon(code) {
  const resp = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Daemon error: ${errText}`);
  }
  return await resp.json();
}

async function synthesizeSceneAIStudio(text, outPath, voiceName = 'Puck') {
  const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
  const escapedOutPath = outPath.replace(/\\/g, '\\\\');

  const code = `
    const pages = browser.contexts()[0].pages();
    let ttsPage = pages.find(p => p.url().includes('generate-speech'));
    if (!ttsPage || ttsPage.isClosed()) {
      const ctx = browser.contexts()[0];
      ttsPage = await ctx.newPage();
      await ttsPage.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
      await ttsPage.waitForTimeout(4000);
      const card = ttsPage.locator('.create-dialog-card').first();
      if (await card.count() > 0) {
        await card.click();
        await ttsPage.waitForTimeout(2000);
      }
    }
    await ttsPage.bringToFront();

    // 1. Select voice if different
    const voiceChip = ttsPage.locator('.voice-chip, button.voice-playground-chip').first();
    if (await voiceChip.count() > 0) {
      const currentVoiceText = (await voiceChip.innerText()).trim();
      if (!currentVoiceText.toLowerCase().includes("${voiceName.toLowerCase()}")) {
        await voiceChip.click();
        await ttsPage.waitForTimeout(400);

        const searchInput = ttsPage.locator('input[placeholder*="Search"][placeholder*="voices"], input[aria-label="Search voices"]').first();
        if (await searchInput.count() > 0) {
          await searchInput.fill("${voiceName}");
          await ttsPage.waitForTimeout(400);

          const voiceBtn = ttsPage.locator(\`button[aria-label="${voiceName}"], button.voice-card-content:has-text("${voiceName}")\`).first();
          if (await voiceBtn.count() > 0) {
            await voiceBtn.click();
            await ttsPage.waitForTimeout(300);
          }
        }
        const closeBtn = ttsPage.locator('button[aria-label="Close panel"]').first();
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
          await ttsPage.waitForTimeout(300);
        }
      }
    }

    // 2. Set text
    const textarea = ttsPage.locator('textarea[aria-label="Speech block text"]').first();
    await textarea.focus();
    await textarea.fill('');
    await textarea.fill("${escapedText}");
    await ttsPage.waitForTimeout(300);

    // 3. Click Run
    const runBtn = ttsPage.locator('button.ctrl-enter-submits').first();
    for (let w = 0; w < 10; w++) {
      if (await runBtn.getAttribute('aria-disabled') === 'false') break;
      await ttsPage.waitForTimeout(200);
    }
    await runBtn.click();

    // 4. Wait for download button
    let dlBtn = null;
    for (let i = 0; i < 40; i++) {
      await ttsPage.waitForTimeout(1000);
      const isGenerating = await ttsPage.evaluate(() => {
        const spinner = document.querySelector('mat-spinner, mat-progress-spinner, mat-progress-bar');
        const rBtn = document.querySelector('button.ctrl-enter-submits');
        return !!spinner || (rBtn && rBtn.getAttribute('aria-disabled') === 'true');
      });
      if (!isGenerating) {
        dlBtn = ttsPage.locator('button[aria-label="Download"]').first();
        if (await dlBtn.count() > 0) break;
      }
    }

    if (!dlBtn || await dlBtn.count() === 0) {
      dlBtn = ttsPage.locator('button[aria-label="Download"]').first();
    }

    // 5. Download audio
    const downloadPromise = ttsPage.waitForEvent('download', { timeout: 15000 });
    await dlBtn.click();

    const download = await downloadPromise;
    await download.saveAs("${escapedOutPath}");
    return { ok: true, file: "${escapedOutPath}", voice: "${voiceName}" };
  `;

  const res = await sendScriptToDaemon(code);
  if (!res.ok) throw new Error(JSON.stringify(res));
  return res.result;
}

function getAudioDuration(file) {
  const res = spawnSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', file], { encoding: 'utf8' });
  return parseFloat(JSON.parse(res.stdout).format.duration);
}

async function run() {
  // Load original 22 scenes
  const backupFile = path.join(PROJECT_DIR, 'project_original_22scenes.json');
  const project22 = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

  console.log('===============================================================');
  console.log('STARTING GOOGLE AI STUDIO (gemini-3.8-flash-tts) SYNTHESIS');
  console.log('===============================================================');

  const langs = ['bn', 'en', 'hi'];

  for (const lang of langs) {
    console.log(`\n▶ Synthesizing AI Studio Speech for ${lang.toUpperCase()}...`);
    const sceneFiles = [];

    for (let i = 0; i < project22.scenes.length; i++) {
      const scene = project22.scenes[i];
      const sceneNum = String(scene.scene_id).padStart(4, '0');
      const outFile = path.join(RAW_DIR, `${lang}_scene_${sceneNum}.wav`);
      const voice = VOICE_MAP[scene.dialogue_speaker] || 'Puck';
      const text = scene.narration[lang];

      if (fs.existsSync(outFile) && fs.statSync(outFile).size > 50000) {
        console.log(`[${i + 1}/${project22.scenes.length}] SKIP: ${lang}_scene_${sceneNum}.wav already exists`);
        sceneFiles.push(outFile);
        continue;
      }

      console.log(`[${i + 1}/${project22.scenes.length}] Scene ${scene.scene_id} [Voice: ${voice}]: "${text.substring(0, 45)}..."`);

      let success = false;
      let attempt = 0;
      while (attempt < 3 && !success) {
        attempt++;
        try {
          await synthesizeSceneAIStudio(text, outFile, voice);
          const dur = getAudioDuration(outFile);
          console.log(`   ✓ SUCCESS: ${path.basename(outFile)} (${dur.toFixed(2)}s)`);
          success = true;
          sceneFiles.push(outFile);
        } catch (err) {
          console.error(`   ⚠ Attempt ${attempt} failed:`, err.message);
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      await new Promise(r => setTimeout(r, 500));
    }

    // Assemble dynamic master track for this language
    console.log(`\nMixing master audio track for ${lang.toUpperCase()} with adelay & loudnorm...`);
    const inputs = [];
    const delays = [];
    let offset = 0;
    const PAD = 0.4;

    for (let i = 0; i < sceneFiles.length; i++) {
      const f = sceneFiles[i];
      const dur = getAudioDuration(f);
      const sceneDur = +(dur + PAD).toFixed(3);
      const delayMs = Math.round(offset * 1000);
      inputs.push('-i', f);
      delays.push(`[${i}:a]adelay=${delayMs}|${delayMs},aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[a${i}]`);
      offset += sceneDur;
    }

    const totalDur = +offset.toFixed(3);
    const amixInputs = sceneFiles.map((_, i) => `[a${i}]`).join('');
    const fc = delays.join(';') + ';' +
      `${amixInputs}amix=inputs=${sceneFiles.length}:duration=longest:dropout_transition=0,apad=whole_dur=${totalDur},loudnorm=I=-14:TP=-1.5:LRA=11[out]`;

    const masterFile = path.join(AUDIO_DIR, `${lang}_narration.mp3`);
    const tmpMaster = path.join(AUDIO_DIR, `${lang}_narration.tmp.mp3`);

    const args = [
      '-y',
      ...inputs,
      '-filter_complex', fc,
      '-map', '[out]',
      '-t', String(totalDur),
      '-c:a', 'libmp3lame',
      '-b:a', '192k',
      tmpMaster
    ];

    const proc = spawnSync(FFMPEG, args);
    if (proc.status === 0) {
      if (fs.existsSync(masterFile)) fs.unlinkSync(masterFile);
      fs.renameSync(tmpMaster, masterFile);
      console.log(`🎉 SUCCESS: Master ${lang.toUpperCase()} AI Studio Audio saved: ${masterFile} (${(totalDur / 60).toFixed(2)} min / ${totalDur}s)`);
    } else {
      console.error(`ERROR mixing master for ${lang}`);
    }
  }

  console.log('\nAll 3 languages synthesized via Google AI Studio gemini-3.8-flash-tts!');

  // Trigger render on Production Studio
  console.log('Triggering high-definition re-render with AI Studio studio-grade audio...');
  const payload = JSON.stringify({ langs: ['bn', 'en', 'hi'], bgmDb: -20, duck: true, useBgm: true });
  const req = http.request('http://localhost:4000/api/project/simple_itihash_002_first_language/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('Render response:', d));
  });
  req.write(payload);
  req.end();
}

run().catch(console.error);
