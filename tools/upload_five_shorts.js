// Upload 5 full-coverage BN Shorts to the Bangla channel (sequential, backgrounded).
// Meta: renders/shorts_full/shorts_full_meta.json. Files: short_bn_full{P}.mp4
// Run: node tools/upload_five_shorts.js [1-3|4-5]   (argv range filter; default all)
// Out: renders/shorts_full/uploaded_shorts.json (appended). Bounded waits, summary, exit codes.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const META = require('../projects/sample_first_king/renders/shorts_full/shorts_full_meta.json');
const OUTDIR = path.join(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');
const CHANNEL = 'UCOzERwa3GJqO00B8LMTPtDg';
const KIDS_NO = 'tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]';

function range() {
  const a = process.argv[2] || '1-5';
  const m = a.match(/(\d)-(\d)/);
  if (!m) return [1, 2, 3, 4, 5];
  const r = [];
  for (let i = +m[1]; i <= +m[2]; i++) r.push(i);
  return r;
}
function alreadyDone() {
  try { return JSON.parse(fs.readFileSync(path.join(OUTDIR, 'uploaded_shorts.json'), 'utf8')).done || []; }
  catch { return []; }
}
function markDone(entry) {
  let d = { done: [] };
  try { d = JSON.parse(fs.readFileSync(path.join(OUTDIR, 'uploaded_shorts.json'), 'utf8')); } catch {}
  d.done = (d.done || []).filter((x) => x.part !== entry.part).concat([entry]);
  fs.writeFileSync(path.join(OUTDIR, 'uploaded_shorts.json'), JSON.stringify(d, null, 2));
}

async function uploadOne(page, ctx, meta) {
  const file = path.join(OUTDIR, meta.file);
  console.log(`--- PART ${meta.part}: ${meta.file} (${meta.sizeMb}MB) ---`);
  await page.evaluate(() => { try { window.onbeforeunload = null; } catch {} }).catch(() => {});
  try {
    await page.goto(`https://studio.youtube.com/channel/${CHANNEL}/videos/upload?d=pt&authuser=2`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (e) {
    await page.evaluate(() => { try { window.onbeforeunload = null; } catch {} }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.goto(`https://studio.youtube.com/channel/${CHANNEL}/videos/upload?d=pt&authuser=2`, { waitUntil: 'commit', timeout: 45000 });
    await page.waitForTimeout(5000);
  }
  await page.waitForTimeout(4000);
  const c0 = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => (x.innerText || '').trim() === 'Create');
    if (b) { b.click(); return 'clicked'; } return 'notfound';
  }).catch(() => 'err');
  console.log('create click: ' + c0);
  await page.waitForTimeout(2500);
  const c1 = await page.evaluate(() => {
    const u = [...document.querySelectorAll('tp-yt-paper-item')].find((x) => (x.innerText || '').includes('Upload videos'));
    if (u) { u.click(); return 'clicked'; } return 'notfound';
  }).catch(() => 'err');
  console.log('upload-videos click: ' + c1);
  await page.waitForTimeout(4000);
  const fi = page.locator('input[type="file"]').first();
  await fi.waitFor({ state: 'attached', timeout: 30000 });
  const cdp = await ctx.newCDPSession(page);
  let set = false;
  for (let attempt = 0; attempt < 4 && !set; attempt++) {
    try {
      const { root } = await cdp.send('DOM.getDocument');
      const q = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'input[type="file"]' });
      if (q && q.nodeId) { await cdp.send('DOM.setFileInputFiles', { files: [file], nodeId: q.nodeId }); set = true; }
      else await page.waitForTimeout(2500);
    } catch (e) { await page.waitForTimeout(2500); }
  }
  if (!set) throw new Error('file input attach failed');
  console.log('file attached, waiting details form...');
  const titleBox = page.locator('#title-textarea #textbox').first();
  let ready = false;
  for (let w = 0; w < 30 && !ready; w++) {
    await page.waitForTimeout(6000);
    ready = await titleBox.isVisible().catch(() => false);
  }
  if (!ready) throw new Error('details form never rendered');
  await page.waitForTimeout(4000);
  await page.evaluate((t) => {
    const el = document.querySelector('#title-textarea #textbox');
    el.focus(); document.execCommand('selectAll', false, null); document.execCommand('delete', false, null);
    document.execCommand('insertText', false, t);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
  }, meta.title);
  await page.evaluate((t) => {
    const el = document.querySelector('#description-textarea #textbox');
    el.focus(); document.execCommand('selectAll', false, null); document.execCommand('delete', false, null);
    document.execCommand('insertText', false, t);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
  }, meta.desc);
  console.log('title+desc set');
  const nk = page.locator(KIDS_NO).first();
  if (await nk.isVisible({ timeout: 8000 }).catch(() => false)) { await nk.click({ force: true }); await page.waitForTimeout(600); }
  const nextBtn = page.locator('#next-button').first();
  for (let s = 0; s < 3; s++) { await nextBtn.click(); await page.waitForTimeout(2500); }
  const pub = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await pub.isVisible({ timeout: 8000 }).catch(() => false)) { await pub.click({ force: true }); await page.waitForTimeout(800); }
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 15000 });
  await doneBtn.click({ force: true });
  await page.waitForTimeout(10000);
  const url = await page.locator('a[href*="youtu.be"], a[href*="youtube.com/shorts"]').first().getAttribute('href').catch(() => null);
  await page.screenshot({ path: `tools/full_up${meta.part}.png` }).catch(() => {});
  return url;
}

(async () => {
  const summary = [];
  const finish = (code) => {
    console.log('--- UPLOAD SUMMARY ---'); summary.forEach((s) => console.log(s));
    process.exit(code);
  };
  setTimeout(() => { console.log('WATCHDOG exit'); finish(2); }, 1500000);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctxs = browser.contexts();
  const ctx = ctxs.find((c) => c.pages().some((p) => (p.url() || '').includes('w=up'))) || ctxs.find((c) => c.pages().some((p) => /studio\.youtube\.com|aistudio\.google\.com/.test(p.url() || ''))) || ctxs[0];
  const pg = ctx.pages().find((p) => (p.url() || '').includes('w=up')) || ctx.pages().find((p) => (p.url() || '').includes('studio.youtube.com')) || ctx.pages()[0];
  const done = alreadyDone();
  for (const n of range()) {
    const meta = META.parts.find((p) => p.part === n);
    if (!meta) { summary.push('SKIP ' + n + ' no meta'); continue; }
    if (done.find((d) => d.part === n && d.url)) { summary.push('OK ' + n + ' already uploaded ' + done.find((d) => d.part === n).url); continue; }
    try {
      const url = await uploadOne(pg, ctx, meta);
      markDone({ part: n, url: url || 'UNKNOWN-VERIFY', title: meta.title });
      summary.push('OK ' + n + ' ' + (url || 'UNKNOWN-VERIFY'));
    } catch (e) { summary.push('FAIL ' + n + ' ' + String(e.message || e).slice(0, 120)); }
  }
  finish(summary.some((s) => s.startsWith('FAIL')) ? 2 : 0);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
