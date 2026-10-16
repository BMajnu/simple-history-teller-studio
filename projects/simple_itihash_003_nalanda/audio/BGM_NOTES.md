# BGM Notes — simple_itihash_003_nalanda (Nalanda)
Era: Classical India (Gupta, 427 CE) + Buddhist scholarly serenity + invasion tragedy
Total runtime: 1031.3s (bn) / ~17:11 — Lyria prompt covers 0:00–17:15 with padding
Status: bgm.mp3 NOT generated — render fallback-এ skip হবে

## Pathway B — Gemini Music FX / Gemini App (fallback)
- Mode: Instrumental, Custom length, Flash Extended / Cinematic preset
- Prompt: `serene classical Indian documentary BGM, tanpura drone, bansuri flute, tabla, no synth, no vocals, scholarly calm turning tragic`
- দরকার হলে 2 অংশে বানিয়ে জোড়া দাও (0–9 min calm / 9–17:15 tragic-resolve)

## Pathway D — Royalty-free archive (fallback)
- YouTube Audio Library (Creator Studio, No attribution required) — সার্চ টার্ম:
  1. `Ambient Cinematic World India meditation`
  2. `Classical Indian drone bansuri tabla calm`
  3. `Dark cinematic tragedy strings invasion`
- FMA কীওয়ার্ড: `classical india meditation`, `indian drone raga`, `cinematic tragedy`
- Incompetech কীওয়ার্ড: `world india`, `meditative ambient`, `dark cinematic`
- Freesound.org: `tanpura drone`, `temple bell india`, `library fire crackle loop`

## Pathway C — Procedural (tools/curate_project_bgm.js, offline fallback)
- islamic_golden_age নয় — classical_india ব্যবহার করো:
  - `freq1: 174.61` (F3), `freq2: 261.63` (C4)
  - `filter: lowpass=f=500`
  - `ambience: anoisesrc=c=brown:r=48000:a=0.05`
- কমান্ড ধারণা: `generateEraSoundtrack('classical_india', 'audio/bgm.mp3', 1031)`

## Loudness & specs
- Raw: -18 dB RMS normalize (dialog-এর নিচে থাকবে)
- Render (Module 6 FFmpeg): sidechain duck — কথা বললে -20 dBFS, pause-এ -6 dBFS restore
- Spec: 48000 Hz stereo, 192kbps MP3, `audio/bgm.mp3`
- Duration/loop: 1031s কভার করতে হবে — কম পড়লে seamless loop/pad করো, loop marker-এ click থাকবে না
