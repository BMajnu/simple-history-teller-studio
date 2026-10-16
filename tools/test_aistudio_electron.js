const http = require('http');

function post(body, ms = 30000) {
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
  const bar = ctx.pages().find(p => (p.url() || '').includes('browser.html'));
  if (!bar) return { fail: 'no toolbar' };

  console.log('Opening AI Studio in Electron via stb.newTab...');
  await bar.evaluate(() => window.stb.newTab('https://aistudio.google.com/u/1/', 'aistudio_test'));
  await new Promise(r => setTimeout(r, 6000));

  // Find the new page
  const pg = ctx.pages().find(p => (p.url() || '').includes('aistudio.google.com'));
  if (!pg) return { fail: 'page not found in ctx.pages()', allPages: ctx.pages().map(p => p.url()) };

  const title = await pg.title().catch(() => 'no title');
  const url = pg.url();
  const text = await pg.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => '');
  return { ok: true, url, title, textPreview: text };
})();
`;

post({ code }).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error);
