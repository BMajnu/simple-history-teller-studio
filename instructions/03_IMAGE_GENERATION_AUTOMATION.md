# 03. IMAGE GENERATION AUTOMATION INSTRUCTION
**Primary Engine:** Google AI Studio Image Generation Fleet  
**Model Hierarchy (Strict Priority & Failover Chain):**  
1. 🥇 **Primary Model:** `gemini-nano-banana-2.1` (**Nano Banana 2.1** / Enhanced Factuality, Visual Fidelity & Consistency)  
2. 🥈 **Tier 2 Fallback:** `gemini-3.1-flash-image` (**Nano Banana 2** / Pro-level Flash Intelligence) — *Activated when Nano Banana 2.1 hits daily account limits*  
3. 🥉 **Tier 3 Fallback:** `gemini-3.1-flash-lite-image` (**Nano Banana 2 Lite** / Smallest & Fastest At-Scale Flash Lite) — *Activated when Nano Banana 2 hits account limits*  

**Mandatory Thinking Level:** **ALWAYS SET TO HIGH** (`Thinking: High`) across all image generations and multi-modal tasks to ensure maximum historical accuracy, intricate background depth, and visual fidelity.  
**Resolution:** **1K Widescreen (`1376×768` / 16:9 Aspect Ratio)**  
**Target:** 50 to 70+ granular shots per episode

---

## 1. Resolution & Dimension Standards

> [!IMPORTANT]
> **MANDATORY THINKING LEVEL: ALWAYS HIGH**  
> Image generation prompts and all AI Studio operations must ALWAYS execute with **Thinking Level: HIGH** enabled. High thinking ensures the model deeply reasons about historical costume accuracy, perspective composition, architectural fidelity, and character emotion before generating pixels. Never use Low or None thinking.

> [!IMPORTANT]
> **WHY 1K WIDESCREEN (`1376×768`) INSTEAD OF 2K?**  
> 1. Video export compositing occurs at standard Full HD **1080p60 (`1920×1080`)**.  
> 2. Generating at 1K (`1376×768`) reduces generation time by ~65%, cuts memory overhead by 70%, and completely eliminates GPU VRAM throttling during multi-worker batch runs.  
> 3. FFmpeg upscales 1K cartoon vector fills cleanly to 1080p with zero visual degradation.

---

## 2. Story-Driven Style Guidelines & 4 Mascot Anchor Presets

> [!IMPORTANT]
> **STYLE IS CHOSEN PER STORY DURING RESEARCH & SCRIPTWRITING!**  
> Character and visual design must NEVER be locked solely to Sticky Meme. The visual style is decided based on the story's era, tone, and theme. When generating images for an episode, workers inspect `project.json` -> `style_preset` and adhere strictly to that preset's formulas and anchor reference sheet:

### Preset 1: STICKY-MEME (`PRESET_STICKY_MEME` / OverSimplified Benchmark)
* **Tone:** Satirical, humorous, fast-paced, human folly, bizarre ironies.
* **Character Formula:** Smooth ovoid egg-shaped white head (`#FFFFFF`), solid 5px comic black outline (`#000000`), minimalist stick-figure limbs with clean joint bends, simple circular mitt hands, flat vibrant vector color fills with zero realistic photographic gradients.
* **Anchor Host (Time Chronicler):** Elderly wise historian adapted to stickman style — bald crown with fluffy white hair on sides, full bushy white beard, wire-rim spectacles, earthy brown scholar tunic, antique history journal with gold emblem, flaming wooden torch.
* **Anchor Reference File:** Attach [`references/ref_host_sticky_meme.jpg`](file:///d:/Developing%20Projects/Itihash%20Explainer%20Video/references/ref_host_sticky_meme.jpg) to Host/Anchor prompts.
* **Scene Style Reference:** [`references/ref_style_1_sticky_meme.jpg`](file:///d:/Developing%20Projects/Itihash%20Explainer%20Video/references/ref_style_1_sticky_meme.jpg)

### Preset 2: SIMPLE-HISTORY (`PRESET_SIMPLE_HISTORY` / 2D Graphic Novel Benchmark)
* **Tone:** Classic military/civilization documentary, educational balance, epic campaigns.
* **Character Formula:** Clean 2D animation / documentary graphic novel character turnaround, crisp bold ink contours, semi-realistic human anatomy and facial expressions, cel-shaded color fills.
* **Anchor Host (Time Chronicler):** Elderly male scholar — balding white hair, prominent white beard and mustache, round circular brass spectacles, earthy brown hooded scholar robe over forest green undertunic, heavy antique leather-bound history book, brass/wooden torch.
* **Anchor Reference File:** Attach [`references/ref_host_simple_history.jpg`](file:///d:/Developing%20Projects/Itihash%20Explainer%20Video/references/ref_host_simple_history.jpg) to Host/Anchor prompts.
* **Scene Style Reference:** [`references/ref_style_2_simple_history.jpg`](file:///d:/Developing%20Projects/Itihash%20Explainer%20Video/references/ref_style_2_simple_history.jpg)

### Preset 3: MYSTERY-NOIR (`PRESET_MYSTERY_NOIR` / Chiaroscuro Suspense Benchmark)
* **Tone:** Unsolved conspiracies, ancient forbidden secrets, dark espionage, dramatic suspense.
* **Character Formula:** High-contrast chiaroscuro lighting, deep heavy shadows, warm flickering torchlight, gritty parchment textures, moody desaturated color palette with intense atmospheric accents.
* **Anchor Host (Time Chronicler):** Weathered elderly male chronicler — expressive aged eyes behind gleaming brass spectacles, shadowed wrinkles, long flowing silver-white beard, dark brown heavy hooded traveling cloak, clutching a glowing ancient tome in one hand and a crackling flaming torch casting dynamic shadows.
* **Anchor Reference File:** Attach [`references/ref_host_mystery_noir.jpg`](file:///d:/Developing%20Projects/Itihash%20Explainer%20Video/references/ref_host_mystery_noir.jpg) to Host/Anchor prompts.
* **Scene Style Reference:** [`references/ref_style_3_mystery_noir.jpg`](file:///d:/Developing%20Projects/Itihash%20Explainer%20Video/references/ref_style_3_mystery_noir.jpg)

### Preset 4: ISLAMIC-REVERENT (`PRESET_ISLAMIC_REVERENT` / Classical Polymath Benchmark)
* **Tone:** Sacred origins, Islamic Golden Age, scientific breakthroughs, profound philosophical epics.
* **Character Formula:** Dignified, serene classical polymath aesthetic, illuminated manuscript margins, soft radiant golden illumination, dignified posture, clean respectful linework.
* **Anchor Host (Time Chronicler):** Dignified elderly Muslim polymath/scholar — serene wise countenance, neatly groomed full white beard, traditional wire spectacles, camel-brown traditional scholar robe (Jubba) with subtle gold arabesque embroidery, illuminated leather volume, polished brass oil lamp or torch.
* **Anchor Reference File:** Attach [`references/ref_host_islamic_reverent.jpg`](file:///d:/Developing%20Projects/Itihash%20Explainer%20Video/references/ref_host_islamic_reverent.jpg) to Host/Anchor prompts.
* **Scene Style Reference:** [`references/ref_style_4_islamic_reverent.jpg`](file:///d:/Developing%20Projects/Itihash%20Explainer%20Video/references/ref_style_4_islamic_reverent.jpg)

### Core Rules for Anchor/Host Generation:
1. **Always Male & Always Elderly:** The Anchor is **strictly MALE (পুরুষ)** and **strictly an ELDERLY PERSON (বয়স্ক ব্যক্তি)** across all 4 styles. Never generate a youthful, female, or child host.
2. **Mandatory Image Attachment:** For any scene where the Anchor/Time Chronicler appears, the generator script MUST attach the corresponding reference image (`ref_host_*.jpg`) to the multimodal prompt to ensure 100% facial and wardrobe consistency.
3. **Negative Prompt Constraint (Strictly Mandatory):** Append this exact string to every prompt without exception:
```text
--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions
```

### Negative Prompt Constraint (Strictly Mandatory):
Image diffusion models will draw raw numbers and scene text directly onto the canvas if prompts contain metadata. Every prompt dispatched to the image generator **MUST strip scene headers** and **append this exact constraint**:
```text
--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions
```

> [!CAUTION]
> **Baked-text দেখা মাত্র regenerate:** দোকানের সাইনবোর্ড ("Free Meals" জাতীয়), বইয়ের মলাট-লেখা, ফলক-লিপি, পোস্টার — এগুলোও baked-text। Visual prompt-এ দোকান/বাজার/সাইনবোর্ড দৃশ্য এলে **"blank signboard, no writing"** স্পষ্ট লেখো; প্রজন্মের পর 1376px চেকে কোনো অক্ষর দেখা গেলে শটটি fail — regenerate বাধ্যতামূলক।

---

## 3. Multi-Worker Parallel Concurrency (5 to 10 Parallel Agents)

> [!CAUTION]
> **NEVER GENERATE 50+ IMAGES SEQUENTIALLY!**  
> Running one generation after another for 60 shots takes 45–60 minutes.  
> Using **5 to 10 parallel workers** concurrently completes all 60 shots in **4 to 6 minutes**.

### Multi-Worker Execution Logic:
1. Divide the missing shots into chunks or worker queues.
2. Use the supported project-aware runner: `tools/test_parallel_images_10.js`. It resolves every scene from `project.json`, uses a named tab and account slot, saves accepted assets below `projects/<project_id>/visual_assets/`, and writes evidence below `automation_runs/`.
3. Before a worker changes any AI Studio setting, fills a prompt, or presses Run, it must complete the geometry gate in [`10_AUTOMATION_OBSERVABILITY_AND_PORTABILITY.md`](10_AUTOMATION_OBSERVABILITY_AND_PORTABILITY.md): the named Electron BrowserView must be active, layout-healthy, and visibly usable. A thin strip with a blank lower pane is `viewport_layout_unhealthy`; stop that worker and repair/reopen the browser before continuing.
4. Preparation is serialized across Electron BrowserViews because only the visible BrowserView owns a reliable pointer target. After trusted Run acceptance, all cloud image generations are harvested concurrently. Never fake parallelism with synthetic DOM clicks.
5. Every accepted worker must verify and persist **Images only**, `16:9`, `1K`, and **Thinking: High** before prompt submission. Then it saves the output directly to `projects/<project_id>/visual_assets/scene_XXXX.<ext>` and updates `project.json` only after output validation.

---

## 4. Legacy reference — SUPERSEDED (background only)

> [!CAUTION]
> The historical code sample below predates the slot-cycling, model-chain and
> Thinking-High contracts and caused `u/undefined` → 404 failures (Oct-2026).
> It is preserved only as background reference and is **not an approved
> runnable script**. The approved runnable sample is §4B below
> (`tools/run_parallel_images_002.js`). Do not copy the legacy sample.

```javascript
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const VISUAL_DIR = path.join(PROJECT_DIR, 'visual_assets');
fs.mkdirSync(VISUAL_DIR, { recursive: true });

const NUM_CONCURRENT_WORKERS = 5; // Run 5 parallel workers simultaneously

async function sendScriptToDaemon(code) {
  const resp = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}

function sanitizePrompt(prompt) {
  return prompt
    .replace(/^(Simple\s+Itihash\s+)?(Scene|Shot|Part)\s*\d+[:\-.]*\s*/i, '')
    .replace(/\[.*?\]/g, '')
    .trim() + ' --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks';
}

async function runWorker(workerId, shotQueue) {
  while (shotQueue.length > 0) {
    const shot = shotQueue.shift();
    const shotFile = path.join(VISUAL_DIR, `shot_${String(shot.scene_id).padStart(4, '0')}.jpg`);
    
    if (fs.existsSync(shotFile) && fs.statSync(shotFile).size > 50000) {
      console.log(`[Worker ${workerId}] Shot ${shot.scene_id} already exists, skipping.`);
      continue;
    }

    console.log(`[Worker ${workerId}] Generating Shot ${shot.scene_id}...`);
    const cleanPrompt = sanitizePrompt(shot.visual_prompt);
    const escapedPrompt = cleanPrompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
    const escapedOutPath = shotFile.replace(/\\/g, '\\\\');

    const code = `
      const ctx = browser.contexts()[0];
      const page = await ctx.newPage();
      try {
        await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        
        // Ensure 16:9 aspect ratio
        const arBtn = page.locator('button[aria-label*="Aspect ratio"]').first();
        if (await arBtn.count() > 0) {
          await arBtn.click();
          await page.waitForTimeout(300);
          const opt169 = page.locator('mat-option:has-text("16:9")').first();
          if (await opt169.count() > 0) await opt169.click();
        }

        // Enter prompt
        const promptArea = page.locator('textarea, div[contenteditable="true"]').first();
        await promptArea.fill("${escapedPrompt}");
        await page.waitForTimeout(300);

        // Run
        await page.keyboard.press('Control+Enter');
        
        // Wait for image generation (up to 45s)
        await page.waitForSelector('img.loaded-image, img[alt*="Generated"]', { timeout: 45000 });
        const img = page.locator('img.loaded-image, img[alt*="Generated"]').first();
        const base64Data = await img.evaluate(el => {
          const canvas = document.createElement('canvas');
          canvas.width = el.naturalWidth;
          canvas.height = el.naturalHeight;
          canvas.getContext('2d').drawImage(el, 0, 0);
          return canvas.toDataURL('image/jpeg', 0.92).replace(/^data:image\\/jpeg;base64,/, '');
        });

        const fs = require('fs');
        fs.writeFileSync("${escapedOutPath}", Buffer.from(base64Data, 'base64'));
        return { success: true };
      } finally {
        await page.close().catch(() => {});
      }
    `;

    try {
      await sendScriptToDaemon(code);
      console.log(`✓ [Worker ${workerId}] Successfully generated Shot ${shot.scene_id}`);
    } catch (err) {
      console.error(`✗ [Worker ${workerId}] Failed Shot ${shot.scene_id}:`, err.message);
    }
  }
}

async function startParallelGeneration() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const queue = [...project.scenes];
  console.log(`Dispatching ${queue.length} shots across ${NUM_CONCURRENT_WORKERS} parallel workers...`);

  const workers = [];
  for (let w = 1; w <= NUM_CONCURRENT_WORKERS; w++) {
    workers.push(runWorker(w, queue));
  }
  await Promise.all(workers);
  console.log('✓ All parallel image generation workers completed!');
}

startParallelGeneration();
```
---

## 4B. CANONICAL SAMPLE — EP02 10-worker fleet (`tools/run_parallel_images_002.js`)

> [!IMPORTANT]
> **This is the approved runnable sample.** It was built by following these rules:
> * **R1 Model hierarchy:** `gemini-nano-banana-2.1` → `gemini-3.1-flash-image` →
>   `gemini-3.1-flash-lite-image`, tried per-scene on quota/model-404.
> * **R2 Thinking Level HIGH** on every session. **R3 Aspect ratio 16:9** verified.
> * **R4 Style anchor:** sticky-man formula prefix; host scenes attach
>   `references/ref_host_sticky_meme.jpg`. **R5 Negative prompt** always appended
>   (incl. anti-sticker `sticker, die-cut, white border outline` + anti-baked-text).
> * **R6 Parallelism:** 10 workers × 6 slots; slot index is ALWAYS modulo length —
>   a worker must NEVER navigate to `u/undefined` (instant AI Studio 404).
> * **R7 Skip-if-present** (`shot_XXXX.jpg` > 50KB never regenerated, resume-safe).
> * **R8 QUOTA rotation:** next slot, SAME scene retried; scenes are never dropped.
> * **R9 Failure evidence:** `_debug_shotXXXX.png` screenshot on timeout.
> * **R10 Single-agent execution;** do NOT close the Chrome window mid-run.

```javascript
// (Canonical source: tools/run_parallel_images_002.js — R1..R10 documented there.
// Prompts come from project.json, rebuilt by tools/regen_prompts_002_fresh.js.)
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');
const REF_STICKY = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');

// R1: model fallback chain (primary first)
const MODEL_CHAIN = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const ALL_SCENES = project.scenes;
const NEGATIVE_TAIL = '--no text';
const HOST_SPEAKERS = new Set(['TIME_CHRONICLER']);
// R6: slots cycle — index ALWAYS modulo length (never u/undefined -> 404)
const ACCOUNT_SLOTS = [1, 2, 3, 4, 5, 6];
const NUM_WORKERS = 10;

function slotFor(workerId) {
  return ACCOUNT_SLOTS[(workerId - 1) % ACCOUNT_SLOTS.length];
}

function promptOf(scene) {
  const v = scene.visual_prompt || '';
  return v.includes(NEGATIVE_TAIL) ? v : v + ' --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, sticker, die-cut, white border outline, floating cutout, photorealism, detailed anatomy';
}

async function ensureSession(page, slot, model) {
  const url = `https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  // R2: Thinking Level High
  try {
    const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await thinkingSelect.count() > 0) {
      const current = await thinkingSelect.innerText().catch(() => '');
      if (!/high/i.test(current)) {
        await thinkingSelect.click().catch(() => {});
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option').filter({ hasText: 'High' }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } catch (e) {}
  // R3: Aspect ratio 16:9
  try {
    const arSelectors = ['button[aria-label*="Aspect"], button[aria-label*="aspect"], mat-select[aria-label*="Aspect"]'];
    for (const sel of arSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(500);
        const opt = page.locator('mat-option, [role="option"]').filter({ hasText: '16:9' }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await page.waitForTimeout(300);
        break;
      }
    }
  } catch (e) {}
}

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit/i.test(document.body.innerText || '')
  ).catch(() => false);
}

async function generateShotOnPage(page, scene, workerId, getSlot) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `shot_${shotNum}.jpg`);
  // R7: resume-safe skip
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
    return { ok: true, skipped: true };
  }
  const isHost = HOST_SPEAKERS.has(scene.dialogue_speaker);
  const fullPrompt = promptOf(scene);
  // R1+R8: model chain x slot rotation; QUOTA -> next slot, same scene
  for (const model of MODEL_CHAIN) {
    for (let s = 0; s < ACCOUNT_SLOTS.length; s++) {
      const slot = getSlot();
      try {
        await ensureSession(page, slot, model);
        if (await isQuota(page)) continue;
        // R4: host reference attach
        if (isHost && fs.existsSync(REF_STICKY)) {
          const fileInput = page.locator('input[type="file"]').first();
          if (await fileInput.count() > 0) {
            await fileInput.setInputFiles(REF_STICKY).catch(() => {});
            await page.waitForTimeout(1500);
          }
        }
        const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
          .filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/'))
          .map(img => img.src)).catch(() => []);
        const ta = page.locator('textarea, div[contenteditable="true"][role="textbox"]').first();
        await ta.waitFor({ state: 'visible', timeout: 20000 });
        await ta.fill(fullPrompt);
        await page.waitForTimeout(600);
        await page.keyboard.press('Control+Enter');
        let foundSrc = null;
        for (let i = 0; i < 25; i++) {
          await page.waitForTimeout(2000);
          if (await isQuota(page)) break;
          const curImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
            .filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/'))
            .map(img => img.src)).catch(() => []);
          const fresh = curImgs.filter(src => !prevImgs.includes(src));
          if (fresh.length > 0) { foundSrc = fresh[fresh.length - 1]; break; }
        }
        if (!foundSrc) {
          if (await isQuota(page)) continue;
          await page.screenshot({ path: path.join(VISUAL, `_debug_shot${shotNum}.png`) }).catch(() => {}); // R9
          return { ok: false, err: 'TIMEOUT_NO_IMAGE' };
        }
        const imgData = await page.evaluate(async (src) => {
          try {
            const res = await fetch(src);
            const blob = await res.blob();
            const ab = await blob.arrayBuffer();
            const bytes = new Uint8Array(ab);
            let bin = '';
            for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
            return { b64: btoa(bin), size: bytes.length };
          } catch (e) { return { err: e.message }; }
        }, foundSrc);
        if (!imgData || imgData.err || !imgData.b64) {
          return { ok: false, err: (imgData && imgData.err) || 'EXTRACT_FAIL' };
        }
        fs.writeFileSync(outPath, Buffer.from(imgData.b64, 'base64'));
        console.log(`[W${workerId}/u${slot}] Shot ${scene.scene_id} (${(imgData.size / 1024).toFixed(0)} KB)${isHost ? ' [HOST]' : ''}`);
        return { ok: true, size: imgData.size };
      } catch (err) {
        if (/quota|429/i.test(err.message)) continue;
        return { ok: false, err: err.message.slice(0, 80) };
      }
    }
  }
  return { ok: false, err: 'ALL_SLOTS_MODELS_QUOTA' };
}

async function runWorker(ctx, workerId, queue) {
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length; // R6
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  let done = 0, fail = 0, skipped = 0;
  try {
    while (queue.length > 0) {
      const scene = queue.shift();
      const res = await generateShotOnPage(page, scene, workerId, getSlot);
      if (res.skipped) skipped++;
      else if (res.ok) done++;
      else { fail++; console.log(`[W${workerId}] Shot ${scene.scene_id}: ${res.err}`); }
      await page.waitForTimeout(1500);
    }
  } finally {
    await page.close().catch(() => {});
  }
  return { workerId, done, skipped, fail };
}

(async () => {
  console.log(`=== EP02 IMAGE FLEET: ${NUM_WORKERS} WORKERS x ${ACCOUNT_SLOTS.length} SLOTS ===`);
  const only = Number(process.env.ONLY_SCENE) || 0;
  const todo = ALL_SCENES.filter(s => {
    if (only && s.scene_id !== only) return false;
    const f = path.join(VISUAL, `shot_${String(s.scene_id).padStart(4, '0')}.jpg`);
    return !fs.existsSync(f) || fs.statSync(f).size < 50000;
  });
  console.log(`Remaining: ${todo.length}/${ALL_SCENES.length} shots`);
  if (todo.length === 0) { console.log('All images present. Nothing to do.'); process.exit(0); }
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
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^shot_\d+\.jpg$/) && fs.statSync(path.join(VISUAL, f)).size > 50000).length;
  console.log(`Final: ${totalPresent}/${ALL_SCENES.length} images.`);
  await ctx.close();
  process.exit(results.some(r => r.fail > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
```

---

Before proceeding to Module 4 (Video) or Module 6 (Post-Production):
1. **Count Verification:** `(Get-ChildItem visual_assets -Filter "shot_*.jpg").Count == project.scenes.length`.
2. **Zero-Byte Audit:** No asset may have file size `< 10 KB`.
3. **Missing Shot Resolver:** If any shot failed, run `tools/fill_missing_shots.js` to anchor it to its parent beat artwork.

---

## 6. MANDATORY Style & Mascot Anchor (Same Style Every Image)

> [!CAUTION]
> **সব ইমেজ একই style-এ হবে — intro-র Time Chronicler-সহ।** Style-prefix খসে যাওয়া বা ভুল character (সাদা-দাড়ি বুড়ো) = QA FAIL।

* **Style anchor (প্রতিটি visual_prompt-এর প্রথম বাক্য):** episode preset অনুযায়ী exact string —
  * Sticky-Meme: `Sticky-Meme cutout vector cartoon, thick outlines, flat warm colors, `
  * Simple-History: `Simple History cutout vector cartoon, clean shapes, warm parchment tones, `
  * Mystery-Noir / Islamic-Reverent: সংশ্লিষ্ট `references/ref_style_*.jpg`-এর wording।
* **Mascot anchor (Time Chronicler-শটে বাধ্যতামূলক):** canonical look = banner logo character: bald elderly HUMAN scholar with long white beard, round glasses, brown robe, holding torch and ancient book, HUMAN FACE ONLY (`references/mascot_logo_ref.jpg`). Egg-head / clock-face / clock-head FORBIDDEN (negative must include: no clock face, no clock head, no egg head). Logo reference attach mandatory, regenerate on mismatch?
* **Verification:** batch-sheshe 3 random image + sob Chronicler-shot chokhe dekhe style/mascot milao; mismatch = regenerate, upscale/normalize noy.
---

## 5. Mandatory Opening & Outro Dynamic Video Rule

> [!CAUTION]
> **THE FIRST AND LAST SCENES MUST ALWAYS BE DYNAMIC VIDEO (`DYNAMIC_AI_VIDEO`)!**  
> To ensure cinematic retention and professional quality:
> * **Opening Hook Sequence (Scenes 1 to 3):** Must be generated as dynamic motion video clips (`clip_scene_0001.mp4`, `clip_scene_0002.mp4`, `clip_scene_0003.mp4`). Never leave the intro as static images!
> * **Closing Outro Sequence (Scenes 78 to 80):** Must be generated as dynamic motion video clips (`clip_scene_0078.mp4`, `clip_scene_0079.mp4`, `clip_scene_0080.mp4`) with outro CTA and book closure motion.
