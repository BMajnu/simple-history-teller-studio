// 002 mismatch fix: regen 46 wrong-content shots (missing-only; wrong files moved to _wrong_backup).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const IDS = [2, 3, 4, 5, 7, 9, 10, 13, 14, 15, 16, 17, 19, 20, 21, 22, 24, 25, 26, 28, 29, 30, 31, 33, 34, 35, 36, 37, 39, 40, 41, 42, 44, 45, 46, 48, 49, 50, 51, 52, 53, 54, 56, 58, 66, 83];
const SLOT2 = process.env.IMG2_SLOT || '';
const MODEL2_URL = SLOT2
  ? 'https://aistudio.google.com/u/' + SLOT2 + '/prompts/new_chat?model=gemini-3.1-flash-image'
  : 'https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image';
const QUEUE = IDS.map(n => {
  const s = project.scenes.find(x => x.scene_id === n);
  return { shot: n, prompt: s.visual_prompt };
}).filter(j => {
  const f = path.join(PROJ, 'visual_assets', `shot_${String(j.shot).padStart(4, '0')}.jpg`);
  return !(fs.existsSync(f) && fs.statSync(f).size > 50000);
});
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
      const ctx = page.context();
      const pg = await ctx.newPage();
      try {
        await pg.goto(${JSON.stringify(MODEL2_URL)}, { waitUntil: "domcontentloaded" });
        await pg.waitForTimeout(4000);
        await pg.keyboard.press('Escape');
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
          const cur = await pg.evaluate(() => Array.from(document.querySelectorAll('img')).filter(e => e.naturalWidth >= 1000).map(e => e.src)).catch(() => []);
          if (cur.length > 0) { found = cur[cur.length - 1]; break; }
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
      if (r.result && r.result.ok) { fs.writeFileSync(out, Buffer.from(r.result.b64, 'base64')); ok++; console.log(`[F${id}] OK ${job.shot}`); }
      else { fail++; console.log(`[F${id}] FAIL ${job.shot}: ${(r.result && r.result.err) || r.error}`); if ((r.result && r.result.err) === 'QUOTA') break; }
    } catch (e) { fail++; console.log(`[F${id}] ERR: ${e.message.slice(0, 60)}`); break; }
    await new Promise(r => setTimeout(r, 1200));
  }
  return { ok, fail };
}
(async () => {
  const N = 4;
  const qs = Array.from({ length: N }, (_, i) => QUEUE.filter((_, k) => k % N === i));
  console.log(`FIX002: ${QUEUE.length} shots, 4 workers`);
  const res = await Promise.all(qs.map((q, i) => worker(i + 1, q)));
  console.log('SUMMARY: ' + res.map((r, i) => `F${i + 1}:${r.ok}/${r.fail}`).join(' '));
})();
