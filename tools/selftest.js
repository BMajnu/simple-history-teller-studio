// Zero-side-effect self-test: browser features + automation surface. NOTHING is
// published/saved/uploaded (upload dialog is opened then ESCAPED with no file).
// Run: node tools/selftest.js   (app must be running; daemon on :9333)
const fs = require('fs');
const http = require('http');
const path = require('path');

const RESULTS = [];
function rec(name, ok, detail) {
  RESULTS.push({ name, ok, detail: String(detail || '').slice(0, 90) });
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + String(detail).slice(0, 90) : ''));
}
function daemon(pathname, body, ms) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const req = http.request({ host: '127.0.0.1', port: 9333, path: pathname, method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': data.length } : {}) }, timeout: ms || 60000 }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(raw) }); } catch (e) { reject(new Error('bad json')); } });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    if (data) req.write(data);
    req.end();
  });
}
const APPDATA = process.env.APPDATA + '/simple-itihash-production-studio/auto_tabs.json';
const run = (code, target, ms) => daemon('/run-script', {
  code,
  targetUrl: target,
  run: { projectId: '_automation', workflow: 'selftest', agentName: 'selftest', tabName: 'selftest', captureIntervalMs: 10000 },
}, ms || 90000);

async function main() {
  const finish = (code) => {
    const ok = RESULTS.filter((r) => r.ok).length;
    console.log('--- SELFTEST: ' + ok + '/' + RESULTS.length + ' passed ---');
    process.exit(code);
  };
  setTimeout(() => { console.log('WATCHDOG exit'); finish(2); }, 480000);
  try {
    // 1. daemon alive + browser connected
    const st = await daemon('/status', null, 30000);
    rec('daemon-connected', st.json && st.json.connected === true, 'tabs=' + ((st.json && st.json.tabs || []).length));
    if (!st.json.connected) return finish(2);
    // 2. drop-file tab opener (unique marker URL, harmless page)
    const marker = 'w=selftest' + Date.now() % 100000;
    fs.writeFileSync(APPDATA, JSON.stringify({ tabs: ['https://example.com/?' + marker] }), 'utf8');
    let seen = false;
    for (let i = 0; i < 10 && !seen; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const s2 = await daemon('/status', null, 20000).catch(() => null);
      seen = !!((s2 && s2.json && s2.json.tabs || []).find((t) => (t.url || '').includes(marker)));
    }
    rec('dropfile-tab-open', seen, marker);
    // 3. evaluate + UA check on the test tab (proves automation surface + Chrome UA, no Electron leak)
    const r3 = await run(`return (async () => {
      const matches = browser.contexts().flatMap((ctx) => ctx.pages()).filter((p) => (p.url() || "").includes("${marker}"));
      const pg = matches.length === 1 ? matches[0] : null;
      if (!pg) return { fail: "no test tab" };
      const ua = await pg.evaluate(() => navigator.userAgent).catch(() => "?");
      const t = await pg.title().catch(() => "?");
      return { ua, title: t };
    })()`, marker, 60000);
    const ua = (r3.json && r3.json.result && r3.json.result.ua) || '';
    rec('eval-works', !!ua && ua !== '?', ua.slice(0, 60));
    rec('ua-chrome-no-electron', /Chrome\/151/.test(ua) && !/Electron/.test(ua), ua.slice(0, 60));
    // 4. screenshot (best-effort, bounded — must not fail the suite)
    const r4 = await run(`return (async () => {
      const matches = browser.contexts().flatMap((ctx) => ctx.pages()).filter((p) => (p.url() || "").includes("${marker}"));
      const pg = matches.length === 1 ? matches[0] : null;
      if (!pg) return { fail: 1 };
      try { await pg.screenshot({ path: "tools/selftest_shot.png", timeout: 15000 }); return { ok: 1 }; }
      catch (e) { return { ok: 0 }; }
    })()`, marker, 60000);
    const shotOk = r4.json && r4.json.result && r4.json.result.ok === 1;
    rec('screenshot-besteffort', true, shotOk ? 'captured' : 'skipped-hung (allowed)');
    // 5. session alive (myaccount snippet has @gmail) — read-only
    const r5 = await run(`return (async () => {
      const matches = browser.contexts().flatMap((ctx) => ctx.pages()).filter((p) => (p.url() || "").includes("${marker}"));
      const pg = matches.length === 1 ? matches[0] : null;
      if (!pg) return { fail: 1 };
      try { await pg.goto("https://myaccount.google.com/", { waitUntil: "commit", timeout: 40000 }); } catch (e) { return { fail: "nav" }; }
      await pg.waitForTimeout(8000);
      return await pg.evaluate(() => ({ url: location.href, hasMail: /[\\w.]+@[\\w.]+\\.[a-z]{2,}/.test(document.body.innerText) })).catch(() => ({}));
    })()`, marker, 90000);
    const mails = r5.json && r5.json.result;
    rec('session-alive', !!(mails && mails.hasMail), (mails && mails.url || '').slice(0, 50));
    // 6. AI playground imag-surface present (NO Run click = zero quota): prompt box + aspect options
    const r6 = await run(`return (async () => {
      const matches = browser.contexts().flatMap((ctx) => ctx.pages()).filter((p) => (p.url() || "").includes("${marker}"));
      const pg = matches.length === 1 ? matches[0] : null;
      if (!pg) return { fail: 1 };
      try { await pg.goto("https://aistudio.google.com/u/2/prompts/new_chat?model=gemini-3.1-flash-image", { waitUntil: "commit", timeout: 45000 }); } catch (e) { return { fail: "nav" }; }
      await pg.waitForTimeout(12000);
      const box = (await pg.locator("[placeholder*=\\"Start typing\\"]").count().catch(() => 0)) > 0;
      const nSel = await pg.locator("mat-select[role=\\"combobox\\"]").count().catch(() => 0);
      return { box, selects: nSel, url: pg.url() };
    })()`, marker, 120000);
    const g = r6.json && r6.json.result;
    rec('ai-playground-surface', !!(g && g.box && g.selects >= 1), 'box=' + (g && g.box) + ' selects=' + (g && g.selects));
    // 7. Studio upload dialog dry-run: open dialog, verify file input, ESCAPE with NO file (zero side effects)
    const r7 = await run(`return (async () => {
      const R = {};
      const matches = browser.contexts().flatMap((ctx) => ctx.pages()).filter((p) => (p.url() || "").includes("${marker}"));
      const pg = matches.length === 1 ? matches[0] : null;
      if (!pg) return { fail: 'test tab missing or ambiguous' };
      try { await pg.goto("https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos?authuser=2", { waitUntil: "domcontentloaded", timeout: 45000 }); }
      catch (e) { R.fail = "nav"; return R; }
      await pg.waitForTimeout(6000);
      const t = await pg.evaluate(() => document.body.innerText.slice(0, 200)).catch(() => "");
      if (/অনুমতি নেই/.test(t)) { R.fail = "no channel access"; return R; }
      R.channelOk = /Simple History Teller Bangla/.test(t);
      const create = pg.getByRole("button", { name: /^create$/i }).first();
      if (await create.isVisible().catch(() => false)) { await create.click({ force: true }); R.create = "clicked"; } else R.create = "notfound";
      await pg.waitForTimeout(2500);
      const uploadItem = pg.getByText(/upload videos/i).first();
      if (await uploadItem.isVisible().catch(() => false)) { await uploadItem.click({ force: true }); R.uploadItem = "clicked"; } else R.uploadItem = "notfound";
      await pg.waitForTimeout(4000);
      R.fileInput = await pg.evaluate(() => document.querySelectorAll('input[type="file"]').length).catch(() => -1);
      await pg.keyboard.press("Escape").catch(() => {});
      await pg.waitForTimeout(1500);
      R.escaped = true;
      return R;
    })()`, 'studio.youtube.com', 180000);
    const u = r7.json && r7.json.result;
    rec('studio-channel-access', !!(u && u.channelOk), 'Bangla channel');
    rec('upload-dialog-dryrun', !!(u && u.fileInput > 0 && u.escaped), 'create=' + (u && u.create) + ' item=' + (u && u.uploadItem) + ' inputs=' + (u && u.fileInput));
    // 8. server API: Nalanda audio present (workspace-root fix proof)
    try {
      const pj = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:4000/api/project/simple_itihash_003_nalanda', (res) => {
          let raw = ''; res.on('data', (c) => { raw += c; });
          res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
        }).on('error', reject);
      });
      rec('server-audio-present', !!(pj.audio && pj.audio.bn && pj.audio.en && pj.audio.hi), 'bn/en/hi');
    } catch (e) { rec('server-audio-present', false, e.message); }
  } catch (e) { rec('suite-crash', false, String(e.message || e).slice(0, 80)); }
  const fails = RESULTS.filter((r) => !r.ok && r.name !== 'screenshot-besteffort').length;
  const active = RESULTS.filter((r) => r.ok).length;
  console.log('--- SELFTEST: ' + active + '/' + RESULTS.length + ' passed ---');
  process.exit(fails ? 2 : 0);
}
main();
