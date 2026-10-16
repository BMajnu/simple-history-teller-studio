const http = require('http');

function post(body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: 25000 }, (res) => {
      let raw = ''; res.on('data', c => raw += c); res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw }); } });
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = ctx.pages().find(p => (p.url() || '').includes('new_music'));
  if (!pg) return { fail: 'no music page' };

  console.log('Clicking Cinematic score button...');
  const card = pg.locator('button:has-text("Cinematic score")').first();
  await card.click({ force: true });
  await new Promise(r => setTimeout(r, 4000));

  // Now inspect elements again
  const inputs = await pg.evaluate(() => Array.from(document.querySelectorAll('input, textarea, [contenteditable]')).map(el => ({
    tag: el.tagName,
    role: el.getAttribute('role'),
    placeholder: el.placeholder,
    className: el.className
  })));

  const text = await pg.evaluate(() => document.body.innerText.slice(0, 800));
  return { ok: true, inputs, text };
})();
`;

post({ code }).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error);
