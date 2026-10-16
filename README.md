# Simple History Teller — Production Studio

> **Triple-Channel Automated YouTube History Network:**
> - 🇧🇩 **Simple History Teller Bangla** (`video_bn.mp4`)
> - 🌍 **Simple History Teller** (`video_en.mp4`)
> - 🇮🇳 **Simple History Teller Hindi** (`video_hi.mp4`)

---

## 🚀 Quick Start (এক ক্লিকে চালু করার নিয়ম)

1. প্রজেক্টের রুট ফোল্ডারে থাকা **`run_studio.bat`** ফাইলে ডাবল-ক্লিক করুন।
2. স্বয়ংক্রিয়ভাবে নোড সার্ভার চালু হবে এবং আপনার ব্রাউজারে **`http://localhost:4000`** ওপেন হবে।
3. ডিফল্টভাবে **`sample_first_king`** ডেমো প্রজেক্টটি লোড হবে।

---

## 🎨 স্টুডিওর মূল ফিচারসমূহ (Studio Features)

### ১. থ্রি-ওয়ে লাইভ প্রিভিউ প্লেয়ার (Trilingual Synchronized Preview)
- প্রিভিউ স্ক্রিনের উপরে থাকা **বাংলা / English / हिंदी** বাটন দিয়ে মুহূর্তেই ভাষা পরিবর্তন করে ভয়েসওভার ও সাবটাইটেল প্লে করে পরীক্ষা করা যায়।
- স্পেসবার (`Space`) চাপলে প্লে/পজ, কিবোর্ড অ্যারো কী (`←` / `→`) দিয়ে আগের বা পরের সিনে জাম্প করা যায়।
- **BGM Ducking স্লাইডার:** লাইভ প্লেব্যাকের সময় ব্যাকগ্রাউন্ড মিউজিকের ভলিউম পরিবর্তন করা যায় (ডিফল্ট: `-20 dB`)।

### ২. সিন ইন্সপেক্টর ও ড্রপজোন (Scene Inspector & Asset Swapper)
- প্রতিটি সিনের ছবি বা এআই ভিডিও ক্লিপ বদলানোর জন্য ইন্সপেক্টরের ড্রপজোনে ফাইল টেনে এনে ছেড়ে দিলেই হবে (`Drag & Drop`)।
- **Non-Destructive Archiving:** কোনো ফাইল রিপ্লেস করলে আগের ফাইল মুছে যায় না, স্বয়ংক্রিয়ভাবে `_history/` ফোল্ডারে টাইমস্ট্যাম্প সহ সেভ হয়ে থাকে।
- সিনের ডিউরেশন, স্পিকার নাম, টাইপ (`STATIC_IMAGE` / `DYNAMIC_AI_VIDEO`), মোশন ইফেক্ট (`zoom_in`, `zoom_out`, `pan_left`, `pan_right`, `static`, `ai_video`), SFX কিউ এবং ভিজ্যুয়াল প্রম্পট সরাসরি এডিট করা যায়।
- **Pacing Alert:** কোনো স্ট্যাটিক সিনের সময় ৩ সেকেন্ডের কম বা ৫ সেকেন্ডের বেশি হলে সিস্টেমে ওয়ার্নিং ডট দেখাবে।

### ৩. অডিও ট্র্যাক ও স্বয়ংক্রিয় টাইমলাইন ফিট (Audio Tracks & Timeline Fit)
- **Audio Tracks** ট্যাবে ৩টি ভাষার ন্যারেশন ফাইল (`bn_narration.wav`, `en_narration.wav`, `hi_narration.wav`) এবং ব্যাকগ্রাউন্ড মিউজিক (`bgm.mp3`) আপলোড ও প্রিভিউ করা যায়।
- **`Fit timeline` বাটন:** ভয়েসওভারের মোট দৈর্ঘ্যের সাথে যদি সিনের মোট দৈর্ঘ্য সামান্য কম-বেশি হয়, তাহলে ১-ক্লিকেই প্রতিটি সিনের ডিউরেশন প্রোপোরশনালি অ্যাডজাস্ট হয়ে যাবে।

### ৪. হার্ডওয়্যার এক্সিলারেটেড রেন্ডার ইঞ্জিন (GPU / APU / CPU Zero-Error System)
- **Dedicated GPU ও APU অটো-ডিটেকশন:** সিস্টেমে ডেডিকেটেড গ্রাফিক্স কার্ড (যেমন NVIDIA GeForce GTX/RTX) থাকলে তা সরাসরি NVENC চিপ ব্যবহার করে। আর যদি কোনো পিসিতে ডেডিকেটেড গ্রাফিক্স কার্ড না থাকে, তবে সিস্টেম স্বয়ংক্রিয়ভাবে প্রসেসরের নিজস্ব **APU / ইন্টিগ্রেটেড গ্রাফিক্স (AMD Ryzen APU / Radeon Vega অথবা Intel UHD / Iris Xe)** সনাক্ত করে D3D11 MFT বা AMF দিয়ে রেন্ডার করে।
- **Zero-Error CPU Fallback:** কোনো পিসিতে যদি কোনো ধরনের গ্রাফিক্স কার্ড বা APU ড্রাইভার না থাকে, অথবা রেন্ডারের মাঝে ড্রাইভার মেমরি সমস্যা করে, সিস্টেম কোনো ক্র্যাশ বা এরর না দিয়ে তৎক্ষণাৎ **CPU সফটওয়্যার মোডে (`libx264 veryfast`)** সুইচ করে নিরাপদে ১০০% রেন্ডার সম্পন্ন করে।
- **Visual Master Reuse:** সব কটি ভাষার জন্য ভিজ্যুয়াল সিনগুলো একবারই এনকোড হয় এবং `.cache/` ফোল্ডারে ক্যাশ থাকে। ফলে পরের বার মাত্র ৩–৫ সেকেন্ডের মধ্যেই নতুন রেন্ডার সম্পন্ন হয়!
- **Auto-Ducking & EBU R128 Loudness:** ভয়েস চলাকালীন সাইডচেইন কম্প্রেশনের মাধ্যমে BGM স্বয়ংক্রিয়ভাবে নরম হয়ে যায় এবং অডিওর লাউডনেস আন্তর্জাতিক ব্রডকাস্ট স্ট্যান্ডার্ড **-14 LUFS**-এ নরমালাইজড হয়।
- রেন্ডার শেষ হলে সরাসরি **`renders/`** ফোল্ডারে তিনটি হাই-কোয়ালিটি 1080p 60fps MP4 ফাইল তৈরি হয়:
  - `video_bn.mp4`
  - `video_en.mp4`
  - `video_hi.mp4`

### ৫. ডুয়াল-এক্সপোর্ট শর্টস/রিলস পাইপলাইন (Dual-Export Vertical Shorts Engine)
- **Episodic 9:16 Vertical Video (Part 1, Part 2, Part 3):** রেন্ডার প্যানেলে `Generate Vertical Shorts (9:16)` টিক দেওয়া থাকলে মাস্টার ভিডিও তৈরির সাথে সাথেই তা স্বয়ংক্রিয়ভাবে কেটে ধারাবাহিক ভার্টিক্যাল শর্টসে রূপান্তরিত হয়।
- **সিনেমাটিক ব্লার ব্যাকড্রপ ও ব্যান্ডিং:** মাঝখানে ক্রিস্প ১৬:৯ অ্যানিমেশন, উপরে পার্ট ব্যাজ ও টাইটেল, নিচে কল-টু-অ্যাকশন (`সম্পূর্ণ ভিডিও দেখুন YouTube-এ @SimpleHistoryTellerBangla`), এবং ব্যাকগ্রাউন্ডে হার্ডওয়্যার-অ্যাক্সিলারেটেড অ্যাম্বিয়েন্ট ব্লার ক্যানভাস।
- **সোশ্যাল মিডিয়া মেটাডাটা:** প্রতিটি পার্টের জন্য TikTok, Instagram Reels এবং YouTube Shorts-এর জন্য কপি-পেস্ট উপযোগী টাইটেল, ট্যাগ ও ডেসক্রিপশন `renders/shorts/metadata_distribution.json`-এ সেভ হয়।

### ৬. ইউটিউব লঞ্চপ্যাড (YouTube Launchpad & 3D Thumbnails)
- **Launchpad** ট্যাবে বাংলা, ইংলিশ ও হিন্দি চ্যানেলের জন্য আলাদা ৩ডি থাম্বনেইল ছবি আপলোড করা যায়।
- প্রতিটি ভাষার ভিডিও টাইটেল, এসইও ডেসক্রিপশন ও ট্যাগ সহজে কপি করার জন্য রয়েছে **1-Click Copy** বাটন।

---

## 🤖 ক্লাউড এআই ওয়ার্কফ্লো (Google Flow, Google AI Studio & Flux)

আমাদের সিস্টেম ইন্সট্রাকশন অনুযায়ী যেকোনো পর্ব তৈরির ৩টি ক্লাউড ধাপ:

### ধাপ ১: Google AI Studio — ত্রৈভাষিক এক্সপ্রেসভ ভয়েসওভার
- **মডেল:** `gemini-3.8-flash-tts` (`https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts`)
- **ভয়েস লাইব্রেরি:** ২০০০+ ভয়েসের মধ্য থেকে হোস্ট "দ্য টাইম ক্রনিকলার"-এর জন্য উষ্ণ ও ফ্রেন্ডলি টিউটর ভয়েস এবং ঐতিহাসিক চরিত্রের জন্য ডায়নামিক ভয়েস সিলেক্ট করা যায়।
- **এক্সপ্রেশন ট্যাগ:** সংলাপে `<gasp>`, `<laugh>`, `<whisper>`, `<sigh>` যোগ করে মানুষের মতো আবেগপূর্ণ ভয়েস তৈরি হয়।
- আউটপুট অডিও ফাইলগুলো `audio/bn_narration.wav`, `en_narration.wav`, `hi_narration.wav` হিসেবে সেভ হয়।

### ধাপ ২: Google Flow (`flow.google.com`) — দ্রুততম মাল্টি-প্রম্পট ব্যাচ ও মোশন ক্লিপ
- **চ্যাটবক্স মাল্টি-প্রম্পট ব্যাচিং:** ফ্লো-এর চ্যাটবক্সে একবারে পুরো স্ক্রিপ্টের ১০-২০টি সিনের প্রম্পট একসাথে পেস্ট করলে এটি একা একাই একের পর এক সব ছবি ক্রমান্বয়ে তৈরি করে দেয়।
- **ইমেজ-টু-ভিডিও অ্যাটাচমেন্ট (Veo):** যেসব সিনে অ্যাকশন বা ক্লাইম্যাক্স রয়েছে (যেমন সর্দার রেগে চিৎকার করা), সেখানে তৈরি হওয়া ছবিটি ফ্লো-তে সংযুক্ত (`+`) করে দিয়ে মোশন প্রম্পট দিলেই এটি ৩-৫ সেকেন্ডের নিখুঁত মোশন ক্লিপ তৈরি করে দেয়।
- আউটপুটগুলো `visual_assets/scene_XXXX.png` এবং `visual_assets/clip_scene_XXXX.mp4` এ রাখা হয়।

### ধাপ ৩: লোকাল স্টুডিওতে ১-ক্লিক রেন্ডার
- লোকাল স্টুডিও (`http://localhost:4000`) ফাইলগুলো রিড করে এবং ১-ক্লিকেই ৩টি চ্যানেলের জন্য ৩টি আলাদা ফুল ভিডিও এক্সপোর্ট করে দেয়।

---

## 📁 নতুন প্রজেক্ট তৈরির ডিরেক্টরি স্ট্রাকচার

যেকোনো নতুন ভিডিও বানানোর সময় `projects/<project_slug>/` ফোল্ডার তৈরি করুন:

```text
projects/my_new_episode/
├── project.json                # মাস্টার সিন লিস্ট ও ট্রাই-লিঙ্গুয়াল ডায়লগ
├── audio/
│   ├── bn_narration.wav        # বাংলা ভয়েসওভার
│   ├── en_narration.wav        # ইংলিশ ভয়েসওভার
│   ├── hi_narration.wav        # হিন্দি ভয়েসওভার
│   └── bgm.mp3                 # ব্যাকগ্রাউন্ড মিউজিক (অপশনাল)
├── visual_assets/
│   ├── scene_0001.png          # শেয়ার্ড ২ডি আর্টওয়ার্ক
│   ├── scene_0002.png
│   └── clip_scene_0003.mp4     # শেয়ার্ড ৩-৫ সেকেন্ডের এআই মোশন ক্লিপ
├── metadata/
│   ├── bn_thumbnail.png        # বাংলা থাম্বনেইল
│   ├── en_thumbnail.png        # ইংলিশ থাম্বনেইল
│   ├── hi_thumbnail.png        # হিন্দি থাম্বনেইল
│   └── youtube_seo.json        # টাইটেল, ডেসক্রিপশন ও ট্যাগ
├── automation_runs/            # প্রতি agent/tab-এর screenshot, DOM state ও failure evidence
│   └── <timestamp>__<workflow>__<id>/
└── renders/                    # এক্সপোর্ট হওয়া ফাইনাল ভিডিও
    ├── video_bn.mp4
    ├── video_en.mp4
    └── video_hi.mp4
```

## 🔎 Automation evidence ও portable transfer

প্রতিটি AI Studio / Flow / speech / BGM worker চালুর সময় তার account number, tab name এবং agent name দিয়ে আলাদা `automation_runs/` evidence folder তৈরি হয়। সেখানে প্রতি ৫–১০ সেকেন্ডে screenshot, একই সময়ের DOM state, event log ও ব্যর্থ হলে `failure.json` থাকে। Studio API থেকে সাম্প্রতিক runs দেখা যায় এবং `automation_runs` folder সরাসরি খোলা যায়।

একটি সম্পূর্ণ project—তার video, audio, image, render, metadata, workflow instructions এবং diagnostic evidence—একবারে অন্য PC-তে নেওয়ার জন্য:

```powershell
node tools/export_portable_project.js <project_id> --zip --hash
node tools/verify_portable_bundle.js <exported-folder>
```

Export folder-এর `RUN_PORTABLE.cmd` চালালে প্রয়োজনীয় npm dependency install করে Studio চালু হবে। নিরাপত্তার জন্য Google account login, browser cookies ও API keys export করা হয় না; নতুন PC-তে Automation Browser খুলে account-এ আবার sign in করতে হবে।

---

## 🛠️ সিস্টেম রিকোয়ারমেন্টস
- **OS:** Windows 10/11
- **Node.js:** v18+ (ইতিমধ্যে ইনস্টল্ড)
- **FFmpeg:** `bin/ffmpeg.exe` (ইতিমধ্যে কনফিগার করা আছে)
- **সিস্টেম ইন্সট্রাকশন:** বিস্তারিত আর্টওয়ার্ক প্রম্পট ও এআই গাইডলাইনের জন্য দেখুন [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md)।
