const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FFPROBE = process.env.FFPROBE_BIN || 'ffprobe';
const DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_004_first_city', 'visual_assets');
const project = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'projects', 'simple_itihash_004_first_city', 'project.json'), 'utf8'));

const statics = project.scenes.filter((s) => s.type === 'STATIC_IMAGE');
const bad = [];
for (const s of statics) {
  const f = path.join(DIR, 'shot_' + String(s.scene_id).padStart(4, '0') + '.jpg');
  if (!fs.existsSync(f)) { bad.push(s.scene_id + ':missing'); continue; }
  const sz = fs.statSync(f).size;
  if (sz < 50000) { bad.push(s.scene_id + ':small(' + sz + ')'); continue; }
  try {
    const o = execSync('"' + FFPROBE + '" -hide_banner -v error -show_entries stream=width,height -of csv=p=0 "' + f + '"').toString().trim();
    if (o !== '1376,768') bad.push(s.scene_id + ':dims(' + o + ')');
  } catch { bad.push(s.scene_id + ':probe-err'); }
}
console.log('statics:', statics.length, '| bad:', bad.length ? bad.join(' ') : 'NONE');
console.log('jpg files present:', fs.readdirSync(DIR).filter((f) => f.endsWith('.jpg')).length);
