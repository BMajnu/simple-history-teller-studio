const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');
const RAW_OUT = path.join(AUDIO_DIR, 'raw_bgm_lyria.mp3');
const FINAL_BGM = path.join(AUDIO_DIR, 'bgm.mp3');
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');

async function extractAndMaster() {
  console.log('Connecting to Chrome CDP on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('new_music'));
  if (!page) {
    throw new Error('AI Studio Music page not found in Chrome tabs');
  }

  console.log('Fetching audio data from Lyria player in browser...');
  const audioData = await page.evaluate(async () => {
    const audio = document.querySelector('audio');
    if (!audio || !audio.src) return null;

    const resp = await fetch(audio.src);
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return {
      src: audio.src,
      duration: audio.duration,
      b64: btoa(bin)
    };
  });

  if (!audioData || !audioData.b64) {
    throw new Error('Could not extract audio buffer from page');
  }

  console.log(`✓ Audio extracted! Duration: ${audioData.duration.toFixed(1)}s`);

  // Write raw audio
  fs.writeFileSync(RAW_OUT, Buffer.from(audioData.b64, 'base64'));
  const rawSizeMb = (fs.statSync(RAW_OUT).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Saved raw Lyria audio: ${RAW_OUT} (${rawSizeMb} MB)`);

  // Archive previous bgm.mp3
  if (fs.existsSync(FINAL_BGM)) {
    const histDir = path.join(AUDIO_DIR, '_history');
    if (!fs.existsSync(histDir)) fs.mkdirSync(histDir, { recursive: true });
    const backup = path.join(histDir, `bgm_before_lyria_${Date.now()}.mp3`);
    fs.copyFileSync(FINAL_BGM, backup);
    console.log(`Archived previous bgm to ${backup}`);
  }

  // Master with FFmpeg to 961.0s full documentary runtime with -18 dB RMS loudnorm
  console.log('Mastering raw Lyria track to full 961s timeline with EBU R128 loudness normalization...');
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

  const finalSizeMb = (fs.statSync(FINAL_BGM).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ FINAL MASTER BGM SAVED: ${FINAL_BGM} (${finalSizeMb} MB)`);

  if (fs.existsSync(FFPROBE)) {
    const probe = spawnSync(FFPROBE, [
      '-v', 'error',
      '-show_entries', 'format=duration,bit_rate,size:stream=sample_rate,channels,codec_name',
      '-of', 'json',
      FINAL_BGM
    ]);
    if (probe.status === 0) {
      console.log('ffprobe Output:');
      console.log(probe.stdout.toString());
    }
  }

  console.log('===============================================================');
  console.log('SUCCESS! Episode 1 Lyria 3.5 BGM is 100% extracted & mastered!');
  console.log('===============================================================');
  process.exit(0);
}

extractAndMaster().catch(err => {
  console.error('Extraction Error:', err);
  process.exit(1);
});
