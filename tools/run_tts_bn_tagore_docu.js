// BN-only TTS fleet for bn_tagore_bangladesh_docu (95 scenes, gemini-3.8-flash-tts)
// Voices: TIME_CHRONICLER=Cruz+old-man style, NARRATOR=Charon.
// Usage: node tools/run_tts_bn_tagore_docu.js [--dry-run]
//   $env:NUM_WORKERS='10'; $env:ONLY_SCENE='1'; node tools/run_tts_bn_tagore_docu.js
// FIX 2026-10-14: AI Studio speech UI is now a gallery — worker must click
// "Create new dialog" then a single-speaker card before any textarea exists.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'bn_tagore_bangladesh_docu');
const RAW = path.join(PROJ, 'audio', 'raw');
fs.mkdirSync(RAW, { recursive: true });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts'; // fallback chain via env: gemini-2.5-flash-preview-tts -> gemini-2.5-pro-preview-tts
const VOICE_MAP = { TIME_CHRONICLER: 'Cruz', NARRATOR: 'Charon' };
const STYLE_PROMPTS = { Cruz: 'An Old Story Teller, Old Man voice', Charon: '' };
const ACCOUNT_SLOTS = [1, 2, 3, 4, 5, 6];
const NUM_WORKERS = Math.max(1, Math.min(10, Number(process.env.NUM_WORKERS) || 4));
const ONLY_SCENE = Number(process.env.ONLY_SCENE) || 0;

const queue = [];
for (const s of project.scenes) {
  if (ONLY_SCENE && s.scene_id !== ONLY_SCENE) continue;
  const outFile = path.join(RAW, `bn_shot_${String(s.scene_id).padStart(4, '0')}.wav`);
  if (!process.argv.includes('--force') && fs.existsSync(outFile) && fs.statSync(outFile).size > 50000) continue;
  const voice = VOICE_MAP[s.dialogue_speaker] || 'Charon';
  queue.push({ shot: s.scene_id, speaker: s.dialogue_speaker, voice, text: s.narration.bn, outFile });
}

const DRY = process.argv.includes('--dry-run');
console.log(`BN-TTS queue: ${queue.length} remaining (workers=${NUM_WORKERS}${ONLY_SCENE ? ` probe=${ONLY_SCENE}` : ''})`);
if (DRY || queue.length === 0) { console.log(DRY ? 'dry-run ok' : 'All BN audio already generated!'); process.exit(0); }

const dbg = (slot, name) => path.join(RAW, `_debug_tts_u${slot}_${name}.png`);

async function textareaVisible(page) {
  return page.locator("textarea[aria-label='Speech block text'], textarea").first().isVisible().catch(() => false);
}

// Gallery-aware session: composer textarea OR create-dialog flow. False = rotate slot.
async function ensureSpeechSession(page, slot) {
  await page.goto(`https://aistudio.google.com/u/${slot}/generate-speech?model=${TTS_MODEL}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  if (await textareaVisible(page)) return true;
  // Gallery: click "Create new dialog" card (exact text from UI 2026-10-14)
  const createCard = page.locator('text=Create new dialog').first();
  if (await createCard.count() > 0) {
    await createCard.click({ force: true }).catch(() => {});
    await page.waitForTimeout(4000);
  }
  if (await textareaVisible(page)) return true;
  // Dialog-type chooser: single-speaker storytelling card
  for (const label of ['The Master Storyteller', 'Storyteller', 'Single speaker', 'Narrator']) {
    const card = page.locator(`text=${label}`).first();
    if (await card.count() > 0) {
      await card.click({ force: true }).catch(() => {});
      await page.waitForTimeout(4000);
      break;
    }
  }
  if (await textareaVisible(page)) return true;
  await page.screenshot({ path: dbg(slot, 'entry_fail') }).catch(() => {});
  return false;
}

// Voice chip ONLY (Speaker 1 - Cruz/Charon). Overlay-scoped; verifies chip after select.
async function setVoice(page, voice) {
  const spkBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
  if (await spkBtn.count() === 0) return false;
  const cur = (await spkBtn.innerText().catch(() => '')).trim();
  if (cur.toLowerCase().includes(voice.toLowerCase())) return true;
  await spkBtn.click();
  await page.waitForTimeout(1200);
  const overlay = page.locator('.cdk-overlay-container');
  const searchBox = overlay.locator('input').first();
  if (await searchBox.count() > 0) {
    await searchBox.fill(voice);
    await page.waitForTimeout(800);
    const row = overlay.getByText(voice, { exact: true }).first();
    if (await row.count() > 0) await row.click().catch(() => {});
    await page.waitForTimeout(800);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const after = (await spkBtn.innerText().catch(() => '')).trim();
  return after.toLowerCase().includes(voice.toLowerCase());
}

// Style chip: preset dropdown ONLY (Narration). NEVER types narration text here —
// typing the speech text into the style search box was the 2026-10-14 failure.
async function setStylePreset(page, preset = 'Narration') {
  const chips = page.locator('button').filter({ hasText: 'Speaker' });
  const n = await chips.count().catch(() => 0);
  let styleChip = null;
  // style chip sits next to the Speaker chip; find any chip-like button that is not Speaker/Expression/Run
  const candidates = page.locator('button');
  const total = await candidates.count().catch(() => 0);
  for (let i = 0; i < Math.min(total, 30); i++) {
    const t = (await candidates.nth(i).innerText().catch(() => '')).trim();
    if (!t || /speaker|expression|run|generate|stop/i.test(t)) continue;
    if (t.length < 60) { styleChip = candidates.nth(i); break; }
  }
  if (!styleChip) return true; // no style chip found — proceed, voice is what matters
  await styleChip.click().catch(() => {});
  await page.waitForTimeout(1000);
  const opt = page.locator('.cdk-overlay-container').getByText(preset, { exact: false }).first();
  if (await opt.count() > 0) { await opt.click({ force: true }).catch(() => {}); await page.waitForTimeout(600); }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  return true;
}

const overlayOpen = (page) => page.locator('.cdk-overlay-container mat-option, .cdk-overlay-container [role="option"]').first().isVisible().catch(() => false);

async function synthesizeBlock(page, job, workerId, slot) {
  if (!await setVoice(page, job.voice)) { await page.screenshot({ path: dbg(slot, `shot${job.shot}_voicefail`) }).catch(() => {}); return { ok: false, err: 'VOICE_SELECT_FAIL' }; }
  await setStylePreset(page, 'Narration');
  if (await overlayOpen(page)) { await page.keyboard.press('Escape'); await page.waitForTimeout(600); }
  // STRICT composer selector: the aria-labelled speech textarea ONLY.
  // Never falls back to a bare `textarea` (that matched the style search box before).
  const ta = page.locator("textarea[aria-label='Speech block text']").first();
  await ta.waitFor({ state: 'visible', timeout: 15000 });
  const prevAudioSrcs = await page.evaluate(() => Array.from(document.querySelectorAll('audio')).map(a => a.src || a.currentSrc).filter(Boolean)).catch(() => []);
  await ta.fill(job.text);
  await page.waitForTimeout(500);
  // VERIFY the speech text landed in the composer (first 24 chars), not in some dropdown.
  const val = await ta.inputValue().catch(() => '');
  if (!val.includes(job.text.slice(0, 24))) { await page.screenshot({ path: dbg(slot, `shot${job.shot}_fillfail`) }).catch(() => {}); return { ok: false, err: 'FILL_VERIFY_FAIL' }; }
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run"), button:has-text("Generate")').first();
  if (await runBtn.count() > 0) await runBtn.click({ force: true }).catch(() => {});
  else await page.keyboard.press('Control+Enter');
  let audioData = null;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(2000);
    const quota = await page.evaluate(() => /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit/i.test(document.body.innerText || '')).catch(() => false);
    if (quota) return { ok: false, err: 'QUOTA' };
    const result = await page.evaluate(async (prevs) => {
      const auds = Array.from(document.querySelectorAll('audio')).filter(a => a.duration > 0.5 && !isNaN(a.duration));
      if (auds.length === 0) return null;
      const fresh = auds.filter(a => !prevs.includes(a.src || a.currentSrc));
      const target = fresh.length > 0 ? fresh[fresh.length - 1] : auds[auds.length - 1];
      if (!target) return null;
      try {
        const res = await fetch(target.src || target.currentSrc);
        const blob = await res.blob();
        const ab = await blob.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), dur: target.duration, size: bytes.length };
      } catch (e) { return { err: e.message }; }
    }, prevAudioSrcs).catch(() => null);
    if (result && result.b64) { audioData = result; break; }
  }
  if (!audioData) { await page.screenshot({ path: dbg(slot, `shot${job.shot}_noaudio`) }).catch(() => {}); return { ok: false, err: 'TIMEOUT_NO_AUDIO' }; }
  fs.writeFileSync(job.outFile, Buffer.from(audioData.b64, 'base64'));
  console.log(`[W${workerId}/u${slot}:${job.voice}] ✓ BN Shot ${job.shot} (${audioData.dur.toFixed(1)}s, ${(audioData.size / 1024).toFixed(0)}KB)`);
  return { ok: true };
}

async function runWorker(ctx, workerId, jobs) {
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length;
  let slot = ACCOUNT_SLOTS[slotIdx];
  let done = 0, fail = 0;
  console.log(`[W${workerId}] starting u${slot} with ${jobs.length} jobs...`);
  if (!await ensureSpeechSession(page, slot)) { console.log(`[W${workerId}] u${slot} entry failed, evidence saved`); }
  while (jobs.length > 0) {
    const job = jobs[0];
    let res;
    try { res = await synthesizeBlock(page, job, workerId, slot); }
    catch (e) { res = /closed|destroyed/i.test(e.message) ? { ok: false, err: 'PAGE_DEAD' } : { ok: false, err: e.message.slice(0, 60) }; }
    if (res.ok) { jobs.shift(); done++; }
    else if (res.err === 'QUOTA' || res.err === 'PAGE_DEAD') {
      slotIdx++; slot = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; // rotate, SAME job retried
      console.log(`[W${workerId}] rotating to u${slot} (same shot ${job.shot})`);
      try { await page.goto(`https://aistudio.google.com/u/${slot}/generate-speech?model=${TTS_MODEL}`, { waitUntil: 'domcontentloaded', timeout: 45000 }); await page.waitForTimeout(4000); } catch (e) {}
      if (!await ensureSpeechSession(page, slot)) { console.log(`[W${workerId}] u${slot} entry failed`); }
      if (slotIdx > ACCOUNT_SLOTS.length * 2) { console.log(`[W${workerId}] all slots exhausted, parking shot ${job.shot}`); jobs.shift(); fail++; }
    } else { console.log(`[W${workerId}] ✗ BN Shot ${job.shot}: ${res.err}`); jobs.shift(); fail++; }
    await page.waitForTimeout(1200);
  }
  await page.close().catch(() => {});
  return { workerId, done, fail };
}

(async () => {
  console.log(`=== BN-TTS FLEET: ${NUM_WORKERS} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: false, executablePath: CHROME_PATH, args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null });
  const buckets = Array.from({ length: NUM_WORKERS }, () => []);
  queue.forEach((j, i) => buckets[i % NUM_WORKERS].push(j));
  const results = await Promise.all(buckets.map((b, i) => runWorker(ctx, i + 1, b)));
  console.log(JSON.stringify(results, null, 2));
  const saved = fs.readdirSync(RAW).filter(f => f.match(/^bn_shot_\d+\.wav$/) && fs.statSync(path.join(RAW, f)).size > 50000).length;
  console.log(`Final: ${saved}/95 BN wav.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
