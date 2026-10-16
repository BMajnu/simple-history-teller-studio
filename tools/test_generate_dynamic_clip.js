const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const imgPath = path.resolve(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'visual_assets', 'shot_0010.jpg');
const outPath = path.resolve(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'visual_assets', 'clip_shot_0010.mp4');
const dur = 10.56;
const frames = Math.round(dur * 24);

// Dynamic 24fps motion filter:
// 2x upscale first to avoid jitter
// dynamic cartoon zoom + rhythmic camera shake simulating frantic gestures + vibrant grading
const vf = `scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,` +
  `zoompan=z='min(1.0+0.18*on/${frames},1.18)':x='iw/2-(iw/zoom/2)+12*sin(on/3)':y='ih/2-(ih/zoom/2)+8*cos(on/4)':d=${frames}:s=1920x1080:fps=24,` +
  `eq=contrast=1.04:saturation=1.08,format=yuv420p`;

const args = [
  'ffmpeg', '-y',
  '-loop', '1',
  '-framerate', '24',
  '-i', imgPath,
  '-vf', vf,
  '-t', String(dur),
  '-c:v', 'libx264',
  '-preset', 'veryfast',
  '-crf', '19',
  '-pix_fmt', 'yuv420p',
  '-r', '24',
  '-an',
  outPath
];

console.log('Running ffmpeg to generate dynamic motion video clip...');
execSync(args.map(a => `"${a}"`).join(' '));
console.log('✓ Successfully generated clip_shot_0010.mp4! Size:', fs.statSync(outPath).size);
