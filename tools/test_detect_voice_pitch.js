const { execSync } = require('child_process');
const path = require('path');

const testShots = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 48, 50, 55, 60, 65];
for (const s of testShots) {
  const f = path.resolve(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio', `bn_shot_${String(s).padStart(4, '0')}.wav`);
  try {
    // Run ffmpeg showfreqs or get pitch via rubberband / ebur128
    const res = execSync(`ffmpeg -i "${f}" -af "astats" -f null - 2>&1`, { encoding: 'utf8' });
    const rmsLine = res.split('\n').find(l => l.includes('RMS level dB'));
    const flatLine = res.split('\n').find(l => l.includes('Flat factor'));
    console.log(`Shot ${s}: ${rmsLine ? rmsLine.trim() : 'ok'}`);
  } catch (e) {
    console.error(`Shot ${s} error:`, e.message);
  }
}
