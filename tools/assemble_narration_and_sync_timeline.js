const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');
const RAW_DIR = path.join(AUDIO_DIR, 'raw_aistudio');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');

async function main() {
  console.log('--- STEP 2 & 3: ASSEMBLE NARRATION & TIMELINE SYNC ---');
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));

  const concatList = [];
  let runningTime = 0;

  for (let i = 0; i < project.scenes.length; i++) {
    const scene = project.scenes[i];
    const shotNum = String(scene.scene_id).padStart(4, '0');
    const wavPath = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);

    if (!fs.existsSync(wavPath)) {
      throw new Error(`Missing audio file: ${wavPath}`);
    }

    // Probe duration using ffprobe
    const probeCmd = `"${FFPROBE}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`;
    const durStr = execSync(probeCmd).toString().trim();
    const duration = parseFloat(durStr);

    scene.duration = parseFloat(duration.toFixed(3));
    scene.timestamp_start = parseFloat(runningTime.toFixed(3));
    runningTime += duration;
    scene.timestamp_end = parseFloat(runningTime.toFixed(3));

    if (!scene.language_durations) scene.language_durations = {};
    scene.language_durations.bn = scene.duration;

    concatList.push(`file '${wavPath.replace(/\\/g, '/')}'`);
  }

  project.total_duration_seconds = parseFloat(runningTime.toFixed(2));
  console.log(`Total Timeline Duration: ${runningTime.toFixed(2)}s (${Math.floor(runningTime / 60)}m ${Math.floor(runningTime % 60)}s) across 69 scenes.`);

  // Write concat list
  const listFile = path.join(AUDIO_DIR, 'concat_bn.txt');
  fs.writeFileSync(listFile, concatList.join('\n'), 'utf8');
  console.log(`Wrote concat list to ${listFile}`);

  // Concatenate master narration
  const masterMp3 = path.join(AUDIO_DIR, 'bn_narration.mp3');
  console.log(`Concatenating master narration: ${masterMp3}...`);
  const concatCmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${listFile}" -c:a libmp3lame -q:a 2 "${masterMp3}"`;
  execSync(concatCmd);

  const masterStat = fs.statSync(masterMp3);
  console.log(`✓ Master narration generated: ${masterMp3} (${masterStat.size} bytes)`);

  // Save updated project.json
  fs.writeFileSync(PROJECT_JSON, JSON.stringify(project, null, 2), 'utf8');
  console.log(`✓ Updated ${PROJECT_JSON} with exact synced timestamps!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
