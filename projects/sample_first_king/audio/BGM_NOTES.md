# BGM & Soundtrack Notes — sample_first_king (Episode 1)

**Topic:** মানুষ কীভাবে প্রথম রাজা বানাল? (How Humans Made the First King)  
**Era:** Prehistory (Hunter-Gatherers) → Ancient Mesopotamia (Sumer / Eridu / Akkad / Babylon)  
**Total Runtime:** 961.0s (16:01) — 80 Scenes  
**Target Channels:** Simple History Teller Bangla (BN) | Simple History Teller (EN) | Simple History Teller Hindi (HI)  

---

## 1. Musical Architecture & Scene Mapping

| Segment | Timestamp | Narrative Acts & Scenes | Musical Mood & Instrumentation |
| :--- | :--- | :--- | :--- |
| **Intro** | `0:00 - 3:00` (180s) | **Act 1 (Scenes 1–14):** 300,000 years of egalitarian hunter-gatherers, Kalahari desert fires, fierce equality, sharing meat, no masters or kings. | Primal Earth drone (A2 / 110Hz, E3 / 164.8Hz), hollow log drums, low bamboo reed flute, crackling campfire ambience, curious ancient contemplative tone. |
| **Build** | `3:00 - 7:30` (270s) | **Act 2 & 3 (Scenes 15–38):** Agriculture 10,000 BC, granaries, grain surplus, jealousy, border defense, rise of temporary war chiefs (*Lugal* / Big Man) in Sumer (Eridu, Uruk). | Rhythmic acoustic frame drums (82 BPM), Mesopotamian *Ney* flute motif, ancient sistrum rattles, mystical desert reverb, rising tension of tribal conflict and democratic council. |
| **Climax** | `7:30 - 12:30` (300s) | **Act 4 & 5 (Scenes 39–62):** Divine kingship of Inanna/Enlil, Sargon of Akkad's 5,400 standing bronze army, conquest of Sumer, birth of the world's first empire. | Deep war drums (darbuka, heavy floor toms), low resonant bronze war horns, *Oud* arpeggios, driving imperial cadence, majestic royal brass swells, dramatic historical revelation. |
| **Outro** | `12:30 - 16:01` (211s) | **Act 6, 7 & 8 (Scenes 63–80):** Ur royal cemetery, monumental propaganda, law codes of Ur-Nammu/Hammurabi, civilization paradox, Time Chronicler conclusion. | Somber cello and ney dialogue, decaying echoes over desert sands, resolving acoustic harmonies, peaceful reverent philosophical fade, closing chronicle snap. |

---

## 2. Technical Audio Standards (Instruction 07 Compliance)

- **Audio Specs:** 48,000 Hz, 32-bit float / 16-bit PCM source, 2 Channels (Stereo), 192kbps MP3.
- **Duration:** Exactly 961.0s (covers the complete 80-scene timeline seamlessly).
- **Master Calibration:** Normalized to **-18 dB RMS** (`loudnorm=I=-18:TP=-1.5:LRA=9`).
- **Compositing Sidechain Ducking (Module 6 FFmpeg):**
  - Narration speech active: ducked smoothly to **-20 dBFS**.
  - Narrative pauses / dramatic scene breaks: smoothly restored to **-6 dBFS**.

---

## 3. Sourcing Pathways

### Pathway A: Google AI Studio Music (Lyria 3.5) — Primary Engine
- URL: `https://aistudio.google.com/app/new_music?model=lyria-3.5`
- Copy-paste prompt ready in [`BGM_LYRIA_PROMPT.txt`](./BGM_LYRIA_PROMPT.txt).

### Pathway B: Gemini Music FX / Gemini App Music (Alternative)
- Prompt: `cinematic documentary background music, ancient mesopotamia and prehistoric stone age, primal frame drums, ney flute, oud, acoustic drone, no modern synth, no vocals, building from peaceful campfire to dramatic bronze war march and fading reverently`

### Pathway C: Procedural Historical Ambient Synthesizer (Local Engine)
- Script: `tools/curate_project_bgm.js`
- Generates a bespoke 5-layer acoustic procedural score:
  - Layer 1: Primal fundamental drone (A2 / 110.00 Hz)
  - Layer 2: Desert modal fifth & fourth resonance (E3 / 164.81 Hz + D3 / 146.83 Hz)
  - Layer 3: Acoustic frame drum ceremonial heartbeat pulse (1.2 Hz / 72 BPM)
  - Layer 4: Warm desert wind environmental bed (`anoisesrc=color=brown` filtered 40Hz–320Hz)
  - Layer 5: Acoustic hall reverb space (`aecho`) + stereo widener + EBU R128 loudnorm (-18 dBFS)

### Pathway D: Royalty-Free Historical Archives (CC0)
- YouTube Audio Library filters: *Cinematic / Ambient / World*
- Freesound.org search terms: `mesopotamian drone`, `primal frame drum 80bpm`, `desert wind field recording`
