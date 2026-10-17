# Simple Studio (সিম্পল স্টুডিও) — Multi-Track Video & AI Production NLE

> **Triple-Channel Multi-Track Video & AI Production Workstation:**
> - 🇧🇩 **Simple Studio Bangla** (`exports/video_bn.mp4`)
> - 🌍 **Simple Studio English** (`exports/video_en.mp4`)
> - 🇮🇳 **Simple Studio Hindi** (`exports/video_hi.mp4`)

---

## 🚀 Quick Start (এক ক্লিকে চালু করার নিয়ম)

1. প্রজেক্টের রুট ফোল্ডারে থাকা **`run_studio.bat`** বা **`Launch_Simple_Studio.bat`** ফাইলে ডাবল-ক্লিক করুন।
2. স্বয়ংক্রিয়ভাবে লোকাল সার্ভার চালু হবে এবং ব্রাউজারে **`http://localhost:4000`** ওপেন হবে।
3. ডিফল্টভাবে **`sample_first_king`** প্রজেক্টটি ৬টি আলাদা ট্র্যাকসহ লোড হবে।

---

## 📁 প্রজেক্ট ডিরেক্টরি স্ট্রাকচার (Per-Language Scene-by-Scene Architecture)

**Simple Studio**-তে কোনো সিঙ্গেল মার্জড অডিও ফাইল বা ম্যানুফ্যাকচার (`concat.txt`) ফাইলের প্রয়োজন নেই। ভিজ্যুয়াল অ্যাসেটগুলো যেভাবে পার্ট-বাই-পার্ট ও সিন-বাই-সিন (`scene_0001.png`, `clip_scene_0003.mp4`) আলাদা থাকে, ঠিক একইভাবে **অডিওগুলোর জন্যও ৩টি ভাষার আলাদা ৩টি ফোল্ডার (`audio/bn/`, `audio/en/`, `audio/hi/`)** থাকে এবং তার ভেতর প্রতিটি সিনের অডিও আলাদাভাবে (`scene_0001.wav`, `scene_0002.wav`...) সেভ হয়:

```text
projects/my_new_episode/
├── project.json                    # মাস্টার সিন লিস্ট, ট্রাই-লিঙ্গুয়াল স্ক্রিপ্ট ও মাল্টি-ট্র্যাক টাইমলাইন ডাটা
├── CHARACTER_VOICE_MAP.json        # ক্যারেক্টার ভয়েস ও ভিজ্যুয়াল ডিএনএ ম্যাপিং (Agent Bridge)
├── AGENT_TASK_QUEUE.json           # এজেন্ট অটোমেশন কিউ ও সিএলআই কমান্ড ফাইল
├── AISTUDIO_TTS_SCREENPLAY.txt     # সিন-বাই-সিন ভয়েসওভার প্রম্পট প্যাক (BN / EN / HI)
├── FLOW_BATCH_PROMPTS.txt          # সিন-বাই-সিন ইমেজ জেনারেশন প্রম্পট প্যাক
├── FLOW_VEO_VIDEO_PROMPT.txt       # ডায়নামিক ভিডিও ক্লিপ প্রম্পট প্যাক
├── audio/
│   ├── bn/                         # 🇧🇩 বাংলা সিন-বাই-সিন ভয়েসওভার ফোল্ডার (আলাদা ক্লিপ)
│   │   ├── scene_0001.wav          # সিন ১-এর বাংলা অডিও ক্লিপ
│   │   ├── scene_0002.wav          # সিন ২-এর বাংলা অডিও ক্লিপ
│   │   └── scene_0003.wav          # সিন ৩-এর বাংলা অডিও ক্লিপ
│   ├── en/                         # 🌍 ইংলিশ সিন-বাই-সিন ভয়েসওভার ফোল্ডার (আলাদা ক্লিপ)
│   │   ├── scene_0001.wav          # সিন ১-এর ইংলিশ অডিও ক্লিপ
│   │   ├── scene_0002.wav          # সিন ২-এর ইংলিশ অডিও ক্লিপ
│   │   └── scene_0003.wav          # সিন ৩-এর ইংলিশ অডিও ক্লিপ
│   ├── hi/                         # 🇮🇳 হিন্দি সিন-বাই-সিন ভয়েসওভার ফোল্ডার (আলাদা ক্লিপ)
│   │   ├── scene_0001.wav          # সিন ১-এর হিন্দি অডিও ক্লিপ
│   │   ├── scene_0002.wav          # সিন ২-এর হিন্দি অডিও ক্লিপ
│   │   └── scene_0003.wav          # সিন ৩-এর হিন্দি অডিও ক্লিপ
│   ├── sfx/                        # 🔊 রিয়েল সাউন্ড ইফেক্টস ফোল্ডার (৫-লেয়ার SFX কিউ)
│   │   ├── paper_unfold_crisp.wav
│   │   ├── marker_highlighter_swipe.wav
│   │   └── portal_mystic_whoosh.wav
│   └── bgm/                        # 🎵 ব্যাকগ্রাউন্ড মিউজিক ফোল্ডার (একাধিক BGM সেগমেন্ট)
│       └── bgm_main.mp3
├── visual_assets/                  # 🎨 পার্ট-বাই-পার্ট ভিজ্যুয়াল অ্যাসেট ফোল্ডার
│   ├── scene_0001.png              # সিন ১-এর স্ট্যাটিক ইমেজ ট্র্যাক ক্লিপ
│   ├── scene_0002.png              # সিন ২-এর স্ট্যাটিক ইমেজ ট্র্যাক ক্লিপ
│   └── clip_scene_0003.mp4         # সিন ৩-এর ডায়নামিক ভিডিও ট্র্যাক ক্লিপ
├── metadata/                       # 🖼️ ইউটিউব থাম্বনেইল ও এসইও মেটাডাটা
│   ├── bn_thumbnail.jpg
│   ├── en_thumbnail.jpg
│   ├── hi_thumbnail.jpg
│   └── youtube_seo.json
└── exports/                        # 🚀 রেন্ডার শেষে ফাইনাল এক্সপোর্ট ফোল্ডার
    ├── video_bn.mp4                # ১০৮০পি ৬০এফপিএস বাংলা মাস্টার ভিডিও
    ├── video_en.mp4                # ১০৮০পি ৬০এফপিএস ইংলিশ মাস্টার ভিডিও
    ├── video_hi.mp4                # ১০৮০পি ৬০এফপিএস হিন্দি মাস্টার ভিডিও
    ├── video_bn.srt                # বাংলা সাবটাইটেল ফাইল
    ├── video_en.srt                # ইংলিশ সাবটাইটেল ফাইল
    ├── video_hi.srt                # হিন্দি সাবটাইটেল ফাইল
    └── shorts/                     # ৯:১৬ ভার্টিক্যাল শর্টস ও রিলস এক্সপোর্ট
```

---

## 🎨 সিম্পল স্টুডিওর মূল ফিচারসমূহ (CapCut / Filmora-Grade Multi-Track NLE)

### ১. ৬-লেয়ারের স্বতন্ত্র মাল্টি-ট্র্যাক টাইমলাইন (Manual + AI Agent Editable)
একটি প্রফেশনাল ভিডিও এডিটরে (যেমন CapCut, Filmora বা DaVinci Resolve) যেভাবে প্রতিটি ট্র্যাক আলাদাভাবে দেখা ও এডিট করা যায়, **Simple Studio**-তে নিচে ঠিক সেইরকম ৬টি আলাদা ট্র্যাক লেন রয়েছে:
- **Track 1 — FX & Transitions Track:** প্রতিটি সিনের ভিজ্যুয়াল ইফেক্ট (VFX) এবং ক্যামেরা মোশন/ট্রান্জিশন আলাদা ক্লিপ হিসেবে দেখা ও পরিবর্তন করা যায়।
- **Track 2 — Video Track (AI Clips):** ডায়নামিক এআই ভিডিও ক্লিপ (`clip_scene_XXXX.mp4`) আলাদা ট্র্যাকে প্রদর্শিত হয়।
- **Track 3 — Image Track (Storyboard):** স্ট্যাটিক ইমেজগুলো (`scene_XXXX.png`/`.jpg`) আলাদা ইমেজ ট্র্যাকে থাকে।
- **Track 4 — Voiceover Audio Track (`audio/bn/`, `en/`, `hi/`):** কোনো মার্জড অডিও নয়! প্রতিটি সিনের ভয়েসওভার ক্লিপ (`audio/bn/scene_0001.wav`, `scene_0002.wav`...) আলাদা আলাদা ওয়েভফর্ম ব্লক হিসেবে কোন ইমেজ বা ভিডিওর সাথে কোন অডিও গিয়েছে তা স্পষ্ট দেখা যায়।
- **Track 5 — SFX Track (`audio/sfx/`):** প্রতিটি সিনের সাউন্ড ইফেক্ট আলাদা ক্লিপ হিসেবে মুভ ও ট্রিম করা যায়।
- **Track 6 — BGM Soundtrack (`audio/bgm/`):** টাইমলাইনের কোন সেকেন্ড থেকে কোন সেকেন্ড পর্যন্ত বিজিএম থাকবে, তার ভলিউম (`dB`) এবং অটো-ডাকিং কেমন হবে তা আলাদা সেগমেন্ট হিসেবে ড্র্যাগ ও রিসাইজ করা যায়।

### ২. ম্যানুয়াল ড্র্যাগ-অ্যান্ড-ড্রপ, রিসাইজ এবং ব্লেড/রেজর স্প্লিট (Manual Editing Controls)
- **Resize / Trim Handles:** যেকোনো ট্র্যাকের যেকোনো ক্লিপের বাম বা ডান প্রান্ত ধরে টেনে ক্লিপটি বড় বা ছোট (Duration ও Trim In/Out) করা যায়।
- **Drag & Drop Move:** মাউস দিয়ে যেকোনো ক্লিপ টেনে এক জায়গা থেকে অন্য জায়গায় মুভ বা সোয়াপ করা যায় (**Ripple Sync Mode** এবং **Free Multi-Track Timestamp Mode**)।
- **Razor / Split Tool (`R` বা `B` কী):** রেজর টুল সিলেক্ট করে যেকোনো অডিও, ভিডিও, ইমেজ বা বিজিএম ক্লিপের ওপর ক্লিক করলে কাস্টম ব্লেড কার্সারের মাধ্যমে ক্লিপটি সাথে সাথে দুই ভাগে বিভক্ত (Split) হয়ে যায়।

### ৩. রিয়েল-টাইম অটো-ফোল্ডার ডিসকভারি (Zero Manufacture / Concat File)
- আগে যেভাবে সব পার্ট জেনারেট হওয়ার পর ম্যানুফ্যাকচার ফাইলের মাধ্যমে একসাথে যুক্ত করতে হতো, এখন আর তার প্রয়োজন নেই।
- একটি নির্দিষ্ট পার্টের অডিও (`audio/bn/scene_0001.wav`) বা ইমেজ (`visual_assets/scene_0001.png`) জেনারেট হয়ে ফোল্ডারে যোগ হওয়ার সাথে সাথেই স্টুডিওর **Auto-Discovery Engine** স্বয়ংক্রিয়ভাবে তা সনাক্ত করে এবং টাইমলাইনে যুক্ত করে দেখায়।
- সম্পূর্ণ ম্যানুয়াল ও এআই এডিটিং শেষ করে **Export (`Render & Export`)** বাটনে ক্লিক করলে ফাইনাল রেন্ডার হয়ে সরাসরি **`exports/`** ফোল্ডারে সেভ হয়।

### ৪. ৬০+ প্রফেশনাল ট্রান্জিশন ও ৬০+ ভিএফএক্স লাইব্রেরি (120+ Transitions & VFX)
- **৬০টি প্রফেশনাল ট্রান্জিশন ও ক্যামেরা মোশন:** Zoom In/Out (Fast, Slow, Corner, Punch, Elastic, Dolly Vertigo), Pan Left/Right/Up/Down, 4-Way Diagonal Pan, Whip Pan, Slide Push, Spin Vortex, 3D Card Flip, Page Peel, Clock Wipe, Iris Open/Close, Barn Door Split, Luma Dissolve, Dip to Black/White/Gold, Film Burn, Glitch Twitch, Handheld Sway, Earthquake Shake এবং Vox 12fps Stop-Motion।
- **৬০টি প্রফেশনাল ভিএফএক্স ও কালার গ্রেডিং ফিল্টার:** Vox Halftone Paper, Highlighter Callout, Chalkboard Grid, Classified Dossier, Parchment Scroll, Hollywood Teal & Orange, IMAX Cold Blue, Dune Amber, Matrix Green, Cyberpunk Neon, Kodak Portra 400, Fujifilm Velvia, Super-8mm, 16mm Newsreel, 1920s Silent Film, Daguerreotype, Chiaroscuro Noir, Sin City Red Splash, Candlelight Flicker, Noor Divine Bloom, God Rays, Golden Dust Motes, Anamorphic Streak, CRT Scanlines, VHS 1990s Tracking, RGB Chromatic Split, Night Vision HUD, Thermal Infrared, Rain Storm, Winter Snow, Battlefield Fire Embers, Sandstorm Haze, London Fog এবং Lightning Flash।
- নিচে ডকের **FX & Transitions (120+)** ট্যাব থেকে অথবা ডানপাশের ইন্সপেক্টর থেকে ১-ক্লিকে যেকোনো সিনে বা পুরো প্রজেক্টে প্রয়োগ করা যায়।

### ৫. রিয়েল অডিও ও সাউন্ড ইফেক্টস কালেকশন হাব (Real Audio & SFX Guide)
- অনলাইন থেকে ১০০% রিয়েল, কপিরাইট-মুক্ত স্টুডিও কোয়ালিটি সাউন্ড ইফেক্টস (SFX), ব্যাকগ্রাউন্ড মিউজিক (BGM) এবং ন্যাচারাল ভয়েসওভার কালেক্ট করার সম্পূর্ণ গাইড ও ডিরেক্ট ডাউনলোড লিংক অ্যাপের **Audio & SFX Hub** ট্যাবে এবং [`AUDIO_COLLECTION_GUIDE.md`](./AUDIO_COLLECTION_GUIDE.md) ফাইলে যুক্ত করা হয়েছে।
- আপনার ইন্টারনেট-যুক্ত পিসিতে `DOWNLOAD_REAL_AUDIO.bat` অথবা `node tools/download_real_audio_pack.js <project_id>` চালালে স্বয়ংক্রিয়ভাবে রিয়েল অডিও প্যাক ডাউনলোড ও ইমপোর্ট করা যাবে।

---

## 🛠️ সিস্টেম রিকোয়ারমেন্টস ও সিএলআই কমান্ড
- **OS:** Windows 10/11, macOS বা Linux
- **Node.js:** v18+
- **FFmpeg:** `bin/ffmpeg.exe` অথবা সিস্টেম `ffmpeg`
- **বিস্তারিত ইন্সট্রাকশন:** [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md), [`AUTONOMOUS_WORKFLOW_SOP.md`](./AUTONOMOUS_WORKFLOW_SOP.md), এবং [`AUDIO_COLLECTION_GUIDE.md`](./AUDIO_COLLECTION_GUIDE.md)।
