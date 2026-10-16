const http = require('http');

function post(body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: 15000 }, (res) => {
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
  const text = await pg.evaluate(() => document.body.innerText.slice(0, 1000));
  const inputs = await pg.evaluate(() => Array.from(document.querySelectorAll('input, textarea, button, [contenteditable]')).map(el => ({ tag: el.tagName, text: el.innerText.trim().slice(0, 50), role: el.getAttribute('role'), type: el.type, placeholder: el.placeholder })));
  return { url: pg.url(), text, inputs };
})();
`;

post({ code }).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error);
