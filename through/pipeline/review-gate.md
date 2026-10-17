# Review gate (exact contract from FlowKit `fk-review-video`)

Run `/fk-review-video` (light) after video generation, before upscale.
Scenes scoring < 7.5 get `video_prompt` updated from review errors, then regen video.
Max 2 review-regen cycles.

## Score dimensions + weights

| Dimension | Weight |
|---|---|
| character_consistency | 0.25 |
| prompt_adherence | 0.20 |
| motion_quality | 0.20 |
| visual_fidelity | 0.15 |
| temporal_coherence | 0.10 |
| composition | 0.10 |

`overall = round(sum)`. Any CRITICAL error caps `character_consistency ≤ 3.0` and `overall ≤ 5.9`.

## Verdicts

| Score | Verdict | Action |
|---|---|---|
| 9–10 | excellent | ship |
| 7.5–8.9 | good | ship |
| 6–7.4 | acceptable | cut usable_segments |
| 4–5.9 | poor | regen image → video |
| 0–3.9 | unusable | rewrite prompts + regen |

## Healing loop (< 7.5, append to `video_prompt` then REGENERATE_VIDEO)

- Camera Drift → `locked-off static camera, subtle smooth tracking`
- Character Drift → `strictly preserves identical facial bone structure and eye color from reference`
- Morph → `natural realistic anatomy, five distinct fingers, rigid solid weapon hilt`
- Reverse/Jerk → `continuous linear motion, fluid steady trajectory without backward hitch`

## Modes

- light: 4fps → 32 frames per 8s (fast scan, ~$0.01–0.03/scene)
- deep: 8fps → 64 frames (catches subtle motion, pre-export)

Full skill: `skills/flowkit/fk-review-video.md`.
