/**
 * Calibrate and Master Timeline for All 3 Languages (Bengali, English, Hindi)
 * Episode 001: sample_first_king (79 Scenes)
 * 
 * 1. Probes exact duration of every raw narration file:
 *    - audio/raw/bn_scene_XXXX.wav
 *    - audio/raw/en_scene_XXXX.wav
 *    - audio/raw/hi_scene_XXXX.wav
 * 2. Adds 0.35s editorial breathing room to each audio cut into audio/padded/
 * 3. Frame-accurately calculates timestamp_start and timestamp_end
 * 4. Assembles master narration tracks for all 3 languages via FFmpeg:
 *    - audio/bn_narration.wav
 *    - audio/en_narration.wav
 *    - audio/hi_narration.wav
 * 5. Updates project.json with exact duration metrics.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'projects', 'sample_first_king');
const PJ_PATH = path.join(PROJ_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJ_DIR, 'audio');
const RAW_DIR = path.join(AUDIO_DIR, 'raw');
const PADDED_DIR = path.join(AUDIO_DIR, 'padded');
fs.mkdirSync(PADDED_DIR, { recursive: true });

const FFMPEG = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const FFPROBE = fs.existsSync(path.join(ROOT, 'bin', 'ffprobe.exe')) ? path.join(ROOT, 'bin', 'ffprobe.exe') : 'ffprobe';

function probeDur(file) {
  if (!fs.existsSync(file)) return 0;
  try {
    const res = spawnSync(FFPROBE, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file
    ], { encoding: 'utf8' });
    const dur = parseFloat(res.stdout.trim());
    return isNaN(dur) ? 0 : dur;
  } catch (e) {
    return 0;
  }
}

function padAudio(inputWav, outputWav, padSec = 0.35) {
  spawnSync(FFMPEG, [
    '-y', '-i', inputWav,
    '-af', `apad=pad_dur=${padSec}`,
    '-ar', '48000', '-ac', '2',
    outputWav
  ], { stdio: 'pipe' });
}

function calibrate() {
  console.log('========================================================================');
  console.log('MASTER TIMELINE CALIBRATION & MASTERING: TRILINGUAL SUITE');
  console.log('Languages: Bengali (bn), English (en), Hindi (hi)');
  console.log('========================================================================\n');

  const pj = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));
  console.log(`Loaded project: ${pj.title || 'Episode 001'} | Total Scenes: ${pj.scenes.length}`);

  const PAD_SEC = 0.35; // Editorial breathing room
  const langs = ['bn', 'en', 'hi'];
  const masterDurations = {};

  // Verify and calibrate each language
  for (const lang of langs) {
    console.log(`\n--- Calibrating Language: [${lang.toUpperCase()}] ---`);
    let cumTime = 0;
    const concatList = [];

    for (let i = 0; i < pj.scenes.length; i++) {
      const scene = pj.scenes[i];
      const pad = String(scene.scene_id).padStart(4, '0');
      const rawAudio = path.join(RAW_DIR, `${lang}_scene_${pad}.wav`);

      if (!fs.existsSync(rawAudio)) {
        console.warn(`⚠️ Warning: Missing raw audio for [${lang}] Scene ${scene.scene_id}: ${rawAudio}`);
      }

      const durRaw = probeDur(rawAudio);
      const calibratedDur = +(durRaw > 0 ? durRaw + PAD_SEC : 8.0).toFixed(2);

      scene.language_durations = scene.language_durations || {};
      scene.language_durations[lang] = calibratedDur;

      // Primary language (Bengali) drives the global video timeline
      if (lang === 'bn') {
        scene.duration = calibratedDur;
        scene.timestamp_start = +cumTime.toFixed(2);
        cumTime += calibratedDur;
        scene.timestamp_end = +cumTime.toFixed(2);
      } else {
        cumTime += calibratedDur;
      }

      // Prepare padded audio file
      const paddedFile = path.join(PADDED_DIR, `${lang}_scene_${pad}_padded.wav`);
      if (durRaw > 0) {
        padAudio(rawAudio, paddedFile, PAD_SEC);
      }
      concatList.push(paddedFile);
    }

    console.log(`✓ [${lang.toUpperCase()}] Padded ${concatList.length} files. Total duration: ${cumTime.toFixed(2)}s (${(cumTime / 60).toFixed(2)} min)`);

    // Concatenate into Master narration file
    const concatTxt = path.join(AUDIO_DIR, `concat_${lang}.txt`);
    fs.writeFileSync(concatTxt, concatList.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'), 'utf8');

    const masterWav = path.join(AUDIO_DIR, `${lang}_narration.wav`);
    console.log(`Assembling master track: ${masterWav}...`);
    spawnSync(FFMPEG, [
      '-y', '-f', 'concat', '-safe', '0', '-i', concatTxt,
      '-ar', '48000', '-ac', '2', masterWav
    ], { stdio: 'pipe' });

    const realDur = probeDur(masterWav);
    masterDurations[lang] = +realDur.toFixed(2);
    console.log(`✓ [${lang.toUpperCase()}] Master WAV Generated: ${masterWav} (${realDur.toFixed(2)}s)`);
  }

  // Set global timeline metadata
  pj.total_duration_seconds = masterDurations.bn;
  pj.target_duration_seconds = masterDurations.bn;
  pj.language_total_durations = masterDurations;

  // Save calibrated project.json
  const jsonStr = JSON.stringify(pj, null, 2);
  let written = false;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      fs.writeFileSync(PJ_PATH, jsonStr, 'utf8');
      written = true;
      break;
    } catch (e) {
      if (attempt === 10) throw e;
      spawnSync('powershell', ['-Command', 'Start-Sleep -Milliseconds 300']);
    }
  }

  console.log('\n========================================================================');
  console.log('🎉 CALIBRATION COMPLETE & MASTER AUDIO TRACKS ASSEMBLED!');
  console.log(`   Bengali Master (bn): ${masterDurations.bn}s (${(masterDurations.bn / 60).toFixed(2)} min)`);
  console.log(`   English Master (en): ${masterDurations.en}s (${(masterDurations.en / 60).toFixed(2)} min)`);
  console.log(`   Hindi Master (hi):   ${masterDurations.hi}s (${(masterDurations.hi / 60).toFixed(2)} min)`);
  console.log('========================================================================');
}

calibrate();
