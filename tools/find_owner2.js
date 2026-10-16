// Find which session index (authuser N) can access the Bangla channel. Bounded, summary.
const http = require('http');
function post(body, ms) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(raw) }); } catch (e) { reject(new Error('bad json')); } });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('daemon timeout')));
    req.write(data);
    req.end();
  });
}
const code = [
  'return (async () => {',
  'const R = [];',
  'const ctx = browser.contexts()[0];',
  'const pg = ctx.pages().find((p) => (p.url() || "").includes("studio.youtube.com")) || ctx.pages()[0];',
  'for (let n = 0; n <= 8; n++) {',
  '  try {',
  '    await pg.goto("https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos?authuser=" + n, { waitUntil: "commit", timeout: 40000 });',
  '    await pg.waitForTimeout(9000);',
  '    const t = await pg.evaluate(() => ({ url: location.href, body: document.body.innerText.slice(0, 300), title: document.title })).catch(() => ({}));',
  '    const ok = t.body && !t.body.includes("অনুমতি নেই");',
  '    R.push({ n, ok, title: (t.title || "").slice(0, 60) });',
  '    if (ok) break;',
  '  } catch (e) { R.push({ n, err: 1 }); }',
  '}',
  'return R;',
  '})()',
].join('\n');
async function main() {
  const res = await post({ code, targetUrl: 'studio.youtube.com' }, 400000);
  const rows = (res.json && res.json.result) || [];
  rows.forEach((r) => console.log('authuser=' + r.n + ' ' + (r.ok ? 'HAS-ACCESS' : 'denied') + ' ' + (r.title || r.err || '')));
  const win = rows.find((r) => r.ok);
  if (win) { console.log('WINNER authuser=' + win.n); process.exit(0); }
  console.log('NO SESSION HAS ACCESS');
  process.exit(2);
}
main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
