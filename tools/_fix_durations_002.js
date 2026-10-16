const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projDir = 'projects/simple_itihash_002_first_language';
const rawDir = path.join(projDir, 'audio', 'raw');
const pjsonPath = path.join(projDir, 'project.json');

// backup
fs.copyFileSync(pjsonPath, pjsonPath + '.pre-duration-fix.bak');
const p = JSON.parse(fs.readFileSync(pjsonPath, 'utf8'));

const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.wav'));
const getDur = (f) => {
  const out = execSync(
    'ffprobe -v error -show_entries format=duration -of csv=p=0 "' + path.join(rawDir, f) + '"',
    { encoding: 'utf8' }
  ).trim();
  return parseFloat(out);
};

// actual durations keyed lang_shot
const actual = {};
for (const f of files) {
  const m = f.match(/^(bn|en|hi)_shot_(\d+)\.wav$/);
  if (m) actual[`${m[1]}_${parseInt(m[2], 10)}`] = getDur(f);
}

const sum = { bn: 0, en: 0, hi: 0 };
let fixedScenes = 0;
for (const s of p.scenes) {
  if (!s.language_durations) continue;
  for (const lang of ['bn', 'en', 'hi']) {
    const key = `${lang}_${s.scene_id}`;
    if (actual[key] !== undefined) {
      s.language_durations[lang] = Math.round(actual[key] * 100) / 100;
      sum[lang] += actual[key];
    }
  }
  // per-scene duration = max of langs (longest narration drives timeline)
  const vals = ['bn', 'en', 'hi'].map(l => s.language_durations[l]).filter(v => typeof v === 'number');
  if (vals.length) s.duration = Math.round(Math.max(...vals) * 100) / 100;
  delete s.duration_seconds;
  fixedScenes++;
}

p.language_total_durations = {
  bn: Math.round(sum.bn * 100) / 100,
  en: Math.round(sum.en * 100) / 100,
  hi: Math.round(sum.hi * 100) / 100,
};
p.total_duration_seconds = Math.round(p.scenes.reduce((a, s) => a + (s.duration || 0), 0) * 10) / 10;

fs.writeFileSync(pjsonPath, JSON.stringify(p, null, 2), 'utf8');
console.log('scenes fixed:', fixedScenes, 'audio files mapped:', Object.keys(actual).length);
console.log('actual sums:', JSON.stringify(sum));
console.log('new total_duration_seconds:', p.total_duration_seconds);
