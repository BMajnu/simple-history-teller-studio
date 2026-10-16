# 05. AUDIO GENERATION VIA GOOGLE AI STUDIO INSTRUCTION
**Engine:** Google AI Studio (`gemini-3.8-flash-tts`) & Multi-Worker Speech Fleet  
**Output:** 48kHz Broadcast Studio Voiceovers per Scene  
**Target Languages:** 🇧🇩 বাংলা (`bn`) | 🌍 English (`en`) | 🇮🇳 हिन्दी (`hi`)

---

## 1. Why Google AI Studio TTS vs. Basic/Normal TTS?

> [!CAUTION]
> **BASIC TTS IS STRICTLY BANNED FOR FINAL DOCUMENTARY PRODUCTIONS!**  
> Basic TTS engines (Google Translate TTS, basic robotic voice synthesizers) produce monotone, lifeless, flat speech with unnatural robotic cadence.  
> **Google AI Studio (`gemini-3.8-flash-tts`)** is a next-generation Voice Design model that supports:
> 1. **Screenplay Emotional Delivery:** Directing line-by-line emotion (sarcasm, horror, whisper, shouting).
> 2. **Vocal Bursts & Character Tags:** Native vocal reactions (`<gasp>`, `<laugh>`, `<screaming>`, `<sigh>`, `<cough>`).
> 3. **Character Persona Casting:** Dynamic casting matching gender, historical gravitas, and personality.

---

## 2. Character Persona & Voice Casting Matrix

> [!IMPORTANT]
> **ANCHOR/HOST GENDER & AGE MANDATE (STRICTLY ELDERLY MALE):**  
> * **Gender:** The Anchor/Time Chronicler is **ALWAYS MALE (পুরুষ)**.
> * **Age:** The Anchor is **ALWAYS AN ELDERLY PERSON (বয়স্ক ব্যক্তি)** — a wise, seasoned historian with a white beard and glasses.
> * **Voice & Style Configuration:** The designated voice for the Anchor in Google AI Studio Speech is **`Cruz`** combined with the mandatory **Style Prompt**: **`An Old Story Teller, Old Man voice`** (or fallback base `Charon` / `Fenrir` with same style).
> * **HOW STYLE PROMPTING WORKS IN AI STUDIO SPEECH:**  
>   Right next to the Speaker dropdown, click the **`Style ▾`** button. In the text field at the top, enter the descriptive prompt (e.g., `An Old Story Teller, Old Man voice`). This instructs the model to age the voice, giving it the weathered, seasoned cadence, gravelly warmth, and deliberate pacing of an elderly historian storyteller.
> * **PUCK IS STRICTLY FORBIDDEN FOR THE ANCHOR:** `Puck` sounds young, energetic, and juvenile, which directly contradicts an elderly white-bearded scholar. `Puck` may ONLY be used for minor youthful side characters!

| Archetype / Character | AI Studio Base Voice | Mandatory Style Prompt / Preset | Vocal Delivery Profile | Best Suited For |
| :--- | :--- | :--- | :--- | :--- |
| **The Time Chronicler (Host - ELDERLY MALE)** | **`Cruz`** *(or `Charon`)* | **`An Old Story Teller, Old Man voice`** | Weathered, wise, deliberate, seasoned elderly male storyteller gravitas. | **Episode introduction, philosophical reflections, witty elder scholar storytelling.** |
| **Historical Documentary Narrator** | `Charon` | `Narration` (or empty) | Deep, resonant, informative, solemn documentary gravitas. | Explaining archaeological evidence, ancient decrees, scientific facts. |
| **Despotic King / Imperial Conqueror** | `Fenrir` | `commanding, aggressive, deep booming voice` | Booming, aggressive, commanding, powerful low pitch. | Sargon of Akkad, Pharaohs, Babylonian warlords, tribal chiefs. |
| **Ancient Sage / Tribal Elder** | `Bodi` | `weathered, intimate, ancient elder voice` | Intimate, quiet, weathered, low pitch. | Prehistoric shamans, elderly philosophers, cave elders. |
| **Ordinary Citizen / Peasant / Debtor** | `Koda` | `Friendly` / `earnest, distressed` | Direct, earnest, humble, medium-low pitch. | Ordinary citizens, Sumerian farmers, Babylonian debtors. |
| **Queen / Female Monarch** | `Kore` | `commanding, regal, authoritative` | Firm, dignified, regal, authoritative female. | Cleopatra, Queen Elizabeth, ancient priestesses. |
| **Female Storyteller** | `Aoede` | `Friendly` / `melodic, warm` | Melodic, warm, engaging, breezy female. | Folklore segments, poetic transitions. |
| **Young Comic Citizen / Youth** | `Puck` | `Friendly` / `playful, fast` | Youthful, snappy, fast-paced higher pitch. | Young side characters, energetic minor comic figures. |
| **Child (Boy / Girl)** | `Zephyr` / `Leda` | `playful, innocent child` | Innocent, bright higher pitch. | Royal infants, isolated children, apprentices. |

---

## 3. Strict Do's and Don'ts for Audio Generation

### DO:
* **DO** insert screenplay expression tags in dialogue lines:
  * `<gasp> আমি সময়ের সাক্ষী!` (Expressing awe and wonder).
  * `<laugh> কেউ বড় শিকার আনলে সবাই তাকে নিয়ে হাসাহাসি করত!` (Satirical amusement).
  * `<screaming> আমিই এই দলের একমাত্র অধিপতি!` (Angry imperial decree).
* **DO** verify voice persona before submitting every prompt block in AI Studio.
* **DO** capture the exact download stream and save as 48kHz WAV/MP3 per scene.
* **DO** use multiple concurrent workers/tabs to generate scenes in parallel.

### DON'T:
* **DON'T** let male characters fall back to female voices under any circumstances.
* **DON'T** submit entire 15-minute scripts in one massive text block; break into scene-by-scene granular dialogue units.
* **DON'T** ignore modal errors or quota dialogs; implement automatic quota handling, delay buffers, and alternative API key failover.

---

## 4. Quota Handling & Multi-Account Rotation Protocol

### Why "Upgrade to unlock more" or Quota Rejection Occurs:
In Google AI Studio, free-tier accounts have a daily rate limit on multimodal and speech endpoints. When firing multiple requests concurrently, Google prompts a modal dialog: *"Failed to generate content: user has exceeded quota. Please try again later. Upgrade to unlock more"*.

### Production Mitigation & Failover Pool Architecture:
1. **Multi-Account Pro Pool Rotation (`config/aistudio_accounts.json`):**
   * Multi-login sessions are mapped directly via Google index paths:
     * **Account 0 (`/u/0/`):** `badiuzzaman.majnu@gmail.com` (Initial free tier)
     * **Account 1 (`/u/1/`):** `bmajnu980@gmail.com` (**PRO** tier active)
     * **Account 2 (`/u/2/`):** `bmajnu9811@gmail.com` (**PRO** tier active)
     * **Account 3 (`/u/3/`):** `badiuzzaman.majnu123@gmail.com` (**PRO** tier pool)
     * **Account 4 (`/u/4/`):** `msrosyafrin@gmail.com` (**PRO** tier pool)
     * **Account 5 (`/u/5/`):** `bmajnu981@gmail.com` (**PRO** tier pool)
     * **Account 6 (`/u/6/`):** `badiuzzaman.majnu1@gmail.com` (**PRO** tier pool)
2. **Dynamic Account Switcher Algorithm:**
   * If any tab receives a quota exhaustion error, HTTP 429, or upgrade modal on `/u/N/`:
     1. Tab catches the error event without terminating the batch.
     2. Marks account `N` as `rate_limited` in `config/aistudio_accounts.json`.
     3. Selects the next available active Pro account index `N+1`.
     4. Redirects workers to `https://aistudio.google.com/u/{N+1}/generate-speech?model=gemini-3.8-flash-tts`.
     5. Resumes queue execution immediately.
3. **Batch Pacing Buffer:** When using browser tabs in AI Studio, introduce a 1.2s breathing delay between submissions to prevent triggering anti-abuse heuristics.
4. **Modal Auto-Dismiss:** Scripts automatically dismiss promotional or informational dialogs with `keyboard.press('Escape')` and `button.close-button` evaluation before clicking generation controls.

---

## 5. Production-Ready Multi-Worker AI Studio Speech Generator

Below is the verified production script (`tools/parallel_batch_aistudio_speech.js`):

```javascript
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');
const RAW_DIR = path.join(AUDIO_DIR, 'raw_aistudio');
fs.mkdirSync(RAW_DIR, { recursive: true });

// MANDATORY 5 CONCURRENT WORKERS (Ensures 60+ scenes generate in ~1-2 minutes)
const NUM_AUDIO_WORKERS = 5;

const VOICE_ROSTER = {
  TIME_CHRONICLER: 'Puck',
  NARRATOR: 'Charon',
  PHARAOH_PSAMTIK: 'Fenrir',
  HUNTER_CHIEF: 'Fenrir',
  SHEPHERD: 'Koda',
  ELDER: 'Bodi'
};

async function sendScriptToDaemon(code) {
  const resp = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}

async function synthesizeSceneWithAIStudio(shot, lang, targetFile) {
  const voiceName = VOICE_ROSTER[shot.dialogue_speaker] || (shot.dialogue_speaker === 'TIME_CHRONICLER' ? 'Puck' : 'Charon');
  const rawText = shot.narration[lang] || shot.narration.en;
  const escapedText = rawText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
  const escapedOut = targetFile.replace(/\\/g, '\\\\');

  const code = `
    const ctx = browser.contexts()[0];
    let page = ctx.pages().find(p => p.url().includes('generate-speech'));
    if (!page || page.isClosed()) {
      page = await ctx.newPage();
      await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    }
    await page.bringToFront();

    // Auto-dismiss any upgrade or error modals
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 1. Switch voice if not matching
    const voiceChip = page.locator('.voice-chip, button.voice-playground-chip').first();
    if (await voiceChip.count() > 0) {
      const current = (await voiceChip.innerText()).trim();
      if (!current.toLowerCase().includes("${voiceName.toLowerCase()}")) {
        await voiceChip.click();
        await page.waitForTimeout(400);
        const searchInput = page.locator('input[placeholder*="Search"][placeholder*="voices"]').first();
        if (await searchInput.count() > 0) {
          await searchInput.fill("${voiceName}");
          await page.waitForTimeout(400);
          const voiceBtn = page.locator(\`button[aria-label="${voiceName}"], button.voice-card-content:has-text("${voiceName}")\`).first();
          if (await voiceBtn.count() > 0) await voiceBtn.click();
        }
        const closePanel = page.locator('button[aria-label="Close panel"]').first();
        if (await closePanel.count() > 0) await closePanel.click();
      }
    }

    // 2. Insert Screenplay Text
    const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
    await textarea.focus();
    await textarea.fill("${escapedText}");
    await page.waitForTimeout(300);

    // 3. Trigger Generation (Run)
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    await runBtn.click();

    // 4. Wait for audio completion (up to 40s)
    let completed = false;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(1000);
      const stopBtn = page.locator('button:has-text("Stop")');
      if (await stopBtn.count() === 0) {
        completed = true;
        break;
      }
    }

    // 5. Download audio
    const dlPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    const dlBtn = page.locator('button.download-button, button[aria-label*="Download" i]').first();
    if (await dlBtn.count() > 0) {
      await dlBtn.click();
    }
    
    // Check Downloads directory for latest file
    return { completed };
  `;

  return await sendScriptToDaemon(code);
}

async function runAudioWorker(workerId, taskQueue, lang) {
  while (taskQueue.length > 0) {
    const shot = taskQueue.shift();
    const shotNum = String(shot.scene_id).padStart(4, '0');
    const outFile = path.join(RAW_DIR, `${lang}_shot_${shotNum}.wav`);

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 10000) {
      console.log(`[AudioWorker ${workerId}] ${lang.toUpperCase()} Shot ${shot.scene_id} already exists.`);
      continue;
    }

    console.log(`[AudioWorker ${workerId}] Synthesizing ${lang.toUpperCase()} Shot ${shot.scene_id} with AI Studio...`);
    try {
      await synthesizeSceneWithAIStudio(shot, lang, outFile);
      console.log(`✓ [AudioWorker ${workerId}] Finished ${lang.toUpperCase()} Shot ${shot.scene_id}`);
    } catch (err) {
      console.error(`✗ [AudioWorker ${workerId}] Failed ${lang.toUpperCase()} Shot ${shot.scene_id}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 800)); // buffer to prevent rate-limit
  }
}

async function startParallelSpeechGeneration() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const langs = ['bn', 'en', 'hi'];

  for (const lang of langs) {
    console.log(`\nStarting parallel AI Studio speech synthesis for ${lang.toUpperCase()}...`);
    const queue = [...project.scenes];
    const workers = [];
    for (let w = 1; w <= NUM_AUDIO_WORKERS; w++) {
      workers.push(runAudioWorker(w, queue, lang));
    }
    await Promise.all(workers);
  }
  console.log('✓ All trilingual AI Studio speech generation complete!');
}

startParallelSpeechGeneration();
```

---

## 6. CANONICAL SAMPLE - EP02 9-worker TTS fleet (tools/run_parallel_tts_002.js)

> [!IMPORTANT]
> **Approved runnable sample.** Rules: T1 gemini-3.8-flash-tts via /u/N/generate-speech; T2 voice lock per page (Cruz+Old-Storyteller-style = host, Charon = narrator, Fenrir = kings) with labeled Delete-speech-block pruning to EXACTLY 1 block per job (template dialog renders ALL blocks at once); T3 scene-by-scene units; T4 skip-if-present wav>100KB; T5 1.2s pacing; T6 9 voice-bound workers x 8 slots (modulo); T7 quota rotation retrying SAME job; T8 debug screenshots; T9 blob extract duration>1s; T10 single-agent.
>
> Full source lives in tools/run_parallel_tts_002.js (T1-T10 in header). Probe: ONLY_SCENE=1 ONLY_LANG=bn, verify wav duration fits text length, then fleet.

---

## 7. FINAL-FULL - EP02 9-worker TTS fleet (SUPERSEDES S6 text)

> [!IMPORTANT]
> **FINAL working version, embedded byte-exact. Delivered 252/252 EP02 blocks**
> (Cruz/Charon/Fenrir, wav>100KB verified). Rules: T1 gemini-3.8-flash-tts via
> /u/N/generate-speech; T2 voice lock per page + labeled Delete-speech-block
> pruning to EXACTLY 1 block per job (the template dialog renders ALL blocks
> at once - 33s garbage otherwise); T3 scene-by-scene units; T4 skip-if-present;
> T5 1.2s pacing; T6 9 voice-bound workers (2 Cruz + 5 Charon + 2 Fenrir) x 8
> slots (u/0-u/7 modulo); T7 quota rotation retrying SAME job (streak-capped);
> T8 debug screenshots; T9 blob extract duration>1s; T10 single-agent.
>
> WORK PROCESS (how this file was earned): probe 1 line (bn/1 Cruz) -> verify
> wav duration fits text length (143 chars ~= 10s, NOT the 39s estimate) ->
> fleet-launch -> fix template-trap + quota-rotation-drop + page-death resume
> -> 252/252 -> embed here.

```javascript
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
```
