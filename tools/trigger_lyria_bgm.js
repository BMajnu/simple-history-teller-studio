const http = require('http');

function post(body, ms = 45000) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms }, (res) => {
      let raw = ''; res.on('data', c => raw += c); res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw }); } });
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

const BGM_PROMPT = `
[0:00 - 2:00] Intro: Intensity 2/10. Ancient prehistoric mystery — primal hollow log drum heartbeat, distant bamboo flute melody, subtle desert cave wind ambiance, dark resonant bass drone. Sparse, mysterious, earthy. No vocals. Instrumental only.

[2:00 - 5:30] Rising Mystery: Intensity 5/10. Ancient Egyptian palace intrigue — Egyptian Ney reed flute leading melody over Oud string picking, sistrum rattle rhythm, warm reverb of stone chamber acoustics, tension building with low cello drone. Mysterious, regal, forbidden. No vocals. Instrumental only.

[5:30 - 9:00] Dramatic Climax: Intensity 8/10. Forbidden experiment revealed — full dramatic orchestral swell, driving bass ostinato, urgent strings, deep kettledrum rolls, powerful cinematic brass. Shocking revelation, high historical drama. No vocals. Instrumental only.

[9:00 - 12:30] Mughal Court Interlude: Intensity 6/10. Royal Indian court atmosphere — Sitar melodic phrase, Tabla rhythmic pattern, warm tanpura drone, regal tabla-driven groove. Exotic, cultured, ancient wisdom. No vocals. Instrumental only.

[12:30 - 15:00] Philosophical Reflection: Intensity 4/10. Scholarly contemplation — soft Oud arpeggios, gentle cello sustained notes, quiet Arabic string ensemble, warm golden tones of Islamic scholarly library. Dignified, reflective, serene. No vocals. Instrumental only.

[15:00 - 17:00] Outro: Intensity 2/10. Peaceful resolution — decaying Ney flute echoes, single guitar pluck, fading ambient drone, soft reverb fade into silence. Ancient wisdom, hopeful closure. No vocals. Instrumental only.

Target: 17 minutes total duration. Multi-era historical documentary score. 48kHz stereo. No percussion drops between sections — smooth organic transitions only. No lyrics, no vocals, purely instrumental.
`.trim();

const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = ctx.pages().find(p => (p.url() || '').includes('new_music'));
  if (!pg) return { fail: 'no music page' };

  console.log('Finding textarea...');
  const ta = pg.locator('textarea.cdk-textarea-autosize, textarea[placeholder*="Describe"]').first();
  await ta.waitFor({ state: 'visible', timeout: 15000 });
  await ta.click({ force: true });
  await ta.fill(${JSON.stringify(BGM_PROMPT)});
  await new Promise(r => setTimeout(r, 1000));

  console.log('Finding Generate button...');
  const genBtn = pg.locator('button:has-text("Generate")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Clicking Generate button...');
  await genBtn.click({ force: true });

  await new Promise(r => setTimeout(r, 5000));
  const text = await pg.evaluate(() => document.body.innerText.slice(0, 500));
  return { ok: true, submitted: true, textPreview: text };
})();
`;

(async () => {
  console.log('Dispatching Lyria 3.5 BGM generation...');
  const res = await post({ code });
  console.log('Dispatch response:', JSON.stringify(res, null, 2));
})();
