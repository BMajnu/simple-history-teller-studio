// 5 PARALLEL in-browser thumbnail workers — TWO daemon calls (light responses).
// Phase 1: 5 workers generate concurrently (no image bytes transferred).
// Phase 2: capture images from each worker's unique chat URL concurrently.
// (Single agent; pipeline parallelism, no subagents.) Baked-in Bengali text per §3.1A.
// Run: node tools/gen_thumbs_parallel2.js
// Out: projects/sample_first_king/visual_assets/thumb_ai{P}.jpg + tools/fx_t{P}.png
const fs = require('fs');
const path = require('path');
const http = require('http');

const OUTDIR = path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'visual_assets');
const STYLE = 'OverSimplified cartoon sticky-meme style vertical 9:16 illustration, bold Bengali display typography, huge white title text with thick black outline and fiery orange glow centered in upper third, small red pill badge with white text at very top edge, vibrant saturated colors, bold clean vector outlines, cinematic lighting, no photorealism, no 3d render, no watermark, no signature';
const TEXTS = {
  1: 'TEXT SPEC (render EXACTLY): big title "শিকারিকে উপহাস!" + top badge "পর্ব ১". SCENE: prehistoric Kalahari hunters around glowing campfire under starry night, proud hunter with spear beside huge hunted beast while tribesmen laugh and tease him.',
  2: 'TEXT SPEC (render EXACTLY): big title "কৃষিকাজের মারণফাঁদ!" + top badge "পর্ব ২". SCENE: ancient agricultural revolution, giant clay grain silos bursting with golden wheat, exhausted sweating farmer with wooden sickle, golden sunrise.',
  3: 'TEXT SPEC (render EXACTLY): big title "প্রথম চাঁদাবাজি!" + smaller subtitle "ইতিহাসের প্রথম ডন!" + top badge "পর্ব ৩". SCENE: menacing ancient warlord in bronze helmet grabbing basket of grain from terrified skinny farmer at mudbrick village gate, guards with torches, dramatic sunset.',
  4: 'TEXT SPEC (render EXACTLY): big title "সুমেরীয় সম্রাট সার্গন!" + top badge "পর্ব ৪". SCENE: mighty ancient Sumerian king with golden horned crown on magnificent golden throne, giant mudbrick ziggurat behind, rows of soldiers with spears, royal golden light.',
  5: 'TEXT SPEC (render EXACTLY): big title "রাজার পতন!" + top badge "পর্ব ৫". SCENE: ancient royal stone sarcophagus and broken crown in dim museum hall beside crumbling desert ruins at golden dawn, open antique leather journal, distant modern city skyline.',
};

function post(body, ms) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({ host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(raw) }); } catch (e) { reject(new Error('bad json len=' + raw.length)); } });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('daemon timeout')));
    req.write(data);
    req.end();
  });
}

const SETUP_FN = [
  'async function setSelect(pg, idx, want) {',
  '  const sel = pg.locator("mat-select[role=\\"combobox\\"]").nth(idx);',
  '  await sel.waitFor({ state: "visible", timeout: 20000 });',
  '  await sel.scrollIntoViewIfNeeded().catch(() => {});',
  '  await sel.click({ force: true });',
  '  await pg.locator("mat-option").first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});',
  '  await pg.waitForTimeout(800);',
  '  const opts = await pg.locator("mat-option").allInnerTexts().catch(() => []);',
  '  const i = opts.findIndex((t) => t.toLowerCase().includes(want.toLowerCase()));',
  '  if (i < 0) { await pg.keyboard.press("Escape"); return null; }',
  '  await pg.locator("mat-option").nth(i).click({ force: true }); await pg.waitForTimeout(700);',
  '  return (await sel.innerText().catch(() => "")).trim();',
  '}',
].join('\n');

const WORKER_FN = [
  'async function worker(w) {',
  '  const R = { worker: w.p };',
  '  try {',
  '    const pg = w.page;',
  '    await new Promise((r) => setTimeout(r, w.i * 1200));',
  '    await pg.bringToFront().catch(() => {});',
  '    try { await pg.goto("https://aistudio.google.com/u/" + w.u + "/prompts/new_chat?model=gemini-3.1-flash-image", { waitUntil: "commit", timeout: 60000 }); }',
  '    catch (e) { R.fail = "nav:" + String(e.message).slice(0, 80); return R; }',
  '    await pg.waitForTimeout(10000);',
  '    await pg.bringToFront().catch(() => {});',
  '    let hasBox = (await pg.locator("[placeholder*=\\"Start typing\\"]").count().catch(() => 0)) > 0;',
  '    if (!hasBox) {',
  '      try { await pg.goto("https://aistudio.google.com/u/" + w.u + "/prompts/new_chat?model=gemini-3.1-flash-image", { waitUntil: "commit", timeout: 90000 }); }',
  '      catch (e) { R.fail = "nav2:" + String(e.message).slice(0, 80); return R; }',
  '      await pg.waitForTimeout(12000);',
  '      hasBox = (await pg.locator("[placeholder*=\\"Start typing\\"]").count().catch(() => 0)) > 0;',
  '      if (!hasBox) { R.fail = "no prompt box"; return R; }',
  '    }',
  '    R.url = pg.url();',
  '    try {',
  '      const nSel = await pg.locator("mat-select[role=\\"combobox\\"]").count().catch(() => 0);',
  '      if (nSel < 3) {',
  '        const chip = pg.locator("button").filter({ hasText: /Gemini|Nano|Flash|Imagen/i }).first();',
  '        await chip.click({ force: true }); await pg.waitForTimeout(1500);',
  '        const nb = pg.locator("text=Nano Banana 2.1").first();',
  '        if ((await nb.count().catch(() => 0)) > 0) { await nb.click({ force: true }); await pg.waitForTimeout(5000); }',
  '        else { await pg.keyboard.press("Escape"); R.fail = "no Nano Banana option"; return R; }',
  '      }',
  '    } catch (e) { R.fail = "model:" + String(e.message).slice(0, 80); return R; }',
  '    let aspect = null;',
  '    try { aspect = await setSelect(pg, 0, "9:16"); } catch (e) { aspect = "err"; }',
  '    if (!aspect || aspect.indexOf("9:16") < 0) { R.fail = "aspect:" + aspect; return R; }',
  '    try { await setSelect(pg, 1, "2K"); } catch (e) {}',
  '    try { await setSelect(pg, 2, "High"); } catch (e) {}',
  '    try { const io = pg.locator("text=Images only").first(); if (await io.count() > 0) await io.click({ force: true }); } catch (e) {}',
  '    await pg.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {}); await pg.waitForTimeout(2000);',
  '    const box = pg.locator("[placeholder*=\\"Start typing\\"]").first();',
  '    await box.click({ force: true }); await box.fill(w.prompt);',
  '    await pg.waitForTimeout(500);',
  '    await pg.locator("button:has-text(\\"Run\\")").last().click({ force: true });',
  '    let stable = 0, last = "", elapsed = 0, done = false;',
  '    while (elapsed < 220000) {',
  '      await pg.waitForTimeout(4000); elapsed += 4000;',
  '      const n = await pg.evaluate(() => Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 500).length).catch(() => 0);',
  '      if (n > 0 && n === last) { stable++; if (stable >= 3) { done = true; break; } }',
  '      else { stable = 0; last = n; }',
  '    }',
  '    await pg.waitForTimeout(1500);',
  '    await pg.screenshot({ path: "tools/fx_t" + w.p + ".png" }).catch(() => {});',
  '    const cnt = await pg.evaluate(() => Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 500).length).catch(() => 0);',
  '    R.ok = done && cnt > 0; R.count = cnt; if (!R.ok) R.fail = "unstable:" + cnt;',
  '  } catch (e) { R.fail = String(e && e.message || e).slice(0, 120); }',
  '  return R;',
  '}',
].join('\n');

const PHASE1 = [
  'return (async () => {',
  'const STYLE = ' + JSON.stringify(STYLE) + ';',
  'const TEXTS = ' + JSON.stringify(TEXTS) + ';',
  'const ctx = browser.contexts()[0];',
  SETUP_FN,
  WORKER_FN,
  '  let pools = ctx.pages().filter((p) => { const u = p.url() || ""; return u.includes("aistudio.google.com") || u.startsWith("about:blank"); });',
  '  if (pools.length < 5) return [{fail:"only "+pools.length+" worker tabs"}];',
  '  const blanks = pools.slice(0,5);',
  '  const jobs = [1, 2, 3, 4, 5].map((p, i) => ({ p, i, u: p, page: blanks[i], prompt: STYLE + " " + TEXTS[p] }));',
  '  const results = [];',
  '  for (const wave of [[0,1,2],[3,4]]) {',
  '    const r = await Promise.all(wave.map((k) => worker(jobs[k])));',
  '    results.push(...r);',
  '  }',
  '  return results;',
  '})()',
].join('\n');

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  console.log('Phase 1: 5 workers generating in parallel (watch Vivaldi)...');
  const r1 = await post({ code: PHASE1, targetUrl: 'aistudio.google.com' }, 560000);
  if (r1.status !== 200 || !r1.json.ok || !Array.isArray(r1.json.result)) throw new Error('phase1 failed: ' + JSON.stringify(r1.json).slice(0, 300));
  const urls = {};
  let failed = 0;
  for (const r of r1.json.result) {
    if (r.ok) { urls[r.worker] = r.url; console.log('Worker ' + r.worker + ' generated (' + r.count + ' imgs) ' + r.url); }
    else { failed++; console.log('Worker ' + r.worker + ' FAILED: ' + (r.fail || 'unknown')); }
  }
  const good = Object.keys(urls);
  if (!good.length) throw new Error('all workers failed');
  console.log('Phase 2: capturing ' + good.length + ' images...');
  const capCode = [
    'return (async () => {',
    'const MAP = ' + JSON.stringify(urls) + ';',
  'const ctxs = browser.contexts();',
  'const ctx = ctxs.find((c) => c.pages().some((p) => (p.url() || "").includes("aistudio.google.com") || (p.url() || "").includes("mail.google.com"))) || ctxs[0];',
    'const out = [];',
    'await Promise.all(Object.keys(MAP).map(async (w) => {',
    '  const pg = ctx.pages().find((p) => (p.url() || "") === MAP[w]);',
    '  if (!pg) { out.push({ worker: +w, fail: "tab gone" }); return; }',
    '  try {',
    '    await pg.bringToFront().catch(() => {});',
    '    const pic = await pg.evaluate(async () => {',
    '      const all = Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 500);',
    '      const t = all.length ? all[all.length - 1] : null;',
    '      if (!t) return null;',
    '      const r = await fetch(t.src); const b = await r.blob();',
    '      return await new Promise((res) => { const fr = new FileReader();',
    '        fr.onloadend = () => res({ data: fr.result.split(",")[1], w: t.naturalWidth, h: t.naturalHeight });',
    '        fr.readAsDataURL(b); });',
    '    });',
    '    if (!pic) out.push({ worker: +w, fail: "no image" });',
    '    else out.push({ worker: +w, ok: true, w: pic.w, h: pic.h, b64: pic.data });',
    '  } catch (e) { out.push({ worker: +w, fail: String(e.message).slice(0, 100) }); }',
    '}));',
    'return out;',
    '})()',
  ].join('\n');
  const r2 = await post({ code: capCode, targetUrl: 'aistudio.google.com' }, 240000);
  if (r2.status !== 200 || !r2.json.ok || !Array.isArray(r2.json.result)) throw new Error('phase2 failed: ' + JSON.stringify(r2.json).slice(0, 300));
  for (const r of r2.json.result) {
    if (r.ok && r.b64) {
      const dest = path.join(OUTDIR, 'thumb_ai' + r.worker + '.jpg');
      fs.writeFileSync(dest, Buffer.from(r.b64, 'base64'));
      console.log('Worker ' + r.worker + ' SAVED thumb_ai' + r.worker + '.jpg (' + r.w + 'x' + r.h + ', ' + (fs.statSync(dest).size / 1024).toFixed(0) + 'KB)');
    } else { failed++; console.log('Worker ' + r.worker + ' CAPTURE FAILED: ' + (r.fail || 'unknown')); }
  }
  if (failed) { console.log(failed + ' WORKER(S) FAILED'); process.exit(2); }
  console.log('ALL 5 THUMBNAILS DONE');
}
main().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
