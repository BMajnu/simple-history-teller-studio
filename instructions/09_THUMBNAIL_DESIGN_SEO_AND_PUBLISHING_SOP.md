# 09. THUMBNAIL DESIGN, SEO METADATA & MULTI-PLATFORM PUBLISHING SOP
**Ecosystem:** Simple History Teller Triple-Channel Automated Production Network  
**Objective:** Authoritative standard operating procedure for crafting high-CTR 3D thumbnails, structuring episodic shorts, and safely publishing master videos and shorts across YouTube, Facebook, Instagram, and TikTok with 100% user-verified staging.

---

## 1. High-CTR Thumbnail Design System (Master & Shorts)

### 1.1 The Visual Hook & 3D Typography Architecture
A documentary thumbnail is the single most decisive factor determining Click-Through Rate (CTR). Thumbnails must **NEVER** use basic, flat system fonts or generic stock text.

1. **Master Video Thumbnails (16:9 Landscape | 1920x1080 | <2MB):**
   * **Visual Composition:** Epic confrontation between key figures (e.g., angry caveman/rebel on the left vs arrogant monarch/emperor on golden throne on the right).
   * **Typography Style:** Massive, 3D embossed Bengali typography (`প্রথম রাজা!`, `প্রথম চাঁদাবাজি!`) featuring:
     - 4-layer gradient fill (Golden Yellow `#FFE600` to Deep Orange `#FF6D00`).
     - Heavy 8px-12px solid black stroke/outer contour.
     - Intense volumetric glow and drop shadow (`drop-shadow: 0 15px 35px rgba(0,0,0,0.95)`).
   * **Meme / OverSimplified Exclamations:** Punchy secondary speech bubbles or comic reactions (`¡¡খামোশ!!`, `¡¡AHHH!!`).

2. **Episodic Shorts Thumbnails (9:16 Vertical | 1080x1920 | <2MB):**
   * **Visual Hierarchy (Safe Zone):** YouTube Shorts and TikTok place UI icons (Like, Dislike, Comments, Audio pill, Channel handle) on the bottom 25% and right edge. Therefore:
     - **Top 15% – 35%:** Dedicated zone for the Part Badge, Duration Pill, and Viral Hook Headline.
     - **Center 40% – 75%:** Main dynamic character artwork / scene visual.
     - **Bottom 10%:** Minimalist branding watermark (`Simple History Teller Bangla`).
   * **Duration Rule (CRITICAL ERROR PREVENTION):**
     > [!CAUTION]
     > **NEVER WRITE MASTER-VIDEO TIMELINE SLICES ON SHORTS THUMBNAILS!**  
     > Writing master timeline ranges like `স্থায়িত্ব: ০:০০ - ১:১২ মিনিট` or `৩:৪৯ - ৫:০৩ মিনিট` causes extreme confusion for viewers and implies the video is cut off or missing.  
     > A Short's thumbnail must ALWAYS state either:
     > 1. The Short's **ACTUAL RUNTIME** (e.g., `সময়: ১ মিনিট ১৩ সেকেন্ড`, `সময়: ২ মিনিট ৪৫ সেকেন্ড`), OR
     > 2. Simply the clean Episode Badge (e.g., `[ ১ম পর্ব ]`, `[ ২য় পর্ব ]`).

### 1.2 Mandatory Text Inclusion in Thumbnail Prompts (The Inverse Negative-Text Rule)
> [!IMPORTANT]
> **THUMBNAILS MUST ALWAYS BE GENERATED WITH TEXT (DO NOT APPLY `--no text`):**
> * In standard scene image generation (Modules 02 & 03), the `--no text` constraint is strictly enforced to prevent baked-in subtitles or labels.
> * **FOR THUMBNAILS, THIS RULE IS INVERTED:** Thumbnail generation MUST explicitly include the dramatic Bengali hook title directly in the prompt (e.g., `"মানুষের প্রথম রাজা!"`, `"কৃষির মারণফাঁদ!"`, `"পৃথিবীর প্রথম চাঁদাবাজি!"`, `"সুমেরীয় সম্রাট!"`, `"রাজার পতন!"`).
> * The prompt must specify: `Large bold 3D embossed comic title in Bengali: "[TITLE]" with glowing golden-yellow fiery gradient and thick black outline`. This guarantees that the generated thumbnail features the high-impact meme comic typography directly on the visual.

---

## 2. Episodic Slicing & Complete Video Coverage Mandate

> [!IMPORTANT]
> **ZERO TRUNCATION RULE: 100% OF THE MASTER DOCUMENTARY MUST BE COVERED!**  
> Slicing only the first 4-5 minutes of a 12-to-20 minute documentary and abandoning the rest is strictly forbidden.  
> Every master documentary must be converted into shorts using one of two approved distribution architectures:

### Architecture A: 4 to 5 Complete Episodic Shorts (2.5 – 3 Minutes Each)
* **Target Audience:** YouTube Shorts (3-minute update) & Facebook Reels.
* **Coverage:** The entire 12–15 minute documentary is divided into **4 to 5 comprehensive narrative episodes** (~150s to 175s each).
* **Narrative Arc:**
  - **Part 1:** The Hook, Prehistoric Origins & The Unsolved Paradox.
  - **Part 2:** The Turning Point, Agricultural Revolution & Surplus Wealth.
  - **Part 3:** The Crisis, Warlords & The First Extortion/Tax System.
  - **Part 4:** The Climax, Divine Kingship & The World's First Standing Army.
  - **Part 5 (if applicable):** The Legacy, Modern Power Structures & Shocking Verdict.

### Architecture B: 8 to 11 Bite-Sized Viral Shorts (60 – 80 Seconds Each)
* **Target Audience:** TikTok, Instagram Reels, YouTube Shorts (under 90s).
* **Coverage:** The entire timeline is systematically sliced across **8 to 11 consecutive parts** (Scene 1 through Scene 79+).
* **Rule:** Never cap the loop at 4 parts. The slicing loop must continue until `currentStart >= totalDur - 10`.

---

## 3. High-CTR Viral Hook Naming Conventions (Bengali)

Academic, dry titles fail in algorithmic short-form feeds. Always translate historical realities into vivid, punchy, modern human parallels:

| Dry Academic Title (Banned) | High-CTR Viral Hook (Approved) | Cultural Resonance / Rationale |
| :--- | :--- | :--- |
| প্রথম কর ব্যবস্থা | **পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন!** ⚔️ | Relates ancient bronze-weapon tribute collection to modern protection rackets/mafia. |
| শিকারি সমাজের নিয়ম | **শিকারিকে উপহাস ও অহংকার দমনের গোপন রীতি!** 👑 | Creates deep psychological curiosity about Kalahari hunter culture. |
| কৃষি বিপ্লবের সূচনা | **কৃষিকাজের মারণফাঁদ ও লোভের জন্ম!** 🌾 | Highlights Harari's concept of the agricultural trap. |
| সুমেরীয় রাজাতালিকা | **আকাশ থেকে নামল রাজতন্ত্র ও প্রথম সম্রাট!** 🏛️ | Explores the mythical Sumerian King List descending from the heavens. |

---

## 4. User-Verified Publishing & Browser Visibility Protocol

> [!IMPORTANT]
> **THE "STAGE & PREVIEW BEFORE SAVE" MANDATE:**  
> When performing SEO updates, thumbnail uploads, or publishing on social channels, autonomous agents must NEVER click "Save" or "Publish" blindly without explicit user inspection.

### The 4-Step Verification Workflow:
1. **Launch Visible Maximized Browser:**
   - Always run Chrome in foreground mode (`headless: false`, `--start-maximized`).
   - Bring Chrome window to front on Windows via PowerShell:
     ```powershell
     powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate('Chrome')"
     ```
2. **Fill Form Completely (Staging Phase):**
   - Fill Title with emojis and Part indicators.
   - Fill Description with chapters, timestamps, hashtags, and call-to-action links.
   - Attach the custom thumbnail file.
   - Fill SEO tags under "Show more".
3. **Capture Preview Screenshots & Present to User:**
   - Take full-resolution screenshots of the staged form showing the attached thumbnail, title, and description.
   - Copy screenshots to the artifacts directory and present them in the chat.
4. **Wait for User Confirmation:**
   - **DO NOT CLICK SAVE** until the user explicitly reviews the preview and provides confirmation.

---

## 5. Multi-Platform Sequential Rollout Strategy

1. **Step 1: Finalize Bengali Channel First (100% Polish):**
   - Complete Master Video SEO, thumbnail, and public status on `Simple History Teller Bangla`.
   - Complete all episodic shorts with custom thumbnails and descriptions.
2. **Step 2: Cross-Post to Bengali Social Media:**
   - Upload identical shorts and master assets to Facebook Page (`Simple History Teller Bangla`), Facebook Reels, Instagram Reels, and TikTok (`@simplehistorytellerbn`).
3. **Step 3: English Global Rollout:**
   - Apply localized English thumbnails (`en_thumbnail.jpg`), SEO metadata, and shorts to `Simple History Teller`.
4. **Step 4: Hindi Channel Rollout:**
   - Apply localized Hindi thumbnails (`hi_thumbnail.jpg`), Devanagari SEO metadata, and shorts to `Simple History Teller Hindi`.
