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

const PROMPT_2 = `
[0:00 - 1:00] Egyptian Palace Intrigue: Intensity 5/10. Ancient Egyptian Ney reed flute leading melody over Oud string picking, sistrum rattle rhythm, warm stone chamber reverb, tension building with low cello drone. Mysterious, regal. No vocals. Instrumental only.
[1:00 - 2:00] Mughal Court Drama: Intensity 7/10. Royal Indian court atmosphere — Sitar melodic phrase, urgent Tabla rhythmic pattern, warm tanpura drone, deep kettledrum rolls. High historical drama. No vocals. Instrumental only.
[2:00 - 3:00] Philosophical Resolution: Intensity 3/10. Scholarly contemplation — soft Oud arpeggios, gentle sustained cello notes, ancient wisdom fading into silence. No vocals. Instrumental only.
`.trim();

const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = ctx.pages().find(p => (p.url() || '').includes('new_music'));
  if (!pg) return { fail: 'no music page' };

  const ta = pg.locator('textarea.cdk-textarea-autosize, textarea[placeholder*="Describe"]').first();
  await ta.waitFor({ state: 'visible', timeout: 15000 });
  await ta.click({ force: true });
  await ta.fill(${JSON.stringify(PROMPT_2)});
  await new Promise(r => setTimeout(r, 1000));

  const genBtn = pg.locator('button:has-text("Generate")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 10000 });
  await genBtn.click({ force: true });

  await new Promise(r => setTimeout(r, 4000));
  return { ok: true, submitted: true };
})();
`;

(async () => {
  console.log('Dispatching Movement 2 to Lyria 3.5...');
  const res = await post({ code });
  console.log('Response:', JSON.stringify(res, null, 2));
})();
