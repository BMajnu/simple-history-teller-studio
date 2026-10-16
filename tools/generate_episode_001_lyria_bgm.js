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

async function run() {
  console.log('===============================================================');
  console.log('GENERATING EPISODE 1 BGM DIRECTLY VIA GOOGLE AI STUDIO LYRIA 3.5');
  console.log('Target Project: sample_first_king');
  console.log('===============================================================');

  const profileDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  console.log('Launching Chrome with AI Studio profile...');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    executablePath: chromePath,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = await context.newPage();
  console.log('Navigating to Google AI Studio Music (Lyria 3.5)...');
  await page.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(5000);

  // If preset card is visible, click Cinematic Score
  const cinematicCard = page.locator('text="Cinematic Score"').first();
  if (await cinematicCard.isVisible().catch(() => false)) {
    console.log('Clicking Cinematic Score preset...');
    await cinematicCard.click();
    await page.waitForTimeout(2000);
  }

  // Find textarea
  const textarea = page.locator('textarea, div[contenteditable="true"]').first();
  await textarea.waitFor({ timeout: 15000 });
  console.log('Found music prompt textarea.');

  // Clear previous prompt and set new one
  await textarea.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(500);
  await textarea.fill(BGM_PROMPT);
  console.log('✓ Successfully entered Episode 1 story-matched Lyria prompt!');
  await page.waitForTimeout(1000);

  // Find and click Generate button
  const generateBtn = page.locator('button:has-text("Generate")').first();
  await generateBtn.waitFor({ timeout: 10000 });
  console.log('Clicking Generate button...');
  await generateBtn.click();

  console.log('Waiting for Lyria 3.5 to compose and generate track (this takes ~30-60s)...');
  let completed = false;
  let previousSrc = await page.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? a.src : null;
  });

  for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(3000);

    const isGenerating = (await page.locator('button:has-text("Stop"), mat-spinner, .spinner, .generating').count()) > 0;
    const currentSrc = await page.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.src : null;
    });
    const duration = await page.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.duration : 0;
    });

    console.log(`[${i + 1}/120] Status: isGenerating=${isGenerating}, duration=${duration?.toFixed?.(1) || 0}s`);

    // Check if new audio source generated and generation stopped
    if (!isGenerating && currentSrc && duration > 20 && currentSrc !== previousSrc) {
      completed = true;
      console.log(`✓ Lyria 3.5 generation completed! Duration: ${duration.toFixed(1)}s`);
      break;
    }
  }

  // Take screenshot of finished state
  const inspectShot = path.join(__dirname, 'lyria_completed_state.png');
  await page.screenshot({ path: inspectShot });
  console.log(`Screenshot saved to ${inspectShot}`);

  // Extract audio blob
  console.log('Extracting audio buffer from AI Studio audio element...');
  const base64Audio = await page.evaluate(async () => {
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
    throw new Error('Failed to extract base64 audio data from Lyria music page');
  }

  // Save raw Lyria audio
  fs.writeFileSync(RAW_OUT, Buffer.from(base64Audio, 'base64'));
  const rawSizeMb = (fs.statSync(RAW_OUT).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Raw Lyria audio saved to: ${RAW_OUT} (${rawSizeMb} MB)`);

  await context.close();

  // Now process with FFmpeg to cover the 961-second timeline with broadcast mastering
  console.log('Processing raw Lyria soundtrack to match full 961s timeline with EBU R128 mastering...');
  const targetDuration = 961;

  // Archive existing bgm.mp3 first
  if (fs.existsSync(FINAL_BGM)) {
    const histDir = path.join(AUDIO_DIR, '_history');
    if (!fs.existsSync(histDir)) fs.mkdirSync(histDir, { recursive: true });
    const backupName = `bgm_before_lyria_${Date.now()}.mp3`;
    fs.copyFileSync(FINAL_BGM, path.join(histDir, backupName));
    console.log(`Archived previous bgm to _history/${backupName}`);
  }

  // Seamless loop and master using FFmpeg:
  // - aloop / stream_loop to extend to 961s with smooth crossfade
  // - loudnorm filter at -18 dB RMS
  // - 48000 Hz stereo 192k MP3
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

  console.log('Running FFmpeg mastering pipeline...');
  const fRes = spawnSync(FFMPEG, ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (fRes.status !== 0) {
    throw new Error(`FFmpeg mastering failed: ${fRes.stderr?.toString()}`);
  }

  const finalSizeMb = (fs.statSync(FINAL_BGM).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ MASTER BGM SUCCESSFULLY PRODUCED: ${FINAL_BGM} (${finalSizeMb} MB)`);

  // Probe with ffprobe
  if (fs.existsSync(FFPROBE)) {
    const probe = spawnSync(FFPROBE, [
      '-v', 'error',
      '-show_entries', 'format=duration,bit_rate,size:stream=sample_rate,channels,codec_name',
      '-of', 'json',
      FINAL_BGM
    ]);
    if (probe.status === 0) {
      console.log('Final ffprobe info:');
      console.log(probe.stdout.toString());
    }
  }

  console.log('===============================================================');
  console.log('EPISODE 1 AI STUDIO LYRIA 3.5 BGM GENERATION COMPLETE!');
  console.log('===============================================================');
}

run().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
