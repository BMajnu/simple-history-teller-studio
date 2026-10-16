// Parallel multi-login: 9 tabs, one per pool account, email pre-filled (user types
// passwords + phone taps). Single agent, in-browser Promise.all — NO subagents.
// Run: node tools/login_pool_parallel.js
// Then user completes passwords visibly, replies "login done", verify via fx_cookies.js.
const fs = require('fs');
const http = require('http');

const EMAILS = [
  'badiuzzaman.majnu@gmail.com',
  'badiuzzaman.majnu1@gmail.com',
  'msrosyafrin@gmail.com',
  'badiuzzaman.majnu123@gmail.com',
  'bmajnu981@gmail.com',
  'bmajnu980@gmail.com',
  'bmajnu9811@gmail.com',
  'majnu.charitabari@gmail.com',
  'badiuzzamanmajnu786@gmail.com',
];

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
  'const MAILS = ' + JSON.stringify(EMAILS) + ';',
  'const ctx = browser.contexts()[0];',
  'async function worker(i, email) {',
  '  const R = { i, email };',
  '  try {',
  '    const pg = await ctx.newPage();',
  '    await new Promise((r) => setTimeout(r, i * 1000));',
  '    await pg.bringToFront().catch(() => {});',
  '    try { await pg.goto("https://accounts.google.com/v3/signin/identifier?continue=https://aistudio.google.com/", { waitUntil: "commit", timeout: 60000 }); }',
  '    catch (e) { R.fail = "nav"; return R; }',
  '    await pg.waitForTimeout(8000);',
  '    const box = pg.locator("#identifierId, input[type=\\"email\\"]").first();',
  '    await box.waitFor({ state: "visible", timeout: 25000 });',
  '    await box.click({ force: true }); await box.fill(email);',
  '    await pg.waitForTimeout(400);',
  '    await pg.locator("#identifierNext, button:has-text(\\"Next\\")").first().click({ force: true });',
  '    await pg.waitForTimeout(6000);',
  '    await pg.screenshot({ path: "tools/fx_login" + i + ".png" }).catch(() => {});',
  '    R.url = pg.url(); R.atPassword = R.url.includes("challenge/pwd");',
  '  } catch (e) { R.fail = String(e && e.message || e).slice(0, 100); }',
  '  return R;',
  '}',
  '  const out = await Promise.all(MAILS.map((m, i) => worker(i, m)));',
  '  return out;',
  '})()',
].join('\n');

async function main() {
  console.log('Opening 9 parallel login tabs (watch app Automation Browser)...');
  const res = await post({ code, targetUrl: '127.0.0.1:4000' }, 300000);
  if (res.status !== 200 || !res.json.ok || !Array.isArray(res.json.result)) throw new Error('dispatch failed: ' + JSON.stringify(res.json).slice(0, 200));
  for (const r of res.json.result) console.log((r.atPassword ? 'PASSWORD-READY ' : 'CHECK ') + r.i + ' ' + r.email + ' ' + (r.fail || r.url || ''));
  console.log('DONE — type each password + phone tap in the visible tabs, then reply login done.');
}
main().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
