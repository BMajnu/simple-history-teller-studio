const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, '..', 'projects', 'simple_itihash_004_bronze_age_collapse', 'project.json');
const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

// Detailed scene-by-scene cinematic effect blueprint
const blueprint = {
  // === ACT 1: The Golden Age of Bronze (Scenes 1–22) ===
  1:  { motion: 'ai_video', vfx: 'candlelight_flicker', afx: 'warm_tube_narrator', sfx: 'portal_mystic_whoosh' },
  2:  { motion: 'map_zoom_highlight', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  3:  { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'sub_bass_boom_hit' },
  4:  { motion: 'parallax_25d', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'royal_decree_fanfare' },
  5:  { motion: 'pan_right', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'royal_decree_fanfare' },
  6:  { motion: 'ai_video', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'whoosh_fast_cut' },
  7:  { motion: 'pan_left', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'whoosh_fast_cut' },
  8:  { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  9:  { motion: 'ai_video', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'war_horn_distant' },
  10: { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'royal_decree_fanfare' },
  11: { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'noor_ethereal_shimmer' },
  12: { motion: 'zoom_in', vfx: 'torchlight_dungeon', afx: 'studio_clean', sfx: 'sword_clash_steel' },
  13: { motion: 'pan_right', vfx: 'torchlight_dungeon', afx: 'studio_clean', sfx: 'sword_clash_steel' },
  14: { motion: 'zoom_in', vfx: 'classified_dossier', afx: 'studio_clean', sfx: 'map_pin_drop' },
  15: { motion: 'map_zoom_highlight', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'map_pin_drop' },
  16: { motion: 'ai_video', vfx: 'underwater_caustics', afx: 'studio_clean', sfx: 'whoosh_fast_cut' },
  17: { motion: 'pan_down', vfx: 'underwater_caustics', afx: 'studio_clean', sfx: 'whoosh_fast_cut' },
  18: { motion: 'zoom_in', vfx: 'underwater_caustics', afx: 'studio_clean', sfx: 'map_pin_drop' },
  19: { motion: 'pan_right', vfx: 'underwater_caustics', afx: 'studio_clean', sfx: 'sword_clash_steel' },
  20: { motion: 'zoom_out', vfx: 'underwater_caustics', afx: 'studio_clean', sfx: 'noor_ethereal_shimmer' },
  21: { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'royal_decree_fanfare' },
  22: { motion: 'vertigo_dolly_zoom', vfx: 'tunnel_vision_dread', afx: 'philosophical_intimate', sfx: 'riser_tension_build' },

  // === ACT 2: Cascading Crises — Megadrought, Earthquakes & Riots (Scenes 23–42) ===
  23: { motion: 'ai_video', vfx: 'sandstorm_haze', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  24: { motion: 'map_zoom_highlight', vfx: 'blueprint_cyanotype', afx: 'studio_clean', sfx: 'map_pin_drop' },
  25: { motion: 'pan_right', vfx: 'dune_desert_amber', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  26: { motion: 'zoom_in', vfx: 'dune_desert_amber', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  27: { motion: 'pan_left', vfx: 'dune_desert_amber', afx: 'studio_clean', sfx: 'crowd_protest_murmur' },
  28: { motion: 'ai_video', vfx: 'dune_desert_amber', afx: 'echo_hall_reverent', sfx: 'crowd_protest_murmur' },
  29: { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  30: { motion: 'pan_right', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'royal_decree_fanfare' },
  31: { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'sub_bass_boom_hit' },
  32: { motion: 'ai_video', vfx: 'bleach_bypass_grit', afx: 'deep_cinema_trailer', sfx: 'sub_bass_boom_hit' },
  33: { motion: 'map_zoom_highlight', vfx: 'blueprint_cyanotype', afx: 'studio_clean', sfx: 'sub_bass_boom_hit' },
  34: { motion: 'earthquake_tremor', vfx: 'bleach_bypass_grit', afx: 'studio_clean', sfx: 'sub_bass_boom_hit' },
  35: { motion: 'handheld_docu', vfx: 'chiaroscuro_caravaggio', afx: 'studio_clean', sfx: 'crowd_protest_murmur' },
  36: { motion: 'handheld_docu', vfx: 'chiaroscuro_caravaggio', afx: 'studio_clean', sfx: 'crowd_protest_murmur' },
  37: { motion: 'pan_right', vfx: 'tunnel_vision_dread', afx: 'studio_clean', sfx: 'torch_fire_crackle' },
  38: { motion: 'ai_video', vfx: 'torchlight_dungeon', afx: 'studio_clean', sfx: 'torch_fire_crackle' },
  39: { motion: 'pan_left', vfx: 'bleach_bypass_grit', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  40: { motion: 'zoom_out', vfx: 'bleach_bypass_grit', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  41: { motion: 'zoom_in', vfx: 'torchlight_dungeon', afx: 'studio_clean', sfx: 'sword_clash_steel' },
  42: { motion: 'cinematic_glow', vfx: 'tunnel_vision_dread', afx: 'philosophical_intimate', sfx: 'riser_tension_build' },

  // === ACT 3: The Invaders & The Great Fires (Scenes 43–64) ===
  43: { motion: 'ai_video', vfx: 'moonlight_cobalt', afx: 'deep_cinema_trailer', sfx: 'war_horn_distant' },
  44: { motion: 'pan_right', vfx: 'teal_orange_blockbuster', afx: 'studio_clean', sfx: 'war_horn_distant' },
  45: { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'riser_tension_build' },
  46: { motion: 'pan_left', vfx: 'bleach_bypass_grit', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  47: { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  48: { motion: 'handheld_docu', vfx: 'teal_orange_blockbuster', afx: 'studio_clean', sfx: 'crowd_protest_murmur' },
  49: { motion: 'zoom_in', vfx: 'torchlight_dungeon', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  50: { motion: 'ai_video', vfx: 'torchlight_dungeon', afx: 'deep_cinema_trailer', sfx: 'riser_tension_build' },
  51: { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  52: { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'sub_bass_boom_hit' },
  53: { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'philosophical_intimate', sfx: 'page_turn_parchment' },
  54: { motion: 'ai_video', vfx: 'battlefield_fire_embers', afx: 'deep_cinema_trailer', sfx: 'torch_fire_crackle' },
  55: { motion: 'pan_right', vfx: 'battlefield_fire_embers', afx: 'studio_clean', sfx: 'torch_fire_crackle' },
  56: { motion: 'zoom_in', vfx: 'battlefield_fire_embers', afx: 'studio_clean', sfx: 'torch_fire_crackle' },
  57: { motion: 'ai_video', vfx: 'battlefield_fire_embers', afx: 'studio_clean', sfx: 'torch_fire_crackle' },
  58: { motion: 'pan_left', vfx: 'bleach_bypass_grit', afx: 'studio_clean', sfx: 'sub_bass_boom_hit' },
  59: { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  60: { motion: 'zoom_out', vfx: 'bleach_bypass_grit', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  61: { motion: 'handheld_docu', vfx: 'teal_orange_blockbuster', afx: 'studio_clean', sfx: 'war_horn_distant' },
  62: { motion: 'ai_video', vfx: 'battlefield_fire_embers', afx: 'echo_hall_reverent', sfx: 'royal_decree_fanfare' },
  63: { motion: 'pan_right', vfx: 'battlefield_fire_embers', afx: 'studio_clean', sfx: 'war_horn_distant' },
  64: { motion: 'ai_video', vfx: 'battlefield_fire_embers', afx: 'deep_cinema_trailer', sfx: 'sword_clash_steel' },

  // === ACT 4: Phoenix from the Ashes — The Iron Age & Modern Reflection (Scenes 65–85) ===
  65: { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'royal_decree_fanfare' },
  66: { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'riser_tension_build' },
  67: { motion: 'pan_left', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  68: { motion: 'map_zoom_highlight', vfx: 'blueprint_cyanotype', afx: 'studio_clean', sfx: 'map_pin_drop' },
  69: { motion: 'vertigo_dolly_zoom', vfx: 'classified_dossier', afx: 'studio_clean', sfx: 'sub_bass_boom_hit' },
  70: { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'noor_ethereal_shimmer' },
  71: { motion: 'zoom_in', vfx: 'torchlight_dungeon', afx: 'studio_clean', sfx: 'sword_clash_steel' },
  72: { motion: 'ai_video', vfx: 'torchlight_dungeon', afx: 'studio_clean', sfx: 'sword_clash_steel' },
  73: { motion: 'pan_right', vfx: 'vintage_sepia_grain', afx: 'studio_clean', sfx: 'royal_decree_fanfare' },
  74: { motion: 'zoom_in', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'sword_clash_steel' },
  75: { motion: 'pan_left', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'noor_ethereal_shimmer' },
  76: { motion: 'parallax_25d', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'whoosh_fast_cut' },
  77: { motion: 'zoom_in', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'royal_decree_fanfare' },
  78: { motion: 'pan_right', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'desert_wind_whistle' },
  79: { motion: 'zoom_in', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  80: { motion: 'ai_video', vfx: 'golden_hour_sunset', afx: 'studio_clean', sfx: 'whoosh_fast_cut' },
  81: { motion: 'map_zoom_highlight', vfx: 'parchment_manuscript', afx: 'studio_clean', sfx: 'page_turn_parchment' },
  82: { motion: 'cinematic_glow', vfx: 'candlelight_flicker', afx: 'philosophical_intimate', sfx: 'noor_ethereal_shimmer' },
  83: { motion: 'zoom_out', vfx: 'anamorphic_cinema', afx: 'philosophical_intimate', sfx: 'riser_tension_build' },
  84: { motion: 'vertigo_dolly_zoom', vfx: 'tunnel_vision_dread', afx: 'philosophical_intimate', sfx: 'sub_bass_boom_hit' },
  85: { motion: 'ai_video', vfx: 'noor_divine_bloom', afx: 'warm_tube_narrator', sfx: 'portal_mystic_whoosh' }
};

let updatedCount = 0;
project.scenes.forEach((scene) => {
  const cfg = blueprint[scene.scene_id];
  if (cfg) {
    // Preserve ai_video motion for dynamic scenes
    if (scene.type === 'DYNAMIC_AI_VIDEO') {
      scene.motion_effect = 'ai_video';
    } else {
      scene.motion_effect = cfg.motion;
    }
    scene.vfx_effect = cfg.vfx;
    scene.audio_effect = cfg.afx;
    scene.sfx = cfg.sfx;
    updatedCount++;
  }
});

// Configure Master BGM clips
const totalDur = Math.max(30, project.total_duration_seconds || 974.12);
project.bgm_clips = [
  {
    id: 'bgm_clip_1',
    title: 'Ancient Mediterranean Collapse Theme (Lyria 3.5 AI Studio Pro)',
    file: 'audio/bgm.mp3',
    start_time: 0,
    duration: +totalDur.toFixed(2),
    trim_in: 0,
    volume_db: -20,
    ducking: true,
    fade_in: 1.5,
    fade_out: 2.5,
    loop: true
  }
];

fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), 'utf8');
console.log(`Successfully calibrated and applied cinematic effects to ${updatedCount}/85 scenes!`);
console.log(`BGM soundtrack bound: ${project.bgm_clips[0].file} (${project.bgm_clips[0].duration}s, -20 dB ducked)`);
