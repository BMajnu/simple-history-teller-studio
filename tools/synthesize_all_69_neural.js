const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { synthesizeSpeech } = require('./tts_helper');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');
const SHOTS_AUDIO_DIR = path.join(AUDIO_DIR, 'shots_neural');

fs.mkdirSync(SHOTS_AUDIO_DIR, { recursive: true });

const FFMPEG = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const FFPROBE = fs.existsSync(path.join(ROOT, 'bin', 'ffprobe.exe')) ? path.join(ROOT, 'bin', 'ffprobe.exe') : 'ffprobe';

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

async function run() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  console.log(`Starting Studio Neural TTS for ${project.project_id}...`);
  console.log(`Total granular shots: ${project.scenes.length}`);

  const languages = [
    { code: 'bn', name: 'Bengali' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' }
  ];

  for (const lang of languages) {
    console.log(`\n========================================`);
    console.log(`Synthesizing Language: ${lang.name} (${lang.code})`);
    console.log(`========================================`);

    const concatList = [];

    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i];
      const shotNum = String(scene.scene_id).padStart(4, '0');
      const text = scene.narration[lang.code] || scene.narration.en;
      const shotAudio = path.join(SHOTS_AUDIO_DIR, `${lang.code}_shot_${shotNum}.mp3`);

      // Synthesize if not exists or empty
      if (!fs.existsSync(shotAudio) || fs.statSync(shotAudio).size < 100) {
        try {
          await synthesizeSpeech(text, lang.code, shotAudio);
        } catch (err) {
          console.error(`  ⚠ Failed to synthesize shot ${scene.scene_id}: ${err.message}`);
        }
      }

      const dur = getDuration(shotAudio);
      if (!scene.language_durations) scene.language_durations = {};
      scene.language_durations[lang.code] = dur;

      concatList.push(shotAudio);

      if ((i + 1) % 10 === 0 || i === project.scenes.length - 1) {
        console.log(`  [${lang.code.toUpperCase()}] Processed ${i + 1}/${project.scenes.length} shots...`);
      }
      
      // Small pause
      await new Promise(r => setTimeout(r, 60));
    }

    // Build master narration track for this language
    const listFile = path.join(AUDIO_DIR, `${lang.code}_shots_concat.txt`);
    fs.writeFileSync(listFile, concatList.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
    
    const masterNarration = path.join(AUDIO_DIR, `${lang.code}_narration.mp3`);
    console.log(`Assembling master ${lang.name} narration track: ${masterNarration}`);
    
    const r = spawnSync(FFMPEG, [
      '-hide_banner', '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-c', 'copy',
      masterNarration
    ]);

    if (r.status === 0) {
      const totalDur = getDuration(masterNarration);
      console.log(`✓ Master ${lang.name} narration complete: ${(totalDur / 60).toFixed(2)} min (${totalDur.toFixed(1)}s)`);
    } else {
      console.error(`✗ Concat failed for ${lang.name}`);
    }
  }

  // Update shot durations based on Bengali timing with breathing room
  let currentTime = 0;
  for (let i = 0; i < project.scenes.length; i++) {
    const scene = project.scenes[i];
    const bnDur = scene.language_durations?.bn || 6.0;
    // Pacing: shot duration matches narration with 0.5s breathing room, min 4.5s
    const shotDur = Math.max(bnDur + 0.5, 4.5);
    scene.duration = Math.round(shotDur * 100) / 100;
    scene.timestamp_start = Math.round(currentTime * 100) / 100;
    currentTime += scene.duration;
    scene.timestamp_end = Math.round(currentTime * 100) / 100;
  }

  project.total_duration_seconds = Math.round(currentTime * 100) / 100;
  console.log(`\n✓ Final calibrated project duration: ${project.total_duration_seconds}s (${(project.total_duration_seconds / 60).toFixed(2)} min)`);

  fs.writeFileSync(PROJECT_JSON, JSON.stringify(project, null, 2), 'utf8');
  console.log(`✓ Updated ${PROJECT_JSON} with exact neural timings.`);
}

run().catch(console.error);
