// Batch-A: bn shots 2-20, 6 parallel TTS tabs (Puck/Chron male-only, 05-roster).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_003_nalanda');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));

const SHOTS = Array.from({ length: 19 }, (_, i) => i + 2); // 2..20
const LANG = 'bn';
const voiceOf = (sp) => (sp === 'TIME_CHRONICLER' ? 'Puck' : 'Charon'); // male-only

async function oneBlock(pgCode) {
  const r = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: pgCode })
  });
  return r.json();
}

async function worker(id, queue) {
  // each worker owns one tab + one dialog + one voice
  const voice = queue[0].voice;
  const setup = `
    const pg = await context.newPage();
    await pg.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(5000);
    await pg.evaluate(() => { window.__wid = ${id}; });
    await pg.keyboard.press('Escape');
    const cards = await pg.$$('button, div, a');
    for (const c of cards) { const t = ((await c.innerText().catch(() => '')) || '').trim(); if (t.startsWith('Create new dialog')) { await c.click().catch(() => {}); break; } }
    await pg.waitForTimeout(4000);
    // 05 voice lock: search exact voice name, click, verify Current voice (retry once)
    let locked = '';
    for (let attempt = 0; attempt < 2; attempt++) {
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
  const s = await oneBlock(setup);
  console.log(`[W${id}] tab ready voice=${s.result && s.result.voice}`);
  for (const job of queue) {
    const out = path.join(PROJ, 'audio', 'raw', `${LANG}_shot_${String(job.shot).padStart(4, '0')}.wav`);
    if (fs.existsSync(out) && fs.statSync(out).size > 50000) { console.log(`[W${id}] shot ${job.shot} exists, skip`); continue; }
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
      const ta = pg.locator("textarea[aria-label='Speech block text']").first();
      await ta.fill(${JSON.stringify(job.text)});
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
      const r = await oneBlock(code);
      if (r.result && r.result.ok) {
        fs.writeFileSync(out, Buffer.from(r.result.b64, 'base64'));
        console.log(`[W${id}] OK shot ${job.shot} (${r.result.size}B ${Number(r.result.dur).toFixed(1)}s)`);
      } else {
        console.log(`[W${id}] FAIL shot ${job.shot}: ${(r.result && r.result.err) || r.error}`);
        if ((r.result && r.result.err) === 'QUOTA') break;
      }
    } catch (e) { console.log(`[W${id}] ERR shot ${job.shot}: ${e.message.slice(0, 100)}`); }
    await new Promise(r => setTimeout(r, 1200)); // 05 pacing buffer
  }
}

(async () => {
  const jobs = SHOTS.map(n => {
    const s = project.scenes.find(x => x.scene_id === n);
    return { shot: n, voice: voiceOf(s.dialogue_speaker), text: s.narration[LANG] };
  });
  // group: Puck shots -> 2 workers, Charon shots -> 4 workers
  const puck = jobs.filter(j => j.voice === 'Puck'), char = jobs.filter(j => j.voice === 'Charon');
  const split = (a, n) => Array.from({ length: n }, (_, i) => a.filter((_, k) => k % n === i));
  const queues = [...split(puck, 2), ...split(char, 4)];
  console.log(`Batch-A bn shots 2-20: Puck=${puck.length} Charon=${char.length}, 6 workers`);
  await Promise.all(queues.map((q, i) => worker(i + 1, q)));
  console.log('Batch-A done');
})();