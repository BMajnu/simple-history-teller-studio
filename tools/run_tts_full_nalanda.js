// FULL audio: bn 21-96 + en 1-96 + hi 1-96 = 268 blocks, 9 workers on PRO slots u/1,u/2,u/3.
// Male-only roster (05): TIME_CHRONICLER->Puck, else Charon. Voice-lock + mismatch guard.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_003_nalanda');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const voiceOf = (sp) => (sp === 'TIME_CHRONICLER' ? 'Puck' : 'Charon');

const PLAN = [];
for (const L of ['bn', 'en', 'hi']) for (let n = 1; n <= 96; n++) {
  const f = path.join(PROJ, 'audio', 'raw', `${L}_shot_${String(n).padStart(4, '0')}.wav`);
  if (!fs.existsSync(f) || fs.statSync(f).size < 100000) PLAN.push({ shot: n, lang: L });
}
const byV = { Puck: [], Charon: [] };
for (const j of PLAN) {
  const s = project.scenes.find(x => x.scene_id === j.shot);
  byV[voiceOf(s.dialogue_speaker)].push({ ...j, voice: voiceOf(s.dialogue_speaker), text: s.narration[j.lang] });
}
// 9 workers: [slot, voice, count] -> split queues round-robin
const SLOTS = [
  { slot: 0, voice: 'Puck' }, { slot: 7, voice: 'Puck' }, { slot: 8, voice: 'Puck' },
  { slot: 0, voice: 'Charon' }, { slot: 1, voice: 'Charon' }, { slot: 2, voice: 'Charon' },
  { slot: 3, voice: 'Charon' }, { slot: 7, voice: 'Charon' }, { slot: 8, voice: 'Charon' },
];
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';
const queues = SLOTS.map((w, i) => ({ ...w, id: i + 1, jobs: [] }));
// round-robin per voice across same-voice worker indexes
const vidx = {};
for (const q of queues) {
  const same = queues.filter(x => x.voice === q.voice);
  const pos = same.indexOf(q);
  q.jobs = byV[q.voice].filter((_, k) => k % same.length === pos);
  q.jobs.forEach(j => { j.slot = q.slot; });
}

async function call(code) {
  const r = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
  });
  return r.json();
}

async function worker(q) {
  const voice = q.voice, id = q.id, slot = q.slot;
  const setup = `
    const pg = await context.newPage();
    await pg.goto('https://aistudio.google.com/u/${slot}/generate-speech?model=${TTS_MODEL}', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(5000);
    await pg.evaluate(() => { window.__wid = ${id}; });
    await pg.keyboard.press('Escape');
    // first-run consent (new accounts): check boxes + Continue until dialogs gone
    for (let c = 0; c < 3; c++) {
      const nDlg = await pg.locator('[role=dialog], mat-dialog-container').count().catch(() => 0);
      if (nDlg === 0) break;
      const cbs = await pg.locator('[role=dialog] input[type=checkbox], mat-dialog-container input[type=checkbox]').all().catch(() => []);
      for (const cb of cbs) { try { await cb.check({ force: true, timeout: 3000 }); } catch (e) {} }
      await pg.waitForTimeout(800);
      const cont = pg.locator('[role=dialog] button, mat-dialog-container button').filter({ hasText: 'Continue' }).first();
      try { await cont.click({ timeout: 5000 }); } catch (e) {}
      await pg.waitForTimeout(3000);
    }
    const cards = await pg.$$('button, div, a');
    for (const c of cards) { const t = ((await c.innerText().catch(() => '')) || '').trim(); if (t.startsWith('Create new dialog')) { await c.click().catch(() => {}); break; } }
    await pg.waitForTimeout(4000);
    let locked = '';
    for (let a = 0; a < 2; a++) {
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
      await pg.locator('button').filter({ hasText: 'Speaker 1' }).first().click();
      await pg.waitForTimeout(1800);
      const box = pg.locator('.cdk-overlay-container input').first();
      await box.waitFor({ timeout: 8000 });
      await box.click(); await box.fill('${voice}');
      await pg.waitForTimeout(1800);
      const row = pg.locator('.cdk-overlay-container').getByText('${voice}', { exact: true }).first();
      if (await row.count() > 0) await row.click().catch(() => {});
      await pg.waitForTimeout(1200);
      locked = await pg.evaluate(() => {
        const c = document.querySelector('.cdk-overlay-container');
        const m = c ? c.innerText.match(/Current voice\\s*\\n?([A-Za-z]+)/) : null;
        return m ? m[1] : '';
      });
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(600);
      if (locked === '${voice}') break;
    }
    if (locked !== '${voice}') return { ok: false, err: 'VOICE_LOCK_FAIL:' + locked };
    return { ok: true, voice: locked };
  `;
  const s = await call(setup);
  console.log(`[W${id}:u${slot}:${voice}] ready=${s.result && (s.result.voice || s.result.err)} jobs=${q.jobs.length}`);
  if (!(s.result && s.result.ok)) return { id, ok: 0, fail: q.jobs.length };
  let ok = 0, fail = 0;
  for (const job of q.jobs) {
    const out = path.join(PROJ, 'audio', 'raw', `${job.lang}_shot_${String(job.shot).padStart(4, '0')}.wav`);
    if (fs.existsSync(out) && fs.statSync(out).size > 100000) continue;
    const code = `
      let pg = null;
      for (const p of context.pages()) {
        if (!p.url().includes('generate-speech') || p.isClosed()) continue;
        const wid = await p.evaluate(() => window.__wid).catch(() => null);
        if (wid === ${id}) { pg = p; break; }
      }
      if (!pg) return { ok: false, err: 'WORKER_TAB_LOST' };
      await pg.bringToFront();
      const v = ((await pg.locator('button').filter({ hasText: 'Speaker 1' }).first().innerText().catch(() => '')) || '').trim();
      if (!v.includes('${job.voice}')) return { ok: false, err: 'VOICE_MISMATCH:' + v };
      await pg.locator("textarea[aria-label='Speech block text']").first().fill(${JSON.stringify(job.text)});
      await pg.waitForTimeout(700);
      await pg.keyboard.press('Control+Enter');
      for (let i = 0; i < 50; i++) {
        await pg.waitForTimeout(2000);
        const qq = await pg.evaluate(() => {
          const t = document.body.innerText || '';
          if (/exceeded quota|Upgrade to unlock|try again later/i.test(t)) return { quota: true };
          const arr = Array.from(document.querySelectorAll('audio'));
          let best = null; arr.forEach(x => { if (x.duration > 1) best = x; });
          return best ? { dur: best.duration } : {};
        }).catch(() => ({}));
        if (qq.quota) return { ok: false, err: 'QUOTA' };
        if (qq.dur > 1) break;
      }
      const b = await pg.evaluate(async () => {
        const arr = Array.from(document.querySelectorAll('audio'));
        let best = null; arr.forEach(x => { if (x.duration > 1) best = x; });
        if (!best) return null;
        const r = await fetch(best.src); const ab = await r.arrayBuffer();
        const by = new Uint8Array(ab); let bin = '';
        for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
        return { b64: btoa(bin), size: by.length, dur: best.duration };
      });
      if (!b) return { ok: false, err: 'NO_AUDIO' };
      return { ok: true, size: b.size, dur: b.dur, b64: b.b64 };
    `;
    try {
      const r = await call(code);
      if (r.result && r.result.ok) { fs.writeFileSync(out, Buffer.from(r.result.b64, 'base64')); ok++; }
      else { fail++; console.log(`[W${id}] FAIL ${job.lang} ${job.shot}: ${(r.result && r.result.err) || r.error}`); if ((r.result && r.result.err) === 'QUOTA') break; }
    } catch (e) { fail++; console.log(`[W${id}] ERR: ${e.message.slice(0, 80)}`); break; }
    await new Promise(r => setTimeout(r, 1200));
  }
  console.log(`[W${id}] done ok=${ok} fail=${fail}`);
  return { id, ok, fail };
}
(async () => {
  const tot = queues.reduce((a, q) => a + q.jobs.length, 0);
  console.log(`FULL run: ${tot} blocks, 9 workers (u1/u2/u3)`);
  const res = await Promise.all(queues.map(worker));
  console.log('SUMMARY: ' + res.map(r => `W${r.id}:${r.ok}ok/${r.fail}f`).join(' '));
})();
