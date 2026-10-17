# এক্সাম্পল স্ক্রিপ্ট ফর ডিফারেন্ট অটোমেশন টাস্ক
## (Example Scripts for Different Automation Tasks)

এই ফোল্ডারে **"৩০০০ বছর আগে প্রাচীন পৃথিবীর মহাবিপর্যয়: ব্রোঞ্জ এজ কলাপ্স"** প্রজেক্ট তৈরি করার সময় ব্যবহৃত সমস্ত **মেইন স্ক্রিপ্ট (Main Scripts)** এবং **ফলব্যাক স্ক্রিপ্ট (Fallback Scripts)** সংরক্ষিত করা হয়েছে। 

যাতে পরবর্তীতে যেকোনো নতুন প্রজেক্ট, নতুন কোনো ভিডিও সেকশন বা অন্য কোনো কম্পিউটারে এই স্ক্রিপ্টগুলো হুবহু অনুসরণ করে সহজেই সম্পূর্ণ অটোমেশন পাইপলাইন চালু করা যায়।

---

### 📂 সংরক্ষিত স্ক্রিপ্টসমূহের সূচিপত্র ও ক্যাটাগরি (Script Catalog)

| নং | স্ক্রিপ্ট ফাইলের নাম | কাজের ধরন (Category) | মডেল / প্ল্যাটফর্ম | বিবরণ (Description) |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `01_tts_main_gemini_3_8_flash.js` | **TTS Narration (Main)** | `gemini-3.8-flash-tts` | **প্রধান ভয়েসওভার স্ক্রিপ্ট:** গুগল এআই স্টুডিওতে স্টাইল ও চরিত্র অনুযায়ী ডায়লগ ভয়েস তৈরি। |
| **02** | `02_tts_fallback_gemini_3_8_flash_lite.js` | **TTS Narration (Fallback)** | `gemini-3.8-flash-lite-tts` | **ফলব্যাক ভয়েসওভার স্ক্রিপ্ট:** ডেইলি রেট লিমিট শেষ হলে লাইট মডেলে সুইচ করে ভয়েস জেনারেশন। |
| **03** | `03_tts_fleet_worker_runner.js` | **Multi-Account Fleet Worker** | Multi-slot AI Studio | মাল্টিপল ব্রাউজার উইন্ডো/অ্যাকাউন্ট ব্যবহার করে প্যারালাল ভয়েসওভার রানার। |
| **04** | `04_sync_audio_timeline.js` | **Timeline Audio Sync** | Node.js + ffprobe | তৈরি হওয়া WAV অডিও ক্লিপগুলোর দৈর্ঘ্য মেপে `project.json` টাইমলাইনে সিঙ্ক করা। |
| **05** | `05_image_batch_generator_gemini_flash.js` | **Static Visuals (Batch)** | **Nano Banana 2.1** (`gemini-nano-banana-2.1`)<br>*(1st Fallback: Nano Banana 2 / `gemini-3.1-flash-image`)* | ৬৮টি ২ডি গ্রাফিক নভেল সিন অটোমেশনের মাধ্যমে হাই-রেজ্যুলেশন (1376×768) পিএনজি জেনারেট। |
| **06** | `06_test_single_image_generation.js` | **Static Visuals (Single Test)** | **Nano Banana 2.1** (`gemini-nano-banana-2.1`)<br>*(1st Fallback: Nano Banana 2)* | বড় ব্যাচ চালানোর আগে যেকোনো সিঙ্গেল সিনের প্রম্পট ও কোয়ালিটি টেস্টের স্ক্রিপ্ট। |
| **07** | `07_video_main_google_flow_veo.js` | **Dynamic Video (Main Flow)** | **Google Flow (Veo 3.1 Fast)** | **প্রধান ভিডিও স্ক্রিপ্ট:** `flow.google.com` প্রজেক্টে ঢুকে ১৬:৯ ওয়াইডস্ক্রিন ক্লিপ জেনারেট ও 720p ডাউনলোড। |
| **08** | `08_video_flow_tile_harvester.js` | **Video Tile Harvester** | Google Flow Web UI | গুগল ফ্লো-তে কিউতে থাকা জেনারেটেড ভিডিও টাইল ওপেন করে লোকাল ফোল্ডারে সেভ করার অটোমেশন। |
| **09** | `09_video_fallback_aistudio_veo.js` | **Dynamic Video (Fallback)** | AI Studio (`veo-3.1-fast`) | **ফলব্যাক ভিডিও স্ক্রিপ্ট:** গুগল ফ্লো সাময়িক ডাউন থাকলে এআই স্টুডিও দিয়ে ভিডিও তৈরি। |
| **10** | `10_test_single_video_flow.js` | **Flow Single Video Test** | Google Flow | গুগল ফ্লো-তে একটি মাত্র সিনের ভিডিও তৈরি ও ডাউনলোডের ইন্টারঅ্যাকশন টেস্ট। |
| **11** | `11_bgm_main_lyria_3_5_direct.js` | **AI Music BGM (Main Lyria)** | **Lyria 3.5 (AI Studio Pro)** | **প্রধান বিজিএম স্ক্রিপ্ট:** এআই স্টুডিও মিউজিকে প্রম্পট দিয়ে ১৬:৯ মাস্টার সাউন্ডট্র্যাক রেকর্ড ও সেভ। |
| **12** | `12_bgm_multi_act_generator.js` | **Multi-Act BGM Generator** | Lyria 3.5 | ৪টি ড্রামাটিক অ্যাক্টের জন্য আলাদা আলাদা থিমেটিক মিউজিক ট্র্যাক তৈরি। |
| **13** | `13_bgm_timeline_curator.js` | **BGM Timeline Curator** | FFmpeg Loudnorm | বিজিএমের লাউডনেস নরমালাইজেশন, লুপ এবং -20 dB ডাক কনফিগারেশন। |
| **14** | `14_thumbnail_generator_trilingual.js` | **Master Thumbnails** | **Nano Banana 2.1**<br>*(1st Fallback: Nano Banana 2)* | ইউটিউব চ্যানেলের জন্য বাংলা, ইংরেজি ও হিন্দিতে ৩টি ৪কে ক্লিকেবল থাম্বনেইল জেনারেশন। |
| **15** | `15_apply_cinematic_vfx_and_sfx.js` | **VFX, Motion & SFX Calibrator** | Studio NLE Engine (120+ FX) | ৮৫টি সিনে ৬১টি মোশন, ৬১টি কালার গ্রেড, ১৫টি অডিও এফএক্স এবং ১৫টি প্রসিডিউরাল SFX সংযোজন। |
| **16** | `16_generate_speaker_badges.js` | **Speaker Badges Generator** | Playwright Chromium | অন-স্ক্রিন ক্যারেক্টার ও ন্যারেটর ব্যাজের স্বচ্ছ (transparent) পিএনজি ওভারলে তৈরি। |
| **17** | `17_dual_render_and_shorts_exporter.js` | **Dual Master & Shorts Exporter** | FFmpeg NVENC/QSV/CPU | ১৬:৯ ফুল ভিডিওর পাশাপাশি ৫টি উল্লম্ব ৯:১৬ শর্টস/রিলস স্বয়ংক্রিয়ভাবে এক্সপোর্ট করার স্ক্রিপ্ট। |
| **18** | `18_trigger_master_composite_render.js` | **Render Trigger CLI** | Studio NLE REST API | টার্মিনাল থেকে স্টুডিওর মাস্টার রেন্ডার জব চালু এবং ট্র্যাক করার স্ক্রিপ্ট। |
| **19** | `19_verify_studio_ui_and_assets.js` | **Studio UI Verification** | Playwright Headless | স্টুডিও ইন্টারফেসে সমস্ত ভিডিও ক্লিপ, অডিও ও ইমেজ ফাইল সঠিকভাবে লোড হয়েছে কিনা তা অডিট। |
| **20** | `20_verify_speaker_badges_preview.js` | **Speaker Badge Audit** | Playwright Headless | প্লেয়ারে ক্যারেক্টার ব্যাজ থেকে ভয়েস মডেলের নাম রিমুভ নিশ্চিত করার ভেরিফিকেশন টেস্ট। |

---

### 🛠️ অন্য প্রজেক্টে বা অন্য কম্পিউটারে ব্যবহারের নিয়মাবলী (How to Adapt & Run)

#### ১. পূর্বশর্ত (Prerequisites):
- **Node.js (v18+)** ইনস্টল থাকতে হবে।
- **FFmpeg & FFprobe** সিস্টেম পাথে থাকতে হবে (বা স্টুডিওর `bin/ffmpeg.exe` ফোল্ডারে)।
- **Google Chrome** ইনস্টল থাকতে হবে এবং পারসিস্টেন্ট প্রোফাইল ডিরেক্টরি সেট করা থাকতে হবে (যেখানে পেইড/প্রো সাবস্ক্রিপশন লগইন করা আছে)।
  - ডিফল্ট প্রোফাইল পাথ: `C:\Users\<Username>\.gemini\antigravity\scratch\chrome_aistudio_profile`

#### ২. যেকোনো নতুন প্রজেক্টে স্ক্রিপ্ট অ্যাডাপ্ট করা:
স্ক্রিপ্টের শুরুতে থাকা কনফিগারেশন ভেরিয়েবলগুলোতে শুধুমাত্র আপনার নতুন প্রজেক্টের নাম ও সিন সংখ্যা পরিবর্তন করবেন:
```javascript
const PROJECT_ID = 'your_new_project_id'; // নতুন প্রজেক্টের ফোল্ডারের নাম
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
```

#### ৩. রান করার কমান্ড:
টার্মিনালে গিয়ে যে স্ক্রিপ্টটি চালাতে চান, নোড দিয়ে সরাসরি কল করুন:
```powershell
# যেমন: গুগল ফ্লো ভিডিও জেনারেট করতে:
node projects/simple_itihash_004_bronze_age_collapse/example_automation_scripts/07_video_main_google_flow_veo.js

# যেমন: লিরিয়া ৩.৫ দিয়ে বিজিএম তৈরি করতে:
node projects/simple_itihash_004_bronze_age_collapse/example_automation_scripts/11_bgm_main_lyria_3_5_direct.js
```

---
*প্রস্তুতকারক: Google Antigravity Agentic Pair Programmer & Simple History Teller Studio.*
