const http = require('http');
const fs = require('fs');
const path = require('path');

function post(body, ms = 45000) {
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

const PROMPT_3 = `
[0:00 - 1:00] Forbidden Isolation: Intensity 4/10. Desert cave wind ambiance, primal hollow drum heartbeat, solitary bamboo flute, low cello drone. Mysterious, eerie, ancient suspense. No vocals. Instrumental only.
[1:00 - 2:00] Shocking Historical Climax: Intensity 8/10. Forbidden experiment revealed — driving orchestral strings, deep kettledrum rolls, majestic brass, high cinematic drama. No vocals. Instrumental only.
[2:00 - 3:00] Final Philosophical Resolution: Intensity 3/10. Soft Oud arpeggios, gentle cello, peaceful fading reverb into silence. Ancient wisdom. No vocals. Instrumental only.
`.trim();

const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = ctx.pages().find(p => (p.url() || '').includes('new_music'));
  if (!pg) return { fail: 'no music page' };

  // 1. Extract audio
  const audioSrc = await pg.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? (a.src || a.currentSrc) : null;
  });

  // 2. Submit Prompt 3
  const ta = pg.locator('textarea.cdk-textarea-autosize, textarea[placeholder*="Describe"]').first();
  await ta.waitFor({ state: 'visible', timeout: 15000 });
  await ta.click({ force: true });
  await ta.fill(${JSON.stringify(PROMPT_3)});
  await new Promise(r => setTimeout(r, 1000));

  const genBtn = pg.locator('button:has-text("Generate")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 10000 });
  await genBtn.click({ force: true });
  await new Promise(r => setTimeout(r, 3000));

  return { ok: true, src: audioSrc };
})();
`;

(async () => {
  console.log('Extracting Movement 2 & dispatching Movement 3 to Lyria 3.5...');
  const res = await post({ code });
  if (res.result && res.result.src) {
    const src = res.result.src;
    const buf = Buffer.from(src.replace('data:audio/mpeg;base64,', ''), 'base64');
    const outPath = path.resolve('projects/simple_itihash_002_first_language/audio/raw_bgm_lyria_part2.mp3');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved Movement 2 to ${outPath} (${(buf.length / (1024 * 1024)).toFixed(2)} MB)`);
    console.log('Movement 3 dispatched successfully!');
  } else {
    console.error('Error:', res);
  }
})();
