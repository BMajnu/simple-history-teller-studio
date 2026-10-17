# Simple History Teller — Autonomous Cloud AI Generation & Production SOP
**Standard Operating Procedure (SOP) for Google AI Studio & Google Flow Full Pipeline**

> **Purpose:** This document provides the complete, authoritative operational instructions for autonomous AI agents to generate images, dynamic video clips, multi-speaker voiceovers, dynamic timelines, and final 1080p60 tri-lingual master videos without requiring any manual user intervention.

---

## 1. System Architecture & Environment

| Component | Port / URI | Configuration & Notes |
| :--- | :--- | :--- |
| **Chrome DevTools (CDP)** | `http://127.0.0.1:9224` | Chrome running with user profile `chrome_aistudio_profile_3` (Logged into Google AI Studio & Google Flow as PRO). |
| **Automation Daemon** | `http://127.0.0.1:9333` | Express CDP bridge with `/status` and `/run-script`. Every run writes per-worker screenshots, state and failure evidence under its project. |
| **Production Studio** | `http://localhost:4000` | Express/FFmpeg engine. Hosts web UI, dynamic timeline inspector, per-language video renderer, and asset manager. |
| **Project Workspace** | `d:\Developing Projects\Itihash Explainer Video` | Contains `projects/<project_id>/` with `project.json`, `visual_assets/`, `audio/`, `metadata/`, `renders/`. |

---

## 2. Step 1: Google AI Studio 2K Widescreen Image Generation

### Target URL
* `https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image` (or existing session chat with Nano Banana 2).

### Strict Prompt Sanitization & Zero Baked-In Text Protocol
> [!CAUTION]
> **PREVENTING BAKED-IN SCENE NUMBERS & LABELS:**  
> Image diffusion models will literally draw text onto the image if numbers or titles appear in the prompt (e.g., `"Simple History Teller Scene 5: Stickman king..."` resulted in `"SIMPLE HISTORY TELLER SCENE 5"` drawn on the canvas).  
> **Mandatory Rule:** All prompts dispatched to AI Studio or Flow MUST be sanitized by stripping all prefixes:
> ```javascript
> const sanitizedPrompt = rawPrompt
>   .replace(/^(Simple\s+Itihash\s+)?(Scene|Shot|Part|Section)\s*\d+[:\-.]*\s*/i, '')
>   .replace(/\[.*?\]/g, '')
>   .trim();
> ```
> And MUST append the negative typography constraint:
> `--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions`

### 4 Style-Specific Mascot Ground Truth & Reference Chaining
Whenever generating scenes featuring **The Time Chronicler** or main characters, attach the designated style mascot reference image:
1. `references/ref_host_sticky_meme.jpg` — Preset 1: STICKY-MEME
2. `references/ref_host_simple_history.jpg` — Preset 2: SIMPLE-HISTORY
3. `references/ref_host_mystery_noir.jpg` — Preset 3: MYSTERY-NOIR
4. `references/ref_host_islamic_reverent.jpg` — Preset 4: ISLAMIC-REVERENT

Click the `Insert images, videos, or files` button (`button[aria-label*="Insert"]`, icon `add_circle`) in AI Studio, or drop the mascot reference image into the chat before prompting to lock anatomical and wardrobe continuity.

### UI Selectors & Click Flow
1. **Model Selector:** Model must be set to `Nano Banana 2` (`gemini-3.1-flash-image`).
2. **Aspect Ratio & Resolution:**
   * Aspect Ratio: Click `[aria-label="Aspect ratio"]` $\to$ select `16:9`.
   * Resolution: Select `2K` (or `1K`).
3. **Chat Input Box:**
   * Selector: `textarea` or `div[contenteditable="true"]` inside the prompt container.
4. **Trigger Generation:**
   * Locate the visible, enabled `Run`/`Generate` control and use Playwright `locator.click({ force: true })`. DOM `element.click()` is not accepted by AI Studio and is forbidden.
   * Confirm that the composer clears or generation state/output changes. `Control+Enter` is a secondary recovery only, never proof of submission.
5. **Image Extraction & Downloading:**
   * Look for `img.loaded-image` or `button[aria-label="Download"]`.
   * Evaluate canvas / fetch blob as base64 and save directly to `projects/<project_id>/visual_assets/scene_XXXX.jpg`.

### Automation Evidence (mandatory for every phase)
Before interaction, submit a daemon `run` payload containing `projectId`, `workflow`, `agentName`, `accountSlot`, `tabName`, and `captureIntervalMs`. Call `automation.watchPage()` on the uniquely identified page. Before any settings, prompt, or Run action, the named Electron BrowserView must pass the `layoutStatus` geometry-health gate; a thin top strip with a blank lower pane is `viewport_layout_unhealthy`, so stop that worker and repair/reopen the BrowserView instead of continuing. Evidence is stored in `projects/<project_id>/automation_runs/`; inspect `failure.json`, screenshots and matching DOM state files before retrying. Full contract: [`instructions/10_AUTOMATION_OBSERVABILITY_AND_PORTABILITY.md`](instructions/10_AUTOMATION_OBSERVABILITY_AND_PORTABILITY.md).

---

## 3. Step 2: Google Flow Dynamic Video Clip Generation

### Target URL
* `https://flow.google.com/` (e.g. project URL: `https://flow.google.com/project/<project-uuid>`).

### UI Selectors & Click Flow
1. **Upload Reference Image (Scene Asset):**
   * Drag-and-drop or upload file input: `input[type="file"]`.
   * Target: `projects/<project_id>/visual_assets/scene_XXXX.jpg`.
2. **Prompt Submission:**
   * Input Selector: `div.ProseMirror` inside `flow-rich-text-editor.prompt-input`.
   * Enter prompt:
     ```text
     Animate this stickman chief image into a dynamic 2D cinematic video clip: furious stickman shouting, holding bone club high, dramatic desert dust swirl, 16:9 widescreen
     ```
   * Submit Button: `button[aria-label="জেনারেট করা শুরু করুন"]` or press `keyboard.press('Enter')`.
3. **Credit Expenditure Confirmation (Crucial):**
   * A popover or row appears showing credit cost (e.g. "15 ক্রেডিট").
   * Selector: `div.option-row span.option-label:has-text("অনুমোদন করুন")` or `div.option-row:has-text("অনুমোদন")`.
   * Click this element to confirm generation.
4. **Generation Wait:**
   * Poll canvas card or check video generation spinner. Takes ~45–90 seconds.
   * Resulting card on canvas: `flow-video-tile` inside `flow-grid-tile-container`.
5. **Video Inspection & Downloading:**
   * Click on the `flow-video-tile` to open the full video player viewer.
   * In top header bar, locate Download Button:
     * Selector: `button[aria-label="মিডিয়া ডাউনলোড করুন"]` (or `button:has-text("download")`).
   * Clicking this opens a menu with resolution options:
     * `720p\nআসল সাইজ`
     * `1080p\nআপস্কেল করা হয়েছে`
   * Set up Playwright download listener:
     ```javascript
     const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
     await page.locator('.mat-mdc-menu-item:has-text("720p")').first().click();
     const download = await downloadPromise;
     await download.saveAs("D:\\...\\visual_assets\\clip_scene_0004.mp4");
     ```
   * Update `project.json` for that scene:
     ```json
     "asset_file": "visual_assets/clip_scene_0004.mp4",
     "motion_effect": "ai_video"
     ```

---

## 4. Step 3: Google AI Studio (`gemini-3.8-flash-tts`) Expressive Audio Generation

### Target URL
* `https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts`

### Strict Character Persona & Voice Gender Matching Matrix
> [!IMPORTANT]
> **VOICE GENDER & PERSONA ENFORCEMENT:**  
> The voice selected in AI Studio MUST strictly match the character persona and biological gender. **Never fall back to the default `Fola` (female) voice for male characters.**
> - **Male Host (The Time Chronicler):** `Puck` (Upbeat, witty, engaging)
> - **Male Historical Narrator:** `Charon` (Informative, resonant, authoritative)
> - **Male Warrior / Chieftain:** `Fenrir` (Excitable, booming, aggressive)
> - **Male Elder / Sage:** `Bodi` (Quiet, low pitch, intimate)
> - **Female Queen / Leader:** `Kore` (Firm, dignified, commanding)
> - **Female Storyteller:** `Aoede` (Breezy, melodic, warm)
> - **Child (Boy):** `Zephyr` (Bright, higher pitch, curious)
> - **Child (Girl):** `Leda` (Youthful, higher pitch, innocent)

### Screenplay & Dual-Speaker Setup
1. **Automated Voice Switching via CDP:**
   Before synthesizing a speech block, the script checks the active voice chip:
   ```javascript
   const voiceChip = ttsPage.locator('.voice-chip, button.voice-playground-chip').first();
   const currentVoiceText = (await voiceChip.innerText()).trim();
   if (!currentVoiceText.toLowerCase().includes(targetVoice.toLowerCase())) {
     await voiceChip.click();
     await ttsPage.waitForTimeout(400);

     const searchInput = ttsPage.locator('input[placeholder*="Search"][placeholder*="voices"]').first();
     await searchInput.fill(targetVoice);
     await ttsPage.waitForTimeout(400);

     const voiceBtn = ttsPage.locator(`button[aria-label="${targetVoice}"], button.voice-card-content:has-text("${targetVoice}")`).first();
     await voiceBtn.click();
     await ttsPage.waitForTimeout(300);

     const closeBtn = ttsPage.locator('button[aria-label="Close panel"]').first();
     if (await closeBtn.count() > 0) await closeBtn.click();
   }
   ```
2. **Screenplay Expression Tags:**
   * Dual-speaker tags supported: `<gasp>`, `<laugh>`, `<screaming>`, `<sigh>`, `<whisper>`, `<cough>`, `<throat-clearing>`.
   * Example:
     * Scene 1 (`Puck`): `<gasp> আমি সময়ের সাক্ষী! আজ তোমাকে নিয়ে যাব মানব ইতিহাসের সেই মুহূর্তে...`
     * Scene 3 (`Puck`): `<laugh> কেউ যদি বড় শিকার নিয়ে আসত, তবে তার অহংকার ভাঙতে সবাই মিলে তাকে নিয়ে হাসাহাসি করত...`
     * Scene 4 (`Fenrir`): `<screaming> কিন্তু একদিন এক শক্তিশালী শিকারি গর্জে উঠল: আমিই এই কৌম সমাজের একমাত্র অধিপতি!`
3. **Execution & Automation Flow (Per Scene):**
   * Selector for text input: `textarea[aria-label="Speech block text"]`.
   * Clear and fill text:
     ```javascript
     const textarea = page.locator('textarea[aria-label="Speech block text"]').first();
     await textarea.focus();
     await textarea.fill('');
     await textarea.fill(screenplayLine);
     ```
   * Trigger Run:
     * Selector: `button.ctrl-enter-submits` or press `keyboard.press('Control+Enter')`.
   * Wait until generation finishes (spinner disappears, `button.ctrl-enter-submits` aria-disabled becomes false).
   * Locate the player bar download button:
     * Selector: `button[aria-label="Download"]`.
   * Capture download event:
     ```javascript
     const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
     await page.locator('button[aria-label="Download"]').first().click();
     const download = await downloadPromise;
     await download.saveAs(`D:\\...\\audio\\raw\\${lang}_scene_${sceneId}.wav`);
     ```

---

## 5. Step 4: Language-Adaptive Dynamic Timeline Sync & Audio Mastering

> **MANDATORY EPISODE CONTRACT (সংক্ষেপ — Step 4/Step 5 এ প্রযোজ্য):**
> 1. Duration: minimum 900s | target 950–1150s | maximum 1200s।
> 2. Shots: 70–90 granular shots; প্রতিটি 6–13s।
> 3. 1 বাক্য = 1 shot (strictly no bundling)।
> 4. 80% STATIC_IMAGE + 20% DYNAMIC_AI_VIDEO (14–18 clips)।
> 5. লঙ্ঘন হলে QA FAIL — render-এর আগে contract gate পাস বাধ্যতামূলক।

### The "Zero Empty Gaps" Rule
Different languages speak at different speeds. To eliminate awkward dead silence between scenes:
1. **Measure Scene Audio Duration:**
   * For each scene $s$ in language $L$, measure $d_{L,s} = \text{duration of raw audio}$.
2. **Compute Scene Video Duration:**
   * Add a natural breathing pause buffer ($\Delta = 0.4\text{s}$):
     $$S_{L,s} = \text{round}(d_{L,s} + 0.4, 1)$$
3. **Compute Timeline Offsets:**
   * Scene 1 starts at $t = 0.0\text{s}$.
   * Scene $s$ starts at $t_{L,s} = \sum_{k=1}^{s-1} S_{L,k}$.
   * Total Language Timeline $T_L = \sum_{k=1}^{N} S_{L,k}$.
4. **Master Narration Assembly:**
   * Use FFmpeg `adelay` and `amix` to position each raw scene audio at $t_{L,s}$.
   * Pad total length to $T_L$ and normalize loudness:
     ```bash
     ffmpeg -y -i scene1.wav ... -i scene7.wav \
     -filter_complex "[0:a]adelay=t1|t1,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[a1];...;[a1]...[a7]amix=inputs=7:duration=longest:dropout_transition=0,apad=whole_dur=TL,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
     -map "[out]" -t TL -c:a pcm_s16le audio/${lang}_narration.wav
     ```
5. **Update `project.json`:**
   ```json
   "scenes": [
     {
       "scene_id": 1,
       "duration": 11.9,
       "language_durations": {
         "bn": 11.9,
         "en": 10.7,
         "hi": 10.0
       }
     }
   ],
   "language_total_durations": {
     "bn": 66.7,
     "en": 66.4,
     "hi": 63.3
   }
   ```

---

## 6. Step 5: Tri-Lingual Video Rendering via Production Studio (GPU / APU / CPU)

> [!IMPORTANT]
> **UNIVERSAL HARDWARE ACCELERATION & AUTO-FAILOVER:**  
> The engine dynamically adapts to any computer:
> * **Dedicated GPU:** NVIDIA GeForce GTX/RTX or AMD Radeon discrete GPU via `h264_mf` (6500 kbps, 1080p60).
> * **APU / Integrated Graphics:** AMD Ryzen APUs (Radeon Vega graphics) or Intel CPUs (UHD/Iris Xe graphics) render via onboard APU GPU acceleration without errors.
> * **CPU Software Fallback (`libx264 veryfast`):** If no hardware encoder is detected or if hardware limits are hit, the system seamlessly auto-recovers to CPU software mode with zero errors.

### API Endpoint
* `POST http://localhost:4000/api/project/<id>/render`
* Request Body:
  ```json
  {
    "langs": ["bn", "en", "hi"],
    "bgmDb": -20,
    "duck": true,
    "useBgm": true,
    "exportShorts": true
  }
  ```

### Rendering Pipeline Mechanics
1. **Per-Language Visual Timeline (`visual_master_${lang}.mp4`):**
   * Server loops through each selected language (`bn`, `en`, `hi`).
   * Evaluates scene duration $S_{L,s}$ for that specific language.
   * Encodes segment using GPU hardware encoder (`h264_mf`) with caching hash `segmentHash(scene, assetAbs, dur)`:
     * Static Images: Ken-Burns zoom/pan scaled to $S_{L,s}$, normalized with `format=yuv420p`.
     * AI Motion Clips: Fills frame, freezes last frame if clip is shorter, trims if longer, matching $S_{L,s}$, normalized with `format=yuv420p`.
   * Concatenates segments via stream-copy (`-c copy`) into language-specific visual master:
     `renders/visual_master_${lang}.mp4`.
2. **Audio Mixing & Ducking:**
   * Mixes `visual_master_${lang}.mp4` with `audio/${lang}_narration.wav`.
   * Loops `audio/bgm.mp3` with sidechain ducking (`sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350`).
   * Normalizes loudness to YouTube standard `-14 LUFS`.
   * Stream copies video track (`-c:v copy`) for instant zero-loss export.
3. **Outputs:**
   * `renders/video_bn.mp4` (1080p60, timed to Bengali narration)
   * `renders/video_en.mp4` (1080p60, timed to English narration)
   * `renders/video_hi.mp4` (1080p60, timed to Hindi narration)

---

## 7. Step 6: Dual-Export Engine — Simultaneous Long-Form & Vertical Episodic Shorts/Reels

> **Core Monetization & Virality Architecture:**  
> Every rendered master video automatically bifurcates into two synchronized distribution assets:
> 1. **Full-Length 16:9 Landscape:** Targeted for **YouTube Long-Form** & **Facebook In-Stream Video** (maximizes 4,000 watch hours, in-stream ad revenue, and CPM).
> 2. **Episodic 9:16 Vertical Shorts (Part 1, Part 2, Part 3):** Targeted for **TikTok**, **Instagram Reels**, **YouTube Shorts**, and **Facebook Reels** (maximizes viral algorithm discovery and drives subscribers back to the full documentary).

### Episodic Slicing & Visual Framing Rules
* **Part Slicing:** The full documentary timeline is split into cohesive 60s–85s narrative chapters (Parts 1 to 4) at natural scene boundaries.
* **Canvas Layout (1080x1920):**
  * Real-time hardware-accelerated blurred backdrop (`scale=270:480,boxblur=4:2,scale=1080:1920`) filling the vertical canvas without CPU lag.
  * Center 16:9 widescreen animation displayed at full crisp resolution without cropping character artwork.
  * Semi-transparent dark header banner: `★ PART X ★` / `★ পর্ব X ★` / `★ भाग X ★` + Episode Title.
  * Semi-transparent bottom footer banner with Call-To-Action: `👉 সম্পূর্ণ ভিডিও দেখুন YouTube-এ @SimpleHistoryTellerBangla`.
* **Hardware Acceleration:** Uses `h264_mf` (GPU) delivering **>2.5x real-time slicing speed** (~85s for 3 multi-part Full HD shorts).
* **Automation Command:**
  ```bash
  node tools/dual_render_exporter.js <project_id>
  ```
* **Output Matrix:**
  * Video Files: `projects/<id>/renders/shorts/short_${lang}_part${num}.mp4`
  * Metadata File: `projects/<id>/renders/shorts/metadata_distribution.json` (auto-generates copy-paste titles, tags, and hooks for TikTok, IG Reels, and YT Shorts).

---

## 8. Step 7: 3D Thumbnail Design, SEO Optimization & User-Verified Publishing SOP

> **Core Rule: 100% Video Coverage, High-CTR 3D Typography & User-Verified Staging**

### 1. Master & Shorts Thumbnail Design Standards
* **3D Volumetric Typography:** Thumbnails must never use plain or flat system fonts. Use vibrant Bengali fonts (`Hind Siliguri Bold`, `Tiro Bangla`) with heavy 8px-12px black contours, golden-yellow/orange gradients, and drop shadows matching the Master Video benchmark (`প্রথম রাজা!`).
* **Shorts Thumbnail Safe-Zone:** Keep text within the upper 15%–35% zone to prevent overlap with YouTube Shorts/TikTok native UI controls.
* **Duration Indicator Rule:** Never display master video timeline ranges (such as `০:০০ - ১:১২` or `৩:৪৯ - ৫:০৩`) on a Short's thumbnail. Always display either:
  1. The Short's **actual duration** (e.g., `সময়: ১ মিনিট ১৩ সেকেন্ড`), OR
  2. Simply a clean episode badge (`[ ১ম পর্ব ]`, `[ ২য় পর্ব ]`).
* **Viral Hook Formulation:** Craft curiosity-inducing, culturally resonant titles (e.g., *"পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন!"* instead of dry labels like *"প্রথম কর"*).

### 2. Episodic Slicing Coverage (Zero Truncation)
* Slicing must cover **100% of the master documentary** (Scenes 1 to End).
* **Option A:** 4 to 5 comprehensive shorts (~2.5 to 3 minutes each, within YouTube Shorts' 3-minute limit).
* **Option B:** 8 to 11 bite-sized viral shorts (60 to 80 seconds each).

### 3. User-Verified Publishing Protocol (Browser Visibility Mandate)
1. **Visible Browser Mode:** Always launch Chrome with `headless: false`, `--start-maximized`, and bring to foreground via Windows PowerShell (`AppActivate('Chrome')`). The user must always be able to observe browser actions live.
2. **Stage First, Do Not Save Blindly:** Fill Title, Description (with timestamps & chapters), Tags, and attach the custom thumbnail.
3. **Capture Preview Screenshots:** Take screenshots of the staged form, copy to artifacts, and present to the user.
4. **Explicit User Approval:** Wait for user confirmation before clicking "Save" or "Publish".
5. **Rollout Order:** Finalize Bengali channel first (100% verified), then cross-post to Bengali Facebook/Instagram/TikTok, then localize for English and Hindi.

---

## 9. Web Studio UI (`http://localhost:4000`) Behavior

1. **Language Switcher (`[বাংলা | English | हिंदी]`):**
   * Clicking a language pill switches `S.previewLang`.
   * Timeline segment widths, total time counter (`#tTot`), and scene card duration tags dynamically recalculate to that language's exact durations.
   * Playhead and preview playback strictly follow that language's scene start/end timestamps and narration audio track.
2. **Audio Lane Status:**
   * The green audio lane at the bottom of the timeline displays `100%` filled width, confirming `narration_duration == timeline_duration` (no amber warnings, no empty gaps).
3. **Inspector Panel:**
   * Displays the duration for the active language.
   * Edits to duration automatically update `language_durations[S.previewLang]`.

---

## 8. Fail-Safes & Troubleshooting

* **CDP Connection Disconnected:**
  * Check process on port `9224`. If closed, spawn Chrome:
    `chrome.exe --remote-debugging-port=9224 --user-data-dir="C:\Users\badiu\.gemini\antigravity\scratch\chrome_aistudio_profile_3"`
* **AI Studio Dialog Modal Intercepts Clicks:**
  * Always dismiss modals or send `keyboard.press('Escape')` before clicking UI elements.
* **Flow Video Download Button Missing:**
  * Make sure to click `flow-video-tile` first to enter the full-screen scene editor view where the top-right header `button[aria-label="মিডিয়া ডাউনলোড করুন"]` is visible.
* **FFmpeg Not Recognized in Shell:**
  * Always use the bundled high-performance static binary at `bin\ffmpeg.exe` and `bin\ffprobe.exe`.

---

## STUDIO PRO v2 UPGRADE SPECIFICATIONS (SHORTS BUILDER, BRANDED 9:16 OVERLAYS, CLEAN BADGES & AUTO-THUMBNAIL EMBED)

1. **Interactive Shorts Studio Mode & Custom Part Builder (`shorts_config`):**
   - Users and Agents can define any number of Shorts episodes (e.g., `5`, `8`, `10`, `12` parts) and exact scene boundaries (`From Scene #` → `To Scene #`) via the **Shorts Builder Dialog** (`POST /api/project/:id/shorts/suggest` & `POST /api/project/:id/shorts/save`).
   - In **9:16 Shorts Studio Mode**, the preview player switches to a Portrait 9:16 canvas dockable to the Left, Center, or Right, displaying live **Top & Bottom Branded Overlays**:
     - **Top Header Card:** Circular Channel Logo + Channel Name + Handle + Part Pill (`পর্ব ১ / ১০`) + Highlighted Short Viral Hook Title.
     - **Bottom Footer Card:** Main Video Title (`🎬 মূল ভিডিও: ...`) + Red Subscribe CTA Bar (`▶ সম্পূর্ণ ভিডিও দেখুন চ্যানেলে • SUBSCRIBE`).
   - All exported Shorts (`exports/shorts/short_${lang}_part${num}.mp4`) composite these exact branded overlay plates so top and bottom blurred zones are 100% professional and advertisement-ready.

2. **Clean On-Screen Character & Role Badges (Zero Gemini Voice Names):**
   - On-screen speaker badges (`#pvSpeakerBadge` and rendered segment overlays) must ONLY display the Character Icon, Character Name, and Character Role (e.g., `📜 মূল ধারাভাষ্যকার | ডকুমেন্টারি ভয়েস`).
   - Gemini AI Studio internal voice names (`Charon`, `Cruz`, `Fenrir`, `Puck`, `Orus`, `🔊 Charon`, etc.) are strictly stripped by `stripVoiceNameFromRole()` and must NEVER appear on video frames.

3. **Project-Based `thumbnails/` Folder & 0.8s Intro Thumbnail Embedding:**
   - Every project stores generated thumbnails inside its own `projects/<id>/thumbnails/` directory:
     - Master Thumbnails: `projects/<id>/thumbnails/master/master_thumbnail_{bn|en|hi}.png`
     - Shorts Thumbnails: `projects/<id>/thumbnails/shorts/short_part_{01..N}_{bn|en|hi}.png`
   - During rendering (`server.js` and `tools/dual_render_exporter.js`), the corresponding Master or Short thumbnail is automatically prepended for the first `0.8s` of the video stream (`embedIntroThumbnail: true`) so YouTube, Facebook, TikTok, and Instagram Reels auto-select the thumbnail without separate manual upload steps.

4. **Motion Text Cards, TV News Ticker, Channel Logo & Vox/Voice of Dhaka Cutout Pan:**
   - **64 Camera Motions & Transitions:** Includes `vox_cutout_pan_lr`, `vox_cutout_pan_rl`, `vod_spotlight_glide`, and `floating_card_pan` (floating foreground cutout gliding over a blurred/textured paper backdrop).
   - **Motion Text Cards:** Per-scene kinetic text cards (`voice_of_dhaka_quote`, `vox_yellow_highlighter`, `vox_crimson_stamp`, `breaking_news_lower_third`, `historical_date_plate`, `thinker_minimal_stat`) paired with real `.wav` SFX triggers (`public/assets/sfx/`).
   - **TV Channel Scrolling News Ticker:** Configurable Top or Bottom news crawl (`project.ticker_config`).
   - **Existing Projects Guardrail:** Never modify or overwrite existing project folders in `projects/` unless explicitly edited and saved by the user.
