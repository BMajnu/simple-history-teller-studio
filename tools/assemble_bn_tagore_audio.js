// Assemble studio-playable BN master for bn_tagore_bangladesh_docu:
// audio/raw/bn_shot_XXXX.wav -> normalized 48kHz stereo -> audio/bn_narration.wav
// + project.json durations/timestamps synced to real audio (studio plays master + timestamps).
// Usage: node tools/assemble_bn_tagore_audio.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'bn_tagore_bangladesh_docu');
const PJ = path.join(PROJ, 'project.json');
const AUDIO = path.join(PROJ, 'audio');
const RAW = path.join(AUDIO, 'raw');
const NORM = path.join(AUDIO, '_norm');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');
fs.mkdirSync(NORM, { recursive: true });

const project = JSON.parse(fs.readFileSync(PJ, 'utf8'));
const lines = [];
let t = 0;
for (const s of project.scenes) {
  const num = String(s.scene_id).padStart(4, '0');
  const src = path.join(RAW, `bn_shot_${num}.wav`);
  if (!fs.existsSync(src) || fs.statSync(src).size < 50000) throw new Error(`Missing raw: ${src}`);
  const norm = path.join(NORM, `bn_shot_${num}.wav`);
  execSync(`"${FFMPEG}" -y -v error -i "${src}" -ar 48000 -ac 2 -c:a pcm_s16le "${norm}"`);
  const dur = parseFloat(execSync(`"${FFPROBE}" -v error -show_entries format=duration -of csv=p=0 "${norm}"`).toString().trim());
  s.duration = +dur.toFixed(3);
  s.timestamp_start = +t.toFixed(3);
  t += dur;
  s.timestamp_end = +t.toFixed(3);
  if (!s.language_durations) s.language_durations = {};
  s.language_durations.bn = s.duration;
  lines.push(`file '${norm.replace(/\\/g, '/')}'`);
}
project.total_duration_seconds = +t.toFixed(2);
fs.writeFileSync(path.join(AUDIO, 'concat_bn.txt'), lines.join('\n'), 'utf8');
execSync(`"${FFMPEG}" -y -v error -f concat -safe 0 -i "${path.join(AUDIO, 'concat_bn.txt')}" -ar 48000 -ac 2 -c:a pcm_s16le "${path.join(AUDIO, 'bn_narration.wav')}"`);
const master = path.join(AUDIO, 'bn_narration.wav');
const st = fs.statSync(master);
const mdur = parseFloat(execSync(`"${FFPROBE}" -v error -show_entries format=duration -of csv=p=0 "${master}"`).toString().trim());
fs.writeFileSync(PJ, JSON.stringify(project, null, 2), 'utf8');
console.log(`OK: 95 scenes, master ${(st.size / 1048576).toFixed(1)}MB, ${mdur.toFixed(1)}s | timeline ${t.toFixed(1)}s | drift ${(mdur - t).toFixed(2)}s`);
