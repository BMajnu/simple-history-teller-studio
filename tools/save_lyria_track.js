const http = require('http');
const fs = require('fs');
const path = require('path');

function post(body, ms = 30000) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request(
      { host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms },
      (res) => {
        let raw = ''; res.on('data', c => raw += c); res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw }); } });
      }
    );
    req.on('error', reject); req.write(data); req.end();
  });
}

const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = ctx.pages().find(p => (p.url() || '').includes('new_music'));
  if (!pg) return { fail: 'no music page' };

  const audioSrc = await pg.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? (a.src || a.currentSrc) : null;
  });

  if (!audioSrc) return { fail: 'no audio src' };
  return { ok: true, src: audioSrc };
})();
`;

(async () => {
  const res = await post({ code });
  if (res.result && res.result.ok) {
    const src = res.result.src;
    let buf;
    if (src.startsWith('data:audio/mpeg;base64,')) {
      buf = Buffer.from(src.replace('data:audio/mpeg;base64,', ''), 'base64');
    } else {
      console.log('Unexpected src format:', src.slice(0, 50));
      return;
    }
    const outPath = path.resolve('projects/simple_itihash_002_first_language/audio/bgm.mp3');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved BGM to ${outPath} (${(buf.length / (1024 * 1024)).toFixed(2)} MB)`);
  } else {
    console.error('Failed:', res);
  }
})();
