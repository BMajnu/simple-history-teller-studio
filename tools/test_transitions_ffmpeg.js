const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const portalAlpha = path.join(__dirname, '..', 'public', 'assets', 'doctor_strange_portal_alpha.png');
const img1 = path.join(__dirname, '..', 'projects', 'sample_first_king', 'visual_assets', 'scene_0001.jpg');
const vid1 = path.join(__dirname, '..', 'projects', 'sample_first_king', 'visual_assets', 'clip_scene_0001.mp4');

console.log('portalAlpha exists:', fs.existsSync(portalAlpha));
console.log('img1 exists:', fs.existsSync(img1));
console.log('vid1 exists:', fs.existsSync(vid1));

const W = 1920, H = 1080, FPS = 30;
const FILL = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;

// Test 1: Video clip with portal overlay
function testVideoPortal() {
  const out = path.join(__dirname, 'test_vid_portal.mp4');
  const dur = 2.0;
  const filter = [
    `[0:v]${FILL},fps=${FPS},format=yuv420p[base]`,
    `[1:v]scale=900:900,format=rgba,rotate=2.5*PI*t:c=none,fade=t=out:st=0.55:d=0.25:alpha=1[portal]`,
    `[base][portal]overlay=(W-w)/2:(H-h)/2:enable='lte(t,0.8)':format=auto,format=yuv420p[v]`
  ].join(';');

  const args = [
    '-y',
    '-i', vid1,
    '-loop', '1', '-t', '1', '-framerate', `${FPS}`, '-i', portalAlpha,
    '-filter_complex', filter,
    '-map', '[v]',
    '-t', `${dur}`,
    '-c:v', 'h264_mf',
    '-b:v', '6500k',
    '-pix_fmt', 'yuv420p',
    '-r', `${FPS}`,
    out
  ];

  console.log('Rendering Video + Portal...');
  const res = cp.spawnSync('ffmpeg', args, { encoding: 'utf8' });
  console.log('Exit code:', res.status);
  if (res.status !== 0) console.error(res.stderr.slice(-400));
}

// Test 2: Image zoom_in with fade_black
function testImageFadeBlack() {
  const out = path.join(__dirname, 'test_img_fade_black.mp4');
  const dur = 2.0;
  const frames = Math.round(dur * FPS);
  const Z = 0.12;
  const zx = [`1+${Z}*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`];
  const vf = `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},` +
    `zoompan=z='${zx[0]}':x='${zx[1]}':y='${zx[2]}':d=${frames}:s=${W}x${H}:fps=${FPS},setsar=1,fade=t=in:st=0:d=0.35,format=yuv420p`;

  const args = [
    '-y',
    '-i', img1,
    '-vf', vf,
    '-frames:v', `${frames}`,
    '-c:v', 'h264_mf',
    '-b:v', '6500k',
    '-pix_fmt', 'yuv420p',
    '-r', `${FPS}`,
    out
  ];

  console.log('Rendering Image + Fade Black...');
  const res = cp.spawnSync('ffmpeg', args, { encoding: 'utf8' });
  console.log('Exit code:', res.status);
  if (res.status !== 0) console.error(res.stderr.slice(-400));
}

testVideoPortal();
testImageFadeBlack();
console.log('All tests completed!');
