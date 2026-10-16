// Final asset verification for EP02.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const P = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const pj = require(path.join(P, 'project.json'));
const VA = P + '/visual_assets', AU = P + '/audio';
const shots = fs.readdirSync(VA).filter(f => /^shot_\d+\.jpg$/.test(f) && fs.statSync(VA + '/' + f).size > 50000);
console.log('images:', shots.length, '/84');
const FFPROBE = 'C:\\Users\\badiu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-N-126374-g089a48eb36-win64-gpl\\bin\\ffprobe.exe';
let clipOk = 0;
for (const s of pj.scenes.filter(x => x.type === 'DYNAMIC_AI_VIDEO')) {
  const f = VA + '/clip_shot_' + String(s.scene_id).padStart(4, '0') + '.mp4';
  if (!fs.existsSync(f) || fs.statSync(f).size < 100000) { console.log('MISSING clip', s.scene_id); continue; }
  try {
    const o = cp.execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', f]).toString().trim();
    if (parseFloat(o) > 1) clipOk++;
    else console.log('SHORT clip', s.scene_id, o);
  } catch (e) { console.log('INVALID clip', s.scene_id); }
}
console.log('clips valid:', clipOk, '/16');
const wavs = fs.readdirSync(AU + '/raw').filter(f => f.endsWith('.wav') && fs.statSync(AU + '/raw/' + f).size > 100000);
console.log('tts:', wavs.length, '/252');
console.log('bgm:', fs.existsSync(AU + '/bgm.mp3') ? fs.statSync(AU + '/bgm.mp3').size + ' bytes' : 'MISSING');
// audio per-language coverage
for (const lang of ['bn', 'en', 'hi']) {
  const n = pj.scenes.filter(s => {
    const f = `${AU}/raw/${lang}_shot_${String(s.scene_id).padStart(4, '0')}.wav`;
    return fs.existsSync(f) && fs.statSync(f).size > 100000;
  }).length;
  console.log(`tts-${lang}:`, n, '/84');
}
