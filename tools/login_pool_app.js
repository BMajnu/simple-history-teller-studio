// Parallel email fill via AI Studio redirect (valid signin URLs; also detects sessions).
// NEVER touches 127.0.0.1 Studio UI. Run: node tools/login_pool_app.js
const http = require('http');
const MAILS = [
  'badiuzzaman.majnu@gmail.com', 'badiuzzaman.majnu1@gmail.com', 'msrosyafrin@gmail.com',
  'badiuzzaman.majnu123@gmail.com', 'bmajnu981@gmail.com', 'bmajnu980@gmail.com',
  'bmajnu9811@gmail.com', 'majnu.charitabari@gmail.com', 'badiuzzamanmajnu786@gmail.com',
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
  'const MAILS = ' + JSON.stringify(MAILS) + ';',
  'const ctx = browser.contexts()[0];',
  'const cands = ctx.pages().filter((p) => { const u = p.url() || ""; return !u.includes("127.0.0.1") && !u.startsWith("about:blank") && !u.startsWith("chrome"); });',
  'if (cands.length < MAILS.length) return { fail: "only " + cands.length + " login tabs" };',
  'async function worker(i, pg, email) {',
  '  const R = { i, email };',
  '  try {',
  '    await new Promise((r) => setTimeout(r, i * 900));',
  '    await pg.bringToFront().catch(() => {});',
  '    try { await pg.goto("https://aistudio.google.com/", { waitUntil: "commit", timeout: 60000 }); }',
  '    catch (e) { R.fail = "nav"; return R; }',
  '    await pg.waitForTimeout(10000);',
  '    const u0 = pg.url() || "";',
  '    if (u0.includes("/welcome")) {',
  '      const gs = pg.locator("text=Get started").first();',
  '      if ((await gs.count().catch(() => 0)) > 0) { await gs.click({ force: true }); await pg.waitForTimeout(9000); }',
  '    }',
  '    const u = pg.url() || "";',
  '    if (u.includes("signin/identifier") || u.includes("ServiceLogin")) {',
  '      const box = pg.locator("#identifierId, input[type=\\"email\\"], input[name=\\"identifier\\"]").first();',
  '      await box.waitFor({ state: "visible", timeout: 25000 });',
  '      await box.click({ force: true }); await box.fill(email);',
  '      await pg.waitForTimeout(400);',
  '      await pg.locator("#identifierNext, button:has-text(\\"Next\\")").first().click({ force: true });',
  '      await pg.waitForTimeout(6000);',
  '      await pg.screenshot({ path: "tools/fx_login" + i + ".png" }).catch(() => {});',
  '      R.url = pg.url(); R.atPassword = R.url.includes("challenge/pwd");',
  '    } else { R.loggedIn = true; R.url = u; }',
  '  } catch (e) { R.fail = String(e && e.message || e).slice(0, 100); }',
  '  return R;',
  '}',
  '  return await Promise.all(cands.slice(0, MAILS.length).map((pg, i) => worker(i, pg, MAILS[i])));',
  '})()',
].join('\n');
async function main() {
  const res = await post({ code, targetUrl: 'accounts.google.com' }, 300000);
  if (res.status !== 200 || !res.json.ok || !Array.isArray(res.json.result)) throw new Error('dispatch failed: ' + JSON.stringify(res.json).slice(0, 200));
  for (const r of res.json.result) console.log((r.loggedIn ? 'LOGGED-IN ' : r.atPassword ? 'PASSWORD-READY ' : 'CHECK ') + r.i + ' ' + r.email + ' ' + (r.fail || r.url || ''));
  console.log('DONE.');
}
main().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
