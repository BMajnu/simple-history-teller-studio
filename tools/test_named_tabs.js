// Named-tab switching E2E (no OS focus touched anywhere).
// Run: node tools/test_named_tabs.js (app running)
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
const viaToolbar = (fnBody) => [
  'return (async () => {',
  'const ctx = browser.contexts()[0];',
  'const bar = ctx.pages().find((p) => (p.url() || "").includes("browser.html"));',
  'if (!bar) return { fail: "no toolbar" };',
  fnBody,
  '})()',
].join('\n');
async function main() {
  const out = [];
  const step = async (name, code, target, check) => {
    try {
      const res = await post({ code, ...(target ? { targetUrl: target } : {}) }, 60000);
      const ok = res.status === 200 && res.json.ok && check(res.json.result);
      out.push((ok ? 'PASS ' : 'FAIL ') + name + ' ' + JSON.stringify(res.json.result).slice(0, 120));
      return ok;
    } catch (e) { out.push('FAIL ' + name + ' ' + e.message.slice(0, 60)); return false; }
  };
  await step('list-tabs', viaToolbar('return await bar.evaluate(() => window.stb.get());'), null,
    (r) => r && Array.isArray(r.tabs));
  const g = await post({ code: viaToolbar('return await bar.evaluate(() => window.stb.get());') }, 60000).catch(() => null);
  const tabs = (g && g.json && g.json.result && g.json.result.tabs) || [];
  const hasW0 = tabs.some((t) => t.name === 'w0');
  const hasW1 = tabs.some((t) => t.name === 'w1');
  out.push(((hasW0 && hasW1) ? 'PASS ' : 'FAIL ') + 'named-tabs-present w0=' + hasW0 + ' w1=' + hasW1);
  await step('activate-w1', viaToolbar(`const ok = await bar.evaluate(() => window.stb.activateByName("w1")); return { ok };`), null,
    (r) => r && r.ok === true);
  await step('active-is-w1', viaToolbar('return await bar.evaluate(() => window.stb.get());'), null,
    (r) => { const t = (r.tabs || []).find((x) => x.id === r.active); return t && t.name === 'w1'; });
  await step('activate-w0-back', viaToolbar(`const ok = await bar.evaluate(() => window.stb.activateByName("w0")); const g = await bar.evaluate(() => window.stb.get()); const t = (g.tabs || []).find((x) => x.id === g.active); return { ok, active: t && t.name };`), null,
    (r) => r && r.ok === true && r.active === 'w0');
  console.log('--- NAMED TABS ---');
  out.forEach((s) => console.log(s));
  process.exit(out.every((s) => s.startsWith('PASS')) ? 0 : 2);
}
main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
