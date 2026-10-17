const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
// Paths (PROJ_ID env overrides; default First City 004)
// NOTE: source wavs live in audio/<lang>/scene_0001.wav (aistudio fleet naming)
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'projects', process.env.PROJ_ID || 'simple_itihash_004_first_city');
const JSON_F = path.join(DIR, 'project.json');
const AUD = path.join(DIR, 'audio');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');
const LANGS = ['bn', 'en', 'hi'];
const probe = (f) => parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', f]).toString().trim());
const run = (args) => {
  const r = spawnSync(FFMPEG, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + args.slice(-2).join(' '));
};
const p = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const totals = {};
for (const L of LANGS) {
  // Step 1: probe all + calibrate durations
  let t = 0;
  const offs = [];
  for (const s of p.scenes) {
    const n = String(s.scene_id).padStart(4, '0');
    const f = path.join(AUD, L, `scene_${n}.wav`);
    if (!fs.existsSync(f)) throw new Error('Missing: ' + f);
    const S = Math.round((probe(f) + 0.4) * 100) / 100;
    s.language_durations = s.language_durations || {};
    s.language_durations[L] = S;
    offs.push({ f, ms: Math.round(t * 1000) });
    t = Math.round((t + S) * 100) / 100;
  }
  totals[L] = t;
  // Step 2: single-pass concat with adelay offsets (spawnSync argv only, no shell)
  // 88 inputs ~ each -i + delay ~ 300 bytes => ~26KB argv, below CreateProcess 32K cap
  const args = ['-y'];
  offs.forEach(o => args.push('-i', o.f));
  const flt = offs.map((o, k) => `[${k}:a]aresample=48000,adelay=${o.ms}|${o.ms}[a${k}]`).join(';');
  const tags = offs.map((_, k) => `[a${k}]`).join('');
  const fc = `${flt};${tags}amix=inputs=${offs.length}:duration=longest:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]`;
  run([...args, '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-ac', '2', path.join(AUD, `${L}_narration.wav`)]);
}
p.language_total_durations = { ...totals };
fs.copyFileSync(JSON_F, JSON_F + '.bak');
fs.writeFileSync(JSON_F, JSON.stringify(p, null, 2));
console.log(`BN total: ${totals.bn}s | EN total: ${totals.en}s | HI total: ${totals.hi}s`);
