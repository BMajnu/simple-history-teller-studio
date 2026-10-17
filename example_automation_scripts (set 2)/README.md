# Example Scripts for Different Automation Tasks
# এক্সাম্পল স্ক্রিপ্ট ফর ডিফারেন্ট অটোমেশন টাস্ক

এই ফোল্ডারে **simple_itihash_004_first_city** (প্রথম শহর / Why did humans build the first city?) এপিসোড তৈরির সময় ব্যবহৃত সব স্ক্রিপ্ট উদাহরণ হিসেবে সংরক্ষণ করা হয়েছে। কোনো স্ক্রিপ্টের ভেতরে কোনো পরিবর্তন করা হয়নি — যেমনটি ছিল, ঠিক তেমনই কপি করা।

**কী কাজে লাগে:** পরবর্তীতে নতুন এপিসোড, নতুন সেকশন বা অন্য কম্পিউটারে নতুন অটোমেশন স্ক্রিপ্ট লেখার সময় এই স্ক্রিপ্টগুলো দেখে গাইডলাইন/টেমপ্লেট হিসেবে ব্যবহার করা যাবে।

---

## স্ক্রিপ্ট তালিকা (১৩টি)

### ১. স্ক্রিপ্ট জেনারেশন
| ফাইল | কাজ |
|------|-----|
| `gen_first_city_derivatives_004.js` | project.json থেকে ডেরিভেটিভ প্যাক তৈরি (TTS screenplay, image prompts, video prompts, voice map, agent queue) |

### ২. TTS (Text-to-Speech) জেনারেশন
| ফাইল | কাজ |
|------|-----|
| `run_tts_fleet_10workers.js` | **মেইন** — ১০-ওয়ার্কার ফ্লিট, মডেল চেইন ফলব্যাক (3.8-flash-tts → lite → 3.1-flash-tts-preview), কোটা ডিটেকশন, স্লট রোটেশন |
| `generate_project_tts.js` | **ফলব্যাক** — সিকোয়েনসিয়াল এক-এক করে TTS জেনারেটর (ফ্লিট না চললে) |
| `login_all_accounts_profile.js` | একাধিক Google অ্যাকাউন্ট একসাথে লগইন করে নতুন Chrome প্রোফাইলে সেভ করা |
| `add_single_session_profile.js` | একটা অ্যাকাউন্ট আলাদা করে প্রোফাইলে যোগ করা |
| `audit_profile_slots.js` | প্রোফাইলের u/0–u/7 স্লটে কোন অ্যাকাউন্ট আছে তার ম্যাপিং যাচাই |

### ৩. ইমেজ জেনারেশন
| ফাইল | কাজ |
|------|-----|
| `run_img_batch_firstcity.js` | সব static scene-এর ইমেজ ব্যাচ জেনারেটর (nano-banana → 3.1-flash-image → 3.1-flash-lite চেইন) |
| `verify_firstcity_statics.js` | জেনারেট হওয়া static ইমেজগুলোর ffprobe যাচাই (রেজোলিশন, সাইজ) |

### ৪. ভিডিও জেনারেশন (ডায়নামিক ক্লিপ)
| ফাইল | কাজ |
|------|-----|
| `run_vid_batch_firstcity.js` | ১৬টি ডায়নামিক ক্লিপের ফ্লিট — মডেল চেইন: omni-1.1-flash → veo-3.1-fast → veo-3.1-generate → veo-3.1-lite, প্রম্পট রিবিল্ড, কোটা রোটেশন |

### ৫. অডিও অ্যাসেম্বলি
| ফাইল | কাজ |
|------|-----|
| `assemble_firstcity_004.js` | ৮৮টি scene-এর TTS wav ফাইল অফসেট করে concat করে `{lang}_narration.wav` তৈরি + project.json-এ ডিউরেশন লেখা |
| `gen_bgm_lyria_firstcity.js` | AI Studio Lyria 3.5 দিয়ে ৫টি অ্যাক্টের BGM জেনারেট (মডেল UI অ্যাডাপ্ট, স্লট রোটেশন, ফ্রেশ টাইল ডিডুপ) |
| `assemble_bgm_firstcity.js` | Lyria অ্যাক্টগুলো ক্রসফেড করে ~1102s সিনলেস bgm.mp3 তৈরি + loudnorm -18 LUFS |

### ৬. রেন্ডার
| ফাইল | কাজ |
|------|-----|
| `trigger_render_firstcity.js` | Production Studio (port 4000) দিয়ে ৩ ভাষার মাস্টার রেন্ডার ট্রিগার + পোলিং (bgmDb -20, duck, shorts সহ) |

---

## ব্যবহারের নোট

- সব স্ক্রিপ্ট `playwright-core` + `bin/ffmpeg.exe` + `bin/ffprobe.exe` ব্যবহার করে।
- Chrome প্রোফাইল: `chrome_aistudio_profile` (ব্রোন্জ), `chrome_aistudio_profile_2` (TTS), `chrome_aistudio_profile_3` (ইমেজ/ভিডিও)।
- ডেমন: `http://127.0.0.1:9333` (Chrome CDP লঞ্চ + স্ক্রিপ্ট রান)।
- স্টুডিও সার্ভার: `http://127.0.0.1:4000` (রেন্ডার ট্রিগার/স্ট্যাটাস)।
- কোটা ফলব্যাক কৌশল: প্রথমে প্রধান মডেল, কোটা পেলে পরের মডেলে যাওয়া (ফরওয়ার্ড-ওনলি), প্রতিটি স্লটে আলাদা কোটা থাকলে স্লট রোটেশন।

*সংরক্ষণের সময়: 2026-10-17*
