const http = require('http');

function post(body, ms = 25000) {
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

  const info = await pg.evaluate(() => {
    const audios = Array.from(document.querySelectorAll('audio')).map(a => ({
      src: (a.src || a.currentSrc || '').slice(0, 100),
      duration: a.duration,
      paused: a.paused
    }));
    const text = document.body.innerText;
    const hasGenerating = /generating|composing|please wait/i.test(text);
    return { audios, hasGenerating, snippet: text.slice(0, 300) };
  });

  return info;
})();
`;

(async () => {
  const res = await post({ code });
  console.log('Lyria status:', JSON.stringify(res, null, 2));
})();
