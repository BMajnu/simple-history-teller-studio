const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAW = path.resolve('projects/simple_itihash_002_first_language/audio/raw');
const AUD = path.resolve('projects/simple_itihash_002_first_language/audio');

// 1. move stale narration/bgm variants to _history
const hist = path.join(AUD, '_history');
fs.mkdirSync(hist, { recursive: true });
for (const lang of ['bn', 'en', 'hi']) {
  for (const suffix of ['_narration.wav', '_narration.mp3', '_narration_full.mp3']) {
    const f = path.join(AUD, `${lang}${suffix}`);
    if (fs.existsSync(f)) fs.renameSync(f, path.join(hist, `old_${lang}${suffix}`));
  }
}
const bgmBak = path.join(AUD, '_bgm_3171_backup.mp3');
if (fs.existsSync(bgmBak)) fs.renameSync(bgmBak, path.join(hist, '_bgm_3171_backup.mp3'));

// 2. concat shot wavs -> narration.wav (re-encode to uniform 48k stereo)
let fails = 0;
for (const lang of ['bn', 'en', 'hi']) {
  const shots = fs.readdirSync(RAW)
    .filter(f => f.startsWith(`${lang}_shot_`) && f.endsWith('.wav'))
    .sort();
  if (shots.length !== 84) { console.log(lang, 'shot count:', shots.length, 'ABORT'); fails++; continue; }
  const list = path.join('tools', `_concat_${lang}_narr.txt`);
  fs.writeFileSync(list, shots.map(f => `file '${path.join(RAW, f).replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
  const out = path.join(AUD, `${lang}_narration.wav`);
  execSync(`ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "${list}" -filter:a "aresample=48000,aformat=channel_layouts=stereo" -c:a pcm_s16le "${out}"`);
  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${out}"`, { encoding: 'utf8' }).trim());
  const mb = (fs.statSync(out).size / 1048576).toFixed(0);
  console.log(lang, '→', mb + 'MB', dur.toFixed(2) + 's');
  fs.unlinkSync(list);
  if (Math.abs(dur - [871.76, 883.76, 979.08][['bn', 'en', 'hi'].indexOf(lang)]) > 3) fails++;
}
console.log(fails === 0 ? 'ALL NARRATION OK' : 'FAILURES: ' + fails);
