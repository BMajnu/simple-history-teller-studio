const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const portalAlpha = path.join(__dirname, '..', 'public', 'assets', 'doctor_strange_portal_alpha.png');
const img1 = path.join(__dirname, '..', 'projects', 'sample_first_king', 'visual_assets', 'scene_0001.jpg');
const out = path.join(__dirname, 'test_smooth_portal.mp4');

const W = 1920, H = 1080, FPS = 30;
const FILL = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;

// Smooth, cinematic Doctor Strange Sling Ring Portal overlay:
// - Smooth alpha fade in (0.0s - 0.2s)
// - Majestic rotation (1.6*PI*t)
// - Smooth alpha fade out (0.65s - 1.05s)
const filter = [
  `[0:v]${FILL},setsar=1,format=yuv420p[base]`,
  `[1:v]scale=920:920,format=rgba,rotate=1.6*PI*t:c=none,fade=t=in:st=0:d=0.2:alpha=1,fade=t=out:st=0.68:d=0.35:alpha=1[portal]`,
  `[base][portal]overlay=(W-w)/2:(H-h)/2:enable='lte(t,1.05)':format=auto,format=yuv420p[v]`
].join(';');

console.log('Rendering smooth cinematic portal test...');
const t0 = Date.now();
const res = cp.spawnSync('ffmpeg', [
  '-y',
  '-loop', '1', '-t', '2.5', '-framerate', `${FPS}`, '-i', img1,
  '-loop', '1', '-t', '1.2', '-framerate', `${FPS}`, '-i', portalAlpha,
  '-filter_complex', filter,
  '-map', '[v]',
  '-c:v', 'h264_mf',
  '-b:v', '6500k',
  '-pix_fmt', 'yuv420p',
  '-r', `${FPS}`,
  out
], { encoding: 'utf8' });

console.log('Status:', res.status, 'in', (Date.now() - t0) / 1000, 's');
if (res.status !== 0) console.error(res.stderr.slice(-400));
else console.log('Successfully saved:', out);
