/**
 * Simple Studio (সিম্পল স্টুডিও) — Multi-Track Non-Linear Video Editor & AI Production Engine
 * Local web studio: CapCut/Filmora-style multi-track timeline (FX, Video, Image, Voiceover Audio, SFX, BGM),
 * manual drag-and-drop & trim/split editing, AI agent editing API, live auto-folder part discovery
 * (zero manual manufacture/concat step required), and hardware-accelerated FFmpeg rendering to exports/.
 */
const http = require('http');
let express, cors, multer;
try {
  express = require('express');
  cors = require('cors');
  multer = require('multer');
} catch {
  // Zero-dependency native Node HTTP fallback when node_modules is not present
  const urlMod = require('url');
  express = () => {
    const routes = [];
    const statics = [];
    const appObj = {
      use: (a, b) => { if (typeof a === 'string' && b?.__staticDir) statics.push({ prefix: a, dir: b.__staticDir }); else if (a?.__staticDir) statics.push({ prefix: '', dir: a.__staticDir }); },
      get: (p, ...h) => routes.push({ m: 'GET', p, h: h[h.length - 1] }),
      post: (p, ...h) => (Array.isArray(p) ? p : [p]).forEach(x => routes.push({ m: 'POST', p: x, h: h[h.length - 1] })),
      put: (p, ...h) => routes.push({ m: 'PUT', p, h: h[h.length - 1] }),
      listen: (port, cb) => {
        const srv = http.createServer((req, res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
          res.status = (c) => { res.statusCode = c; return res; };
          res.set = (obj) => { Object.entries(obj).forEach(([k, v]) => res.setHeader(k, v)); return res; };
          res.flushHeaders = res.flushHeaders || (() => {});
          res.json = (obj) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(obj)); };
          const parsed = urlMod.parse(req.url, true);
          req.query = parsed.query || {};
          const pathname = decodeURIComponent(parsed.pathname || '/');
          for (const rt of routes) {
            if (rt.m !== req.method) continue;
            const keys = [];
            const rx = new RegExp('^' + rt.p.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
            const m = pathname.match(rx);
            if (m) {
              req.params = {};
              keys.forEach((k, i) => req.params[k] = m[i + 1]);
              if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                let raw = [];
                req.on('data', c => raw.push(c));
                req.on('end', () => {
                  const buf = Buffer.concat(raw);
                  try { req.body = buf.length ? JSON.parse(buf.toString('utf8')) : {}; } catch { req.body = {}; }
                  rt.h(req, res);
                });
              } else {
                rt.h(req, res);
              }
              return;
            }
          }
          // Static file fallback
          for (const st of statics) {
            if (pathname.startsWith(st.prefix)) {
              const relP = pathname.slice(st.prefix.length) || '/index.html';
              const absP = path.join(st.dir, relP === '/' ? 'index.html' : relP);
              if (fs.existsSync(absP) && fs.statSync(absP).isFile()) {
                const ext = path.extname(absP).toLowerCase();
                const mimes = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };
                res.setHeader('Content-Type', mimes[ext] || 'application/octet-stream');
                return fs.createReadStream(absP).pipe(res);
              }
            }
          }
          res.status(404).json({ error: 'Not found' });
        });
        return srv.listen(port, cb);
      }
    };
    return appObj;
  };
  express.json = () => (req, res, next) => next && next();
  express.static = (dir) => ({ __staticDir: dir });
  cors = () => (req, res, next) => next && next();
  multer = () => ({ single: () => (req, res, next) => next && next() });
}
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');
const { stripVoiceNameFromRole, suggestShortsParts, runPillowScript, runPlateScript, closePlateRenderer } = require('./lib/media-compositor');

const ROOT = __dirname;
const PORT = process.env.PORT || 4000;
const PROJECTS = path.join(ROOT, 'projects');
const TMP = path.join(ROOT, '.tmp_uploads');
const binOr = (name) => (fs.existsSync(path.join(ROOT, 'bin', name + '.exe')) ? path.join(ROOT, 'bin', name + '.exe') : name);
const FFMPEG = binOr('ffmpeg');
const FFPROBE = binOr('ffprobe');

const LANGS = { bn: 'Simple Studio Bangla', en: 'Simple Studio English', hi: 'Simple Studio Hindi' };
const W = 1920, H = 1080, FPS = 60;
const IMG_EXT = ['.png', '.jpg', '.jpeg', '.webp'];
const VID_EXT = ['.mp4', '.mov', '.webm', '.mkv'];
const AUD_EXT = ['.wav', '.mp3', '.m4a', '.aac', '.ogg', '.flac'];
const MOTIONS = [
  "static",
  "zoom_in",
  "zoom_out",
  "zoom_in_fast",
  "zoom_out_fast",
  "zoom_in_slow",
  "zoom_out_slow",
  "zoom_in_top_left",
  "zoom_in_top_right",
  "zoom_in_bottom",
  "pan_left",
  "pan_right",
  "pan_up",
  "pan_down",
  "pan_diag_tl_br",
  "pan_diag_tr_bl",
  "pan_diag_bl_tr",
  "pan_diag_br_tl",
  "pan_left_zoom_in",
  "pan_right_zoom_out",
  "whip_pan_left",
  "whip_pan_right",
  "whip_pan_up",
  "whip_pan_down",
  "slide_push_left",
  "slide_push_right",
  "slide_push_up",
  "slide_push_down",
  "elastic_bounce_in",
  "overshoot_snap_zoom",
  "crossfade",
  "dip_to_black",
  "dip_to_white",
  "dip_to_gold",
  "luma_fade_in",
  "flash_bulb_cut",
  "film_burn_transition",
  "light_leak_wipe",
  "smoke_dissolve",
  "blur_dissolve",
  "clock_wipe_cw",
  "iris_circle_open",
  "iris_circle_close",
  "split_horizontal_open",
  "split_vertical_open",
  "page_peel_curl",
  "spin_cw_in",
  "spin_ccw_in",
  "pendulum_tilt",
  "flip_3d_card",
  "vox_stop_motion",
  "parallax_25d",
  "map_zoom_highlight",
  "handheld_docu",
  "earthquake_tremor",
  "heartbeat_pulse_zoom",
  "vertigo_dolly_zoom",
  "glitch_twitch_cut",
  "cinematic_glow",
  "vox_cutout_pan_lr",
  "vox_cutout_pan_rl",
  "vod_spotlight_glide",
  "floating_card_pan",
  "ai_video"
];

const VFX_EFFECTS = [
  "none",
  "vox_halftone_paper",
  "highlighter_callout",
  "chalkboard_grid",
  "classified_dossier",
  "parchment_manuscript",
  "papercraft_cutout_shadow",
  "newspaper_microfilm",
  "blueprint_cyanotype",
  "red_thread_board",
  "anamorphic_cinema",
  "teal_orange_blockbuster",
  "christopher_nolan_cold",
  "dune_desert_amber",
  "matrix_cyber_green",
  "blade_runner_neon",
  "wes_anderson_pastel",
  "fincher_neo_noir",
  "golden_hour_sunset",
  "moonlight_cobalt",
  "bleach_bypass_grit",
  "vivid_hdr_pop",
  "vintage_sepia_grain",
  "kodak_portra_400",
  "fujifilm_velvia_50",
  "super8_home_movie",
  "16mm_newsreel_bw",
  "silent_era_1920s",
  "daguerreotype_1850",
  "polaroid_instant_fade",
  "technicolor_3strip",
  "damaged_celluloid",
  "archival_noir_vignette",
  "sin_city_splash",
  "chiaroscuro_caravaggio",
  "candlelight_flicker",
  "interrogation_lamp",
  "torchlight_dungeon",
  "eclipse_corona_dark",
  "tunnel_vision_dread",
  "noor_divine_bloom",
  "ethereal_dream_mist",
  "heavenly_god_rays",
  "celestial_starlight",
  "golden_dust_motes",
  "prism_rainbow_flare",
  "anamorphic_blue_streak",
  "sacred_candle_aura",
  "crt_scanlines",
  "vhs_1990s_tracking",
  "rgb_chromatic_split",
  "cyber_glitch_slice",
  "night_vision_goggles",
  "thermal_infrared",
  "rain_storm_glass",
  "winter_snow_blizzard",
  "battlefield_fire_embers",
  "sandstorm_haze",
  "london_thick_fog",
  "lightning_thunder_flash"
];

const AUDIO_EFFECTS = [
  "studio_clean",
  "warm_tube_narrator",
  "philosophical_intimate",
  "old_radio_archival",
  "echo_hall_reverent",
  "telephone_intercept",
  "crispy_podcast_comp",
  "deep_cinema_trailer",
  "stadium_crowd_pa",
  "whisper_asmr_boost",
  "tape_cassette_warble",
  "cathedral_sacred_choir",
  "gramophone_1920s",
  "walkie_talkie_military",
  "de_esser_broadcast_pro"
];

const STYLE_PRESETS = {
  PRESET_VOX_DOCUMENTARY: {
    id: 'PRESET_VOX_DOCUMENTARY',
    name: '📰 Full Vox-Style AI Documentary',
    bn_name: 'ভক্স স্টাইল এআই ডকুমেন্টারি',
    benchmark: 'Vox / Srijan Builds / Rachit Singh (4 Core Rules)',
    default_motion: 'vox_stop_motion',
    default_vfx: 'vox_halftone_paper',
    default_audio_fx: 'studio_clean',
    default_voice: 'Rasalgethi',
    default_style_prompt: 'articulate, curious, well-paced Vox documentary host',
    avg_clip_sec: 4.5,
    wpm: 145,
    video_ratio: 0.25,
    style_lock_positive: 'Vox-style editorial cutout collage illustration on aged cream newsprint paper (#F3EFE6) with subtle millimeter graph grid (#D8D2C5). RULE 1: One central Hero Cutout Object occupying 70% focus. RULE 2: 40% generous uncluttered empty paper space around hero. RULE 3: High-contrast monochrome black-and-white newspaper halftone photo cutout paired with strictly ONE vibrant Vox Highlighter Yellow (#FFE600) or Crimson (#E63946) accent highlight. RULE 4: Locked static camera perspective, tactile paper drop-shadow, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, clutter, 3d cgi gloss, rainbow colors'
  },
  PRESET_VOICE_OF_DHAKA: {
    id: 'PRESET_VOICE_OF_DHAKA',
    name: '🎙️ Professional Explanation (Voice of Dhaka Style)',
    bn_name: 'প্রফেশনাল এক্সপ্লেনেশন (ভয়েস অফ ঢাকা স্টাইল)',
    benchmark: 'Voice of Dhaka (Literary, Historical & Social Deep-Dive)',
    default_motion: 'parallax_25d',
    default_vfx: 'archival_noir_vignette',
    default_audio_fx: 'warm_tube_narrator',
    default_voice: 'Charon',
    default_style_prompt: 'deep, resonant, authoritative, emotionally rich documentary storyteller',
    avg_clip_sec: 7.5,
    wpm: 132,
    video_ratio: 0.20,
    style_lock_positive: 'Moody cinematic archival documentary composition in Voice of Dhaka style. Deep nocturnal obsidian background (#0B0E14), dramatic warm tungsten spotlight beam illuminating the central historical/literary subject, 2.5D layered depth planes for parallax motion, fine archival engraving and oil-wash texture, solemn philosophical atmosphere, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, bright cartoon colors, stickman'
  },
  PRESET_POLITICAL_EXPLAINER: {
    id: 'PRESET_POLITICAL_EXPLAINER',
    name: '🗺️ Political & Geopolitical Explainer (Nasir Tamzid Style)',
    bn_name: 'পলিটিক্যাল ও জিওপলিটিক্যাল এক্সপ্লেনেশন',
    benchmark: 'Nasir Tamzid Official (The Tricky Politics Explained)',
    default_motion: 'map_zoom_highlight',
    default_vfx: 'highlighter_callout',
    default_audio_fx: 'studio_clean',
    default_voice: 'Orus',
    default_style_prompt: 'crisp, analytical, investigative geopolitical journalist',
    avg_clip_sec: 6.0,
    wpm: 150,
    video_ratio: 0.20,
    style_lock_positive: 'High-impact geopolitical and constitutional explainer graphic. Topographic dark-mode war-room map or institutional diagram with glowing emerald and crimson provincial borders, tactile classified dossier paper clippings, clean analytical visual hierarchy, dramatic Rim lighting, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, messy clutter'
  },
  PRESET_PHILOSOPHICAL_THINKER: {
    id: 'PRESET_PHILOSOPHICAL_THINKER',
    name: '🧠 Manual & Philosophical Essay (The Thinker Style)',
    bn_name: 'ম্যানুয়াল ও মনস্তাত্ত্বিক এক্সপ্লেনেশন (দ্য থিংকার)',
    benchmark: 'The Thinker (Psychology, Metacognition & Life Philosophy)',
    default_motion: 'zoom_out',
    default_vfx: 'chalkboard_grid',
    default_audio_fx: 'philosophical_intimate',
    default_voice: 'Enceladus',
    default_style_prompt: 'intimate, reflective, calm late-night philosophical essayist',
    avg_clip_sec: 8.0,
    wpm: 125,
    video_ratio: 0.15,
    style_lock_positive: 'Minimalist dark slate canvas (#090D16) with luminous hand-drawn vector conceptual illustration or clean statistical curve (cyan #38BDF8 and warm amber #F5C451 lines), paired with solitary contemplative cinematic atmosphere, generous negative space, introspective mood, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, noisy background'
  },
  PRESET_CARTOON_DRAMA: {
    id: 'PRESET_CARTOON_DRAMA',
    name: '🎬 AI Cartoon Drama & Moral/Finance Story',
    bn_name: 'এআই কার্টুন ড্রামা ও শিক্ষণীয় গল্প',
    benchmark: 'Surya Money Management Bangla (Rakib vs Sohel 10-Year Arc)',
    default_motion: 'zoom_in',
    default_vfx: 'cinematic_glow',
    default_audio_fx: 'studio_clean',
    default_voice: 'Iapetus',
    default_style_prompt: 'warm, expressive, relatable Bengali drama storyteller',
    avg_clip_sec: 6.5,
    wpm: 138,
    video_ratio: 0.30,
    style_lock_positive: 'Warm expressive 2D/3D stylized animated drama illustration set in contemporary Bangladesh/South Asia. Consistent character facial anatomy and outfits across scenes, rich warm cinematic lighting, authentic local details (roadside tea stall, Dhaka office, suburban land plot, family home), emotional facial acting, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, deformed hands'
  },
  PRESET_REALISTIC_DRAMA: {
    id: 'PRESET_REALISTIC_DRAMA',
    name: '🎥 Realistic Cinematic Drama & Thriller',
    bn_name: 'রিয়েলিস্টিক সিনেমাটিক ড্রামা ও থ্রিলার',
    benchmark: 'Photorealistic 35mm AI Cinema & Docu-Drama',
    default_motion: 'handheld_docu',
    default_vfx: 'anamorphic_cinema',
    default_audio_fx: 'warm_tube_narrator',
    default_voice: 'Algenib',
    default_style_prompt: 'tense, grounded, realistic cinema narrator with emotional weight',
    avg_clip_sec: 5.5,
    wpm: 135,
    video_ratio: 0.35,
    style_lock_positive: 'Photorealistic live-action cinema frame shot on Arri Alexa Mini LF with 35mm anamorphic prime lens f/1.8, natural human skin pores and realistic lighting, shallow depth of field, volumetric atmospheric haze, Teal and Orange Hollywood color grading, strict character facial consistency via start+end keyframes, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, cartoon, illustration, CGI plastic skin'
  },
  PRESET_ISLAMIC_REVERENT: {
    id: 'PRESET_ISLAMIC_REVERENT',
    name: '🕌 Religious / Islamic Historical & Moral Documentary',
    bn_name: 'ধর্মীয় ও ইসলামিক ইতিহাস ডকুমেন্টারি',
    benchmark: 'Dignified Islamic History & Moral Chronicles (Noor-Veil Guardrail)',
    default_motion: 'zoom_in',
    default_vfx: 'noor_divine_bloom',
    default_audio_fx: 'echo_hall_reverent',
    default_voice: 'Sadaltager',
    default_style_prompt: 'dignified, reverent, serene and scholarly historical narrator',
    avg_clip_sec: 8.0,
    wpm: 128,
    video_ratio: 0.20,
    style_lock_positive: 'Magnificent and reverent historical illustration inspired by classical Islamic illuminated miniature manuscripts and grand Abbasid/Andalusian architecture. Lapis lazuli blue (#1A365D), desert gold (#D4AF37), and emerald green palette, ornate horseshoe arches, geometric arabesques. STRICT NOOR-VEIL RULE: Holy personalities are never depicted with facial features—always shown via environmental POV or veiled in radiant golden-white divine light, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, caricature, comical faces, prophet facial features'
  },
  PRESET_STICKY_MEME: {
    id: 'PRESET_STICKY_MEME',
    name: '🎭 Sticky-Meme Satirical History (OverSimplified)',
    bn_name: 'স্টিকি-মিম স্যাটায়ার ইতিহাস (ওভারসিম্পলিফাইড)',
    benchmark: 'OverSimplified / Simple History Teller Core',
    default_motion: 'zoom_in',
    default_vfx: 'none',
    default_audio_fx: 'studio_clean',
    default_voice: 'Cruz',
    default_style_prompt: 'An Old Story Teller, Old Man voice',
    avg_clip_sec: 8.5,
    wpm: 145,
    video_ratio: 0.20,
    style_lock_positive: 'Distinctive satirical historical 2D webcomic illustration in OverSimplified style. Smooth ovoid white egg-head (#FFFFFF), solid 5px black comic contour lines (#000000), minimalist stick-figure limbs, flat vibrant vector fills, expressive comic facial emotion, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, photorealistic, 3d render, gradients'
  },
  PRESET_SIMPLE_HISTORY: {
    id: 'PRESET_SIMPLE_HISTORY',
    name: '🏛️ 2D Cutout Empires & Battles (Simple History)',
    bn_name: '২ডি কাটআউট সাম্রাজ্য ও যুদ্ধ ইতিহাস',
    benchmark: 'Simple History Cutout Vector Documentary',
    default_motion: 'pan_right',
    default_vfx: 'vintage_sepia_grain',
    default_audio_fx: 'studio_clean',
    default_voice: 'Charon',
    default_style_prompt: 'informative, authoritative military & civilization historian',
    avg_clip_sec: 8.0,
    wpm: 140,
    video_ratio: 0.20,
    style_lock_positive: 'Stylized 2D flat vector historical illustration in Simple History cutout aesthetic. Clean geometric blocky human proportions, historically accurate period armor and attire, subtle cream papercraft sticker border on aged parchment texture (#F4ECD8), 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, photorealistic, stickman'
  },
  PRESET_MYSTERY_NOIR: {
    id: 'PRESET_MYSTERY_NOIR',
    name: '🕵️ Graphic Novel Mystery & Conspiracy Noir',
    bn_name: 'গ্রাফিক নভেল মিস্ট্রি ও কনস্পিরেসি নয়ার',
    benchmark: 'Ligne Claire & Pulp Noir Chiaroscuro',
    default_motion: 'parallax_25d',
    default_vfx: 'archival_noir_vignette',
    default_audio_fx: 'warm_tube_narrator',
    default_voice: 'Algenib',
    default_style_prompt: 'hushed, suspenseful noir investigator voice',
    avg_clip_sec: 7.5,
    wpm: 130,
    video_ratio: 0.20,
    style_lock_positive: 'Cinematic 2D graphic novel noir mystery illustration, heavy chiaroscuro black ink shadows (#11161F), fine crosshatching and vintage halftone texture, warm amber lantern light (#F6A83B) cutting through dark fog, 16:9 widescreen, 4K.',
    style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, bright cheerful colors, stickman'
  }
};

const AISTUDIO_VOICES = [
  { id: 'Cruz', gender: 'Male', age: 'Elderly', profile: 'Weathered, wise, gravelly elder storyteller', defaultStyle: 'An Old Story Teller, Old Man voice', bestFor: 'The Time Chronicler (Host), Wise Elder' },
  { id: 'Charon', gender: 'Male', age: 'Adult/Mature', profile: 'Deep, resonant, authoritative documentary voice', defaultStyle: 'deep, resonant, authoritative documentary narrator', bestFor: 'Voice of Dhaka Narrator, History Narrator' },
  { id: 'Orus', gender: 'Male', age: 'Adult', profile: 'Firm, crisp, analytical, decisive', defaultStyle: 'crisp, analytical, investigative geopolitical journalist', bestFor: 'Political Explainer (Nasir Tamzid Style)' },
  { id: 'Enceladus', gender: 'Male', age: 'Adult', profile: 'Breathy, intimate, reflective, calm', defaultStyle: 'intimate, reflective, calm philosophical essayist', bestFor: 'Philosophical Essay (The Thinker Style)' },
  { id: 'Rasalgethi', gender: 'Male', age: 'Adult', profile: 'Informative, articulate, structured', defaultStyle: 'articulate, curious, well-paced Vox documentary host', bestFor: 'Vox Style Documentary Host' },
  { id: 'Sadaltager', gender: 'Male', age: 'Mature', profile: 'Knowledgeable, dignified, scholarly', defaultStyle: 'dignified, reverent, scholarly and serene cadence', bestFor: 'Islamic / Religious History Scholar' },
  { id: 'Iapetus', gender: 'Male', age: 'Young Adult', profile: 'Clear, grounded, relatable, earnest', defaultStyle: 'warm, grounded, humble and sincere young man', bestFor: 'Cartoon/Realistic Drama Protagonist (Rakib)' },
  { id: 'Achird', gender: 'Male', age: 'Young Adult', profile: 'Friendly, casual, expressive, upbeat', defaultStyle: 'friendly, expressive, slightly impulsive conversational tone', bestFor: 'Drama Friend / FoilCharacter (Sohel)' },
  { id: 'Fenrir', gender: 'Male', age: 'Adult', profile: 'Booming, excitable, intense, commanding', defaultStyle: 'commanding, booming, fierce authoritarian voice', bestFor: 'Kings, Emperors, Warlords, Antagonists' },
  { id: 'Algenib', gender: 'Male', age: 'Mature', profile: 'Gravelly, dark, dramatic, tense', defaultStyle: 'gravelly, tense, dramatic thriller narrator', bestFor: 'Mystery Noir, Realistic Thriller' },
  { id: 'Algieba', gender: 'Male', age: 'Adult', profile: 'Smooth, polished, charismatic', defaultStyle: 'smooth, engaging, polished storyteller', bestFor: 'Business & Biography Documentaries' },
  { id: 'Alnilam', gender: 'Male', age: 'Adult', profile: 'Firm, broadcast-ready, serious', defaultStyle: 'serious, authoritative news broadcast anchor', bestFor: 'News & Constitutional Quotes' },
  { id: 'Puck', gender: 'Male', age: 'Youth', profile: 'Youthful, snappy, energetic, playful', defaultStyle: 'playful, fast-paced, witty and energetic', bestFor: 'Young Comic Side Characters (Forbidden for Anchor)' },
  { id: 'Sadachbia', gender: 'Male', age: 'Adult', profile: 'Lively, dynamic, animated', defaultStyle: 'lively, high-energy, dynamic delivery', bestFor: 'High-Retention Hooks & Action Beats' },
  { id: 'Schedar', gender: 'Male', age: 'Adult', profile: 'Even, balanced, steady instructional', defaultStyle: 'clear, even-paced, instructional guide', bestFor: 'Manual Explanation & Tutorials' },
  { id: 'Umbriel', gender: 'Male', age: 'Adult', profile: 'Easy-going, relaxed, warm', defaultStyle: 'relaxed, warm, easy-going storyteller', bestFor: 'Slice-of-Life & Travel Documentaries' },
  { id: 'Zubenelgenubi', gender: 'Male', age: 'Adult', profile: 'Casual, natural conversational', defaultStyle: 'casual, natural conversational delivery', bestFor: 'Multi-Speaker Podcast & Interviews' },
  { id: 'Bodi', gender: 'Male', age: 'Elderly', profile: 'Quiet, ancient, weathered low pitch', defaultStyle: 'weathered, intimate, ancient elder voice', bestFor: 'Ancient Sages, Old Major, Mystics' },
  { id: 'Koda', gender: 'Male', age: 'Adult', profile: 'Earnest, humble, medium-low pitch', defaultStyle: 'earnest, distressed, humble citizen voice', bestFor: 'Citizens, Farmers, Eyewitnesses' },
  { id: 'Kore', gender: 'Female', age: 'Adult', profile: 'Firm, regal, confident, authoritative', defaultStyle: 'commanding, regal, articulate and confident', bestFor: 'Queens, Female Anchors, Investigative Leads' },
  { id: 'Aoede', gender: 'Female', age: 'Adult', profile: 'Breezy, melodic, warm, expressive', defaultStyle: 'melodic, warm, engaging storyteller', bestFor: 'Literary & Cultural Storytelling' },
  { id: 'Gacrux', gender: 'Female', age: 'Mature', profile: 'Mature, wise, grounded, maternal', defaultStyle: 'mature, wise, warm and compassionate elder', bestFor: 'Matriarchs, Mothers, Senior Historians' },
  { id: 'Erinome', gender: 'Female', age: 'Adult', profile: 'Clear, crisp, analytical professional', defaultStyle: 'clear, crisp, analytical documentary presenter', bestFor: 'Vox Science & Data Explainers' },
  { id: 'Despina', gender: 'Female', age: 'Adult', profile: 'Smooth, calm, composed, soothing', defaultStyle: 'smooth, calm, deeply reflective and soothing', bestFor: 'Philosophical & Psychology Essays' },
  { id: 'Autonoe', gender: 'Female', age: 'Adult', profile: 'Bright, articulate, engaging educator', defaultStyle: 'bright, clear, engaging educator', bestFor: 'Manual Explainer & Academic Guides' },
  { id: 'Callirrhoe', gender: 'Female', age: 'Young Adult', profile: 'Easy-going, natural, empathetic', defaultStyle: 'natural, empathetic, realistic conversational acting', bestFor: 'Realistic & Cartoon Drama Female Lead' },
  { id: 'Sulafat', gender: 'Female', age: 'Adult', profile: 'Warm, heartfelt, emotional', defaultStyle: 'warm, heartfelt, reverent and emotional', bestFor: 'Moral & Religious Stories' },
  { id: 'Pulcherrima', gender: 'Female', age: 'Adult', profile: 'Forward, theatrical, expressive', defaultStyle: 'dramatic, expressive, theatrical delivery', bestFor: 'Character Drama & Monologues' },
  { id: 'Laomedeia', gender: 'Female', age: 'Young Adult', profile: 'Upbeat, lively, curious', defaultStyle: 'upbeat, curious, lively presenter', bestFor: 'Pop-Culture & Curiosity Videos' },
  { id: 'Zephyr', gender: 'Female', age: 'Youth', profile: 'Bright, youthful, high-energy', defaultStyle: 'bright, energetic, punchy hook delivery', bestFor: 'Shorts/Reels Hooks & Young Characters' },
  { id: 'Leda', gender: 'Female', age: 'Child/Teen', profile: 'Youthful, innocent, gentle', defaultStyle: 'youthful, innocent, gentle voice', bestFor: 'Child Characters & Apprentices' },
  { id: 'Vindemiatrix', gender: 'Female', age: 'Adult', profile: 'Gentle, soft-spoken, poetic', defaultStyle: 'gentle, soft-spoken, poetic cadence', bestFor: 'Poetry & Literary Quotes' },
  { id: 'Achernar', gender: 'Female', age: 'Adult', profile: 'Soft, whispery, atmospheric', defaultStyle: 'soft, hushed, suspenseful inner monologue', bestFor: 'Mystery Noir & Thriller Whispers' }
];

const SFX_LIBRARY = [
  { id: 'paper_unfold_crisp', layer: 'L1: Vox & Paper UI', label: '📄 Paper Unfold Crisp (Vox Cutout)', synth: 'anoisesrc=c=white:r=48000:a=0.35:d=0.45,bandpass=f=2400:w=1200,afade=t=in:d=0.04,afade=t=out:st=0.25:d=0.2' },
  { id: 'marker_highlighter_swipe', layer: 'L1: Vox & Paper UI', label: '🖍️ Marker Highlighter Swipe', synth: 'anoisesrc=c=pink:r=48000:a=0.28:d=0.55,bandpass=f=3200:w=1800,afade=t=in:d=0.05,afade=t=out:st=0.35:d=0.2' },
  { id: 'typewriter_mechanical_key', layer: 'L1: Vox & Paper UI', label: '⌨️ Typewriter Quote Clack (Voice of Dhaka)', synth: 'anoisesrc=c=white:r=48000:a=0.5:d=0.35,highpass=f=1800,apulsator=mode=square:hz=14,afade=t=out:st=0.25:d=0.1' },
  { id: 'rubber_stamp_impact', layer: 'L1: Vox & Paper UI', label: '📛 Classified Rubber Stamp Thud', synth: 'sine=f=95:d=0.35,afade=t=out:st=0.05:d=0.3,volume=0.8' },
  { id: 'camera_shutter_flash', layer: 'L1: Vox & Paper UI', label: '📸 Archival Camera Shutter Flash', synth: 'anoisesrc=c=white:r=48000:a=0.45:d=0.25,highpass=f=2500,afade=t=out:st=0.08:d=0.17' },
  { id: 'page_turn_parchment', layer: 'L1: Vox & Paper UI', label: '📜 Ancient Parchment Page Turn', synth: 'anoisesrc=c=pink:r=48000:a=0.25:d=0.6,bandpass=f=1900:w=1100,afade=t=in:d=0.08,afade=t=out:st=0.35:d=0.25' },
  { id: 'map_pin_drop', layer: 'L1: Vox & Paper UI', label: '📍 Geopolitical Map Pin Pop', synth: 'sine=f=680:d=0.22,afade=t=out:st=0.03:d=0.19,volume=0.55' },
  { id: 'chalk_draw_stroke', layer: 'L1: Vox & Paper UI', label: '✏️ Bell Curve Chalk Draw (The Thinker)', synth: 'anoisesrc=c=white:r=48000:a=0.22:d=0.7,bandpass=f=2800:w=900,afade=t=in:d=0.05,afade=t=out:st=0.45:d=0.25' },
  { id: 'whoosh_fast_cut', layer: 'L2: Transitions & Risers', label: '💨 Fast Explainer Whoosh Cut', synth: 'anoisesrc=c=pink:r=48000:a=0.4:d=0.45,bandpass=f=600:w=500,afade=t=in:d=0.12,afade=t=out:st=0.22:d=0.23' },
  { id: 'portal_mystic_whoosh', layer: 'L2: Transitions & Risers', label: '🌀 Time Chronicler Portal Whoosh', synth: 'sine=f=180:d=1.2,vibrato=f=6:d=0.5,afade=t=in:d=0.2,afade=t=out:st=0.7:d=0.5,volume=0.45' },
  { id: 'riser_tension_build', layer: 'L2: Transitions & Risers', label: '📈 Cinematic Tension Riser', synth: 'sine=f=220:d=1.8,afade=t=in:d=1.4,afade=t=out:st=1.5:d=0.3,volume=0.4' },
  { id: 'sub_bass_boom_hit', layer: 'L2: Transitions & Risers', label: '💥 Dark Sub-Bass Impact Boom', synth: 'sine=f=58:d=1.4,afade=t=out:st=0.15:d=1.25,volume=0.75' },
  { id: 'clock_ticking_suspense', layer: 'L2: Transitions & Risers', label: '⏱️ Suspense Clock Ticking', synth: 'anoisesrc=c=white:r=48000:a=0.3:d=1.5,highpass=f=3000,apulsator=mode=square:hz=2,afade=t=out:st=1.2:d=0.3' },
  { id: 'heartbeat_slow_dread', layer: 'L2: Transitions & Risers', label: '💓 Slow Thriller Heartbeat', synth: 'sine=f=52:d=1.5,apulsator=mode=sine:hz=1.2,afade=t=out:st=1.1:d=0.4,volume=0.7' },
  { id: 'glitch_data_reveal', layer: 'L2: Transitions & Risers', label: '📟 Digital Dossier Data Blip', synth: 'sine=f=1200:d=0.3,apulsator=mode=square:hz=18,afade=t=out:st=0.15:d=0.15,volume=0.35' },
  { id: 'rain_window_cottage', layer: 'L3: Diegetic Environment', label: '🌧️ Rain on Cottage Window (Orwell 1943)', synth: 'anoisesrc=c=pink:r=48000:a=0.18:d=2.0,lowpass=f=1600,afade=t=in:d=0.3,afade=t=out:st=1.5:d=0.5' },
  { id: 'desert_wind_whistle', layer: 'L3: Diegetic Environment', label: '🏜️ Ancient Desert Wind Whistle', synth: 'anoisesrc=c=brown:r=48000:a=0.22:d=2.0,bandpass=f=450:w=300,afade=t=in:d=0.3,afade=t=out:st=1.5:d=0.5' },
  { id: 'crowd_protest_murmur', layer: 'L3: Diegetic Environment', label: '👥 Political Crowd & Uprising Murmur', synth: 'anoisesrc=c=pink:r=48000:a=0.25:d=1.8,bandpass=f=700:w=500,afade=t=in:d=0.2,afade=t=out:st=1.3:d=0.5' },
  { id: 'parliament_gavel_strike', layer: 'L3: Diegetic Environment', label: '🔨 Constitutional Gavel Strike', synth: 'sine=f=140:d=0.3,afade=t=out:st=0.04:d=0.26,volume=0.75' },
  { id: 'footsteps_gravel_night', layer: 'L3: Diegetic Environment', label: '👣 Footsteps on Gravel / Grass', synth: 'anoisesrc=c=white:r=48000:a=0.25:d=1.2,bandpass=f=1200:w=800,apulsator=mode=square:hz=2.2' },
  { id: 'tea_cup_clink_stall', layer: 'L3: Diegetic Environment', label: '☕ Dhaka Tong Tea Cup Clink (Drama)', synth: 'sine=f=2400:d=0.25,afade=t=out:st=0.02:d=0.23,volume=0.4' },
  { id: 'coins_cash_register', layer: 'L3: Diegetic Environment', label: '🪙 Coins & Savings Chime (Finance Story)', synth: 'sine=f=1850:d=0.4,afade=t=out:st=0.05:d=0.35,volume=0.45' },
  { id: 'motorbike_highway_night', layer: 'L3: Diegetic Environment', label: '🏍️ Night Highway Motorbike Hum', synth: 'sine=f=88:d=1.8,vibrato=f=9:d=0.6,afade=t=in:d=0.2,afade=t=out:st=1.3:d=0.5,volume=0.45' },
  { id: 'sword_clash_steel', layer: 'L4: Historical & Epic', label: '⚔️ Ancient Sword & Shield Clash', synth: 'anoisesrc=c=white:r=48000:a=0.5:d=0.4,highpass=f=2800,afade=t=out:st=0.06:d=0.34' },
  { id: 'royal_decree_fanfare', layer: 'L4: Historical & Epic', label: '🎺 Royal Decree Brass Chime', synth: 'sine=f=440:d=1.2,afade=t=in:d=0.1,afade=t=out:st=0.8:d=0.4,volume=0.45' },
  { id: 'war_horn_distant', layer: 'L4: Historical & Epic', label: '📯 Distant Bronze War Horn', synth: 'sine=f=130.81:d=1.8,afade=t=in:d=0.3,afade=t=out:st=1.2:d=0.6,volume=0.55' },
  { id: 'torch_fire_crackle', layer: 'L4: Historical & Epic', label: '🔥 Torch & Campfire Crackle', synth: 'anoisesrc=c=pink:r=48000:a=0.2:d=1.6,highpass=f=1200,afade=t=in:d=0.2,afade=t=out:st=1.2:d=0.4' },
  { id: 'noor_ethereal_shimmer', layer: 'L5: Reverent & Contemplative', label: '✨ Reverent Golden Noor Shimmer', synth: 'sine=f=528:d=1.6,aecho=0.8:0.88:60:0.4,afade=t=in:d=0.3,afade=t=out:st=1.0:d=0.6,volume=0.35' },
  { id: 'dawn_birds_peaceful', layer: 'L5: Reverent & Contemplative', label: '🕊️ Peaceful Dawn Atmosphere', synth: 'sine=f=880:d=1.2,vibrato=f=7:d=0.4,afade=t=in:d=0.2,afade=t=out:st=0.8:d=0.4,volume=0.25' },
  { id: 'vinyl_crackle_warm', layer: 'L5: Reverent & Contemplative', label: '📻 Warm Archival Vinyl Dust', synth: 'anoisesrc=c=white:r=48000:a=0.12:d=1.8,highpass=f=2200,afade=t=in:d=0.2,afade=t=out:st=1.4:d=0.4' },
  { id: 'text_card_pop_chime', layer: 'L1: Vox & Paper UI', label: '💬 Text Card Pop Chime (Kinetic Typography)', synth: 'sine=f=740:d=0.24,afade=t=in:d=0.01,afade=t=out:st=0.06:d=0.18,volume=0.5' },
  { id: 'news_ticker_broadcast_beep', layer: 'L1: Vox & Paper UI', label: '📺 TV News Ticker Broadcast Alert', synth: 'sine=f=1046.5:d=0.18,apulsator=mode=square:hz=8,afade=t=out:st=0.08:d=0.1,volume=0.4' },
  { id: 'vod_cinematic_hit', layer: 'L2: Transitions & Risers', label: '🎙️ Voice of Dhaka Deep Impact Hit', synth: 'sine=f=65:d=1.1,aecho=0.8:0.85:90:0.35,afade=t=out:st=0.2:d=0.9,volume=0.75' },
  { id: 'vox_cutout_slide_swish', layer: 'L1: Vox & Paper UI', label: '✂️ Vox Floating Cutout Slide Swish', synth: 'anoisesrc=c=pink:r=48000:a=0.38:d=0.38,bandpass=f=1450:w=900,afade=t=in:d=0.06,afade=t=out:st=0.18:d=0.2' }
];

fs.mkdirSync(PROJECTS, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(ROOT, 'public')));
app.use('/projects', express.static(PROJECTS, { etag: false, maxAge: 0 }));
app.use('/references', express.static(path.join(ROOT, 'references')));
app.use('/banner_assets', express.static(path.join(ROOT, 'banner_assets')));
const upload = multer({ dest: TMP, limits: { fileSize: 4 * 1024 * 1024 * 1024 } });

/* ---------------------------------------------------------------- helpers */
const safeId = (id) => {
  if (!/^[\w-]+$/.test(id)) throw httpErr(400, 'Invalid project id');
  return id;
};
const httpErr = (code, msg) => Object.assign(new Error(msg), { code });
const pdir = (id) => path.join(PROJECTS, safeId(id));
const exists = (p) => fs.existsSync(p);
const pad4 = (n) => String(n).padStart(4, '0');

async function readJson(file, fallback) {
  try { return JSON.parse(await fsp.readFile(file, 'utf8')); } catch { return fallback; }
}

/** Find `dir/base.*` (any extension from list). */
function findFile(dir, base, exts) {
  if (!exists(dir)) return null;
  const f = fs.readdirSync(dir).find((n) => path.parse(n).name.toLowerCase() === base.toLowerCase() && exts.includes(path.extname(n).toLowerCase()));
  return f ? path.join(dir, f) : null;
}

const probeCache = new Map();
function probeDuration(file) {
  if (!file || !exists(file)) return Promise.resolve(null);
  let st;
  try { st = fs.statSync(file); } catch { return Promise.resolve(null); }
  const key = `${file}|${st.mtimeMs}|${st.size}`;
  if (probeCache.has(key)) return Promise.resolve(probeCache.get(key));
  return new Promise((resolve) => {
    const p = spawn(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.on('close', () => {
      const d = parseFloat(out) || null;
      probeCache.set(key, d);
      resolve(d);
    });
    p.on('error', () => resolve(null));
  });
}

function probeDurSync(abs) {
  if (!abs || !exists(abs)) return 0;
  try {
    const st = fs.statSync(abs);
    const key = `${abs}|${st.mtimeMs}|${st.size}`;
    if (probeCache.has(key) && probeCache.get(key)) return probeCache.get(key);
    const o = execFileSync(FFPROBE, ['-hide_banner', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', abs]).toString().trim();
    const d = parseFloat(o);
    const val = isFinite(d) ? d : 0;
    probeCache.set(key, val);
    return val;
  } catch {
    return 0;
  }
}

const rel = (id, abs) => {
  if (!abs) return null;
  if (abs.startsWith(pdir(id))) return `/projects/${id}/${path.relative(pdir(id), abs).split(path.sep).join('/')}`;
  if (abs.startsWith(ROOT)) return `/${path.relative(ROOT, abs).split(path.sep).join('/')}`;
  return null;
};
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(e.code || 500).json({ error: e.message }));

/**
 * Resolve scene visual asset with automatic discovery across `parts/`, `visual_assets/`, and project root.
 */
function resolveSceneAsset(dir, s) {
  if (s && s.asset_file) {
    const abs = path.join(dir, s.asset_file);
    if (exists(abs)) return { abs, isFallback: false };
  }
  if (!s) return { abs: null, isFallback: false };
  const pad = pad4(s.scene_id);
  const rawNum = String(s.scene_id);
  const vdir = path.join(dir, 'visual_assets');
  const partsDir = path.join(dir, 'parts');
  const partSubDir = path.join(partsDir, `part_${pad}`);

  const candidates = [
    findFile(partSubDir, `visual`, [...VID_EXT, ...IMG_EXT]),
    findFile(partSubDir, `clip`, VID_EXT),
    findFile(partSubDir, `image`, IMG_EXT),
    findFile(partsDir, `part_${pad}`, [...VID_EXT, ...IMG_EXT]),
    findFile(partsDir, `clip_part_${pad}`, VID_EXT),
    findFile(partsDir, `shot_${pad}`, [...VID_EXT, ...IMG_EXT]),
    findFile(partsDir, `scene_${pad}`, [...VID_EXT, ...IMG_EXT]),
    findFile(vdir, `clip_scene_${pad}`, VID_EXT),
    findFile(vdir, `clip_shot_${pad}`, VID_EXT),
    findFile(vdir, `clip_part_${pad}`, VID_EXT),
    findFile(vdir, `scene_${pad}`, [...VID_EXT, ...IMG_EXT]),
    findFile(vdir, `shot_${pad}`, [...VID_EXT, ...IMG_EXT]),
    findFile(vdir, `part_${pad}`, [...VID_EXT, ...IMG_EXT]),
    findFile(vdir, `scene_${rawNum}`, [...VID_EXT, ...IMG_EXT]),
    findFile(vdir, `shot_${rawNum}`, [...VID_EXT, ...IMG_EXT]),
    findFile(dir, `scene_${pad}`, IMG_EXT),
    findFile(dir, `shot_${pad}`, IMG_EXT),
  ];
  const found = candidates.find((c) => c && exists(c));
  if (found) return { abs: found, isFallback: Boolean(s.asset_file) };
  // Fallback to repository reference & banner artwork so the studio never shows empty slates
  const refPool = [
    path.join(ROOT, 'references', 'ref_style_1_sticky_meme.jpg'),
    path.join(ROOT, 'references', 'ref_style_2_simple_history.jpg'),
    path.join(ROOT, 'references', 'ref_style_3_mystery_noir.jpg'),
    path.join(ROOT, 'references', 'ref_style_4_islamic_reverent.jpg'),
    path.join(ROOT, 'references', 'ref_host_chronicler.jpg'),
    path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg'),
    path.join(ROOT, 'references', 'ref_host_simple_history.jpg'),
    path.join(ROOT, 'banner_assets', 'banner_background_raw.jpg'),
    path.join(ROOT, 'banner_assets', 'history_mascot_01_pyramid_arch_quill.jpg'),
    path.join(ROOT, 'banner_assets', 'history_mascot_02_torch_stone_arch_ruins.jpg'),
    path.join(ROOT, 'banner_assets', 'history_mascot_03_ancient_tome_pillars.jpg'),
    path.join(ROOT, 'banner_assets', 'history_mascot_05_antique_gold_coin_seal.jpg'),
  ].filter((p) => exists(p));
  if (refPool.length) {
    const idx = (Number(s.scene_id) || 1) % refPool.length;
    return { abs: refPool[idx], isFallback: true };
  }
  return { abs: null, isFallback: false };
}

/**
 * Resolve individual part/scene audio clip for a given scene_id and language.
 * Scans `parts/`, `audio/parts/`, `audio/raw_aistudio/`, `audio/raw/`, `audio/padded/`, `audio/shots_neural/`, `audio/`.
 */
function resolvePartAudio(dir, sceneId, lang, customFile) {
  if (customFile) {
    const abs = path.join(dir, customFile);
    if (exists(abs)) return abs;
  }
  const pad = pad4(sceneId);
  const rawNum = String(sceneId);
  const searchDirs = [
    path.join(dir, 'audio', lang),
    path.join(dir, 'parts', lang),
    path.join(dir, 'parts', `part_${pad}`),
    path.join(dir, 'parts'),
    path.join(dir, 'audio', 'parts'),
    path.join(dir, 'audio', 'raw_aistudio'),
    path.join(dir, 'audio', 'raw'),
    path.join(dir, 'audio', 'padded'),
    path.join(dir, 'audio', 'shots_neural'),
    path.join(dir, 'audio'),
  ];
  const baseNames = [
    `scene_${pad}`,
    `part_${pad}`,
    `shot_${pad}`,
    `scene_${rawNum}`,
    `part_${rawNum}`,
    `shot_${rawNum}`,
    `${lang}_scene_${pad}`,
    `${lang}_part_${pad}`,
    `${lang}_shot_${pad}`,
    `part_${pad}_${lang}`,
    `shot_${pad}_${lang}`,
    `scene_${pad}_${lang}`,
    `${lang}_shot_${pad}_padded`,
    `${lang}_scene_${pad}_padded`,
    `audio_${lang}`,
    `${lang}_part_${rawNum}`,
    `${lang}_shot_${rawNum}`,
    `${lang}_scene_${rawNum}`,
  ];
  for (const sdir of searchDirs) {
    if (!exists(sdir)) continue;
    for (const base of baseNames) {
      const f = findFile(sdir, base, AUD_EXT);
      if (f && exists(f)) return f;
    }
  }
  return null;
}

/**
 * Scan all monitored folders in a project to auto-discover generated audio/visual parts
 * even if only 1 part has been generated so far and without requiring any manual manufacture/concat file.
 */
async function autoDiscoverProjectParts(id, persistToDisk = false) {
  const dir = pdir(id);
  if (persistToDisk) {
    await fsp.mkdir(path.join(dir, 'parts'), { recursive: true });
    for (const l of ['bn', 'en', 'hi', 'sfx', 'bgm']) await fsp.mkdir(path.join(dir, 'audio', l), { recursive: true });
    await fsp.mkdir(path.join(dir, 'visual_assets'), { recursive: true });
    await fsp.mkdir(path.join(dir, 'exports'), { recursive: true });
    await fsp.mkdir(path.join(dir, 'thumbnails', 'master'), { recursive: true });
    await fsp.mkdir(path.join(dir, 'thumbnails', 'shorts'), { recursive: true });
  }

  const pjFile = path.join(dir, 'project.json');
  let project = await readJson(pjFile, null);
  if (!project) {
    project = {
      project_id: id,
      brand: 'Simple Studio',
      style_preset: 'PRESET_STICKY_MEME',
      metadata: { title_bn: id, title_en: id, title_hi: id },
      scenes: [],
    };
  }
  if (!Array.isArray(project.scenes)) project.scenes = [];

  // Scan folders for part numbers
  const discoveredNums = new Set(project.scenes.map((s) => Number(s.scene_id)).filter((n) => n > 0));
  const scanDirs = [
    path.join(dir, 'parts'),
    path.join(dir, 'audio', 'parts'),
    path.join(dir, 'audio', 'raw_aistudio'),
    path.join(dir, 'audio', 'raw'),
    path.join(dir, 'audio', 'padded'),
    path.join(dir, 'audio', 'shots_neural'),
    path.join(dir, 'visual_assets'),
  ];

  const partRegex = /(?:^(?:bn|en|hi)[_-])?(?:part|shot|scene|clip)[_-]?(\d{1,4})(?:[_-](?:bn|en|hi|padded))?\.(wav|mp3|m4a|aac|ogg|flac|png|jpg|jpeg|webp|mp4|mov|webm|mkv)$/i;

  for (const sdir of scanDirs) {
    if (!exists(sdir)) continue;
    const entries = await fsp.readdir(sdir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const mDir = entry.name.match(/^(?:part|shot|scene)[_-]?(\d{1,4})$/i);
        if (mDir) discoveredNums.add(parseInt(mDir[1], 10));
      } else {
        const mFile = entry.name.match(partRegex);
        if (mFile) discoveredNums.add(parseInt(mFile[1], 10));
      }
    }
  }

  // Also parse concat_*.txt if raw audio files were listed there in existing projects
  const concatHints = { bn: {}, en: {}, hi: {} };
  for (const lang of Object.keys(LANGS)) {
    const cFiles = [
      path.join(dir, 'audio', `concat_${lang}.txt`),
      path.join(dir, 'audio', `${lang}_shots_concat.txt`),
      path.join(dir, 'audio', `${lang}_concat_list.txt`),
    ];
    for (const cf of cFiles) {
      if (!exists(cf)) continue;
      const txt = await fsp.readFile(cf, 'utf8').catch(() => '');
      txt.split(/\r?\n/).forEach((line, idx) => {
        const m = line.match(/file\s+['"]([^'"]+)['"]/i);
        if (!m) return;
        const fpath = m[1];
        const base = path.basename(fpath);
        const numMatch = base.match(/(\d{1,4})/);
        const sNum = numMatch ? parseInt(numMatch[1], 10) : idx + 1;
        if (!concatHints[lang][sNum]) concatHints[lang][sNum] = base;
      });
    }
  }

  const sortedNums = [...discoveredNums].filter((n) => n > 0).sort((a, b) => a - b);
  const sceneMap = new Map(project.scenes.map((s) => [Number(s.scene_id), s]));

  let changed = false;
  for (const num of sortedNums) {
    if (!sceneMap.has(num)) {
      const newSc = {
        scene_id: num,
        type: 'STATIC_IMAGE',
        dialogue_speaker: 'NARRATOR',
        narration: { bn: `পার্ট #${num} (অটো-ডিসকভার্ড)`, en: `Part #${num} (Auto-discovered)`, hi: `भाग #${num} (ऑटो-डिस्कवर्ड)` },
        visual_prompt: '',
        asset_file: '',
        sfx: '',
        motion_effect: 'zoom_in',
        duration: 5.0,
        language_durations: {},
      };
      project.scenes.push(newSc);
      sceneMap.set(num, newSc);
      changed = true;
    }
  }

  // Sort scenes by order or scene_id if not custom-ordered
  if (!project.custom_scene_order) {
    project.scenes.sort((a, b) => Number(a.scene_id) - Number(b.scene_id));
  }

  // Enrich each scene with discovered visual & per-language audio clip info
  const partAudioClips = {}; // scene_id -> { bn, en, hi }
  for (const s of project.scenes) {
    const sid = s.scene_id;
    partAudioClips[sid] = {};

    // Check visual asset
    const vis = resolveSceneAsset(dir, s);
    if (vis.abs && !s.asset_file) {
      s.asset_file = path.relative(dir, vis.abs).split(path.sep).join('/');
      const ext = path.extname(vis.abs).toLowerCase();
      s.type = VID_EXT.includes(ext) ? 'DYNAMIC_AI_VIDEO' : 'STATIC_IMAGE';
      if (VID_EXT.includes(ext)) s.motion_effect = 'ai_video';
      changed = true;
    }

    // Check audio per language
    s.audio_clips = s.audio_clips || {};
    s.language_durations = s.language_durations || {};

    for (const lang of Object.keys(LANGS)) {
      const existingClipMeta = s.audio_clips[lang] || {};
      const absAud = resolvePartAudio(dir, sid, lang, existingClipMeta.file);
      if (absAud && exists(absAud)) {
        const dur = (await probeDuration(absAud)) || s.language_durations[lang] || s.duration || 5;
        const st = fs.statSync(absAud);
        const relFile = path.relative(dir, absAud).split(path.sep).join('/');
        const calibratedDur = existingClipMeta.manual_duration
          ? existingClipMeta.duration
          : +(dur + 0.35).toFixed(2);

        if (!existingClipMeta.manual_duration && Math.abs((s.language_durations[lang] || 0) - calibratedDur) > 0.05) {
          s.language_durations[lang] = calibratedDur;
          if (lang === 'bn' && !s.manual_duration) s.duration = calibratedDur;
          changed = true;
        }

        const clipInfo = {
          id: `aud_${lang}_${pad4(sid)}`,
          scene_id: sid,
          lang,
          file: relFile,
          url: rel(id, absAud),
          source_duration: +dur.toFixed(3),
          duration: s.language_durations[lang] || calibratedDur,
          trim_in: existingClipMeta.trim_in || 0,
          trim_out: existingClipMeta.trim_out || 0,
          volume_db: existingClipMeta.volume_db ?? 0,
          fade_in: existingClipMeta.fade_in || 0,
          fade_out: existingClipMeta.fade_out || 0,
          mtime: st.mtimeMs,
          status: 'ready',
          source_type: 'part_file',
        };
        partAudioClips[sid][lang] = clipInfo;
        s.audio_clips[lang] = {
          file: relFile,
          source_duration: clipInfo.source_duration,
          duration: clipInfo.duration,
          trim_in: clipInfo.trim_in,
          trim_out: clipInfo.trim_out,
          volume_db: clipInfo.volume_db,
          fade_in: clipInfo.fade_in,
          fade_out: clipInfo.fade_out,
          manual_duration: Boolean(existingClipMeta.manual_duration),
        };
      } else {
        // Fallback: if project has scene durations / concat hint or master narration slice
        const dur = s.language_durations[lang] || s.duration || 5;
        const hintName = concatHints[lang]?.[sid] || `${lang}_shot_${pad4(sid)}.wav`;
        partAudioClips[sid][lang] = {
          id: `aud_${lang}_${pad4(sid)}`,
          scene_id: sid,
          lang,
          file: s.audio_clips[lang]?.file || `audio/${lang}/scene_${pad4(sid)}.wav`,
          url: null,
          source_duration: +Math.max(0.5, dur - 0.35).toFixed(3),
          duration: +dur.toFixed(3),
          trim_in: s.audio_clips[lang]?.trim_in || 0,
          trim_out: s.audio_clips[lang]?.trim_out || 0,
          volume_db: s.audio_clips[lang]?.volume_db ?? 0,
          fade_in: s.audio_clips[lang]?.fade_in || 0,
          fade_out: s.audio_clips[lang]?.fade_out || 0,
          mtime: null,
          status: s.narration?.[lang] ? 'virtual_segment' : 'missing',
          source_type: 'timeline_segment',
        };
      }
    }
  }

  recomputeTimeline(project);
  if (persistToDisk && (changed || !exists(pjFile))) {
    await fsp.writeFile(pjFile, JSON.stringify(project, null, 2), 'utf8');
  }
  return { project, partAudioClips };
}

function recomputeTimeline(project) {
  let t = 0;
  for (let i = 0; i < (project.scenes || []).length; i++) {
    const s = project.scenes[i];
    s.duration = Math.max(0.5, +Number(s.duration || 4).toFixed(3));
    if (project.timeline_mode === 'free' && typeof s.custom_start === 'number' && s.custom_start >= 0) {
      s.timestamp_start = +s.custom_start.toFixed(3);
      s.timestamp_end = +(s.timestamp_start + s.duration).toFixed(3);
      t = Math.max(t, s.timestamp_end);
    } else {
      s.timestamp_start = +t.toFixed(3);
      t += s.duration;
      s.timestamp_end = +t.toFixed(3);
    }
  }
  project.total_duration_seconds = +t.toFixed(3);

  // Ensure default multi-track metadata structure exists in project
  if (!project.tracks_config) {
    project.tracks_config = {
      fx: { id: 'fx', name: 'FX & Motion', muted: false, locked: false, visible: true, height: 38 },
      video: { id: 'video', name: 'Video Track (AI Clips)', muted: false, locked: false, visible: true, height: 54 },
      image: { id: 'image', name: 'Image Track (Storyboard)', muted: false, locked: false, visible: true, height: 54 },
      voice: { id: 'voice', name: 'Voiceover / Part Audio', muted: false, locked: false, visible: true, height: 52 },
      sfx: { id: 'sfx', name: 'SFX & Ambience', muted: false, locked: false, visible: true, height: 38 },
      bgm: { id: 'bgm', name: 'BGM Soundtrack', muted: false, locked: false, visible: true, height: 44 },
    };
  }

  // Ensure BGM clips array exists so users can split/move/trim BGM across specific parts of the video
  if (!Array.isArray(project.bgm_clips) || project.bgm_clips.length === 0) {
    const totalDur = Math.max(30, project.total_duration_seconds || 60);
    project.bgm_clips = [
      {
        id: 'bgm_clip_1',
        title: 'Primary Era Soundtrack (bgm.mp3)',
        file: 'audio/bgm.mp3',
        start_time: 0,
        duration: +totalDur.toFixed(2),
        trim_in: 0,
        volume_db: -20,
        ducking: true,
        fade_in: 1.5,
        fade_out: 2.5,
        loop: true,
      },
    ];
  }

  // Ensure default Character & Voice Mapping Registry exists on project
  if (!Array.isArray(project.characters) || project.characters.length === 0) {
    const presetCfg = STYLE_PRESETS[project.style_preset] || STYLE_PRESETS.PRESET_STICKY_MEME;
    project.characters = [
      {
        id: 'TIME_CHRONICLER',
        name_bn: 'সময়ের সাক্ষী',
        name_en: 'The Time Chronicler',
        name_hi: 'समय का साक्षी',
        role_bn: 'হোস্ট ও গল্পকথক',
        role_en: 'Host & Storyteller',
        role_hi: 'सूत्रधार एवं कहानीकार',
        gender: 'Male',
        age_group: 'Elderly',
        icon: '🎙️',
        badge_class: 'speaker-badge-host',
        aistudio_voice: 'Cruz',
        fallback_voice: 'Charon',
        style_prompt: 'An Old Story Teller, Old Man voice',
        default_wpm: 135,
        volume_db: 0,
        audio_effect: 'studio_clean',
        ref_image: 'references/ref_host_sticky_meme.jpg',
        noor_veil: false,
        visual_dna: 'Elderly male scholar, bald crown with fluffy white side hair, full bushy white beard, round wire-rim spectacles, earthy brown scholar robe/tunic, holding antique leather history journal and flaming torch.'
      },
      {
        id: 'NARRATOR',
        name_bn: 'মূল ধারাভাষ্যকার',
        name_en: 'Primary Narrator',
        name_hi: 'मुख्य कथावाचक',
        role_bn: 'ডকুমেন্টারি ভয়েস',
        role_en: 'Documentary Voice',
        role_hi: 'डॉक्यूमेंट्री वॉइस',
        gender: 'Male',
        age_group: 'Adult',
        icon: '📜',
        badge_class: 'speaker-badge-narrator',
        aistudio_voice: presetCfg.default_voice || 'Charon',
        fallback_voice: 'Orus',
        style_prompt: presetCfg.default_style_prompt || 'deep, resonant, authoritative documentary narrator',
        default_wpm: presetCfg.wpm || 140,
        volume_db: 0,
        audio_effect: presetCfg.default_audio_fx || 'studio_clean',
        ref_image: '',
        noor_veil: false,
        visual_dna: 'Off-screen authoritative documentary narrator.'
      }
    ];
    // Auto-register any additional speakers present in project.scenes
    const known = new Set(project.characters.map((c) => c.id));
    for (const sc of (project.scenes || [])) {
      const spk = (sc.dialogue_speaker || '').trim();
      if (spk && !known.has(spk)) {
        known.add(spk);
        const isKing = /PHARAOH|KING|WARLORD|CHIEF|SULTAN|EMPEROR/i.test(spk);
        const isScholar = /SCHOLAR|PRESIDENT|PRIEST|ELDER|THINKER/i.test(spk);
        const isFriend = /SOHEL|FRIEND/i.test(spk);
        project.characters.push({
          id: spk,
          name_bn: spk.replace(/_/g, ' '),
          name_en: spk.replace(/_/g, ' '),
          name_hi: spk.replace(/_/g, ' '),
          role_bn: isKing ? 'শাসক চরিত্র' : 'গল্পের চরিত্র',
          role_en: isKing ? 'Ruler / Commander' : 'Story Character',
          role_hi: isKing ? 'शासक पात्र' : 'कहानी का पात्र',
          gender: 'Male',
          age_group: 'Adult',
          icon: isKing ? '👑' : (isScholar ? '🏛️' : '🎭'),
          badge_class: isKing ? 'speaker-badge-warlord' : (isScholar ? 'speaker-badge-priest' : 'speaker-badge-character'),
          aistudio_voice: isKing ? 'Fenrir' : (isScholar ? 'Sadaltager' : (isFriend ? 'Achird' : 'Iapetus')),
          fallback_voice: 'Charon',
          style_prompt: isKing ? 'commanding, booming, fierce authoritarian voice' : (isScholar ? 'dignified, scholarly and measured tone' : 'expressive, natural dramatic character acting'),
          default_wpm: 138,
          volume_db: 0,
          audio_effect: 'studio_clean',
          ref_image: '',
          noor_veil: false,
          visual_dna: `Consistent character appearance for ${spk} matching ${project.style_preset}.`
        });
      }
    }
  }

  if (Array.isArray(project.characters)) {
    for (const ch of project.characters) {
      if (ch.role_bn) ch.role_bn = stripVoiceNameFromRole(ch.role_bn);
      if (ch.role_en) ch.role_en = stripVoiceNameFromRole(ch.role_en);
      if (ch.role_hi) ch.role_hi = stripVoiceNameFromRole(ch.role_hi);
      if (ch.name_bn) ch.name_bn = stripVoiceNameFromRole(ch.name_bn);
      if (ch.name_en) ch.name_en = stripVoiceNameFromRole(ch.name_en);
      if (ch.name_hi) ch.name_hi = stripVoiceNameFromRole(ch.name_hi);
    }
  }
  if (!project.branding) {
    project.branding = {
      enabled: true,
      logo_file: 'references/mascot_logo_ref.jpg',
      position: 'top-right',
      size: 64,
      opacity: 90,
      show_name: true,
      channel_name_bn: 'Simple History Teller Bangla',
      channel_name_en: 'Simple History Teller',
      channel_name_hi: 'Simple History Teller Hindi'
    };
  }
  if (!project.ticker_config) {
    project.ticker_config = {
      position: 'none',
      style: 'broadcast_gold',
      speed: 'medium',
      label_bn: '● আপডেট',
      label_en: '● UPDATE',
      label_hi: '● अपडेट',
      text_bn: '',
      text_en: '',
      text_hi: ''
    };
  }
  if (!project.shorts_config) {
    project.shorts_config = {
      total_parts: 5,
      embed_intro_thumbnail: true,
      intro_thumbnail_sec: 0.8,
      layout_dock: 'right',
      parts: suggestShortsParts(project, 'bn', 5)
    };
  }
  return project;
}

async function readProject(id) {
  const file = path.join(pdir(id), 'project.json');
  if (!exists(file)) {
    // If folder exists, auto-initialize project from parts
    if (exists(pdir(id))) {
      const { project } = await autoDiscoverProjectParts(id);
      return project;
    }
    throw httpErr(404, 'Project not found');
  }
  return JSON.parse(await fsp.readFile(file, 'utf8'));
}

async function writeProject(id, project) {
  recomputeTimeline(project);
  await fsp.writeFile(path.join(pdir(id), 'project.json'), JSON.stringify(project, null, 2), 'utf8');
  return project;
}

function automationRunsDir(id) {
  return path.join(pdir(id), 'automation_runs');
}
async function listAutomationRuns(id, limit = 40) {
  const dir = automationRunsDir(id);
  if (!exists(dir)) return [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const runs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifest = await readJson(path.join(dir, entry.name, 'run.json'), null);
    if (!manifest) continue;
    const stat = await fsp.stat(path.join(dir, entry.name)).catch(() => null);
    runs.push({
      runId: entry.name,
      state: manifest.state || 'unknown',
      ok: manifest.ok ?? null,
      workflow: manifest.workflow || 'ad_hoc',
      updatedAt: manifest.updatedAt || stat?.mtime?.toISOString() || null,
      finishedAt: manifest.finishedAt || null,
      workers: (manifest.workers || []).map((worker) => ({
        agent: worker.agent,
        accountSlot: worker.accountSlot,
        tabName: worker.tabName,
        state: worker.state,
        captures: worker.captures || 0,
      })),
    });
  }
  return runs
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
    .slice(0, Math.max(1, Math.min(Number(limit) || 40, 200)));
}

/** Move an existing file into a sibling `_history/` folder instead of deleting it. */
async function archive(file) {
  if (!file || !exists(file)) return;
  const hist = path.join(path.dirname(file), '_history');
  await fsp.mkdir(hist, { recursive: true });
  const { name, ext } = path.parse(file);
  await fsp.rename(file, path.join(hist, `${name}_${Date.now()}${ext}`));
}
async function moveFile(src, dest) {
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  try { await fsp.rename(src, dest); } catch { await fsp.copyFile(src, dest); await fsp.unlink(src); }
}

/* ---------------------------------------------------------------- API routes */
app.get('/api/health', (req, res) => res.json({
  ok: true,
  studio: 'Simple Studio',
  ffmpeg: FFMPEG,
  gpu: getHwEncoder(),
}));

app.get('/api/projects', wrap(async (req, res) => {
  const list = [];
  for (const d of await fsp.readdir(PROJECTS, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    let pj = await readJson(path.join(PROJECTS, d.name, 'project.json'), null);
    if (!pj) {
      const disc = await autoDiscoverProjectParts(d.name).catch(() => null);
      pj = disc?.project;
    }
    if (!pj) continue;
    recomputeTimeline(pj);
    list.push({
      id: d.name,
      title: pj.metadata?.title_en || pj.metadata?.title_bn || d.name,
      style_preset: pj.style_preset,
      scenes: pj.scenes.length,
      duration: pj.total_duration_seconds,
    });
  }
  res.json(list);
}));

app.get('/api/project/:id', wrap(async (req, res) => {
  const id = req.params.id;
  const dir = pdir(id);
  const { project, partAudioClips } = await autoDiscoverProjectParts(id);
  const audioDir = path.join(dir, 'audio');
  const metaDir = path.join(dir, 'metadata');
  const rendersDir = path.join(dir, 'renders');
  const exportsDir = path.join(dir, 'exports');

  const assets = {};
  for (const s of project.scenes) {
    const resAsset = resolveSceneAsset(dir, s);
    const abs = resAsset.abs;
    const pad = pad4(s.scene_id);
    const imgPoster = findFile(path.join(dir, 'visual_assets'), `scene_${pad}`, IMG_EXT)
      || findFile(path.join(dir, 'visual_assets'), `shot_${pad}`, IMG_EXT);
    assets[s.scene_id] = abs && exists(abs) ? {
      url: rel(id, abs),
      posterUrl: imgPoster ? rel(id, imgPoster) : null,
      mtime: fs.statSync(abs).mtimeMs,
      isFallback: resAsset.isFallback,
    } : null;
  }

  const audio = {};
  for (const lang of Object.keys(LANGS)) {
    const f = findFile(audioDir, `${lang}_narration`, AUD_EXT);
    const readyPartsCount = Object.values(partAudioClips).filter((p) => p[lang]?.status === 'ready').length;
    audio[lang] = f
      ? { url: rel(id, f), duration: await probeDuration(f), mtime: fs.statSync(f).mtimeMs, readyParts: readyPartsCount, totalParts: project.scenes.length }
      : { url: null, duration: project.language_total_durations?.[lang] || project.total_duration_seconds, mtime: Date.now(), readyParts: readyPartsCount, totalParts: project.scenes.length, isPartBased: true };
  }

  const bgmFile = findFile(audioDir, 'bgm', AUD_EXT);
  const thumbsMasterDir = path.join(dir, 'thumbnails', 'master');
  const thumbsShortsDir = path.join(dir, 'thumbnails', 'shorts');
  const thumbnails = {};
  for (const lang of Object.keys(LANGS)) {
    const fMaster = findFile(thumbsMasterDir, `master_thumbnail_${lang}`, IMG_EXT)
      || findFile(path.join(dir, 'thumbnails'), `${lang}_thumbnail`, IMG_EXT)
      || findFile(metaDir, `${lang}_thumbnail`, IMG_EXT);
    thumbnails[lang] = fMaster ? { url: rel(id, fMaster), path: path.relative(dir, fMaster).split(path.sep).join('/'), mtime: fs.statSync(fMaster).mtimeMs } : null;
  }
  const shortsThumbnails = exists(thumbsShortsDir)
    ? fs.readdirSync(thumbsShortsDir).filter((n) => IMG_EXT.includes(path.extname(n).toLowerCase())).map((n) => {
        const abs = path.join(thumbsShortsDir, n);
        const st = fs.statSync(abs);
        return { name: n, url: rel(id, abs), path: `thumbnails/shorts/${n}`, mtime: st.mtimeMs };
      })
    : [];

  const collectVideos = (folder, label) => exists(folder)
    ? fs.readdirSync(folder).filter((n) => /^video_\w+\.mp4$/.test(n)).map((n) => {
        const st = fs.statSync(path.join(folder, n));
        return { name: n, folder: label, url: rel(id, path.join(folder, n)), size: st.size, mtime: st.mtimeMs };
      })
    : [];

  const exportsList = collectVideos(exportsDir, 'exports');
  const rendersList = collectVideos(rendersDir, 'renders');
  const allRenders = [...exportsList, ...rendersList.filter((r) => !exportsList.some((e) => e.name === r.name))];

  res.json({
    id,
    project,
    assets,
    partAudioClips,
    audio,
    thumbnails,
    shortsThumbnails,
    renders: allRenders,
    exports: exportsList,
    watchedFolders: [
      `projects/${id}/audio/bn/`,
      `projects/${id}/audio/en/`,
      `projects/${id}/audio/hi/`,
      `projects/${id}/audio/sfx/`,
      `projects/${id}/audio/bgm/`,
      `projects/${id}/visual_assets/`,
    ],
    exportFolder: `projects/${id}/exports/`,
    bgm: bgmFile ? { url: rel(id, bgmFile), duration: await probeDuration(bgmFile), mtime: fs.statSync(bgmFile).mtimeMs } : null,
    seo: await readJson(path.join(metaDir, 'youtube_seo.json'), {}),
    job: jobSnapshot(jobs.get(id)),
    motions: MOTIONS,
    vfxEffects: VFX_EFFECTS,
    audioEffects: AUDIO_EFFECTS,
    stylePresets: STYLE_PRESETS,
    aistudioVoices: AISTUDIO_VOICES,
    sfxLibrary: SFX_LIBRARY,
    automationRuns: await listAutomationRuns(id, 12),
  });
}));

/**
 * Trigger an immediate scan of `parts/`, `audio/raw/`, `visual_assets/` and sync all discovered parts into project.json
 */
app.post('/api/project/:id/auto-sync', wrap(async (req, res) => {
  const id = safeId(req.params.id);
  const { project, partAudioClips } = await autoDiscoverProjectParts(id, true);
  res.json({
    ok: true,
    scenesCount: project.scenes.length,
    totalDuration: project.total_duration_seconds,
    project,
    partAudioClips,
  });
}));

/**
 * AI Agent & Programmatic Multi-Track Editing Endpoint (`/api/project/:id/agent-edit`)
 * Allows both AI Agents and external tools to perform granular non-linear edits on any track or clip.
 * Supported actions:
 *   - update_clip: { track, scene_id, clip_id, patch }
 *   - move_clip: { track, scene_id, clip_id, start_time, target_index }
 *   - resize_clip: { track, scene_id, clip_id, duration, trim_in, trim_out }
 *   - split_clip: { track, scene_id, split_offset }
 *   - add_bgm_clip / update_bgm_clip / delete_bgm_clip
 *   - add_part: { scene_id, narration, visual_prompt, speaker, duration, sfx, motion_effect }
 */
app.post('/api/project/:id/agent-edit', wrap(async (req, res) => {
  const id = safeId(req.params.id);
  const project = await readProject(id);
  const { action, payload = {} } = req.body || {};

  if (!action) throw httpErr(400, 'action is required');

  if (action === 'update_clip' || action === 'resize_clip' || action === 'move_clip') {
    const sc = project.scenes.find((s) => String(s.scene_id) === String(payload.scene_id));
    if (sc) {
      if (typeof payload.duration === 'number') {
        sc.duration = Math.max(0.5, +payload.duration.toFixed(3));
        sc.manual_duration = true;
        if (payload.lang && sc.language_durations) {
          sc.language_durations[payload.lang] = sc.duration;
        }
      }
      if (typeof payload.start_time === 'number') {
        project.timeline_mode = 'free';
        sc.custom_start = Math.max(0, +payload.start_time.toFixed(3));
      }
      if (payload.motion_effect) sc.motion_effect = payload.motion_effect;
      if (payload.vfx_effect !== undefined) sc.vfx_effect = payload.vfx_effect;
      if (payload.audio_effect !== undefined) sc.audio_effect = payload.audio_effect;
      if (payload.aistudio_voice !== undefined) sc.aistudio_voice = payload.aistudio_voice;
      if (payload.style_prompt !== undefined) sc.style_prompt = payload.style_prompt;
      if (payload.visual_prompt !== undefined) sc.visual_prompt = payload.visual_prompt;
      if (payload.type !== undefined) sc.type = payload.type;
      if (payload.sfx !== undefined) sc.sfx = payload.sfx;
      if (payload.dialogue_speaker) sc.dialogue_speaker = payload.dialogue_speaker;
      if (payload.asset_file) sc.asset_file = payload.asset_file;
      if (payload.narration && typeof payload.narration === 'object') {
        sc.narration = { ...(sc.narration || {}), ...payload.narration };
      }
      if (typeof payload.target_index === 'number' && payload.target_index >= 0 && payload.target_index < project.scenes.length) {
        const curIdx = project.scenes.indexOf(sc);
        project.scenes.splice(curIdx, 1);
        project.scenes.splice(payload.target_index, 0, sc);
        project.custom_scene_order = true;
      }
    }
  } else if (action === 'split_clip') {
    const idx = project.scenes.findIndex((s) => String(s.scene_id) === String(payload.scene_id));
    if (idx < 0) throw httpErr(404, 'Scene not found');
    const orig = project.scenes[idx];
    const splitAt = Math.max(0.5, Math.min(orig.duration - 0.5, Number(payload.split_offset || orig.duration / 2)));
    const nextId = Math.max(0, ...project.scenes.map((s) => Number(s.scene_id) || 0)) + 1;
    const remDur = +(orig.duration - splitAt).toFixed(3);
    orig.duration = +splitAt.toFixed(3);
    const cloned = JSON.parse(JSON.stringify(orig));
    cloned.scene_id = nextId;
    cloned.duration = remDur;
    if (cloned.language_durations) {
      Object.keys(cloned.language_durations).forEach((k) => { cloned.language_durations[k] = remDur; });
    }
    if (orig.language_durations) {
      Object.keys(orig.language_durations).forEach((k) => { orig.language_durations[k] = orig.duration; });
    }
    project.scenes.splice(idx + 1, 0, cloned);
    project.custom_scene_order = true;
  } else if (action === 'update_bgm_clips') {
    if (Array.isArray(payload.bgm_clips)) {
      project.bgm_clips = payload.bgm_clips;
    }
  } else if (action === 'add_part') {
    const nextId = payload.scene_id || (Math.max(0, ...project.scenes.map((s) => Number(s.scene_id) || 0)) + 1);
    const newSc = {
      scene_id: nextId,
      type: payload.type || 'STATIC_IMAGE',
      dialogue_speaker: payload.speaker || 'NARRATOR',
      narration: payload.narration || { bn: '', en: '', hi: '' },
      visual_prompt: payload.visual_prompt || '',
      asset_file: payload.asset_file || '',
      sfx: payload.sfx || '',
      motion_effect: payload.motion_effect || 'zoom_in',
      duration: Number(payload.duration || 5.0),
      language_durations: payload.language_durations || {},
    };
    project.scenes.push(newSc);
  } else if (action === 'update_characters') {
    if (Array.isArray(payload.characters)) {
      project.characters = payload.characters;
      const charMap = new Map(project.characters.map((c) => [c.id, c]));
      if (payload.sync_scenes !== false) {
        for (const sc of project.scenes) {
          const ch = charMap.get(sc.dialogue_speaker);
          if (ch) {
            sc.aistudio_voice = ch.aistudio_voice;
            sc.style_prompt = ch.style_prompt;
            if (!sc.audio_effect || sc.audio_effect === 'studio_clean') {
              sc.audio_effect = ch.audio_effect || 'studio_clean';
            }
          }
        }
      }
    }
  } else if (action === 'apply_category_preset') {
    const presetId = payload.style_preset || project.style_preset;
    const presetCfg = STYLE_PRESETS[presetId];
    if (!presetCfg) throw httpErr(400, `Unknown style_preset: ${presetId}`);
    project.style_preset = presetId;
    if (payload.apply_to_all_scenes) {
      for (const sc of project.scenes) {
        if (sc.type !== 'DYNAMIC_AI_VIDEO') sc.motion_effect = presetCfg.default_motion;
        sc.vfx_effect = presetCfg.default_vfx;
        sc.audio_effect = presetCfg.default_audio_fx;
      }
    }
  } else if (action === 'timestamp_command') {
    // Parse commands like "@01:24 vfx=vox_halftone_paper motion=vox_stop_motion sfx=rubber_stamp_impact"
    const cmd = String(payload.command || '').trim();
    const tsMatch = cmd.match(/@?(?:(\d+):)?(\d+(?:\.\d+)?)/);
    let targetScene = project.scenes[0];
    if (tsMatch) {
      const sec = (tsMatch[1] ? parseInt(tsMatch[1], 10) * 60 : 0) + parseFloat(tsMatch[2]);
      targetScene = project.scenes.find((s) => sec >= (s.timestamp_start || 0) && sec <= (s.timestamp_end || 999999)) || targetScene;
    }
    if (payload.scene_id) {
      targetScene = project.scenes.find((s) => String(s.scene_id) === String(payload.scene_id)) || targetScene;
    }
    if (targetScene) {
      const kvMatches = [...cmd.matchAll(/(motion|vfx|audio_fx|sfx|speaker|voice|duration|type)=([^\s]+)/gi)];
      for (const [, k, v] of kvMatches) {
        const key = k.toLowerCase();
        if (key === 'motion') targetScene.motion_effect = v;
        else if (key === 'vfx') targetScene.vfx_effect = v;
        else if (key === 'audio_fx') targetScene.audio_effect = v;
        else if (key === 'sfx') targetScene.sfx = v;
        else if (key === 'speaker') targetScene.dialogue_speaker = v;
        else if (key === 'voice') targetScene.aistudio_voice = v;
        else if (key === 'duration') { targetScene.duration = Math.max(0.5, parseFloat(v) || 5); targetScene.manual_duration = true; }
        else if (key === 'type') targetScene.type = v;
      }
      if (payload.patch && typeof payload.patch === 'object') {
        Object.assign(targetScene, payload.patch);
      }
    }
  } else {
    throw httpErr(400, `Unsupported agent-edit action: ${action}`);
  }

  const saved = await writeProject(id, project);
  res.json({ ok: true, project: saved });
}));

app.get('/api/project/:id/automation-runs', wrap(async (req, res) => {
  await readProject(req.params.id);
  res.json(await listAutomationRuns(req.params.id, req.query.limit));
}));

app.get('/api/project/:id/automation-runs/:runId', wrap(async (req, res) => {
  const id = req.params.id;
  await readProject(id);
  const runId = safeId(req.params.runId);
  const runDir = path.join(automationRunsDir(id), runId);
  const manifest = await readJson(path.join(runDir, 'run.json'), null);
  if (!manifest) throw httpErr(404, 'Automation run not found');
  const events = await fsp.readFile(path.join(runDir, 'events.ndjson'), 'utf8')
    .then((text) => text.trim().split('\n').filter(Boolean).slice(-100).map((line) => JSON.parse(line)))
    .catch(() => []);
  res.json({ manifest, events, path: runDir });
}));

app.put('/api/project/:id', wrap(async (req, res) => {
  const body = req.body;
  if (!body || !Array.isArray(body.scenes)) throw httpErr(400, 'project.scenes[] is required');
  await readProject(req.params.id); // 404 guard
  res.json(await writeProject(req.params.id, body));
}));

app.put('/api/project/:id/seo', wrap(async (req, res) => {
  const metaDir = path.join(pdir(req.params.id), 'metadata');
  await fsp.mkdir(metaDir, { recursive: true });
  await fsp.writeFile(path.join(metaDir, 'youtube_seo.json'), JSON.stringify(req.body || {}, null, 2), 'utf8');
  res.json({ ok: true });
}));

/**
 * Generic upload. multipart fields:
 *   kind = scene | part_audio | narration | bgm | sfx | thumbnail
 *   sceneId (kind=scene|part_audio|sfx) | lang (kind=part_audio|narration|thumbnail)
 *   file
 * Replaced files are archived in `_history/`, never deleted.
 */
app.post(['/api/project/:id/upload', '/api/project/:id/swap-asset'], upload.single('file'), wrap(async (req, res) => {
  const id = req.params.id;
  const dir = pdir(id);
  const f = req.file;
  if (!f) throw httpErr(400, 'No file uploaded');
  const ext = path.extname(f.originalname).toLowerCase();
  const kind = req.body.kind || 'scene';
  const lang = req.body.lang || 'bn';
  try {
    if (kind === 'scene') {
      const project = await readProject(id);
      const scene = project.scenes.find((s) => String(s.scene_id) === String(req.body.sceneId));
      if (!scene) throw httpErr(404, 'Scene not found');
      const isImg = IMG_EXT.includes(ext), isVid = VID_EXT.includes(ext);
      if (!isImg && !isVid) throw httpErr(400, `Unsupported file type ${ext}`);
      const old = scene.asset_file;
      const shared = old && project.scenes.some((o) => o !== scene && o.asset_file === old);
      if (old && !shared) await archive(path.join(dir, old));
      const relPath = `visual_assets/${isVid ? 'clip_' : ''}scene_${pad4(scene.scene_id)}_${Date.now().toString(36)}${ext}`;
      await moveFile(f.path, path.join(dir, relPath));
      scene.asset_file = relPath;
      scene.type = isVid ? 'DYNAMIC_AI_VIDEO' : 'STATIC_IMAGE';
      if (isVid) scene.motion_effect = 'ai_video';
      else if (scene.motion_effect === 'ai_video' || !scene.motion_effect) scene.motion_effect = 'static';
      await writeProject(id, project);
      return res.json({ ok: true, scene });
    }
    if (kind === 'part_audio') {
      if (!AUD_EXT.includes(ext)) throw httpErr(400, `Unsupported audio file type ${ext}`);
      const project = await readProject(id);
      const sceneId = Number(req.body.sceneId || 1);
      let scene = project.scenes.find((s) => Number(s.scene_id) === sceneId);
      if (!scene) {
        scene = {
          scene_id: sceneId,
          type: 'STATIC_IMAGE',
          dialogue_speaker: 'NARRATOR',
          narration: { bn: '', en: '', hi: '' },
          visual_prompt: '',
          asset_file: '',
          sfx: '',
          motion_effect: 'zoom_in',
          duration: 5.0,
          language_durations: {},
        };
        project.scenes.push(scene);
      }
      const relPath = `audio/${lang}/scene_${pad4(sceneId)}${ext}`;
      const destAbs = path.join(dir, relPath);
      await archive(destAbs);
      await moveFile(f.path, destAbs);
      const dur = (await probeDuration(destAbs)) || scene.duration || 5.0;
      const calibrated = +(dur + 0.35).toFixed(2);
      scene.language_durations = scene.language_durations || {};
      scene.language_durations[lang] = calibrated;
      if (lang === 'bn') scene.duration = calibrated;
      scene.audio_clips = scene.audio_clips || {};
      scene.audio_clips[lang] = {
        file: relPath,
        source_duration: +dur.toFixed(3),
        duration: calibrated,
        trim_in: 0,
        trim_out: 0,
        volume_db: 0,
      };
      await writeProject(id, project);
      return res.json({ ok: true, scene, duration: calibrated });
    }
    if (kind === 'narration' || kind === 'thumbnail') {
      if (!LANGS[lang]) throw httpErr(400, 'lang must be bn | en | hi');
      const exts = kind === 'narration' ? AUD_EXT : IMG_EXT;
      if (!exts.includes(ext)) throw httpErr(400, `Unsupported file type ${ext}`);
      if (kind === 'thumbnail') {
        const masterThumbDir = path.join(dir, 'thumbnails', 'master');
        await fsp.mkdir(masterThumbDir, { recursive: true });
        const destMaster = path.join(masterThumbDir, `master_thumbnail_${lang}${ext}`);
        await archive(findFile(masterThumbDir, `master_thumbnail_${lang}`, exts));
        await moveFile(f.path, destMaster);
        // Also mirror to metadata/ for legacy scripts
        const metaDest = path.join(dir, 'metadata', `${lang}_thumbnail${ext}`);
        await fsp.mkdir(path.join(dir, 'metadata'), { recursive: true });
        await fsp.copyFile(destMaster, metaDest).catch(() => {});
        return res.json({ ok: true, file: `thumbnails/master/master_thumbnail_${lang}${ext}` });
      }
      const sub = 'audio';
      const base = `${lang}_${kind}`;
      await archive(findFile(path.join(dir, sub), base, exts));
      await moveFile(f.path, path.join(dir, sub, base + ext));
      return res.json({ ok: true });
    }
    if (kind === 'short_thumbnail') {
      if (!IMG_EXT.includes(ext)) throw httpErr(400, `Unsupported image type ${ext}`);
      const partNum = String(req.body.partNum || 1).padStart(2, '0');
      const shortsThumbDir = path.join(dir, 'thumbnails', 'shorts');
      await fsp.mkdir(shortsThumbDir, { recursive: true });
      const destShort = path.join(shortsThumbDir, `short_part_${partNum}_${lang}${ext}`);
      await archive(findFile(shortsThumbDir, `short_part_${partNum}_${lang}`, IMG_EXT));
      await moveFile(f.path, destShort);
      return res.json({ ok: true, file: `thumbnails/shorts/short_part_${partNum}_${lang}${ext}` });
    }
    if (kind === 'logo') {
      if (!IMG_EXT.includes(ext)) throw httpErr(400, `Unsupported logo image type ${ext}`);
      const brandDir = path.join(dir, 'branding');
      await fsp.mkdir(brandDir, { recursive: true });
      const destLogo = path.join(brandDir, `channel_logo${ext}`);
      await archive(findFile(brandDir, 'channel_logo', IMG_EXT));
      await moveFile(f.path, destLogo);
      const project = await readProject(id);
      project.branding = project.branding || {};
      project.branding.logo_file = `branding/channel_logo${ext}`;
      await writeProject(id, project);
      return res.json({ ok: true, file: `branding/channel_logo${ext}`, url: rel(id, destLogo) });
    }
    if (kind === 'bgm') {
      if (!AUD_EXT.includes(ext)) throw httpErr(400, `Unsupported file type ${ext}`);
      await archive(findFile(path.join(dir, 'audio'), 'bgm', AUD_EXT));
      await moveFile(f.path, path.join(dir, 'audio', 'bgm' + ext));
      return res.json({ ok: true });
    }
    if (kind === 'sfx') {
      if (!AUD_EXT.includes(ext)) throw httpErr(400, `Unsupported file type ${ext}`);
      const cue = (req.body.cueName || path.parse(f.originalname).name).replace(/[^\w-]/g, '_');
      const destAbs = path.join(dir, 'audio', 'sfx', cue + ext);
      await archive(destAbs);
      await moveFile(f.path, destAbs);
      return res.json({ ok: true, file: `audio/sfx/${cue}${ext}` });
    }
    throw httpErr(400, `Unknown upload kind "${kind}"`);
  } finally {
    if (exists(f.path)) fs.unlink(f.path, () => {});
  }
}));

app.post('/api/project/:id/open-folder', wrap(async (req, res) => {
  const allowed = ['exports', 'parts', 'renders', 'audio', 'visual_assets', 'automation_runs', 'thumbnails', 'branding'];
  const sub = allowed.includes(req.body?.sub) ? req.body.sub : '';
  const target = path.join(pdir(req.params.id), sub);
  await fsp.mkdir(target, { recursive: true });
  try {
    spawn(process.platform === 'win32' ? 'explorer' : 'xdg-open', [target], { detached: true, stdio: 'ignore' }).unref();
  } catch {}
  res.json({ ok: true, path: target });
}));

/* --------------------------------------------------------- render engine */
const jobs = new Map(); // projectId -> job

function jobSnapshot(job) {
  if (!job) return null;
  const { status, progress, stage, outputs, startedAt, finishedAt, langs, error } = job;
  return { status, progress: +progress.toFixed(1), stage, outputs, startedAt, finishedAt, langs, error };
}
function emit(job, event, data) {
  if (!job || !job.listeners) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of job.listeners) res.write(payload);
}
function log(job, line) {
  const entry = `[${new Date().toLocaleTimeString()}] ${line}`;
  job.logs.push(entry);
  if (job.logs.length > 800) job.logs.shift();
  emit(job, 'log', entry);
}
function setState(job, patch) {
  Object.assign(job, patch);
  emit(job, 'state', jobSnapshot(job));
}

/** Run ffmpeg, mapping its `time=` output into the [base, base+span] progress window. */
function runFF(job, args, { duration = 0, base = job.progress, span = 0 } = {}) {
  return new Promise((resolve, reject) => {
    if (job.cancelled) return reject(new Error('Cancelled'));
    const proc = spawn(FFMPEG, ['-hide_banner', '-y', '-loglevel', 'info', ...args.map(String)]);
    job.proc = proc;
    let tail = [];
    let lastEmit = 0;
    proc.stderr.on('data', (buf) => {
      const text = buf.toString();
      for (const line of text.split(/\r|\n/)) {
        if (!line.trim()) continue;
        tail.push(line); if (tail.length > 25) tail.shift();
        const m = line.match(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/);
        if (m && duration > 0 && span > 0) {
          const t = +m[1] * 3600 + +m[2] * 60 + +m[3];
          job.progress = base + span * Math.min(1, t / duration);
          if (Date.now() - lastEmit > 250) { lastEmit = Date.now(); emit(job, 'state', jobSnapshot(job)); }
        } else if (/error|invalid|failed|warning/i.test(line)) {
          log(job, '  ffmpeg: ' + line.trim());
        }
      }
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      job.proc = null;
      if (job.cancelled) return reject(new Error('Cancelled'));
      if (code === 0) { job.progress = base + span; return resolve(); }
      reject(new Error(`ffmpeg exited with code ${code}\n${tail.slice(-8).join('\n')}`));
    });
  });
}

let hwEncoderConfig = null;
let hwFallbackTriggered = false;

function detectVideoControllerName() {
  try {
    const out = execFileSync('powershell', ['-NoProfile', '-Command', '(Get-CimInstance Win32_VideoController).Name'], { encoding: 'utf8', timeout: 3500 }).trim();
    if (out) {
      const lines = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      const discrete = lines.find((l) => /geforce|rtx|gtx|radeon rx|arc/i.test(l));
      return discrete || lines[0] || null;
    }
  } catch {}
  return null;
}

function getHwEncoder() {
  if (hwFallbackTriggered) {
    return {
      name: 'CPU Software Mode (libx264 veryfast - Fallback Active)',
      isGpu: false,
      enc: ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', FPS, '-an'],
    };
  }
  if (hwEncoderConfig) return hwEncoderConfig;

  const devName = detectVideoControllerName();

  try {
    const encoders = execFileSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_mf')) {
      execFileSync(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_mf', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const isApu = devName && /radeon|vega|intel|uhd|iris/i.test(devName) && !/geforce|rtx|gtx/i.test(devName);
      const label = devName ? `${devName} (D3D11 MFT)` : 'GPU/APU (D3D11 MFT)';
      hwEncoderConfig = {
        name: label,
        isGpu: true,
        isApu: !!isApu,
        enc: ['-c:v', 'h264_mf', '-b:v', '6500k', '-pix_fmt', 'yuv420p', '-r', FPS, '-an'],
      };
      return hwEncoderConfig;
    }
  } catch {}

  try {
    const encoders = execFileSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_amf')) {
      execFileSync(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_amf', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const label = devName ? `${devName} (AMF)` : 'AMD APU / Radeon (AMF)';
      hwEncoderConfig = {
        name: label,
        isGpu: true,
        isApu: true,
        enc: ['-c:v', 'h264_amf', '-b:v', '6500k', '-pix_fmt', 'yuv420p', '-r', FPS, '-an'],
      };
      return hwEncoderConfig;
    }
  } catch {}

  try {
    const encoders = execFileSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_qsv')) {
      execFileSync(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_qsv', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const label = devName ? `${devName} (QSV)` : 'Intel iGPU (QuickSync)';
      hwEncoderConfig = {
        name: label,
        isGpu: true,
        isApu: true,
        enc: ['-c:v', 'h264_qsv', '-b:v', '6500k', '-pix_fmt', 'yuv420p', '-r', FPS, '-an'],
      };
      return hwEncoderConfig;
    }
  } catch {}

  hwEncoderConfig = {
    name: 'CPU Software Mode (libx264 veryfast - Universal Compatibility)',
    isGpu: false,
    isApu: false,
    enc: ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', FPS, '-an'],
  };
  return hwEncoderConfig;
}

const FILL = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1`;

function getBadgeFile(speakerKey, lang = 'bn') {
  const normKey = (speakerKey || 'NARRATOR').trim();
  const candidate = path.join(__dirname, 'public', 'assets', 'badges', `badge_${normKey}_${lang}.png`);
  if (exists(candidate)) return candidate;
  const narratorCandidate = path.join(__dirname, 'public', 'assets', 'badges', `badge_NARRATOR_${lang}.png`);
  if (exists(narratorCandidate)) return narratorCandidate;
  return null;
}

async function writeSrt(project, lang, destFile) {
  const getDur = (s) => (s.language_durations && s.language_durations[lang]) || s.duration;
  let t = 0;
  const blocks = [];
  let idx = 1;
  for (const s of project.scenes) {
    const dur = getDur(s);
    const startT = (project.timeline_mode === 'free' && typeof s.custom_start === 'number') ? s.custom_start : t;
    const text = (s.narration && s.narration[lang]) || '';
    if (text.trim()) {
      const startMs = Math.round(startT * 1000);
      const endMs = Math.round((startT + dur) * 1000);
      const fmt = (ms) => {
        const hrs = Math.floor(ms / 3600000).toString().padStart(2, '0');
        const mins = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
        const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        const millis = (ms % 1000).toString().padStart(3, '0');
        return `${hrs}:${mins}:${secs},${millis}`;
      };
      blocks.push(`${idx++}\n${fmt(startMs)} --> ${fmt(endMs)}\n${text.trim()}\n`);
    }
    t += dur;
  }
  await fsp.writeFile(destFile, blocks.join('\n'), 'utf8');
}

function buildSceneOverlayPng(project, scene, lang, dir, cacheDir) {
  if (!project || !scene || !cacheDir) return null;
  const charObj = (project.characters || []).find((c) => c.id === scene.dialogue_speaker);
  const rawName = charObj?.[`name_${lang}`] || charObj?.name_bn || charObj?.name_en || scene.dialogue_speaker || 'NARRATOR';
  const rawRole = charObj?.[`role_${lang}`] || charObj?.role_bn || charObj?.role_en || '';
  const cleanName = stripVoiceNameFromRole(rawName);
  const cleanRole = stripVoiceNameFromRole(rawRole);

  const logoCfg = project.branding || {};
  let logoAbs = '';
  if (logoCfg.logo_file) {
    const c1 = path.join(dir, logoCfg.logo_file);
    const c2 = path.join(ROOT, logoCfg.logo_file.replace(/^\//, ''));
    if (exists(c1)) logoAbs = c1;
    else if (exists(c2)) logoAbs = c2;
  }
  if (!logoAbs && exists(path.join(ROOT, 'references', 'mascot_logo_ref.jpg'))) {
    logoAbs = path.join(ROOT, 'references', 'mascot_logo_ref.jpg');
  }

  const tcText = scene.text_card_text || scene.callout_text || '';
  const tcStyle = scene.text_card_style || 'voice_of_dhaka_quote';
  const tkCfg = project.ticker_config || {};
  const tkPos = scene.ticker_position || tkCfg.position || 'none';
  const tkText = scene.ticker_text || tkCfg[`text_${lang}`] || tkCfg.text_bn || tkCfg.text_en || '';

  const overlayFile = path.join(cacheDir, `ov_${pad4(scene.scene_id)}_${lang}.png`);
  const ok = runPillowScript({
    mode: 'scene_overlay',
    out_path: overlayFile,
    lang,
    logo_config: {
      enabled: logoCfg.enabled !== false,
      logo_path: logoAbs,
      position: logoCfg.position || 'top-right',
      size: logoCfg.size || 64,
      show_name: logoCfg.show_name !== false,
      channel_name: logoCfg[`channel_name_${lang}`] || logoCfg.channel_name_bn || ''
    },
    speaker_badge: {
      enabled: scene.hide_speaker_badge !== true,
      name: cleanName,
      role: cleanRole
    },
    text_card: {
      text: tcText,
      style: tcStyle
    },
    ticker: {
      position: tkPos,
      label: tkCfg[`label_${lang}`] || 'UPDATE',
      text: tkText
    }
  });
  return ok && exists(overlayFile) ? overlayFile : null;
}

function segmentArgs(scene, assetAbs, out, customDur, forceCpu = false, lang = 'bn', project = null, dir = '', cacheDir = '') {
  const dur = typeof customDur === 'number' && customDur > 0 ? customDur : scene.duration;
  const frames = Math.round(dur * FPS);
  const motion = scene.motion_effect || 'static';
  const ENC = forceCpu
    ? ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', FPS, '-an']
    : getHwEncoder().enc;

  const customOverlay = buildSceneOverlayPng(project, scene, lang, dir, cacheDir);
  const badgeFile = customOverlay || getBadgeFile(scene.dialogue_speaker, lang);
  const overlayCoords = customOverlay ? '0:0' : '48:H-h-48';

  if (!assetAbs) {
    if (badgeFile) {
      return [
        '-f', 'lavfi', '-i', `color=c=0x111827:s=${W}x${H}:r=${FPS}:d=${dur}`,
        '-i', badgeFile,
        '-filter_complex', `[0:v][1:v]overlay=${overlayCoords}:format=auto,format=yuv420p[v]`,
        '-map', '[v]',
        ...ENC, '-t', dur, out,
      ];
    }
    return ['-f', 'lavfi', '-i', `color=c=0x111827:s=${W}x${H}:r=${FPS}:d=${dur}`, '-vf', 'format=yuv420p', ...ENC, '-t', dur, out];
  }

  const ext = path.extname(assetAbs).toLowerCase();
  let effMotion = motion;
  if (effMotion === 'ai_video' && IMG_EXT.includes(ext)) {
    effMotion = 'zoom_in';
  }

  let baseInput = [];
  let baseVf = '';
  let isFramesBased = false;

  if (VID_EXT.includes(ext)) {
    const trimIn = Number(scene.trim_in || 0);
    const D = Math.max(0, probeDurSync(assetAbs) - trimIn);
    const inArgs = trimIn > 0 ? ['-ss', String(trimIn), '-i', assetAbs] : ['-i', assetAbs];
    if (D > 0 && D < dur - 0.05) {
      const f = dur / D;
      if (f <= 2.0) {
        baseInput = inArgs;
        baseVf = `${FILL},fps=${FPS},setpts=${f.toFixed(4)}*PTS,fps=${FPS},tpad=stop_mode=clone:stop_duration=${dur}`;
      } else {
        baseInput = ['-stream_loop', '1', ...inArgs];
        baseVf = `${FILL},fps=${FPS}`;
      }
    } else {
      baseInput = inArgs;
      baseVf = `${FILL},fps=${FPS},tpad=stop_mode=clone:stop_duration=${dur}`;
    }
  } else if (effMotion === 'static') {
    baseInput = ['-loop', '1', '-framerate', FPS, '-i', assetAbs];
    baseVf = `${FILL}`;
  } else {
    const Z = 0.12;
    const stopFrames = Math.max(1, Math.round(frames * 0.625));
    const mapFrames = Math.max(1, Math.round(frames * 0.45));
    const zx = {
      zoom_in: [`1+${Z}*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      zoom_out: [`${1 + Z}-${Z}*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      zoom_in_fast: [`1+0.26*pow(on/${frames},0.65)`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      zoom_out_fast: [`1.26-0.26*pow(on/${frames},0.65)`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      zoom_in_slow: [`1+0.06*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      zoom_out_slow: [`1.06-0.06*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      zoom_in_top_left: [`1+0.18*on/${frames}`, `(iw/4)*(1-on/${frames})`, `(ih/4)*(1-on/${frames})`],
      zoom_in_top_right: [`1+0.18*on/${frames}`, `(iw-iw/zoom)-(iw/4)*(1-on/${frames})`, `(ih/4)*(1-on/${frames})`],
      zoom_in_bottom: [`1+0.18*on/${frames}`, `iw/2-(iw/zoom/2)`, `(ih-ih/zoom)*(on/${frames})`],
      pan_right: [`${1 + Z}`, `(iw-iw/zoom)*on/${frames}`, `ih/2-(ih/zoom/2)`],
      pan_left: [`${1 + Z}`, `(iw-iw/zoom)*(1-on/${frames})`, `ih/2-(ih/zoom/2)`],
      pan_up: [`${1 + Z}`, `iw/2-(iw/zoom/2)`, `(ih-ih/zoom)*(1-on/${frames})`],
      pan_down: [`${1 + Z}`, `iw/2-(iw/zoom/2)`, `(ih-ih/zoom)*on/${frames}`],
      pan_diag_tl_br: [`1.16`, `(iw-iw/zoom)*on/${frames}`, `(ih-ih/zoom)*on/${frames}`],
      pan_diag_tr_bl: [`1.16`, `(iw-iw/zoom)*(1-on/${frames})`, `(ih-ih/zoom)*on/${frames}`],
      pan_diag_bl_tr: [`1.16`, `(iw-iw/zoom)*on/${frames}`, `(ih-ih/zoom)*(1-on/${frames})`],
      pan_diag_br_tl: [`1.16`, `(iw-iw/zoom)*(1-on/${frames})`, `(ih-ih/zoom)*(1-on/${frames})`],
      pan_left_zoom_in: [`1.05+0.15*on/${frames}`, `(iw-iw/zoom)*(1-on/${frames})`, `ih/2-(ih/zoom/2)`],
      pan_right_zoom_out: [`1.20-0.12*on/${frames}`, `(iw-iw/zoom)*on/${frames}`, `ih/2-(ih/zoom/2)`],
      whip_pan_left: [`1.12`, `(iw-iw/zoom)*pow(on/${frames},0.4)`, `ih/2-(ih/zoom/2)`],
      whip_pan_right: [`1.12`, `(iw-iw/zoom)*(1-pow(on/${frames},0.4))`, `ih/2-(ih/zoom/2)`],
      whip_pan_up: [`1.12`, `iw/2-(iw/zoom/2)`, `(ih-ih/zoom)*(1-pow(on/${frames},0.4))`],
      whip_pan_down: [`1.12`, `iw/2-(iw/zoom/2)`, `(ih-ih/zoom)*pow(on/${frames},0.4)`],
      slide_push_left: [`1.10`, `(iw-iw/zoom)*min(1,on/35)`, `ih/2-(ih/zoom/2)`],
      slide_push_right: [`1.10`, `(iw-iw/zoom)*(1-min(1,on/35))`, `ih/2-(ih/zoom/2)`],
      slide_push_up: [`1.10`, `iw/2-(iw/zoom/2)`, `(ih-ih/zoom)*(1-min(1,on/35))`],
      slide_push_down: [`1.10`, `iw/2-(iw/zoom/2)`, `(ih-ih/zoom)*min(1,on/35)`],
      elastic_bounce_in: [`1.08+0.06*sin(on*0.4)*exp(-on/25)`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      overshoot_snap_zoom: [`1+0.22*min(1,on/22)-0.06*max(0,min(1,(on-22)/18))`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      vox_cutout_pan_lr: [`1.18`, `(iw-iw/zoom)*on/${frames}`, `ih/2-(ih/zoom/2)+8*sin(on/12)`],
      vox_cutout_pan_rl: [`1.18`, `(iw-iw/zoom)*(1-on/${frames})`, `ih/2-(ih/zoom/2)+8*sin(on/12)`],
      vod_spotlight_glide: [`1.14+0.06*on/${frames}`, `(iw-iw/zoom)*on/${frames}`, `ih/2-(ih/zoom/2)`],
      floating_card_pan: [`1.16`, `(iw-iw/zoom)*(0.5+0.45*sin(on/28))`, `ih/2-(ih/zoom/2)`],
      earthquake_tremor: [`1.08`, `iw/2-(iw/zoom/2)+12*sin(on*1.8)`, `ih/2-(ih/zoom/2)+10*cos(on*2.2)`],
      heartbeat_pulse_zoom: [`1+0.08*abs(sin(on*0.12))`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      vertigo_dolly_zoom: [`1+0.25*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      vox_stop_motion: [`1+0.14*min(floor(on/5)*5,${stopFrames})/${stopFrames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      parallax_25d: [`1+0.16*pow(on/${frames},1.35)`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      map_zoom_highlight: [`1+0.22*min(on,${mapFrames})/${mapFrames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      handheld_docu: [`1.08+0.04*on/${frames}`, `iw/2-(iw/zoom/2)+14*sin(on/9)`, `ih/2-(ih/zoom/2)+10*cos(on/11)`],
      cinematic_glow: [`1+0.10*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      crossfade: [`1+0.08*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      glitch_twitch_cut: [`1.08+0.05*gt(sin(on*1.7),0.82)`, `iw/2-(iw/zoom/2)+16*gt(sin(on*2.3),0.85)`, `ih/2-(ih/zoom/2)`],
    }[effMotion] || [`1+${Z}*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`];
    baseInput = ['-i', assetAbs];
    baseVf = `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},` +
      `zoompan=z='${zx[0]}':x='${zx[1]}':y='${zx[2]}':d=${frames}:s=${W}x${H}:fps=${FPS},setsar=1`;
    isFramesBased = true;
  }

  // Transition entrance filters for fade/dip/flash/burn/wipe/iris/split presets
  const transMap = {
    crossfade: 'fade=t=in:st=0:d=0.55',
    dip_to_black: 'fade=t=in:st=0:d=0.65:c=black,fade=t=out:st=' + Math.max(0.5, dur - 0.45).toFixed(2) + ':d=0.45:c=black',
    dip_to_white: 'fade=t=in:st=0:d=0.55:c=white',
    dip_to_gold: 'fade=t=in:st=0:d=0.60:c=0xD97706',
    luma_fade_in: 'fade=t=in:st=0:d=0.65',
    flash_bulb_cut: 'fade=t=in:st=0:d=0.35:c=white,eq=contrast=1.12',
    film_burn_transition: 'fade=t=in:st=0:d=0.55:c=0xEA580C',
    light_leak_wipe: 'fade=t=in:st=0:d=0.55:c=0xF59E0B',
    smoke_dissolve: 'fade=t=in:st=0:d=0.70:c=0x334155',
    blur_dissolve: 'fade=t=in:st=0:d=0.50',
    iris_circle_open: 'vignette=PI/3.2,fade=t=in:st=0:d=0.45',
    iris_circle_close: 'vignette=PI/2.8,fade=t=out:st=' + Math.max(0.5, dur - 0.5).toFixed(2) + ':d=0.5',
    split_horizontal_open: 'fade=t=in:st=0:d=0.4',
    split_vertical_open: 'fade=t=in:st=0:d=0.4',
    clock_wipe_cw: 'fade=t=in:st=0:d=0.45',
    page_peel_curl: 'fade=t=in:st=0:d=0.45:c=0xF3EFE6',
    spin_cw_in: 'fade=t=in:st=0:d=0.40',
    spin_ccw_in: 'fade=t=in:st=0:d=0.40',
    pendulum_tilt: 'vignette=PI/4.5',
    flip_3d_card: 'fade=t=in:st=0:d=0.40',
  };
  if (transMap[effMotion]) {
    baseVf = `${baseVf},${transMap[effMotion]}`;
  }

  // Apply all 60 VFX / Image Filter Overlays
  const vfx = scene.vfx_effect || 'none';
  const vfxMap = {
    vox_halftone_paper: 'eq=contrast=1.18:saturation=0.58:brightness=0.02,noise=alls=7:allf=t',
    archival_noir_vignette: 'vignette=PI/3.6,eq=contrast=1.16:brightness=-0.03:saturation=0.82',
    vintage_sepia_grain: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131,noise=alls=12:allf=t',
    highlighter_callout: 'eq=contrast=1.12:saturation=1.16,drawbox=x=0:y=ih-136:w=iw:h=8:c=0xFFE600@0.85:t=fill',
    chalkboard_grid: 'eq=contrast=1.22:brightness=-0.04:saturation=1.10',
    noor_divine_bloom: 'colorbalance=rs=0.08:gs=0.04:bs=-0.05,eq=brightness=0.03:saturation=1.12',
    anamorphic_cinema: 'eq=contrast=1.12:saturation=1.08,drawbox=x=0:y=0:w=iw:h=118:c=black:t=fill,drawbox=x=0:y=ih-118:w=iw:h=118:c=black:t=fill',
    crt_scanlines: 'colorbalance=bs=0.07:gs=0.03,eq=contrast=1.14',
    parchment_manuscript: 'colorchannelmixer=.42:.75:.18:0:.36:.68:.16:0:.28:.52:.14,vignette=PI/4,eq=contrast=1.12',
    papercraft_cutout_shadow: 'eq=contrast=1.15:saturation=1.12,drawbox=x=24:y=24:w=iw-48:h=ih-48:c=0xF4ECD8@0.65:t=6',
    golden_hour_sunset: 'colorbalance=rs=0.12:gs=0.06:bs=-0.14,eq=contrast=1.14:saturation=1.20',
    dune_desert_amber: 'colorbalance=rs=0.16:gs=0.08:bs=-0.18,eq=contrast=1.18:brightness=0.02:saturation=1.15',
    battlefield_fire_embers: 'colorbalance=rs=0.18:gs=-0.04:bs=-0.12,eq=contrast=1.24:saturation=1.22',
    sandstorm_haze: 'eq=contrast=0.92:brightness=0.06:saturation=0.75,noise=alls=6:allf=t',
    bleach_bypass_grit: 'eq=contrast=1.35:saturation=0.55:brightness=-0.02',
    moonlight_cobalt: 'colorbalance=rs=-0.14:gs=-0.05:bs=0.18,eq=contrast=1.15:saturation=0.90',
    teal_orange_blockbuster: 'colorbalance=rs=0.08:gs=0.02:bs=-0.08,eq=contrast=1.18:saturation=1.12',
    candlelight_flicker: 'colorbalance=rs=0.14:gs=0.07:bs=-0.12,eq=contrast=1.16:saturation=1.12',
    torchlight_dungeon: 'vignette=PI/3.2,colorbalance=rs=0.15:gs=0.05:bs=-0.10,eq=contrast=1.25:brightness=-0.04',
    chiaroscuro_caravaggio: 'vignette=PI/3.0,eq=contrast=1.30:brightness=-0.05:saturation=0.95',
    classified_dossier: 'colorchannelmixer=.38:.74:.18:0:.34:.66:.16:0:.26:.50:.13,vignette=PI/4.2,eq=contrast=1.18',
    tunnel_vision_dread: 'vignette=PI/2.8,eq=contrast=1.20:brightness=-0.06',
    newspaper_microfilm: 'colorchannelmixer=.33:.33:.33:0:.33:.33:.33:0:.33:.33:.33,eq=contrast=1.3:brightness=0.04,noise=alls=10:allf=t',
    blueprint_cyanotype: 'colorchannelmixer=0:0:0:0:.2:.4:.4:0:.4:.5:.9,eq=contrast=1.2',
    red_thread_board: 'colorbalance=rs=0.15:bs=-0.1,eq=contrast=1.15',
    christopher_nolan_cold: 'colorbalance=rs=-0.10:gs=-0.02:bs=0.14,eq=contrast=1.25:saturation=0.85',
    matrix_cyber_green: 'colorchannelmixer=0:0:0:0:.2:.8:.2:0:0:0:0,eq=contrast=1.3',
    blade_runner_neon: 'colorbalance=rs=0.15:gs=-0.08:bs=0.20,eq=contrast=1.25:saturation=1.35',
    wes_anderson_pastel: 'colorbalance=rs=0.12:gs=0.08:bs=-0.06,eq=contrast=1.05:saturation=1.25',
    fincher_neo_noir: 'colorbalance=rs=-0.05:gs=0.08:bs=-0.10,eq=contrast=1.35:brightness=-0.04:saturation=0.75',
    vivid_hdr_pop: 'eq=contrast=1.22:saturation=1.35:brightness=0.02',
    kodak_portra_400: 'colorbalance=rs=0.08:gs=0.04:bs=-0.05,eq=contrast=1.10:saturation=1.12',
    fujifilm_velvia_50: 'colorbalance=rs=0.06:gs=0.03:bs=0.05,eq=contrast=1.20:saturation=1.40',
    super8_home_movie: 'vignette=PI/3.5,eq=contrast=1.18:saturation=0.85,noise=alls=15:allf=t',
    '16mm_newsreel_bw': 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3,vignette=PI/3.8,eq=contrast=1.35:brightness=-0.02,noise=alls=18:allf=t',
    silent_era_1920s: 'colorchannelmixer=.35:.45:.2:0:.35:.45:.2:0:.35:.45:.2,vignette=PI/3.2,eq=contrast=1.4:brightness=-0.05,noise=alls=22:allf=t',
    daguerreotype_1850: 'colorchannelmixer=.36:.42:.22:0:.34:.40:.20:0:.30:.36:.18,vignette=PI/2.9,eq=contrast=1.42:brightness=-0.06',
    polaroid_instant_fade: 'colorbalance=rs=0.06:gs=0.05:bs=-0.04,eq=contrast=0.94:brightness=0.04:saturation=0.84',
    technicolor_3strip: 'eq=contrast=1.24:saturation=1.52',
    damaged_celluloid: 'colorchannelmixer=.40:.70:.18:0:.35:.64:.16:0:.27:.50:.13,noise=alls=20:allf=t,vignette=PI/3.5',
    sin_city_splash: 'eq=contrast=1.42:saturation=0.35:brightness=-0.04,vignette=PI/3.2',
    interrogation_lamp: 'vignette=PI/2.7,eq=contrast=1.35:brightness=-0.08:saturation=0.7',
    eclipse_corona_dark: 'vignette=PI/2.5,eq=contrast=1.4:brightness=-0.1:saturation=0.6',
    ethereal_dream_mist: 'colorbalance=rs=0.05:gs=0.05:bs=0.10,eq=contrast=0.95:brightness=0.06:saturation=0.9',
    heavenly_god_rays: 'colorbalance=rs=0.12:gs=0.10:bs=-0.05,eq=contrast=1.15:brightness=0.05:saturation=1.15',
    celestial_starlight: 'colorbalance=rs=-0.08:gs=0.02:bs=0.18,eq=contrast=1.2:saturation=1.1',
    golden_dust_motes: 'colorbalance=rs=0.15:gs=0.08:bs=-0.12,eq=contrast=1.14:saturation=1.2,noise=alls=5:allf=t',
    prism_rainbow_flare: 'colorbalance=rs=0.08:gs=-0.04:bs=0.12,eq=contrast=1.14:saturation=1.28',
    anamorphic_blue_streak: 'colorbalance=rs=-0.08:gs=0.04:bs=0.18,eq=contrast=1.18:saturation=1.15',
    sacred_candle_aura: 'colorbalance=rs=0.14:gs=0.08:bs=-0.08,eq=contrast=1.12:brightness=0.03:saturation=1.18',
    vhs_1990s_tracking: 'eq=contrast=1.14:saturation=1.30,noise=alls=14:allf=t',
    rgb_chromatic_split: 'eq=contrast=1.22:saturation=1.38',
    cyber_glitch_slice: 'colorbalance=rs=0.12:gs=-0.08:bs=0.16,eq=contrast=1.28:saturation=1.42',
    night_vision_goggles: 'colorchannelmixer=0:0:0:0:.25:.85:.15:0:0:0:0,noise=alls=12:allf=t,eq=contrast=1.28',
    thermal_infrared: 'hue=h=185:s=2.2,eq=contrast=1.30',
    rain_storm_glass: 'colorbalance=rs=-0.1:gs=-0.02:bs=0.15,eq=contrast=1.12:saturation=0.85',
    winter_snow_blizzard: 'colorbalance=rs=-0.12:gs=0.05:bs=0.20,eq=contrast=1.1:brightness=0.05:saturation=0.75',
    london_thick_fog: 'eq=contrast=0.88:brightness=0.08:saturation=0.70',
    lightning_thunder_flash: 'eq=contrast=1.3:brightness=0.08:saturation=0.9'
  };
  if (vfxMap[vfx]) {
    baseVf = `${baseVf},${vfxMap[vfx]}`;
  }

  const durArgs = isFramesBased ? ['-frames:v', frames] : ['-t', dur];

  if (badgeFile) {
    const fc = [
      `[0:v]${baseVf},setsar=1[v_base]`,
      `[v_base][1:v]overlay=${overlayCoords}:format=auto,format=yuv420p[v_out]`,
    ].join(';');
    return [
      ...baseInput,
      '-i', badgeFile,
      '-filter_complex', fc,
      '-map', '[v_out]',
      ...durArgs,
      ...ENC,
      out,
    ];
  }

  const finalVf = `${baseVf},format=yuv420p`;
  return [...baseInput, '-vf', finalVf, ...durArgs, ...ENC, out];
}

function segmentHash(scene, assetAbs, customDur, forceCpu = false, lang = 'bn') {
  const dur = typeof customDur === 'number' && customDur > 0 ? customDur : scene.duration;
  const st = assetAbs && exists(assetAbs) ? fs.statSync(assetAbs) : null;
  const encName = forceCpu ? 'CPU_libx264' : getHwEncoder().name;
  return crypto.createHash('sha1').update(JSON.stringify({
    a: assetAbs, m: st?.mtimeMs, s: st?.size, d: dur, trim: scene.trim_in || 0, fx: scene.motion_effect, vfx: scene.vfx_effect || 'none', afx: scene.audio_effect || 'studio_clean', tc: scene.text_card_text || scene.callout_text || '', tcs: scene.text_card_style || '', tk: scene.ticker_text || '', hsb: scene.hide_speaker_badge || false, spk: scene.dialogue_speaker, lang, W, H, FPS, enc: encName, v: 16,
  })).digest('hex').slice(0, 12);
}

/**
 * Dynamically assemble narration track directly from individual part audio files on the timeline
 * (so NO external manufacture/concat script is ever needed!). Falls back to `{lang}_narration.*` if present.
 */
async function ensureOrAssembleLanguageNarration(job, id, dir, project, partAudioClips, lang, cacheDir, langTotal) {
  const audioDir = path.join(dir, 'audio');
  const existingMaster = findFile(audioDir, `${lang}_narration`, AUD_EXT);

  // Check if individual part files exist on disk
  const availableParts = [];
  let cursor = 0;
  for (const s of project.scenes) {
    const dur = (s.language_durations && s.language_durations[lang]) || s.duration || 5;
    const startT = (project.timeline_mode === 'free' && typeof s.custom_start === 'number') ? s.custom_start : cursor;
    const absPart = resolvePartAudio(dir, s.scene_id, lang, s.audio_clips?.[lang]?.file);
    if (absPart && exists(absPart)) {
      availableParts.push({
        scene_id: s.scene_id,
        abs: absPart,
        startMs: Math.round(startT * 1000),
        dur,
        volDb: s.audio_clips?.[lang]?.volume_db ?? 0,
        audioEffect: s.audio_effect || 'studio_clean',
      });
    }
    cursor += dur;
  }

  if (availableParts.length > 0) {
    log(job, `• [${lang.toUpperCase()}] Auto-assembling ${availableParts.length} individual part audio clip(s) from timeline (no manual manufacture file required)...`);
    const outNar = path.join(cacheDir, `assembled_${lang}_narration.wav`);
    // Assemble in chunks of 20 to stay well below OS command-line limits
    const CHUNK = 20;
    const chunkFiles = [];
    for (let c = 0; c < availableParts.length; c += CHUNK) {
      const slice = availableParts.slice(c, c + CHUNK);
      const cOut = path.join(cacheDir, `nar_chunk_${lang}_${c}.wav`);
      const args = [];
      slice.forEach((p) => args.push('-i', p.abs));
      const afxMap = {
        studio_clean: 'anull',
        warm_tube_narrator: 'equalizer=f=120:t=q:w=1:g=3.5,equalizer=f=4000:t=q:w=1.5:g=2',
        philosophical_intimate: 'acompressor=threshold=-18dB:ratio=3:attack=10:release=150,equalizer=f=180:t=q:w=1.2:g=2.5',
        old_radio_archival: 'highpass=f=350,lowpass=f=3200,acompressor=threshold=-15dB:ratio=5',
        echo_hall_reverent: 'aecho=0.8:0.88:55:0.22',
        telephone_intercept: 'highpass=f=450,lowpass=f=2800',
        deep_cinema_trailer: 'equalizer=f=80:t=q:w=1.2:g=4.5,acompressor=threshold=-20dB:ratio=4:attack=5:release=100',
        cathedral_sacred_choir: 'aecho=0.8:0.9:80:0.35',
        de_esser_broadcast_pro: 'equalizer=f=6500:t=q:w=2:g=-3.5'
      };
      const flt = slice.map((p, k) => {
        const afx = afxMap[p.audioEffect] || 'anull';
        return `[${k}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,${afx},volume=${p.volDb}dB,adelay=${p.startMs}|${p.startMs}[a${k}]`;
      }).join(';');
      const tags = slice.map((_, k) => `[a${k}]`).join('');
      const fc = `${flt};${tags}amix=inputs=${slice.length}:duration=longest:dropout_transition=0:normalize=0[out]`;
      await runFF(job, [...args, '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-ac', '2', cOut]);
      chunkFiles.push(cOut);
    }
    if (chunkFiles.length === 1) {
      await fsp.copyFile(chunkFiles[0], outNar);
    } else {
      const mArgs = [];
      chunkFiles.forEach((cf) => mArgs.push('-i', cf));
      const tags = chunkFiles.map((_, k) => `[${k}:a]`).join('');
      const fc = `${tags}amix=inputs=${chunkFiles.length}:duration=longest:dropout_transition=0:normalize=0,apad=whole_dur=${langTotal}[out]`;
      await runFF(job, [...mArgs, '-filter_complex', fc, '-map', '[out]', '-t', String(langTotal), '-ar', '48000', '-ac', '2', outNar]);
    }
    return outNar;
  }

  if (existingMaster && exists(existingMaster)) {
    return existingMaster;
  }
  return null;
}

async function ensureOrAssembleSfxTrack(job, dir, project, lang, cacheDir, langTotal) {
  if (project.tracks_config?.sfx?.muted) return null;
  const sfxItems = [];
  let cursor = 0;
  for (const s of project.scenes) {
    const dur = (s.language_durations && s.language_durations[lang]) || s.duration || 5;
    const startT = (project.timeline_mode === 'free' && typeof s.custom_start === 'number') ? s.custom_start : cursor;
    const cue = (s.sfx || '').trim();
    if (cue && cue !== 'none') {
      const p1 = path.join(dir, 'audio', 'sfx', `${cue}.wav`);
      const p2 = path.join(ROOT, 'public', 'assets', 'sfx', `${cue}.wav`);
      const absSfx = exists(p1) ? p1 : (exists(p2) ? p2 : null);
      if (absSfx) {
        sfxItems.push({ abs: absSfx, startMs: Math.round(startT * 1000) });
      }
    }
    cursor += dur;
  }
  if (!sfxItems.length) return null;
  const outSfx = path.join(cacheDir, `assembled_${lang}_sfx.wav`);
  const CHUNK = 20;
  const chunkFiles = [];
  for (let c = 0; c < sfxItems.length; c += CHUNK) {
    const slice = sfxItems.slice(c, c + CHUNK);
    const cOut = path.join(cacheDir, `sfx_chunk_${lang}_${c}.wav`);
    const args = [];
    slice.forEach((p) => args.push('-i', p.abs));
    const flt = slice.map((p, k) => `[${k}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=-8dB,adelay=${p.startMs}|${p.startMs}[s${k}]`).join(';');
    const tags = slice.map((_, k) => `[s${k}]`).join('');
    const fc = `${flt};${tags}amix=inputs=${slice.length}:duration=longest:dropout_transition=0:normalize=0[out]`;
    await runFF(job, [...args, '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-ac', '2', cOut]).catch(() => {});
    if (exists(cOut)) chunkFiles.push(cOut);
  }
  if (!chunkFiles.length) return null;
  if (chunkFiles.length === 1) {
    await fsp.copyFile(chunkFiles[0], outSfx);
  } else {
    const mArgs = [];
    chunkFiles.forEach((cf) => mArgs.push('-i', cf));
    const tags = chunkFiles.map((_, k) => `[${k}:a]`).join('');
    const fc = `${tags}amix=inputs=${chunkFiles.length}:duration=longest:dropout_transition=0:normalize=0,apad=whole_dur=${langTotal}[out]`;
    await runFF(job, [...mArgs, '-filter_complex', fc, '-map', '[out]', '-t', String(langTotal), '-ar', '48000', '-ac', '2', outSfx]).catch(() => {});
  }
  return exists(outSfx) ? outSfx : null;
}

async function renderProject(id, opts) {
  const job = jobs.get(id);
  const dir = pdir(id);
  const { project, partAudioClips } = await autoDiscoverProjectParts(id);
  const rendersDir = path.join(dir, 'renders');
  const exportsDir = path.join(dir, 'exports');
  const cacheDir = path.join(rendersDir, '.cache');
  await fsp.mkdir(cacheDir, { recursive: true });
  await fsp.mkdir(exportsDir, { recursive: true });

  const langCount = opts.langs.length;
  log(job, `▶ Simple Studio Multi-Track Render started — ${project.scenes.length} parts/scenes, languages: ${opts.langs.join(', ')}`);
  log(job, `▶ Target export folder: projects/${id}/exports/`);

  const audioDir = path.join(dir, 'audio');
  const bgm = opts.useBgm && !project.tracks_config?.bgm?.muted ? findFile(audioDir, 'bgm', AUD_EXT) : null;
  const outputs = [];

  for (const [idx, lang] of opts.langs.entries()) {
    const langSpan = 98 / langCount;
    const langBase = idx * langSpan;

    const getDur = (s) => (s.language_durations && s.language_durations[lang]) || s.duration;
    const langTotal = project.scenes.reduce((sum, s) => sum + getDur(s), 0);

    log(job, `\n▶ Rendering ${LANGS[lang]} multi-track timeline (${langTotal.toFixed(1)}s)...`);
    setState(job, { stage: `Encoding ${LANGS[lang]} visual tracks`, progress: langBase });

    const segFiles = [];
    let acc = 0;
    for (let sIdx = 0; sIdx < project.scenes.length; sIdx++) {
      const scene = project.scenes[sIdx];
      const dur = getDur(scene);
      const resAsset = resolveSceneAsset(dir, scene);
      const assetAbs = resAsset.abs;
      if (!assetAbs) log(job, `⚠ Part #${scene.scene_id}: visual asset missing — using studio slate`);
      else if (resAsset.isFallback) log(job, `ℹ Part #${scene.scene_id}: using discovered asset (${path.basename(assetAbs)})`);
      const seg = path.join(cacheDir, `seg_${pad4(scene.scene_id)}_${segmentHash(scene, assetAbs, dur, false, lang)}.mp4`);
      const segBase = langBase + (langSpan * 0.65) * (acc / langTotal);
      const segSpan = (langSpan * 0.65) * (dur / langTotal);

      if (exists(seg)) {
        job.progress = segBase + segSpan;
      } else {
        log(job, `• Part #${scene.scene_id} [${lang.toUpperCase()}]: encoding ${scene.motion_effect || 'static'} (${dur}s)`);
        try {
          await runFF(job, segmentArgs(scene, assetAbs, seg + '.part.mp4', dur, false, lang, project, dir, cacheDir), { duration: dur, base: segBase, span: segSpan });
        } catch (encErr) {
          if (getHwEncoder().isGpu) {
            log(job, `  ⚠ Hardware encoder note: ${encErr.message.split('\n')[0]}`);
            log(job, `  🛡️ Auto-recovering via CPU software mode (libx264) for Part #${scene.scene_id}...`);
            hwFallbackTriggered = true;
            await runFF(job, segmentArgs(scene, assetAbs, seg + '.part.mp4', dur, true, lang, project, dir, cacheDir), { duration: dur, base: segBase, span: segSpan });
          } else {
            throw encErr;
          }
        }
        await fsp.rename(seg + '.part.mp4', seg);
      }
      segFiles.push(seg);
      acc += dur;
      emit(job, 'state', jobSnapshot(job));
    }

    setState(job, { stage: `Assembling ${LANGS[lang]} visual master`, progress: langBase + langSpan * 0.65 });
    const list = path.join(cacheDir, `concat_${lang}.txt`);
    await fsp.writeFile(list, segFiles.map((f) => `file '${f.split(path.sep).join('/').replace(/'/g, "'\\''")}'`).join('\n'));
    const master = path.join(rendersDir, `visual_master_${lang}.mp4`);
    await runFF(job, ['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', master], {
      duration: langTotal, base: langBase + langSpan * 0.65, span: langSpan * 0.05,
    });
    log(job, `✓ ${LANGS[lang]} visual track assembled (${langTotal.toFixed(1)}s)`);

    setState(job, { stage: `Mixing ${LANGS[lang]} multi-track audio, SFX & BGM`, progress: langBase + langSpan * 0.7 });
    const nar = await ensureOrAssembleLanguageNarration(job, id, dir, project, partAudioClips, lang, cacheDir, langTotal);
    const sfxTrack = await ensureOrAssembleSfxTrack(job, dir, project, lang, cacheDir, langTotal);

    const exportOut = path.join(exportsDir, `video_${lang}.mp4`);
    const renderOut = path.join(rendersDir, `video_${lang}.mp4`);
    const norm = 'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo';
    const loud = 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000';
    const bodyVideoPart = exportOut + '.body.mp4';

    if (nar) {
      const args = ['-i', master, '-i', nar];
      let fc;
      if (bgm && sfxTrack) {
        args.push('-stream_loop', '-1', '-i', bgm, '-i', sfxTrack);
        const duckStage = opts.duck
          ? `[bg][sc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350[bgd];`
          : `[sc]anullsink;[bg]anull[bgd];`;
        fc = `[1:a]${norm},apad,asplit=2[nar][sc];` +
          `[2:a]${norm},volume=${opts.bgmDb}dB[bg];` +
          `[3:a]${norm}[sfx];` + duckStage +
          `[nar][bgd][sfx]amix=inputs=3:duration=first:normalize=0,${loud}[aout]`;
      } else if (bgm) {
        args.push('-stream_loop', '-1', '-i', bgm);
        const duckStage = opts.duck
          ? `[bg][sc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350[bgd];`
          : `[sc]anullsink;[bg]anull[bgd];`;
        fc = `[1:a]${norm},apad,asplit=2[nar][sc];` +
          `[2:a]${norm},volume=${opts.bgmDb}dB[bg];` + duckStage +
          `[nar][bgd]amix=inputs=2:duration=first:normalize=0,${loud}[aout]`;
      } else if (sfxTrack) {
        args.push('-i', sfxTrack);
        fc = `[1:a]${norm},apad[nar];[2:a]${norm}[sfx];[nar][sfx]amix=inputs=2:duration=first:normalize=0,${loud}[aout]`;
      } else {
        fc = `[1:a]${norm},apad,${loud}[aout]`;
      }
      args.push('-filter_complex', fc, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '192k', '-t', langTotal, '-movflags', '+faststart', bodyVideoPart);

      log(job, `• ${LANGS[lang]}: mixing voiceover${sfxTrack ? ' + 5-Layer SFX' : ''}${bgm ? ` + BGM (${opts.bgmDb} dB)` : ''} → exports/${path.basename(exportOut)}`);
      await runFF(job, args, { duration: langTotal, base: langBase + langSpan * 0.7, span: langSpan * 0.25 });
    } else {
      log(job, `ℹ ${LANGS[lang]}: exporting visual master with ${sfxTrack ? 'SFX track' : 'stereo audio track'} to exports/${path.basename(exportOut)}`);
      if (sfxTrack) {
        await runFF(job, [
          '-i', master, '-i', sfxTrack,
          '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', langTotal, '-movflags', '+faststart', bodyVideoPart,
        ], { duration: langTotal, base: langBase + langSpan * 0.7, span: langSpan * 0.25 });
      } else {
        await runFF(job, [
          '-i', master, '-f', 'lavfi', '-i', `anullsrc=r=48000:cl=stereo`,
          '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', langTotal, '-movflags', '+faststart', bodyVideoPart,
        ], { duration: langTotal, base: langBase + langSpan * 0.7, span: langSpan * 0.25 });
      }
    }

    // Ensure Master Thumbnail in `projects/<id>/thumbnails/master/` & Prepend 0.8s Intro Thumbnail Frame if enabled
    const thumbsMasterDir = path.join(dir, 'thumbnails', 'master');
    await fsp.mkdir(thumbsMasterDir, { recursive: true });
    let masterThumbAbs = findFile(thumbsMasterDir, `master_thumbnail_${lang}`, IMG_EXT)
      || findFile(path.join(dir, 'metadata'), `${lang}_thumbnail`, IMG_EXT);
    if (!masterThumbAbs) {
      const firstAsset = resolveSceneAsset(dir, project.scenes?.[0]).abs || path.join(ROOT, 'references', 'ref_style_2_simple_history.jpg');
      const logoRel = project.branding?.logo_file || 'references/mascot_logo_ref.jpg';
      const logoAbs = exists(path.join(dir, logoRel)) ? path.join(dir, logoRel) : path.join(ROOT, logoRel.replace(/^\//, ''));
      const genThumb = path.join(thumbsMasterDir, `master_thumbnail_${lang}.png`);
      const okT = await runPlateScript({
        mode: 'thumbnail',
        is_short: false,
        out_path: genThumb,
        lang,
        bg_path: firstAsset,
        logo_path: logoAbs,
        channel_name: project.branding?.[`channel_name_${lang}`] || LANGS[lang] || 'Simple History Teller',
        badge_text: lang === 'bn' ? 'পূর্ণাঙ্গ ডকুমেন্টারি' : (lang === 'hi' ? 'पूरी डॉक्यूमेंट्री' : 'FULL DOCUMENTARY'),
        title_text: project.metadata?.[`title_${lang}`] || project.metadata?.title_bn || id
      });
      if (okT) masterThumbAbs = genThumb;
    }

    const embedThumb = opts.embedIntroThumbnail !== false && (project.shorts_config?.embed_intro_thumbnail !== false);
    const introSec = Math.max(0.3, Math.min(2.0, Number(opts.introThumbnailSec || project.shorts_config?.intro_thumbnail_sec || 0.8)));

    if (embedThumb && masterThumbAbs && exists(masterThumbAbs)) {
      log(job, `• ${LANGS[lang]}: embedding ${introSec}s Master Thumbnail intro frame from thumbnails/master/...`);
      const introSeg = path.join(cacheDir, `master_intro_${lang}.mp4`);
      const encArgs = hwFallbackTriggered ? ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS)] : getHwEncoder().enc.filter((x) => x !== '-an');
      await runFF(job, [
        '-loop', '1', '-framerate', String(FPS), '-t', String(introSec), '-i', masterThumbAbs,
        '-f', 'lavfi', '-t', String(introSec), '-i', 'anullsrc=r=48000:cl=stereo',
        '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,format=yuv420p`,
        ...encArgs,
        '-c:a', 'aac', '-b:a', '192k', '-shortest', introSeg
      ]).catch(async () => {
        await runFF(job, [
          '-loop', '1', '-framerate', String(FPS), '-t', String(introSec), '-i', masterThumbAbs,
          '-f', 'lavfi', '-t', String(introSec), '-i', 'anullsrc=r=48000:cl=stereo',
          '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,format=yuv420p`,
          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS),
          '-c:a', 'aac', '-b:a', '192k', '-shortest', introSeg
        ]);
      });
      const introConcat = path.join(cacheDir, `master_with_intro_${lang}.txt`);
      await fsp.writeFile(introConcat, `file '${introSeg.split(path.sep).join('/')}'\nfile '${bodyVideoPart.split(path.sep).join('/')}'\n`, 'utf8');
      await runFF(job, ['-f', 'concat', '-safe', '0', '-i', introConcat, '-c', 'copy', '-movflags', '+faststart', exportOut + '.part.mp4']);
      await fsp.unlink(bodyVideoPart).catch(() => {});
    } else {
      await fsp.rename(bodyVideoPart, exportOut + '.part.mp4');
    }

    await archive(exportOut);
    await fsp.rename(exportOut + '.part.mp4', exportOut);
    // Mirror to renders/ for backward compatibility with existing tools
    await fsp.copyFile(exportOut, renderOut).catch(() => {});

    const srtExport = path.join(exportsDir, `video_${lang}.srt`);
    const srtRender = path.join(rendersDir, `video_${lang}.srt`);
    await writeSrt(project, lang, srtExport);
    await fsp.copyFile(srtExport, srtRender).catch(() => {});
    log(job, `✓ ${LANGS[lang]} subtitles exported: exports/${path.basename(srtExport)}`);

    outputs.push({ lang, name: path.basename(exportOut), folder: 'exports', url: rel(id, exportOut) });
    job.outputs = outputs;
    log(job, `✓ ${LANGS[lang]} exported to Export Folder: exports/${path.basename(exportOut)} (${langTotal.toFixed(1)}s)`);
  }
  return outputs;
}

app.post('/api/project/:id/render', wrap(async (req, res) => {
  const id = req.params.id;
  await readProject(id);
  const running = jobs.get(id);
  if (running && running.status === 'running') throw httpErr(409, 'A render is already running for this project');
  const langs = (req.body?.langs || Object.keys(LANGS)).filter((l) => LANGS[l]);
  if (!langs.length) throw httpErr(400, 'Select at least one language');
  const opts = {
    langs,
    bgmDb: Math.max(-60, Math.min(6, Number(req.body?.bgmDb ?? -20))),
    duck: req.body?.duck !== false,
    useBgm: req.body?.useBgm !== false,
    exportShorts: req.body?.exportShorts === true,
    embedIntroThumbnail: req.body?.embedIntroThumbnail !== false,
    introThumbnailSec: Number(req.body?.introThumbnailSec || 0.8),
  };
  const old = running?.listeners || new Set();
  const job = { status: 'running', progress: 0, stage: 'Starting', logs: [], outputs: [], langs, listeners: old, startedAt: Date.now(), cancelled: false };
  jobs.set(id, job);
  emit(job, 'reset', {});
  setState(job, {});
  renderProject(id, opts)
    .then(async (outputs) => {
      if (opts.exportShorts) {
        log(job, `\n▶ Automatically generating episodic 9:16 vertical Shorts/Reels/TikTok clips...`);
        try {
          const { exportProjectDual } = require('./tools/dual_render_exporter');
          const shortsResult = await exportProjectDual(id, { langs: opts.langs, embedIntroThumbnail: opts.embedIntroThumbnail, introThumbnailDuration: opts.introThumbnailSec });
          log(job, `✓ ${shortsResult.exports.length} episodic shorts exported to exports/shorts/ & renders/shorts/`);
        } catch (sErr) {
          log(job, `⚠ Shorts export warning: ${sErr.message}`);
        }
      }
      setState(job, { status: 'done', progress: 100, stage: `Finished — ${outputs.length} video(s) exported to exports/`, outputs, finishedAt: Date.now() });
      log(job, `■ Done in ${((Date.now() - job.startedAt) / 1000).toFixed(1)}s — Saved in exports/ folder.`);
    })
    .catch((e) => {
      const cancelled = job.cancelled;
      setState(job, { status: cancelled ? 'cancelled' : 'error', stage: cancelled ? 'Cancelled' : 'Failed', error: e.message, finishedAt: Date.now() });
      log(job, (cancelled ? '■ Cancelled by user' : '✗ ' + e.message));
    });
  res.json({ ok: true, job: jobSnapshot(job) });
}));

app.post('/api/project/:id/render-shorts', wrap(async (req, res) => {
  const id = safeId(req.params.id);
  const { exportProjectDual } = require('./tools/dual_render_exporter');
  const langs = req.body?.langs || ['bn', 'en', 'hi'];
  const results = await exportProjectDual(id, { langs });
  res.json({ ok: true, results });
}));

app.post('/api/project/:id/render/cancel', wrap(async (req, res) => {
  const job = jobs.get(safeId(req.params.id));
  if (!job || job.status !== 'running') throw httpErr(400, 'No running render');
  job.cancelled = true;
  if (job.proc) job.proc.kill('SIGKILL');
  res.json({ ok: true });
}));

/** Server-Sent Events: live progress + logs + live folder watcher for new parts! */
const folderWatchers = new Map();
function ensureProjectWatcher(id) {
  if (folderWatchers.has(id)) return;
  const dir = pdir(id);
  const watchTargets = [
    path.join(dir, 'parts'),
    path.join(dir, 'audio', 'raw'),
    path.join(dir, 'audio', 'raw_aistudio'),
    path.join(dir, 'visual_assets'),
  ];
  let debounceTimer = null;
  const notifyChange = (filename) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const job = jobs.get(id);
      if (!job || !job.listeners?.size) return;
      try {
        const { project, partAudioClips } = await autoDiscoverProjectParts(id);
        emit(job, 'parts_updated', {
          filename,
          scenesCount: project.scenes.length,
          totalDuration: project.total_duration_seconds,
          partAudioClipsCount: Object.keys(partAudioClips).length,
        });
      } catch {}
    }, 500);
  };
  const closers = [];
  for (const wt of watchTargets) {
    try {
      fs.mkdirSync(wt, { recursive: true });
      const w = fs.watch(wt, (eventType, filename) => {
        if (filename && !filename.startsWith('.')) notifyChange(filename);
      });
      closers.push(() => { try { w.close(); } catch {} });
    } catch {}
  }
  folderWatchers.set(id, closers);
}

app.get('/api/project/:id/render-status', (req, res) => {
  let id;
  try { id = safeId(req.params.id); } catch (e) { return res.status(400).end(); }
  if (!jobs.has(id)) jobs.set(id, { status: 'idle', progress: 0, stage: 'Idle', logs: [], outputs: [], listeners: new Set() });
  const job = jobs.get(id);
  if (req.query?.format === 'json' || req.headers?.accept?.includes('application/json')) {
    return res.json(jobSnapshot(job));
  }
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders();
  ensureProjectWatcher(id);
  res.write(`event: state\ndata: ${JSON.stringify(jobSnapshot(job))}\n\n`);
  for (const l of job.logs.slice(-200)) res.write(`event: log\ndata: ${JSON.stringify(l)}\n\n`);
  job.listeners.add(res);
  const ping = setInterval(() => res.write(': ping\n\n'), 20000);
  req.on('close', () => { clearInterval(ping); job.listeners.delete(res); });
});


/* --------------------------------------------------------- Multi-Purpose Studio Pro Endpoints */

/** Get full studio catalog (10 Video Categories, 33 AI Studio Voices, VFX, Audio FX, 5-Layer SFX) */
app.get('/api/studio-catalog', (req, res) => {
  res.json({
    stylePresets: STYLE_PRESETS,
    aistudioVoices: AISTUDIO_VOICES,
    motions: MOTIONS,
    vfxEffects: VFX_EFFECTS,
    audioEffects: AUDIO_EFFECTS,
    sfxLibrary: SFX_LIBRARY,
  });
});

/** List & Read System Instructions (`SYSTEM_PROMPT.md` + `instructions/*.md`) */
app.get('/api/instructions', wrap(async (req, res) => {
  const instDir = path.join(ROOT, 'instructions');
  const files = [];
  if (exists(path.join(ROOT, 'SYSTEM_PROMPT.md'))) {
    files.push({ name: 'SYSTEM_PROMPT.md', path: 'SYSTEM_PROMPT.md', size: fs.statSync(path.join(ROOT, 'SYSTEM_PROMPT.md')).size });
  }
  if (exists(path.join(ROOT, 'AUTONOMOUS_WORKFLOW_SOP.md'))) {
    files.push({ name: 'AUTONOMOUS_WORKFLOW_SOP.md', path: 'AUTONOMOUS_WORKFLOW_SOP.md', size: fs.statSync(path.join(ROOT, 'AUTONOMOUS_WORKFLOW_SOP.md')).size });
  }
  if (exists(instDir)) {
    for (const f of (await fsp.readdir(instDir)).sort()) {
      if (f.endsWith('.md')) {
        files.push({ name: f, path: `instructions/${f}`, size: fs.statSync(path.join(instDir, f)).size });
      }
    }
  }
  const activeName = req.query.file || 'SYSTEM_PROMPT.md';
  const safeRel = activeName.startsWith('instructions/')
    ? path.join(ROOT, 'instructions', path.basename(activeName))
    : path.join(ROOT, path.basename(activeName));
  const content = exists(safeRel) ? await fsp.readFile(safeRel, 'utf8') : '';
  res.json({ files, activeFile: activeName, content });
}));

/** Save edited System Instruction file */
app.put('/api/instructions', wrap(async (req, res) => {
  const { file, content } = req.body || {};
  if (!file || typeof content !== 'string') throw httpErr(400, 'file and content required');
  const safeRel = file.startsWith('instructions/')
    ? path.join(ROOT, 'instructions', path.basename(file))
    : path.join(ROOT, path.basename(file));
  if (!safeRel.endsWith('.md')) throw httpErr(400, 'Only .md instruction files allowed');
  await fsp.writeFile(safeRel, content, 'utf8');
  res.json({ ok: true, file });
}));

/** Synthesize 5-Layer SFX Cue to `projects/:id/audio/sfx/<cue>.wav` using FFmpeg lavfi */
app.post('/api/project/:id/synthesize-sfx', wrap(async (req, res) => {
  const id = safeId(req.params.id);
  const dir = pdir(id);
  const sfxDir = path.join(dir, 'audio', 'sfx');
  await fsp.mkdir(sfxDir, { recursive: true });
  const cueId = String(req.body?.cue || 'paper_unfold_crisp').replace(/[^\w-]/g, '_');
  const cueDef = SFX_LIBRARY.find((x) => x.id === cueId) || SFX_LIBRARY[0];
  const outWav = path.join(sfxDir, `${cueId}.wav`);
  try {
    execFileSync(FFMPEG, ['-hide_banner', '-y', '-f', 'lavfi', '-i', cueDef.synth, '-ar', '48000', '-ac', '2', outWav], { stdio: 'pipe', timeout: 10000 });
  } catch (e) {
    throw httpErr(500, `SFX synthesis failed: ${e.message}`);
  }
  res.json({ ok: true, cue: cueId, file: `audio/sfx/${cueId}.wav`, url: rel(id, outWav) });
}));

/** Export AI Studio TTS Screenplay + Flow Image & Video Prompt Pack from current project state */
app.post('/api/project/:id/export-prompts', wrap(async (req, res) => {
  const id = safeId(req.params.id);
  const dir = pdir(id);
  const project = await readProject(id);
  recomputeTimeline(project);
  const preset = STYLE_PRESETS[project.style_preset] || STYLE_PRESETS.PRESET_STICKY_MEME;
  const charMap = new Map((project.characters || []).map((c) => [c.id, c]));

  // 1. AISTUDIO_TTS_SCREENPLAY.txt
  const ttsLines = [
    `# GOOGLE AI STUDIO SPEECH (gemini-3.8-flash-tts) — MULTI-SPEAKER & CHARACTER MAPPING`,
    `# Project: ${project.metadata?.title_en || id} (${project.style_preset})`,
    `# Generated: ${new Date().toISOString()}`,
    `# Punctuation Rule: Clean sentences for natural TTS pacing; use inline tags (<gasp>, <sigh>, <laugh>, <short pause>).`,
    ``
  ];
  for (const sc of project.scenes) {
    const ch = charMap.get(sc.dialogue_speaker) || { aistudio_voice: sc.aistudio_voice || preset.default_voice, style_prompt: sc.style_prompt || preset.default_style_prompt };
    const voice = sc.aistudio_voice || ch.aistudio_voice || 'Charon';
    const style = sc.style_prompt || ch.style_prompt || preset.default_style_prompt;
    ttsLines.push(`=== PART #${pad4(sc.scene_id)} | SPEAKER: ${sc.dialogue_speaker || 'NARRATOR'} | VOICE: ${voice} | STYLE: "${style}" | TARGET DUR: ${sc.duration}s ===`);
    ttsLines.push(`[BN] ${sc.narration?.bn || ''}`);
    ttsLines.push(`[EN] ${sc.narration?.en || ''}`);
    ttsLines.push(`[HI] ${sc.narration?.hi || ''}`);
    ttsLines.push(``);
  }
  const ttsFile = path.join(dir, 'AISTUDIO_TTS_SCREENPLAY.txt');
  await fsp.writeFile(ttsFile, ttsLines.join('\n'), 'utf8');

  // 2. FLOW_BATCH_PROMPTS.txt (Style-locked + Negative prompt)
  const imgLines = [
    `# STYLE-LOCKED IMAGE GENERATION BATCH PROMPTS (Nano Banana 2.1 / Google Flow / Lovart Agent)`,
    `# Category: ${preset.name} | Thinking Level: HIGH | Aspect Ratio: 16:9 (1376x768 / 4K)`,
    `# STYLE LOCK: ${preset.style_lock_positive}`,
    `# NEGATIVE LOCK: ${preset.style_lock_negative}`,
    ``
  ];
  for (const sc of project.scenes) {
    const ch = charMap.get(sc.dialogue_speaker);
    const dnaHint = ch && ch.visual_dna ? ` [Character DNA: ${ch.visual_dna}]` : '';
    const noorHint = ch && ch.noor_veil ? ' faceless figure veiled in radiant divine light, face completely hidden by glowing noor, no facial features.' : '';
    const cleanPrompt = String(sc.visual_prompt || '')
      .replace(/^(Simple\s+Itihash\s+)?(Scene|Shot|Part|Section)\s*\d+[:\-.]*\s*/i, '')
      .replace(/--no\s+.*$/i, '')
      .trim();
    imgLines.push(`B${pad4(sc.scene_id)}: ${preset.style_lock_positive} ${cleanPrompt}${dnaHint}${noorHint} ${preset.style_lock_negative}`);
    imgLines.push(``);
  }
  const imgFile = path.join(dir, 'FLOW_BATCH_PROMPTS.txt');
  await fsp.writeFile(imgFile, imgLines.join('\n'), 'utf8');

  // 3. FLOW_VEO_VIDEO_PROMPT.txt
  const vidLines = [
    `# DYNAMIC AI VIDEO & UNIVERSAL MOTION PROMPTS (Google AI Studio Omni 1.1 Flash / Veo 3.1 / Seedance 2.5)`,
    `# Category: ${preset.name} | Universal Vox Rule: No music baked in clip, SFX only, 24fps`,
    ``
  ];
  for (const sc of project.scenes) {
    if (sc.type === 'DYNAMIC_AI_VIDEO' || sc.motion_effect === 'vox_stop_motion') {
      vidLines.push(`CLIP_${pad4(sc.scene_id)} (${sc.duration}s | Motion: ${sc.motion_effect} | SFX: ${sc.sfx || 'none'}): Animate seamlessly from Start Frame to End Frame in ${preset.name} style. ${sc.visual_prompt || ''} Maintain 100% character consistency. Audio: SFX (${sc.sfx || 'ambient'}) only, NO background music.`);
    }
  }
  const vidFile = path.join(dir, 'FLOW_VEO_VIDEO_PROMPT.txt');
  await fsp.writeFile(vidFile, vidLines.join('\n'), 'utf8');

  // 4. CHARACTER_VOICE_MAP.json & AGENT_TASK_QUEUE.json (Direct Agent Handoff Payload)
  const charMapPayload = {
    project_id: id,
    style_preset: project.style_preset,
    updated_at: new Date().toISOString(),
    characters: project.characters || [],
    scene_voice_assignments: project.scenes.map((s) => ({
      scene_id: s.scene_id,
      dialogue_speaker: s.dialogue_speaker || 'NARRATOR',
      aistudio_voice: s.aistudio_voice || charMap.get(s.dialogue_speaker)?.aistudio_voice || 'Charon',
      style_prompt: s.style_prompt || charMap.get(s.dialogue_speaker)?.style_prompt || preset.default_style_prompt,
      audio_effect: s.audio_effect || 'studio_clean',
      sfx: s.sfx || 'none',
      duration: s.duration,
      narration: s.narration
    }))
  };
  await fsp.writeFile(path.join(dir, 'CHARACTER_VOICE_MAP.json'), JSON.stringify(charMapPayload, null, 2), 'utf8');

  const agentQueuePayload = {
    project_id: id,
    status: 'READY_FOR_AGENT_EXECUTION',
    updated_at: new Date().toISOString(),
    daemon_endpoint: 'http://127.0.0.1:9333',
    cdp_endpoint: 'http://127.0.0.1:9224',
    cli_commands: {
      tts_generation: `node tools/auto_account_and_model_switching_tts.js ${id}`,
      image_batch: `node tools/parallel_batch_image_generator.js ${id}`,
      video_clips: `node tools/generate_all_ai_videos.js ${id}`,
      bgm_lyria: `node tools/generate_aistudio_bgm.js ${id}`,
      master_render: `node tools/dual_render_exporter.js ${id}`
    },
    files_written: [
      `projects/${id}/project.json`,
      `projects/${id}/CHARACTER_VOICE_MAP.json`,
      `projects/${id}/AISTUDIO_TTS_SCREENPLAY.txt`,
      `projects/${id}/FLOW_BATCH_PROMPTS.txt`,
      `projects/${id}/FLOW_VEO_VIDEO_PROMPT.txt`
    ],
    stats: {
      total_scenes: project.scenes.length,
      total_characters: (project.characters || []).length,
      video_clips_count: project.scenes.filter((s) => s.type === 'DYNAMIC_AI_VIDEO').length,
      static_images_count: project.scenes.filter((s) => s.type !== 'DYNAMIC_AI_VIDEO').length,
      total_duration_sec: project.total_duration_seconds
    }
  };
  await fsp.writeFile(path.join(dir, 'AGENT_TASK_QUEUE.json'), JSON.stringify(agentQueuePayload, null, 2), 'utf8');

  res.json({
    ok: true,
    files: [
      'CHARACTER_VOICE_MAP.json',
      'AGENT_TASK_QUEUE.json',
      'AISTUDIO_TTS_SCREENPLAY.txt',
      'FLOW_BATCH_PROMPTS.txt',
      'FLOW_VEO_VIDEO_PROMPT.txt'
    ],
    agentQueue: agentQueuePayload,
    ttsPreview: ttsLines.slice(0, 28).join('\n'),
    imgPreview: imgLines.slice(0, 18).join('\n'),
  });
}));

/** 1-Click Agentic Project & Episode Generator Wizard (`/api/projects/create-wizard`) */
app.post('/api/projects/create-wizard', wrap(async (req, res) => {
  const {
    project_id,
    title_bn,
    title_en,
    title_hi,
    style_preset = 'PRESET_VOX_DOCUMENTARY',
    target_minutes = 5,
    topic_summary = '',
    halal_audio_mode = false,
  } = req.body || {};

  const rawId = (project_id || title_en || 'new_studio_episode')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48) || `episode_${Date.now().toString(36)}`;
  const id = safeId(rawId);
  const dir = pdir(id);
  await fsp.mkdir(path.join(dir, 'parts'), { recursive: true });
  for (const l of ['bn', 'en', 'hi', 'sfx', 'bgm']) await fsp.mkdir(path.join(dir, 'audio', l), { recursive: true });
  await fsp.mkdir(path.join(dir, 'audio', 'sfx'), { recursive: true });
  await fsp.mkdir(path.join(dir, 'visual_assets'), { recursive: true });
  await fsp.mkdir(path.join(dir, 'metadata'), { recursive: true });
  await fsp.mkdir(path.join(dir, 'exports'), { recursive: true });
  await fsp.mkdir(path.join(dir, 'research'), { recursive: true });

  const preset = STYLE_PRESETS[style_preset] || STYLE_PRESETS.PRESET_VOX_DOCUMENTARY;
  const totalSec = Math.max(30, Math.min(1800, Math.round(Number(target_minutes || 5) * 60)));
  const avgClipSec = preset.avg_clip_sec || 6.0;
  const clipCount = Math.max(6, Math.min(120, Math.round(totalSec / avgClipSec)));

  // Build genre-appropriate character roster
  const characters = [
    {
      id: 'TIME_CHRONICLER',
      name_bn: 'সময়ের সাক্ষী',
      name_en: 'The Time Chronicler',
      name_hi: 'समय का साक्षी',
      role_bn: 'হোস্ট ও সূত্রधार',
      role_en: 'Host & Storyteller',
      role_hi: 'सूत्रधार एवं कहानीकार',
      gender: 'Male',
      age_group: 'Elderly',
      icon: '🎙️',
      badge_class: 'speaker-badge-host',
      aistudio_voice: 'Cruz',
      fallback_voice: 'Charon',
      style_prompt: 'An Old Story Teller, Old Man voice',
      default_wpm: 135,
      volume_db: 0,
      audio_effect: 'studio_clean',
      ref_image: 'references/ref_host_sticky_meme.jpg',
      noor_veil: false,
      visual_dna: 'Elderly male scholar, bald crown with fluffy white side hair, full bushy white beard, round wire-rim spectacles, earthy brown scholar robe/tunic.'
    },
    {
      id: 'NARRATOR',
      name_bn: 'মূল বিশ্লেষক',
      name_en: 'Lead Explainer',
      name_hi: 'मुख्य विश्लेषक',
      role_bn: preset.bn_name,
      role_en: preset.name,
      role_hi: preset.name,
      gender: 'Male',
      age_group: 'Adult',
      icon: '📜',
      badge_class: 'speaker-badge-narrator',
      aistudio_voice: preset.default_voice,
      fallback_voice: 'Charon',
      style_prompt: preset.default_style_prompt,
      default_wpm: preset.wpm,
      volume_db: 0,
      audio_effect: preset.default_audio_fx,
      ref_image: '',
      noor_veil: false,
      visual_dna: `Authoritative narrator for ${preset.name}.`
    }
  ];

  if (style_preset === 'PRESET_CARTOON_DRAMA' || style_preset === 'PRESET_REALISTIC_DRAMA') {
    characters.push(
      {
        id: 'PROTAGONIST_A',
        name_bn: 'রাকিব (প্রধান চরিত্র)',
        name_en: 'Rakib (Protagonist)',
        name_hi: 'रकीब (मुख्य पात्र)',
        role_bn: 'হিসেবী ও দূরদর্শী বন্ধু',
        role_en: 'Disciplined Protagonist',
        role_hi: 'अनुशासित मित्र',
        gender: 'Male',
        age_group: 'Young Adult',
        icon: '👨‍💼',
        badge_class: 'speaker-badge-hunter',
        aistudio_voice: 'Iapetus',
        fallback_voice: 'Schedar',
        style_prompt: 'warm, grounded, humble and sincere young man',
        default_wpm: 138,
        volume_db: 0,
        audio_effect: 'studio_clean',
        ref_image: '',
        noor_veil: false,
        visual_dna: 'South Asian young man, neat black hair, modest light-blue collared office shirt, calm composed smile, carrying a leather budget notebook.'
      },
      {
        id: 'PROTAGONIST_B',
        name_bn: 'সোহেল (দ্বিতীয় চরিত্র)',
        name_en: 'Sohel (Foil Character)',
        name_hi: 'सोहेल (दूसरा पात्र)',
        role_bn: 'বিলাসী ও আবেগপ্রবণ বন্ধু',
        role_en: 'Impulsive Friend',
        role_hi: 'खर्चीला मित्र',
        gender: 'Male',
        age_group: 'Young Adult',
        icon: '🕶️',
        badge_class: 'speaker-badge-warlord',
        aistudio_voice: 'Achird',
        fallback_voice: 'Puck',
        style_prompt: 'friendly, expressive, slightly impulsive conversational tone',
        default_wpm: 145,
        volume_db: 0,
        audio_effect: 'studio_clean',
        ref_image: '',
        noor_veil: false,
        visual_dna: 'South Asian young man, trendy styled hair, flashy maroon jacket over designer tee, holding latest flagship smartphone, expressive gestures.'
      }
    );
  }

  const tBn = title_bn || `${preset.bn_name} — ${topic_summary || id}`;
  const tEn = title_en || `${preset.name.replace(/^[^\s]+\s*/, '')}: ${topic_summary || id}`;
  const tHi = title_hi || `${tEn} (Hindi Edition)`;

  const sfxPool = SFX_LIBRARY.map((x) => x.id);
  const scenes = [];
  for (let i = 1; i <= clipCount; i++) {
    const isHookOrOutro = i === 1 || i === clipCount;
    const isDynamic = isHookOrOutro || (i % Math.max(2, Math.round(1 / (preset.video_ratio || 0.2))) === 0);
    const spk = i === 1 || i === clipCount
      ? 'TIME_CHRONICLER'
      : ((style_preset === 'PRESET_CARTOON_DRAMA' || style_preset === 'PRESET_REALISTIC_DRAMA') && i % 3 === 0
          ? (i % 6 === 0 ? 'PROTAGONIST_B' : 'PROTAGONIST_A')
          : 'NARRATOR');
    const ch = characters.find((c) => c.id === spk) || characters[1];
    const phaseLabel = i === 1
      ? 'Opening Cold Hook'
      : (i === clipCount ? 'Closing Verdict & Reflection' : (i <= Math.ceil(clipCount * 0.3) ? 'Context & Setup' : (i <= Math.ceil(clipCount * 0.75) ? 'Deep Evidence & Core Mechanism' : 'Climax & Turning Point')));

    scenes.push({
      scene_id: i,
      parent_beat: Math.ceil(i / 4),
      sub_id: ((i - 1) % 4) + 1,
      type: isDynamic ? 'DYNAMIC_AI_VIDEO' : 'STATIC_IMAGE',
      dialogue_speaker: spk,
      aistudio_voice: ch.aistudio_voice,
      style_prompt: ch.style_prompt,
      narration: {
        bn: `${phaseLabel} (ক্লিপ #${i}): ${tBn} — এই অংশে মূল তথ্য ও দৃশ্যমান প্রমাণ তুলে ধরা হয়েছে।`,
        en: `${phaseLabel} (Clip #${i}): ${tEn} — presenting the visual evidence and narrative beat clearly.`,
        hi: `${phaseLabel} (क्लिप #${i}): ${tHi} — यहाँ मुख्य प्रमाण और कहानी का अगला मोड़ दिखाया गया है।`
      },
      visual_prompt: `${preset.style_lock_positive} Scene ${i} (${phaseLabel}): Central visual depiction of ${topic_summary || tEn}, ${ch.visual_dna} ${preset.style_lock_negative}`,
      asset_file: isDynamic ? `visual_assets/clip_scene_${pad4(i)}.mp4` : `visual_assets/scene_${pad4(i)}.jpg`,
      sfx: sfxPool[(i - 1) % sfxPool.length],
      motion_effect: isDynamic ? 'ai_video' : preset.default_motion,
      vfx_effect: preset.default_vfx,
      audio_effect: ch.audio_effect || preset.default_audio_fx,
      duration: avgClipSec,
      language_durations: { bn: avgClipSec, en: +(avgClipSec * 0.94).toFixed(2), hi: +(avgClipSec * 0.98).toFixed(2) }
    });
  }

  const project = {
    project_id: id,
    brand: 'Simple Studio Pro Network',
    style_preset,
    halal_audio_mode: Boolean(halal_audio_mode),
    target_duration_seconds: +(clipCount * avgClipSec).toFixed(2),
    total_duration_seconds: +(clipCount * avgClipSec).toFixed(2),
    metadata: { title_bn: tBn, title_en: tEn, title_hi: tHi, topic_summary },
    characters,
    scenes,
  };

  await writeProject(id, project);
  res.json({ ok: true, id, project });
}));

/** Shorts Studio Builder: Suggest or Parse Scene Ranges for N Shorts Parts */
app.post('/api/project/:id/shorts/suggest', wrap(async (req, res) => {
  const id = safeId(req.params.id);
  const project = await readProject(id);
  recomputeTimeline(project);
  const lang = req.body?.lang || 'bn';
  const numParts = Math.max(1, Math.min((project.scenes || []).length || 10, parseInt(req.body?.numParts || 10, 10)));
  const prompt = String(req.body?.prompt || '').trim();
  const customParts = Array.isArray(req.body?.customParts) ? req.body.customParts : null;
  const parts = suggestShortsParts(project, lang, numParts, prompt, customParts);
  res.json({ ok: true, total_parts: parts.length, parts });
}));

/** Shorts Studio Builder: Save Shorts Preset & Branding Configuration to project.json */
app.post('/api/project/:id/shorts/save', wrap(async (req, res) => {
  const id = safeId(req.params.id);
  const project = await readProject(id);
  const cfg = req.body?.shorts_config || {};
  project.shorts_config = {
    ...(project.shorts_config || {}),
    ...cfg,
    updated_at: new Date().toISOString()
  };
  if (req.body?.branding) {
    project.branding = { ...(project.branding || {}), ...req.body.branding };
  }
  if (req.body?.ticker_config) {
    project.ticker_config = { ...(project.ticker_config || {}), ...req.body.ticker_config };
  }
  const saved = await writeProject(id, project);
  res.json({ ok: true, project: saved, shorts_config: saved.shorts_config });
}));

/** Generate Project-Based Master & Shorts Thumbnails in `projects/:id/thumbnails/` */
app.post('/api/project/:id/thumbnails/generate', wrap(async (req, res) => {
  const id = safeId(req.params.id);
  const dir = pdir(id);
  const project = await readProject(id);
  recomputeTimeline(project);
  const langs = req.body?.langs || ['bn', 'en', 'hi'];
  const thumbsMasterDir = path.join(dir, 'thumbnails', 'master');
  const thumbsShortsDir = path.join(dir, 'thumbnails', 'shorts');
  await fsp.mkdir(thumbsMasterDir, { recursive: true });
  await fsp.mkdir(thumbsShortsDir, { recursive: true });

  const logoRel = project.branding?.logo_file || 'references/mascot_logo_ref.jpg';
  const logoAbs = exists(path.join(dir, logoRel)) ? path.join(dir, logoRel) : path.join(ROOT, logoRel.replace(/^\//, ''));
  const firstAsset = resolveSceneAsset(dir, project.scenes?.[0]).abs || path.join(ROOT, 'references', 'ref_style_2_simple_history.jpg');

  const generated = { master: [], shorts: [] };
  const parts = project.shorts_config?.parts || suggestShortsParts(project, 'bn', project.shorts_config?.total_parts || 5);
  const bnDigits = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  const hiDigits = (n) => String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[d]);

  for (const lang of langs) {
    const chName = project.branding?.[`channel_name_${lang}`] || LANGS[lang] || 'Simple History Teller';
    const masterTitle = project.metadata?.[`title_${lang}`] || project.metadata?.title_bn || id;
    const masterOut = path.join(thumbsMasterDir, `master_thumbnail_${lang}.png`);
    const okM = await runPlateScript({
      mode: 'thumbnail',
      is_short: false,
      out_path: masterOut,
      lang,
      bg_path: firstAsset,
      logo_path: logoAbs,
      channel_name: chName,
      badge_text: lang === 'bn' ? 'পূর্ণাঙ্গ ডকুমেন্টারি' : (lang === 'hi' ? 'पूरी डॉक्यूमेंट्री' : 'FULL DOCUMENTARY'),
      title_text: masterTitle
    });
    if (okM) {
      generated.master.push({ lang, file: `thumbnails/master/master_thumbnail_${lang}.png`, url: rel(id, masterOut) });
    }

    for (const p of parts) {
      const pNum = p.partNum || 1;
      const padP = String(pNum).padStart(2, '0');
      const shortOut = path.join(thumbsShortsDir, `short_part_${padP}_${lang}.png`);
      const midSc = (project.scenes || []).find((s) => Number(s.scene_id) === Number(p.cover_scene_id || p.sceneStart || 1)) || project.scenes?.[0];
      const bgAbs = resolveSceneAsset(dir, midSc).abs || firstAsset;
      const badgeLbl = lang === 'bn'
        ? `পর্ব ${bnDigits(pNum)} / ${bnDigits(parts.length)}`
        : (lang === 'hi' ? `भाग ${hiDigits(pNum)} / ${hiDigits(parts.length)}` : `PART ${pNum} / ${parts.length}`);
      const sTitle = p[`title_${lang}`] || p.title_bn || masterTitle;
      const okS = await runPlateScript({
        mode: 'thumbnail',
        is_short: true,
        out_path: shortOut,
        lang,
        bg_path: bgAbs,
        logo_path: logoAbs,
        channel_name: chName,
        badge_text: badgeLbl,
        title_text: sTitle
      });
      if (okS) {
        generated.shorts.push({ lang, part: pNum, file: `thumbnails/shorts/short_part_${padP}_${lang}.png`, url: rel(id, shortOut) });
      }
    }
  }
  await closePlateRenderer().catch(() => {});
  res.json({ ok: true, generated });
}));

app.use((err, req, res, next) => res.status(Number.isInteger(err.status) ? err.status : Number.isInteger(err.code) ? err.code : 400).json({ error: err.message }));

app.listen(PORT, () => {
  const hw = getHwEncoder();
  console.log(`\n  Simple Studio (সিম্পল স্টুডিও) — Multi-Track Video & AI Editor`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  ffmpeg: ${FFMPEG}`);
  console.log(`  encoder: ${hw.name} (GPU: ${hw.isGpu})\n`);
});
