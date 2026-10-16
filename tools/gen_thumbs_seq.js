// SEQUENTIAL focused thumbnail workers (only the focused tab generates in Chromium).
// One worker tab at a time: focus -> setup -> prompt -> Run -> capture -> next.
// Bounded waits, per-worker try/catch, watchdog exit, final summary (never hangs).
// Baked-in Bengali text per §3.1A. Run: node tools/gen_thumbs_seq.js
// Out: projects/sample_first_king/visual_assets/thumb_ai{P}.jpg
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
  5: 'TEXT SPEC (render EXACTLY): big title "রাজার পতন!" + top badge "পর্ব ৫". SCENE: ancient royal stone sarcophagus and broken crown in dim museum hall beside crumbling desert ruins at golden dawn, open antique leather history journal, distant modern city skyline.',
};
const MODEL = 'gemini-3.1-flash-image';

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

function workerCode(p, prompt) {
  return [
    'return (async () => {',
    'const R = { worker: ' + p + ' };',
    'try {',
    '  const ctx = browser.contexts()[0];',
  '  async function actTab(pg) {',
  '    try {',
  '      const s = await ctx.newCDPSession(pg);',
  '      const ts = await s.send("Target.getTargets");',
  '      const u = pg.url() || "";',
  '      const t = (ts.targetInfos || []).find((x) => (x.url || "") === u) || (ts.targetInfos || []).find((x) => (x.url || "").includes("/u/"));',
  '      if (t) await s.send("Target.activateTarget", { targetId: t.targetId });',
  '    } catch (e) {}',
  '  }',
    '  const pages = ctx.pages();',
  '  let pg = null;',
  '  for (const x of pages) {',
  '    const u = x.url() || "";',
  '    if (!u.includes("/u/' + p + '/prompts/new_chat") && !u.includes("prompts/new_chat")) continue;',
  '    try { const t = await x.title(); if (t && t !== "Google AI Studio") continue; } catch {}',
  '    pg = x; break;',
  '  }',
  '  if (!pg) pg = pages.find((x) => (x.url() || "").includes("prompts/new_chat"));',
  '  if (!pg) {',
  '    try {',
  '      const cs = await ctx.newCDPSession(pages[0]);',
  '      await cs.send("Target.createTarget", { url: "about:blank", background: true });',
  '      await new Promise((r) => setTimeout(r, 3000));',
  '      pg = ctx.pages().find((x) => (x.url() || "").startsWith("about:blank"));',
  '    } catch (e) {}',
  '  }',
  '  if (!pg) return { worker: ' + p + ', fail: "no worker tab" };',
  '  try { const es = await ctx.newCDPSession(pg); await es.send("Emulation.setFocusEmulationEnabled", { enabled: true }); R.femu = true; } catch (e) { R.femu = false; }',
  '  await pg.waitForTimeout(1000);',
    '  try { await pg.goto("https://aistudio.google.com/u/' + p + '/prompts/new_chat?model=' + MODEL + '", { waitUntil: "commit", timeout: 45000 }); }',
    '  catch (e) { R.fail = "nav"; return R; }',
  '  await pg.waitForTimeout(8000);',
  '  await actTab(pg);',
  '  const hasBox = (await pg.locator("[placeholder*=\\"Start typing\\"]").count().catch(() => 0)) > 0;',
    '  if (!hasBox) { R.fail = "no prompt box"; return R; }',
    '  const nSel = await pg.locator("mat-select[role=\\"combobox\\"]").count().catch(() => 0);',
    '  let aspect = null;',
    '  if (nSel >= 1) {',
    '    const sel = pg.locator("mat-select[role=\\"combobox\\"]").nth(0);',
    '    await sel.waitFor({ state: "visible", timeout: 15000 });',
    '    await sel.click({ force: true });',
    '    await pg.locator("mat-option").first().waitFor({ state: "visible", timeout: 12000 }).catch(() => {});',
    '    await pg.waitForTimeout(600);',
    '    const opts = await pg.locator("mat-option").allInnerTexts().catch(() => []);',
    '    const i = opts.findIndex((t) => t.toLowerCase().includes("9:16"));',
    '    if (i >= 0) { await pg.locator("mat-option").nth(i).click({ force: true }); await pg.waitForTimeout(800); aspect = "9:16"; }',
    '    else { await pg.keyboard.press("Escape"); }',
    '  }',
    '  if (!aspect) { R.aspectNote = "auto-fallback"; }',
    '  try {',
    '    const rs = pg.locator("mat-select[role=\\"combobox\\"]").nth(1);',
    '    if ((await rs.count().catch(() => 0)) > 0) { await rs.click({ force: true }); await pg.waitForTimeout(700);',
    '      const oo = await pg.locator("mat-option").allInnerTexts().catch(() => []);',
    '      const k = oo.findIndex((t) => t.trim() === "2K");',
    '      if (k >= 0) await pg.locator("mat-option").nth(k).click({ force: true }); else await pg.keyboard.press("Escape");',
    '      await pg.waitForTimeout(500); }',
    '  } catch (e) {}',
    '  try {',
    '    const th = pg.locator("mat-select[role=\\"combobox\\"]").nth(2);',
    '    if ((await th.count().catch(() => 0)) > 0) { await th.click({ force: true }); await pg.waitForTimeout(700);',
    '      const oo = await pg.locator("mat-option").allInnerTexts().catch(() => []);',
    '      const k = oo.findIndex((t) => t.trim() === "High");',
    '      if (k >= 0) await pg.locator("mat-option").nth(k).click({ force: true }); else await pg.keyboard.press("Escape");',
    '      await pg.waitForTimeout(500); }',
    '  } catch (e) {}',
  '  const before = await pg.evaluate(() => Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);',
    '  const box = pg.locator("[placeholder*=\\"Start typing\\"]").first();',
    '  await box.click({ force: true }); await box.fill(' + JSON.stringify(prompt) + ');',
    '  await pg.waitForTimeout(400);',
    '  await pg.locator("button:has-text(\\"Run\\")").last().click({ force: true });',
    '  let stable = 0, last = "", elapsed = 0, done = false;',
    '  while (elapsed < 150000) {',
  '    await pg.waitForTimeout(4000); elapsed += 4000;',
  '    const cur = await pg.evaluate(() => Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);',
    '    const fresh = cur.filter(s => before.indexOf(s) < 0);',
    '    if (fresh.length > 0 && fresh.join("|") === last) { stable++; if (stable >= 3) { done = true; break; } }',
    '    else { stable = 0; last = fresh.join("|"); }',
    '  }',
    '  if (!done) { R.fail = "gen timeout"; return R; }',
    '  await pg.waitForTimeout(1200);',
    '  await pg.screenshot({ path: "tools/fx_t' + p + '.png" }).catch(() => {});',
    '  const pic = await pg.evaluate(async (oldList) => {',
    '    const all = Array.from(document.querySelectorAll("img")).filter(el => el.naturalWidth >= 200);',
    '    const fresh = all.filter(el => oldList.indexOf(el.src) < 0);',
    '    const t = fresh.length > 0 ? fresh[fresh.length - 1] : null;',
    '    if (!t) return null;',
    '    const r = await fetch(t.src); const b = await r.blob();',
    '    return await new Promise((res) => { const fr = new FileReader();',
    '      fr.onloadend = () => res({ data: fr.result.split(",")[1], w: t.naturalWidth, h: t.naturalHeight });',
    '      fr.readAsDataURL(b); });',
    '  }, before);',
    '  if (!pic) { R.fail = "capture failed"; return R; }',
    '  return { worker: ' + p + ', ok: true, w: pic.w, h: pic.h, b64: pic.data };',
    '} catch (e) { return { worker: ' + p + ', fail: String(e && e.message || e).slice(0, 100) }; }',
    '})()',
  ].join('\n');
}

async function main() {
  const summary = [];
  const finish = (code) => {
    console.log('--- SUMMARY ---');
    summary.forEach((s) => console.log(s));
    const ok = summary.filter((s) => s.startsWith('OK')).length;
    console.log('RESULT: ' + ok + '/' + summary.length + ' thumbnails saved');
    process.exit(code);
  };
  setTimeout(() => { console.log('WATCHDOG: time over, partial results:'); finish(2); }, 540000);
  for (const p of [1, 2, 3, 4, 5]) {
    const dest = path.join(OUTDIR, 'thumb_ai' + p + '.jpg');
    if (fs.existsSync(dest) && fs.statSync(dest).size > 50000) { summary.push('OK ' + p + ' exists, skipped'); continue; }
    console.log('Worker ' + p + ' focused run...');
    try {
      const res = await post({ code: workerCode(p, STYLE + ' ' + TEXTS[p]), targetUrl: 'new_chat' }, 280000);
      const r = res.json && res.json.result;
      if (res.status === 200 && res.json.ok && r && r.ok && r.b64) {
        fs.writeFileSync(dest, Buffer.from(r.b64, 'base64'));
        summary.push('OK ' + p + ' saved (' + r.w + 'x' + r.h + ')');
      } else summary.push('FAIL ' + p + ' ' + ((r && r.fail) || (res.json && res.json.error) || res.status));
    } catch (e) { summary.push('FAIL ' + p + ' ' + e.message.slice(0, 100)); }
  }
  finish(summary.some((s) => s.startsWith('FAIL')) ? 2 : 0);
}
main();
