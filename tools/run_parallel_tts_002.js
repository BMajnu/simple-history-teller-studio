// ============================================================================
// EP02 TTS Fleet - canonical 9-worker parallel speech generator (voice-bound)
// Project: projects/simple_itihash_002_first_language (84 scenes x 3 langs)
// Run:   node tools/run_parallel_tts_002.js
// Probe: $env:ONLY_SCENE='1'; $env:ONLY_LANG='bn'; node tools/run_parallel_tts_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (instructions/05_AUDIO_GENERATION_AI_STUDIO.md):
//  T1 Engine: gemini-3.8-flash-tts via /u/N/generate-speech (canonical shape,
//     same as image/video - never /app/ paths).
//  T2 Voice lock per page: Cruz=TIME_CHRONICLER (+style "An Old Story Teller,
//     Old Man voice"), Charon=narrator/others (+style "Narration"),
//     Fenrir=kings/chiefs (+style "commanding, aggressive, deep booming
//     voice"). Puck NEVER for the anchor. Verify lock before every job.
//  T3 Scene-by-scene units ONLY - never bulk-submit whole scripts.
//  T4 Skip-if-present: {lang}_shot_XXXX.wav > 100KB never regenerated.
//  T5 Pacing: 1.2s breathing delay between submissions (anti-abuse).
//  T6 Parallelism: 9 voice-bound workers x 8 slots (u/0-u/7, ALWAYS modulo -
//     never u/undefined). Shared per-voice queues, each worker owns its page.
//  T7 QUOTA rotation: next slot, SAME job retried; jobs never dropped.
//  T8 Failure evidence: _debug_tts_{lang}{shot}.png on timeout.
//  T9 Save exact audio blob stream as WAV per scene; duration > 1s required.
// T10 Single-agent execution; do NOT close the Chrome window mid-run.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const RAW = path.join(PROJ, 'audio', 'raw');
fs.mkdirSync(RAW, { recursive: true });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';

// T2: voice casting matrix (05 S2)
const VOICE_MAP = {
  TIME_CHRONICLER: 'Cruz',
  NARRATOR: 'Charon', SHEPHERD: 'Charon', SAN_HUNTER: 'Charon',
  PRESIDENT_PARIS: 'Charon', ARCHAEOLOGIST: 'Charon',
  HUNTER_CHIEF: 'Fenrir', PHARAOH_PSAMTIK: 'Fenrir',
  KING_JAMES: 'Fenrir', EMPEROR_AKBAR: 'Fenrir',
};
const STYLE_PROMPTS = {
  Cruz: 'An Old Story Teller, Old Man voice',
  Charon: 'Narration',
  Fenrir: 'commanding, aggressive, deep booming voice',
};

// T6: 2 Cruz + 5 Charon + 2 Fenrir across 8 slots
const ACCOUNT_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];
const WORKERS = [
  { id: 1, slot: 0, voice: 'Cruz' }, { id: 2, slot: 1, voice: 'Cruz' },
  { id: 3, slot: 2, voice: 'Charon' }, { id: 4, slot: 3, voice: 'Charon' },
  { id: 5, slot: 4, voice: 'Charon' }, { id: 6, slot: 5, voice: 'Charon' },
  { id: 7, slot: 6, voice: 'Charon' },
  { id: 8, slot: 7, voice: 'Fenrir' }, { id: 9, slot: 0, voice: 'Fenrir' },
];

const onlyScene = Number(process.env.ONLY_SCENE) || 0;
const onlyLang = (process.env.ONLY_LANG || '').toLowerCase();
const byVoice = { Cruz: [], Charon: [], Fenrir: [] };
for (const lang of ['bn', 'en', 'hi']) {
  if (onlyLang && lang !== onlyLang) continue;
  for (const s of project.scenes) {
    if (onlyScene && s.scene_id !== onlyScene) continue;
    const outFile = path.join(RAW, `${lang}_shot_${String(s.scene_id).padStart(4, '0')}.wav`);
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 100000) continue; // T4
    const voice = VOICE_MAP[s.dialogue_speaker] || 'Charon';
    byVoice[voice].push({ shot: s.scene_id, lang, voice, text: s.narration[lang], outFile });
  }
}
for (const w of WORKERS) {
  const same = WORKERS.filter(x => x.voice === w.voice);
  w.jobs = byVoice[w.voice].filter((_, k) => k % same.length === same.indexOf(w));
}

async function openDialog(page) { // gallery -> working dialog with >=1 block
  for (let i = 0; i < 3; i++) {
    const n = await page.locator("textarea[aria-label='Speech block text']").count().catch(() => 0);
    if (n >= 1) return true;
    try {
      const btns = await page.$$('button, div, a');
      for (const el of btns) {
        const t = ((await el.innerText().catch(() => '')) || '').trim();
        if (t === 'Create new dialog' || t.startsWith('Create new dialog\n')) { await el.click().catch(() => {}); break; }
      }
    } catch (e) {}
    await page.waitForTimeout(3000);
  }
  return false;
}

async function setupSession(page, slot, voice) { // goto + dismiss + dialog + lock
  await page.goto(`https://aistudio.google.com/u/${slot}/generate-speech?model=${TTS_MODEL}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await dismissOverlays(page);
  if (!await openDialog(page)) return false;
  await page.waitForTimeout(2000);
  return await lockVoice(page, voice, STYLE_PROMPTS[voice]);
}

async function dismissOverlays(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
  for (let c = 0; c < 3; c++) {
    const n = await page.locator('[role=dialog], mat-dialog-container').count().catch(() => 0);
    if (!n) break;
    const cbs = await page.locator('[role=dialog] input[type=checkbox], mat-dialog-container input[type=checkbox]').all().catch(() => []);
    for (const cb of cbs) { try { await cb.check({ force: true, timeout: 2000 }); } catch (e) {} }
    await page.waitForTimeout(500);
    try { await page.locator('[role=dialog] button, mat-dialog-container button').filter({ hasText: 'Continue' }).first().click({ timeout: 3000 }); } catch (e) {}
    await page.waitForTimeout(1500);
  }
}

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit|requires a paid API key|link an api key|set up billing/i.test(document.body.innerText || '')
  ).catch(() => false);
}

// PROBED 2026-10-15: generate-speech opens a TEMPLATE dialog (Cruz+Rami demo
// blocks). Ctrl+Enter renders ALL blocks (33s garbage). Must prune to exactly
// ONE block before every job, or audio mixes template lines with our narration.
async function ensureSingleBlock(page, voice) {
  for (let round = 0; round < 8; round++) {
    const blocks = page.locator("textarea[aria-label='Speech block text']");
    const n = await blocks.count().catch(() => 0);
    if (n <= 1) break;
    // delete the LAST block via its labeled X button
    const dels = page.locator('button[aria-label="Delete speech block"]');
    const dn = await dels.count().catch(() => 0);
    if (!dn) break;
    const lastBox = await dels.nth(dn - 1).boundingBox({ timeout: 5000 }).catch(() => null);
    if (!lastBox) break;
    await page.mouse.click(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height / 2);
    await page.waitForTimeout(1500);
  }
  const n = await page.locator("textarea[aria-label='Speech block text']").count().catch(() => 0);
  if (n !== 1) return false;
  // the surviving block must speak with OUR voice
  const spkLabel = await page.locator('button').filter({ hasText: 'Speaker 1' }).first().innerText().catch(() => '');
  return spkLabel.includes(voice);
}

async function lockVoice(page, voice, stylePrompt) {
  for (let a = 0; a < 3; a++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
    const spkBtn = page.locator('button').filter({ hasText: 'Speaker 1' }).first();
    if (await spkBtn.count() === 0) break;
    await spkBtn.click().catch(() => {});
    await page.waitForTimeout(1200);
    const searchBox = page.locator('.cdk-overlay-container input').first();
    await searchBox.waitFor({ timeout: 6000 }).catch(() => {});
    await searchBox.fill(voice).catch(() => {});
    await page.waitForTimeout(1200);
    const row = page.locator('.cdk-overlay-container').getByText(voice, { exact: true }).first();
    if (await row.count() > 0) await row.click().catch(() => {});
    await page.waitForTimeout(800);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
    const locked = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('button'));
      const b = els.find(e => /Speaker 1/i.test(e.innerText || ''));
      return b ? b.innerText : '';
    }).catch(() => '');
    if (locked.includes(voice)) break;
  }
  if (stylePrompt) { // T2: style chip (shows current style text) next to Speaker
    try {
      const styleBtn = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const hit = btns.find(b => {
          const t = (b.innerText || '').trim();
          return t.length > 12 && !/Speaker|Expression|Delete|Preview/i.test(t);
        });
        return hit ? true : false;
      }).catch(() => false);
      if (styleBtn) {
        const btns = await page.$$('button');
        for (const b of btns) {
          const t = ((await b.innerText().catch(() => '')) || '').trim();
          if (t.length > 12 && !/Speaker|Expression|Delete|Preview/i.test(t)) {
            const box = await b.boundingBox({ timeout: 5000 }).catch(() => null);
            if (box) { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); break; }
          }
        }
        await page.waitForTimeout(1000);
        const styleInput = page.locator('input[placeholder*="style" i], textarea[placeholder*="style" i], input[type="text"]').first();
        if (await styleInput.count() > 0) {
          await styleInput.fill(stylePrompt).catch(() => {});
          await page.waitForTimeout(400);
          await page.keyboard.press('Enter').catch(() => {});
          await page.waitForTimeout(600);
        }
        await page.keyboard.press('Escape').catch(() => {});
      }
    } catch (e) {}
  }
  const final = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('button'));
    const b = els.find(e => /Speaker 1/i.test(e.innerText || ''));
    return b ? b.innerText : '';
  }).catch(() => '');
  return final.includes(voice);
}

async function runWorker(ctx, w) {
  let page = await ctx.newPage();
  const reopen = async () => {
    try { await page.close(); } catch (e) {}
    page = await ctx.newPage();
    return page;
  };
  let slotIdx = WORKERS.indexOf(w); // spread start slots
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  let done = 0, fail = 0, skipped = 0;
  try {
    // initial session: first job's slot (goto + dismiss + dialog + lock)
    let slot = getSlot();
    if (!await setupSession(page, slot, w.voice)) {
      console.log(`[W${w.id}] VOICE_LOCK_FAIL, rotating slot...`);
      slot = getSlot();
      if (!await setupSession(page, slot, w.voice)) return { id: w.id, done, fail: w.jobs.length, err: 'VOICE_LOCK_FAIL' };
    }
    console.log(`[W${w.id}/u${slot}:${w.voice}] locked, jobs=${w.jobs.length}`);
    let quotaStreak = 0;
    for (let ji = 0; ji < w.jobs.length; ji++) {
      const job = w.jobs[ji];
      if (fs.existsSync(job.outFile) && fs.statSync(job.outFile).size > 100000) { skipped++; quotaStreak = 0; continue; }
      try {
        // prune template blocks EVERY job (dialog regrows demo blocks) + voice check
        if (!await ensureSingleBlock(page, w.voice)) {
          fail++;
          console.log(`[W${w.id}] ✗ ${job.lang}/${job.shot}: BLOCK_PRUNE_FAIL`);
          continue;
        }
        const ta = page.locator("textarea[aria-label='Speech block text']").first();
        await ta.waitFor({ state: 'visible', timeout: 20000 });
        await ta.fill(job.text);
        await page.waitForTimeout(600);
        await page.keyboard.press('Control+Enter');
        let audio = null;
        for (let i = 0; i < 50; i++) { // up to ~100s
          await page.waitForTimeout(2000);
          const state = await page.evaluate(() => {
            const t = document.body.innerText || '';
            if (/exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit|requires a paid API key|link an api key|set up billing/i.test(t)) return { quota: true };
            const aud = Array.from(document.querySelectorAll('audio')).find(a => a.duration > 1);
            return aud ? { done: true, dur: aud.duration } : {};
          }).catch(() => ({}));
          if (state.quota) { audio = { quota: true }; break; }
          if (state.done) {
            audio = await page.evaluate(async () => {
              const aud = Array.from(document.querySelectorAll('audio')).find(a => a.duration > 1);
              if (!aud) return null;
              const r = await fetch(aud.src);
              const ab = await r.arrayBuffer();
              const by = new Uint8Array(ab);
              let bin = '';
              for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
              return { b64: btoa(bin), size: by.length, dur: aud.duration };
            }).catch(() => null);
            break;
          }
        }
        if (!audio) {
          await page.screenshot({ path: path.join(RAW, `_debug_tts_${job.lang}${job.shot}.png`) }).catch(() => {}); // T8
          fail++;
          console.log(`[W${w.id}] ✗ ${job.lang}/${job.shot}: TIMEOUT_NO_AUDIO`);
          continue;
        }
        if (audio.quota) { // T7: rotate slot, retry SAME job (never drop)
          quotaStreak++;
          if (quotaStreak > ACCOUNT_SLOTS.length) { // all slots dry - fail, resume later
            fail++;
            console.log(`[W${w.id}] ✗ ${job.lang}/${job.shot}: ALL_SLOTS_QUOTA`);
            quotaStreak = 0;
            continue;
          }
          slot = getSlot();
          console.log(`[W${w.id}] quota -> u${slot}, retry ${job.lang}/${job.shot}`);
          await setupSession(page, slot, w.voice);
          ji--; // retry same job
          continue;
        }
        quotaStreak = 0;
        fs.writeFileSync(job.outFile, Buffer.from(audio.b64, 'base64'));
        done++;
        if (done % 10 === 0) console.log(`[W${w.id}] progress: ${done}`);
        await new Promise(r => setTimeout(r, 1200)); // T5 pacing
      } catch (err) {
        if (/Target page|browser has been closed|Target closed/i.test(err.message) && (w._reopens = (w._reopens || 0) + 1) <= 3) {
          console.log(`[W${w.id}] page died - reopening (${w._reopens}/3), resume ${job.lang}/${job.shot}`);
          page = await reopen();
          await setupSession(page, slot, w.voice).catch(() => false);
          ji--; // retry same job on fresh page
          continue;
        }
        fail++;
        console.log(`[W${w.id}] ERR ${job.lang}/${job.shot}: ${err.message.slice(0, 60)}`);
      }
    }
  } finally {
    await page.close().catch(() => {});
  }
  return { id: w.id, done, fail, skipped };
}

(async () => {
  const totalJobs = WORKERS.reduce((a, w) => a + w.jobs.length, 0);
  console.log(`=== EP02 TTS FLEET: ${WORKERS.length} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  console.log(`Remaining: ${totalJobs}/252 blocks (Cruz/Charon/Fenrir)`);
  if (totalJobs === 0) { console.log('All audio present. Nothing to do.'); process.exit(0); }
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null,
  });
  const results = await Promise.all(WORKERS.filter(w => w.jobs.length > 0).map(w => runWorker(ctx, w)));
  console.log(JSON.stringify(results, null, 2));
  const totalPresent = fs.readdirSync(RAW).filter(f => f.match(/^(bn|en|hi)_shot_\d+\.wav$/) && fs.statSync(path.join(RAW, f)).size > 100000).length;
  console.log(`Final: ${totalPresent}/252 blocks.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one TTS fleet file; voice-bound pages over slot rotation
