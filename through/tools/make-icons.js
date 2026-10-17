/**
 * Through icon generator (dev-only, zero dependencies).
 * Draws a "portal ring" mark: dark bg + blue ring + center dot.
 * Run: node tools/make-icons.js   (outputs src/sidepanel/icon{16,48,128}.png)
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'src', 'sidepanel');

function crc32(buf) {
  if (!crc32.table) {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    crc32.table = t;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crc32.table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function makePng(size) {
  const BG = [16, 19, 26];       // #10131a
  const ACC = [79, 124, 255];    // #4f7cff
  const cx = size / 2, cy = size / 2;
  const R = size * 0.34;         // ring radius
  const W = Math.max(2, size * 0.09); // ring thickness
  const DOT = Math.max(1.5, size * 0.09);
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      let px = BG;
      if (Math.abs(d - R) <= W / 2) px = ACC;
      else if (d <= DOT) px = ACC;
      row[1 + x * 3] = px[0];
      row[1 + x * 3 + 1] = px[1];
      row[1 + x * 3 + 2] = px[2];
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor
  const idat = zlib.deflateSync(Buffer.concat(rows), { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [16, 48, 128]) {
  const png = makePng(size);
  const file = path.join(OUT, `icon${size}.png`);
  fs.writeFileSync(file, png);
  console.log('wrote', file, png.length + ' bytes');
}
