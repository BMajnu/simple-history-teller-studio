const http = require('http');

function post(body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: 10000 }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw }); } });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const bar = ctx.pages().find(p => (p.url() || '').includes('browser.html'));
  if (!bar) return { fail: 'no toolbar' };
  const tabs = await bar.evaluate(() => window.stb ? window.stb.get() : 'no stb');
  return { tabs };
})();
`;

post({ code }).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error);
