// Find which pool account owns the Bangla channel (bounded loop, summary, exits).
// Run: node tools/find_owner.js
const http = require('http');
const CHANNEL_URL = 'https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt';
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
  'const R = { log: [] };',
  'const ctx = browser.contexts()[0];',
  'const pg = ctx.pages().find((p) => (p.url() || "").includes("w=up")) || ctx.pages().find((p) => (p.url() || "").includes("studio.youtube.com")) || ctx.pages()[0];',
  'async function hasAccess() {',
  '  try { await pg.goto(' + JSON.stringify(CHANNEL_URL) + ', { waitUntil: "domcontentloaded", timeout: 45000 }); } catch (e) {}',
  '  await pg.waitForTimeout(6000);',
  '  const t = await pg.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => "");',
  '  return !t.includes("অনুমতি নেই");',
  '}',
  'if (await hasAccess()) return { alreadyIn: true };',
  'const sw = pg.locator("text=অ্যাকাউন্ট পাল্টান").first();',
  'if ((await sw.count().catch(() => 0)) === 0) return { fail: "no switch button" };',
  'await sw.click({ force: true });',
  'await pg.waitForTimeout(8000);',
  'await pg.screenshot({ path: "tools/fx_chooser.png" }).catch(() => {});',
  'let entries = await pg.evaluate(() => Array.from(document.querySelectorAll("a[href*=\\"authuser\\"], div[role=\\"button\\"], button")).map((el) => (el.innerText || "").trim().replace(/\\s+/g, " ").slice(0, 80)).filter((t) => t.includes("@gmail.com")).filter((v, i, a) => a.indexOf(v) === i)).catch(() => []);',
  'R.candidates = entries;',
  'for (let i = 0; i < Math.min(entries.length, 9); i++) {',
  '  try {',
  '    await pg.goto(' + JSON.stringify(CHANNEL_URL) + ', { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});',
  '    await pg.waitForTimeout(4000);',
  '    const sw2 = pg.locator("text=অ্যাকাউন্ট পাল্টান").first();',
  '    if ((await sw2.count().catch(() => 0)) === 0) { R.winner = "already-in"; break; }',
  '    await sw2.click({ force: true }); await pg.waitForTimeout(7000);',
  '    const rows = pg.locator("a[href*=\\"authuser\\"]").first();',
  '    const all = await pg.locator("a[href*=\\"authuser\\"]").all();',
  '    if (i >= all.length) { R.log.push("only " + all.length + " rows"); break; }',
  '    const mail = await all[i].innerText().catch(() => "?");',
  '    await all[i].click({ force: true }); await pg.waitForTimeout(9000);',
  '    if (await hasAccess()) { R.winner = mail.slice(0, 60); break; }',
  '    R.log.push("not-owner: " + mail.slice(0, 50));',
  '  } catch (e) { R.log.push("err i=" + i); }',
  '}',
  'return R;',
  '})()',
].join('\n');
async function main() {
  const res = await post({ code, targetUrl: 'studio.youtube.com' }, 500000);
  console.log(JSON.stringify(res.json && res.json.result, null, 2));
  const r = res.json && res.json.result;
  if (r && (r.winner || r.alreadyIn)) { console.log('OWNER FOUND'); process.exit(0); }
  console.log('OWNER NOT FOUND');
  process.exit(2);
}
main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
