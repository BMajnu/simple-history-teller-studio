// STEP-4: 19 remaining DYNAMIC clips via AI Studio omni-1.1-flash, 3 workers (04-rule).
// ponytail: text-to-video (smoke-proven); reference-attach skipped, add when continuity gap seen.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_003_nalanda');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');
const MODEL = 'gemini-omni-1.1-flash';
const SLOT = process.env.VID_SLOT || '';
const MODEL_URL = SLOT
  ? 'https://aistudio.google.com/u/' + SLOT + '/prompts/new_chat?model=' + MODEL
  : 'https://aistudio.google.com/app/prompts/new_chat?model=' + MODEL;

function isReal(id) {
  const f = path.join(PROJ, 'visual_assets', `clip_shot_${String(id).padStart(4, '0')}.mp4`);
  if (!fs.existsSync(f) || fs.statSync(f).size < 500000) return false;
  try {
    const o = execSync(`"${FFPROBE}" -hide_banner -v error -show_entries stream=width,height -show_entries format=duration -of csv=p=0 "${f}"`).toString().trim().split(/\r?\n/);
    const dur = parseFloat(o[o.length - 1]);
    const wh = o.slice(0, -1).join(',');
    return dur > 5 && wh.includes('640');
  } catch { return false; }
}
const QUEUE = project.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO' && !isReal(s.scene_id))
  .map(s => ({ shot: s.scene_id, prompt: `Animate this 2D cartoon scene dynamically: ${s.narration.en}, 2D cartoon animation, 24fps motion, 16:9 widescreen` }));

async function call(code) {
  const r = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
  });
  return r.json();
}

async function worker(id, jobs) {
  let ok = 0, fail = 0;
  for (const job of jobs) {
    const out = path.join(PROJ, 'visual_assets', `clip_shot_${String(job.shot).padStart(4, '0')}.mp4`);
    const code = `
      const pg = await context.newPage();
      try {
        await pg.goto(${JSON.stringify(MODEL_URL)}, { waitUntil: 'domcontentloaded' });
        await pg.waitForTimeout(6000);
        await pg.keyboard.press('Escape');
        const ta = pg.locator('textarea').first();
        await ta.waitFor({ timeout: 20000 });
        await ta.fill(${JSON.stringify(job.prompt)});
        await pg.waitForTimeout(800);
        await pg.keyboard.press('Control+Enter');
        let found = null;
        for (let i = 0; i < 80; i++) {
          await pg.waitForTimeout(3000);
          const qt = await pg.evaluate(() => /exceeded quota|Upgrade to unlock|try again later/i.test(document.body.innerText || '')).catch(() => false);
          if (qt) return { ok: false, err: 'QUOTA' };
          const v = await pg.evaluate(() => {
            const arr = Array.from(document.querySelectorAll('video'));
            const good = arr.filter(x => {
              const s = x.currentSrc || x.src || '';
              if (/zero-state|gstatic/.test(s)) return false;
              return (x.duration || 0) > 1 || s.startsWith('blob:');
            });
            return good.map(x => x.currentSrc || x.src);
          }).catch(() => []);
          if (v.length > 0 && v[0]) { found = v[0]; break; }
        }
        if (!found) return { ok: false, err: 'TIMEOUT' };
        const b = await pg.evaluate(async (u) => {
          const r = await fetch(u); const ab = await r.arrayBuffer();
          const by = new Uint8Array(ab); let bin = '';
          for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
          return { b64: btoa(bin), size: by.length };
        }, found);
        return { ok: true, size: b.size, b64: b.b64 };
      } finally { await pg.close().catch(() => {}); }
    `;
    try {
      const r = await call(code);
      if (r.result && r.result.ok) {
        fs.writeFileSync(out, Buffer.from(r.result.b64, 'base64'));
        ok++; console.log(`[V${id}] OK clip ${job.shot} (${r.result.size}B)`);
      } else { fail++; console.log(`[V${id}] FAIL clip ${job.shot}: ${(r.result && r.result.err) || r.error}`); if ((r.result && r.result.err) === 'QUOTA') break; }
    } catch (e) { fail++; console.log(`[V${id}] ERR clip ${job.shot}: ${e.message.slice(0, 80)}`); }
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log(`[V${id}] done ok=${ok} fail=${fail}`);
  return { ok, fail };
}
(async () => {
  const N = 3;
  const qs = Array.from({ length: N }, (_, i) => QUEUE.filter((_, k) => k % N === i));
  console.log(`VID batch: ${QUEUE.length} clips, 3 workers`);
  const res = await Promise.all(qs.map((q, i) => worker(i + 1, q)));
  console.log('SUMMARY: ' + res.map((r, i) => `V${i + 1}:${r.ok}ok/${r.fail}f`).join(' '));
})();
