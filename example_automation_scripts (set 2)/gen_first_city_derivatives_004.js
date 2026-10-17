// Derivative prompt packs for simple_itihash_004_first_city.
// Mirrors server.js prompt-pack logic (TTS screenplay, image batch, veo clips,
// character voice map, agent task queue) as a standalone script.
const fs = require('fs');
const path = require('path');

const ID = 'simple_itihash_004_first_city';
const DIR = path.join(__dirname, '..', 'projects', ID);
const project = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const pad4 = (n) => String(n).padStart(4, '0');

const PRESET = {
  name: '2D Cutout Empires & Battles (Simple History)',
  default_voice: 'Charon',
  default_style_prompt: 'informative, authoritative military & civilization historian',
  style_lock_positive: 'Stylized 2D flat vector historical illustration in Simple History cutout aesthetic. Clean geometric blocky human proportions, historically accurate period armor and attire, subtle cream papercraft sticker border on aged parchment texture (#F4ECD8), 16:9 widescreen, 4K.',
  style_lock_negative: '--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, photorealistic, stickman'
};
const charMap = new Map((project.characters || []).map((c) => [c.id, c]));

// 1. AISTUDIO_TTS_SCREENPLAY.txt
const ttsLines = [
  '# GOOGLE AI STUDIO SPEECH (gemini-3.8-flash-tts) — MULTI-SPEAKER & CHARACTER MAPPING',
  `# Project: ${project.metadata.title_en} (${project.style_preset})`,
  `# Generated: ${new Date().toISOString()}`,
  '# Punctuation Rule: Clean sentences for natural TTS pacing; use inline tags (<gasp>, <sigh>, <laugh>, <short pause>).',
  ''
];
for (const sc of project.scenes) {
  const ch = charMap.get(sc.dialogue_speaker) || {};
  const voice = sc.aistudio_voice || ch.aistudio_voice || 'Charon';
  const style = sc.style_prompt || ch.style_prompt || PRESET.default_style_prompt;
  ttsLines.push(`=== PART #${pad4(sc.scene_id)} | SPEAKER: ${sc.dialogue_speaker || 'NARRATOR'} | VOICE: ${voice} | STYLE: "${style}" | TARGET DUR: ${sc.duration}s ===`);
  ttsLines.push(`[BN] ${sc.narration.bn}`);
  ttsLines.push(`[EN] ${sc.narration.en}`);
  ttsLines.push(`[HI] ${sc.narration.hi}`);
  ttsLines.push('');
}
fs.writeFileSync(path.join(DIR, 'AISTUDIO_TTS_SCREENPLAY.txt'), ttsLines.join('\n'), 'utf8');

// 2. FLOW_BATCH_PROMPTS.txt (static images only)
const imgLines = [
  '# STYLE-LOCKED IMAGE GENERATION BATCH PROMPTS (Nano Banana 2.1 / Google Flow / Lovart Agent)',
  `# Category: ${PRESET.name} | Thinking Level: HIGH | Aspect Ratio: 16:9 (1376x768 / 4K)`,
  `# STYLE LOCK: ${PRESET.style_lock_positive}`,
  `# NEGATIVE LOCK: ${PRESET.style_lock_negative}`,
  ''
];
for (const sc of project.scenes) {
  if (sc.type !== 'STATIC_IMAGE') continue;
  const ch = charMap.get(sc.dialogue_speaker);
  const dnaHint = ch && ch.visual_dna ? ` [Character DNA: ${ch.visual_dna}]` : '';
  const cleanPrompt = String(sc.visual_prompt || '').replace(/--no\s+.*$/i, '').trim();
  imgLines.push(`SHOT_${pad4(sc.scene_id)} (${sc.duration}s | ${sc.asset_file}): ${PRESET.style_lock_positive} ${cleanPrompt}${dnaHint} ${PRESET.style_lock_negative}`);
  imgLines.push('');
}
fs.writeFileSync(path.join(DIR, 'FLOW_BATCH_PROMPTS.txt'), imgLines.join('\n'), 'utf8');

// 3. FLOW_VEO_VIDEO_PROMPT.txt (dynamic clips only)
const vidLines = [
  '# DYNAMIC AI VIDEO & UNIVERSAL MOTION PROMPTS (Google AI Studio Omni 1.1 Flash / Veo 3.1 / Seedance 2.5)',
  `# Category: ${PRESET.name} | Universal Vox Rule: No music baked in clip, SFX only, 24fps`,
  ''
];
for (const sc of project.scenes) {
  if (sc.type !== 'DYNAMIC_AI_VIDEO') continue;
  vidLines.push(`CLIP_${pad4(sc.scene_id)} (${sc.duration}s | Motion: ${sc.motion_effect} | SFX: ${sc.sfx || 'none'}): Animate seamlessly from Start Frame to End Frame in ${PRESET.name} style. ${sc.visual_prompt || ''} Maintain 100% character consistency. Audio: SFX (${sc.sfx || 'ambient'}) only, NO background music.`);
}
fs.writeFileSync(path.join(DIR, 'FLOW_VEO_VIDEO_PROMPT.txt'), vidLines.join('\n'), 'utf8');

// 4. CHARACTER_VOICE_MAP.json
const charMapPayload = {
  project_id: ID,
  style_preset: project.style_preset,
  updated_at: new Date().toISOString(),
  characters: project.characters || [],
  scene_voice_assignments: project.scenes.map((s) => ({
    scene_id: s.scene_id,
    dialogue_speaker: s.dialogue_speaker || 'NARRATOR',
    aistudio_voice: s.aistudio_voice || (charMap.get(s.dialogue_speaker) || {}).aistudio_voice || 'Charon',
    style_prompt: s.style_prompt || (charMap.get(s.dialogue_speaker) || {}).style_prompt || PRESET.default_style_prompt,
    audio_effect: s.audio_effect || 'studio_clean',
    sfx: s.sfx || 'none',
    duration: s.duration,
    narration: s.narration
  }))
};
fs.writeFileSync(path.join(DIR, 'CHARACTER_VOICE_MAP.json'), JSON.stringify(charMapPayload, null, 2), 'utf8');

// 5. AGENT_TASK_QUEUE.json
const agentQueuePayload = {
  project_id: ID,
  status: 'READY_FOR_AGENT_EXECUTION',
  updated_at: new Date().toISOString(),
  daemon_endpoint: 'http://127.0.0.1:9333',
  cdp_endpoint: 'http://127.0.0.1:9224',
  cli_commands: {
    tts_generation: `node tools/auto_account_and_model_switching_tts.js ${ID}`,
    image_batch: `node tools/parallel_batch_image_generator.js ${ID}`,
    video_clips: `node tools/generate_all_ai_videos.js ${ID}`,
    bgm_lyria: `node tools/generate_aistudio_bgm.js ${ID}`,
    master_render: `node tools/dual_render_exporter.js ${ID}`
  },
  files_written: [
    `projects/${ID}/project.json`,
    `projects/${ID}/CHARACTER_VOICE_MAP.json`,
    `projects/${ID}/AISTUDIO_TTS_SCREENPLAY.txt`,
    `projects/${ID}/FLOW_BATCH_PROMPTS.txt`,
    `projects/${ID}/FLOW_VEO_VIDEO_PROMPT.txt`
  ],
  stats: {
    total_scenes: project.scenes.length,
    total_characters: (project.characters || []).length,
    video_clips_count: project.scenes.filter((s) => s.type === 'DYNAMIC_AI_VIDEO').length,
    static_images_count: project.scenes.filter((s) => s.type !== 'DYNAMIC_AI_VIDEO').length,
    total_duration_sec: project.total_duration_seconds
  }
};
fs.writeFileSync(path.join(DIR, 'AGENT_TASK_QUEUE.json'), JSON.stringify(agentQueuePayload, null, 2), 'utf8');

console.log(JSON.stringify({ ok: true, stats: agentQueuePayload.stats, files: agentQueuePayload.files_written }, null, 2));
