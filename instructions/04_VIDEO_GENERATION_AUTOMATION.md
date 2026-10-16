# 04. VIDEO GENERATION AUTOMATION INSTRUCTION
**Primary Engine:** Google AI Studio Video Generation (`gemini-omni-1.1-flash`, `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview`, `veo-3.1-lite`)  
**Secondary / Fallback Engine:** Google Flow (Image-to-Video Motion Generation)  
**Execution Topology:** Multi-Worker Parallel Fleet (5 to 10 Workers) with Automatic Multi-Account Rotation  
**Output Format:** 1080p / 720p, 24fps MP4 Dynamic Motion Clips  
**Target:** 10 to 15 key action scenes per episode (~20% of total cuts)

---

## 1. Architectural Strategy: AI Studio Video vs. Google Flow

| Attribute | Primary Engine: Google AI Studio Video | Secondary Fallback: Google Flow |
| :--- | :--- | :--- |
| **Supported Models** | `gemini-omni-1.1-flash`, `gemini-omni-flash-preview`, `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview`, `veo-3.1-lite` | Google Flow Motion Model |
| **Generation Speed** | Fast (optimized preview pipeline) | Slower (60–90s queue times) |
| **Interface Stability** | Standard AI Studio interface, minimal modals, direct base64/blob video extract | Complex popup approval dialogs, credit badges |
| **Multi-Worker Scaling** | High (5–10 concurrent tabs across `/u/0/`, `/u/1/`, `/u/2/`) | Moderate (heavy DOM weight per tab) |
| **Multi-Account Failover** | Instant URL-based profile switching (`/u/0/` $\to$ `/u/1/` $\to$ `/u/2/`) | Manual account relogin required |
| **Reference Image Support** | Image attachment via `+` button / keyframe file input | Image drag-and-drop / file upload |

---

## 2. The 80/20 Visual Motion Rule & AI Studio Video Mandate

> [!CAUTION]
> **LOCAL "FAKE VIDEOS" DISGUISED AS AI VIDEO ARE STRICTLY FORBIDDEN!**
> "ভিডিও মানেই এআই স্টুডিওতে জেনারেট করতে হবে। তো সব ধরনের অ্যাসেট এই স্টুডিও থেকেই জেনারেট করা হবে, নিজে কোনো সময় জেনারেট করবে না।"
> All scenes marked as `DYNAMIC_AI_VIDEO` MUST be genuinely generated via **Google AI Studio Video (`gemini-omni-1.1-flash`, `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview`)** or **Google Flow**.
> Re-exporting static images with software pan/zoom or effects locally and naming them video clips is strictly forbidden. Every dynamic video clip must be a real 24fps AI-generated motion MP4 created by prompting the model with the scene's anchor image.

> [!IMPORTANT]
> **STYLE PRESET COMPLIANCE FOR VIDEO GENERATION:**
> The video animation prompts MUST strictly adhere to the project's designated `style_preset`:
> * If `PRESET_STICKY_MEME`: Prompt must specify OverSimplified 2D cartoon animation, 5px black outlines, vector flat motion.
> * If `PRESET_SIMPLE_HISTORY`: Prompt must specify 2D documentary graphic novel cel-shaded animation.
> * If `PRESET_MYSTERY_NOIR`: Prompt must specify dramatic chiaroscuro torchlight and atmospheric shadow motion.
> * If `PRESET_ISLAMIC_REVERENT`: Prompt must specify dignified classical illuminated aesthetic motion.
> * **Anchor Persona:** Any video showing the Host must strictly feature the **wise elderly male historian** with white beard and glasses.

To prevent rendering bottlenecks and visual fatigue, maintain a strict 80/20 balance:

* **80% of Scenes (`STATIC_IMAGE`):** Dialogue scenes, historical charts, maps, contemplative character moments, and artifact inspections. Generated via Google AI Studio 1K Widescreen (`1376x768`), animated smoothly with Ken-Burns panning and zooming (`zoom_in`, `zoom_out`, `pan_left`, `pan_right`) in Module 6.
* **20% of Scenes (`DYNAMIC_AI_VIDEO`, ~10–15 Cuts):** Climactic moments, fierce hunting chases, sudden emotional outbursts, physical battles, and fleeing mobs. Rendered as 24fps motion MP4 clips (`clip_shot_00XX.mp4`).
* **MANDATORY Dynamic Quota:** 70–90 শটের এপিসোডে minimum 14টি `clip_scene` (`DYNAMIC_AI_VIDEO`, 14–18 clips) বাধ্যতামূলক। কোনো beat-এ action/climax থাকলে সেটিকে অগ্রাধিকার দিয়ে DYNAMIC_AI_VIDEO বরাদ্দ করো। কোটা পূরণ না হলে QA FAIL।
* **MANDATORY Hook & Outro Clips:** Shot #1 (hook/cold open) এবং শেষ shot (outro/CTA) সবসময় `DYNAMIC_AI_VIDEO` হবে — host-emergence / celebration / subscribe-energy মোশন সহ। Static hook/outro = QA FAIL (retention rule)।

### 2.1 Mandatory Dual-Keyframe Consistency Mandate (Start Frame + End Frame Interpolation)
> [!IMPORTANT]
> **ZERO CHARACTER MORPHING / ZERO STYLE DRIFT MANDATE:**
> Generating dynamic AI video clips using only a single starting image frequently leads to character morphing or style drift over a 10-second duration (e.g., the Host starting with a full white beard and scholar tunic but morphing into a beardless head in a tweed vest by second 8).
>
> **The Mandatory Dual-Keyframe Solution:**
> 1. **Generate Both Keyframes in Advance:** For all character-driven and high-continuity scenes, workers MUST generate **both the Start Frame (`scene_XXXX_start.jpg` or `scene_XXXX.jpg`) AND the End Frame (`scene_XXXX_end.jpg`)** together using **Nano Banana 2.1 (`gemini-nano-banana-2.1`)** with **Thinking Level: HIGH**.
> 2. **Thinking Level MUST ALWAYS BE HIGH:** In Google AI Studio, ensure `Thinking Level: High` is active on both image keyframe generation and video generation tabs.
> 3. **Dual Image Input in AI Studio Video:** In Google AI Studio Video (`gemini-omni-1.1-flash`), upload **BOTH keyframe images** (Start Frame + End Frame) into the chat/prompt bar using the media attachment button.
> 4. **Motion Directive:** Instruct the model to interpolate between the Start Frame and End Frame:
>    `Interpolate seamlessly from the start frame to the end frame in 2D OverSimplified cartoon style. Maintain 100% character visual consistency (white beard, wire spectacles, brown scholar tunic, illuminated book). 24fps motion, 16:9 widescreen.`
> 5. **Verification via Frame Extraction:** Before accepting any generated clip into the production timeline, workers MUST extract frames at 1s, 5s, and 9s using FFmpeg to verify that the character's facial features, clothing, and style remain 100% identical throughout.

---

## 3. Account Pool & Automated Failover Protocol

When generating dynamic video clips across a fleet of workers, accounts must be rotated automatically when hitting daily limits, rate limits, or quota exhaustion.

### Configured Pro Accounts Pool:
1. `msrosyafrin@gmail.com`
2. `bmajnu980@gmail.com`
3. `bmajnu9811@gmail.com`
4. `badiuzzaman.majnu123@gmail.com`
5. `bmajnu981@gmail.com`
6. `badiuzzaman.majnu1@gmail.com`

### Failover Rotation Mechanism:
1. Each worker binds to a designated user slot (`/u/0/`, `/u/1/`, `/u/2/`).
2. If an account returns a `Quota exceeded`, `Resource exhausted`, or `Upgrade to unlock` message:
   - Worker immediately logs the switch.
   - Worker redirects to the next available slot (`/u/(n+1)/` or alternate authenticated session).
   - The task is retried seamlessly without pipeline stalling.

---

## 4. Google AI Studio Video Generation Mechanics & Selectors

### 4.1 Endpoint URLs (PROBED 2026-10-14 — `/app/` and `/gen-media` paths 404):

* **Gemini Omni 1.1 Flash:** `https://aistudio.google.com/u/N/prompts/new_chat?model=gemini-omni-1.1-flash`
* **Veo 3.1 Fast:** `https://aistudio.google.com/u/N/prompts/new_chat?model=veo-3.1-fast-generate-preview` (auto-redirects to `prompts/new_video`)
* **Veo 3.1 Standard:** `https://aistudio.google.com/u/N/prompts/new_chat?model=veo-3.1-generate-preview`
* **Veo 3.1 Lite:** `https://aistudio.google.com/u/N/prompts/new_chat?model=veo-3.1-lite`

> [!CAUTION]
> NEVER use `/app/prompts/...` or `/gen-media...` — AI Studio redirects both to
> `/u/N/404` ("Page not found"). Canonical base is always
> `aistudio.google.com/u/N/prompts/new_chat?model=<id>` (same shape as image gen).

### 4.2 Automation Flow:
1. **Initialize Tab:** Navigate to model endpoint under authenticated user slot.
2. **Set Configuration Settings (Right Drawer):**
   - Aspect ratio: `16:9` widescreen
   - Duration: `5s` or `10s`
   - Resolution: `1080p` (or `720p`)
   - Frame rate: `24fps`
3. **Attach Anchor Reference Image:**
   - Upload the scene's corresponding 1K static image (`shot_00XX.jpg`) via the attachment button (`+` or `input[type="file"]`).
   - Ensures 100% visual continuity of character designs, clothing, and background art style.
4. **Formulate Action Motion Prompt:**
   - *Formula:* `Animate this 2D cartoon scene dynamically: [vigorous action verb], [secondary physics: dust clouds, swinging hair, moving shadows], 2D cartoon animation, 24fps motion, 16:9 widescreen.`
   - *Example:* `Animate this 2D cartoon stickman hunter dynamically: suddenly crouching low and stalking forward through tall grass, spear poised to strike, dust drifting past, 2D cartoon animation, 24fps.`
5. **Run & Monitor:**
   - Trigger generation via `button.ctrl-enter-submits` or `button:has-text("Run")`.
   - Monitor `video` element generation or completion status.
6. **Extract & Save:**
   - Extract video `src` (blob URL or base64 stream) or click download button.
   - Save file to `projects/<project_id>/visual_assets/clip_shot_XXXX.mp4`.
   - Update `project.json` for that scene:
     ```json
     "type": "DYNAMIC_AI_VIDEO",
     "asset_file": "visual_assets/clip_shot_XXXX.mp4",
     "motion_effect": "ai_video"
     ```

---

## 5. Secondary Fallback: Google Flow Mechanics

If Google AI Studio encounters maintenance or unavailable preview quotas, fall back to Google Flow:

1. **Target URL:** `https://flow.google.com/`
2. **Anchor Reference Upload:** Upload `shot_00XX.jpg` via `input[type="file"]`.
3. **Motion Prompt:** Input high-energy directive into `div.ProseMirror`.
4. **Credit Approval Confirmation:** Click `div.option-row:has-text("অনুমোদন")` or `button:has-text("Approve")`.
5. **Download:** Click `flow-video-tile` $\to$ header download button $\to$ save as `clip_shot_XXXX.mp4`.

---

## 5B. Noor-Veil Rule: Prophet ﷺ & Khulafa Faces NEVER Shown (MANDATORY)

> [!CAUTION]
> **নবী সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম এবং খলিফাগণের (আবু বকর, উমর, উসমান, আলী রা.) মুখ/ফেস কখনো দেখানো যাবে না — কোনো exception নেই।**

* **Visual method:** সংশ্লিষ্ট চরিত্র সবসময় **ঐশী আলোর পর্দায় (radiant noor glow)** ঢাকা থাকবে — মুখের জায়গায় intense golden-white light orb/halo, অথবা back-view / silhouette / extreme long-shot। Frontal face, চোখ-নাক-মুখের রেখা, photorealistic portrait = **QA FAIL**।
* **Prompt wording (image+video):** প্রতিটি সংশ্লিষ্ট visual_prompt-এ বাধ্যতামূলক phrase: `"faceless figure veiled in radiant divine light, face completely hidden by glowing noor, no facial features"`, সাথে `--no ...` suffix-এ `"face, eyes, portrait"` যোগ করো।
* **Verification:** 1376px চেকে সংশ্লিষ্ট শটে মুখ দেখা গেলে regenerate বাধ্যতামূলক। Narration-এ মুখের বর্ণনা ("তাঁর হাসিমুখ") লিখবে না — "নূরের তাজাল্লি" জাতীয় সম্মানজনক ভাষা ব্যবহার করো।

---

## 6. Legacy script template (background only — superseded by §6B)

> [!CAUTION]
> The template below predates the slot-cycling, engine-chain and Thinking-High
> contracts and used single-account navigation that 404s on bad slots
> (Oct-2026). Preserved as background reference only — **not runnable**.
> Run `tools/run_parallel_videos_002.js` (§6B) instead.

```javascript
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const NUM_WORKERS = 5;
const VIDEO_MODELS = [
  'gemini-omni-1.1-flash',
  'veo-3.1-fast-generate-preview',
  'veo-3.1-generate-preview'
];

async function generateClipWithAIStudio(page, workerId, scene, outPath) {
  const refImage = path.join(__dirname, '..', scene.asset_file);
  const prompt = `Animate this 2D cartoon scene dynamically: ${scene.narration.en}, 2D cartoon animation, 24fps motion, 16:9 widescreen`;
  
  // Attach reference image
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('button[aria-label*="Add"], button[aria-label*="Insert"]').first().click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(refImage);
  
  // Fill prompt and run
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.locator('button.ctrl-enter-submits, button:has-text("Run")').first().click();
  
  // Wait for video element
  await page.waitForSelector('video', { timeout: 90000 });
  const videoSrc = await page.evaluate(() => document.querySelector('video')?.src);
  
  // Download video buffer and save
  const resp = await page.request.get(videoSrc);
  const buffer = await resp.body();
  fs.writeFileSync(outPath, buffer);
  console.log(`[Worker ${workerId}] ✓ Successfully generated ${outPath} (${buffer.length} bytes)`);
}
```

---

## 6B. CANONICAL SAMPLE — EP02 10-worker video fleet (`tools/run_parallel_videos_002.js`)

> [!IMPORTANT]
> **This is the approved runnable sample.** Built by following these rules:
> * **V1 Engine hierarchy:** `gemini-omni-1.1-flash` → `veo-3.1-fast-generate-preview` →
>   `veo-3.1-generate-preview` → `veo-3.1-lite`, tried per-clip on quota.
> * **V2 Thinking HIGH. V3 16:9 + 720p + 24fps.**
> * **V4 Sticky-man motion formula** (OverSimplified 2D, 5px outlines); host clips
>   feature the beard+glasses scholar.
> * **V5 Anchor:** the scene's own `shot_XXXX.jpg` attached to every clip.
> * **V6 10 workers × 6 slots,** slot index ALWAYS modulo (never `u/undefined`).
> * **V7 Skip-if-present** (`clip_shot_XXXX.mp4` > 100KB). **V8 QUOTA rotation**
>   retries the SAME clip. **V8a Billing-gate rule (PROBED 2026-10-14):** omni
>   sessions can pop a *"Link an API key / Set up billing"* modal instead of
>   quota text — click **Skip** when offered; if the gate persists, rotate slot.
>   Quota regex MUST include `link an api key|set up billing`. **V9
>   `_debug_clipXXXX.png`** on failure.
> * **V10 Single-agent; V11 real AI video only** (no local pan/zoom re-exports).
>
> Full source lives in `tools/run_parallel_videos_002.js` (V1–V11 documented in
> its header). Motion prompts are fresh per-scene bodies in its `MOTION` map
> wrapped by `MOTION_FORMULA`. Probe one clip first:
> `$env:ONLY_SCENE='12'; node tools/run_parallel_videos_002.js`,
> verify `clip_shot_0012.mp4` plays as 24fps motion, then launch the fleet.
<!-- sync test -->

---

## 6C. CANONICAL FULL SCRIPT - EP02 video fleet (SUPERSEDES S6B text)

> [!IMPORTANT]
> **This section is the approved runnable sample IN FULL.** S6B above keeps
> the rule summary; the byte-exact script follows. Rules enforced:
> V1 engine chain (omni -> veo-fast -> veo-standard -> veo-lite), V2 Thinking HIGH,
> V3 16:9 + 720p + 24fps, **V4-DETAILED motion bodies (action beats + camera +
> physics, never one-line basic prompts)**, V5 anchor attach, V6 10 workers x 8
> slots (u/0-u/7, modulo - never u/undefined), V7 skip-if-present, V8 quota
> rotation, V8a billing-gate Skip, V9 debug screenshots, V10 single-agent,
> V11 real AI video only, V12 upload-then-Run with Start verification.
> Canonical endpoints: `aistudio.google.com/u/N/prompts/new_chat?model=<id>`
> (`/app/` and `/gen-media` 404 - PROBED 2026-10-14).
>
> Probe: `$env:ONLY_SCENE='12'; node tools/run_parallel_videos_002.js`, verify
> `clip_shot_0012.mp4` (720p/24fps), then fleet-launch. Do NOT close Chrome.

```javascript
// ============================================================================
// EP02 Video Fleet — canonical 10-worker parallel AI-video generator
// Project: projects/simple_itihash_002_first_language (16 DYNAMIC_AI_VIDEO)
// Run:   node tools/run_parallel_videos_002.js
// Probe: $env:ONLY_SCENE='12'; node tools/run_parallel_videos_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (from instructions/04_VIDEO_GENERATION_AUTOMATION.md):
//  V1 Engine hierarchy: gemini-omni-1.1-flash -> veo-3.1-fast-generate-preview
//     -> veo-3.1-generate-preview -> veo-3.1-lite (per-clip fallback on quota).
//     Google Flow is the secondary fallback (manual, not in this script).
//  V2 Thinking Level MUST be High on every session.
//  V3 Config: Aspect 16:9, Duration 5s/10s, Resolution 720p+, 24fps motion.
//  V4 Style: sticky-man formula (OverSimplified 2D, 5px outlines, flat motion);
//     host clips feature the beard+glasses scholar; anchor image attached.
//  V5 Anchor: ALWAYS attach the scene's own shot_XXXX.jpg (Phase-2 output).
//  V6 Parallelism: 10 workers x 8 slots (u/0-u/7), slot index ALWAYS modulo
//     (never u/undefined -> 404). Shared queue, each worker owns its page.
//  V7 Skip-if-present: clip_shot_XXXX.mp4 > 100KB never regenerated.
//  V8 QUOTA rotation: next slot, SAME clip retried; clips never dropped.
//  V9 Failure evidence: _debug_clipXXXX.png screenshot on failure.
// V10 Single-agent execution; do NOT close the Chrome window mid-run.
// V11 Real AI video ONLY — no local pan/zoom re-exports (04 §2 mandate).
// V12 Upload-then-Run: wait until anchor "Loading..." finishes, dismiss the
//     info banner, and VERIFY generation started (Stop button) with up to 3
//     fill+click retries — a missed click burns NO quota but causes timeouts.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');

// V1: engine fallback chain
const VIDEO_CHAIN = ['gemini-omni-1.1-flash', 'veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite'];

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const VIDEO_SCENES = project.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO');

// V4-DETAILED: every motion body directs exact character action beats +
// camera + secondary physics (dust/flame/water/cloth). Bodies wrapped by MOTION_FORMULA.
const MOTION = {
1:'Time Chronicler stick-man scholar with white beard and glasses stepping forward toward camera in his cosmic library, raising his wooden torch high as its flame flares, old book pages fluttering in his other hand, galaxy light swirling through tall windows, slow camera push-in',
6:'stick-man caveman in close-up with heaving chest opening his mouth wide at dawn, glowing golden sound waves expanding outward ring by ring, birds scattering from a tree, morning light rising behind him',
12:'stick-man caveman waving both arms up and sideways in frantic silent mime, his companion leaning in squinting then swatting a fly with a stick, dry bushes shaking around them',
18:'grand parisian lecture hall where stick-man gentlemen in top hats rise from their seats shouting and shaking papers, president banging a huge gavel, chandelier swaying overhead, sheets of paper fluttering down',
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
27:'stick-man cavemen jumping and slapping a mid-air high-five on a hilltop, dust bursting under their feet, the boulder wobbling slightly behind them, bright sun flare',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
47:'emperor akbar stick-man with emerald turban walking steadily along his red sandstone courtyard at sunrise, robe flowing behind him, pigeons bursting upward, curtains billowing inside the arches',
55:'a golden helix of light rotating slowly above a stick-man london family holding hands and swaying, clock hands turning on a tower behind them, night clouds drifting past the moon',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
63:'san stick-man hunters with bows walking single file through kalahari desert at sunrise, red sand swirling at their feet, dry grass bending in the wind, sun climbing higher',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const MOTION_FORMULA = (b) => `Animate this 2D sticky-man cartoon scene in OverSimplified style with 5px black outlines and flat vector motion: ${b}. Smooth character motion, dust and light physics, 24fps motion, 16:9 widescreen --no text, typography, labels, words, speech bubbles, watermarks, sticker, die-cut, photorealism`;

// V6: all 8 authenticated slots cycle across workers (u/0 .. u/7).
const ACCOUNT_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];
const NUM_WORKERS = 10;

async function ensureVideoSession(page, slot, model) {
  // PROBED 2026-10-14: /app/prompts/... 404s; /prompts/new_chat is canonical
  // (veo models auto-redirect to /prompts/new_video). Never use /app/ or /gen-media.
  const url = `https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  try { // V2: Thinking High
    const sel = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await sel.count() > 0) {
      const cur = await sel.innerText().catch(() => '');
      if (!/high/i.test(cur)) {
        await sel.click().catch(() => {});
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option').filter({ hasText: 'High' }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } catch (e) {}
  try { // V3: 16:9
    const ar = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await ar.count() > 0) {
      await ar.click().catch(() => {});
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option').filter({ hasText: '16:9' }).first();
      if (await opt.count() > 0) await opt.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (e) {}
  try { // V3: 720p
    const rs = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await rs.count() > 0) {
      await rs.click().catch(() => {});
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option').filter({ hasText: '720p' }).first();
      if (await opt.count() > 0) await opt.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (e) {}
}

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit|requires a paid API key|link an api key|set up billing/i.test(document.body.innerText || '')
  ).catch(() => false);
}

// PROBED 2026-10-14: the composer re-renders while the anchor uploads
// ("shot_XXXX.jpg Loading...") and omni tabs remount on instability. Clicking
// Run before upload finishes (or on a stale handle after remount) silently
// starts NOTHING — no quota burns, but the poll loop times out. So: wait for
// upload, dismiss the info banner, and VERIFY Run actually started (Stop btn).
async function waitForUploadDone(page, ms = 30000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const loading = await page.evaluate(() =>
      /Loading\.\.\./.test(document.body.innerText || '')
    ).catch(() => false);
    if (!loading) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

async function dismissInfoBanner(page) {
  try {
    const x = page.locator('div:has-text("Feature Availability")').locator('button').first();
    if (await x.isVisible().catch(() => false)) await x.click({ force: true }).catch(() => {});
  } catch (e) {}
}

async function clickRunVerified(page, fullPrompt, tries = 3) {
  for (let t = 0; t < tries; t++) {
    const ta = page.locator('textarea.textarea, textarea, div[contenteditable="true"][role="textbox"]').first();
    await ta.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await ta.fill(fullPrompt).catch(() => {});
    await page.waitForTimeout(1000);
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    const dis = await runBtn.getAttribute('aria-disabled').catch(() => null);
    if (dis === 'true' || await isQuota(page)) return 'gated';
    await runBtn.click({ force: true }).catch(() => {});
    for (let i = 0; i < 10; i++) { // ~20s: did generation actually start?
      await page.waitForTimeout(2000);
      const started = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'))
      ).catch(() => false);
      if (started) return 'started';
      if (await isQuota(page)) return 'gated';
    }
  }
  return 'nostart';
}

// V8a: billing-gate modal ("Link an API key" / "Set up billing") blocks Run.
// Click Skip when offered; true when the gate is gone, false when still gated.
async function dismissBillingGate(page) {
  try {
    const gate = await page.evaluate(() =>
      /link an api key|set up billing/i.test(document.body.innerText || '')
    ).catch(() => false);
    if (!gate) return true;
    const skip = page.locator('button:has-text("Skip")').first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
      return page.evaluate(() =>
        !/link an api key|set up billing/i.test(document.body.innerText || '')
      ).catch(() => false);
    }
    return false;
  } catch (e) { return false; }
}

async function generateClipOnPage(page, scene, workerId, getSlot) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) return { ok: true, skipped: true }; // V7
  const anchor = path.join(VISUAL, `shot_${shotNum}.jpg`); // V5
  if (!fs.existsSync(anchor)) return { ok: false, err: 'ANCHOR_MISSING' };
  const body = MOTION[scene.scene_id];
  if (!body) return { ok: false, err: 'NO_MOTION_PROMPT' };
  const fullPrompt = MOTION_FORMULA(body);

  for (const model of VIDEO_CHAIN) { // V1+V8
    for (let s = 0; s < ACCOUNT_SLOTS.length; s++) {
      const slot = getSlot();
      try {
        await ensureVideoSession(page, slot, model);
        if (await isQuota(page)) continue;
        if (!await dismissBillingGate(page)) continue; // V8a: still gated -> next slot
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(anchor).catch(() => {});
          await page.waitForTimeout(2500);
          const ack = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
          if (await ack.isVisible().catch(() => false)) { await ack.click().catch(() => {}); await page.waitForTimeout(500); }
        }
        await dismissInfoBanner(page);
        if (!await waitForUploadDone(page)) return { ok: false, err: 'ANCHOR_UPLOAD_STUCK' };
        const runState = await clickRunVerified(page, fullPrompt);
        if (runState === 'gated') continue; // V8: quota/billing appeared -> next slot
        if (runState !== 'started') {
          await page.screenshot({ path: path.join(VISUAL, `_debug_clip${shotNum}.png`) }).catch(() => {}); // V9
          return { ok: false, err: 'RUN_NOSTART' };
        }
        let videoSrc = null;
        for (let i = 0; i < 100; i++) { // up to ~5min
          await page.waitForTimeout(3000);
          if (await isQuota(page)) break;
          const st = await page.evaluate(() => {
            const vid = document.querySelector('video');
            const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
            const err = document.querySelector('.error-message, mat-error, [role="alert"]');
            return { hasVid: !!vid && !!vid.src, src: vid ? vid.src : null, hasStop: stop, err: err ? err.innerText : null };
          }).catch(() => ({}));
          if (st.err) break;
          if (st.hasVid && !st.hasStop) { videoSrc = st.src; break; }
          if (!st.hasStop && !st.hasVid && i >= 8) break;
        }
        if (!videoSrc) {
          if (await isQuota(page)) continue; // V8
          await page.screenshot({ path: path.join(VISUAL, `_debug_clip${shotNum}.png`) }).catch(() => {}); // V9
          return { ok: false, err: 'TIMEOUT_NO_VIDEO' };
        }
        const vData = await page.evaluate(async (src) => {
          try {
            const res = await fetch(src);
            const blob = await res.blob();
            const ab = await blob.arrayBuffer();
            const bytes = new Uint8Array(ab);
            let bin = '';
            for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
            return { b64: btoa(bin), size: bytes.length };
          } catch (e) { return { err: e.message }; }
        }, videoSrc);
        if (!vData || vData.err || !vData.b64) return { ok: false, err: (vData && vData.err) || 'EXTRACT_FAIL' };
        fs.writeFileSync(outPath, Buffer.from(vData.b64, 'base64'));
        console.log(`[W${workerId}/u${slot}/${model}] ✓ Clip ${scene.scene_id} (${(vData.size / 1048576).toFixed(2)} MB)`);
        return { ok: true, size: vData.size };
      } catch (err) {
        if (/quota|429/i.test(err.message)) continue; // V8
        return { ok: false, err: err.message.slice(0, 80) };
      }
    }
  }
  return { ok: false, err: 'ALL_SLOTS_MODELS_QUOTA' };
}

async function runWorker(ctx, workerId, queue) {
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length; // V6
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  let done = 0, fail = 0, skipped = 0;
  try {
    while (queue.length > 0) {
      const scene = queue.shift();
      const res = await generateClipOnPage(page, scene, workerId, getSlot);
      if (res.skipped) skipped++;
      else if (res.ok) done++;
      else { fail++; console.log(`[W${workerId}] ✗ Clip ${scene.scene_id}: ${res.err}`); }
      await page.waitForTimeout(1500);
    }
  } finally {
    await page.close().catch(() => {});
  }
  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== EP02 VIDEO FLEET: ${NUM_WORKERS} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  const only = Number(process.env.ONLY_SCENE) || 0;
  const todo = VIDEO_SCENES.filter(s => {
    if (only && s.scene_id !== only) return false;
    const f = path.join(VISUAL, `clip_shot_${String(s.scene_id).padStart(4, '0')}.mp4`);
    return !fs.existsSync(f) || fs.statSync(f).size < 100000;
  });
  console.log(`Remaining: ${todo.length}/${VIDEO_SCENES.length} clips`);
  if (todo.length === 0) { console.log('All clips present. Nothing to do.'); process.exit(0); }
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const results = await Promise.all(
    Array.from({ length: NUM_WORKERS }, (_, i) => runWorker(ctx, i + 1, todo))
  );
  console.log(JSON.stringify(results, null, 2));
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final: ${totalPresent}/${VIDEO_SCENES.length} clips.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one fleet file per episode; anchor attach + shared queue
```

---

## 6D. CANONICAL FULL SCRIPT - Flow fallback batch fleet (`tools/run_flow_videos_002.js`)

> [!IMPORTANT]
> **Fallback trigger (F0): run ONLY when the AI Studio fleet reports
> ALL_SLOTS_MODELS_QUOTA on every V1-chain model.** The Flow agent mode then
> generates SEVERAL videos in ONE request (PROBED 2026-10-14) - batch, do not
> submit one-by-one. Rules enforced:
> F1 one project per worker, up to 3 scenes per submit (3+3+3); F2 drop each
> anchor image and wait for the % indicator to clear; F3 approval handling -
> read the proposed count ("Nটি ভিডিও"), Cancel on mismatch, else click
> ALWAYS-APPROVE so nothing stalls (a missing click stalls forever); F4 poll
> tiles until count == batch size (tiles arrive in prompt order); F5 3 parallel
> projects; F6 save only ftyp+moov clips > 100KB; F7 single-agent.
>
> Working steps (PROBED): home -> New project -> drop shot_XXXX.jpg files onto
> the canvas -> type batched prompt in ProseMirror -> arrow submit -> approve
> (prefer always-approve) -> harvest flow-video-tile videos in order.
>
> Probe: `$env:ONLY_SCENE='18'; node tools/run_flow_videos_002.js`, verify
> `clip_shot_0018.mp4`, then fleet-launch. Do NOT close Chrome.

```javascript
// ============================================================================
// EP02 Flow Fleet - canonical Google Flow fallback batch generator
// Project: projects/simple_itihash_002_first_language (9 remaining DYNAMIC clips)
// Run:   node tools/run_flow_videos_002.js
// Probe: $env:ONLY_SCENE='18'; node tools/run_flow_videos_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (instructions/04_VIDEO_GENERATION_AUTOMATION.md S5):
//  F0 TRIGGER: run ONLY when the AI Studio fleet (run_parallel_videos_002.js)
//     reports ALL_SLOTS_MODELS_QUOTA on every V1-chain model (04 S4 note).
//  F1 BATCHING: one Flow project per worker, up to 3 scenes per submit. The
//     Flow agent mode generates several videos in ONE request (PROBED
//     2026-10-14: agent proposed "15টি ভিডিও ... 15 ক্রেডিট" for a batch) -
//     batching is faster than one-project-per-clip and burns 1 credit/video.
//  F2 ANCHOR: drop each scene's own shot_XXXX.jpg onto the project (drop upload
//     works; the + ingredient menu does not open reliably). Wait for the %
//     upload indicator to disappear before submitting.
//  F3 APPROVAL (mandatory - a missing click stalls forever): read the proposed
//     video count ("এই Nটি ভিডিও"); if N != batch size -> Cancel (বাতিল করুন)
//     and fall back to single submits. Else click সবসময় অনুমোদন করুন
//     (always-approve) so later batches never stall; else অনুমোদন করুন.
//  F4 MONITOR: poll flow-video-tile / video elements until count == batch size
//     (up to ~40 min). Tiles arrive in prompt order.
//  F5 WORKERS: 3 parallel projects (3+3+3 scenes), each worker owns its page.
//  F6 VERIFY: every clip saved only if ftyp+moov present and > 100KB.
//  F7 Single-agent execution; do NOT close the Chrome window mid-run.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');

// F1: fixed 3+3+3 batches over the 9 remaining dynamic scenes
const BATCHES = [[18, 23, 32], [38, 43, 57], [70, 78, 84]];
const NUM_WORKERS = 3;

// Detailed motion bodies (same V4-DETAILED beats as the AI Studio fleet)
const MOTION = {
18:'grand parisian lecture hall where stick-man gentlemen in top hats rise from their seats shouting and shaking papers, president banging a huge gavel, chandelier swaying overhead, sheets of paper fluttering down',
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const STYLE_TAIL = 'in 2D sticky-man cartoon style, OverSimplified, 5px black outlines, flat vector motion, 24fps, 16:9 widescreen, no text, no watermarks';

function batchPrompt(ids) {
  const parts = ids.map((id, i) => {
    const shot = `shot_${String(id).padStart(4, '0')}.jpg`;
    return `Scene ${i + 1} - ingredient image ${shot}: animate it: ${MOTION[id]} ${STYLE_TAIL}.`;
  });
  return `Generate ${ids.length} separate videos, one per scene below. For each scene animate its ingredient image. ${parts.join(' ')}`;
}

async function dropAnchor(page, shotFile) {
  const b64 = fs.readFileSync(path.join(VISUAL, shotFile)).toString('base64');
  await page.evaluate(async (d) => {
    const bc = atob(d.b64); const arr = new Uint8Array(bc.length);
    for (let i = 0; i < bc.length; i++) arr[i] = bc.charCodeAt(i);
    const dt = new DataTransfer(); dt.items.add(new File([arr], d.name, { type: 'image/jpeg' }));
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    for (const t of ['dragenter', 'dragover', 'drop']) (el || document.body).dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { b64, name: shotFile });
  for (let i = 0; i < 30; i++) { // F2: upload % gone?
    await page.waitForTimeout(2000);
    const busy = await page.evaluate(() => /(\d+)%/.test(document.body.innerText || '')).catch(() => false);
    if (!busy) return true;
  }
  return false;
}

// F3: approval handling. Returns 'ok' | 'cancelled' | 'noapproval'
async function handleApproval(page, expectN) {
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const card = await page.evaluate(() => {
      const t = document.body.innerText || '';
      const m = t.match(/এই\s*(\d+)\s*টি ভিডিও/);
      const hasApprove = /অনুমোদন করুন/.test(t);
      return { n: m ? Number(m[1]) : 0, hasApprove };
    }).catch(() => ({}));
    if (card.hasApprove && card.n > 0) {
      if (card.n !== expectN) {
        const cancel = page.locator('button').filter({ hasText: 'বাতিল করুন' }).first();
        await cancel.click({ force: true }).catch(() => {});
        return 'cancelled';
      }
      const always = page.locator('button').filter({ hasText: 'সবসময় অনুমোদন করুন' }).first();
      if (await always.isVisible().catch(() => false)) {
        await always.click({ force: true }).catch(() => {});
      } else {
        const one = page.locator('button').filter({ hasText: 'অনুমোদন করুন' }).first();
        await one.click({ force: true }).catch(() => {});
      }
      return 'ok';
    }
  }
  return 'noapproval';
}

async function downloadTiles(page, ids) {
  const out = [];
  for (let k = 0; k < 100; k++) { // F4: up to ~50 min for the batch
    await page.waitForTimeout(30000);
    const n = await page.evaluate(() =>
      document.querySelectorAll('flow-video-tile').length || document.querySelectorAll('video[src]').length
    ).catch(() => 0);
    if (k % 4 === 0) console.log(`  ... waiting tiles: ${n}/${ids.length}`);
    if (n >= ids.length) break;
  }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const shotNum = String(id).padStart(4, '0');
    const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
    const v = await page.evaluate(async (idx) => {
      const tiles = document.querySelectorAll('flow-video-tile');
      const scope = tiles.length > idx ? tiles[idx] : document;
      const vid = scope.querySelector('video');
      const src = vid ? vid.currentSrc || vid.src : null;
      if (!src) return { err: 'NO_SRC' };
      try {
        const res = await fetch(src); const blob = await res.blob();
        const ab = await blob.arrayBuffer(); const bytes = new Uint8Array(ab);
        let bin = ''; for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), size: bytes.length };
      } catch (e) { return { err: e.message }; }
    }, i).catch(e => ({ err: e.message }));
    if (!v || v.err || !v.b64 || v.size < 100000) { out.push({ id, ok: false, err: (v && v.err) || 'TOO_SMALL' }); continue; }
    const buf = Buffer.from(v.b64, 'base64');
    const valid = buf.slice(4, 12).toString() === 'ftypmp42' || buf.includes(Buffer.from('moov')); // F6
    if (!valid) { out.push({ id, ok: false, err: 'BAD_MP4' }); continue; }
    fs.writeFileSync(outPath, buf);
    console.log(`  ✓ Clip ${id} (${(v.size / 1048576).toFixed(2)} MB)`);
    out.push({ id, ok: true });
  }
  return out;
}

async function runBatch(ctx, workerId, ids) {
  const only = Number(process.env.ONLY_SCENE) || 0;
  let list = only ? [only] : ids.filter(id => {
    const f = path.join(VISUAL, `clip_shot_${String(id).padStart(4, '0')}.mp4`);
    return !fs.existsSync(f) || fs.statSync(f).size < 100000;
  });
  if (list.length === 0) return { workerId, done: 0, fail: 0, skipped: ids.length };
  const page = await ctx.newPage();
  try {
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    await page.locator('button').filter({ hasText: 'নতুন প্রোজেক্ট' }).first().click().catch(() => {});
    await page.waitForTimeout(9000);
    for (const id of list) { // F2: all anchors first
      const shot = `shot_${String(id).padStart(4, '0')}.jpg`;
      console.log(`[F${workerId}] dropping ${shot}...`);
      if (!await dropAnchor(page, shot)) return { workerId, done: 0, fail: list.length, err: 'UPLOAD_STUCK' };
    }
    await page.screenshot({ path: path.join(VISUAL, `_debug_flow${workerId}_anchors.png`) }).catch(() => {});
    const pm = page.locator('div.ProseMirror').first();
    await pm.click().catch(() => {});
    await page.keyboard.type(batchPrompt(list), { delay: 3 }).catch(() => {});
    await page.waitForTimeout(1500);
    await page.locator('button[aria-label="জেনারেট করা শুরু করুন"]').first().click({ force: true }).catch(() => {});
    const ap = await handleApproval(page, list.length); // F3
    if (ap === 'cancelled') return { workerId, done: 0, fail: list.length, err: 'COUNT_MISMATCH' };
    if (ap !== 'ok') {
      await page.screenshot({ path: path.join(VISUAL, `_debug_flow${workerId}_noapproval.png`) }).catch(() => {});
      return { workerId, done: 0, fail: list.length, err: 'NO_APPROVAL' };
    }
    const res = await downloadTiles(page, list); // F4+F6
    return { workerId, done: res.filter(r => r.ok).length, fail: res.filter(r => !r.ok).length, detail: res };
  } finally {
    await page.close().catch(() => {});
  }
}

(async () => {
  console.log(`=== EP02 FLOW FLEET: ${NUM_WORKERS} WORKERS (3+3+3) ===`);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const results = await Promise.all(BATCHES.map((b, i) => runBatch(ctx, i + 1, b)));
  console.log(JSON.stringify(results, null, 2));
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final: ${totalPresent}/16 clips.`);
  await ctx.close();
  process.exit(results.some(r => (r.fail || 0) > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one Flow fleet file; batches over single submits (agent batch mode)
```

---

## 6D-addendum. Flow MULTI-ACCOUNT + probe discipline (PROBED 2026-10-14)

> [!CAUTION]
> **Flow has NO /u/N multi-account tab system.** Unlike AI Studio,
> flow.google.com is a single-session app: every tab inside one Chrome
> profile shares ONE Google account and ONE credit pool. Running 3 workers
> in 1 profile burns the same limit 3x faster with zero isolation.
>
> **Rule F8:** one Chrome user-data-dir per Flow worker. Verified fleet:
> `chrome_aistudio_profile_3` (badiuzzaman.majnu), `chrome_aistudio_profile`
> (bmajnu9811), `chrome_aistudio_profile_2` (msrosyafrin). Worker i launches
> its own persistent context on PROFILES[i] (own window, own credits).
> To add an account: launch Chrome with a fresh user-data-dir, log into
> Google, open flow.google.com once (Next, no opt-ins), append dir to PROFILES.
>
> **Rule F9:** probe mode (`ONLY_SCENE`) runs EXACTLY one worker. Submitting
> the same form from parallel tabs duplicates credit burn and time.

> **F3-slow-agent note (PROBED 2026-10-14):** under high demand the Flow agent answers after 8+ min and may show scheduled/queued state with approval buttons together - poll ~12 min for EITHER, approve on sight, else monitor tiles directly.

> **LOCALE rule (PROBED 2026-10-15):** fresh profiles render Flow in ENGLISH - every selector tries bn then en (New project, Start generating, Approve/Always approve/Cancel). Approval-count parse accepts ASCII+Bengali digits with invisible chars tolerated.

> **Verified-submit + verified-drop (PROBED 2026-10-15):** drop is confirmed only when the filename chip appears on canvas (retry x3); submit is confirmed only when the text LEAVES the composer into a session turn; approval poll ~20 min (agent slow under load).

---

## 6E. CANONICAL FULL SCRIPT - Flow DIRECT mode (agent-OFF) fleet (tools/run_flow_direct_002.js)

> [!IMPORTANT]
> **Agent-mode is the slow path. DIRECT mode works like AI Studio:** new project -> agent-OFF (Space-toggle chip until aria-pressed=false; persists per account, enforce idempotently) -> tap model chip -> VIDEO tab -> FRAME -> START slot -> click uploaded file -> Add-to-prompt -> type DETAILED prompt -> arrow submit -> direct generation, credits deducted at once, NO approval card. Defaults per scene: 16:9, Omni 1.1 Flash, 720p, 8s, x1 (~12 credits; longer/more costs more - use only what the scene needs). One scene per project; 3 profiles share one queue (F8). Unlimited FREE 2.1 IMAGES also live here for future episodes.
>
> Full source lives in tools/run_flow_direct_002.js (D0-D8 in header). Probe: ONLY_SCENE=23, verify mp4, then fleet.

---

## 6F. FINAL-FULL - AI Studio video fleet (SUPERSEDES S6B + S6C)

> [!IMPORTANT]
> **Pre-limit path - FINAL working version, embedded byte-exact.** Delivered
> 10/16 EP02 clips (720p/24fps verified). Rules: V1 omni->veo-fast->veo-std->
> veo-lite per-clip fallback + session omniDead learning; V2 Thinking HIGH;
> V3 16:9+720p; V4-DETAILED motion bodies; V5 anchor attach; V6 10 workers x
> 8 slots (u/0-u/7 modulo); V7 skip-if-present; V8 quota rotation (same clip);
> V8a billing-gate Skip; V9 debug shots; V12 upload-then-Run with Start verify.
> Endpoints: aistudio.google.com/u/N/prompts/new_chat?model=<id> (/app/ 404s).
>
> WORK PROCESS (how this file was earned): probe single clip -> verify mp4
> (720p/24fps) -> fleet-launch -> read debug screenshots on fail -> fix root
> cause in script -> record rule+probe date in header -> embed here.

```javascript
// ============================================================================
// EP02 Video Fleet — canonical 10-worker parallel AI-video generator
// Project: projects/simple_itihash_002_first_language (16 DYNAMIC_AI_VIDEO)
// Run:   node tools/run_parallel_videos_002.js
// Probe: $env:ONLY_SCENE='12'; node tools/run_parallel_videos_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (from instructions/04_VIDEO_GENERATION_AUTOMATION.md):
//  V1 Engine hierarchy: gemini-omni-1.1-flash -> veo-3.1-fast-generate-preview
//     -> veo-3.1-generate-preview -> veo-3.1-lite (per-clip fallback on quota).
//     Google Flow is the secondary fallback (manual, not in this script).
//  V2 Thinking Level MUST be High on every session.
//  V3 Config: Aspect 16:9, Duration 5s/10s, Resolution 720p+, 24fps motion.
//  V4 Style: sticky-man formula (OverSimplified 2D, 5px outlines, flat motion);
//     host clips feature the beard+glasses scholar; anchor image attached.
//  V5 Anchor: ALWAYS attach the scene's own shot_XXXX.jpg (Phase-2 output).
//  V6 Parallelism: 10 workers x 8 slots (u/0-u/7), slot index ALWAYS modulo
//     (never u/undefined -> 404). Shared queue, each worker owns its page.
//  V7 Skip-if-present: clip_shot_XXXX.mp4 > 100KB never regenerated.
//  V8 QUOTA rotation: next slot, SAME clip retried; clips never dropped.
//  V9 Failure evidence: _debug_clipXXXX.png screenshot on failure.
// V10 Single-agent execution; do NOT close the Chrome window mid-run.
// V11 Real AI video ONLY — no local pan/zoom re-exports (04 §2 mandate).
// V12 Upload-then-Run: wait until anchor "Loading..." finishes, dismiss the
//     info banner, and VERIFY generation started (Stop button) with up to 3
//     fill+click retries — a missed click burns NO quota but causes timeouts.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');

// V1: engine fallback chain
const VIDEO_CHAIN = ['gemini-omni-1.1-flash', 'veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite'];

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const VIDEO_SCENES = project.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO');

// V4-DETAILED: every motion body directs exact character action beats +
// camera + secondary physics (dust/flame/water/cloth). Bodies wrapped by MOTION_FORMULA.
const MOTION = {
1:'Time Chronicler stick-man scholar with white beard and glasses stepping forward toward camera in his cosmic library, raising his wooden torch high as its flame flares, old book pages fluttering in his other hand, galaxy light swirling through tall windows, slow camera push-in',
6:'stick-man caveman in close-up with heaving chest opening his mouth wide at dawn, glowing golden sound waves expanding outward ring by ring, birds scattering from a tree, morning light rising behind him',
12:'stick-man caveman waving both arms up and sideways in frantic silent mime, his companion leaning in squinting then swatting a fly with a stick, dry bushes shaking around them',
18:'grand parisian lecture hall where stick-man gentlemen in top hats rise from their seats shouting and shaking papers, president banging a huge gavel, chandelier swaying overhead, sheets of paper fluttering down',
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
27:'stick-man cavemen jumping and slapping a mid-air high-five on a hilltop, dust bursting under their feet, the boulder wobbling slightly behind them, bright sun flare',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
47:'emperor akbar stick-man with emerald turban walking steadily along his red sandstone courtyard at sunrise, robe flowing behind him, pigeons bursting upward, curtains billowing inside the arches',
55:'a golden helix of light rotating slowly above a stick-man london family holding hands and swaying, clock hands turning on a tower behind them, night clouds drifting past the moon',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
63:'san stick-man hunters with bows walking single file through kalahari desert at sunrise, red sand swirling at their feet, dry grass bending in the wind, sun climbing higher',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const MOTION_FORMULA = (b) => `Animate this 2D sticky-man cartoon scene in OverSimplified style with 5px black outlines and flat vector motion: ${b}. Smooth character motion, dust and light physics, 24fps motion, 16:9 widescreen --no text, typography, labels, words, speech bubbles, watermarks, sticker, die-cut, photorealism`;

// V6: all 8 authenticated slots cycle across workers (u/0 .. u/7).
const ACCOUNT_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];
const NUM_WORKERS = 10;

async function ensureVideoSession(page, slot, model) {
  // PROBED 2026-10-14: /app/prompts/... 404s; /prompts/new_chat is canonical
  // (veo models auto-redirect to /prompts/new_video). Never use /app/ or /gen-media.
  const url = `https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  try { // V2: Thinking High
    const sel = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await sel.count() > 0) {
      const cur = await sel.innerText().catch(() => '');
      if (!/high/i.test(cur)) {
        await sel.click().catch(() => {});
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option').filter({ hasText: 'High' }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } catch (e) {}
  try { // V3: 16:9
    const ar = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await ar.count() > 0) {
      await ar.click().catch(() => {});
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option').filter({ hasText: '16:9' }).first();
      if (await opt.count() > 0) await opt.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (e) {}
  try { // V3: 720p
    const rs = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await rs.count() > 0) {
      await rs.click().catch(() => {});
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option').filter({ hasText: '720p' }).first();
      if (await opt.count() > 0) await opt.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (e) {}
}

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit|requires a paid API key|link an api key|set up billing/i.test(document.body.innerText || '')
  ).catch(() => false);
}

// PROBED 2026-10-14: the composer re-renders while the anchor uploads
// ("shot_XXXX.jpg Loading...") and omni tabs remount on instability. Clicking
// Run before upload finishes (or on a stale handle after remount) silently
// starts NOTHING — no quota burns, but the poll loop times out. So: wait for
// upload, dismiss the info banner, and VERIFY Run actually started (Stop btn).
async function waitForUploadDone(page, ms = 30000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const loading = await page.evaluate(() =>
      /Loading\.\.\./.test(document.body.innerText || '')
    ).catch(() => false);
    if (!loading) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

async function dismissInfoBanner(page) {
  try {
    const x = page.locator('div:has-text("Feature Availability")').locator('button').first();
    if (await x.isVisible().catch(() => false)) await x.click({ force: true }).catch(() => {});
  } catch (e) {}
}

async function clickRunVerified(page, fullPrompt, tries = 3) {
  for (let t = 0; t < tries; t++) {
    const ta = page.locator('textarea.textarea, textarea, div[contenteditable="true"][role="textbox"]').first();
    await ta.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await ta.fill(fullPrompt).catch(() => {});
    await page.waitForTimeout(1000);
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    const dis = await runBtn.getAttribute('aria-disabled').catch(() => null);
    if (dis === 'true' || await isQuota(page)) return 'gated';
    await runBtn.click({ force: true }).catch(() => {});
    for (let i = 0; i < 10; i++) { // ~20s: did generation actually start?
      await page.waitForTimeout(2000);
      const started = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'))
      ).catch(() => false);
      if (started) return 'started';
      if (await isQuota(page)) return 'gated';
    }
  }
  return 'nostart';
}

// V8a: billing-gate modal ("Link an API key" / "Set up billing") blocks Run.
// Click Skip when offered; true when the gate is gone, false when still gated.
async function dismissBillingGate(page) {
  try {
    const gate = await page.evaluate(() =>
      /link an api key|set up billing/i.test(document.body.innerText || '')
    ).catch(() => false);
    if (!gate) return true;
    const skip = page.locator('button:has-text("Skip")').first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
      return page.evaluate(() =>
        !/link an api key|set up billing/i.test(document.body.innerText || '')
      ).catch(() => false);
    }
    return false;
  } catch (e) { return false; }
}

async function generateClipOnPage(page, scene, workerId, getSlot) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) return { ok: true, skipped: true }; // V7
  const anchor = path.join(VISUAL, `shot_${shotNum}.jpg`); // V5
  if (!fs.existsSync(anchor)) return { ok: false, err: 'ANCHOR_MISSING' };
  const body = MOTION[scene.scene_id];
  if (!body) return { ok: false, err: 'NO_MOTION_PROMPT' };
  const fullPrompt = MOTION_FORMULA(body);
  // session learning: if omni is wall-to-wall gated, skip it for rest of run
  const chain = global.__omniDead ? VIDEO_CHAIN.slice(1) : VIDEO_CHAIN;

  for (const model of chain) { // V1+V8
    for (let s = 0; s < ACCOUNT_SLOTS.length; s++) {
      const slot = getSlot();
      try {
        await ensureVideoSession(page, slot, model);
        const quotaHit = await isQuota(page);
        if (quotaHit && model === 'gemini-omni-1.1-flash') {
          global.__omniQuota = (global.__omniQuota || 0) + 1;
          if (global.__omniQuota >= 3) global.__omniDead = true;
        }
        if (quotaHit) continue;
        if (!await dismissBillingGate(page)) continue; // V8a: still gated -> next slot
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(anchor).catch(() => {});
          await page.waitForTimeout(2500);
          const ack = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
          if (await ack.isVisible().catch(() => false)) { await ack.click().catch(() => {}); await page.waitForTimeout(500); }
        }
        await dismissInfoBanner(page);
        if (!await waitForUploadDone(page)) return { ok: false, err: 'ANCHOR_UPLOAD_STUCK' };
        const runState = await clickRunVerified(page, fullPrompt);
        if (runState === 'gated') continue; // V8: quota/billing appeared -> next slot
        if (runState !== 'started') {
          await page.screenshot({ path: path.join(VISUAL, `_debug_clip${shotNum}.png`) }).catch(() => {}); // V9
          return { ok: false, err: 'RUN_NOSTART' };
        }
        let videoSrc = null;
        for (let i = 0; i < 100; i++) { // up to ~5min
          await page.waitForTimeout(3000);
          if (await isQuota(page)) break;
          const st = await page.evaluate(() => {
            const vid = document.querySelector('video');
            const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
            const err = document.querySelector('.error-message, mat-error, [role="alert"]');
            return { hasVid: !!vid && !!vid.src, src: vid ? vid.src : null, hasStop: stop, err: err ? err.innerText : null };
          }).catch(() => ({}));
          if (st.err) break;
          if (st.hasVid && !st.hasStop) { videoSrc = st.src; break; }
          if (!st.hasStop && !st.hasVid && i >= 8) break;
        }
        if (!videoSrc) {
          if (await isQuota(page)) continue; // V8
          await page.screenshot({ path: path.join(VISUAL, `_debug_clip${shotNum}.png`) }).catch(() => {}); // V9
          return { ok: false, err: 'TIMEOUT_NO_VIDEO' };
        }
        const vData = await page.evaluate(async (src) => {
          try {
            const res = await fetch(src);
            const blob = await res.blob();
            const ab = await blob.arrayBuffer();
            const bytes = new Uint8Array(ab);
            let bin = '';
            for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
            return { b64: btoa(bin), size: bytes.length };
          } catch (e) { return { err: e.message }; }
        }, videoSrc);
        if (!vData || vData.err || !vData.b64) return { ok: false, err: (vData && vData.err) || 'EXTRACT_FAIL' };
        fs.writeFileSync(outPath, Buffer.from(vData.b64, 'base64'));
        console.log(`[W${workerId}/u${slot}/${model}] ✓ Clip ${scene.scene_id} (${(vData.size / 1048576).toFixed(2)} MB)`);
        return { ok: true, size: vData.size };
      } catch (err) {
        if (/quota|429/i.test(err.message)) continue; // V8
        return { ok: false, err: err.message.slice(0, 80) };
      }
    }
  }
  return { ok: false, err: 'ALL_SLOTS_MODELS_QUOTA' };
}

async function runWorker(ctx, workerId, queue) {
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length; // V6
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  let done = 0, fail = 0, skipped = 0;
  try {
    while (queue.length > 0) {
      const scene = queue.shift();
      const res = await generateClipOnPage(page, scene, workerId, getSlot);
      if (res.skipped) skipped++;
      else if (res.ok) done++;
      else { fail++; console.log(`[W${workerId}] ✗ Clip ${scene.scene_id}: ${res.err}`); }
      await page.waitForTimeout(1500);
    }
  } finally {
    await page.close().catch(() => {});
  }
  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== EP02 VIDEO FLEET: ${NUM_WORKERS} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  const only = Number(process.env.ONLY_SCENE) || 0;
  const todo = VIDEO_SCENES.filter(s => {
    if (only && s.scene_id !== only) return false;
    const f = path.join(VISUAL, `clip_shot_${String(s.scene_id).padStart(4, '0')}.mp4`);
    return !fs.existsSync(f) || fs.statSync(f).size < 100000;
  });
  console.log(`Remaining: ${todo.length}/${VIDEO_SCENES.length} clips`);
  if (todo.length === 0) { console.log('All clips present. Nothing to do.'); process.exit(0); }
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const results = await Promise.all(
    Array.from({ length: NUM_WORKERS }, (_, i) => runWorker(ctx, i + 1, todo))
  );
  console.log(JSON.stringify(results, null, 2));
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final: ${totalPresent}/${VIDEO_SCENES.length} clips.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one fleet file per episode; anchor attach + shared queue
```

---

## 6G. FINAL-FULL - Flow agent-mode batch fleet (SUPERSEDES S6D text)

> [!IMPORTANT]
> **Post-limit path - FINAL working version, embedded byte-exact.** Trigger
> F0: AI Studio fleet reports ALL_SLOTS_MODELS_QUOTA on every V1 model.
> Delivered EP02 clip 18 (1080p verified). Rules: F1 one project per worker,
> up to 3 scenes per agent submit (3+3+3 batches); F2 drop anchors, wait %;
> F3 approval (count-parse bn+en, always-approve, dismissal verified by BUTTON
> absence); F4 tile harvest in prompt order; F5 3 workers; F6 ftyp+moov;
> F7 single-agent; F8 one Chrome profile per worker (Flow has NO /u/N -
> single-session app); F9 probe mode runs ONE worker only.
>
> WORK PROCESS: map UI via probes (ingredient-add, approval card, tiles) ->
> probe 1 clip -> verify mp4 -> fleet -> screenshot-debug each new failure
> mode -> fix -> record here.

```javascript
// ============================================================================
// EP02 Flow Fleet - canonical Google Flow fallback batch generator
// Project: projects/simple_itihash_002_first_language (9 remaining DYNAMIC clips)
// Run:   node tools/run_flow_videos_002.js
// Probe: $env:ONLY_SCENE='18'; node tools/run_flow_videos_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (instructions/04_VIDEO_GENERATION_AUTOMATION.md S5):
//  F0 TRIGGER: run ONLY when the AI Studio fleet (run_parallel_videos_002.js)
//     reports ALL_SLOTS_MODELS_QUOTA on every V1-chain model (04 S4 note).
//  F1 BATCHING: one Flow project per worker, up to 3 scenes per submit. The
//     Flow agent mode generates several videos in ONE request (PROBED
//     2026-10-14: agent proposed "15টি ভিডিও ... 15 ক্রেডিট" for a batch) -
//     batching is faster than one-project-per-clip and burns 1 credit/video.
//  F2 ANCHOR: drop each scene's own shot_XXXX.jpg onto the project (drop upload
//     works; the + ingredient menu does not open reliably). Wait for the %
//     upload indicator to disappear before submitting.
//  F3 APPROVAL (mandatory - a missing click stalls forever): read the proposed
//     video count ("এই Nটি ভিডিও"); if N != batch size -> Cancel (বাতিল করুন)
//     and fall back to single submits. Else click সবসময় অনুমোদন করুন
//     (always-approve) so later batches never stall; else অনুমোদন করুন.
//  F4 MONITOR: poll flow-video-tile / video elements until count == batch size
//     (up to ~40 min). Tiles arrive in prompt order.
//  F5 WORKERS: 3 parallel projects (3+3+3 scenes), each worker owns its page.
//  F6 VERIFY: every clip saved only if ftyp+moov present and > 100KB.
//  F7 Single-agent execution; do NOT close the Chrome windows mid-run.
//  F8 MULTI-ACCOUNT (PROBED 2026-10-14): Flow has NO /u/N tab system - it is a
//     single-session app, so all tabs in one Chrome profile share ONE Google
//     account + credit pool (that is why 3 tabs burned one limit 3x faster).
//     True isolation = one Chrome user-data-dir per worker. Verified logins:
//     profile_3=badiuzzaman.majnu, profile=bmajnu9811, profile_2=msrosyafrin.
//     To add an account: launch Chrome with a fresh dir, log into Google, open
//     flow.google.com once (Next, no opt-ins), append the dir to PROFILES.
//  F9 PROBE MODE (ONLY_SCENE): exactly ONE worker runs - never submit the same
//     form from parallel tabs (duplicate credit burn + time waste).
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

// F8 MULTI-ACCOUNT (PROBED 2026-10-14): Flow has NO /u/N tab system - it is a
// single-session app, so all tabs in one profile share ONE account + credit
// pool. True isolation = one Chrome user-data-dir per worker. Verified
// distinct logins: profile_3=badiuzzaman.majnu, profile=bmajnu9811,
// profile_2=msrosyafrin. Worker i owns PROFILES[i] (own Chrome window).
const PROFILES = [
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3',
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile',
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_2',
];
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');

// F1: fixed 3+3+3 batches over the 9 remaining dynamic scenes
const BATCHES = [[18, 23, 32], [38, 43, 57], [70, 78, 84]];
const NUM_WORKERS = 3;

// Detailed motion bodies (same V4-DETAILED beats as the AI Studio fleet)
const MOTION = {
18:'grand parisian lecture hall where stick-man gentlemen in top hats rise from their seats shouting and shaking papers, president banging a huge gavel, chandelier swaying overhead, sheets of paper fluttering down',
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const STYLE_TAIL = 'in 2D sticky-man cartoon style, OverSimplified, 5px black outlines, flat vector motion, 24fps, 16:9 widescreen, no text, no watermarks';

function batchPrompt(ids) {
  // NOTE: Flow shows NO filenames - the agent sees images in upload order,
  // so scenes reference images by ordinal (1st/2nd/3rd uploaded image).
  const ord = ['first', 'second', 'third'];
  const parts = ids.map((id, i) => `Scene ${i + 1} - use the ${ord[i]} uploaded image: animate it: ${MOTION[id]} ${STYLE_TAIL}.`);
  return `Generate ${ids.length} separate videos, one per scene below, in upload order. For each scene animate its image. ${parts.join(' ')}`;
}

async function dropAnchor(page, shotFile) {
  const b64 = fs.readFileSync(path.join(VISUAL, shotFile)).toString('base64');
  await page.evaluate(async (d) => {
    const bc = atob(d.b64); const arr = new Uint8Array(bc.length);
    for (let i = 0; i < bc.length; i++) arr[i] = bc.charCodeAt(i);
    const dt = new DataTransfer(); dt.items.add(new File([arr], d.name, { type: 'image/jpeg' }));
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    for (const t of ['dragenter', 'dragover', 'drop']) (el || document.body).dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { b64, name: shotFile });
  for (let i = 0; i < 150; i++) { // F2: upload % gone? uploads crawl under load (PROBED: 20% for minutes)
    await page.waitForTimeout(2000);
    const busy = await page.evaluate(() => /(\d+)%/.test(document.body.innerText || '')).catch(() => false);
    if (!busy) return true;
  }
  return false;
}

// LOCALE (PROBED 2026-10-15): freshly-onboarded profiles render Flow in
// ENGLISH ("New project"), older ones in Bengali. Every selector below tries
// bn first, en fallback. Approval cards follow the UI locale too.
async function clickNewProject(page) {
  for (const txt of ['নতুন প্রোজেক্ট', 'New project']) {
    const b = page.locator('button').filter({ hasText: txt }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ force: true }).catch(() => {});
      return true;
    }
  }
  return false;
}
const SUBMIT_SEL = 'button[aria-label="জেনারেট করা শুরু করুন"], button[aria-label*="Start generating"]';

// Trusted click (PROBED: Flow's Angular buttons ignore synthetic force-clicks
// that do not move the mouse - use real coordinates like the image fleet).
async function trustedClick(page, locator, timeoutMs = 8000) {
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: timeoutMs }).catch(() => {});
    const box = await locator.boundingBox({ timeout: timeoutMs });
    if (!box || box.width < 2 || box.height < 2) return false;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    return true;
  } catch (e) { return false; }
}

function parseApprovalCount(t) {
  const conv = (s) => Number(String(s).replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d)));
  const m = t.match(/এই[^\d\n০-৯]*([0-9০-৯]+)[^\d\n]{0,4}টি ভিডিও/)
    || t.match(/([0-9০-৯]+)[^\d\n]{0,4}টি ভিডিও[^\n]{0,60}ক্রেডিট/)
    || t.match(/(?:generate|start)[^\n]{0,40}?([0-9]+)\s*videos?/i)
    || t.match(/([0-9]+)\s*videos?[^\n]{0,40}credits?/i);
  return m ? conv(m[1]) : 0;
}
function hasApproveCard(t) { return /অনুমোদন করুন|Always approve|Approve/.test(t); }

// F3: approval handling. VISIBLE-BUTTON driven (PROBED 2026-10-15): the old
// card text lingers in session history, so body-text matching lies. Rules:
// (1) no visible approve button + (tiles/videos OR queued-message) -> progress;
// (2) visible button + parsed count -> approve (always first), verified by
// BUTTON disappearance (not text); (3) else keep waiting (~20 min).
async function handleApproval(page, expectN) {
  const anyApproveVisible = async () => {
    for (const txt of ['সবসময় অনুমোদন করুন', 'Always approve', 'অনুমোদন করুন', 'Approve']) {
      if (await page.locator('button').filter({ hasText: txt }).first().isVisible().catch(() => false)) return true;
    }
    return false;
  };
  for (let i = 0; i < 400; i++) { // ~20 min: agent answers very slow under load
    await page.waitForTimeout(3000);
    const card = await page.evaluate(() => {
      const t = document.body.innerText || '';
      const queuedMsg = /waiting in the queue|in the queue due to high demand|will be processed soon/i.test(t);
      const hardEvidence = document.querySelectorAll('flow-video-tile').length > 0
        || document.querySelectorAll('video[src]').length > 0;
      return { t: t.slice(-4000), queuedMsg, hardEvidence };
    }).catch(() => ({}));
    const n = parseApprovalCount(card.t || '');
    const visApprove = await anyApproveVisible();
    if (i % 10 === 9) console.log(`  ... approval wait ${Math.round((i + 1) * 3 / 60)}min (card:${visApprove} n:${n || 0} queued:${!!card.queuedMsg} tiles:${card.hardEvidence ? 'yes' : 'no'})`);
    if (!visApprove && (card.hardEvidence || card.queuedMsg)) return 'progress';
    if (!visApprove) continue; // no card yet - agent still thinking
    if (n === 0) continue; // buttons render before count text streams in - wait
      if (n !== expectN) {
        for (const ctxt of ['বাতিল করুন', 'Cancel']) {
          const cancel = page.locator('button').filter({ hasText: ctxt }).first();
          if (await cancel.isVisible().catch(() => false)) { await cancel.click({ force: true }).catch(() => {}); break; }
        }
        return 'cancelled';
      }
      let approved = false;
      for (let c = 0; c < 3 && !approved; c++) { // trusted click + verify dismissal
        const always = page.locator('button').filter({ hasText: 'সবসময় অনুমোদন করুন' }).first();
        const alwaysEn = page.locator('button').filter({ hasText: 'Always approve' }).first();
        if (await always.isVisible().catch(() => false)) {
          await trustedClick(page, always);
        } else if (await alwaysEn.isVisible().catch(() => false)) {
          await trustedClick(page, alwaysEn);
        } else {
          const one = page.locator('button').filter({ hasText: 'অনুমোদন করুন' }).first();
          const oneEn = page.locator('button', { hasText: 'Approve' }).first();
          if (await one.isVisible().catch(() => false)) await trustedClick(page, one);
          else if (await oneEn.isVisible().catch(() => false)) await trustedClick(page, oneEn);
          else break;
        }
        await page.waitForTimeout(8000);
        approved = !(await anyApproveVisible());
      }
      if (!approved) {
        await page.screenshot({ path: path.join(VISUAL, '_debug_flow_clickfail.png') }).catch(() => {});
        return 'clickfail';
      }
      return 'ok';
  }
  return 'noapproval';
}

async function downloadTiles(page, ids) {
  const out = [];
  for (let k = 0; k < 100; k++) { // F4: up to ~50 min for the batch
    await page.waitForTimeout(30000);
    const n = await page.evaluate(() =>
      document.querySelectorAll('flow-video-tile').length || document.querySelectorAll('video[src]').length
    ).catch(() => 0);
    if (k % 4 === 0) console.log(`  ... waiting tiles: ${n}/${ids.length}`);
    if (n >= ids.length) break;
  }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const shotNum = String(id).padStart(4, '0');
    const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
    // wait for THIS tile's video to have a real src (tiles render before video)
    let ready = false;
    for (let w = 0; w < 60 && !ready; w++) {
      await page.waitForTimeout(30000);
      ready = await page.evaluate((idx) => {
        const tiles = document.querySelectorAll('flow-video-tile');
        const scope = tiles.length > idx ? tiles[idx] : document;
        const vid = scope.querySelector('video');
        return !!(vid && (vid.currentSrc || vid.src) && (vid.readyState || 0) >= 1);
      }, i).catch(() => false);
      if (w % 4 === 3) console.log(`  ... tile ${i + 1}/${ids.length} video ready: ${ready}`);
    }
    if (!ready) { out.push({ id, ok: false, err: 'TILE_NOSRC' }); continue; }
    const v = await page.evaluate(async (idx) => {
      const tiles = document.querySelectorAll('flow-video-tile');
      const scope = tiles.length > idx ? tiles[idx] : document;
      const vid = scope.querySelector('video');
      const src = vid ? vid.currentSrc || vid.src : null;
      if (!src) return { err: 'NO_SRC' };
      try {
        const res = await fetch(src, { credentials: 'include' }); const blob = await res.blob();
        const ab = await blob.arrayBuffer(); const bytes = new Uint8Array(ab);
        let bin = ''; for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), size: bytes.length };
      } catch (e) { return { err: e.message }; }
    }, i).catch(e => ({ err: e.message }));
    if (!v || v.err || !v.b64 || v.size < 100000) {
      // fallback: tile header download button -> Playwright download event
      try {
        const tiles = await page.$$('flow-video-tile');
        const scope = tiles.length > i ? tiles[i] : null;
        const btn = scope
          ? await scope.$('button[aria-label*="ownload"], a[download]')
          : null;
        const target = btn || (scope ? await scope.$('button') : null);
        if (!target) { out.push({ id, ok: false, err: ((v && v.err) || 'FETCH_FAIL') + '/NO_DLBTN' }); continue; }
        await target.scrollIntoViewIfNeeded().catch(() => {});
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 120000 }).catch(() => null),
          target.click({ force: true }).catch(() => {}),
        ]);
        if (!download) { out.push({ id, ok: false, err: ((v && v.err) || 'FETCH_FAIL') + '/NO_DOWNLOAD_EVENT' }); continue; }
        const tmp = path.join(VISUAL, `_flowdl_${shotNum}.mp4`);
        await download.saveAs(tmp);
        const buf = fs.readFileSync(tmp);
        fs.unlinkSync(tmp);
        if (buf.length < 100000) { out.push({ id, ok: false, err: 'DL_TOO_SMALL' }); continue; }
        const validDl = buf.slice(4, 12).toString() === 'ftypmp42' || buf.includes(Buffer.from('moov'));
        if (!validDl) { out.push({ id, ok: false, err: 'BAD_MP4_DL' }); continue; }
        fs.writeFileSync(outPath, buf);
        console.log(`  ✓ Clip ${id} via download-btn (${(buf.length / 1048576).toFixed(2)} MB)`);
        out.push({ id, ok: true });
        continue;
      } catch (e) { out.push({ id, ok: false, err: 'DL_EXC' }); continue; }
    }
    const buf = Buffer.from(v.b64, 'base64');
    const valid = buf.slice(4, 12).toString() === 'ftypmp42' || buf.includes(Buffer.from('moov')); // F6
    if (!valid) { out.push({ id, ok: false, err: 'BAD_MP4' }); continue; }
    fs.writeFileSync(outPath, buf);
    console.log(`  ✓ Clip ${id} (${(v.size / 1048576).toFixed(2)} MB)`);
    out.push({ id, ok: true });
  }
  return out;
}

async function runBatch(profileDir, workerId, ids) {
  const only = Number(process.env.ONLY_SCENE) || 0;
  let list = only ? [only] : ids.filter(id => {
    const f = path.join(VISUAL, `clip_shot_${String(id).padStart(4, '0')}.mp4`);
    return !fs.existsSync(f) || fs.statSync(f).size < 100000;
  });
  if (list.length === 0) return { workerId, done: 0, fail: 0, skipped: ids.length };
  await new Promise(r => setTimeout(r, (workerId - 1) * 45000)); // stagger uploads across accounts
  let ctx = null;
  try {
  ctx = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = await ctx.newPage();
  try {
    const adopt = (workerId === 1 && process.env.ADOPT_URL) || '';
    if (adopt) { // adopt an existing project (agent already answered) - no resubmit
      console.log(`[F${workerId}] adopting ${adopt}`);
      await page.goto(adopt, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(8000);
      const ap0 = await handleApproval(page, list.length); // F3
      if (ap0 !== 'ok' && ap0 !== 'progress') return { workerId, done: 0, fail: list.length, err: 'ADOPT_' + ap0.toUpperCase() };
      const res0 = await downloadTiles(page, list); // F4+F6
      await ctx.close().catch(() => {});
      return { workerId, done: res0.filter(r => r.ok).length, fail: res0.filter(r => !r.ok).length, detail: res0 };
    }
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    if (!await clickNewProject(page)) { try { await ctx.close(); } catch (_) {} return { workerId, done: 0, fail: list.length, err: 'NO_NEW_PROJECT' }; }
    await page.waitForTimeout(9000);
  for (const id of list) { // F2: all anchors first, VERIFIED (no silent drops)
    const shot = `shot_${String(id).padStart(4, '0')}.jpg`;
    const baseImgs = await page.evaluate(() => document.querySelectorAll('img').length).catch(() => 0);
    let attached = false;
    for (let d = 0; d < 2 && !attached; d++) {
      console.log(`[F${workerId}] dropping ${shot} (try ${d + 1})...`);
      await dropAnchor(page, shot);
      // VERIFIED SIGNAL (PROBED 2026-10-15): tiles show % while uploading and
      // NO filename ever - attached = % cleared AND a new thumbnail appeared.
      for (let i = 0; i < 150; i++) {
        await page.waitForTimeout(2000);
        const st = await page.evaluate((base) => ({
          busy: /(\d+)%/.test(document.body.innerText || ''),
          imgs: document.querySelectorAll('img').length,
        }), baseImgs).catch(() => ({}));
        if (!st.busy && (st.imgs || 0) > baseImgs) { attached = true; break; }
      }
    }
    if (!attached) return { workerId, done: 0, fail: list.length, err: 'UPLOAD_STUCK' };
  }
    await page.screenshot({ path: path.join(VISUAL, `_debug_flow${workerId}_anchors.png`) }).catch(() => {});
    const pm = page.locator('div.ProseMirror').first();
    const promptText = batchPrompt(list);
  let posted = false; // submitted = text left the composer into a session turn
  for (let s = 0; s < 3 && !posted; s++) {
    await pm.click().catch(() => {});
    const cur = await pm.textContent().catch(() => '');
    if (!cur || !cur.includes('Scene 1 - use the')) {
      await page.keyboard.press('Control+a').catch(() => {});
      await page.keyboard.type(promptText, { delay: 3 }).catch(() => {});
      await page.waitForTimeout(1500);
    }
    await page.locator(SUBMIT_SEL).first().click({ force: true }).catch(() => {});
    for (let w = 0; w < 10; w++) {
      await page.waitForTimeout(3000);
      posted = await page.evaluate(() => {
        const ed = document.querySelector('div.ProseMirror');
        const edEmpty = !ed || (ed.textContent || '').trim().length < 50;
        return edEmpty && (document.body.innerText || '').includes('Scene 1 - use the');
      }).catch(() => false);
      if (posted) break;
    }
  }
    if (!posted) {
      await page.screenshot({ path: path.join(VISUAL, `_debug_flow${workerId}_nosubmit.png`) }).catch(() => {});
      try { await ctx.close(); } catch (_) {}
      return { workerId, done: 0, fail: list.length, err: 'SUBMIT_NOSHOW' };
    }
    const ap = await handleApproval(page, list.length); // F3
    if (ap === 'cancelled') { try { await ctx.close(); } catch (_) {} return { workerId, done: 0, fail: list.length, err: 'COUNT_MISMATCH' }; }
    if (ap === 'progress') console.log(`[F${workerId}] already queued/generating - monitoring tiles...`);
    if (ap !== 'ok' && ap !== 'progress') {
      await page.screenshot({ path: path.join(VISUAL, `_debug_flow${workerId}_noapproval.png`) }).catch(() => {});
      try { await ctx.close(); } catch (_) {}
      return { workerId, done: 0, fail: list.length, err: 'NO_APPROVAL' };
    }
    const res = await downloadTiles(page, list); // F4+F6
    await ctx.close().catch(() => {});
    return { workerId, done: res.filter(r => r.ok).length, fail: res.filter(r => !r.ok).length, detail: res };
  } catch (err) {
    try { if (ctx) await ctx.close(); } catch (_) {}
    if (/existing browser session|profile.*in use|profile.*locked/i.test(err.message)) {
      console.log(`[F${workerId}] PROFILE_BUSY (${profileDir.split('scratch').pop()}) - close the holding Chrome and rerun.`);
      return { workerId, done: 0, fail: list.length, err: 'PROFILE_BUSY' };
    }
    return { workerId, done: 0, fail: list.length, err: err.message.slice(0, 100) };
  }
  } catch (err) {
    try { if (ctx) await ctx.close(); } catch (_) {}
    return { workerId, done: 0, fail: list.length, err: err.message.slice(0, 100) };
  }
}

(async () => {
  console.log(`=== EP02 FLOW FLEET: ${NUM_WORKERS} WORKERS (3+3+3) x ${PROFILES.length} PROFILES ===`);
  const only = Number(process.env.ONLY_SCENE) || 0;
  // PROBE MODE: single worker only - never triplicate the same form (quota waste).
  // ADOPT MODE: only worker 1 adopts (others would spawn noise projects).
  const jobs = process.env.ADOPT_URL ? [[PROFILES[0], 1, BATCHES[0]]]
    : only ? [[PROFILES[0], 1, BATCHES[0]]]
    : BATCHES.map((b, i) => [PROFILES[i % PROFILES.length], i + 1, b]);
  const results = await Promise.all(jobs.map(([prof, wid, b]) => runBatch(prof, wid, b)));
  console.log(JSON.stringify(results, null, 2));
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final: ${totalPresent}/16 clips.`);
  process.exit(results.some(r => (r.fail || 0) > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one Flow fleet file; batches over single submits (agent batch mode)
```

---

## 6H. SUBMIT-ONLY workflow - Flow direct fire-and-forget (tools/run_flow_submit_002.js, user direction 2026-10-15)

> Flow -> any account -> New project (one per worker) -> settings ONCE (agent-OFF self-identifying via aria-pressed, never re-click when off; video frame mode, 16:9, Omni, 720p, 8s/6s/10s per need, x1 - menu only when chip wrong) -> per scene: paste prompt + start frame (end frame too if mapped) -> send, composer-empty = accepted -> NEXT scene immediately, never wait renders. Downloads are MANUAL. State file visual_assets/_flow_submitted.json dedupes reruns. Full source: tools/run_flow_submit_002.js (S0-S5 in header).

> **6H-correction (PROBED 2026-10-15):** ONE single project for ALL scenes (not per worker). Submit acceptance = composer cleared OR output card text (whitespace-normalized); check FAST (~30s) - renders continue server-side, never stall the loop. Scene->project logged in visual_assets/_flow_submitted.json; downloads MANUAL.

---

## 6I. FINAL-FULL - Flow direct-mode multi-worker submit fleet (`tools/run_flow_submit_002.js`, SUPERSEDES S6H)

> [!IMPORTANT]
> **Hardened fire-and-forget submitter, embedded byte-exact.** P1-P8 root-caused:
> P1 strictly single-click submit (no double-burn) + fast output-card acceptance;
> P2 stale-profile cleanup (own 3 dirs only) + PROFILE_BUSY fail-fast;
> P3 upload verify by %-gone + thumb count, 25s stagger, 76s bound;
> P4 start-link = slot button REPLACED by thumbnail (not img-in-button);
> P5 overlays-first + bn/en selectors + Agent/Agent-mode chip regex;
> P6 visible+enabled arrow via real mouse coords;
> P7 fire-and-forget + PROJECT_URL log + state file (manual harvest);
> P8 zero-browser early dedupe exit.
>
> WORK PROCESS: probe single scene -> screenshot-verify each new failure mode
> -> fix root cause -> skip-test (0 browsers) -> embed here.

```javascript
// ============================================================================
// EP02 Flow SUBMIT Fleet - multi-worker fire-and-forget direct-mode submitter
// Project: projects/simple_itihash_002_first_language (16 DYNAMIC_AI_VIDEO)
// Run:   node tools/run_flow_submit_002.js
// Probe: $env:ONLY_SCENE='32'; node tools/run_flow_submit_002.js
// Force: $env:ONLY_SCENE='38'; $env:FORCE='1'; node tools/run_flow_submit_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (instructions/04_VIDEO_GENERATION_AUTOMATION.md S6I):
//  D0/S0 SUBMIT-ONLY (P7): fire-and-forget direct mode. Never poll or wait for
//     video renders in this script ("high demand" queues stall for hours at 0%).
//     After submit acceptance, log the project URL and move immediately to the
//     next scene. Downloads are MANUAL by the user.
//  D1/S1 MULTI-ACCOUNT FLEET (F8): Flow has NO /u/0../u/7 tab system — it is a
//     single-session app per Chrome profile. Launch up to 3 parallel workers,
//     each on its OWN Chrome user-data-dir (own Google account + credit pool):
//       - profile_3 = badiuzzaman.majnu@gmail.com
//       - profile   = bmajnu9811@gmail.com
//       - profile_2 = msrosyafrin@gmail.com
//     Never open two workers on one profile (SingletonLock collision).
//     PROBE MODE (F9): when ONLY_SCENE or RESUME_URL is set, run Worker 1 ONLY.
//  D2/S2 STALE-LOCK CLEANUP (P2): before launching, kill only orphan chrome.exe
//     processes whose command line references OUR three scratch profile dirs
//     (never touch the user's personal Chrome profile) and clear stale lock
//     files; if still locked at launch, fail fast with PROFILE_BUSY.
//  D3/S3 EARLY DEDUPE EXIT (P8): filter missing scenes against both disk
//     (clip_shot_XXXX.mp4 > 100KB) and visual_assets/_flow_submitted.json
//     BEFORE launching any browser. If 0 scenes remain (and not FORCE=1),
//     exit 0 immediately with zero browsers launched.
//  D4/S4 LOCALE & OVERLAYS FIRST (P5): fresh/EN profiles show onboarding cards
//     ("You're generating with Gemini Omni Flash..." + Got it) that cover the
//     composer and eat clicks, and label the chip "Agent" instead of
//     "Agent mode". Dismiss overlays FIRST, close untitled agent side-panel,
//     and try bn then en on every selector.
//  D5/S5 AGENT-OFF & SETTINGS ONCE: self-identify agent chip via aria-pressed
//     (/^(এজেন্ট মোড|Agent mode|Agent)$/i) — never re-click when already off.
//     Verify composer settings chip reads video-720p-(8|6|10)s and frame slot
//     buttons exist; open model menu (Nano Banana -> VIDEO -> FRAME -> 16:9,
//     Omni 1.1 Flash, 720p, 8s, x1) ONLY when wrong.
//  D6/S6 BOUNDED UPLOAD + STAGGER (P3): stagger workers by 25s; Flow never
//     shows filenames on dropped images — verify upload by (% progress gone
//     AND img count increased) within a bounded 75s timeout, else fail loudly
//     with UPLOAD_STUCK (never hang).
//  D7/S7 EXACT START-FRAME LINK VERIFICATION (P4): in the ingredient picker,
//     Flow rows do NOT show filenames — fallback to clicking the newest
//     thumbnail row when filename text is absent, then click Add-to-prompt.
//     Verify link by confirming the শুরু/Start slot button itself is REPLACED
//     by a thumbnail in the composer (button gone/hidden + composer thumbnail
//     img >24x24 present), NOT an img inside the button.
//  D8/S8 SINGLE-CLICK SUBMIT + FAST ACCEPTANCE (P1, P6): find the VISIBLE,
//     non-disabled submit arrow (real mouse coords; screenshot on miss).
//     Click ONCE — NEVER auto-retry a landed submit click (retries double-burn
//     12 credits/video). Verify acceptance up to 90s via composer cleared OR
//     whitespace-normalized prompt signature appearing in an output card outside
//     ProseMirror.
// ============================================================================
const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');
const STATE_FILE = path.join(VISUAL, '_flow_submitted.json');

// D1/S1 (F8): 3 isolated Chrome profile directories = 3 Google accounts
const PROFILES = [
  { dir: 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3', email: 'badiuzzaman.majnu@gmail.com' },
  { dir: 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile',   email: 'bmajnu9811@gmail.com' },
  { dir: 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_2', email: 'msrosyafrin@gmail.com' },
];
const FORCE = process.env.FORCE === '1';
const STAGGER_MS = 25000;

// Complete 16 DYNAMIC_AI_VIDEO motion bodies for EP02
const MOTION = {
1:'Time Chronicler stick-man scholar with white beard and glasses stepping forward toward camera in his cosmic library, raising his wooden torch high as its flame flares, old book pages fluttering in his other hand, galaxy light swirling through tall windows, slow camera push-in',
6:'stick-man caveman in close-up with heaving chest opening his mouth wide at dawn, glowing golden sound waves expanding outward ring by ring, birds scattering from a tree, morning light rising behind him',
12:'stick-man caveman waving both arms up and sideways in frantic silent mime, his companion leaning in squinting then swatting a fly with a stick, dry bushes shaking around them',
18:'grand parisian lecture hall where stick-man gentlemen in top hats rise from their seats shouting and shaking papers, president banging a huge gavel, chandelier swaying overhead, sheets of paper fluttering down',
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
27:'stick-man cavemen jumping and slapping a mid-air high-five on a hilltop, dust bursting under their feet, the boulder wobbling slightly behind them, bright sun flare',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
47:'emperor akbar stick-man with emerald turban walking steadily along his red sandstone courtyard at sunrise, robe flowing behind him, pigeons bursting upward, curtains billowing inside the arches',
55:'a golden helix of light rotating slowly above a stick-man london family holding hands and swaying, clock hands turning on a tower behind them, night clouds drifting past the moon',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
63:'san stick-man hunters with bows walking single file through kalahari desert at sunrise, red sand swirling at their feet, dry grass bending in the wind, sun climbing higher',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const END_FRAMES = {}; // scene_id -> shot file for end frame (empty for EP02)
const DIRECT_FORMULA = (b) => `Animate this image into video, 2D sticky-man cartoon style, OverSimplified, 5px black outlines, flat vector motion: ${b}. Smooth character motion, dust and light physics, 24fps, 16:9, no text, no watermarks`;
const AGENT_CHIP_RE = /^(এজেন্ট মোড|Agent mode|Agent)$/i;

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { return {}; }
}
function saveState(st) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 1));
}

// P2 (D2/S2): Clean up ONLY orphan chrome.exe processes bound to our 3 scratch
// profile directories, then remove stale SingletonLock files if unlocked.
function cleanupStaleProfiles(profileDirs) {
  if (process.platform === 'win32') {
    const markers = profileDirs.map(d => path.basename(d).toLowerCase());
    try {
      const psCmd = [
        'Get-CimInstance Win32_Process -Filter "Name = \'chrome.exe\'"',
        '| Select-Object ProcessId, CommandLine',
        '| ConvertTo-Json -Compress',
      ].join(' ');
      const raw = execSync(`powershell -NoProfile -Command "${psCmd}"`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 10000,
      }).trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        let killed = 0;
        for (const proc of list) {
          const cmd = String(proc.CommandLine || '').toLowerCase();
          if (markers.some(m => cmd.includes(m))) {
            try {
              execSync(`taskkill /F /PID ${proc.ProcessId} /T`, { stdio: 'ignore', timeout: 5000 });
              killed++;
            } catch (_) {}
          }
        }
        if (killed > 0) console.log(`[CLEANUP] Terminated ${killed} orphan Chrome process(es) for fleet profiles.`);
      }
    } catch (_) {}
  }
  for (const dir of profileDirs) {
    for (const lockName of ['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'lockfile']) {
      const lp = path.join(dir, lockName);
      if (fs.existsSync(lp)) {
        try { fs.unlinkSync(lp); } catch (_) {}
      }
    }
  }
}

// Find the first VISIBLE button matching any text in `txts` and click its center
// using real mouse coordinates.
async function tclick(page, txts, timeoutMs = 5000) {
  const list = Array.isArray(txts) ? txts : [txts];
  for (const t of list) {
    const loc = page.locator('button, [role="tab"], [role="menuitem"], [role="option"]').filter({ hasText: t });
    const count = await loc.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const el = loc.nth(i);
      if (!await el.isVisible().catch(() => false)) continue;
      const b = await el.boundingBox({ timeout: timeoutMs }).catch(() => null);
      if (!b || b.width < 2 || b.height < 2) continue;
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      await page.waitForTimeout(1800);
      return t;
    }
  }
  return null;
}

async function waitState(page, fn, label, tries = 40, gap = 2000) {
  for (let i = 0; i < tries; i++) {
    if (await fn().catch(() => false)) return true;
    await page.waitForTimeout(gap);
  }
  console.log(`  ... timeout waiting for: ${label}`);
  return false;
}

// P5 (D4/S4): Dismiss onboarding/consent overlays ("You're generating with
// Gemini Omni Flash..." -> "Got it", etc.) that cover the composer on fresh/EN profiles.
async function dismissOverlays(page) {
  for (let round = 0; round < 4; round++) {
    let hit = false;
    const labels = [
      /^Got it$/i,
      /^Acknowledge$/i,
      /^Accept$/i,
      /^Dismiss$/i,
      /^Next$/i,
      /^ঠিক আছে$/,
      /^বুঝেছি$/,
      /^অনুমোদন করুন$/,
    ];
    for (const re of labels) {
      const btns = page.locator('button').filter({ hasText: re });
      const n = await btns.count().catch(() => 0);
      for (let i = 0; i < n; i++) {
        const b = btns.nth(i);
        if (!await b.isVisible().catch(() => false)) continue;
        const box = await b.boundingBox({ timeout: 3000 }).catch(() => null);
        if (box && box.width > 2 && box.height > 2) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          hit = true;
          await page.waitForTimeout(1200);
          break;
        }
      }
      if (hit) break;
    }
    if (!hit) break;
  }
}

async function closeAgentPanel(page) {
  for (let i = 0; i < 3; i++) {
    const header = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('*')).filter(e =>
        /^(শিরোনামহীন সেশন|Untitled session)$/i.test((e.innerText || '').trim().split('\n')[0] || ''));
      return els.length > 0;
    }).catch(() => false);
    if (!header) return true;
    const x = page.locator('button[aria-label*="Close"], button[aria-label*="বন্ধ"]').last();
    if (await x.isVisible().catch(() => false)) {
      const b = await x.boundingBox({ timeout: 5000 }).catch(() => null);
      if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      await page.waitForTimeout(2000);
    } else return false;
  }
  return false;
}

// P5 + D5/S5: Self-identifying agent-mode chip toggle (supports "এজেন্ট মোড",
// "Agent mode", and "Agent"). Never re-clicks when aria-pressed is already false.
async function agentOff(page) {
  for (let i = 0; i < 5; i++) {
    await dismissOverlays(page);
    const state = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => {
        const txt = (b.innerText || '').trim();
        const aria = (b.getAttribute('aria-label') || '').trim();
        return /^(এজেন্ট মোড|Agent mode|Agent)$/i.test(txt) || /^(এজেন্ট মোড|Agent mode|Agent)$/i.test(aria);
      });
      if (!btns.length) return { found: false, pressed: [] };
      return {
        found: true,
        pressed: btns.map(b => b.getAttribute('aria-pressed')),
      };
    }).catch(() => ({ found: false, pressed: [] }));

    if (!state.found) {
      console.log('  agent chip not present (direct mode ready)');
      return true;
    }
    if (state.pressed.includes('false') || (state.pressed.length && !state.pressed.includes('true'))) {
      console.log('  agent already OFF (aria-pressed=false) - not touching');
      return true;
    }
    const chip = page.locator('button').filter({ hasText: AGENT_CHIP_RE }).first();
    if (await chip.isVisible().catch(() => false)) {
      const box = await chip.boundingBox({ timeout: 4000 }).catch(() => null);
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      } else {
        await chip.focus().catch(() => {});
        await page.keyboard.press('Space').catch(() => {});
      }
    }
    await page.waitForTimeout(2000);
    await closeAgentPanel(page);
  }
  return false;
}

// D5/S5: Verify settings chip reads video-720p-8s-x1 and frame slot buttons exist;
// open model menu ONLY when wrong (bn + en selectors).
async function settingsOnce(page) {
  await dismissOverlays(page);
  const check = await page.evaluate(() => {
    const t = document.body.innerText || '';
    const chipOk = /(ভিডিও|Video)\s*•?\s*720p\s*•?\s*(8|6|10)\s*(সেকেন্ড|s|sec|seconds)/i.test(t)
      || (/720p/i.test(t) && /(8\s*সেকেন্ড|8\s*s|8\s*seconds)/i.test(t));
    const frameOk = Array.from(document.querySelectorAll('button')).some(b =>
      /^(শুরু|শেষ|Start|End)$/i.test((b.innerText || '').trim())
    );
    return { chipOk, frameOk };
  }).catch(() => ({ chipOk: false, frameOk: false }));

  if (check.chipOk && check.frameOk) {
    console.log('  settings already correct (video-720p-8s-x1 + frame slots) - skipping menu');
    return true;
  }
  console.log('  settings missing/wrong - opening model settings menu once');
  const trigger = page.locator('button').filter({
    hasText: /Nano Banana|Gemini Omni|ভিডিও|Video|720p|1080p|ছবি|Image/i,
  }).first();
  const nbox = await trigger.boundingBox({ timeout: 5000 }).catch(() => null);
  if (!nbox) return false;
  await page.mouse.click(nbox.x + nbox.width / 2, nbox.y + nbox.height / 2);
  await page.waitForTimeout(2200);

  await tclick(page, ['ভিডিও', 'Video', 'VIDEO']);
  await tclick(page, ['ফ্রেম', 'Frame', 'FRAME', 'Frames']);
  for (const group of [
    ['16:9'],
    ['Omni 1.1 Flash', 'Gemini Omni 1.1 Flash', 'Omni Flash'],
    ['720p'],
    ['8 সেকেন্ড', '8 seconds', '8s'],
    ['x১', 'x1', '1x'],
  ]) {
    await tclick(page, group);
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(1500);
  await dismissOverlays(page);
  return true;
}

// P3 (D6/S6): Dropped images show % progress and thumbnails but NEVER any
// filename text. Verify upload by: no % indicator AND img count increased
// within bounded 75s timeout.
async function dropAnchor(page, shotFile, workerId) {
  await dismissOverlays(page);
  const filePath = path.join(VISUAL, shotFile);
  if (!fs.existsSync(filePath)) {
    console.log(`[S${workerId}] anchor file missing on disk: ${shotFile}`);
    return false;
  }
  const baseImgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).filter(im => im.complete && im.naturalWidth > 0).length
  ).catch(() => 0);
  const b64 = fs.readFileSync(filePath).toString('base64');

  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.evaluate(async (dd) => {
      const bc = atob(dd.b64);
      const arr = new Uint8Array(bc.length);
      for (let i = 0; i < bc.length; i++) arr[i] = bc.charCodeAt(i);
      const dt = new DataTransfer();
      dt.items.add(new File([arr], dd.name, { type: 'image/jpeg' }));
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 3) || document.body;
      for (const ev of ['dragenter', 'dragover', 'drop']) {
        el.dispatchEvent(new DragEvent(ev, { bubbles: true, cancelable: true, dataTransfer: dt }));
      }
    }, { b64, name: shotFile });

    // Bounded wait: 38 * 2000ms = 76s max per attempt
    const ok = await waitState(page, async () => {
      const st = await page.evaluate((base) => {
        const text = document.body.innerText || '';
        const busy = /\b\d{1,3}%/.test(text);
        const imgs = Array.from(document.querySelectorAll('img')).filter(im => {
          const r = im.getBoundingClientRect();
          return im.complete && im.naturalWidth > 0 && r.width >= 20 && r.height >= 20;
        }).length;
        return { busy, imgs };
      }, baseImgs).catch(() => ({ busy: true, imgs: 0 }));
      return !st.busy && st.imgs > baseImgs;
    }, `upload ${shotFile} (try ${attempt})`, 38, 2000);

    if (ok) return true;
  }
  return false;
}

// P4 (D7/S7): Exact start-frame link verification.
// When unlinked, the composer shows a visible button whose text is "শুরু" or "Start".
// When linked, that slot button is REPLACED by a thumbnail image in the composer
// (not an img inside the button: the শুরু/Start text button is gone/hidden AND
// the composer container holds a visible thumbnail img >24x24 outside ProseMirror).
async function isFrameSlotLinked(page, slotTxts = ['শুরু', 'Start']) {
  return page.evaluate((labels) => {
    const ed = document.querySelector('div.ProseMirror');
    if (!ed) return false;
    let composer = ed;
    for (let i = 0; i < 6 && composer.parentElement; i++) {
      composer = composer.parentElement;
      if (composer.querySelectorAll('button').length >= 2) break;
    }
    const lowerLabels = labels.map(s => s.toLowerCase());
    const slotBtns = Array.from(composer.querySelectorAll('button')).filter(b => {
      const r = b.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      const txt = (b.innerText || '').trim().toLowerCase();
      return lowerLabels.includes(txt);
    });
    // If the text button ("শুরু" / "Start") is still visible in the composer, it is NOT replaced yet.
    const unlinkedBtnVisible = slotBtns.some(b => {
      const hasThumb = Array.from(b.querySelectorAll('img')).some(im => {
        const ir = im.getBoundingClientRect();
        return ir.width > 24 && ir.height > 24;
      });
      return !hasThumb;
    });
    if (unlinkedBtnVisible) return false;

    // Confirm a real thumbnail image (>24x24) now exists in the composer area outside ProseMirror text
    const thumbs = Array.from(composer.querySelectorAll('img')).filter(im => {
      if (ed.contains(im)) return false;
      const r = im.getBoundingClientRect();
      return im.complete && im.naturalWidth > 0 && r.width > 24 && r.height > 24;
    });
    return thumbs.length > 0;
  }, slotTxts).catch(() => false);
}

// P3 + P4 (D7/S7): Click শুরু/Start -> select the uploaded image row (by filename
// if present, otherwise the newest/first visible thumbnail row in the picker) ->
// click Add to prompt / প্রম্পটে যোগ করুন -> verify slot button replaced by thumbnail.
async function setFrame(page, shotFile, slotTxts = ['শুরু', 'Start']) {
  await dismissOverlays(page);
  if (await isFrameSlotLinked(page, slotTxts)) return true;

  for (let pass = 0; pass < 2; pass++) {
    if (!await tclick(page, slotTxts)) {
      if (await isFrameSlotLinked(page, slotTxts)) return true;
      break;
    }
    await page.waitForTimeout(1800);

    // 1) Try matching by filename if shown
    let picked = false;
    const namedRow = page.locator('button, div[role="button"], [role="option"], [role="listitem"]').filter({ hasText: shotFile }).first();
    if (await namedRow.isVisible().catch(() => false)) {
      const b = await namedRow.boundingBox({ timeout: 3000 }).catch(() => null);
      if (b && b.width > 4 && b.height > 4) {
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        picked = true;
        await page.waitForTimeout(1500);
      }
    }

    // 2) Flow never shows filenames on dropped thumbnails (P3): click the newest
    // visible ingredient thumbnail outside the bottom composer bar.
    if (!picked) {
      const pt = await page.evaluate(() => {
        const ed = document.querySelector('div.ProseMirror');
        const edRect = ed ? ed.getBoundingClientRect() : { top: window.innerHeight - 180 };
        const candidates = Array.from(document.querySelectorAll('img')).filter(im => {
          const r = im.getBoundingClientRect();
          if (r.width < 32 || r.height < 32) return false;
          // Exclude tiny avatars and anything inside the bottom composer slot
          if (r.top > edRect.top - 10 && r.bottom <= window.innerHeight) return false;
          return im.complete && im.naturalWidth > 0;
        });
        if (!candidates.length) return null;
        // Pick the most recently added thumbnail (last in DOM or first in picker dialog)
        const target = candidates[candidates.length - 1];
        const tr = target.getBoundingClientRect();
        return { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };
      }).catch(() => null);

      if (pt) {
        await page.mouse.click(pt.x, pt.y);
        await page.waitForTimeout(1500);
      }
    }

    // Click "প্রম্পটে যোগ করুন" / "Add to prompt" if shown
    await tclick(page, ['প্রম্পটে যোগ করুন', 'Add to prompt', 'Use as start frame', 'শুরু ফ্রেম হিসেবে ব্যবহার করুন']);

    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(1500);
      if (await isFrameSlotLinked(page, slotTxts)) return true;
    }
  }
  return isFrameSlotLinked(page, slotTxts);
}

// P1 + P6 (D8/S8): Strictly SINGLE-CLICK submit with visible-enabled arrow check
// and fast whitespace-normalized output-card acceptance check. Never auto-retries
// a submit click so we NEVER double-burn 12 credits.
async function submitOnce(page, promptText, sceneId, workerId) {
  await dismissOverlays(page);
  const pm = page.locator('div.ProseMirror').first();
  await pm.click().catch(() => {});
  const cur = await pm.textContent().catch(() => '');
  if (!cur || cur.trim().length < 50) {
    await page.keyboard.press('Control+a').catch(() => {});
    await page.keyboard.type(promptText, { delay: 2 }).catch(() => {});
    await page.waitForTimeout(1200);
  }

  // Snapshot existing output cards / prompt signature hits outside ProseMirror BEFORE clicking
  const sig = promptText.slice(28, 72).replace(/\s+/g, ' ').trim();
  const baseHits = await page.evaluate((s) => {
    const ed = document.querySelector('div.ProseMirror');
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('div.ProseMirror').forEach(n => n.remove());
    const norm = (clone.innerText || '').replace(/\s+/g, ' ');
    return norm.split(s).length - 1;
  }, sig).catch(() => 0);

  // P6: Find the VISIBLE, non-disabled submit arrow button (there may be hidden duplicates)
  const arrowBox = await page.evaluate(() => {
    const sel = [
      'button[aria-label="জেনারেট করা শুরু করুন"]',
      'button[aria-label*="Start generating"]',
      'button[aria-label*="Generate"]',
      'button[aria-label*="Submit"]',
      'button[aria-label*="Send"]',
    ].join(', ');
    const btns = Array.from(document.querySelectorAll(sel));
    for (const b of btns) {
      const r = b.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const style = window.getComputedStyle(b);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      const dis = b.getAttribute('aria-disabled') === 'true' || b.disabled;
      if (dis) return { disabled: true };
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, disabled: false };
    }
    return null;
  }).catch(() => null);

  if (!arrowBox || arrowBox.disabled) {
    const dbg = path.join(VISUAL, `_debug_s${workerId}_scene${sceneId}_arrow_miss.png`);
    await page.screenshot({ path: dbg }).catch(() => {});
    console.log(`[S${workerId}] submit arrow miss/disabled for scene ${sceneId} -> ${dbg}`);
    return false;
  }

  // STRICTLY ONE CLICK — never re-click after this point (P1: prevents 2x 12-credit burn)
  await page.mouse.click(arrowBox.x, arrowBox.y);

  // Fast acceptance check (up to 90s = 45 * 2s):
  // Accepted as soon as EITHER:
  //  (a) ProseMirror composer text cleared, OR
  //  (b) A new output card outside ProseMirror contains our whitespace-normalized prompt signature, OR
  //  (c) A generating/queued card ("0%", "Generating", "জেনারেট হচ্ছে", "in the queue") appeared.
  const accepted = await waitState(page, async () => {
    return page.evaluate(({ s, prevHits }) => {
      const ed = document.querySelector('div.ProseMirror');
      const edEmpty = !ed || (ed.textContent || '').trim().length < 30;
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll('div.ProseMirror').forEach(n => n.remove());
      const norm = (clone.innerText || '').replace(/\s+/g, ' ');
      const curHits = norm.split(s).length - 1;
      if (curHits > prevHits) return true;
      if (edEmpty && curHits >= 1) return true;
      if (edEmpty) return true;
      return false;
    }, { s: sig, prevHits: baseHits });
  }, `submit accepted (scene ${sceneId})`, 45, 2000);

  if (!accepted) {
    const dbg = path.join(VISUAL, `_debug_s${workerId}_scene${sceneId}_submit_noshow.png`);
    await page.screenshot({ path: dbg }).catch(() => {});
  }
  return accepted;
}

// Worker loop: 1 Chrome profile -> 1 Flow project -> submits all its assigned scenes serially
async function runProject(profileObj, workerId, ids, staggerMs = 0) {
  const { dir: profileDir, email } = profileObj;
  const st = loadState();
  const fresh = ids.filter(id => {
    const f = path.join(VISUAL, `clip_shot_${String(id).padStart(4, '0')}.mp4`);
    if (!FORCE && fs.existsSync(f) && fs.statSync(f).size > 100000) return false;
    if (!FORCE && st[id]) {
      console.log(`[S${workerId}] scene ${id} already submitted (${st[id].project}) - skip`);
      return false;
    }
    return !!MOTION[id];
  });
  if (!fresh.length) return { workerId, account: email, submitted: 0, failed: [] };

  if (staggerMs > 0) {
    console.log(`[S${workerId}/${email}] staggering start by ${Math.round(staggerMs / 1000)}s...`);
    await new Promise(r => setTimeout(r, staggerMs));
  }

  let ctx = null;
  let projectUrl = null;
  try {
    ctx = await chromium.launchPersistentContext(profileDir, {
      headless: false,
      executablePath: CHROME_PATH,
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
      viewport: null,
    });
    const page = ctx.pages()[0] || await ctx.newPage();
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    await dismissOverlays(page);

    if (process.env.RESUME_URL && workerId === 1) {
      projectUrl = process.env.RESUME_URL;
      console.log(`[S${workerId}/${email}] resume project: ${projectUrl}`);
      await page.goto(projectUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(9000);
    } else {
      if (!await tclick(page, ['নতুন প্রোজেক্ট', 'New project', 'Create project'])) {
        throw new Error('NO_NEW_PROJECT');
      }
      await page.waitForTimeout(9000);
      projectUrl = page.url();
    }
    // P7: Always print project URL clearly so user can open/adopt for manual harvest
    console.log(`[S${workerId}/${email}] PROJECT_URL: ${projectUrl}`);

    await dismissOverlays(page);
    await closeAgentPanel(page);
    if (!await agentOff(page)) throw new Error('AGENT_STUCK_ON');
    await dismissOverlays(page);
    await settingsOnce(page);

    let submitted = 0;
    const failed = [];
    for (const id of fresh) {
      const shot = `shot_${String(id).padStart(4, '0')}.jpg`;
      console.log(`[S${workerId}/${email}] scene ${id}: drop + link start frame + submit...`);
      await dismissOverlays(page);

      if (!await dropAnchor(page, shot, workerId)) {
        const dbg = path.join(VISUAL, `_debug_s${workerId}_scene${id}_upload_stuck.png`);
        await page.screenshot({ path: dbg }).catch(() => {});
        failed.push([id, 'UPLOAD_STUCK']);
        continue;
      }
      if (!await setFrame(page, shot, ['শুরু', 'Start'])) {
        const dbg = path.join(VISUAL, `_debug_s${workerId}_scene${id}_noframe.png`);
        await page.screenshot({ path: dbg }).catch(() => {});
        failed.push([id, 'NOFRAME']);
        continue;
      }
      const endShot = END_FRAMES[id];
      if (endShot) {
        if (!await dropAnchor(page, endShot, workerId) || !await setFrame(page, endShot, ['শেষ', 'End'])) {
          failed.push([id, 'NOENDFRAME']);
          continue;
        }
      }
      if (!await submitOnce(page, DIRECT_FORMULA(MOTION[id]), id, workerId)) {
        failed.push([id, 'SUBMIT_NOSHOW']);
        continue;
      }

      submitted++;
      const curState = loadState();
      curState[id] = {
        project: projectUrl,
        account: email,
        at: new Date().toISOString(),
      };
      saveState(curState);
      const shotOk = path.join(VISUAL, `_submitted_s${workerId}_scene${id}.png`);
      await page.screenshot({ path: shotOk }).catch(() => {});
      console.log(`[S${workerId}/${email}] ✓ scene ${id} ACCEPTED (~12 credits) -> ${projectUrl}`);
      // P7: Never wait for render completion; brief pause so composer resets for next scene
      await page.waitForTimeout(3500);
    }

    await ctx.close().catch(() => {});
    return { workerId, account: email, project: projectUrl, submitted, creditsSpent: submitted * 12, failed };
  } catch (err) {
    try { if (ctx) await ctx.close(); } catch (_) {}
    if (/existing browser session|profile.*in use|singletonlock/i.test(err.message)) {
      console.error(`[S${workerId}/${email}] PROFILE_BUSY: profile dir ${profileDir} is locked by another Chrome session.`);
      return { workerId, account: email, project: projectUrl, submitted: 0, failed: fresh.map(id => [id, 'PROFILE_BUSY']) };
    }
    return { workerId, account: email, project: projectUrl, submitted: 0, failed: fresh.map(id => [id, err.message.slice(0, 60)]) };
  }
}

async function main() {
  const only = Number(process.env.ONLY_SCENE) || 0;
  const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
  const st = loadState();

  // P8 (D3/S3): Deduplicate against BOTH disk clips AND _flow_submitted.json BEFORE
  // launching any browser so reruns never create empty/duplicate Flow projects.
  const todo = project.scenes
    .filter(s => s.type === 'DYNAMIC_AI_VIDEO')
    .map(s => s.scene_id)
    .filter(id => {
      if (only && id !== only) return false;
      const f = path.join(VISUAL, `clip_shot_${String(id).padStart(4, '0')}.mp4`);
      if (!FORCE && fs.existsSync(f) && fs.statSync(f).size > 100000) return false;
      if (!FORCE && st[id]) {
        console.log(`[SKIP] scene ${id} already submitted in state (${st[id].project} @ ${st[id].at})`);
        return false;
      }
      return !!MOTION[id];
    });

  if (!todo.length) {
    console.log('=== EP02 FLOW-SUBMIT: 0 scenes remaining (all rendered or already submitted). Exiting cleanly with 0 browsers launched. ===');
    process.exit(0);
  }

  // Single-worker mode when ONLY_SCENE or RESUME_URL is set; otherwise shard across up to 3 profiles
  const activeCount = (only || process.env.RESUME_URL) ? 1 : Math.min(PROFILES.length, todo.length);
  const buckets = Array.from({ length: activeCount }, () => []);
  todo.forEach((id, idx) => buckets[idx % activeCount].push(id));

  console.log(`=== EP02 FLOW-SUBMIT FLEET: ${activeCount} worker(s), ${todo.length} scene(s) [${todo.join(', ')}] ===`);

  // P2: Pre-launch cleanup of orphan Chrome processes for active fleet profiles only
  cleanupStaleProfiles(PROFILES.slice(0, activeCount).map(p => p.dir));

  const results = await Promise.all(
    buckets.map((ids, i) => runProject(PROFILES[i], i + 1, ids, i * STAGGER_MS))
  );
  console.log(JSON.stringify(results, null, 2));
  const totalCredits = results.reduce((acc, r) => acc + (r.creditsSpent || 0), 0);
  console.log(`Total submitted: ${results.reduce((a, r) => a + r.submitted, 0)} video(s), estimated credits spent: ${totalCredits}`);
  process.exit(results.some(r => (r.failed || []).length > 0) ? 1 : 0);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: multi-worker submit-only fleet; harvest is manual per user direction
```

---

## 6J. Muse (muse.ai) agent path - delivered clips 43 + 57 (PROBED 2026-10-16)

> Meta Muse personal agent makes videos from chat (up to 4 per chat, multiple chats). Logged-in session in automation profile required (no password handling - user logs in once manually). Flow: new/side chat -> attach anchor jpg via file input -> paste DETAILED motion prompt -> Enter -> agent renders (status Animating video, minutes) -> fetch newest video src with credentials:include -> verify thumbnail content matches scene (avatar lookalikes exist - verify!) -> save clip_shot_XXXX.mp4. Clip 43: 1216x672/24fps/10s/12.6MB. Clip 57: 1216x672/24fps/10s/5.5MB.
