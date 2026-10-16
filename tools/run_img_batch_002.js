// 002 catch-up: 12 missing STATIC images, 3 parallel workers (flash-image).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const IDS = [59, 60, 61, 62, 64, 65, 67, 68, 69, 80, 81, 82];
const QUEUE = IDS.map(n => {
  const s = project.scenes.find(x => x.scene_id === n);
  return { shot: n, prompt: s.visual_prompt };
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
    if (fs.existsSync(out) && fs.statSync(out).size > 50000) continue;
    const code = `
      const pg = await context.newPage();
      try {
        await pg.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded' });
        await pg.waitForTimeout(4000);
        await pg.keyboard.press('Escape');
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
      if (r.result && r.result.ok) { fs.writeFileSync(out, Buffer.from(r.result.b64, 'base64')); ok++; console.log(`[J${id}] OK ${job.shot}`); }
      else { fail++; console.log(`[J${id}] FAIL ${job.shot}: ${(r.result && r.result.err) || r.error}`); if ((r.result && r.result.err) === 'QUOTA') break; }
    } catch (e) { fail++; console.log(`[J${id}] ERR: ${e.message.slice(0, 60)}`); }
    await new Promise(r => setTimeout(r, 1200));
  }
  return { ok, fail };
}
(async () => {
  const N = 3;
  const qs = Array.from({ length: N }, (_, i) => QUEUE.filter((_, k) => k % N === i));
  const res = await Promise.all(qs.map((q, i) => worker(i + 1, q)));
  console.log('SUMMARY: ' + res.map((r, i) => `J${i + 1}:${r.ok}/${r.fail}`).join(' '));
})();
