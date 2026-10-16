const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
const files = ['video_bn.mp4', 'video_en.mp4', 'video_hi.mp4'];

console.log('===============================================================');
console.log('VERIFYING FINAL 1080p60 TRIPLE-CHANNEL MASTER RENDERS');
console.log('===============================================================');

for (const f of files) {
  const p = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'renders', f);
  const out = execSync(`"${FFPROBE}" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -show_entries format=duration,size -of json "${p}"`).toString();
  const d = JSON.parse(out);
  console.log(f, '=>', {
    resolution: `${d.streams[0].width}x${d.streams[0].height}`,
    framerate: d.streams[0].r_frame_rate,
    duration: `${parseFloat(d.format.duration).toFixed(2)}s (${(parseFloat(d.format.duration) / 60).toFixed(2)} min)`,
    fileSize: `${(parseInt(d.format.size) / (1024 * 1024)).toFixed(1)} MB`
  });
}
