const cp = require('child_process');
const fs = require('fs');

const testImg = 'projects/sample_first_king/visual_assets/scene_0001.jpg';
const portal = 'public/assets/doctor_strange_portal_alpha.png';
const out = 'tools/test_portal_segment.mp4';

// Portal test with fixed overlay size and rotation
// In ffmpeg, rotating an image in a square canvas of 900x900:
const filter = [
  '[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,format=yuv420p[bg]',
  '[1:v]scale=900:900,format=rgba,rotate=2*PI*t:c=none,fade=t=out:st=0.55:d=0.25:alpha=1[p]',
  '[bg][p]overlay=(W-w)/2:(H-h)/2:enable=\'lte(t,0.8)\':format=auto,format=yuv420p[v]'
].join(';');

console.log('Running test ffmpeg portal render...');
const t0 = Date.now();
const res = cp.spawnSync('ffmpeg', [
  '-y',
  '-loop', '1', '-t', '2', '-framerate', '30', '-i', testImg,
  '-loop', '1', '-t', '1', '-framerate', '30', '-i', portal,
  '-filter_complex', filter,
  '-map', '[v]',
  '-c:v', 'h264_mf',
  '-b:v', '6500k',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  out
], { encoding: 'utf8' });

console.log('Done in', (Date.now() - t0) / 1000, 's, exit code:', res.status);
if (res.status !== 0) {
  console.error(res.stderr.slice(-600));
} else {
  console.log('Success! Saved', out);
}
