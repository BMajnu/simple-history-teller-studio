// Parallel permission probe: which pool accounts can generate with Nano Banana 2.1?
// ONE daemon call, in-browser workers. Accepts ToS modal if shown (reported).
// Run: node tools/probe_perm.js
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
  'const ctx = browser.contexts()[0];',
  'const JOBS = [{u:1,m:"gemini-nano-banana-2.1"},{u:2,m:"gemini-nano-banana-2.1"},{u:3,m:"gemini-nano-banana-2.1"},{u:4,m:"gemini-nano-banana-2.1"},{u:5,m:"gemini-nano-banana-2.1"}];',
  'async function worker(n, model) {',
  '  const R = { u: n, m: model };',
  '  try {',
  '    let pg = ctx.pages().find((p) => (p.url() || "").includes("/u/" + n + "/prompts/new_chat"));',
  '    if (!pg) {',
  '      const blanks = ctx.pages().filter((p) => (p.url() || "").startsWith("about:blank"));',
  '      pg = blanks.length ? blanks[0] : null;',
  '      if (!pg) { R.fail = "no tab"; return R; }',
  '    }',
  '    await pg.bringToFront().catch(() => {});',
  '    try { await pg.goto("https://aistudio.google.com/u/" + n + "/prompts/new_chat?model=" + model, { waitUntil: "commit", timeout: 60000 }); }',
  '    catch (e) { R.fail = "nav"; return R; }',
  '    await pg.waitForTimeout(9000);',
  '    const t0 = await pg.evaluate(() => document.body.innerText.slice(0, 2000)).catch(() => "");',
  '    const acc = pg.locator("button").filter({ hasText: /^(Accept|Agree|I accept)/i }).first();',
  '    if ((await acc.count().catch(() => 0)) > 0) { await acc.click({ force: true }); R.tos = "accepted"; await pg.waitForTimeout(4000); }',
  '    const before = await pg.evaluate(() => Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);',
  '    const box = pg.locator("[placeholder*=\\"Start typing\\"]").first();',
  '    await box.waitFor({ state: "visible", timeout: 20000 });',
  '    await box.click({ force: true }); await box.fill("tiny flat vector icon of a red apple, plain white background");',
  '    await pg.waitForTimeout(400);',
  '    await pg.locator("button:has-text(\\"Run\\")").last().click({ force: true });',
  '    let ok = false, err = "", elapsed = 0;',
  '    while (elapsed < 90000) {',
  '      await pg.waitForTimeout(5000); elapsed += 5000;',
  '      const cur = await pg.evaluate(() => Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);',
  '      if (cur.filter(s => before.indexOf(s) < 0).length > 0) { ok = true; break; }',
  '      const bt = await pg.evaluate(() => document.body.innerText.slice(0, 3000)).catch(() => "");',
  '      const m = bt.match(/Failed to generate[^.]*\\.|permission denied[^.]*\\.|paid API key[^.]{0,80}|select an API key[^.]{0,80}|quota[^.]{0,60}|rate limit[^.]{0,60}/i);',
  '      if (m) { err = m[0].slice(0, 120); break; }',
  '    }',
  '    R.ok = ok; R.err = err || null;',
  '  } catch (e) { R.fail = String(e && e.message || e).slice(0, 100); }',
  '  return R;',
  '}',
  '  return await Promise.all(JOBS.map((j, k) => (async () => { await new Promise((r) => setTimeout(r, k * 2500)); return worker(j.u, j.m); })()));',
  '})()',
].join('\n');
async function main() {
  console.log('Probing image-gen permission on u/1..u/8 in parallel...');
  const res = await post({ code, targetUrl: 'aistudio.google.com' }, 400000);
  if (res.status !== 200 || !res.json.ok || !Array.isArray(res.json.result)) throw new Error('dispatch failed: ' + JSON.stringify(res.json).slice(0, 200));
  for (const r of res.json.result) console.log('u/' + r.u + ' ' + (r.m || '').replace('gemini-', '') + ' ' + (r.ok ? 'OK-GENERATES' : 'BLOCKED') + ' ' + (r.tos ? '[ToS accepted] ' : '') + (r.err || r.fail || ''));
  console.log('PROBE DONE');
}
main().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
