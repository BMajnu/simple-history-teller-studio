// Joins the 5 generated Lyria act clips into audio/bgm.mp3 (~1102s), act-timed,
// crossfaded at 1.5s joints, loudnorm -18 LUFS (ducking-ready for server render).
// Archival: previous bgm moved to audio/_history/.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'projects', 'simple_itihash_004_first_city', 'audio');
const LYR = path.join(DIR, 'bgm_lyria');
const FFMPEG = path.join(ROOT, 'bin', 'ffmpeg.exe');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
const OUT = path.join(DIR, 'bgm.mp3');

// Planned act durations (sec) from bgm_prompt.txt timeline; last padded for fade
const PLAN = [
  { n: 1, len: 212 },
  { n: 2, len: 242 },
  { n: 3, len: 242 },
  { n: 4, len: 192 },
  { n: 5, len: 220 }
];
const FADE = 1.5;

// Archive existing procedural bgm
if (fs.existsSync(OUT)) {
  const hist = path.join(DIR, '_history');
  fs.mkdirSync(hist, { recursive: true });
  const dest = path.join(hist, `bgm_procedural_backup_${Date.now()}.mp3`);
  fs.copyFileSync(OUT, dest);
  console.log(`Archived old BGM -> _history/${path.basename(dest)}`);
}

const args = ['-hide_banner', '-y'];
for (const a of PLAN) {
  args.push('-stream_loop', '-1', '-t', String(a.len), '-i', path.join(LYR, `act${a.n}.mp3`));
}
const prep = PLAN.map((a, k) => `[${k}:a]aresample=48000,aformat=channel_layouts=stereo[a${k + 1}]`).join(';');
const chain = [];
let cur = '[a1]';
for (let k = 1; k < PLAN.length; k++) {
  const out = k === PLAN.length - 1 ? '[jn]' : `[x${k}]`;
  chain.push(`${cur}[a${k + 1}]acrossfade=d=${FADE}:c1=tri:c2=tri${out}`);
  cur = out;
}
const fc = `${prep};${chain.join(';')};[jn]loudnorm=I=-18:TP=-1.5:LRA=9[out]`;
args.push('-filter_complex', fc, '-map', '[out]', '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '48000', '-ac', '2', OUT);

const r = spawnSync(FFMPEG, args, { stdio: ['ignore', 'pipe', 'pipe'] });
if (r.status !== 0) {
  console.error('ffmpeg error:', (r.stderr || '').toString().slice(0, 800));
  process.exit(1);
}
const pr = spawnSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration,bit_rate', '-of', 'json', OUT]);
const info = JSON.parse(pr.stdout.toString());
console.log(`bgm.mp3 assembled: ${parseFloat(info.format.duration).toFixed(1)}s, ${Math.round(info.format.bit_rate / 1000)}kbps, ${(fs.statSync(OUT).size / 1048576).toFixed(1)}MB`);
