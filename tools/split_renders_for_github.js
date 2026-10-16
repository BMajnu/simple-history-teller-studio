// Split renders/*.mp4 (>100MB) into <100MB chunks for GitHub. Byte-exact, reassembled by JOIN_CLIPS.
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_003_nalanda', 'renders');
const CHUNK = 90 * 1024 * 1024;
const manifest = {};
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.mp4')) continue;
  const src = path.join(DIR, f);
  const size = fs.statSync(src).size;
  const n = Math.ceil(size / CHUNK);
  if (n <= 1) { manifest[f] = { parts: 1, size }; continue; }
  const fd = fs.openSync(src, 'r');
  const buf = Buffer.alloc(CHUNK);
  for (let i = 0; i < n; i++) {
    const len = fs.readSync(fd, buf, 0, CHUNK, i * CHUNK);
    fs.writeFileSync(path.join(DIR, `${f}.part-${String(i).padStart(3, '0')}`), buf.subarray(0, len));
  }
  fs.closeSync(fd);
  manifest[f] = { parts: n, size };
  console.log(`${f}: ${Math.round(size / 1048576)}MB -> ${n} parts`);
}
fs.writeFileSync(path.join(DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('MANIFEST_WRITTEN');
