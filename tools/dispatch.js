// Lyria dispatch runner. Fresh runs create uniquely named BrowserView tabs; reuse
// runs require the printed RUN_ID so duplicate AI Studio URLs are never ambiguous.
// Run: node tools/dispatch.js
// Reuse a prior fresh run: $env:REUSE='1'; $env:RUN_ID='<printed-run-id>'; node tools/dispatch.js
// Add DRY=1 to inspect/click the music preset without filling or generating audio.
const http = require('http');
const PROJECT_ID = process.env.PROJECT_ID || '_automation';
const ACCOUNT_SLOT = process.env.ACCOUNT_SLOT || 'unknown';

const JOBS = [
  { name: 'm0', prompt: 'TEST MULTI-1: 20 seconds, war drums and bronze horns, epic ancient battle, instrumental' },
  { name: 'm1', prompt: 'TEST MULTI-2: 20 seconds, lonely desert flute over soft wind, calm night, instrumental' },
  { name: 'm2', prompt: 'TEST MULTI-3: 20 seconds, fast tribal percussion and rattles, celebration dance, instrumental' },
];
const MUSIC_URL = 'https://aistudio.google.com/app/new_music?model=lyria-3.5';

function post(body, ms) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({
      host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms,
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(raw) }); }
        catch { reject(new Error('Daemon returned invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Daemon timeout')));
    req.write(data);
    req.end();
  });
}

const code = [
  'return (async () => {',
  'const JOBS = __JOBS__;',
  'const RUN_ID = __RUN_ID__;',
  'const DRY = __DRY__;',
  'const REUSE = __REUSE__;',
  'const MUSIC_URL = __MUSIC_URL__;',
  'const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));',
  'const ACCOUNT_SLOT = __ACCOUNT_SLOT__;',
  'const pages = () => browser.contexts().flatMap((context) => context.pages());',
  'const bar = pages().find((p) => (p.url() || "").includes("browser.html"));',
  'if (!bar) return { fail: "no toolbar" };',
  'async function stb(method, arg) {',
  '  return Promise.race([',
  '    bar.evaluate(({ method: m, arg: a }) => {',
  '      if (m === "new") return window.stb.newTab(a.url, a.name, a.options || {});',
  '      if (m === "get") return window.stb.get();',
  '    }, { method, arg }),',
  '    sleep(20000).then(() => null),',
  '  ]).catch(() => null);',
  '}',
  'const nameOf = (j) => `${RUN_ID}-${j.name}`;',
  'const markerOf = (j) => `si_dispatch=${encodeURIComponent(nameOf(j))}`;',
  'const urlOf = (j) => `${MUSIC_URL}&${markerOf(j)}`;',
  'async function resolvePage(j) {',
  '  const name = nameOf(j), marker = markerOf(j);',
  '  for (let attempt = 0; attempt < 30; attempt++) {',
  '    const tabs = await stb("get");',
  '    const named = tabs && tabs.tabs && tabs.tabs.some((t) => t.name === name);',
  '    const matches = pages().filter((p) => (p.url() || "").includes(marker));',
  '    if (named && matches.length === 1) return matches[0];',
  '    await sleep(2000);',
  '  }',
  '  return null;',
  '}',
  'async function surface(pg, maxMs) {',
  '  const until = Date.now() + maxMs;',
  '  while (Date.now() < until) {',
  '    const box = pg.locator("textarea, div[contenteditable=\\"true\\"], [role=\\"textbox\\"]").first();',
  '    const hasBox = await box.isVisible().catch(() => false);',
  '    const card = pg.getByRole("button", { name: /cinematic score/i }).first();',
  '    const hasCard = await card.isVisible().catch(() => false);',
  '    if (!hasBox && hasCard) await card.click({ force: true }).catch(() => {});',
  '    const state = { box: hasBox, card: hasCard };',
  '    if (state.box) return state;',
  '    await sleep(state.card ? 3000 : 2000);',
  '  }',
  '  return { box: false };',
  '}',
  'async function submit(pg, prompt) {',
  '  const box = pg.locator("textarea, div[contenteditable=\\"true\\"], [role=\\"textbox\\"]").first();',
  '  if (!await box.isVisible().catch(() => false)) return { fail: "prompt disappeared" };',
  '  await box.fill(prompt);',
  '  const buttons = pg.locator("button");',
  '  const count = await buttons.count();',
  '  for (let i = 0; i < count; i++) {',
  '    const button = buttons.nth(i);',
  '    const label = (await button.innerText().catch(() => "")).trim();',
  '    if (/^generate\\b/i.test(label) && await button.isVisible().catch(() => false) && !await button.isDisabled().catch(() => true)) {',
  '      await button.click({ force: true, timeout: 15000 });',
  '      return { submitted: true, label };',
  '    }',
  '  }',
  '  return { fail: "enabled Generate button missing" };',
  '}',
  'if (!REUSE) {',
  '  for (const j of JOBS) {',
  '    const tab = await stb("new", { url: urlOf(j), name: nameOf(j), options: { background: true, accountSlot: ACCOUNT_SLOT, agentName: "bgm-worker-" + j.name } });',
  '    if (tab === null) return { fail: `could not open ${nameOf(j)}` };',
  '    await sleep(5200); // avoid AI Studio navigation contention',
  '  }',
  '} else if (!RUN_ID) {',
  '  return { fail: "REUSE requires RUN_ID from a prior fresh run" };',
  '}',
  'const out = [];',
  'for (const j of JOBS) {',
  '  const r = { name: j.name, tab: nameOf(j), mode: REUSE ? "reuse" : "fresh" };',
  '  try {',
  '    const pg = await resolvePage(j);',
  '    if (!pg) { r.fail = "named tab not found"; out.push(r); continue; }',
  '    await automation.watchPage(pg, { agentName: "bgm-worker-" + j.name, accountSlot: ACCOUNT_SLOT, tabName: nameOf(j) });',
  '    const state = await surface(pg, 45000);',
  '    if (!state.box) { r.fail = "no prompt box"; out.push(r); continue; }',
  '    if (DRY) { r.dry = true; r.sent = false; r.busy = false; out.push(r); continue; }',
  '    const submitted = await submit(pg, j.prompt);',
  '    if (submitted.fail) { r.fail = submitted.fail; out.push(r); continue; }',
  '    await sleep(8000);',
  '    const status = await pg.evaluate((text) => ({',
  '      sent: document.body.innerText.includes(text.slice(0, 20)),',
  '      busy: /thinking|generating|composing/i.test(document.body.innerText.slice(0, 5000)),',
  '    }), j.prompt).catch(() => ({}));',
  '    r.sent = !!status.sent; r.busy = !!status.busy;',
  '    if (!r.sent && !r.busy) { r.fail = "generate did not start"; await automation.capture("run_not_accepted"); }',
  '  } catch (e) { r.fail = String(e.message || e).slice(0, 140); }',
  '  out.push(r);',
  '}',
  'return { runId: RUN_ID, rows: out };',
  '})()',
].join('\n');

async function main() {
  const dry = process.env.DRY === '1';
  const reuse = process.env.REUSE === '1';
  const runId = process.env.RUN_ID || `lyria-${Date.now().toString(36)}`;
  const requestedWorkers = (process.env.WORKERS || '').split(',').map((name) => name.trim()).filter(Boolean);
  const jobs = requestedWorkers.length ? JOBS.filter((job) => requestedWorkers.includes(job.name)) : JOBS;
  if (reuse && !process.env.RUN_ID) throw new Error('REUSE=1 requires RUN_ID from a previous fresh run');
  if (!jobs.length) throw new Error(`No matching workers: ${requestedWorkers.join(', ')}`);
  console.log(`Dispatching ${jobs.length} jobs [${reuse ? 'REUSE' : 'FRESH'}] run=${runId}${dry ? ' [DRY RUN]' : ''}`);
  const code2 = code
    .replace('__JOBS__', JSON.stringify(jobs))
    .replace('__RUN_ID__', JSON.stringify(runId))
    .replace('__DRY__', dry ? 'true' : 'false')
    .replace('__REUSE__', reuse ? 'true' : 'false')
    .replace('__MUSIC_URL__', JSON.stringify(MUSIC_URL))
    .replace('__ACCOUNT_SLOT__', JSON.stringify(ACCOUNT_SLOT));
  const res = await post({
    code: code2,
    run: { projectId: PROJECT_ID, workflow: 'bgm_dispatch', agentName: 'bgm-fleet', accountSlot: ACCOUNT_SLOT, tabName: runId, captureIntervalMs: 5000 },
  }, 420000);
  const result = res.json && res.json.result;
  if (!result || result.fail) throw new Error((result && result.fail) || 'No dispatch result');
  console.log(`RUN_ID=${result.runId}`);
  for (const row of result.rows || []) {
    console.log(`${row.name}: ${row.fail ? `FAIL ${row.fail}` : `prompt-ready${row.dry ? ' (dry)' : ` sent=${row.sent} busy=${row.busy}`}`}`);
  }
  console.log('DISPATCH DONE — harvest separately later.');
}

main().catch((e) => { console.error(`FATAL: ${e.message}`); process.exit(1); });
