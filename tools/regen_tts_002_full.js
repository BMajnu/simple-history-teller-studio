// Phase 4: Full TTS regeneration for simple_itihash_002_first_language
// 84 shots x 3 langs = 252 audio blocks
// Voice roster (UPDATED — Cruz for TIME_CHRONICLER per instruction 4.4):
//   TIME_CHRONICLER → Cruz (Style: "An Old Story Teller, Old Man voice")
//   NARRATOR / SHEPHERD / SAN_HUNTER / PRESIDENT_PARIS / ARCHAEOLOGIST → Charon
//   HUNTER_CHIEF / PHARAOH_PSAMTIK / KING_JAMES / EMPEROR_AKBAR → Fenrir
// 9 parallel workers across /u/1/ through /u/6/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const RAW  = path.join(PROJ, 'audio', 'raw');
fs.mkdirSync(RAW, { recursive: true });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';

// Voice mapping — Cruz is now TIME_CHRONICLER (elderly male anchor)
const VOICE_MAP = {
  TIME_CHRONICLER: 'Cruz',
  NARRATOR:        'Charon',
  SHEPHERD:        'Charon',
  SAN_HUNTER:      'Charon',
  PRESIDENT_PARIS: 'Charon',
  ARCHAEOLOGIST:   'Charon',
  HUNTER_CHIEF:    'Fenrir',
  PHARAOH_PSAMTIK: 'Fenrir',
  KING_JAMES:      'Fenrir',
  EMPEROR_AKBAR:   'Fenrir',
};

// Cruz requires a style prompt (elderly storyteller)
const STYLE_PROMPTS = {
  Cruz:   'An Old Story Teller, Old Man voice',
  Charon: '',
  Fenrir: 'commanding, aggressive, deep booming voice',
};

// Build job queue for all languages
const byVoice = { Cruz: [], Charon: [], Fenrir: [] };
for (const lang of ['bn', 'en', 'hi']) {
  for (const s of project.scenes) {
    const outFile = path.join(RAW, `${lang}_shot_${String(s.scene_id).padStart(4, '0')}.wav`);
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 100000) continue;
    const voice = VOICE_MAP[s.dialogue_speaker] || 'Charon';
    byVoice[voice].push({ shot: s.scene_id, lang, voice, text: s.narration[lang], outFile });
  }
}

// Worker pool: 2 Cruz workers (slots 1,2) + 5 Charon workers (slots 3,4,5,6,1) + 2 Fenrir workers (slots 2,3)
const WORKERS = [
  { id: 1, slot: 1, voice: 'Cruz'   },
  { id: 2, slot: 2, voice: 'Cruz'   },
  { id: 3, slot: 3, voice: 'Charon' },
  { id: 4, slot: 4, voice: 'Charon' },
  { id: 5, slot: 5, voice: 'Charon' },
  { id: 6, slot: 6, voice: 'Charon' },
  { id: 7, slot: 1, voice: 'Charon' },
  { id: 8, slot: 2, voice: 'Fenrir' },
  { id: 9, slot: 3, voice: 'Fenrir' },
];

// Distribute jobs across workers of the same voice
for (const w of WORKERS) {
  const sameVoice = WORKERS.filter(x => x.voice === w.voice);
  const myIdx = sameVoice.indexOf(w);
  w.jobs = byVoice[w.voice].filter((_, k) => k % sameVoice.length === myIdx);
}

function post(body, ms = 120000) {
  const http = require('http');
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request(
      { host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw: raw.slice(0, 300) }); } });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('daemon timeout')));
    req.write(data); req.end();
  });
}

async function runWorker(w) {
  const { id, slot, voice, jobs } = w;
  const stylePrompt = STYLE_PROMPTS[voice] || '';

  // Initialize the tab and lock the voice
  const setup = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = await ctx.newPage();
  await pg.goto('https://aistudio.google.com/u/${slot}/generate-speech?model=${TTS_MODEL}', { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(5000);
  await pg.evaluate(() => { window.__wid = ${500 + id}; });
  await pg.keyboard.press('Escape');
  await pg.waitForTimeout(500);

  // Dismiss any onboarding dialogs
  for (let c = 0; c < 3; c++) {
    const dlg = await pg.locator('[role=dialog], mat-dialog-container').count().catch(() => 0);
    if (dlg === 0) break;
    const cbs = await pg.locator('[role=dialog] input[type=checkbox], mat-dialog-container input[type=checkbox]').all().catch(() => []);
    for (const cb of cbs) { try { await cb.check({ force: true, timeout: 2000 }); } catch(e) {} }
    await pg.waitForTimeout(600);
    try { await pg.locator('[role=dialog] button, mat-dialog-container button').filter({ hasText: 'Continue' }).first().click({ timeout: 4000 }); } catch(e) {}
    await pg.waitForTimeout(2000);
  }

  // Click "Create new dialog" if present
  for (const el of await pg.$$('button, div, a')) {
    const t = (await el.innerText().catch(() => '') || '').trim();
    if (t.includes('Create new dialog')) { await el.click().catch(() => {}); break; }
  }
  await pg.waitForTimeout(3000);

  // Lock in voice: ${voice}
  let locked = '';
  for (let a = 0; a < 3; a++) {
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(400);
    const spkBtn = pg.locator('button').filter({ hasText: 'Speaker 1' }).first();
    if (await spkBtn.count() === 0) break;
    await spkBtn.click();
    await pg.waitForTimeout(1500);
    const searchBox = pg.locator('.cdk-overlay-container input').first();
    await searchBox.waitFor({ timeout: 6000 }).catch(() => {});
    await searchBox.fill('${voice}');
    await pg.waitForTimeout(1500);
    const row = pg.locator('.cdk-overlay-container').getByText('${voice}', { exact: true }).first();
    if (await row.count() > 0) await row.click().catch(() => {});
    await pg.waitForTimeout(1000);
    locked = await pg.evaluate(() => {
      const c = document.querySelector('.cdk-overlay-container');
      const m = c ? c.innerText.match(/Current voice\\s*\\n?([A-Za-z]+)/) : null;
      return m ? m[1] : '';
    }).catch(() => '');
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(400);
    if (locked === '${voice}') break;
  }

  ${stylePrompt ? `
  // Apply style prompt for ${voice}: "${stylePrompt}"
  try {
    const styleBtn = pg.locator('button').filter({ hasText: 'Style' }).first();
    if (await styleBtn.count() > 0) {
      await styleBtn.click();
      await pg.waitForTimeout(800);
      const styleInput = pg.locator('input[placeholder*="style"], textarea[placeholder*="style"]').first();
      if (await styleInput.count() > 0) {
        await styleInput.fill('${stylePrompt}');
        await pg.waitForTimeout(400);
        await pg.keyboard.press('Enter');
        await pg.waitForTimeout(600);
      }
    }
  } catch(e) {}
  ` : ''}

  if (locked !== '${voice}') return { ok: false, err: 'VOICE_LOCK_FAIL:' + locked };
  return { ok: true, voice: locked, wid: ${500 + id} };
})();
`;

  const setupRes = await post({ code: setup }, 90000);
  const setupOk = setupRes.result && setupRes.result.ok;
  console.log(`[W${id}/u${slot}:${voice}] setup=${setupOk ? 'OK voice=' + setupRes.result.voice : 'FAIL ' + (setupRes.result?.err || '')} jobs=${jobs.length}`);

  if (!setupOk) return { id, ok: 0, fail: jobs.length };

  let ok = 0, fail = 0;

  for (const job of jobs) {
    const escapedText = JSON.stringify(job.text);
    const code = `
return (async () => {
  let pg = null;
  for (const p of browser.contexts()[0].pages()) {
    if (!p.url().includes('generate-speech') || p.isClosed()) continue;
    const wid = await p.evaluate(() => window.__wid).catch(() => null);
    if (wid === ${500 + id}) { pg = p; break; }
  }
  if (!pg) return { ok: false, err: 'TAB_LOST' };
  await pg.bringToFront();

  // Verify voice still locked
  const spkLabel = await pg.locator('button').filter({ hasText: 'Speaker 1' }).first().innerText().catch(() => '');
  if (!spkLabel.includes('${voice}')) return { ok: false, err: 'VOICE_DRIFT:' + spkLabel.trim() };

  // Fill text and generate
  const ta = pg.locator("textarea[aria-label='Speech block text']").first();
  await ta.fill(${escapedText});
  await pg.waitForTimeout(600);
  await pg.keyboard.press('Control+Enter');

  // Wait for audio element with duration > 1s (up to 100s)
  for (let i = 0; i < 50; i++) {
    await pg.waitForTimeout(2000);
    const state = await pg.evaluate(() => {
      const t = document.body.innerText || '';
      if (/exceeded quota|Upgrade to unlock|try again later/i.test(t)) return { quota: true };
      const aud = Array.from(document.querySelectorAll('audio')).find(a => a.duration > 1);
      return aud ? { done: true, dur: aud.duration } : {};
    }).catch(() => ({}));
    if (state.quota) return { ok: false, err: 'QUOTA' };
    if (state.done) break;
  }

  // Extract audio
  const b = await pg.evaluate(async () => {
    const aud = Array.from(document.querySelectorAll('audio')).find(a => a.duration > 1);
    if (!aud) return null;
    const r = await fetch(aud.src);
    const ab = await r.arrayBuffer();
    const by = new Uint8Array(ab);
    let bin = '';
    for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
    return { b64: btoa(bin), size: by.length, dur: aud.duration };
  }).catch(() => null);

  if (!b) return { ok: false, err: 'NO_AUDIO' };
  return { ok: true, b64: b.b64, size: b.size, dur: b.dur };
})();
`;

    try {
      const r = await post({ code }, 120000);
      if (r.result && r.result.ok) {
        fs.writeFileSync(job.outFile, Buffer.from(r.result.b64, 'base64'));
        ok++;
        if (ok % 10 === 0) console.log(`[W${id}] Progress: ${ok} done`);
      } else {
        fail++;
        const err = r.result?.err || r.raw || 'unknown';
        console.log(`[W${id}] FAIL ${job.lang}/${job.shot}: ${err}`);
        if (err === 'QUOTA') break;
      }
    } catch(e) {
      fail++;
      console.log(`[W${id}] ERR ${job.lang}/${job.shot}: ${e.message.slice(0, 60)}`);
      break;
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`[W${id}] done ok=${ok} fail=${fail}`);
  return { id, ok, fail };
}

(async () => {
  const totalJobs = WORKERS.reduce((a, w) => a + w.jobs.length, 0);
  console.log(`\n=== Phase 4: TTS Audio Generation ===`);
  console.log(`Total blocks: ${totalJobs} (${project.scenes.length} scenes × 3 langs)`);
  console.log(`Workers: ${WORKERS.length} | Cruz×2, Charon×5, Fenrir×2`);
  console.log(`Model: ${TTS_MODEL}\n`);

  if (totalJobs === 0) {
    console.log('All audio files already exist. Nothing to do.');
    process.exit(0);
  }

  const results = await Promise.all(WORKERS.map(runWorker));
  const totalOk = results.reduce((a, r) => a + r.ok, 0);
  const totalFail = results.reduce((a, r) => a + r.fail, 0);

  console.log(`\n=== Phase 4 COMPLETE ===`);
  console.log(`Generated: ${totalOk} | Failed: ${totalFail}`);

  // Count final WAV files
  const wavs = fs.readdirSync(RAW).filter(f => f.endsWith('.wav') && fs.statSync(path.join(RAW, f)).size > 100000);
  console.log(`Audio files now in raw/: ${wavs.length}/252`);

  if (totalFail > 0) {
    console.log(`\n⚠️  ${totalFail} audio files failed. Re-run to retry.`);
    process.exit(1);
  }
})();
