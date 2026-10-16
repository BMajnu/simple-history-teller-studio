// STEP-3: 71 STATIC shots via AI Studio gemini-3.1-flash-image, 5 workers (03-rule).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_003_nalanda');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');

function isReal(id) {
  const f = path.join(PROJ, 'visual_assets', `shot_${String(id).padStart(4, '0')}.jpg`);
  if (!fs.existsSync(f) || fs.statSync(f).size < 50000) return false;
  try {
    const o = execSync(`"${FFPROBE}" -hide_banner -v error -show_entries stream=width,height -of csv=p=0 "${f}"`).toString().trim();
    return o === '1376,768';
  } catch { return false; }
}
const QUEUE = project.scenes.filter(s => s.type === 'STATIC_IMAGE' && !isReal(s.scene_id))
  .map(s => ({ shot: s.scene_id, prompt: s.visual_prompt.replace(/^(Shot|Scene)\s*\d+[:\-.]*\s*/i, '').trim() }));
const SLOT = process.env.IMG_SLOT || '5';
const MODEL_URL = 'https://aistudio.google.com/u/' + SLOT + '/prompts/new_chat?model=gemini-3.1-flash-image';

async function call(code) {
  const r = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
  });
  return r.json();
}

async function worker(id, jobs) {
  let ok = 0, fail = 0;
  for (const job of jobs) {
    const out = path.join(PROJ, 'visual_assets', `shot_${String(job.shot).padStart(4, '0')}.jpg`);
    const code = `
      const pg = await context.newPage();
      try {
        await pg.goto(${JSON.stringify(MODEL_URL)}, { waitUntil: 'domcontentloaded' });
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
    try {
      const r = await call(code);
      if (r.result && r.result.ok) {
        fs.writeFileSync(out, Buffer.from(r.result.b64, 'base64'));
        ok++; console.log(`[I${id}] OK shot ${job.shot} (${r.result.size}B ${r.result.mime})`);
      } else { fail++; console.log(`[I${id}] FAIL shot ${job.shot}: ${(r.result && r.result.err) || r.error}`); if ((r.result && r.result.err) === 'QUOTA') break; }
    } catch (e) { fail++; console.log(`[I${id}] ERR shot ${job.shot}: ${e.message.slice(0, 80)}`); }
    await new Promise(r => setTimeout(r, 1200));
  }
  console.log(`[I${id}] done ok=${ok} fail=${fail}`);
  return { ok, fail };
}
(async () => {
  const N = 5;
  const qs = Array.from({ length: N }, (_, i) => QUEUE.filter((_, k) => k % N === i));
  console.log(`IMG batch: ${QUEUE.length} shots, 5 workers`);
  const res = await Promise.all(qs.map((q, i) => worker(i + 1, q)));
  console.log('SUMMARY: ' + res.map((r, i) => `I${i + 1}:${r.ok}ok/${r.fail}f`).join(' '));
})();
