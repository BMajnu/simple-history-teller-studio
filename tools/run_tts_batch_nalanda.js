// Param batch runner: node run_tts_batch_nalanda.js <lang> <start> <end> <slot> <batchIdx>
const fs = require('fs');
const path = require('path');
const [LANG, START, END, SLOT, BIDX] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5], +process.argv[6]];
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_003_nalanda');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
async function call(code) {
  const r = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
  });
  return r.json();
}
async function worker(id, queue) {
  if (!queue.length) { console.log(`[W${id}] idle`); return 'idle'; }
  const voice = queue[0].voice, wid = BIDX * 10 + id;
  const setup = `
    for (const p of context.pages()) {
      const w = await p.evaluate(() => window.__wid).catch(() => null);
      if (w === ${wid} && !p.isClosed()) { try { await p.close(); } catch (e) {} }
    }
    const pg = await context.newPage();
    await pg.goto('https://aistudio.google.com/u/${SLOT}/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(5000);
    await pg.evaluate(() => { window.__wid = ${wid}; });
    await pg.keyboard.press('Escape');
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
  console.log(`[W${id}] tab ready voice=${s.result && (s.result.voice || s.result.err)}`);
  if (!(s.result && s.result.ok)) return 'lockfail';
  for (const job of queue) {
    const out = path.join(PROJ, 'audio', 'raw', `${LANG}_shot_${String(job.shot).padStart(4, '0')}.wav`);
    if (fs.existsSync(out) && fs.statSync(out).size > 100000) { console.log(`[W${id}] shot ${job.shot} exists, skip`); continue; }
    const code = `
      let pg = null;
      for (const p of context.pages()) {
        if (!p.url().includes('generate-speech') || p.isClosed()) continue;
        const w = await p.evaluate(() => window.__wid).catch(() => null);
        if (w === ${wid}) { pg = p; break; }
      }
      if (!pg) return { ok: false, err: 'WORKER_TAB_LOST' };
      await pg.bringToFront();
      const v = ((await pg.locator('button').filter({ hasText: 'Speaker 1' }).first().innerText().catch(() => '')) || '').trim();
      if (!v.includes('${job.voice}')) return { ok: false, err: 'VOICE_MISMATCH:' + v };
      await pg.locator("textarea[aria-label='Speech block text']").first().fill(${JSON.stringify(job.text)});
      await pg.waitForTimeout(700);
      await pg.keyboard.press('Control+Enter');
      for (let i = 0; i < 45; i++) {
        await pg.waitForTimeout(2000);
        const q = await pg.evaluate(() => {
          const t = document.body.innerText || '';
          if (/exceeded quota|Upgrade to unlock|try again later/i.test(t)) return { quota: true };
          const arr = Array.from(document.querySelectorAll('audio'));
          let best = null; arr.forEach(x => { if (x.duration > 1) best = x; });
          return best ? { dur: best.duration } : {};
        }).catch(() => ({}));
        if (q.quota) return { ok: false, err: 'QUOTA' };
        if (q.dur > 1) break;
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
      if (r.result && r.result.ok) {
        fs.writeFileSync(out, Buffer.from(r.result.b64, 'base64'));
        console.log(`[W${id}] OK ${LANG} shot ${job.shot} (${r.result.size}B)`);
      } else { console.log(`[W${id}] FAIL shot ${job.shot}: ${(r.result && r.result.err) || r.error}`); return 'quota'; }
    } catch (e) { console.log(`[W${id}] ERR: ${e.message.slice(0, 80)}`); return 'err'; }
    await new Promise(r => setTimeout(r, 1200));
  }
  return 'done';
}
(async () => {
  const jobs = [];
  for (let n = START; n <= END; n++) {
    const s = project.scenes.find(x => x.scene_id === n);
    jobs.push({ shot: n, voice: s.dialogue_speaker === 'TIME_CHRONICLER' ? 'Puck' : 'Charon', text: s.narration[LANG] });
  }
  const puck = jobs.filter(j => j.voice === 'Puck'), ch = jobs.filter(j => j.voice === 'Charon');
  const split = (a, n) => Array.from({ length: n }, (_, i) => a.filter((_, k) => k % n === i));
  const queues = [...split(puck, 2), ...split(ch, 4)];
  console.log(`${LANG} shots ${START}-${END} slot /u/${SLOT}/: Puck=${puck.length} Charon=${ch.length}`);
  const res = await Promise.all(queues.map((q, i) => worker(i + 1, q)));
  console.log('RESULT: ' + res.join(','));
})();
