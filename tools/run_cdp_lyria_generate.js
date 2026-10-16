const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');
const RAW_OUT = path.join(AUDIO_DIR, 'raw_bgm_lyria.wav');
const FINAL_BGM = path.join(AUDIO_DIR, 'bgm.mp3');
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');

const BGM_PROMPT = `[0:00 - 0:45] Intro: Intensity: 3/10. Ancient prehistoric documentary atmosphere. Resonant low earthen drone and subtle desert wind. Primal hollow log and frame drum percussion. A solitary Middle Eastern Ney reed flute playing a haunting, contemplative ancient melody, evoking 300,000 years of egalitarian hunter-gatherers living in freedom without rulers or kings. No vocals. Instrumental.
[0:45 - 1:30] Build: Intensity: 5/10. The Agricultural Revolution in the Fertile Crescent. Driving acoustic tribal percussion and ancient sistrum rattles enter with steady rhythm. Mesopotamian Oud introduces an enigmatic, suspenseful modal motif. Tension rises as granaries fill, jealousy and tribal border disputes ignite, and early Sumerians elect temporary war chiefs. No vocals. Instrumental.
[1:30 - 2:20] Climax: Intensity: 8/10. Divine kingship and bronze imperial conquest. The rise of Sargon of Akkad and the world's first standing bronze army. Driving heavy war drums, resonant bronze war horns, sweeping cinematic orchestral strings, and regal brass fanfares portraying monumental ziggurats and the terrifying power of the first permanent throne. No vocals. Instrumental.
[2:20 - 2:50] Outro: Intensity: 3/10. Contemplative and reverent historical resolution. Royal cemetery of Ur and Hammurabi's ancient law codes. Decaying Ney flute echoes, gentle acoustic lute arpeggios, and soft desert wind fading into silence, leaving a deep philosophical reverence for the paradox of human civilization. No vocals. Instrumental.`;

async function main() {
  console.log('Connecting to Chrome on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const pages = context.pages();

  let musicPage = pages.find(p => p.url().includes('new_music'));
  if (!musicPage) {
    throw new Error('AI Studio Music page not found in Chrome tabs');
  }

  await musicPage.bringToFront();
  console.log('Active tab:', musicPage.url());

  // Record initial audio src / state
  const initialSrc = await musicPage.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? a.src : null;
  });
  console.log('Initial audio src:', initialSrc?.substring?.(0, 40) || 'none');

  // Focus textarea
  const textarea = musicPage.locator('textarea, div[contenteditable="true"]').first();
  await textarea.click();
  await musicPage.keyboard.press('Control+A');
  await musicPage.keyboard.press('Backspace');
  await musicPage.waitForTimeout(300);

  // Insert text with native event
  await musicPage.keyboard.insertText(BGM_PROMPT);
  console.log('✓ Inserted Episode 1 BGM prompt via keyboard event.');
  await musicPage.waitForTimeout(1000);

  // Find Generate button
  const genBtn = musicPage.locator('button:has-text("Generate")').first();
  console.log('Clicking Generate button...');
  await genBtn.click();

  // Also try Ctrl+Enter just in case
  await musicPage.keyboard.press('Control+Enter');

  console.log('Waiting for generation to start and complete...');
  let completed = false;
  let newSrc = null;

  for (let i = 0; i < 90; i++) {
    await musicPage.waitForTimeout(2000);

    const isGenerating = (await musicPage.locator('button:has-text("Stop"), mat-spinner, .spinner, .generating').count()) > 0;
    const currentSrc = await musicPage.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.src : null;
    });
    const duration = await musicPage.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.duration : 0;
    });

    console.log(`[${i + 1}/90] isGenerating=${isGenerating}, duration=${duration?.toFixed?.(1) || 0}s, srcChanged=${currentSrc !== initialSrc}`);

    if (currentSrc && currentSrc !== initialSrc && !isGenerating && duration > 20) {
      completed = true;
      newSrc = currentSrc;
      console.log(`✓ NEW LYRIA TRACK GENERATED! Duration: ${duration.toFixed(1)}s`);
      break;
    }
  }

  // Screenshot
  const shotPath = path.join(ROOT, 'scratch', 'cdp_lyria_generation_state.png');
  await musicPage.screenshot({ path: shotPath });
  console.log('State screenshot saved to:', shotPath);

  // Extract base64
  console.log('Fetching audio blob from browser memory...');
  const base64Audio = await musicPage.evaluate(async () => {
    const audio = document.querySelector('audio');
    if (!audio || !audio.src) return null;
    try {
      const resp = await fetch(audio.src);
      const buf = await resp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = '';
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    } catch (e) {
      return null;
    }
  });

  if (!base64Audio) {
    throw new Error('Failed to extract audio blob from Lyria player');
  }

  // Save raw WAV
  fs.writeFileSync(RAW_OUT, Buffer.from(base64Audio, 'base64'));
  console.log(`✓ Raw Lyria audio saved to: ${RAW_OUT} (${fs.statSync(RAW_OUT).size} bytes)`);

  // FFmpeg master loop & normalization
  console.log('Mastering raw Lyria audio with FFmpeg (loop to 961s, EBU R128 -18 dB RMS)...');
  const targetDuration = 961;

  const ffmpegArgs = [
    '-hide_banner', '-y',
    '-stream_loop', '-1',
    '-i', RAW_OUT,
    '-t', String(targetDuration),
    '-af', 'loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=out:st=950:d=11',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    '-ar', '48000',
    '-ac', '2',
    FINAL_BGM
  ];

  const r = spawnSync(FFMPEG, ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) {
    throw new Error('FFmpeg mastering failed: ' + r.stderr?.toString());
  }

  console.log(`✓ FINAL MASTER BGM SAVED: ${FINAL_BGM} (${fs.statSync(FINAL_BGM).size} bytes)`);

  const probe = spawnSync(FFPROBE, [
    '-v', 'error',
    '-show_entries', 'format=duration,bit_rate,size:stream=sample_rate,channels,codec_name',
    '-of', 'json',
    FINAL_BGM
  ]);
  if (probe.status === 0) {
    console.log('ffprobe output:', probe.stdout.toString());
  }

  console.log('===============================================================');
  console.log('ALL DONE! Episode 1 Lyria 3.5 BGM is live.');
  console.log('===============================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
