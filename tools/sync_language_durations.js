const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');

function getAudioDuration(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const res = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ], { encoding: 'utf8' });
  const dur = parseFloat(res.stdout.trim());
  return isNaN(dur) ? null : dur;
}

const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));

const langs = ['bn', 'en', 'hi'];
project.language_total_durations = {};

for (const lang of langs) {
  let totalLang = 0;
  for (const scene of project.scenes) {
    if (!scene.language_durations) scene.language_durations = {};
    const sceneNum = String(scene.scene_id).padStart(4, '0');
    const audioFile = path.join(AUDIO_DIR, `${lang}_scene_${sceneNum}.mp3`);
    const dur = getAudioDuration(audioFile);
    if (dur !== null) {
      // 0.4s breathing room
      const sceneDur = +(dur + 0.4).toFixed(3);
      scene.language_durations[lang] = sceneDur;
      totalLang += sceneDur;
    } else {
      scene.language_durations[lang] = scene.duration;
      totalLang += scene.duration;
    }
  }
  project.language_total_durations[lang] = +totalLang.toFixed(3);
}

// Compute timestamps based on default bn duration
let acc = 0;
for (const scene of project.scenes) {
  scene.duration = scene.language_durations.bn || scene.duration;
  scene.timestamp_start = +acc.toFixed(3);
  acc += scene.duration;
  scene.timestamp_end = +acc.toFixed(3);
}
project.total_duration_seconds = +acc.toFixed(3);

fs.writeFileSync(PROJECT_JSON, JSON.stringify(project, null, 2), 'utf8');

console.log('Language Total Durations:');
console.log(`- Bengali (Simple History Teller Bangla): ${project.language_total_durations.bn}s (${(project.language_total_durations.bn / 60).toFixed(2)} min)`);
console.log(`- English (Simple History Teller): ${project.language_total_durations.en}s (${(project.language_total_durations.en / 60).toFixed(2)} min)`);
console.log(`- Hindi (Simple History Teller Hindi): ${project.language_total_durations.hi}s (${(project.language_total_durations.hi / 60).toFixed(2)} min)`);
console.log('Updated project.json successfully with full language_durations.');
