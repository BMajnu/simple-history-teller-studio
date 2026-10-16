// Save the generated BGM from the AI Studio Music page audio element
// Run this after AI Studio finishes generating the track (stop button disappears)
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'audio', 'bgm.mp3');
const OUT_WAV = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_bgm_lyria.wav');

function post(body, ms) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request(
      { host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw }); } });
      }
    );
    req.on('error', reject);
    req.write(data); req.end();
  });
}

const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = ctx.pages().find(p => p.url().includes('new_music'));
  if (!pg || pg.isClosed()) return { ok: false, err: 'No music tab open' };
  await pg.bringToFront();

  // Find audio element
  const audioInfo = await pg.evaluate(async () => {
    const audios = Array.from(document.querySelectorAll('audio'));
    const best = audios.find(a => a.duration > 60) || audios[0];
    if (!best || !best.src) return { ok: false, err: 'No audio element found' };
    try {
      const r = await fetch(best.src);
      const ab = await r.arrayBuffer();
      const by = new Uint8Array(ab);
      let bin = '';
      for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
      return { ok: true, b64: btoa(bin), size: by.length, duration: best.duration };
    } catch(e) {
      return { ok: false, err: e.message };
    }
  });
  return audioInfo;
})();
`;

(async () => {
  console.log('Extracting BGM from AI Studio Music page...');
  try {
    const r = await post({ code }, 60000);
    if (r.result && r.result.ok) {
      const buf = Buffer.from(r.result.b64, 'base64');
      fs.writeFileSync(OUT, buf);
      fs.copyFileSync(OUT, OUT_WAV.replace('.wav', '.mp3'));
      console.log(`✓ BGM saved: ${OUT} (${(buf.length/1024/1024).toFixed(2)} MB, ${r.result.duration?.toFixed(1)}s)`);
    } else {
      console.log('Failed:', r.result?.err || JSON.stringify(r));
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
})();
