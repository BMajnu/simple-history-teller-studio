// FIRST CITY ep004 image fleet — modeled on tools/run_img_batch_nalanda.js
// (daemon-driven) with ep002 rule R1 model chain + R8 slot rotation.
// Generates STATIC_IMAGE shots only: visual_assets/shot_XXXX.jpg (1376x768).
//
// Run:   node tools/run_img_batch_firstcity.js
// Probe: $env:ONLY_SCENE='11'; node tools/run_img_batch_firstcity.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_004_first_city');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');

const MODEL_CHAIN = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];
const SLOT_START = parseInt(process.env.IMG_SLOT || '5', 10);
const SLOTS = (process.env.IMG_SLOTS
  ? process.env.IMG_SLOTS.split(',').map((n) => parseInt(n.trim(), 10))
  : [SLOT_START, SLOT_START + 1 <= 8 ? SLOT_START + 1 : 0]);
const IMG_PROFILE_DIR = process.env.IMG_PROFILE_DIR
  || path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile_3');

function isReal(id) {
  const f = path.join(PROJ, 'visual_assets', `shot_${String(id).padStart(4, '0')}.jpg`);
  if (!fs.existsSync(f) || fs.statSync(f).size < 50000) return false;
  try {
    const o = execSync(`"${FFPROBE}" -hide_banner -v error -show_entries stream=width,height -of csv=p=0 "${f}"`).toString().trim();
    return o === '1376,768';
  } catch { return false; }
}

const ONLY_SCENE = process.env.ONLY_SCENE ? parseInt(process.env.ONLY_SCENE, 10) : null;
const QUEUE = project.scenes
  .filter(s => s.type === 'STATIC_IMAGE' && (!ONLY_SCENE || s.scene_id === ONLY_SCENE) && !isReal(s.scene_id))
  .map(s => ({
    shot: s.scene_id,
    prompt: String(s.visual_prompt || '')
      .replace(/^(Simple\s+Itihash\s+)?(Scene|Shot|Part|Section)\s*\d+[:\-.]*\s*/i, '')
      .trim()
  }));

async function call(code) {
  const r = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
  });
  return r.json();
}

async function ensureChrome() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const r = await call('return 1');
      if (r.ok) return true;
    } catch (e) {}
    if (attempt === 0) {
      await fetch('http://127.0.0.1:9333/launch-chrome', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDataDir: IMG_PROFILE_DIR })
      }).catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return false;
}

async function generateOnce(job, model, slot) {
  const URL_ = 'https://aistudio.google.com/u/' + slot + '/prompts/new_chat?model=' + model;
  const code = `
    const pg = await browser.contexts()[0].newPage();
    try {
      await pg.goto(${JSON.stringify(URL_)}, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(4000);
      await pg.keyboard.press('Escape');
      const ar = pg.locator('mat-select[aria-label="Aspect ratio"]').first();
      if (await ar.count() > 0) {
        await ar.click().catch(() => {}); await pg.waitForTimeout(600);
        const o = pg.locator('mat-option').filter({ hasText: '16:9' }).first();
        if (await o.count() > 0) await o.click().catch(() => {});
        await pg.waitForTimeout(400);
      }
      const rs = pg.locator('mat-select[aria-label="Resolution"]').first();
      if (await rs.count() > 0) {
        await rs.click().catch(() => {}); await pg.waitForTimeout(600);
        const o = pg.locator('mat-option').filter({ hasText: '1K' }).first();
        if (await o.count() > 0) await o.click().catch(() => {});
        await pg.waitForTimeout(400);
      }
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
      const prev = await pg.evaluate(() => Array.from(document.querySelectorAll('img')).filter(e => e.naturalWidth >= 400).map(e => e.src));
      const ta = pg.locator('textarea').first();
      await ta.waitFor({ timeout: 15000 });
      await ta.fill(${JSON.stringify(job.prompt)});
      await pg.waitForTimeout(700);
      await pg.keyboard.press('Control+Enter');
      let found = null;
      for (let i = 0; i < 30; i++) {
        await pg.waitForTimeout(3000);
        const qt = await pg.evaluate(() => /exceeded quota|Upgrade to unlock|try again later/i.test(document.body.innerText || '')).catch(() => false);
        if (qt) return { ok: false, err: 'QUOTA' };
        const cur = await pg.evaluate(() => Array.from(document.querySelectorAll('img')).filter(e => e.naturalWidth >= 400).map(e => e.src)).catch(() => []);
        const fresh = cur.filter(s => !prev.includes(s));
        if (fresh.length > 0) { found = fresh[fresh.length - 1]; break; }
      }
      if (!found) return { ok: false, err: 'TIMEOUT' };
      const b = await pg.evaluate(async (u) => {
        const r = await fetch(u); const bl = await r.blob(); const ab = await bl.arrayBuffer();
        const by = new Uint8Array(ab); let bin = '';
        for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
        return { b64: btoa(bin), size: by.length, mime: bl.type };
      }, found);
      return { ok: true, size: b.size, mime: b.mime, b64: b.b64 };
    } finally { await pg.close().catch(() => {}); }
  `;
  const r = await call(code);
  return (r && r.result) ? r.result : { ok: false, err: (r && r.error) || 'DAEMON-ERR' };
}

async function worker(id, jobs) {
  let slotIdx = (SLOT_START + (id - 1)) % SLOTS.length;
  let ok = 0, fail = 0;
  for (const job of jobs) {
    const out = path.join(PROJ, 'visual_assets', `shot_${String(job.shot).padStart(4, '0')}.jpg`);
    let done = false;
    for (const model of MODEL_CHAIN) {
      if (done) break;
      for (let attempt = 0; attempt < 3 && !done; attempt++) {
        const slot = SLOTS[slotIdx];
        try {
          const r = await generateOnce(job, model, slot);
          if (r.ok) {
            fs.writeFileSync(out, Buffer.from(r.b64, 'base64'));
            ok++;
            console.log(`[I${id}] OK shot ${job.shot} slot u/${slot} ${model} (${r.size}B)`);
            done = true;
          } else {
            console.log(`[I${id}] FAIL shot ${job.shot} u/${slot} ${model}: ${r.err}`);
            if (r.err === 'QUOTA') slotIdx = (slotIdx + 1) % SLOTS.length; // rotate slot, retry same scene
            if (r.err === 'TIMEOUT') break; // try next model
          }
        } catch (e) {
          console.log(`[I${id}] ERR shot ${job.shot}: ${e.message.slice(0, 80)}`);
          slotIdx = (slotIdx + 1) % SLOTS.length;
        }
      }
    }
    if (!done) fail++;
    await new Promise(r => setTimeout(r, 1200));
  }
  console.log(`[I${id}] done ok=${ok} fail=${fail}`);
  return { ok, fail };
}

(async () => {
  const N = 5;
  if (!(await ensureChrome())) {
    console.error('Could not reach daemon Chrome on CDP 9224 after launch attempt.');
    process.exit(1);
  }
  const qs = Array.from({ length: N }, (_, i) => QUEUE.filter((_, k) => k % N === i));
  console.log(`IMG batch first_city: ${QUEUE.length} shots, ${N} workers, slots u/${SLOTS.join(' u/')}${ONLY_SCENE ? ` (ONLY_SCENE=${ONLY_SCENE})` : ''}`);
  const res = await Promise.all(qs.map((q, i) => worker(i + 1, q)));
  console.log('SUMMARY: ' + res.map((r, i) => `I${i + 1}:${r.ok}ok/${r.fail}f`).join(' '));
})();
