/* Simple Studio (সিম্পল স্টুডিও) — Multi-Track NLE & AI Production Studio Frontend */
const $ = (id) => document.getElementById(id);
const LANGS = { bn: 'বাংলা', en: 'English', hi: 'हिंदी' };
const LANG_FULL = { bn: 'Simple Studio Bangla', en: 'Simple Studio English', hi: 'Simple Studio Hindi' };
const PRESET_LABEL = {
  PRESET_VOX_DOCUMENTARY: '📰 Vox-Style AI Documentary',
  PRESET_VOICE_OF_DHAKA: '🎙️ Voice of Dhaka Explainer',
  PRESET_POLITICAL_EXPLAINER: '🗺️ Political Explainer (Nasir Tamzid)',
  PRESET_PHILOSOPHICAL_THINKER: '🧠 Philosophical Essay (The Thinker)',
  PRESET_CARTOON_DRAMA: '🎬 AI Cartoon Drama (Rakib vs Sohel)',
  PRESET_REALISTIC_DRAMA: '🎥 Realistic Cinema Drama',
  PRESET_ISLAMIC_REVERENT: '🕌 Islamic Reverent Documentary',
  PRESET_STICKY_MEME: '🎭 Sticky-Meme (OverSimplified)',
  PRESET_SIMPLE_HISTORY: '🏛️ Simple-History Cutout',
  PRESET_MYSTERY_NOIR: '🕵️ Mystery-Noir Conspiracy',
};
const MOTION_LABEL = {
  // 1. Zoom & Ken Burns (10)
  static: 'Static (Locked Frame)',
  zoom_in: 'Zoom In (Classic Ken Burns Push)',
  zoom_out: 'Zoom Out (Classic Reveal Pull)',
  zoom_in_fast: 'Fast Punch Zoom In',
  zoom_out_fast: 'Fast Pull-Back Zoom Out',
  zoom_in_slow: 'Ultra-Slow Documentary Creep In',
  zoom_out_slow: 'Ultra-Slow Documentary Pull Out',
  zoom_in_top_left: 'Zoom In → Top-Left Subject',
  zoom_in_top_right: 'Zoom In → Top-Right Subject',
  zoom_in_bottom: 'Zoom In → Lower Foreground',
  // 2. Pan & Horizon Glide (10)
  pan_left: 'Pan Left (Horizon Glide)',
  pan_right: 'Pan Right (Tracking Glide)',
  pan_up: 'Tilt / Pan Upward (Monument Reveal)',
  pan_down: 'Tilt / Pan Downward (Sky to Ground)',
  pan_diag_tl_br: 'Diagonal Pan (Top-Left → Bottom-Right)',
  pan_diag_tr_bl: 'Diagonal Pan (Top-Right → Bottom-Left)',
  pan_diag_bl_tr: 'Diagonal Pan (Bottom-Left → Top-Right)',
  pan_diag_br_tl: 'Diagonal Pan (Bottom-Right → Top-Left)',
  pan_left_zoom_in: 'Pan Left + Simultaneous Zoom In',
  pan_right_zoom_out: 'Pan Right + Simultaneous Zoom Out',
  // 3. Whip, Slide & Push Transitions (10)
  whip_pan_left: 'Whip Pan Left (Fast Blur Cut)',
  whip_pan_right: 'Whip Pan Right (Fast Blur Cut)',
  whip_pan_up: 'Whip Tilt Up Transition',
  whip_pan_down: 'Whip Tilt Down Transition',
  slide_push_left: 'Slide Push Left Transition',
  slide_push_right: 'Slide Push Right Transition',
  slide_push_up: 'Slide Push Up Transition',
  slide_push_down: 'Slide Push Down Transition',
  elastic_bounce_in: 'Elastic Bounce Pop-In',
  overshoot_snap_zoom: 'Overshoot Snap Zoom Transition',
  // 4. Fade, Dissolve & Luma Transitions (10)
  crossfade: 'Smooth Crossfade Dissolve',
  dip_to_black: 'Dip to Black Transition',
  dip_to_white: 'Dip to White Flash Transition',
  dip_to_gold: 'Dip to Vintage Gold Transition',
  luma_fade_in: 'Luma Gradient Dissolve In',
  flash_bulb_cut: 'Archival Flashbulb Cut',
  film_burn_transition: '35mm Film Burn Transition',
  light_leak_wipe: 'Anamorphic Light Leak Wipe',
  smoke_dissolve: 'Atmospheric Fog Dissolve',
  blur_dissolve: 'Gaussian Defocus Dissolve',
  // 5. Spin, 3D, Split & Wipe Transitions (10)
  clock_wipe_cw: 'Clockwise Radial Wipe',
  iris_circle_open: 'Vintage Cinema Iris Circle Open',
  iris_circle_close: 'Vintage Cinema Iris Circle Close',
  split_horizontal_open: 'Horizontal Barn-Door Split',
  split_vertical_open: 'Vertical Split Reveal',
  page_peel_curl: 'Manuscript Page Peel Curl',
  spin_cw_in: 'Vortex Spin Clockwise In',
  spin_ccw_in: 'Vortex Spin Counter-Clockwise In',
  pendulum_tilt: 'Pendulum Dutch-Angle Tilt',
  flip_3d_card: '3D Perspective Card Flip',
  // 6. Documentary, Parallax & Shake Motions (10)
  vox_stop_motion: 'Vox 12fps Stop-Motion (2.5s + 1.5s Hold)',
  parallax_25d: '2.5D Parallax Depth Push (Voice of Dhaka)',
  map_zoom_highlight: 'Geopolitical Fast Map Zoom + Hold',
  handheld_docu: 'Handheld Documentary Camera Sway',
  earthquake_tremor: 'Battle / Earthquake Camera Shake',
  heartbeat_pulse_zoom: 'Suspense Heartbeat Pulse Zoom',
  vertigo_dolly_zoom: 'Hitchcock Vertigo Dolly Counter-Zoom',
  glitch_twitch_cut: 'Cyber Glitch Twitch Transition',
  cinematic_glow: 'Slow Crane Float + Glow',
  vox_cutout_pan_lr: 'Vox Cutout Floating Pan (Left → Right over Paper)',
  vox_cutout_pan_rl: 'Vox Cutout Floating Pan (Right → Left over Paper)',
  vod_spotlight_glide: 'Voice of Dhaka Spotlight Cutout Glide + Card',
  floating_card_pan: '3D Floating Archival Photo Drift over Blur',
  ai_video: 'Native AI Video Clip (24fps Slow-Match)',
};

const MOTION_CATEGORY_MAP = {
  static: 'Zoom & Ken Burns', zoom_in: 'Zoom & Ken Burns', zoom_out: 'Zoom & Ken Burns', zoom_in_fast: 'Zoom & Ken Burns', zoom_out_fast: 'Zoom & Ken Burns',
  zoom_in_slow: 'Zoom & Ken Burns', zoom_out_slow: 'Zoom & Ken Burns', zoom_in_top_left: 'Zoom & Ken Burns', zoom_in_top_right: 'Zoom & Ken Burns', zoom_in_bottom: 'Zoom & Ken Burns',
  pan_left: 'Pan & Horizon Glide', pan_right: 'Pan & Horizon Glide', pan_up: 'Pan & Horizon Glide', pan_down: 'Pan & Horizon Glide',
  pan_diag_tl_br: 'Pan & Horizon Glide', pan_diag_tr_bl: 'Pan & Horizon Glide', pan_diag_bl_tr: 'Pan & Horizon Glide', pan_diag_br_tl: 'Pan & Horizon Glide',
  pan_left_zoom_in: 'Pan & Horizon Glide', pan_right_zoom_out: 'Pan & Horizon Glide',
  whip_pan_left: 'Whip, Slide & Push', whip_pan_right: 'Whip, Slide & Push', whip_pan_up: 'Whip, Slide & Push', whip_pan_down: 'Whip, Slide & Push',
  slide_push_left: 'Whip, Slide & Push', slide_push_right: 'Whip, Slide & Push', slide_push_up: 'Whip, Slide & Push', slide_push_down: 'Whip, Slide & Push',
  elastic_bounce_in: 'Whip, Slide & Push', overshoot_snap_zoom: 'Whip, Slide & Push',
  crossfade: 'Fade, Dissolve & Luma', dip_to_black: 'Fade, Dissolve & Luma', dip_to_white: 'Fade, Dissolve & Luma', dip_to_gold: 'Fade, Dissolve & Luma',
  luma_fade_in: 'Fade, Dissolve & Luma', flash_bulb_cut: 'Fade, Dissolve & Luma', film_burn_transition: 'Fade, Dissolve & Luma',
  light_leak_wipe: 'Fade, Dissolve & Luma', smoke_dissolve: 'Fade, Dissolve & Luma', blur_dissolve: 'Fade, Dissolve & Luma',
  clock_wipe_cw: 'Spin, 3D, Split & Wipe', iris_circle_open: 'Spin, 3D, Split & Wipe', iris_circle_close: 'Spin, 3D, Split & Wipe',
  split_horizontal_open: 'Spin, 3D, Split & Wipe', split_vertical_open: 'Spin, 3D, Split & Wipe', page_peel_curl: 'Spin, 3D, Split & Wipe',
  spin_cw_in: 'Spin, 3D, Split & Wipe', spin_ccw_in: 'Spin, 3D, Split & Wipe', pendulum_tilt: 'Spin, 3D, Split & Wipe', flip_3d_card: 'Spin, 3D, Split & Wipe',
  vox_stop_motion: 'Documentary, Parallax & Shake', parallax_25d: 'Documentary, Parallax & Shake', map_zoom_highlight: 'Documentary, Parallax & Shake',
  handheld_docu: 'Documentary, Parallax & Shake', earthquake_tremor: 'Documentary, Parallax & Shake', heartbeat_pulse_zoom: 'Documentary, Parallax & Shake',
  vertigo_dolly_zoom: 'Documentary, Parallax & Shake', glitch_twitch_cut: 'Documentary, Parallax & Shake', cinematic_glow: 'Documentary, Parallax & Shake', vox_cutout_pan_lr: 'Documentary, Parallax & Shake', vox_cutout_pan_rl: 'Documentary, Parallax & Shake', vod_spotlight_glide: 'Documentary, Parallax & Shake', floating_card_pan: 'Documentary, Parallax & Shake', ai_video: 'Documentary, Parallax & Shake'
};

const VFX_LABEL = {
  // 1. Documentary & Editorial Paper Styles (10)
  none: 'Clean Original (No Filter)',
  vox_halftone_paper: '📰 Vox Halftone Paper + Yellow Accent',
  highlighter_callout: '🖍️ Explainer Yellow Highlighter Bar',
  chalkboard_grid: '📐 The Thinker Dark Slate Grid',
  classified_dossier: '📁 Top-Secret Redacted Dossier Stamp',
  parchment_manuscript: '📜 Ancient Illuminated Parchment Scroll',
  papercraft_cutout_shadow: '✂️ 2D Cutout Drop-Shadow Relief',
  newspaper_microfilm: '🗞️ 1960s Microfilm Archive Reader',
  blueprint_cyanotype: '🧭 Architectural Cyanotype Blueprint',
  red_thread_board: '🧶 Detective Red-Thread Evidence Board',
  // 2. Cinematic Color Grading & Hollywood LUTs (12)
  anamorphic_cinema: '🎬 2.35:1 Cinema Letterbox + Teal/Orange',
  teal_orange_blockbuster: '🎞️ Hollywood Teal & Orange LUT',
  christopher_nolan_cold: '🧊 IMAX Cold Steel Blue Grade',
  dune_desert_amber: '🏜️ Epic Desert Amber & Ochre LUT',
  matrix_cyber_green: '🟢 Phosphor Matrix Green Grade',
  blade_runner_neon: '🌆 Cyberpunk Magenta & Cyan LUT',
  wes_anderson_pastel: '🎨 Warm Symmetrical Pastel Grade',
  fincher_neo_noir: '🕵️ Fincher Desaturated Green-Gold Noir',
  golden_hour_sunset: '🌅 Magic Hour Warm Sunset LUT',
  moonlight_cobalt: '🌙 Day-for-Night Cobalt Moonlight',
  bleach_bypass_grit: '⚔️ Silver Retention Bleach Bypass Grit',
  vivid_hdr_pop: '💎 High-Contrast HDR Documentary Pop',
  // 3. Vintage, Archival & Film Stock Emulation (10)
  vintage_sepia_grain: '🕰️ 1940s/1971 Archival Sepia & Grain',
  kodak_portra_400: '📷 Kodak Portra 400 Warm Film Stock',
  fujifilm_velvia_50: '🌲 Fujifilm Velvia 50 Rich Film Stock',
  super8_home_movie: '📽️ 1970s Super-8mm Warm Flicker',
  '16mm_newsreel_bw': '📺 1945 16mm B&W War Newsreel',
  silent_era_1920s: '🎩 1920s Silent Film Scratches & Flicker',
  daguerreotype_1850: '🪞 1850s Silver Plate Daguerreotype',
  polaroid_instant_fade: '🖼️ Faded Instant Polaroid Nostalgia',
  technicolor_3strip: '🌈 1950s Three-Strip Technicolor',
  damaged_celluloid: '🎞️ Damaged Archival Celluloid Dust',
  // 4. Noir, Vignette & Dramatic Shadows (8)
  archival_noir_vignette: '🔦 Voice of Dhaka Spotlight Vignette',
  sin_city_splash: '🩸 High-Contrast Monochrome + Red Splash',
  chiaroscuro_caravaggio: '🕯️ Deep Chiaroscuro Oil Shadows',
  candlelight_flicker: '🕯️ Warm Medieval Candlelight Flicker',
  interrogation_lamp: '💡 Harsh Overhead Interrogation Cone',
  torchlight_dungeon: '🔥 Flickering Dungeon Torch Vignette',
  eclipse_corona_dark: '🌑 Solar Eclipse Dark Rim Vignette',
  tunnel_vision_dread: '👁️ Psychological Tunnel Vision Vignette',
  // 5. Glow, Bloom & Reverent Light (8)
  noor_divine_bloom: '✨ Islamic Reverent Golden Noor Bloom',
  ethereal_dream_mist: '☁️ Soft Ethereal Pro-Mist Halation',
  heavenly_god_rays: '☀️ Volumetric Sunbeams / God Rays',
  celestial_starlight: '🌌 Cosmic Starfield Shimmer Overlay',
  golden_dust_motes: '✨ Floating Golden Library Dust Motes',
  prism_rainbow_flare: '💎 Optical Prism Rainbow Lens Flare',
  anamorphic_blue_streak: '💠 Sci-Fi Horizontal Blue Lens Streak',
  sacred_candle_aura: '🕌 Warm Sacred Sanctuary Golden Aura',
  // 6. Glitch, CRT, VHS & Digital HUD (6)
  crt_scanlines: '📟 Classified Dossier CRT Scanlines',
  vhs_1990s_tracking: '📼 1990s VHS Tape Tracking Lines',
  rgb_chromatic_split: '🌈 3D RGB Chromatic Aberration Split',
  cyber_glitch_slice: '⚡ Digital Datamosh Glitch Slice',
  night_vision_goggles: '🥽 Military Green Night-Vision HUD',
  thermal_infrared: '🌡️ Thermal Infrared Heatmap Vision',
  // 7. Weather & Atmospheric Overlays (6)
  rain_storm_glass: '🌧️ Heavy Rain & Window Droplets Overlay',
  winter_snow_blizzard: '❄️ Falling Winter Snowflakes Overlay',
  battlefield_fire_embers: '🔥 Rising Battlefield Fire Embers',
  sandstorm_haze: '🌪️ Ancient Desert Sandstorm Haze',
  london_thick_fog: '🌫️ Dense Victorian Rolling Fog',
  lightning_thunder_flash: '⚡ Dramatic Storm Lightning Flash',
};

const VFX_CATEGORY_MAP = {
  none: 'Paper & Editorial', vox_halftone_paper: 'Paper & Editorial', highlighter_callout: 'Paper & Editorial', chalkboard_grid: 'Paper & Editorial',
  classified_dossier: 'Paper & Editorial', parchment_manuscript: 'Paper & Editorial', papercraft_cutout_shadow: 'Paper & Editorial',
  newspaper_microfilm: 'Paper & Editorial', blueprint_cyanotype: 'Paper & Editorial', red_thread_board: 'Paper & Editorial',
  anamorphic_cinema: 'Hollywood Color LUTs', teal_orange_blockbuster: 'Hollywood Color LUTs', christopher_nolan_cold: 'Hollywood Color LUTs',
  dune_desert_amber: 'Hollywood Color LUTs', matrix_cyber_green: 'Hollywood Color LUTs', blade_runner_neon: 'Hollywood Color LUTs',
  wes_anderson_pastel: 'Hollywood Color LUTs', fincher_neo_noir: 'Hollywood Color LUTs', golden_hour_sunset: 'Hollywood Color LUTs',
  moonlight_cobalt: 'Hollywood Color LUTs', bleach_bypass_grit: 'Hollywood Color LUTs', vivid_hdr_pop: 'Hollywood Color LUTs',
  vintage_sepia_grain: 'Vintage & Film Stock', kodak_portra_400: 'Vintage & Film Stock', fujifilm_velvia_50: 'Vintage & Film Stock',
  super8_home_movie: 'Vintage & Film Stock', '16mm_newsreel_bw': 'Vintage & Film Stock', silent_era_1920s: 'Vintage & Film Stock',
  daguerreotype_1850: 'Vintage & Film Stock', polaroid_instant_fade: 'Vintage & Film Stock', technicolor_3strip: 'Vintage & Film Stock', damaged_celluloid: 'Vintage & Film Stock',
  archival_noir_vignette: 'Noir, Vignette & Shadows', sin_city_splash: 'Noir, Vignette & Shadows', chiaroscuro_caravaggio: 'Noir, Vignette & Shadows',
  candlelight_flicker: 'Noir, Vignette & Shadows', interrogation_lamp: 'Noir, Vignette & Shadows', torchlight_dungeon: 'Noir, Vignette & Shadows',
  eclipse_corona_dark: 'Noir, Vignette & Shadows', tunnel_vision_dread: 'Noir, Vignette & Shadows',
  noor_divine_bloom: 'Glow, Bloom & Light', ethereal_dream_mist: 'Glow, Bloom & Light', heavenly_god_rays: 'Glow, Bloom & Light',
  celestial_starlight: 'Glow, Bloom & Light', golden_dust_motes: 'Glow, Bloom & Light', prism_rainbow_flare: 'Glow, Bloom & Light',
  anamorphic_blue_streak: 'Glow, Bloom & Light', sacred_candle_aura: 'Glow, Bloom & Light',
  crt_scanlines: 'Glitch, CRT, VHS & HUD', vhs_1990s_tracking: 'Glitch, CRT, VHS & HUD', rgb_chromatic_split: 'Glitch, CRT, VHS & HUD',
  cyber_glitch_slice: 'Glitch, CRT, VHS & HUD', night_vision_goggles: 'Glitch, CRT, VHS & HUD', thermal_infrared: 'Glitch, CRT, VHS & HUD',
  rain_storm_glass: 'Weather & Atmosphere', winter_snow_blizzard: 'Weather & Atmosphere', battlefield_fire_embers: 'Weather & Atmosphere',
  sandstorm_haze: 'Weather & Atmosphere', london_thick_fog: 'Weather & Atmosphere', lightning_thunder_flash: 'Weather & Atmosphere'
};

const AUDIO_FX_LABEL = {
  studio_clean: '🎙️ Broadcast Clean (-14 LUFS)',
  warm_tube_narrator: '📻 Voice of Dhaka Warm Bass Tube EQ',
  philosophical_intimate: '🎧 The Thinker Close-Mic Intimate',
  old_radio_archival: '📠 Vintage Archival Radio (1945/1971)',
  echo_hall_reverent: '🕌 Reverent Hall Acoustic Reverb',
  telephone_intercept: '☎️ Political Comms / Phone Filter',
  crispy_podcast_comp: '🎚️ Crisp Vox Podcast Compressor',
  deep_cinema_trailer: '🎬 Deep Movie Trailer Sub-Voice',
  stadium_crowd_pa: '📢 Public Address Megaphone Echo',
  whisper_asmr_boost: '🤫 Hushed Mystery Whisper Boost',
  tape_cassette_warble: '📼 1980s Analog Cassette Tape Warble',
  cathedral_sacred_choir: '🏛️ Grand Stone Cathedral Acoustics',
  gramophone_1920s: '🎺 1920s Brass Gramophone Horn',
  walkie_talkie_military: '📻 Military Tactical Radio Squelch',
  de_esser_broadcast_pro: '✨ Pro De-Esser & Silk High-Shelf',
};

const FALLBACK_VOICES = [
  { id: 'Cruz', gender: 'Male', age: 'Elderly', profile: 'Weathered elder storyteller', defaultStyle: 'An Old Story Teller, Old Man voice', bestFor: 'Time Chronicler (Host)' },
  { id: 'Charon', gender: 'Male', age: 'Adult', profile: 'Deep, resonant documentary narrator', defaultStyle: 'deep, resonant, authoritative documentary narrator', bestFor: 'Voice of Dhaka / History Narrator' },
  { id: 'Orus', gender: 'Male', age: 'Adult', profile: 'Firm, crisp, analytical', defaultStyle: 'crisp, analytical, investigative geopolitical journalist', bestFor: 'Political Explainer' },
  { id: 'Enceladus', gender: 'Male', age: 'Adult', profile: 'Breathy, intimate, reflective', defaultStyle: 'intimate, reflective, calm philosophical essayist', bestFor: 'The Thinker Essay' },
  { id: 'Rasalgethi', gender: 'Male', age: 'Adult', profile: 'Informative, structured', defaultStyle: 'articulate, curious, well-paced Vox documentary host', bestFor: 'Vox Documentary' },
  { id: 'Sadaltager', gender: 'Male', age: 'Mature', profile: 'Knowledgeable, dignified', defaultStyle: 'dignified, reverent, scholarly and serene cadence', bestFor: 'Islamic / Religious History' },
  { id: 'Iapetus', gender: 'Male', age: 'Young Adult', profile: 'Clear, grounded, earnest', defaultStyle: 'warm, grounded, humble and sincere young man', bestFor: 'Drama Protagonist (Rakib)' },
  { id: 'Achird', gender: 'Male', age: 'Young Adult', profile: 'Friendly, expressive, upbeat', defaultStyle: 'friendly, expressive, slightly impulsive conversational tone', bestFor: 'Drama Foil (Sohel)' },
  { id: 'Fenrir', gender: 'Male', age: 'Adult', profile: 'Booming, commanding', defaultStyle: 'commanding, booming, fierce authoritarian voice', bestFor: 'Kings / Emperors / Warlords' },
  { id: 'Algenib', gender: 'Male', age: 'Mature', profile: 'Gravelly, dark, tense', defaultStyle: 'gravelly, tense, dramatic thriller narrator', bestFor: 'Mystery Noir / Thriller' },
  { id: 'Algieba', gender: 'Male', age: 'Adult', profile: 'Smooth, charismatic', defaultStyle: 'smooth, engaging, polished storyteller', bestFor: 'Biography / Business' },
  { id: 'Alnilam', gender: 'Male', age: 'Adult', profile: 'Firm, broadcast news', defaultStyle: 'serious, authoritative news broadcast anchor', bestFor: 'News & Reports' },
  { id: 'Puck', gender: 'Male', age: 'Youth', profile: 'Youthful, snappy, playful', defaultStyle: 'playful, fast-paced, witty and energetic', bestFor: 'Young Side Characters' },
  { id: 'Sadachbia', gender: 'Male', age: 'Adult', profile: 'Lively, dynamic', defaultStyle: 'lively, high-energy, dynamic delivery', bestFor: 'Action Beats' },
  { id: 'Schedar', gender: 'Male', age: 'Adult', profile: 'Even, instructional', defaultStyle: 'clear, even-paced, instructional guide', bestFor: 'Manual Tutorials' },
  { id: 'Umbriel', gender: 'Male', age: 'Adult', profile: 'Easy-going, relaxed', defaultStyle: 'relaxed, warm, easy-going storyteller', bestFor: 'Slice of Life' },
  { id: 'Zubenelgenubi', gender: 'Male', age: 'Adult', profile: 'Natural conversational', defaultStyle: 'casual, natural conversational delivery', bestFor: 'Podcasts' },
  { id: 'Bodi', gender: 'Male', age: 'Elderly', profile: 'Quiet, ancient elder', defaultStyle: 'weathered, intimate, ancient elder voice', bestFor: 'Sages & Elders' },
  { id: 'Koda', gender: 'Male', age: 'Adult', profile: 'Earnest, humble citizen', defaultStyle: 'earnest, distressed, humble citizen voice', bestFor: 'Citizens & Eyewitnesses' },
  { id: 'Kore', gender: 'Female', age: 'Adult', profile: 'Firm, regal, confident', defaultStyle: 'commanding, regal, articulate and confident', bestFor: 'Queens & Female Leads' },
  { id: 'Aoede', gender: 'Female', age: 'Adult', profile: 'Breezy, melodic, warm', defaultStyle: 'melodic, warm, engaging storyteller', bestFor: 'Cultural & Literary Story' },
  { id: 'Gacrux', gender: 'Female', age: 'Mature', profile: 'Mature, wise matriarch', defaultStyle: 'mature, wise, warm and compassionate elder', bestFor: 'Elder Matriarch' },
  { id: 'Erinome', gender: 'Female', age: 'Adult', profile: 'Clear, analytical presenter', defaultStyle: 'clear, crisp, analytical documentary presenter', bestFor: 'Science & Vox Explainer' },
  { id: 'Despina', gender: 'Female', age: 'Adult', profile: 'Smooth, calm, soothing', defaultStyle: 'smooth, calm, deeply reflective and soothing', bestFor: 'Psychology & Philosophy' },
  { id: 'Autonoe', gender: 'Female', age: 'Adult', profile: 'Bright, articulate educator', defaultStyle: 'bright, clear, engaging educator', bestFor: 'Educational Explainer' },
  { id: 'Callirrhoe', gender: 'Female', age: 'Young Adult', profile: 'Natural, empathetic drama', defaultStyle: 'natural, empathetic, realistic conversational acting', bestFor: 'Realistic & Cartoon Drama' },
  { id: 'Sulafat', gender: 'Female', age: 'Adult', profile: 'Warm, heartfelt', defaultStyle: 'warm, heartfelt, reverent and emotional', bestFor: 'Moral & Religious Stories' },
  { id: 'Pulcherrima', gender: 'Female', age: 'Adult', profile: 'Dramatic, theatrical', defaultStyle: 'dramatic, expressive, theatrical delivery', bestFor: 'Stage & Drama' },
  { id: 'Laomedeia', gender: 'Female', age: 'Young Adult', profile: 'Upbeat, curious', defaultStyle: 'upbeat, curious, lively presenter', bestFor: 'Curiosity Explainer' },
  { id: 'Zephyr', gender: 'Female', age: 'Youth', profile: 'Bright, high-energy', defaultStyle: 'bright, energetic, punchy hook delivery', bestFor: 'Shorts Hooks' },
  { id: 'Leda', gender: 'Female', age: 'Child/Teen', profile: 'Youthful, innocent', defaultStyle: 'youthful, innocent, gentle voice', bestFor: 'Child Characters' },
  { id: 'Vindemiatrix', gender: 'Female', age: 'Adult', profile: 'Gentle, poetic', defaultStyle: 'gentle, soft-spoken, poetic cadence', bestFor: 'Poetry & Quotes' },
  { id: 'Achernar', gender: 'Female', age: 'Adult', profile: 'Soft, hushed mystery', defaultStyle: 'soft, hushed, suspenseful inner monologue', bestFor: 'Mystery Whispers' },
];

const VIRAL_TOPICS_BY_PRESET = {
  PRESET_VOX_DOCUMENTARY: [
    'কেন ৩০০০ কিমি বিস্তৃত ভারতে একটাই টাইমজোন? (The Hidden Cost of One Timezone)',
    'অসমের জঙ্গল থেকে চা কীভাবে পুরো উপমহাদেশের জাতীয় পানীয় হলো? (How British Tea Conquered South Asia)',
    'মালয়েশিয়া এয়ারলাইন্স MH370 কীভাবে রাডার থেকে চিরতরে মিলিয়ে গেল? (The Vanishing of Flight 370)',
    'লন্ডনের অস্তিত্বহীন রেস্তোরাঁ কীভাবে TripAdvisor-এ নাম্বার ১ হলো? (The Fake #1 Restaurant Hoax)',
    'কেন বিশ্ব মানচিত্রে দেশগুলোর আকার ভুল দেখানো হয়? (The Mercator Map Illusion)'
  ],
  PRESET_VOICE_OF_DHAKA: [
    'যে যায় লঙ্কায়, সেই হয় রাবণ | জর্জ অরওয়েলের Animal Farm ও বিপ্লবের অন্ধকার সত্য',
    'ক্ষমতার মনস্তত্ত্ব: কেন প্রতিটি বিপ্লবের পর জন্ম নেয় নতুন একনায়ক? (1984 & Big Brother)',
    'ফ্রানৎস কাফকার মেটামরফোসিস: আধুনিক সমাজে মানুষ কীভাবে যন্ত্রে পরিণত হয়?',
    'দস্তয়েভস্কির ক্রাইম অ্যান্ড পানিশমেন্ট: অপরাধবোধ কি আইনের চেয়েও বড় শাস্তি?',
    'প্রোপাগান্ডা ও ভাষার কারসাজি: স্কুইলাররা কীভাবে জনমত নিয়ন্ত্রণ করে?'
  ],
  PRESET_POLITICAL_EXPLAINER: [
    'চার ভাগে ভাগ হচ্ছে বাংলাদেশ? প্রাদেশিক শাসন ব্যবস্থায় আসলে লাভ ও ক্ষতি কার?',
    'কেন্দ্রীভূত শাসন বনাম বিকেন্দ্রীকরণ (Decentralization): ইন্দোনেশিয়া ও দক্ষিণ আফ্রিকার শিক্ষা',
    'সংসদীয় আসন পুনর্বিন্যাস ও জেরিম্যান্ডারিং: নির্বাচনের আগেই কীভাবে ফলাফল বদলে যায়?',
    'তিস্তা মহাপরিকল্পনা ও ভূ-রাজনীতি: পানি বণ্টনের আসল সমীকরণ কী?',
    'বঙ্গোপসাগরের ভূ-রাজনীতি: কেন পরাশক্তিগুলোর নজর সেন্টমার্টিন ও গভীর সমুদ্রবন্দরে?'
  ],
  PRESET_PHILOSOPHICAL_THINKER: [
    'The Fear of Being Average: আমাদের এই জেনারেশন কেন সাধারণ জীবনকে এত ভয় পায়?',
    'Metacognition: আপনার মাথার ভেতরের চিন্তাগুলো কি আসলেই আপনার নিজের?',
    'Social Comparison Theory: সোশ্যাল মিডিয়া কীভাবে আমাদের সুখের সংজ্ঞা চুরি করেছে?',
    'Immortality Projects: মৃত্যুর পরও মানুষ কেন পৃথিবীতে নিজের চিহ্ন রেখে যেতে চায়?',
    'The Paradox of Choice: অসীম অপশনের ভিড়ে কেন আমরা সিদ্ধান্তহীনতায় ভুগি?'
  ],
  PRESET_CARTOON_DRAMA: [
    'একই বেতন ২৫,০০০ টাকা: ১০ বছর পর রাকিব কেন ধনী আর সোহেল কেন ১৫ লাখ টাকার ঋণে?',
    'দুই ভাইয়ের উত্তরাধিকার: একজন গড়ল কারখানা, অন্যজন হারাল পৈতৃক ভিটা!',
    'ক্রেডিট কার্ডের ফাঁদ বনাম নীরব বিনিয়োগ: মধ্যবিত্ত পরিবারের বাস্তব শিক্ষা',
    'শহরের চাকচিক্য বনাম গ্রামের কৃষি উদ্যোক্তা: কার জীবন আসলে সফল?',
    'অবসরের পর কার মুখে হাসি? ৩০ বছর বয়সে নেওয়া ৩টি আর্থিক সিদ্ধান্ত'
  ],
  PRESET_REALISTIC_DRAMA: [
    'রাত ২টার শর্টকাট রাস্তা: পেট্রোল পাম্পের লোকটি কেন ওই গ্রামে যেতে নিষেধ করেছিল?',
    'নিখোঁজ ট্রেনের শেষ যাত্রী: কুয়াশাচ্ছন্ন স্টেশনে সেদিন রাতে কী ঘটেছিল?',
    'পুরনো ঢাকার পরিত্যক্ত জমিদার বাড়ি: ৫০ বছর পর খোলা সিন্দুকের রহস্য',
    'সাইবার ক্রাইম থ্রিলার: একটি ওটিপি কলে যেভাবে নিঃস্ব হলো পুরো পরিবার',
    'সীমান্তের ওপারে শেষ চিঠি: ১৯৭১-এর এক অজানা রণাঙ্গনের সত্য ঘটনা'
  ],
  PRESET_ISLAMIC_REVERENT: [
    'বাইতুল হিকমাহ: বাগদাদের যে গ্রন্থাগার থেকে আধুনিক বিজ্ঞানের সূচনা হয়েছিল',
    'খলিফা উমর (রা.)-এর শাসনামলে প্রথম কারাগার ও ন্যায়বিচারের প্রতিষ্ঠা',
    'ইবনে খালদুন ও মুকাদ্দিমাহ: সভ্যতার উত্থান-পতনের কালজয়ী দর্শন',
    'আন্দালুসিয়ার স্বর্ণযুগ: কর্ডোভার আলোকিত রাজপথ ও জ্ঞানচর্চার ইতিহাস',
    'মরুভূমির বুকে জমজম ও কাবার প্রাচীন ইতিহাস: ত্যাগ ও বিশ্বাসের মহাকাব্য'
  ],
  PRESET_STICKY_MEME: [
    'মানুষ কীভাবে প্রথম রাজা বানাল? (ক্ষমতা, ভয় ও সিংহাসনের আসল ইতিহাস)',
    'প্রস্তর যুগে টানা ৭ দিন বৃষ্টি হলে আদিম মানুষ কী করত?',
    'মানুষ কীভাবে টাকা ও ব্যাংকের ধারণা আবিষ্কার করল?',
    'ইতিহাসের সবচেয়ে অদ্ভুত যুদ্ধ: একটি বালতি নিয়ে দুই শহরের লড়াই!',
    'ফারাও সামটিকের অদ্ভুত পরীক্ষা: পৃথিবীর প্রথম ভাষা কোনটি?'
  ],
  PRESET_SIMPLE_HISTORY: [
    'পলাশীর যুদ্ধের গোপন নথি: ১৭৫৭ সালের ২৩ জুন আমবাগানে কী ঘটেছিল?',
    'রোমান সাম্রাজ্যের ১০০০ বছরের উত্থান ও পতনের সামরিক কৌশল',
    'নালন্দা মহাবিহারের ৯ তলা গ্রন্থাগার: ইতিহাসের প্রকৃত ঘটনা কী ছিল?',
    'স্পার্টানদের থার্মোপিলি প্রান্তর: ৩০০ যোদ্ধার রণকৌশল বিশ্লেষণ',
    'ফরাসি বিপ্লব ও বাস্তিল দুর্গের পতন: আধুনিক ইউরোপের জন্ম'
  ],
  PRESET_MYSTERY_NOIR: [
    'মায়া সভ্যতার আকস্মিক অন্তর্ধান: জঙ্গল কেন গিলে খেয়েছিল পুরো সাম্রাজ্য?',
    'জুলিয়াস সিজার হত্যাকাণ্ডের নেপথ্যে সিনেটের গোপন ষড়যন্ত্র',
    'টাইটানিকের অমীমাংসিত রহস্য: সেদিন রাতে ক্যালিফোর্নিয়ান জাহাজটি কেন সাড়া দেয়নি?',
    'ভয়নিচ পাণ্ডুলিপি: ৬০০ বছর ধরে যে বইয়ের একটি অক্ষরও কেউ পড়তে পারেনি',
    'বারমুডা ট্রায়াঙ্গেল নাকি সমুদ্রতলের মিথেন গ্যাস: বিজ্ঞান কী বলে?'
  ]
};
const VIDEO_RE = /\.(mp4|mov|webm|mkv)(\?|$)/i;
const TRACK_HEADER_W = 196;

/* Floating Lower-Third Character & Host Speaker Registry */
const SPEAKER_META = {
  TIME_CHRONICLER: {
    icon: '🎙️',
    cssClass: 'speaker-badge-host',
    bn: { name: 'সময়ের সাক্ষী', role: 'হোস্ট ও গল্পকথক' },
    en: { name: 'The Time Chronicler', role: 'Host & Storyteller' },
    hi: { name: 'समय का साक्षी', role: 'सूत्रधार एवं कहानीकार' },
  },
  HUNTER_CHIEF: {
    icon: '🏹',
    cssClass: 'speaker-badge-hunter',
    bn: { name: 'শিকারি প্রধান', role: 'আদিম কৌম নেতা' },
    en: { name: 'Hunter Chief', role: 'Egalitarian Leader' },
    hi: { name: 'शिकारी सरदार', role: 'शिकारी कबीला' },
  },
  WARLORD: {
    icon: '⚔️',
    cssClass: 'speaker-badge-warlord',
    bn: { name: 'লুগাল (যুদ্ধনেতা)', role: 'মেসোপটেমিয়ার প্রথম শাসক' },
    en: { name: 'Sumerian Warlord (Lugal)', role: 'First Ruler' },
    hi: { name: 'सुमेरियन युद्धनेता (लुगाल)', role: 'पहला शासक' },
  },
  PHARAOH_NARMER: {
    icon: '👑',
    cssClass: 'speaker-badge-host',
    bn: { name: 'ফারাও নারমার', role: 'মিশরের প্রথম ফারাও' },
    en: { name: 'Pharaoh Narmer', role: 'First Pharaoh of Egypt' },
    hi: { name: 'फ़राओ नार्मर', role: 'मिस्र का पहला सम्राट' },
  },
  PRESIDENT_PARIS: {
    icon: '🏛️',
    cssClass: 'speaker-badge-priest',
    bn: { name: 'প্যারিস ভাষাতত্ত্ব সভাপতি', role: '১৮৬৬ নিষেধাজ্ঞা সভা' },
    en: { name: 'Paris Linguistic President', role: '1866 Ban Decree' },
    hi: { name: 'पेरिस भाषाविज्ञान अध्यक्ष', role: '1866 प्रतिबंध सभा' },
  },
  NARRATOR: {
    icon: '📜',
    cssClass: 'speaker-badge-narrator',
    bn: { name: 'ইতিহাস কথক', role: 'মূল ধারাভাষ্য' },
    en: { name: 'Historical Narrator', role: 'Documentary Voice' },
    hi: { name: 'इतिहास वाचक', role: 'मुख्य कथावाचक' },
  },
};

const TRACK_DEFS = [
  { id: 'fx', icon: 'sparkles', label: 'FX & Motion', badgeColor: 'text-purple-400', defaultH: 34 },
  { id: 'video', icon: 'video', label: 'Video Track (AI)', badgeColor: 'text-indigo-400', defaultH: 50 },
  { id: 'image', icon: 'image', label: 'Image Track', badgeColor: 'text-sky-400', defaultH: 50 },
  { id: 'voice', icon: 'mic', label: 'Voiceover Audio', badgeColor: 'text-emerald-400', defaultH: 48 },
  { id: 'sfx', icon: 'volume-2', label: 'SFX Cues', badgeColor: 'text-amber-400', defaultH: 34 },
  { id: 'bgm', icon: 'music', label: 'BGM Soundtrack', badgeColor: 'text-pink-400', defaultH: 42 },
];

const S = {
  id: null,
  data: null,
  project: null,
  sel: 0,
  selTrack: 'image',
  selBgmIdx: 0,
  previewLang: 'bn',
  narLang: 'bn',
  dirty: false,
  playing: false,
  t: 0,
  clock0: 0,
  frameKey: null,
  es: null,
  zoom: 12, // pixels per second on NLE timeline (supports fractional 0.2..50)
  tool: 'select', // 'select' | 'razor'
  trackSizeMode: 'normal', // 'compact' | 'normal' | 'expanded'
  studioMode: 'master', // 'master' (16:9) | 'shorts' (9:16)
  leftMode: 'clips', // 'clips' | 'shorts' | 'fxquick' | 'overlays'
  activeShortIdx: 0,
  shortPlayEndT: null,
  shortsDock: 'center', // 'left' | 'center' | 'right'
  showAll3LangTracks: false,
  hoverFx: null, // { kind: 'motion'|'vfx', id: string }
  lastTextCardSceneKey: null,
  undoStack: [],
  redoStack: [],
};

/* ------------------------------------------------------------ utilities */
const fmt = (t) => {
  t = Math.max(0, t || 0);
  const m = Math.floor(t / 60);
  return `${m}:${(t - m * 60).toFixed(1).padStart(4, '0')}`;
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dbToLin = (db) => Math.min(1, Math.pow(10, db / 20));
const icons = () => window.lucide && lucide.createIcons();

function pushHistory() {
  if (!S.project) return;
  const snap = JSON.stringify(S.project);
  if (S.undoStack.length && S.undoStack[S.undoStack.length - 1] === snap) return;
  S.undoStack.push(snap);
  if (S.undoStack.length > 40) S.undoStack.shift();
  S.redoStack = [];
}
function undo() {
  if (!S.undoStack.length || !S.project) return toast('Nothing to undo');
  S.redoStack.push(JSON.stringify(S.project));
  S.project = JSON.parse(S.undoStack.pop());
  markDirty();
  recompute();
  renderAll();
  toast('Undo applied');
}
function redo() {
  if (!S.redoStack.length || !S.project) return toast('Nothing to redo');
  S.undoStack.push(JSON.stringify(S.project));
  S.project = JSON.parse(S.redoStack.pop());
  markDirty();
  recompute();
  renderAll();
  toast('Redo applied');
}

const sceneDur = (s, lang = S.previewLang) => (s?.language_durations && s.language_durations[lang]) || s?.duration || 4;
const total = () => {
  const sc = getScenes(S.previewLang);
  if (!sc.length) return 0;
  return Math.max(...sc.map((s) => s.timestamp_end), 1);
};
const getScenes = (lang = S.previewLang) => {
  let t = 0;
  const isFree = S.project?.timeline_mode === 'free';
  return (S.project?.scenes || []).map((s) => {
    const d = Math.max(0.5, +Number(sceneDur(s, lang) || 4).toFixed(2));
    const st = (isFree && typeof s.custom_start === 'number') ? +s.custom_start.toFixed(2) : +t.toFixed(2);
    const en = +(st + d).toFixed(2);
    t = Math.max(t, en);
    return { ...s, duration: d, timestamp_start: st, timestamp_end: en };
  });
};
const scene = () => S.project?.scenes[S.sel];

const GEMINI_VOICE_NAMES_RX = /\b(Cruz|Charon|Orus|Enceladus|Rasalgethi|Sadaltager|Iapetus|Achird|Fenrir|Algenib|Algieba|Alnilam|Puck|Sadachbia|Schedar|Umbriel|Zubenelgenubi|Bodi|Koda|Kore|Aoede|Gacrux|Erinome|Despina|Autonoe|Callirrhoe|Sulafat|Pulcherrima|Laomedeia|Zephyr|Leda|Vindemiatrix|Achernar|কারন|ক্রুজ|ফেনরির|পাক|ওরাস)\b/gi;

function stripGeminiVoiceName(str) {
  if (!str) return '';
  return String(str)
    .replace(/[\s·|\-–—]*🔊\s*[A-Za-z\u0980-\u09FF\u0900-\u097F0-9_]+/gi, '')
    .replace(/\s*[\(\[\{]\s*(?:voice\s*[:\-]?\s*)?[A-Za-z]+\s*[\)\]\}]/gi, (m) => GEMINI_VOICE_NAMES_RX.test(m) ? '' : m)
    .replace(/[\s·|\-–—]+(?:voice\s*[:\-]?\s*)?(?:Cruz|Charon|Orus|Enceladus|Rasalgethi|Sadaltager|Iapetus|Achird|Fenrir|Algenib|Algieba|Alnilam|Puck|Sadachbia|Schedar|Umbriel|Zubenelgenubi|Bodi|Koda|Kore|Aoede|Gacrux|Erinome|Despina|Autonoe|Callirrhoe|Sulafat|Pulcherrima|Laomedeia|Zephyr|Leda|Vindemiatrix|Achernar|কারন|ক্রুজ|ফেনরির)\b/gi, '')
    .trim();
}

function updateSpeakerBadge(speakerKey, lang = S.previewLang, curScene = null) {
  const badge = $('pvSpeakerBadge');
  if (!badge) return;
  if (curScene?.hide_speaker_badge || S.studioMode === 'shorts') {
    badge.classList.add('hidden');
    return;
  }
  const key = speakerKey || 'NARRATOR';
  const projChar = (S.project?.characters || []).find((c) => c.id === key);
  let icon = '🎙️', cssClass = 'speaker-badge-character', name = key, role = 'Character';
  if (projChar) {
    icon = projChar.icon || '🎙️';
    cssClass = projChar.badge_class || 'speaker-badge-character';
    name = projChar[`name_${lang}`] || projChar.name_bn || projChar.name_en || key;
    role = projChar[`role_${lang}`] || projChar.role_bn || projChar.role_en || '';
  } else {
    const meta = SPEAKER_META[key] || {
      icon: '🎙️',
      cssClass: 'speaker-badge-character',
      bn: { name: key, role: 'চরিত্র' },
      en: { name: key, role: 'Character' },
      hi: { name: key, role: 'पात्र' },
    };
    const langMeta = meta[lang] || meta.bn || meta.en;
    icon = meta.icon;
    cssClass = meta.cssClass;
    name = langMeta.name;
    role = langMeta.role;
  }
  badge.className = `speaker-badge-container ${cssClass}`;
  name = stripGeminiVoiceName(name) || key;
  role = stripGeminiVoiceName(role);
  $('pvSpeakerIcon').textContent = icon;
  $('pvSpeakerName').textContent = name;
  if (role) {
    $('pvSpeakerRole').textContent = role;
    $('pvSpeakerRole').style.display = '';
  } else {
    $('pvSpeakerRole').textContent = '';
    $('pvSpeakerRole').style.display = 'none';
  }
  badge.classList.remove('hidden');
}

const withCacheBust = (u, mtime) => {
  if (!u) return null;
  if (String(u).startsWith('data:') || String(u).startsWith('blob:')) return u;
  const clean = '/' + String(u).replace(/^\//, '');
  if (window.CANVAS_REF_IMAGES && window.CANVAS_REF_IMAGES[clean]) return window.CANVAS_REF_IMAGES[clean];
  return `${u}?v=${Math.round(mtime || 1)}`;
};
const resolveRefUrl = (u) => {
  const fallbackKey = '/references/mascot_logo_ref.jpg';
  if (!u) return (window.CANVAS_REF_IMAGES && window.CANVAS_REF_IMAGES[fallbackKey]) || fallbackKey;
  if (String(u).startsWith('data:') || String(u).startsWith('blob:') || String(u).startsWith('http')) return u;
  const clean = '/' + String(u).replace(/^\//, '');
  if (window.CANVAS_REF_IMAGES && window.CANVAS_REF_IMAGES[clean]) return window.CANVAS_REF_IMAGES[clean];
  return clean;
};

async function api(method, url, body) {
  if (window.CANVAS_STANDALONE_MODE && typeof window.CANVAS_API_FALLBACK === 'function') {
    return window.CANVAS_API_FALLBACK(method, url, body);
  }
  try {
    const opt = { method, headers: {} };
    if (body instanceof FormData) opt.body = body;
    else if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    const r = await fetch(url, opt);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  } catch (err) {
    if (typeof window.CANVAS_API_FALLBACK === 'function') {
      return window.CANVAS_API_FALLBACK(method, url, body);
    }
    throw err;
  }
}

let toastT;
function toast(msg, kind = 'ok') {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = el.className.replace(/ring-\S+/g, '') + (kind === 'err' ? ' ring-red-500/50' : ' ring-amber-500/40');
  el.style.opacity = 1;
  clearTimeout(toastT);
  toastT = setTimeout(() => (el.style.opacity = 0), 2600);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text || ''); } catch (e) { const ta = document.createElement('textarea'); ta.value = text || ''; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  toast('Copied to clipboard');
}

function recompute() {
  if (!S.project) return;
  let t = 0;
  const isFree = S.project.timeline_mode === 'free';
  for (const s of S.project.scenes) {
    s.duration = Math.max(0.5, +Number(s.duration || 4).toFixed(2));
    if (isFree && typeof s.custom_start === 'number' && s.custom_start >= 0) {
      s.timestamp_start = +s.custom_start.toFixed(2);
      s.timestamp_end = +(s.timestamp_start + s.duration).toFixed(2);
      t = Math.max(t, s.timestamp_end);
    } else {
      s.timestamp_start = +t.toFixed(2);
      t += s.duration;
      s.timestamp_end = +t.toFixed(2);
      s.custom_start = s.timestamp_start;
    }
  }
  S.project.total_duration_seconds = +t.toFixed(2);
  // Also recompute language_total_durations
  S.project.language_total_durations = S.project.language_total_durations || {};
  for (const l of Object.keys(LANGS)) {
    const scs = getScenes(l);
    S.project.language_total_durations[l] = scs.length ? +Math.max(...scs.map((x) => x.timestamp_end)).toFixed(2) : 0;
  }
  if (!Array.isArray(S.project.bgm_clips) || !S.project.bgm_clips.length) {
    S.project.bgm_clips = [{
      id: 'bgm_clip_1',
      title: 'Era BGM Soundtrack (audio/bgm.mp3)',
      file: 'audio/bgm.mp3',
      start_time: 0,
      duration: Math.max(30, S.project.total_duration_seconds || 60),
      trim_in: 0,
      volume_db: -20,
      ducking: true,
      fade_in: 1.5,
      fade_out: 2.5,
      loop: true,
    }];
  }
  if (!S.project.tracks_config) {
    S.project.tracks_config = {};
  }
  TRACK_DEFS.forEach((td) => {
    if (!S.project.tracks_config[td.id]) {
      S.project.tracks_config[td.id] = { id: td.id, name: td.label, muted: false, locked: false, visible: true };
    }
  });
}

function markDirty() { S.dirty = true; $('dirtyDot')?.classList.remove('hidden'); }
function clearDirty() { S.dirty = false; $('dirtyDot')?.classList.add('hidden'); }

function assetUrl(s) {
  if (!s) return null;
  const a = S.data?.assets?.[s.scene_id];
  return a ? withCacheBust(a.url, a.mtime) : null;
}
function posterUrl(s) {
  if (!s) return resolveRefUrl('/references/ref_style_2_simple_history.jpg');
  const a = S.data?.assets?.[s.scene_id];
  return a?.posterUrl ? withCacheBust(a.posterUrl, a.mtime) : (assetUrl(s) || resolveRefUrl('/references/ref_style_2_simple_history.jpg'));
}
function partAudioObj(s, lang = S.previewLang) {
  return S.data?.partAudioClips?.[s.scene_id]?.[lang] || s?.audio_clips?.[lang] || null;
}

/* ------------------------------------------------------------ loading */
async function loadProjects(selectId) {
  const list = await api('GET', '/api/projects');
  const sel = $('projectSelect');
  sel.innerHTML = list.length
    ? list.map((p) => `<option value="${esc(p.id)}">${esc(p.title)} · ${p.scenes} parts · ${fmt(p.duration)}</option>`).join('')
    : '<option value="">No projects in /projects</option>';
  const id = selectId || (() => { try { return localStorage.getItem('si_project'); } catch (e) { return null; } })() || list[0]?.id;
  if (id && list.some((p) => p.id === id)) { sel.value = id; await loadProject(id); }
}

async function loadProject(id, keepSel = false) {
  stop();
  S.id = id;
  try { localStorage.setItem('si_project', id); } catch (e) {}
  S.data = await api('GET', `/api/project/${id}`);
  S.project = S.data.project;
  recompute();
  if (!keepSel) { S.sel = 0; S.t = 0; S.undoStack = []; S.redoStack = []; }
  S.sel = Math.max(0, Math.min(S.sel, (S.project.scenes.length || 1) - 1));
  S.frameKey = null;
  clearDirty();

  const pb = $('presetBadge');
  pb.textContent = PRESET_LABEL[S.project.style_preset] || S.project.style_preset || '';
  pb.classList.toggle('hidden', !S.project.style_preset);

  const motions = S.data.motions || Object.keys(MOTION_LABEL);
  $('fMotion').innerHTML = motions.map((m) => `<option value="${m}">${MOTION_LABEL[m] || m}</option>`).join('');

  const vfxList = S.data.vfxEffects || Object.keys(VFX_LABEL);
  if ($('fVfx')) {
    $('fVfx').innerHTML = vfxList.map((v) => `<option value="${v}">${VFX_LABEL[v] || v}</option>`).join('');
  }
  const afxList = S.data.audioEffects || Object.keys(AUDIO_FX_LABEL);
  if ($('fAudioFx')) {
    $('fAudioFx').innerHTML = afxList.map((a) => `<option value="${a}">${AUDIO_FX_LABEL[a] || a}</option>`).join('');
  }
  const voices = S.data.aistudioVoices || FALLBACK_VOICES;
  if ($('fAiVoice')) {
    $('fAiVoice').innerHTML = voices.map((v) => `<option value="${v.id}">${v.id} (${v.gender} · ${v.age}) — ${v.bestFor}</option>`).join('');
  }
  const sfxLib = S.data.sfxLibrary || [];
  if ($('fSfxSelect')) {
    $('fSfxSelect').innerHTML = `<option value="">-- 5-Layer SFX Preset --</option>` +
      sfxLib.map((x) => `<option value="${x.id}">${x.label}</option>`).join('');
  }
  if ($('wizCategory')) {
    const presets = S.data.stylePresets || {};
    const keys = Object.keys(PRESET_LABEL);
    $('wizCategory').innerHTML = keys.map((k) => `<option value="${k}" ${k === S.project.style_preset ? 'selected' : ''}>${PRESET_LABEL[k]} ${presets[k]?.bn_name ? `(${presets[k].bn_name})` : ''}</option>`).join('');
  }

  updateModeButton();
  setPreviewAudio();
  renderAll();
  connectRenderStream();
}

async function save() {
  if (!S.project) return;
  try {
    recompute();
    S.project = await api('PUT', `/api/project/${S.id}`, S.project);
    clearDirty();
    toast('Project & Multi-Track Timeline saved');
  } catch (e) { toast(e.message, 'err'); throw e; }
}

async function syncPartsFromFolders() {
  if (!S.id) return;
  try {
    toast('Scanning parts/ & audio/raw/ folders...');
    const res = await api('POST', `/api/project/${S.id}/auto-sync`, {});
    await loadProject(S.id, true);
    toast(`Auto-Synced ${res.scenesCount} parts (${fmt(res.totalDuration)})`);
  } catch (e) { toast(e.message, 'err'); }
}

/* ------------------------------------------------------------ rendering UI */

/* ==================== PANEL 1B: 120+ TRANSITIONS & VFX VISUAL BROWSER ==================== */
let activeFxTab = 'motions'; // 'motions' | 'vfx'

function populateFxCategoryDropdown() {
  const sel = $('fxCategoryFilter');
  if (!sel) return;
  const map = activeFxTab === 'motions' ? MOTION_CATEGORY_MAP : VFX_CATEGORY_MAP;
  const cats = [...new Set(Object.values(map))];
  sel.innerHTML = `<option value="ALL">All Categories (${Object.keys(map).length})</option>` +
    cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
}

function renderFxBrowser() {
  const grid = $('fxBrowserGrid');
  if (!grid) return;
  const s = scene();
  if ($('fxTargetClipLabel') && s) {
    $('fxTargetClipLabel').textContent = `Part #${S.sel + 1} (Scene ${s.scene_id})`;
  }
  const catFilter = $('fxCategoryFilter')?.value || 'ALL';
  const q = ($('fxSearchInput')?.value || '').trim().toLowerCase();
  const isMotion = activeFxTab === 'motions';
  const dict = isMotion ? MOTION_LABEL : VFX_LABEL;
  const catMap = isMotion ? MOTION_CATEGORY_MAP : VFX_CATEGORY_MAP;
  const curVal = isMotion ? (s?.motion_effect || 'static') : (s?.vfx_effect || 'none');

  const entries = Object.entries(dict).filter(([id, label]) => {
    const cat = catMap[id] || 'Other';
    if (catFilter !== 'ALL' && cat !== catFilter) return false;
    if (q && !id.toLowerCase().includes(q) && !label.toLowerCase().includes(q) && !cat.toLowerCase().includes(q)) return false;
    return true;
  });

  const curThumb = (s && posterUrl(s)) || '/references/ref_style_2_simple_history.jpg';
  grid.innerHTML = entries.map(([id, label], idx) => {
    const cat = catMap[id] || 'Pro Preset';
    const isAct = id === curVal;
    const vfxCls = !isMotion ? `vfx-${id}` : '';
    return `
      <div class="fx-card ${isAct ? 'active' : ''}" data-fx-apply="${esc(id)}" data-fx-kind="${isMotion ? 'motion' : 'vfx'}">
        <div class="fx-mini-preview">
          <img src="${curThumb}" class="fx-mini-preview-inner object-cover ${vfxCls}" loading="lazy" alt="" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1">
            <span class="text-[9px] font-mono px-1 py-0.1 rounded ${isMotion ? 'bg-indigo-500/25 text-indigo-300' : 'bg-purple-500/25 text-purple-300'}">#${idx + 1}</span>
            <span class="text-[9px] text-slate-400 truncate">${esc(cat)}</span>
          </div>
          <div class="text-[11px] font-semibold text-slate-100 truncate mt-0.5">${esc(label)}</div>
        </div>
        <span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold ${isAct ? 'bg-brand-500 text-black' : 'bg-white/5 text-slate-300'}">${isAct ? 'ACTIVE' : 'Apply'}</span>
      </div>
    `;
  }).join('');
  renderLeftQuickFxList();
}

function renderAll() {
  renderSceneList();
  renderShortsPartsList();
  renderMultiTrackTimeline();
  renderInspector();
  renderOverlaysPanel();
  renderAudioRows();
  renderSfxQuickGrid();
  renderLaunch();
  renderShortsThumbnailsGallery();
  renderOutputs();
  renderCharactersPanel();
  renderWorkflowWizard();
  renderFxBrowser();
  resizeStageToFit();
  showFrame(S.t);
  icons();
}

function renderSceneList() {
  const scenes = getScenes();
  $('sceneStats').textContent = `${scenes.length} parts · ${fmt(total())} (${LANGS[S.previewLang]})`;

  const readyCount = scenes.filter((s) => {
    const pa = partAudioObj(s, S.previewLang);
    return pa && (pa.status === 'ready' || pa.status === 'virtual_segment');
  }).length;
  if ($('partAudioReadyBadge')) {
    $('partAudioReadyBadge').textContent = `🎙️ ${readyCount}/${scenes.length} Audio Clips`;
  }

  $('sceneList').innerHTML = scenes.map((s, i) => {
    const orig = S.project.scenes[i];
    const url = assetUrl(orig);
    const pUrl = posterUrl(orig);
    const isVid = (url && VIDEO_RE.test(url)) || orig.type === 'DYNAMIC_AI_VIDEO';
    const thumb = !url
      ? `<div class="scene-thumb grid place-items-center text-slate-600"><i data-lucide="image-off" class="w-4 h-4"></i></div>`
      : (url && VIDEO_RE.test(url))
      ? `<video class="scene-thumb" src="${url}#t=0.5" poster="${pUrl || ''}" muted preload="metadata"></video>`
      : `<img class="scene-thumb" src="${url}" loading="lazy" />`;
    const txt = orig.narration?.[S.previewLang] || orig.narration?.en || '';
    const pa = partAudioObj(orig, S.previewLang);
    const audName = pa?.file ? pa.file.split('/').pop() : `audio/${S.previewLang}/scene_${String(orig.scene_id).padStart(4, '0')}.wav`;

    return `<div class="scene-card ${i === S.sel ? 'active' : ''}" data-i="${i}" draggable="true">
      ${thumb}
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5 text-[10.5px]">
          <span class="font-mono font-bold text-brand-400">#${i + 1}</span>
          <span class="text-slate-400 font-mono">${s.duration.toFixed(1)}s</span>
          ${isVid ? '<span class="px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[9.5px]">VIDEO</span>' : '<span class="px-1 py-0.2 rounded bg-sky-500/15 text-sky-300 font-semibold text-[9.5px]">IMAGE</span>'}
          <span class="ml-auto text-[9px] text-emerald-400 font-mono truncate max-w-[75px]" title="${esc(audName)}">🎙️ ${esc(audName)}</span>
        </div>
        <div class="text-[10px] text-slate-500 truncate">${esc(orig.dialogue_speaker || 'NARRATOR')} · ${esc(MOTION_LABEL[orig.motion_effect] || orig.motion_effect)}</div>
        <div class="text-[11.5px] text-slate-300 leading-snug line-clamp-2">${esc(txt)}</div>
      </div>
    </div>`;
  }).join('');
}

/* ==================== CAPCUT / FILMORA MULTI-TRACK TIMELINE ==================== */
function deterministicWaveformSvg(seedStr, barsCount = 28, color = 'rgba(110, 231, 183, 0.7)') {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const bars = [];
  const step = 100 / barsCount;
  for (let b = 0; b < barsCount; b++) {
    h ^= (b + 17) * 2654435761;
    const amp = 20 + (Math.abs(h) % 72);
    const y = 50 - amp / 2;
    bars.push(`<rect x="${(b * step + 0.4).toFixed(1)}%" y="${y.toFixed(1)}%" width="${Math.max(0.9, step * 0.58).toFixed(1)}%" height="${amp.toFixed(1)}%" rx="1" fill="${color}" />`);
  }
  return `<svg class="absolute inset-0 w-full h-full pointer-events-none opacity-65" preserveAspectRatio="none">${bars.join('')}</svg>`;
}

function getTrackHeight(defH) {
  if (S.trackSizeMode === 'compact') return Math.max(26, Math.round(defH * 0.72));
  if (S.trackSizeMode === 'expanded') return Math.round(defH * 1.32);
  return defH;
}

function renderMultiTrackTimeline() {
  const T = Math.max(total(), 10);
  const pxPerSec = Math.max(0.2, Number(S.zoom) || 12);
  const scrollAvailW = Math.max(400, ($('nleScrollContainer')?.clientWidth || 900) - TRACK_HEADER_W - 8);
  const laneWidth = Math.max(scrollAvailW, Math.ceil((T + 3) * pxPerSec));
  const scenes = getScenes();

  $('tTot').textContent = fmt(total());
  if ($('zoomReadout')) $('zoomReadout').textContent = `${pxPerSec < 10 ? pxPerSec.toFixed(1) : Math.round(pxPerSec)} px/s`;
  if ($('timelineActiveLangIndicator')) {
    $('timelineActiveLangIndicator').textContent = S.showAll3LangTracks
      ? '🎙️ Audio: BN · EN · HI (3 Lanes)'
      : `🎙️ Audio: ${LANGS[S.previewLang]} (${S.previewLang.toUpperCase()})`;
  }
  if ($('timelineShortsIndicator')) {
    $('timelineShortsIndicator').textContent = S.studioMode === 'shorts'
      ? `📱 9:16 Short #${S.activeShortIdx + 1}`
      : '📺 16:9 Master';
  }

  // 1. Render Ruler
  const ruler = $('nleRuler');
  ruler.style.width = `${laneWidth}px`;
  let tickStep = 5;
  if (pxPerSec >= 35) tickStep = 1;
  else if (pxPerSec >= 18) tickStep = 2;
  else if (pxPerSec >= 8) tickStep = 5;
  else if (pxPerSec >= 3.5) tickStep = 15;
  else if (pxPerSec >= 1.5) tickStep = 30;
  else if (pxPerSec >= 0.7) tickStep = 60;
  else tickStep = 120;

  const ticksHtml = [];
  const maxSec = Math.ceil(T + 15);
  for (let sec = 0; sec <= maxSec; sec += tickStep) {
    const leftPx = sec * pxPerSec;
    ticksHtml.push(
      `<div class="absolute top-0 bottom-0 border-l border-white/20 pl-1 text-[9.5px] font-mono text-slate-400 leading-5" style="left:${leftPx}px">${fmt(sec)}</div>`
    );
    // Sub-ticks
    const subStep = tickStep / 5;
    if (subStep * pxPerSec >= 6) {
      for (let k = 1; k < 5; k++) {
        ticksHtml.push(
          `<div class="absolute bottom-0 h-1.5 border-l border-white/10" style="left:${(sec + k * subStep) * pxPerSec}px"></div>`
        );
      }
    }
  }
  ruler.innerHTML = ticksHtml.join('');

  // 2. Render 6 Independent Tracks
  const container = $('nleTracksContainer');
  const tc = S.project?.tracks_config || {};

  const effectiveTrackDefs = [];
  TRACK_DEFS.forEach((td) => {
    if (td.id === 'voice' && S.showAll3LangTracks) {
      effectiveTrackDefs.push(
        { id: 'voice', langKey: 'bn', icon: 'mic', label: '🇧🇩 Voiceover (বাংলা)', badgeColor: 'text-emerald-400', defaultH: 42 },
        { id: 'voice', langKey: 'en', icon: 'mic', label: '🌍 Voiceover (English)', badgeColor: 'text-sky-400', defaultH: 42 },
        { id: 'voice', langKey: 'hi', icon: 'mic', label: '🇮🇳 Voiceover (हिंदी)', badgeColor: 'text-amber-400', defaultH: 42 }
      );
    } else {
      effectiveTrackDefs.push({ ...td, langKey: S.previewLang });
    }
  });

  const rowsHtml = effectiveTrackDefs.map((td) => {
    const cfg = tc[td.id] || { muted: false, locked: false, visible: true };
    const h = getTrackHeight(td.defaultH);
    const clipsHtml = [];

    if (cfg.visible !== false) {
      if (td.id === 'fx') {
        scenes.forEach((s, i) => {
          const orig = S.project.scenes[i];
          const fx = orig.motion_effect || 'static';
          const left = s.timestamp_start * pxPerSec;
          const width = Math.max(5, s.duration * pxPerSec);
          const isSel = S.sel === i && S.selTrack === 'fx';
          clipsHtml.push(`
            <div class="nle-clip track-fx ${isSel ? 'selected' : ''}" data-track="fx" data-i="${i}" style="left:${left}px;width:${width}px;" title="FX #${i + 1}: ${esc(MOTION_LABEL[fx] || fx)} (${s.duration.toFixed(1)}s)">
              <div class="nle-handle nle-handle-l" data-resize="l"></div>
              <div class="px-2 truncate text-[10px] font-medium flex items-center gap-1">
                <span>✨</span>
                <span class="font-mono font-bold">#${i + 1}</span>
                <span>${esc(MOTION_LABEL[fx] || fx)}</span>
              </div>
              <div class="nle-handle nle-handle-r" data-resize="r"></div>
            </div>
          `);
        });
      } else if (td.id === 'video') {
        scenes.forEach((s, i) => {
          const orig = S.project.scenes[i];
          const url = assetUrl(orig);
          const isVid = (url && VIDEO_RE.test(url)) || orig.type === 'DYNAMIC_AI_VIDEO';
          if (!isVid) return; // Static images appear on the Image Track below!
          const pUrl = posterUrl(orig);
          const left = s.timestamp_start * pxPerSec;
          const width = Math.max(6, s.duration * pxPerSec);
          const isSel = S.sel === i && S.selTrack === 'video';
          const bg = pUrl ? `background-image:linear-gradient(to right, rgba(30,27,75,0.72), rgba(49,46,129,0.55)), url('${pUrl}');background-size:cover;background-position:center;` : '';
          clipsHtml.push(`
            <div class="nle-clip track-video ${isSel ? 'selected' : ''}" data-track="video" data-i="${i}" style="left:${left}px;width:${width}px;${bg}" title="Video Clip #${i + 1}: ${esc(orig.asset_file || 'AI Video')} (${s.duration.toFixed(1)}s)">
              <div class="nle-handle nle-handle-l" data-resize="l"></div>
              <div class="px-2 min-w-0 flex-1 flex flex-col justify-center leading-tight">
                <div class="flex items-center gap-1 text-[10.5px] font-semibold truncate">
                  <span class="px-1 rounded bg-indigo-500/40 text-[9px] font-mono">#${i + 1} AI CLIP</span>
                  <span class="truncate">${esc((orig.asset_file || '').split('/').pop() || `clip_${orig.scene_id}.mp4`)}</span>
                </div>
                <div class="text-[9.5px] text-indigo-200/80 font-mono truncate">${s.duration.toFixed(1)}s · ${esc(orig.dialogue_speaker || 'NARRATOR')}</div>
              </div>
              <div class="nle-handle nle-handle-r" data-resize="r"></div>
            </div>
          `);
        });
      } else if (td.id === 'image') {
        scenes.forEach((s, i) => {
          const orig = S.project.scenes[i];
          const url = assetUrl(orig);
          const isVid = (url && VIDEO_RE.test(url)) || orig.type === 'DYNAMIC_AI_VIDEO';
          if (isVid) return; // Video clips appear on the Video Track above!
          const pUrl = posterUrl(orig);
          const left = s.timestamp_start * pxPerSec;
          const width = Math.max(6, s.duration * pxPerSec);
          const isSel = S.sel === i && (S.selTrack === 'image' || !S.selTrack);
          const bg = pUrl ? `background-image:linear-gradient(to right, rgba(12,74,110,0.72), rgba(14,116,144,0.5)), url('${pUrl}');background-size:cover;background-position:center;` : '';
          clipsHtml.push(`
            <div class="nle-clip track-image ${isSel ? 'selected' : ''}" data-track="image" data-i="${i}" style="left:${left}px;width:${width}px;${bg}" title="Image Clip #${i + 1}: ${esc(orig.asset_file || 'Static Image')} (${s.duration.toFixed(1)}s)">
              <div class="nle-handle nle-handle-l" data-resize="l"></div>
              <div class="px-2 min-w-0 flex-1 flex flex-col justify-center leading-tight">
                <div class="flex items-center gap-1 text-[10.5px] font-semibold truncate">
                  <span class="px-1 rounded bg-sky-500/40 text-[9px] font-mono">#${i + 1} IMG</span>
                  <span class="truncate">${esc((orig.asset_file || '').split('/').pop() || `shot_${orig.scene_id}.jpg`)}</span>
                </div>
                <div class="text-[9.5px] text-sky-100/80 font-mono truncate">${s.duration.toFixed(1)}s · ${esc(MOTION_LABEL[orig.motion_effect] || 'Static')}</div>
              </div>
              <div class="nle-handle nle-handle-r" data-resize="r"></div>
            </div>
          `);
        });
      } else if (td.id === 'voice') {
        const laneLang = td.langKey || S.previewLang;
        scenes.forEach((s, i) => {
          const orig = S.project.scenes[i];
          const pa = partAudioObj(orig, laneLang);
          const left = s.timestamp_start * pxPerSec;
          const width = Math.max(6, s.duration * pxPerSec);
          const isSel = S.sel === i && S.selTrack === 'voice' && laneLang === S.previewLang;
          const fileName = pa?.file ? pa.file.split('/').pop() : `scene_${String(orig.scene_id).padStart(4, '0')}.wav`;
          const barsCount = Math.max(4, Math.min(48, Math.floor(width / 6)));
          const waveSvg = deterministicWaveformSvg(`${laneLang}_${orig.scene_id}_${orig.narration?.[laneLang] || ''}`, barsCount, 'rgba(52, 211, 153, 0.45)');
          const volDb = orig.audio_clips?.[laneLang]?.volume_db ?? 0;

          clipsHtml.push(`
            <div class="nle-clip track-voice ${isSel ? 'selected' : ''}" data-track="voice" data-voice-lang="${laneLang}" data-i="${i}" style="left:${left}px;width:${width}px;" title="Part #${i + 1} Audio [${laneLang.toUpperCase()}]: audio/${laneLang}/${esc(fileName)} (${s.duration.toFixed(1)}s)">
              ${waveSvg}
              <div class="nle-handle nle-handle-l" data-resize="l"></div>
              <div class="relative z-10 px-1.5 min-w-0 flex-1 flex flex-col justify-center leading-tight">
                <div class="flex items-center gap-1 text-[10px] font-semibold truncate">
                  <span class="px-1 rounded bg-emerald-500/35 text-[8.5px] font-mono">${laneLang.toUpperCase()} #${i + 1}</span>
                  <span class="truncate">${esc(fileName)}</span>
                  ${volDb !== 0 ? `<span class="text-[9px] text-amber-300 font-mono">${volDb > 0 ? '+' : ''}${volDb}dB</span>` : ''}
                </div>
                <div class="text-[9px] text-emerald-100/90 truncate">${esc(orig.narration?.[laneLang] || '')}</div>
              </div>
              <div class="nle-handle nle-handle-r" data-resize="r"></div>
            </div>
          `);
        });
      } else if (td.id === 'sfx') {
        scenes.forEach((s, i) => {
          const orig = S.project.scenes[i];
          if (!orig.sfx) return;
          const left = s.timestamp_start * pxPerSec;
          const sfxDur = Math.min(s.duration, Math.max(2.0, +(s.duration * 0.65).toFixed(1)));
          const width = Math.max(6, sfxDur * pxPerSec);
          const isSel = S.sel === i && S.selTrack === 'sfx';
          clipsHtml.push(`
            <div class="nle-clip track-sfx ${isSel ? 'selected' : ''}" data-track="sfx" data-i="${i}" style="left:${left}px;width:${width}px;" title="SFX #${i + 1}: ${esc(orig.sfx)}">
              <div class="nle-handle nle-handle-l" data-resize="l"></div>
              <div class="px-2 truncate text-[10px] font-medium flex items-center gap-1">
                <span>🔊</span>
                <span class="font-mono font-bold">#${i + 1}</span>
                <span>${esc(orig.sfx)}</span>
              </div>
              <div class="nle-handle nle-handle-r" data-resize="r"></div>
            </div>
          `);
        });
      } else if (td.id === 'bgm') {
        const bgmClips = S.project?.bgm_clips || [];
        bgmClips.forEach((bClip, bIdx) => {
          const left = (bClip.start_time || 0) * pxPerSec;
          const dur = Math.max(2, bClip.duration || total() || 30);
          const width = Math.max(30, dur * pxPerSec);
          const isSel = S.selTrack === 'bgm' && S.selBgmIdx === bIdx;
          const barsCount = Math.max(16, Math.min(120, Math.floor(width / 10)));
          const waveSvg = deterministicWaveformSvg(`bgm_${bClip.id}_${bIdx}`, barsCount, 'rgba(244, 114, 182, 0.35)');
          clipsHtml.push(`
            <div class="nle-clip track-bgm ${isSel ? 'selected' : ''}" data-track="bgm" data-bgm-i="${bIdx}" style="left:${left}px;width:${width}px;" title="BGM Segment #${bIdx + 1}: ${esc(bClip.title)} (${fmt(bClip.start_time)} – ${fmt(bClip.start_time + dur)}, ${bClip.volume_db ?? -20} dB)">
              ${waveSvg}
              <div class="nle-handle nle-handle-l" data-resize="l"></div>
              <div class="relative z-10 px-2.5 min-w-0 flex-1 flex items-center justify-between gap-2 text-[10.5px]">
                <div class="flex items-center gap-1.5 truncate font-semibold">
                  <span>🎵 BGM #${bIdx + 1}: ${esc(bClip.title || 'Soundtrack')}</span>
                  <span class="px-1.5 py-0.2 rounded bg-pink-500/30 text-[9.5px] font-mono">${bClip.volume_db ?? -20} dB</span>
                  ${bClip.ducking !== false ? '<span class="px-1.5 py-0.2 rounded bg-emerald-500/25 text-emerald-200 text-[9px]">Auto-Duck ON</span>' : ''}
                </div>
                <span class="font-mono text-[9.5px] text-pink-200/80 shrink-0">${fmt(bClip.start_time)} – ${fmt(bClip.start_time + dur)} (${dur.toFixed(1)}s)</span>
              </div>
              <div class="nle-handle nle-handle-r" data-resize="r"></div>
            </div>
          `);
        });
      }
    }

    return `
      <div class="nle-track-row ${cfg.muted ? 'muted' : ''} ${cfg.locked ? 'locked' : ''}" data-track-row="${td.id}" style="height:${h}px;">
        <div class="nle-track-header">
          <div class="flex items-center gap-1.5 min-w-0">
            <i data-lucide="${td.icon}" class="w-3.5 h-3.5 ${td.badgeColor} shrink-0"></i>
            <span class="text-[11px] font-semibold text-slate-300 truncate">${esc(td.label)}</span>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button class="px-1.5 py-0.5 rounded text-[9.5px] font-bold ${cfg.muted ? 'bg-red-500/30 text-red-300' : 'bg-white/5 text-slate-400 hover:text-white'}" data-track-mute="${td.id}" title="Mute / Unmute Track">M</button>
            <button class="p-1 rounded ${cfg.locked ? 'bg-amber-500/30 text-amber-300' : 'bg-white/5 text-slate-400 hover:text-white'}" data-track-lock="${td.id}" title="Lock / Unlock Track"><i data-lucide="${cfg.locked ? 'lock' : 'unlock'}" class="w-3 h-3"></i></button>
          </div>
        </div>
        <div class="nle-track-lane" data-track-lane="${td.id}" style="width:${laneWidth}px;height:${h}px;">
          ${clipsHtml.join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = rowsHtml.join('');
  updatePlayheadPosition();
}

function updatePlayheadPosition() {
  const ph = $('playhead');
  if (!ph) return;
  const x = TRACK_HEADER_W + S.t * S.zoom;
  ph.style.left = `${x}px`;
}

function updateModeButton() {
  const isFree = S.project?.timeline_mode === 'free';
  if ($('modeLabel')) {
    $('modeLabel').textContent = isFree ? 'Free Multi-Track' : 'Ripple Sync';
  }
}

/* ------------------------------------------------------------ Inspector */
function renderInspector() {
  const s = scene();
  if (!s) return;
  const scenes = getScenes();
  const ls = scenes[S.sel] || s;

  const trackLabels = {
    fx: '✨ FX & Motion Track',
    video: '🎬 Video Track (AI Clip)',
    image: '🖼️ Image Track (Storyboard)',
    voice: '🎙️ Voiceover Part Audio Track',
    sfx: '🔊 SFX Track',
    bgm: '🎵 BGM Soundtrack Track',
  };
  if ($('inspTrackBadge')) {
    $('inspTrackBadge').textContent = trackLabels[S.selTrack] || '🎬 Video / 🖼️ Image Track';
  }

  $('inspId').textContent = `Part #${S.sel + 1} (ID ${s.scene_id}) · ${fmt(ls.timestamp_start)}–${fmt(ls.timestamp_end)}`;
  if ($('fStartTime')) $('fStartTime').value = ls.timestamp_start;
  $('fDuration').value = ls.duration;
  if ($('fTrimIn')) $('fTrimIn').value = s.trim_in || 0;
  $('fSpeaker').value = s.dialogue_speaker || '';
  $('fType').value = s.type || 'STATIC_IMAGE';
  $('fMotion').value = s.motion_effect || 'static';
  if ($('fVfx')) $('fVfx').value = s.vfx_effect || 'none';
  if ($('fAudioFx')) $('fAudioFx').value = s.audio_effect || 'studio_clean';
  const charObj = (S.project?.characters || []).find((c) => c.id === s.dialogue_speaker);
  if ($('fAiVoice')) $('fAiVoice').value = s.aistudio_voice || charObj?.aistudio_voice || 'Charon';
  if ($('fVoiceStyle')) $('fVoiceStyle').value = s.style_prompt || charObj?.style_prompt || 'An Old Story Teller, Old Man voice';
  $('fSfx').value = s.sfx || '';
  if ($('fSfxSelect')) $('fSfxSelect').value = s.sfx || '';
  if ($('inspPresetHint')) $('inspPresetHint').textContent = PRESET_LABEL[S.project?.style_preset] || '';
  if ($('characterListDatalist')) {
    $('characterListDatalist').innerHTML = (S.project?.characters || []).map((c) => `<option value="${esc(c.id)}">${esc(c.name_bn || c.name_en)} (${esc(c.aistudio_voice)})</option>`).join('');
  }
  $('fPrompt').value = s.visual_prompt || '';
  $('durWarn').classList.toggle('hidden', s.type === 'DYNAMIC_AI_VIDEO' || (ls.duration >= 3 && ls.duration <= 15));

  document.querySelectorAll('#narTabs .lang-pill').forEach((b) => b.classList.toggle('active', b.dataset.lang === S.narLang));
  $('fNarration').value = s.narration?.[S.narLang] || '';
  updateNarStats();

  // Part Audio Clip inspector fields
  const pa = partAudioObj(s, S.previewLang);
  if ($('inspAudioLang')) $('inspAudioLang').textContent = S.previewLang.toUpperCase();
  if ($('inspAudioLangBtn')) $('inspAudioLangBtn').textContent = S.previewLang.toUpperCase();
  if ($('inspTimingLangBadge')) $('inspTimingLangBadge').textContent = S.previewLang.toUpperCase();
  if ($('chkShowSpeakerBadge')) $('chkShowSpeakerBadge').checked = !s.hide_speaker_badge;
  if ($('inspPartAudioFile')) {
    const fName = pa?.file || `audio/${S.previewLang}/scene_${String(s.scene_id).padStart(4, '0')}.wav`;
    $('inspPartAudioFile').textContent = `${fName} (${ls.duration.toFixed(1)}s · ${pa?.status === 'ready' ? 'Live File Ready' : 'Timeline Segment'})`;
  }
  const audPlayer = $('inspPartAudioPlayer');
  if (audPlayer) {
    if (pa?.url) {
      audPlayer.src = `${pa.url}?v=${Math.round(pa.mtime || Date.now())}`;
      audPlayer.classList.remove('hidden');
    } else {
      audPlayer.classList.add('hidden');
    }
  }
  const clipCfg = s.audio_clips?.[S.previewLang] || {};
  if ($('fAudioVol')) $('fAudioVol').value = clipCfg.volume_db ?? 0;
  if ($('fAudioFadeIn')) $('fAudioFadeIn').value = clipCfg.fade_in ?? 0;
  if ($('fAudioFadeOut')) $('fAudioFadeOut').value = clipCfg.fade_out ?? 0;

  // BGM Segment inspector fields
  const bgmSeg = (S.project?.bgm_clips || [])[S.selBgmIdx] || (S.project?.bgm_clips || [])[0];
  if (bgmSeg) {
    if ($('fBgmStart')) $('fBgmStart').value = bgmSeg.start_time ?? 0;
    if ($('fBgmDur')) $('fBgmDur').value = bgmSeg.duration ?? total();
    if ($('fBgmSegDb')) $('fBgmSegDb').value = bgmSeg.volume_db ?? -20;
  }

  const url = assetUrl(s);
  const isVid = url && VIDEO_RE.test(url);
  $('dzThumb').classList.toggle('hidden', !url || isVid);
  $('dzVid').classList.toggle('hidden', !isVid);
  if (url && !isVid) $('dzThumb').src = url;
  if (isVid && $('dzVid').getAttribute('src') !== url) $('dzVid').src = url;
  if (!isVid) $('dzVid').removeAttribute('src');
  const assetObj = S.data?.assets?.[s.scene_id];
  $('dzPath').textContent = assetObj?.isFallback ? `${s.asset_file} (auto-discovered visual)` : (s.asset_file || '(drop image or video clip)');
}

function updateNarStats() {
  const s = scene();
  if (!s) return;
  const words = ($('fNarration').value.trim().match(/\S+/g) || []).length;
  $('narWords').textContent = `${words} words`;
  $('narPace').textContent = s.duration ? `${Math.round((words / s.duration) * 60)} wpm at ${s.duration}s` : '';
}

function renderAudioRows() {
  const scenes = S.project?.scenes || [];
  const row = (key, label, a, extra = '') => {
    const targetT = key === 'bgm' ? total() : (S.project?.language_total_durations?.[key] || total());
    const folderPath = key === 'bgm'
      ? `projects/${S.id}/audio/bgm/ (bgm_main.mp3)`
      : `projects/${S.id}/audio/${key}/ (scene_0001.wav … scene_${String(scenes.length).padStart(4, '0')}.wav)`;
    const scenePills = key === 'bgm'
      ? (S.project?.bgm_clips || []).map((b, idx) => `<span class="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/30 text-pink-200 font-mono text-[10px]">🎵 BGM #${idx + 1}: ${fmt(b.start_time)}–${fmt((b.start_time||0)+(b.duration||30))} (${b.volume_db ?? -20}dB)</span>`).join(' ')
      : scenes.slice(0, 8).map((s) => `<span class="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-mono text-[9.5px]">audio/${key}/scene_${String(s.scene_id).padStart(4, '0')}.wav (${(s.language_durations?.[key] || s.duration || 5).toFixed(1)}s)</span>`).join(' ') + (scenes.length > 8 ? ` <span class="text-[10px] text-slate-400 font-mono">+${scenes.length - 8} more</span>` : '');

    return `<div class="card p-3 space-y-2 border border-white/10">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div class="font-bold text-xs text-white flex items-center gap-2">
            <span>${label}</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">${key === 'bgm' ? `${(S.project?.bgm_clips || []).length} Segment(s)` : `${scenes.length}/${scenes.length} Scene Clips Synced`} · ${fmt(targetT)}</span>
          </div>
          <div class="text-[10.5px] text-amber-300 font-mono mt-0.5">📁 ${folderPath}</div>
        </div>
        <div class="flex items-center gap-1.5">
          ${extra}
          <label class="btn-ghost border border-white/15 text-xs cursor-pointer"><i data-lucide="upload" class="w-3.5 h-3.5 text-brand-400"></i>Upload ${key === 'bgm' ? 'BGM' : key.toUpperCase() + ' Audio'}
            <input type="file" accept="audio/*" class="hidden" data-upload="${key}" /></label>
        </div>
      </div>
      <div class="flex flex-wrap gap-1 pt-1 border-t border-white/5">${scenePills}</div>
    </div>`;
  };
  $('audioRows').innerHTML =
    Object.keys(LANGS).map((l) => row(l, `🎙️ ${LANG_FULL[l]} — Scene-by-Scene Folder (audio/${l}/)`, S.data.audio[l],
      `<button class="btn-ghost border border-white/10 text-xs" data-fit="${l}" title="Sync timeline to ${l.toUpperCase()} audio durations"><i data-lucide="move-horizontal" class="w-3.5 h-3.5"></i>Fit Timeline</button>`)).join('') +
    row('bgm', '🎵 Background Music Segments (audio/bgm/)', S.data.bgm);
  icons();
}

function renderLaunch() {
  const seo = S.data.seo || {};
  const md = S.project.metadata || {};
  $('launchCards').innerHTML = Object.keys(LANGS).map((l) => {
    const e = seo[l] || {};
    const th = S.data.thumbnails[l];
    const title = e.title ?? md[`title_${l}`] ?? '';
    return `<div class="card p-3 space-y-2" data-seo="${l}">
      <div class="flex items-center justify-between"><div class="font-semibold text-xs">${LANG_FULL[l]}</div><span class="text-[10px] text-slate-500 font-mono">${l.toUpperCase()}</span></div>
      <label class="block relative aspect-video rounded-lg overflow-hidden bg-white/5 cursor-pointer group">
        ${th ? `<img src="${withCacheBust(th.url, th.mtime)}" class="w-full h-full object-cover" />`
             : `<div class="absolute inset-0 grid place-items-center text-xs text-slate-500"><div class="text-center"><i data-lucide="image-plus" class="w-6 h-6 mx-auto mb-1"></i>Upload ${l}_thumbnail</div></div>`}
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 grid place-items-center text-xs transition">Replace thumbnail</div>
        <input type="file" accept="image/*" class="hidden" data-thumb="${l}" />
      </label>
      ${field('Title', `<input class="glass-input w-full text-xs" data-k="title" value="${esc(title)}" maxlength="100" />`, 'title', title.length + '/100')}
      ${field('Description', `<textarea rows="4" class="glass-input w-full text-xs" data-k="description">${esc(e.description || '')}</textarea>`, 'description')}
      ${field('Tags (comma separated)', `<input class="glass-input w-full text-xs" data-k="tags" value="${esc((e.tags || []).join(', '))}" />`, 'tags')}
    </div>`;
  }).join('');
  icons();
  function field(label, input, key, hint = '') {
    return `<div><div class="flex items-center justify-between"><div class="label">${label} <span class="normal-case tracking-normal text-slate-600">${hint}</span></div>
      <button class="text-[10.5px] text-slate-400 hover:text-brand-400 flex items-center gap-1" data-copy="${key}"><i data-lucide="copy" class="w-3 h-3"></i>Copy</button></div>${input}</div>`;
  }
}

function collectSeo() {
  const out = { ...(S.data.seo || {}) };
  document.querySelectorAll('[data-seo]').forEach((card) => {
    const l = card.dataset.seo;
    const v = (k) => card.querySelector(`[data-k="${k}"]`).value;
    out[l] = { ...(out[l] || {}), title: v('title'), description: v('description'), tags: v('tags').split(',').map((t) => t.trim()).filter(Boolean) };
  });
  return out;
}

/* ------------------------------------------------------------ preview player */
function setPreviewAudio() {
  const a = S.data?.audio?.[S.previewLang];
  const nar = $('narAudio');
  if (a?.url) nar.src = `${a.url}?v=${Math.round(a.mtime)}`;
  else nar.removeAttribute('src');
  const b = S.data?.bgm;
  const bgm = $('bgmAudio');
  if (b?.url) { if (!bgm.src.includes(b.url)) bgm.src = `${b.url}?v=${Math.round(b.mtime)}`; }
  else bgm.removeAttribute('src');
  bgm.volume = dbToLin(+$('bgmDb').value);
  document.querySelectorAll('#previewLangSwitch .lang-pill').forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === S.previewLang));
}

function sceneIndexAt(t) {
  const sc = getScenes();
  const i = sc.findIndex((s) => t >= s.timestamp_start && t < s.timestamp_end);
  return i < 0 ? Math.max(0, sc.length - 1) : i;
}

function activeBgmAt(t) {
  const clips = S.project?.bgm_clips || [];
  return clips.find((c) => t >= (c.start_time || 0) && t <= (c.start_time || 0) + (c.duration || 0)) || null;
}

function showFrame(t) {
  if (!S.project?.scenes.length) return;
  const scenes = getScenes();
  const i = sceneIndexAt(t);
  const s = scenes[i];
  const orig = S.project.scenes[i];
  if (!s || !orig) return;
  const local = Math.max(0, t - s.timestamp_start);
  const p = Math.min(1, Math.max(0, local / (s.duration || 1)));
  const url = assetUrl(orig);
  const isVid = url && VIDEO_RE.test(url);
  const img = $('pvImg'), vid = $('pvVid');
  const pa = partAudioObj(orig, S.previewLang);
  const bgmSeg = activeBgmAt(t);

  const effMotion = (S.hoverFx?.kind === 'motion' ? S.hoverFx.id : (orig.motion_effect || s.motion_effect || 'static'));
  const effVfx = (S.hoverFx?.kind === 'vfx' ? S.hoverFx.id : (orig.vfx_effect || 'none'));
  const isShortsMode = S.studioMode === 'shorts';
  const isCutoutPan = ['vox_cutout_pan_lr', 'vox_cutout_pan_rl', 'vod_spotlight_glide', 'floating_card_pan'].includes(effMotion);

  if ($('pvHoverFxBadge')) {
    if (S.hoverFx) {
      $('pvHoverFxBadge').textContent = `👁️ Hover Preview: ${S.hoverFx.kind === 'motion' ? (MOTION_LABEL[S.hoverFx.id] || S.hoverFx.id) : (VFX_LABEL[S.hoverFx.id] || S.hoverFx.id)}`;
      $('pvHoverFxBadge').classList.remove('hidden');
    } else {
      $('pvHoverFxBadge').classList.add('hidden');
    }
  }

  const key = `${i}|${url}|${S.previewLang}|${effMotion}|${effVfx}|${isShortsMode}|${S.activeShortIdx}|${orig.text_card_text || ''}|${orig.text_card_style || ''}|${orig.hide_speaker_badge || false}`;
  if (S.frameKey !== key) {
    S.frameKey = key;
    $('pvEmpty').classList.toggle('hidden', !!url);
    img.classList.toggle('hidden', !url || isVid);
    vid.classList.toggle('hidden', !isVid);
    if (url && !isVid) img.src = url;
    if (isVid) { vid.src = url; vid.currentTime = local; } else { vid.pause(); vid.removeAttribute('src'); }
    const vfx = effVfx;
    const vfxOverlay = $('pvVfxOverlay');
    if (vfxOverlay) vfxOverlay.className = `absolute inset-0 z-10 pointer-events-none overlay-${vfx}`;
    const bgBlur = $('pvBgBlurLayer');
    if (bgBlur) {
      if ((isShortsMode || isCutoutPan) && url && !isVid) {
        bgBlur.src = url;
        bgBlur.classList.remove('hidden');
      } else if ((isShortsMode || isCutoutPan) && posterUrl(orig)) {
        bgBlur.src = posterUrl(orig);
        bgBlur.classList.remove('hidden');
      } else {
        bgBlur.classList.add('hidden');
      }
    }
    const cutoutCls = (!isShortsMode && isCutoutPan) ? 'cutout-card-mode' : '';
    const shortsPosStyle = isShortsMode ? 'top:28%;bottom:auto;height:38%;left:0;right:0;width:100%;border-top:2px solid #f5c451;border-bottom:2px solid #f5c451;' : 'top:0;bottom:0;left:0;right:0;width:100%;height:100%;border:none;';
    img.style.cssText = shortsPosStyle;
    vid.style.cssText = shortsPosStyle;
    img.className = `absolute object-cover origin-center will-change-transform ${(!url || isVid) ? 'hidden' : ''} vfx-${vfx} ${cutoutCls}`;
    vid.className = `absolute object-cover ${!isVid ? 'hidden' : ''} vfx-${vfx} ${cutoutCls}`;

    $('pvSceneTag').textContent = `Part #${i + 1} · ${orig.dialogue_speaker || 'NARRATOR'}`;
    $('pvTypeTag').textContent = isVid ? '🎬 Video Track' : `🖼️ Image Track · ${MOTION_LABEL[orig.motion_effect] || 'Static'}`;
    if ($('pvVfxTag')) {
      $('pvVfxTag').textContent = vfx !== 'none' ? `✨ ${VFX_LABEL[vfx] || vfx}` : '';
    }
    if ($('pvAudioClipTag')) {
      const fName = pa?.file ? pa.file.split('/').pop() : `audio/${S.previewLang}/scene_${String(orig.scene_id).padStart(4, '0')}.wav`;
      $('pvAudioClipTag').textContent = S.project.tracks_config?.voice?.muted ? '🔇 Voice Muted' : `🎙️ ${fName}`;
    }
    $('pvSubtitle').textContent = orig.narration?.[S.previewLang] || '';
    const calloutEl = $('pvCalloutBanner');
    if (calloutEl) {
      const cText = (orig.callout_text || '').trim();
      calloutEl.textContent = cText;
      calloutEl.classList.toggle('hidden', !cText);
    }
    updateSpeakerBadge(orig.dialogue_speaker || 'NARRATOR', S.previewLang, orig);
    updateStageOverlaysForScene(orig, i);
    document.querySelectorAll('.scene-card').forEach((c) => c.classList.toggle('playing', +c.dataset.i === i && S.playing));

    // Play active language's individual part audio clip (or master narration if present) + real WAV SFX cue!
    const partAudEl = $('partAudio');
    const hasMasterNar = Boolean($('narAudio')?.getAttribute('src'));
    if (partAudEl && pa?.url && !hasMasterNar) {
      const targetUrl = `${pa.url}?v=${Math.round(pa.mtime || 1)}`;
      if (partAudEl.getAttribute('src') !== targetUrl) partAudEl.src = targetUrl;
      const volDb = orig.audio_clips?.[S.previewLang]?.volume_db ?? 0;
      partAudEl.volume = dbToLin(volDb);
      if (S.playing && !S.project.tracks_config?.voice?.muted) {
        partAudEl.currentTime = Math.max(0, Math.min(local, (pa.source_duration || s.duration) - 0.05));
        partAudEl.play().catch(() => {});
      }
    }
    if (S.playing) {
      if (!S.project.tracks_config?.sfx?.muted && (orig.sfx || orig.text_card_sfx)) {
        playSynthesizedSfxPreview(orig.text_card_text ? (orig.text_card_sfx || orig.sfx) : orig.sfx);
      }
      if (!S.project.tracks_config?.voice?.muted && !hasMasterNar && !pa?.url) {
        playVoiceoverCadencePulse(orig.dialogue_speaker, orig.aistudio_voice);
      }
    }
  }

  if ($('pvBgmActiveTag')) {
    $('pvBgmActiveTag').textContent = (bgmSeg && !S.project.tracks_config?.bgm?.muted)
      ? `🎵 BGM: ${bgmSeg.volume_db ?? -20}dB`
      : '';
  }

  if (isVid) {
    const vdur = vid.duration || 0;
    let rate = 1, target = Math.min(local, (vdur || 999) - 0.05);
    if (vdur > 0.5 && vdur < s.duration - 0.05) {
      const want = vdur / s.duration;
      if (want >= 0.5) { rate = want; target = Math.min(local * rate, vdur - 0.05); }
      else { rate = 1; target = local % vdur; }
    }
    if (vid.playbackRate !== rate) vid.playbackRate = rate;
    $('pvTypeTag').textContent = rate < 1 ? `🎬 Video · slow ${rate.toFixed(2)}x` : '🎬 Video Track';
    if (S.playing) {
      if (Math.abs(vid.currentTime - target) > 0.3) vid.currentTime = target;
      if (vid.paused && target < vdur - 0.02) vid.play().catch(() => {});
    } else {
      vid.pause();
      if (Math.abs(vid.currentTime - target) > 0.05) vid.currentTime = target;
    }
  } else {
    const Z = 0.12, pan = (Z / 2 / (1 + Z)) * 100 * 2;
    // Vox Stop-Motion: 12fps quantized steps for first 62.5% (2.5s), then hold still for remaining 37.5% (1.5s)
    const voxP = Math.min(1, Math.floor((Math.min(p, 0.625) / 0.625) * 10) / 10);
    const mapP = Math.min(1, p / 0.45);
    
    // 60+ Transitions & Camera Motion Real-Time Transform Engine
    const eff = effMotion;
    const easeIn = Math.min(1, local / 0.65); // transition entrance window (first 0.65s)
    const opVal = Math.max(0.1, Math.min(1, (Number(orig.clip_opacity || 100) / 100)));
    let tf = 'none';
    let extraFilter = '';
    let clipPathVal = 'none';
    let stageBg = '#000';

    if (eff === 'zoom_in') tf = `scale(${1 + Z * p})`;
    else if (eff === 'zoom_out') tf = `scale(${1 + Z - Z * p})`;
    else if (eff === 'zoom_in_fast') tf = `scale(${1 + 0.28 * Math.pow(p, 0.65)})`;
    else if (eff === 'zoom_out_fast') tf = `scale(${1.28 - 0.28 * Math.pow(p, 0.65)})`;
    else if (eff === 'zoom_in_slow') tf = `scale(${1 + 0.06 * p})`;
    else if (eff === 'zoom_out_slow') tf = `scale(${1.06 - 0.06 * p})`;
    else if (eff === 'zoom_in_top_left') tf = `scale(${1 + 0.18 * p}) translate(${(4 * p).toFixed(2)}%, ${(4 * p).toFixed(2)}%)`;
    else if (eff === 'zoom_in_top_right') tf = `scale(${1 + 0.18 * p}) translate(${(-4 * p).toFixed(2)}%, ${(4 * p).toFixed(2)}%)`;
    else if (eff === 'zoom_in_bottom') tf = `scale(${1 + 0.18 * p}) translateY(${(-4.5 * p).toFixed(2)}%)`;
    else if (eff === 'pan_right') tf = `scale(${1 + Z}) translateX(${(0.5 - p) * pan}%)`;
    else if (eff === 'pan_left') tf = `scale(${1 + Z}) translateX(${(p - 0.5) * pan}%)`;
    else if (eff === 'pan_up') tf = `scale(1.16) translateY(${((p - 0.5) * 11).toFixed(2)}%)`;
    else if (eff === 'pan_down') tf = `scale(1.16) translateY(${((0.5 - p) * 11).toFixed(2)}%)`;
    else if (eff === 'pan_diag_tl_br') tf = `scale(1.16) translate(${((0.5 - p) * 9).toFixed(2)}%, ${((0.5 - p) * 9).toFixed(2)}%)`;
    else if (eff === 'pan_diag_tr_bl') tf = `scale(1.16) translate(${((p - 0.5) * 9).toFixed(2)}%, ${((0.5 - p) * 9).toFixed(2)}%)`;
    else if (eff === 'pan_diag_bl_tr') tf = `scale(1.16) translate(${((0.5 - p) * 9).toFixed(2)}%, ${((p - 0.5) * 9).toFixed(2)}%)`;
    else if (eff === 'pan_diag_br_tl') tf = `scale(1.16) translate(${((p - 0.5) * 9).toFixed(2)}%, ${((p - 0.5) * 9).toFixed(2)}%)`;
    else if (eff === 'pan_left_zoom_in') tf = `scale(${1.05 + 0.15 * p}) translateX(${((p - 0.5) * 9).toFixed(2)}%)`;
    else if (eff === 'pan_right_zoom_out') tf = `scale(${1.20 - 0.12 * p}) translateX(${((0.5 - p) * 9).toFixed(2)}%)`;
    else if (eff === 'whip_pan_left') { tf = `scale(1.1) translateX(${((1 - easeIn) * 35).toFixed(1)}%)`; if (easeIn < 1) extraFilter = `blur(${((1 - easeIn) * 8).toFixed(1)}px)`; }
    else if (eff === 'whip_pan_right') { tf = `scale(1.1) translateX(${(-(1 - easeIn) * 35).toFixed(1)}%)`; if (easeIn < 1) extraFilter = `blur(${((1 - easeIn) * 8).toFixed(1)}px)`; }
    else if (eff === 'whip_pan_up') { tf = `scale(1.1) translateY(${((1 - easeIn) * 35).toFixed(1)}%)`; if (easeIn < 1) extraFilter = `blur(${((1 - easeIn) * 8).toFixed(1)}px)`; }
    else if (eff === 'whip_pan_down') { tf = `scale(1.1) translateY(${(-(1 - easeIn) * 35).toFixed(1)}%)`; if (easeIn < 1) extraFilter = `blur(${((1 - easeIn) * 8).toFixed(1)}px)`; }
    else if (eff === 'slide_push_left') tf = `translateX(${((1 - easeIn) * 18).toFixed(1)}%) scale(${1 + 0.06 * p})`;
    else if (eff === 'slide_push_right') tf = `translateX(${(-(1 - easeIn) * 18).toFixed(1)}%) scale(${1 + 0.06 * p})`;
    else if (eff === 'slide_push_up') tf = `translateY(${((1 - easeIn) * 18).toFixed(1)}%) scale(${1 + 0.06 * p})`;
    else if (eff === 'slide_push_down') tf = `translateY(${(-(1 - easeIn) * 18).toFixed(1)}%) scale(${1 + 0.06 * p})`;
    else if (eff === 'elastic_bounce_in') { const b = easeIn < 1 ? 1 + Math.sin(easeIn * Math.PI * 2.5) * 0.12 * (1 - easeIn) : 1 + 0.06 * p; tf = `scale(${b.toFixed(3)})`; }
    else if (eff === 'overshoot_snap_zoom') { const sScale = easeIn < 1 ? 0.85 + 0.25 * Math.sin(easeIn * Math.PI * 0.85) : 1.05 + 0.05 * p; tf = `scale(${sScale.toFixed(3)})`; }
    else if (eff === 'crossfade' || eff === 'dip_to_black' || eff === 'smoke_dissolve') { tf = `scale(${1 + 0.08 * p})`; img.style.opacity = (opVal * Math.min(1, local / 0.45)).toFixed(2); }
    else if (eff === 'dip_to_white' || eff === 'flash_bulb_cut') { stageBg = '#fff'; tf = `scale(${1 + 0.08 * p})`; if (easeIn < 1) extraFilter = `brightness(${(1 + (1 - easeIn) * 1.8).toFixed(2)})`; }
    else if (eff === 'dip_to_gold' || eff === 'film_burn_transition' || eff === 'light_leak_wipe') { stageBg = '#d97706'; tf = `scale(${1 + 0.1 * p})`; if (easeIn < 1) extraFilter = `sepia(${(1 - easeIn).toFixed(2)}) brightness(${(1 + (1 - easeIn) * 0.8).toFixed(2)})`; }
    else if (eff === 'blur_dissolve' || eff === 'luma_fade_in') { tf = `scale(${1 + 0.09 * p})`; if (easeIn < 1) extraFilter = `blur(${((1 - easeIn) * 10).toFixed(1)}px)`; }
    else if (eff === 'iris_circle_open') { tf = `scale(${1 + 0.08 * p})`; if (easeIn < 1) clipPathVal = `circle(${(easeIn * 75).toFixed(1)}% at 50% 50%)`; }
    else if (eff === 'iris_circle_close') { tf = `scale(${1 + 0.08 * p})`; if (p > 0.8) clipPathVal = `circle(${((1 - (p - 0.8) / 0.2) * 75).toFixed(1)}% at 50% 50%)`; }
    else if (eff === 'split_horizontal_open') { tf = `scale(${1 + 0.07 * p})`; if (easeIn < 1) clipPathVal = `inset(${((1 - easeIn) * 45).toFixed(1)}% 0)`; }
    else if (eff === 'split_vertical_open') { tf = `scale(${1 + 0.07 * p})`; if (easeIn < 1) clipPathVal = `inset(0 ${((1 - easeIn) * 45).toFixed(1)}%)`; }
    else if (eff === 'clock_wipe_cw' || eff === 'page_peel_curl') { tf = `scale(${1 + 0.08 * p}) rotate(${((1 - easeIn) * -2.5).toFixed(2)}deg)`; }
    else if (eff === 'spin_cw_in') tf = `scale(${1.08 + 0.08 * p}) rotate(${((1 - easeIn) * -14).toFixed(2)}deg)`;
    else if (eff === 'spin_ccw_in') tf = `scale(${1.08 + 0.08 * p}) rotate(${((1 - easeIn) * 14).toFixed(2)}deg)`;
    else if (eff === 'pendulum_tilt') tf = `scale(1.12) rotate(${(Math.sin(local * 2.2) * 2.2).toFixed(2)}deg)`;
    else if (eff === 'flip_3d_card') tf = `perspective(800px) rotateY(${((1 - easeIn) * 55).toFixed(1)}deg) scale(${1 + 0.06 * p})`;
    else if (eff === 'vox_stop_motion') tf = `scale(${1 + 0.14 * voxP}) translateY(${(-2.5 * voxP).toFixed(2)}%)`;
    else if (eff === 'parallax_25d') tf = `scale(${1 + 0.16 * Math.pow(p, 1.3)})`;
    else if (eff === 'map_zoom_highlight') tf = `scale(${1 + 0.22 * mapP})`;
    else if (eff === 'handheld_docu') tf = `scale(${1.08 + 0.04 * p}) translate(${(Math.sin(local * 3.2) * 1.1).toFixed(2)}%, ${(Math.cos(local * 2.5) * 0.8).toFixed(2)}%)`;
    else if (eff === 'earthquake_tremor') tf = `scale(1.12) translate(${(Math.sin(local * 24) * 1.8).toFixed(2)}%, ${(Math.cos(local * 29) * 1.4).toFixed(2)}%)`;
    else if (eff === 'heartbeat_pulse_zoom') tf = `scale(${(1.06 + Math.pow(Math.sin(local * 3.8), 6) * 0.09).toFixed(3)})`;
    else if (eff === 'vertigo_dolly_zoom') tf = `perspective(500px) translateZ(${(p * 45).toFixed(1)}px) scale(${(1.18 - 0.12 * p).toFixed(3)})`;
    else if (eff === 'glitch_twitch_cut') tf = `scale(${1.08 + (Math.sin(local * 19) > 0.82 ? 0.06 : 0)}) translateX(${(Math.sin(local * 27) > 0.85 ? 1.5 : 0)}%)`;
    else if (eff === 'cinematic_glow') tf = `scale(${1 + 0.10 * p})`;
    else if (eff === 'vox_cutout_pan_lr') tf = `translateX(${((p - 0.5) * 14).toFixed(2)}%) rotate(${((p - 0.5) * 2.2).toFixed(2)}deg) scale(${1 + 0.06 * p})`;
    else if (eff === 'vox_cutout_pan_rl') tf = `translateX(${((0.5 - p) * 14).toFixed(2)}%) rotate(${((0.5 - p) * 2.2).toFixed(2)}deg) scale(${1 + 0.06 * p})`;
    else if (eff === 'vod_spotlight_glide') tf = `translateX(${((p - 0.5) * 10).toFixed(2)}%) scale(${1.04 + 0.10 * p})`;
    else if (eff === 'floating_card_pan') tf = `translate(${(Math.sin(local * 1.4) * 5).toFixed(2)}%, ${(Math.cos(local * 1.1) * 3).toFixed(2)}%) rotate(${(Math.sin(local * 0.9) * 1.8).toFixed(2)}deg) scale(1.06)`;

    // Live Transition Overlay Flash / Dip / Burn
    const trLayer = $('pvTransitionLayer');
    if (trLayer) {
      if (easeIn < 1 && ['dip_to_black', 'dip_to_white', 'dip_to_gold', 'flash_bulb_cut', 'film_burn_transition', 'light_leak_wipe', 'smoke_dissolve'].includes(eff)) {
        const bgMap = {
          dip_to_black: '#000000',
          dip_to_white: '#ffffff',
          flash_bulb_cut: '#ffffff',
          dip_to_gold: 'radial-gradient(circle, #fde047, #d97706)',
          film_burn_transition: 'linear-gradient(135deg, #ea580c, #facc15, transparent)',
          light_leak_wipe: 'linear-gradient(90deg, rgba(251,191,36,0.9), rgba(244,63,94,0.6), transparent)',
          smoke_dissolve: 'radial-gradient(circle, #475569, #0f172a)'
        };
        trLayer.style.background = bgMap[eff] || '#000';
        trLayer.style.opacity = ((1 - easeIn) * 0.88).toFixed(2);
      } else {
        trLayer.style.opacity = 0;
      }
    }

    img.style.transform = tf;
    img.style.clipPath = clipPathVal;
    if (eff !== 'crossfade' && eff !== 'dip_to_black' && eff !== 'smoke_dissolve') {
      img.style.opacity = opVal;
    }
    vid.style.opacity = opVal;
    $('stage').style.backgroundColor = stageBg;
  }

  $('tCur').textContent = fmt(t);
  updatePlayheadPosition();
}

function play() {
  if (!S.project) return;
  if (S.t >= total() - 0.05) S.t = 0;
  S.playing = true;
  S.frameKey = null;
  S.clock0 = performance.now() - S.t * 1000; S.lastTickMs = performance.now();
  const nar = $('narAudio'), bgm = $('bgmAudio');
  const voiceMuted = S.project.tracks_config?.voice?.muted;
  const bgmMuted = S.project.tracks_config?.bgm?.muted;
  if (nar.getAttribute('src') && !voiceMuted) { nar.currentTime = S.t; nar.play().catch(() => {}); }
  if (bgm.getAttribute('src') && $('optBgm').checked && !bgmMuted && activeBgmAt(S.t)) {
    bgm.volume = dbToLin(+$('bgmDb').value);
    bgm.currentTime = bgm.duration ? S.t % bgm.duration : 0;
    bgm.play().catch(() => startWebAudioAmbientBgm());
  } else if ($('optBgm')?.checked && !bgmMuted && activeBgmAt(S.t)) {
    startWebAudioAmbientBgm();
  }
  $('playIcon').setAttribute('data-lucide', 'pause');
  icons();
  requestAnimationFrame(tick);
}

function stop() {
  S.playing = false;
  stopWebAudioAmbientBgm();
  $('narAudio')?.pause();
  $('partAudio')?.pause();
  $('bgmAudio')?.pause();
  $('pvVid')?.pause();
  $('playIcon')?.setAttribute('data-lucide', 'play');
  icons();
  document.querySelectorAll('.scene-card.playing').forEach((c) => c.classList.remove('playing'));
}

function tick() {
  if (!S.playing) return;
  const now = performance.now();
  const dt = (now - (S.lastTickMs || now)) / 1000;
  S.lastTickMs = now;
  const globalSpd = parseFloat($('pvSpeedSelect')?.value || 1) || 1;
  const curSc = S.project?.scenes?.[S.sel];
  const clipSpd = parseFloat(curSc?.clip_speed || 1) || 1;
  S.t += dt * globalSpd * clipSpd;
  const nar = $('narAudio');
  if (nar.getAttribute('src') && !nar.paused && Math.abs(nar.currentTime - S.t) > 0.3 && S.t < (nar.duration || 0)) {
    nar.currentTime = S.t;
  }
  if (S.studioMode === 'shorts' && S.shortPlayEndT && S.t >= S.shortPlayEndT) {
    S.t = S.shortPlayEndT;
    S.shortPlayEndT = null;
    showFrame(S.t - 0.01);
    stop();
    return;
  }
  if (S.t >= total()) { S.t = total(); showFrame(S.t - 0.001); stop(); return; }
  const i = sceneIndexAt(S.t);
  if (i !== S.sel) { S.sel = i; highlightSel(); }
  showFrame(S.t);
  requestAnimationFrame(tick);
}

function seek(t, select = true) {
  S.t = Math.max(0, Math.min(total(), t));
  S.clock0 = performance.now() - S.t * 1000; S.lastTickMs = performance.now();
  const nar = $('narAudio');
  if (nar.getAttribute('src')) nar.currentTime = Math.min(S.t, nar.duration || S.t);
  S.frameKey = null;
  if (select) {
    const i = sceneIndexAt(S.t);
    if (i !== S.sel) { S.sel = i; highlightSel(); }
  }
  showFrame(S.t);
}

function selectScene(i, doSeek = true, track = S.selTrack) {
  if (!S.project?.scenes?.length) return;
  S.sel = Math.max(0, Math.min(S.project.scenes.length - 1, i));
  if (track) S.selTrack = track;
  highlightSel();
  const scs = getScenes();
  if (doSeek && scs[S.sel]) seek(scs[S.sel].timestamp_start + 0.001, false);
}

function highlightSel() {
  document.querySelectorAll('.scene-card').forEach((c) => c.classList.toggle('active', +c.dataset.i === S.sel));
  document.querySelectorAll('.nle-clip').forEach((c) => {
    if (c.dataset.track === 'bgm') {
      c.classList.toggle('selected', S.selTrack === 'bgm' && +c.dataset.bgmI === S.selBgmIdx);
    } else {
      c.classList.toggle('selected', +c.dataset.i === S.sel && c.dataset.track === S.selTrack);
    }
  });
  document.querySelector('.scene-card.active')?.scrollIntoView({ block: 'nearest' });
  renderInspector();
}

/* ------------------------------------------------------------ Clip Split & Part Addition */
function splitClipAt(sceneIdx, splitOffsetSec) {
  const s = S.project?.scenes?.[sceneIdx];
  if (!s) return;
  const curDur = sceneDur(s, S.previewLang);
  const offset = typeof splitOffsetSec === 'number' ? splitOffsetSec : curDur / 2;
  if (curDur < 1.0) {
    return toast('Clip is under 1.0s — extend duration before splitting', 'err');
  }
  const clampedOffset = Math.max(0.4, Math.min(curDur - 0.4, offset));
  pushHistory();
  const dur1 = +clampedOffset.toFixed(2);
  const dur2 = +(curDur - dur1).toFixed(2);
  const nextId = Math.max(0, ...S.project.scenes.map((x) => +x.scene_id || 0)) + 1;

  const clone = JSON.parse(JSON.stringify(s));
  clone.scene_id = nextId;
  s.duration = dur1;
  clone.duration = dur2;
  Object.keys(LANGS).forEach((l) => {
    s.language_durations = s.language_durations || {};
    clone.language_durations = clone.language_durations || {};
    s.language_durations[l] = dur1;
    clone.language_durations[l] = dur2;
  });
  if (S.project.timeline_mode === 'free') {
    clone.custom_start = +((s.custom_start || s.timestamp_start || 0) + dur1).toFixed(2);
  }
  S.project.custom_scene_order = true;
  S.project.scenes.splice(sceneIdx + 1, 0, clone);
  S.sel = sceneIdx + 1;
  markDirty();
  recompute();
  renderAll();
  toast(`Split Part #${sceneIdx + 1} into two independent clips (${dur1}s + ${dur2}s)`);
}

function addNewPartAfter(idx = S.sel) {
  if (!S.project) return;
  pushHistory();
  const nextId = Math.max(0, ...S.project.scenes.map((s) => +s.scene_id || 0)) + 1;
  const pad = String(nextId).padStart(4, '0');
  const newSc = {
    scene_id: nextId,
    duration: 6.0,
    language_durations: { bn: 6.0, en: 6.0, hi: 6.0 },
    type: 'STATIC_IMAGE',
    dialogue_speaker: 'NARRATOR',
    narration: {
      bn: `নতুন পার্ট #${nextId} — ফোল্ডার বা টাইমলাইনে যুক্ত হয়েছে।`,
      en: `New Part #${nextId} — added directly to timeline.`,
      hi: `नया भाग #${nextId} — सीधे टाइमलाइन में जोड़ा गया।`,
    },
    visual_prompt: 'Historical documentary scene illustration --no text',
    asset_file: `visual_assets/shot_${pad}.jpg`,
    sfx: 'ambient_wind_soft',
    motion_effect: 'zoom_in',
    audio_clips: {
      bn: { file: `audio/bn/scene_${pad}.wav`, duration: 6.0, volume_db: 0 },
      en: { file: `audio/en/scene_${pad}.wav`, duration: 6.0, volume_db: 0 },
      hi: { file: `audio/hi/scene_${pad}.wav`, duration: 6.0, volume_db: 0 },
    },
  };
  S.project.scenes.splice(idx + 1, 0, newSc);
  S.sel = idx + 1;
  markDirty();
  recompute();
  renderAll();
  toast(`Added Part #${nextId} with separate Visual, Audio & FX clips`);
}

/* ------------------------------------------------------------ Interactive NLE Drag & Resize */
function wireNleTimelineInteractions() {
  const container = $('nleTracksContainer');
  const ruler = $('nleRuler');
  const scrollWrap = $('nleScrollContainer');

  // Ruler click & scrub
  let scrubbingRuler = false;
  const scrubFromEvent = (e) => {
    const r = ruler.getBoundingClientRect();
    const sec = Math.max(0, (e.clientX - r.left) / S.zoom);
    seek(sec, true);
  };
  ruler.addEventListener('mousedown', (e) => {
    scrubbingRuler = true;
    scrubFromEvent(e);
    const onMove = (ev) => { if (scrubbingRuler) scrubFromEvent(ev); };
    const onUp = () => {
      scrubbingRuler = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  // Ctrl + Wheel Zoom on timeline
  scrollWrap.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const step = S.zoom < 3 ? 0.4 : 2;
      const delta = e.deltaY < 0 ? step : -step;
      S.zoom = Math.max(0.2, Math.min(50, +(S.zoom + delta).toFixed(2)));
      $('tlZoom').value = S.zoom;
      renderMultiTrackTimeline();
    }
  }, { passive: false });

  // Track Mute / Lock buttons & Clip Drag / Trim
  container.addEventListener('mousedown', (e) => {
    const muteBtn = e.target.closest('[data-track-mute]');
    if (muteBtn) {
      const tid = muteBtn.dataset.trackMute;
      pushHistory();
      S.project.tracks_config[tid].muted = !S.project.tracks_config[tid].muted;
      markDirty();
      renderMultiTrackTimeline();
      icons();
      return;
    }
    const lockBtn = e.target.closest('[data-track-lock]');
    if (lockBtn) {
      const tid = lockBtn.dataset.trackLock;
      pushHistory();
      S.project.tracks_config[tid].locked = !S.project.tracks_config[tid].locked;
      markDirty();
      renderMultiTrackTimeline();
      icons();
      return;
    }

    const clipEl = e.target.closest('.nle-clip');
    if (!clipEl) {
      // Clicked empty lane space -> seek playhead there
      const lane = e.target.closest('.nle-track-lane');
      if (lane) {
        const r = lane.getBoundingClientRect();
        seek(Math.max(0, (e.clientX - r.left) / S.zoom), true);
      }
      return;
    }

    const trackId = clipEl.dataset.track;
    if (S.project?.tracks_config?.[trackId]?.locked) {
      return toast(`${trackId.toUpperCase()} track is locked — unlock it first`, 'err');
    }

    // Handle BGM Clip Selection / Drag / Resize
    if (trackId === 'bgm') {
      const bIdx = +clipEl.dataset.bgmI;
      S.selTrack = 'bgm';
      S.selBgmIdx = bIdx;
      highlightSel();
      const bClip = S.project.bgm_clips[bIdx];
      if (!bClip) return;

      const resizeSide = e.target.closest('.nle-handle')?.dataset.resize;
      const startX = e.clientX;
      const origStart = bClip.start_time || 0;
      const origDur = bClip.duration || 30;
      pushHistory();

      const onMove = (ev) => {
        const dt = (ev.clientX - startX) / S.zoom;
        if (resizeSide === 'r') {
          bClip.duration = Math.max(2, +(origDur + dt).toFixed(1));
        } else if (resizeSide === 'l') {
          const ns = Math.max(0, Math.min(origStart + origDur - 2, +(origStart + dt).toFixed(1)));
          bClip.duration = +(origDur - (ns - origStart)).toFixed(1);
          bClip.start_time = ns;
        } else {
          bClip.start_time = Math.max(0, +(origStart + dt).toFixed(1));
        }
        markDirty();
        renderMultiTrackTimeline();
        renderInspector();
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return;
    }

    // Handle Scene / Part Clips (FX, Video, Image, Voiceover Audio, SFX)
    const idx = +clipEl.dataset.i;
    S.selTrack = trackId;
    selectScene(idx, false, trackId);

    // If Razor Tool is active, split clip where clicked!
    if (S.tool === 'razor') {
      const r = clipEl.getBoundingClientRect();
      const localSec = (e.clientX - r.left) / S.zoom;
      splitClipAt(idx, localSec);
      return;
    }

    const resizeSide = e.target.closest('.nle-handle')?.dataset.resize;
    const sc = S.project.scenes[idx];
    const scComputed = getScenes()[idx];
    if (!sc || !scComputed) return;

    const startX = e.clientX;
    const origDur = scComputed.duration;
    const origStart = scComputed.timestamp_start;
    let moved = false;
    pushHistory();
    clipEl.classList.add('dragging');

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) < 3 && !moved) return;
      moved = true;
      const dt = dx / S.zoom;

      if (resizeSide === 'r') {
        const newDur = Math.max(0.5, +(origDur + dt).toFixed(2));
        sc.duration = newDur;
        sc.manual_duration = true;
        sc.language_durations = sc.language_durations || {};
        sc.language_durations[S.previewLang] = newDur;
      } else if (resizeSide === 'l') {
        const deltaDur = Math.min(origDur - 0.5, dt);
        const newDur = Math.max(0.5, +(origDur - deltaDur).toFixed(2));
        sc.duration = newDur;
        sc.manual_duration = true;
        sc.language_durations = sc.language_durations || {};
        sc.language_durations[S.previewLang] = newDur;
        if (S.project.timeline_mode === 'free') {
          sc.custom_start = Math.max(0, +(origStart + deltaDur).toFixed(2));
        }
      } else {
        // Dragging body of clip horizontally
        if (S.project.timeline_mode === 'free') {
          sc.custom_start = Math.max(0, +(origStart + dt).toFixed(2));
        } else {
          // In Ripple mode, dragging past neighbor swaps clip order!
          const targetTime = Math.max(0, origStart + dt + origDur / 2);
          const allSc = getScenes();
          const overIdx = allSc.findIndex((x) => targetTime >= x.timestamp_start && targetTime <= x.timestamp_end);
          if (overIdx >= 0 && overIdx !== S.sel) {
            const item = S.project.scenes.splice(S.sel, 1)[0];
            S.project.scenes.splice(overIdx, 0, item);
            S.project.custom_scene_order = true;
            S.sel = overIdx;
          }
        }
      }
      markDirty();
      recompute();
      renderMultiTrackTimeline();
      renderSceneList();
      renderInspector();
    };

    const onUp = () => {
      clipEl.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!moved) {
        seek(scComputed.timestamp_start + 0.001, false);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  // Vertical Dock Resizer
  const resizer = $('timelineResizer');
  const dock = $('bottomDock');
  resizer?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    resizer.classList.add('dragging');
    const startY = e.clientY;
    const startH = dock.getBoundingClientRect().height;
    const onMove = (ev) => {
      const newH = Math.max(180, Math.min(window.innerHeight - 240, startH - (ev.clientY - startY)));
      dock.style.height = `${newH}px`;
    };
    const onUp = () => {
      resizer.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}

/* ------------------------------------------------------------ uploads */
async function uploadFile(file, fields) {
  if (S.dirty) await save();
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  fd.append('file', file);
  toast(`Uploading ${file.name}…`);
  await api('POST', `/api/project/${S.id}/upload`, fd);
  await loadProject(S.id, true);
  toast(`${file.name} uploaded & synced to timeline`);
}

/* ------------------------------------------------------------ render stream & live folder watcher */
function connectRenderStream() {
  S.es?.close();
  $('renderLog').textContent = '';
  const es = new EventSource(`/api/project/${S.id}/render-status`);
  S.es = es;
  es.addEventListener('reset', () => { $('renderLog').textContent = ''; });
  es.addEventListener('log', (e) => {
    const el = $('renderLog');
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    el.textContent += JSON.parse(e.data) + '\n';
    if (atBottom) el.scrollTop = el.scrollHeight;
  });
  es.addEventListener('state', (e) => {
    const j = JSON.parse(e.data);
    if (!j) return;
    const running = j.status === 'running';
    $('renderStage').textContent = j.status === 'error' ? `✗ ${j.stage}` : j.stage || 'Idle';
    $('renderStage').className = j.status === 'error' ? 'text-red-400' : j.status === 'done' ? 'text-emerald-400' : 'text-slate-300';
    $('renderPct').textContent = `${Math.round(j.progress || 0)}%`;
    $('renderBar').style.width = `${j.progress || 0}%`;
    $('btnRender').disabled = running;
    $('btnCancel').classList.toggle('hidden', !running);
    if (S.lastStatus === 'running' && j.status === 'done') {
      toast('Render finished 🎉 Saved in exports/ folder!');
      refreshRenders();
    }
    S.lastStatus = j.status;
  });
  // Live folder watcher event: whenever a new part is generated in parts/ or audio/raw/, auto-reload!
  es.addEventListener('parts_updated', async (e) => {
    const info = JSON.parse(e.data || '{}');
    toast(`🟢 New part detected (${info.filename || 'folder update'}) — Auto-adding to timeline!`);
    if (!S.dirty) {
      await loadProject(S.id, true);
    }
  });
}

async function refreshRenders() {
  const d = await api('GET', `/api/project/${S.id}`);
  S.data.renders = d.renders;
  S.data.exports = d.exports;
  renderOutputs();
}

function renderOutputs() {
  const r = S.data?.renders || [];
  if ($('exportCountBadge')) $('exportCountBadge').textContent = r.length;
  $('renderOutputs').innerHTML = r.map((o) => `<a href="${o.url}?v=${Math.round(o.mtime)}" target="_blank" class="btn-ghost border border-emerald-500/30 text-emerald-300 text-xs"><i data-lucide="film" class="w-3.5 h-3.5"></i>${esc(o.folder || 'exports')}/${esc(o.name)} <span class="text-slate-500">${(o.size / 1048576).toFixed(1)} MB</span></a>`).join('') +
    `<button class="btn-ghost border border-brand-500/30 text-brand-400 text-xs" id="btnOpenExports"><i data-lucide="folder-output" class="w-3.5 h-3.5"></i>Open Export Folder (exports/)</button>`;
  $('btnOpenExports')?.addEventListener('click', () => api('POST', `/api/project/${S.id}/open-folder`, { sub: 'exports' }));
  icons();
}

/* ------------------------------------------------------------ events */
function bindField(id, key, transform = (v) => v, after) {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', (e) => {
    const s = scene();
    if (!s) return;
    pushHistory();
    s[key] = transform(e.target.value);
    markDirty();
    after?.();
  });
}

function switchBottomTab(tabName) {
  document.querySelectorAll('#tabs .tab').forEach((x) => x.classList.toggle('active', x.dataset.tab === tabName));
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== tabName));
}


/* ==================== WEB AUDIO LIVE SFX SYNTHESIZER ==================== */
let audioCtx = null;
let bgmOsc1 = null, bgmOsc2 = null, bgmGainNode = null;
let lastSpokenSceneKey = null;

function playVoiceoverCadencePulse(speakerId, voiceId) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (S.project?.tracks_config?.voice?.muted) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const isFemale = /Kore|Aoede|Gacrux|Erinome|Despina|Autonoe|Callirrhoe|Sulafat|Zephyr|Leda/i.test(voiceId || '');
    const baseFreq = isFemale ? 225 : (/Cruz|Bodi|Fenrir|Charon/i.test(voiceId || '') ? 118 : 145);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.18, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + 0.22);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.24);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch {}
}

function startWebAudioAmbientBgm() {
  try {
    stopWebAudioAmbientBgm();
    if (!$('optBgm')?.checked || S.project?.tracks_config?.bgm?.muted) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    bgmOsc1 = audioCtx.createOscillator();
    bgmOsc2 = audioCtx.createOscillator();
    bgmGainNode = audioCtx.createGain();
    bgmOsc1.type = 'sine';
    bgmOsc2.type = 'triangle';
    bgmOsc1.frequency.setValueAtTime(110, now); // A2 drone
    bgmOsc2.frequency.setValueAtTime(164.81, now); // E3 fifth
    const db = +($('bgmDb')?.value || -20);
    const vol = Math.min(0.12, dbToLin(db) * 0.25);
    bgmGainNode.gain.setValueAtTime(0.001, now);
    bgmGainNode.gain.linearRampToValueAtTime(vol, now + 0.5);
    bgmOsc1.connect(bgmGainNode);
    bgmOsc2.connect(bgmGainNode);
    bgmGainNode.connect(audioCtx.destination);
    bgmOsc1.start(now);
    bgmOsc2.start(now);
  } catch {}
}

function stopWebAudioAmbientBgm() {
  try {
    if (bgmOsc1) { bgmOsc1.stop(); bgmOsc1.disconnect(); bgmOsc1 = null; }
    if (bgmOsc2) { bgmOsc2.stop(); bgmOsc2.disconnect(); bgmOsc2 = null; }
    if (bgmGainNode) { bgmGainNode.disconnect(); bgmGainNode = null; }
  } catch {}
}

function playSynthesizedSfxPreview(cueId) {
  if (!cueId || cueId === 'none') return;
  if (!window.CANVAS_STANDALONE_MODE) {
    try {
      const sfxEl = $('sfxAudio');
      if (sfxEl) {
        const cleanCue = String(cueId).trim().replace(/[^\w-]/g, '_');
        sfxEl.src = `/assets/sfx/${cleanCue}.wav`;
        sfxEl.volume = 0.65;
        sfxEl.currentTime = 0;
        sfxEl.play().catch(() => playWebAudioSfxFallback(cueId));
        return;
      }
    } catch {}
  }
  playWebAudioSfxFallback(cueId);
}

function playWebAudioSfxFallback(cueId) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    if (/stamp|boom|gavel|heartbeat/i.test(cueId)) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.35);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } else if (/pin|coins|tea_cup|shutter|typewriter|glitch/i.test(cueId)) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(/coins|tea/i.test(cueId) ? 1850 : 920, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } else {
      // Filtered noise whoosh / paper unfold / highlighter / wind
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.45);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(/paper|highlighter|chalk/i.test(cueId) ? 2400 : 650, now);
      filter.Q.setValueAtTime(1.8, now);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.43);
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.45);
    }
  } catch {}
}

/* ==================== PANEL 5: 10-STYLE AI WORKFLOW & WIZARD ==================== */
function renderWorkflowWizard() {
  const catSel = $('wizCategory');
  if (!catSel) return;
  const presetId = catSel.value || S.project?.style_preset || 'PRESET_VOX_DOCUMENTARY';
  const presets = S.data?.stylePresets || {};
  const p = presets[presetId] || {
    id: presetId,
    name: PRESET_LABEL[presetId] || presetId,
    bn_name: PRESET_LABEL[presetId] || presetId,
    benchmark: 'Multi-Purpose Studio Standard',
    default_motion: 'vox_stop_motion',
    default_vfx: 'vox_halftone_paper',
    default_audio_fx: 'studio_clean',
    default_voice: 'Charon',
    default_style_prompt: 'deep, resonant documentary narrator',
    avg_clip_sec: 5.5,
    wpm: 140,
    video_ratio: 0.20,
    style_lock_positive: '16:9 widescreen professional documentary illustration --no text',
  };

  if ($('wizCategoryRuleBox')) {
    $('wizCategoryRuleBox').innerHTML = `
      <div class="font-semibold text-amber-300">${esc(p.name)}</div>
      <div class="text-[10px] text-slate-400">Benchmark: <span class="text-slate-200">${esc(p.benchmark)}</span></div>
      <div class="text-[10px] text-emerald-300 font-mono">Default Voice: ${esc(p.default_voice)} · Style: "${esc(p.default_style_prompt)}"</div>
      <div class="text-[10px] text-purple-300 font-mono">Motion: ${esc(p.default_motion)} · VFX: ${esc(p.default_vfx)} · Beat: ${p.avg_clip_sec}s</div>
    `;
  }

  const mins = Math.max(1, parseFloat($('wizMinutes')?.value || 8));
  const totalSec = Math.round(mins * 60);
  const clipCount = Math.max(6, Math.round(totalSec / (p.avg_clip_sec || 6)));
  const vidClips = Math.max(2, Math.round(clipCount * (p.video_ratio || 0.2)));
  const imgClips = Math.max(0, clipCount - vidClips);
  const totalWords = Math.round(mins * (p.wpm || 140));

  if ($('calcSummaryBadge')) {
    $('calcSummaryBadge').textContent = `${mins} min = ${ totalSec }s · ~${p.wpm || 140} WPM`;
  }
  if ($('calcMetricsGrid')) {
    $('calcMetricsGrid').innerHTML = `
      <div class="p-2 rounded bg-white/[0.03] border border-white/10">
        <div class="text-base font-bold text-brand-400 font-mono">${clipCount}</div>
        <div class="text-[10px] text-slate-400">Total Granular Clips</div>
      </div>
      <div class="p-2 rounded bg-white/[0.03] border border-white/10">
        <div class="text-base font-bold text-sky-400 font-mono">${imgClips}</div>
        <div class="text-[10px] text-slate-400">1K/4K Style Images</div>
      </div>
      <div class="p-2 rounded bg-white/[0.03] border border-white/10">
        <div class="text-base font-bold text-indigo-400 font-mono">${vidClips}</div>
        <div class="text-[10px] text-slate-400">Dynamic AI Video Clips</div>
      </div>
      <div class="p-2 rounded bg-white/[0.03] border border-white/10">
        <div class="text-base font-bold text-emerald-400 font-mono">${totalWords}</div>
        <div class="text-[10px] text-slate-400">Target Script Words</div>
      </div>
    `;
  }

  const stages = [
    ['01. Idea & Viral Hook', '15 High-CTR Topic Suggestions'],
    ['02. 8-Phase Research', 'R1 Charter → R6 Ledger → R8 Factcheck'],
    ['03. Character & Voice Map', `${(S.project?.characters || []).length} Cast · AI Studio 33 Voices`],
    ['04. 1-Sentence Script Slicing', `${clipCount} Cuts · Zero Em-Dash TTS Hygiene`],
    ['05. Style-Locked Images', `Nano Banana 2.1 (1st Fallback: Nano Banana 2) · Thinking: HIGH`],
    ['06. Dual-Keyframe AI Video', `Start+End Frame Lock · Zero Morphing`],
    ['07. Multi-Speaker Speech', `gemini-3.8-flash-tts + Style ▾ Prompt`],
    ['08. 5-Layer SFX & Lyria BGM', `30+ SFX Cues + Auto-Ducked -20dB Score`],
    ['09. Hybrid NLE + Agent Edit', `6-Track Timeline + @Timestamp Commands`],
    ['10. Triple 1080p60 + Shorts', `BN/EN/HI Master + 9:16 Vertical Reels`],
  ];
  if ($('pipelineStepsGrid')) {
    $('pipelineStepsGrid').innerHTML = stages.map(([title, sub], idx) => `
      <button type="button" data-stage-idx="${idx + 1}" class="text-left p-2 rounded-lg bg-slate-900/80 hover:bg-brand-500/15 border border-white/10 hover:border-brand-500/40 flex items-center justify-between transition group cursor-pointer">
        <div class="min-w-0 pr-1">
          <div class="font-semibold text-slate-200 group-hover:text-brand-400 text-[10.5px] truncate">${esc(title)}</div>
          <div class="text-[9.5px] text-slate-400 font-mono truncate">${esc(sub)}</div>
        </div>
        <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono shrink-0">READY</span>
      </button>
    `).join('');
  }
}

/* ==================== PANEL 6: CHARACTER & VOICE MAPPING STUDIO ==================== */
function renderCharactersPanel() {
  const grid = $('charactersGrid');
  if (!grid || !S.project) return;
  const chars = S.project.characters || [];
  const voices = S.data?.aistudioVoices || FALLBACK_VOICES;
  const afxList = S.data?.audioEffects || Object.keys(AUDIO_FX_LABEL);

  grid.innerHTML = chars.map((ch, idx) => {
    const usedCount = (S.project.scenes || []).filter((s) => s.dialogue_speaker === ch.id).length;
    const voiceOpts = voices.map((v) =>
      `<option value="${esc(v.id)}" ${v.id === ch.aistudio_voice ? 'selected' : ''}>${esc(v.id)} (${esc(v.gender)} · ${esc(v.age)}) — ${esc(v.bestFor)}</option>`
    ).join('');
    const afxOpts = afxList.map((a) =>
      `<option value="${esc(a)}" ${a === (ch.audio_effect || 'studio_clean') ? 'selected' : ''}>${esc(AUDIO_FX_LABEL[a] || a)}</option>`
    ).join('');

    return `
      <div class="card p-3 space-y-2 border border-white/10" data-char-idx="${idx}">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <input type="text" data-ck="icon" value="${esc(ch.icon || '🎙️')}" class="glass-input w-9 text-center text-sm p-1" />
            <div>
              <input type="text" data-ck="id" value="${esc(ch.id)}" class="glass-input font-mono font-bold text-xs text-brand-400 py-0.5 px-1.5 w-40" />
              <div class="text-[10px] text-emerald-400 font-mono mt-0.5">${usedCount} timeline clips mapped</div>
            </div>
          </div>
          <button class="btn-ghost text-red-400 hover:bg-red-500/10 p-1" data-del-char="${idx}" title="Remove character"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <div>
            <div class="label">Name (বাংলা / EN)</div>
            <input type="text" data-ck="name_bn" value="${esc(ch.name_bn || ch.name_en || '')}" class="glass-input w-full text-xs" />
          </div>
          <div>
            <div class="label">Role / Archetype</div>
            <input type="text" data-ck="role_bn" value="${esc(ch.role_bn || ch.role_en || '')}" class="glass-input w-full text-xs" />
          </div>
        </div>

        <div>
          <div class="label text-emerald-300">Google AI Studio Voice (gemini-3.8-flash-tts)</div>
          <select data-ck="aistudio_voice" class="glass-input w-full text-xs font-semibold">${voiceOpts}</select>
        </div>

        <div>
          <div class="label text-amber-300">Mandatory Style ▾ Prompt (Emotion & Age Direction)</div>
          <input type="text" data-ck="style_prompt" value="${esc(ch.style_prompt || '')}" class="glass-input w-full text-xs font-mono" placeholder="An Old Story Teller, Old Man voice" />
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <div>
            <div class="label">Voice Audio FX</div>
            <select data-ck="audio_effect" class="glass-input w-full text-xs">${afxOpts}</select>
          </div>
          <div>
            <div class="label">Reference Image Anchor</div>
            <input type="text" data-ck="ref_image" value="${esc(ch.ref_image || '')}" class="glass-input w-full text-[10.5px] font-mono" placeholder="references/ref_host_sticky_meme.jpg" />
          </div>
        </div>

        <div>
          <div class="label">Visual Character DNA (Consistency Lock across all Shots)</div>
          <textarea data-ck="visual_dna" rows="2" class="glass-input w-full text-[10.5px] font-mono leading-snug">${esc(ch.visual_dna || '')}</textarea>
        </div>

        <label class="check-row text-[11px] text-amber-300">
          <input type="checkbox" data-ck="noor_veil" ${ch.noor_veil ? 'checked' : ''} />
          <span>✨ Noor-Veil Guardrail (Hide facial features with radiant divine light)</span>
        </label>
      </div>
    `;
  }).join('');
  icons();
}

/* ==================== PANEL 7: SYSTEM INSTRUCTIONS & SOP EDITOR ==================== */
let currentInstFile = 'SYSTEM_PROMPT.md';
async function loadInstructionsPanel(file = currentInstFile) {
  try {
    currentInstFile = file;
    const data = await api('GET', `/api/instructions?file=${encodeURIComponent(file)}`);
    if ($('instActiveTitle')) $('instActiveTitle').textContent = data.activeFile;
    if ($('instEditorTextarea')) $('instEditorTextarea').value = data.content || '';
    if ($('instFileList')) {
      $('instFileList').innerHTML = (data.files || []).map((f) => `
        <button data-inst-file="${esc(f.path)}" class="text-left px-2.5 py-1.5 rounded text-xs font-mono truncate transition ${f.path === data.activeFile ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40 font-bold' : 'text-slate-300 hover:bg-white/5'}">
          📄 ${esc(f.name)}
        </button>
      `).join('');
    }
  } catch (e) {
    toast(e.message, 'err');
  }
}

function wire() {
  $('projectSelect').addEventListener('change', async (e) => {
    await loadProject(e.target.value);
  });
  $('btnSave').addEventListener('click', save);
  $('btnReload').addEventListener('click', () => loadProject(S.id, true));
  $('btnOpenFolder').addEventListener('click', () => api('POST', `/api/project/${S.id}/open-folder`, {}));
  $('btnOpenExportsTop')?.addEventListener('click', () => api('POST', `/api/project/${S.id}/open-folder`, { sub: 'exports' }));
  $('btnOpenPartsFolder')?.addEventListener('click', () => api('POST', `/api/project/${S.id}/open-folder`, { sub: 'parts' }));
  $('btnAutoSync')?.addEventListener('click', syncPartsFromFolders);
  $('btnSyncAudioTab')?.addEventListener('click', syncPartsFromFolders);
  $('btnUndo')?.addEventListener('click', undo);
  $('btnRedo')?.addEventListener('click', redo);

  $('btnJumpStart')?.addEventListener('click', () => seek(0, true));
  $('btnPlay').addEventListener('click', () => (S.playing ? stop() : play()));
  $('btnPrev').addEventListener('click', () => selectScene(S.sel - 1));
  $('btnNext').addEventListener('click', () => selectScene(S.sel + 1));

  $('sceneList').addEventListener('click', (e) => {
    const c = e.target.closest('.scene-card');
    if (c) selectScene(+c.dataset.i);
  });

  // Drag & Drop Reordering in Left Scene List
  let dragSrcIdx = null;
  $('sceneList').addEventListener('dragstart', (e) => {
    const c = e.target.closest('.scene-card');
    if (!c) return;
    dragSrcIdx = +c.dataset.i;
    e.dataTransfer.effectAllowed = 'move';
  });
  $('sceneList').addEventListener('dragover', (e) => { e.preventDefault(); });
  $('sceneList').addEventListener('drop', (e) => {
    e.preventDefault();
    const c = e.target.closest('.scene-card');
    if (!c || dragSrcIdx === null) return;
    const targetIdx = +c.dataset.i;
    if (dragSrcIdx === targetIdx) return;
    pushHistory();
    const moved = S.project.scenes.splice(dragSrcIdx, 1)[0];
    S.project.scenes.splice(targetIdx, 0, moved);
    S.project.custom_scene_order = true;
    S.sel = targetIdx;
    dragSrcIdx = null;
    markDirty();
    recompute();
    renderAll();
    toast(`Moved part to position #${targetIdx + 1}`);
  });

  document.querySelectorAll('#previewLangSwitch .lang-pill').forEach((b) => b.addEventListener('click', () => {
    const wasPlaying = S.playing;
    stop();
    S.previewLang = b.dataset.lang;
    S.frameKey = null;
    setPreviewAudio();
    renderSceneList();
    renderMultiTrackTimeline();
    renderInspector();
    seek(S.t, false);
    icons();
    if (wasPlaying) play();
  }));

  $('bgmDb').addEventListener('input', (e) => {
    $('bgmDbLabel').textContent = `${e.target.value} dB`;
    $('bgmAudio').volume = dbToLin(+e.target.value);
  });

  // Inspector bindings
  const relayout = () => {
    recompute();
    renderSceneList();
    renderMultiTrackTimeline();
    highlightSel();
    seek(S.t, false);
    icons();
  };

  $('fStartTime')?.addEventListener('change', (e) => {
    const s = scene();
    if (!s) return;
    pushHistory();
    S.project.timeline_mode = 'free';
    s.custom_start = Math.max(0, parseFloat(e.target.value) || 0);
    updateModeButton();
    markDirty();
    relayout();
  });

  bindField('fDuration', 'duration', (v) => Math.max(0.5, parseFloat(v) || 0.5), () => {
    const s = scene();
    if (s) {
      s.manual_duration = true;
      s.language_durations = s.language_durations || {};
      s.language_durations[S.previewLang] = s.duration;
    }
    recompute();
    renderSceneList();
    renderMultiTrackTimeline();
    updateNarStats();
    icons();
  });

  $('btnDurMinus')?.addEventListener('click', () => {
    const s = scene();
    if (!s) return;
    pushHistory();
    const d = Math.max(0.5, +(sceneDur(s, S.previewLang) - 0.5).toFixed(2));
    s.duration = d;
    s.manual_duration = true;
    s.language_durations = s.language_durations || {};
    s.language_durations[S.previewLang] = d;
    markDirty();
    relayout();
  });
  $('btnDurPlus')?.addEventListener('click', () => {
    const s = scene();
    if (!s) return;
    pushHistory();
    const d = +(sceneDur(s, S.previewLang) + 0.5).toFixed(2);
    s.duration = d;
    s.manual_duration = true;
    s.language_durations = s.language_durations || {};
    s.language_durations[S.previewLang] = d;
    markDirty();
    relayout();
  });

  bindField('fTrimIn', 'trim_in', (v) => Math.max(0, parseFloat(v) || 0), () => renderMultiTrackTimeline());
  bindField('fSpeaker', 'dialogue_speaker', (v) => v, () => {
    const s = scene();
    const ch = (S.project?.characters || []).find((c) => c.id === s?.dialogue_speaker);
    if (s && ch) {
      s.aistudio_voice = ch.aistudio_voice;
      s.style_prompt = ch.style_prompt;
      if ($('fAiVoice')) $('fAiVoice').value = ch.aistudio_voice;
      if ($('fVoiceStyle')) $('fVoiceStyle').value = ch.style_prompt;
    }
    S.frameKey = null;
    renderMultiTrackTimeline();
    showFrame(S.t);
  });
  bindField('fType', 'type', (v) => v, () => { S.frameKey = null; renderSceneList(); renderMultiTrackTimeline(); showFrame(S.t); });
  bindField('fMotion', 'motion_effect', (v) => v, () => { S.frameKey = null; renderMultiTrackTimeline(); showFrame(S.t); });
  bindField('fVfx', 'vfx_effect', (v) => v, () => { S.frameKey = null; showFrame(S.t); });
  bindField('fAudioFx', 'audio_effect', (v) => v, () => { renderMultiTrackTimeline(); });
  bindField('fAiVoice', 'aistudio_voice', (v) => {
    const vObj = (S.data?.aistudioVoices || FALLBACK_VOICES).find((x) => x.id === v);
    const s = scene();
    if (s && vObj && !s.style_prompt) {
      s.style_prompt = vObj.defaultStyle;
      if ($('fVoiceStyle')) $('fVoiceStyle').value = vObj.defaultStyle;
    }
    return v;
  });
  bindField('fVoiceStyle', 'style_prompt');
  bindField('fSfx', 'sfx', (v) => v, () => renderMultiTrackTimeline());
  $('fSfxSelect')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val) return;
    $('fSfx').value = val;
    const s = scene();
    if (s) {
      pushHistory();
      s.sfx = val;
      markDirty();
      renderMultiTrackTimeline();
      playSynthesizedSfxPreview(val);
    }
  });
  $('btnTestSfx')?.addEventListener('click', async () => {
    const s = scene();
    const cue = ($('fSfx')?.value || 'paper_unfold_crisp').trim();
    playSynthesizedSfxPreview(cue);
    if (!S.id) return;
    try {
      const r = await api('POST', `/api/project/${S.id}/synthesize-sfx`, { cue });
      toast(`🔊 Synthesized SFX to ${r.file}`);
    } catch (er) {
      toast(`Previewed ${cue} in browser`, 'ok');
    }
  });
  $('vocalTagBar')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-vtag]');
    if (!btn) return;
    const tag = btn.dataset.vtag;
    const ta = $('fNarration');
    const start = ta.selectionStart || 0;
    const val = ta.value || '';
    ta.value = val.slice(0, start) + tag + val.slice(start);
    ta.dispatchEvent(new Event('input'));
    ta.focus();
  });
  $('btnOpenCharModal')?.addEventListener('click', () => switchBottomTab('characters'));
  $('btnOpenWizardTop')?.addEventListener('click', () => switchBottomTab('workflow'));
  $('btnOpenVoicesTop')?.addEventListener('click', () => switchBottomTab('characters'));
  bindField('fPrompt', 'visual_prompt');

  // Per-part audio controls
  const updatePartAudioProp = (prop, val) => {
    const s = scene();
    if (!s) return;
    pushHistory();
    s.audio_clips = s.audio_clips || {};
    s.audio_clips[S.previewLang] = s.audio_clips[S.previewLang] || {};
    s.audio_clips[S.previewLang][prop] = val;
    markDirty();
    renderMultiTrackTimeline();
  };
  $('fAudioVol')?.addEventListener('input', (e) => updatePartAudioProp('volume_db', parseFloat(e.target.value) || 0));
  $('fAudioFadeIn')?.addEventListener('input', (e) => updatePartAudioProp('fade_in', Math.max(0, parseFloat(e.target.value) || 0)));
  $('fAudioFadeOut')?.addEventListener('input', (e) => updatePartAudioProp('fade_out', Math.max(0, parseFloat(e.target.value) || 0)));

  $('partAudioInput')?.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f && scene()) {
      uploadFile(f, { kind: 'part_audio', sceneId: scene().scene_id, lang: S.previewLang }).catch((er) => toast(er.message, 'err'));
    }
  });

  // BGM Segment Inspector Controls
  $('fBgmStart')?.addEventListener('input', (e) => {
    const seg = S.project?.bgm_clips?.[S.selBgmIdx];
    if (!seg) return;
    seg.start_time = Math.max(0, parseFloat(e.target.value) || 0);
    markDirty();
    renderMultiTrackTimeline();
  });
  $('fBgmDur')?.addEventListener('input', (e) => {
    const seg = S.project?.bgm_clips?.[S.selBgmIdx];
    if (!seg) return;
    seg.duration = Math.max(2, parseFloat(e.target.value) || 10);
    markDirty();
    renderMultiTrackTimeline();
  });
  $('fBgmSegDb')?.addEventListener('input', (e) => {
    const seg = S.project?.bgm_clips?.[S.selBgmIdx];
    if (!seg) return;
    seg.volume_db = parseFloat(e.target.value) || -20;
    $('bgmDb').value = seg.volume_db;
    $('bgmDbLabel').textContent = `${seg.volume_db} dB`;
    markDirty();
    renderMultiTrackTimeline();
  });
  $('btnAddBgmSeg')?.addEventListener('click', () => {
    if (!S.project) return;
    pushHistory();
    S.project.bgm_clips = S.project.bgm_clips || [];
    const lastEnd = S.project.bgm_clips.reduce((m, c) => Math.max(m, (c.start_time || 0) + (c.duration || 0)), 0);
    const startT = Math.min(S.t || lastEnd, Math.max(0, total() - 10));
    S.project.bgm_clips.push({
      id: `bgm_clip_${Date.now()}`,
      title: `BGM Segment #${S.project.bgm_clips.length + 1}`,
      file: 'audio/bgm.mp3',
      start_time: +startT.toFixed(1),
      duration: 45,
      trim_in: 0,
      volume_db: -18,
      ducking: true,
      fade_in: 1.0,
      fade_out: 1.5,
      loop: true,
    });
    S.selTrack = 'bgm';
    S.selBgmIdx = S.project.bgm_clips.length - 1;
    markDirty();
    renderMultiTrackTimeline();
    renderInspector();
    toast('Added new BGM segment on Track 6');
  });

  $('fNarration').addEventListener('input', (e) => {
    const s = scene();
    if (!s) return;
    s.narration = s.narration || {};
    s.narration[S.narLang] = e.target.value;
    markDirty();
    updateNarStats();
    renderMultiTrackTimeline();
    if (S.narLang === S.previewLang) $('pvSubtitle').textContent = e.target.value;
  });
  document.querySelectorAll('#narTabs .lang-pill').forEach((b) => b.addEventListener('click', () => { S.narLang = b.dataset.lang; renderInspector(); }));
  $('btnCopyPrompt').addEventListener('click', () => copy($('fPrompt').value));

  $('btnAddScene').addEventListener('click', () => addNewPartAfter(S.sel));
  $('btnAddPartLeft')?.addEventListener('click', () => addNewPartAfter(S.project.scenes.length - 1));
  $('btnSplitScene')?.addEventListener('click', () => splitClipAt(S.sel));
  $('btnSplitAtPlayhead')?.addEventListener('click', () => {
    const scs = getScenes();
    const idx = sceneIndexAt(S.t);
    const s = scs[idx] || scs[S.sel];
    if (!s) return;
    const targetIdx = scs[idx] ? idx : S.sel;
    const localOffset = S.t - s.timestamp_start;
    const safeOffset = (localOffset >= 0.4 && localOffset <= s.duration - 0.4) ? localOffset : +(s.duration / 2).toFixed(2);
    splitClipAt(targetIdx, safeOffset);
  });

  $('btnDupScene').addEventListener('click', () => {
    pushHistory();
    const copyS = JSON.parse(JSON.stringify(scene()));
    copyS.scene_id = Math.max(...S.project.scenes.map((s) => +s.scene_id || 0)) + 1;
    S.project.scenes.splice(S.sel + 1, 0, copyS);
    S.sel++;
    markDirty();
    relayout();
    toast('Duplicated selected part');
  });
  $('btnDelScene').addEventListener('click', () => {
    if (S.selTrack === 'bgm' && (S.project.bgm_clips || []).length > 1) {
      pushHistory();
      S.project.bgm_clips.splice(S.selBgmIdx, 1);
      S.selBgmIdx = 0;
      markDirty();
      renderMultiTrackTimeline();
      renderInspector();
      return toast('Deleted BGM segment');
    }
    if (S.project.scenes.length <= 1) return toast('A project needs at least one part', 'err');
    pushHistory();
    S.project.scenes.splice(S.sel, 1);
    S.sel = Math.min(S.sel, S.project.scenes.length - 1);
    markDirty();
    relayout();
    toast('Deleted part from timeline');
  });

  // Timeline Toolbar Tools (Select vs Razor Blade Mode with Custom Blade Cursor & Red Cut Line)
  const setTimelineTool = (mode) => {
    S.tool = mode;
    document.body.classList.toggle('razor-mode', S.tool === 'razor');
    $('toolRazor')?.classList.toggle('active-tool', S.tool === 'razor');
    $('toolSelect')?.classList.toggle('active-tool', S.tool === 'select');
    if (S.tool !== 'razor') $('snapLine')?.classList.add('hidden');
  };
  $('toolSelect')?.addEventListener('click', () => {
    setTimelineTool('select');
    toast('Select & Move Tool active (V)');
  });
  $('toolRazor')?.addEventListener('click', () => {
    const nextMode = S.tool === 'razor' ? 'select' : 'razor';
    setTimelineTool(nextMode);
    if (nextMode === 'razor') {
      toast('✂️ Razor Blade Tool active (R): যেকোনো ক্লিপের ওপর ক্লিক করলেই ক্লিপটি ২ ভাগে স্প্লিট হবে!');
    } else {
      toast('Select Tool active');
    }
  });
  // Show red Razor cut guideline while hovering timeline in Razor mode
  $('nleTracksContainer')?.addEventListener('mousemove', (e) => {
    const snap = $('snapLine');
    if (!snap) return;
    if (S.tool !== 'razor') {
      snap.classList.add('hidden');
      return;
    }
    const lane = e.target.closest('.nle-track-lane');
    if (!lane) {
      snap.classList.add('hidden');
      return;
    }
    const r = lane.getBoundingClientRect();
    const x = TRACK_HEADER_W + Math.max(0, e.clientX - r.left);
    snap.style.left = `${x}px`;
    snap.classList.remove('hidden');
  });
  $('nleTracksContainer')?.addEventListener('mouseleave', () => {
    $('snapLine')?.classList.add('hidden');
  });
  $('btnToggleMode')?.addEventListener('click', () => {
    if (!S.project) return;
    pushHistory();
    S.project.timeline_mode = S.project.timeline_mode === 'free' ? 'ripple' : 'free';
    updateModeButton();
    markDirty();
    recompute();
    renderMultiTrackTimeline();
    toast(S.project.timeline_mode === 'free'
      ? 'Free Multi-Track Mode: drag clips to any timestamp independently'
      : 'Ripple Sync Mode: clips snap sequentially without gaps');
  });
  $('btnTrackSize')?.addEventListener('click', () => {
    const order = ['compact', 'normal', 'expanded'];
    const labels = { compact: 'Compact Tracks', normal: 'Normal Tracks', expanded: 'Tall Tracks' };
    S.trackSizeMode = order[(order.indexOf(S.trackSizeMode) + 1) % order.length];
    $('trackSizeLabel').textContent = labels[S.trackSizeMode];
    renderMultiTrackTimeline();
    icons();
  });

  // Smart Fractional Zoom controls (Fits even 25-minute documentaries cleanly inside viewport!)
  $('tlZoom')?.addEventListener('input', (e) => {
    S.zoom = Math.max(0.2, parseFloat(e.target.value) || 12);
    renderMultiTrackTimeline();
    icons();
  });
  $('btnZoomIn')?.addEventListener('click', () => {
    const step = S.zoom < 3 ? 0.5 : (S.zoom < 10 ? 2 : 4);
    S.zoom = Math.min(50, +(S.zoom + step).toFixed(2));
    $('tlZoom').value = S.zoom;
    renderMultiTrackTimeline();
    icons();
  });
  $('btnZoomOut')?.addEventListener('click', () => {
    const step = S.zoom <= 3 ? 0.4 : (S.zoom <= 10 ? 2 : 4);
    S.zoom = Math.max(0.2, +(S.zoom - step).toFixed(2));
    $('tlZoom').value = S.zoom;
    renderMultiTrackTimeline();
    icons();
  });
  $('btnZoomFit')?.addEventListener('click', () => {
    const availW = Math.max(360, ($('nleScrollContainer')?.clientWidth || 1000) - TRACK_HEADER_W - 24);
    const exactZoom = availW / Math.max(10, total() + 4);
    S.zoom = Math.max(0.2, Math.min(50, +exactZoom.toFixed(2)));
    $('tlZoom').value = S.zoom;
    renderMultiTrackTimeline();
    icons();
    toast(`Timeline fitted to screen (${S.zoom.toFixed(1)} px/s)`);
  });

  // Dropzone
  const dz = $('dropzone');
  dz.addEventListener('click', () => $('fileInput').click());
  $('fileInput').addEventListener('change', (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) uploadFile(f, { kind: 'scene', sceneId: scene().scene_id }).catch((er) => toast(er.message, 'err'));
  });
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('over');
    const f = e.dataTransfer.files[0];
    if (f) uploadFile(f, { kind: 'scene', sceneId: scene().scene_id }).catch((er) => toast(er.message, 'err'));
  });

  // Bottom dock tabs
  document.querySelectorAll('#tabs .tab').forEach((t) => t.addEventListener('click', () => {
    switchBottomTab(t.dataset.tab);
  }));

  // Audio tab
  $('audioRows').addEventListener('change', (e) => {
    const k = e.target.dataset.upload;
    const f = e.target.files?.[0];
    if (!k || !f) return;
    uploadFile(f, k === 'bgm' ? { kind: 'bgm' } : { kind: 'narration', lang: k }).catch((er) => toast(er.message, 'err'));
  });
  $('audioRows').addEventListener('click', (e) => {
    const b = e.target.closest('[data-fit]');
    if (!b) return;
    const d = S.data.audio[b.dataset.fit]?.duration;
    const T = total();
    if (!d || !T) return;
    pushHistory();
    const f = d / T;
    let acc = 0;
    S.project.scenes.forEach((s, i, arr) => {
      if (i === arr.length - 1) s.duration = +(d - acc).toFixed(2);
      else { s.duration = +(s.duration * f).toFixed(2); acc += s.duration; }
    });
    markDirty();
    recompute();
    renderAll();
    toast('Timeline fitted to narration');
  });

  // Launchpad
  $('launchCards').addEventListener('change', (e) => {
    const l = e.target.dataset.thumb;
    const f = e.target.files?.[0];
    if (l && f) uploadFile(f, { kind: 'thumbnail', lang: l }).catch((er) => toast(er.message, 'err'));
  });
  $('launchCards').addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    copy(b.closest('[data-seo]').querySelector(`[data-k="${b.dataset.copy}"]`).value);
  });
  $('launchCards').addEventListener('input', (e) => {
    if (e.target.dataset.k === 'title') e.target.closest('div').querySelector('.label span').textContent = `${e.target.value.length}/100`;
  });
  $('btnSaveSeo').addEventListener('click', async () => {
    try { S.data.seo = collectSeo(); await api('PUT', `/api/project/${S.id}/seo`, S.data.seo); toast('SEO saved'); } catch (er) { toast(er.message, 'err'); }
  });

  // Render triggers
  const triggerRender = async () => {
    try {
      switchBottomTab('render');
      if (S.dirty) await save();
      const langs = [...document.querySelectorAll('.rlang:checked')].map((c) => c.value);
      const exportShorts = $('optDualShorts') ? $('optDualShorts').checked : true;
      const embedIntroThumbnail = $('optEmbedIntroThumb') ? $('optEmbedIntroThumb').checked : true;
      await api('POST', `/api/project/${S.id}/render`, {
        langs,
        bgmDb: +$('bgmDb').value,
        duck: $('optDuck').checked,
        useBgm: $('optBgm').checked,
        exportShorts,
        embedIntroThumbnail,
      });
      toast('Rendering started → Outputting to exports/ folder');
    } catch (er) { toast(er.message, 'err'); }
  };
  $('btnRender').addEventListener('click', triggerRender);
  $('btnQuickRender')?.addEventListener('click', triggerRender);
  $('btnCancel').addEventListener('click', () => api('POST', `/api/project/${S.id}/render/cancel`).catch((er) => toast(er.message, 'err')));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); S.playing ? stop() : play(); }
    if (e.key.toLowerCase() === 'b') { e.preventDefault(); $('btnSplitAtPlayhead')?.click(); }
    if (e.key.toLowerCase() === 'v') { e.preventDefault(); $('toolSelect')?.click(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); selectScene(S.sel + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); selectScene(S.sel - 1); }
  });

  // Workflow Wizard Events
  $('wizCategory')?.addEventListener('change', () => {
    renderWorkflowWizard();
    icons();
  });
  $('wizMinutes')?.addEventListener('input', () => renderWorkflowWizard());

  $('btnGenTopicIdeas')?.addEventListener('click', () => {
    const cat = $('wizCategory')?.value || 'PRESET_VOX_DOCUMENTARY';
    const list = VIRAL_TOPICS_BY_PRESET[cat] || VIRAL_TOPICS_BY_PRESET.PRESET_VOX_DOCUMENTARY;
    const box = $('viralTopicsBox');
    if (!box) return;
    box.classList.remove('hidden');
    box.innerHTML = `<div class="text-[10px] font-bold text-emerald-300 uppercase">Click any viral topic below to load it into the Wizard:</div>` +
      list.map((t) => `<button type="button" data-pick-topic="${esc(t)}" class="block w-full text-left px-2 py-1 rounded hover:bg-emerald-500/20 text-[11px] text-slate-200 truncate">💡 ${esc(t)}</button>`).join('');
  });

  $('viralTopicsBox')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick-topic]');
    if (!b) return;
    const topic = b.dataset.pickTopic;
    if ($('wizTopic')) $('wizTopic').value = topic;
    if ($('wizProjId') && !$('wizProjId').value) {
      $('wizProjId').value = topic.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 28) || `studio_${Date.now().toString(36)}`;
    }
    toast('Loaded topic into Wizard');
  });

  $('btnCreateWizardProject')?.addEventListener('click', async () => {
    try {
      const style_preset = $('wizCategory')?.value || 'PRESET_VOX_DOCUMENTARY';
      const target_minutes = parseFloat($('wizMinutes')?.value || 5);
      const topic_summary = ($('wizTopic')?.value || 'New Automated Studio Documentary').trim();
      const project_id = ($('wizProjId')?.value || '').trim();
      const halal_audio_mode = Boolean($('wizHalalAudio')?.checked);
      toast('Scaffolding complete multi-track project...');
      const res = await api('POST', '/api/projects/create-wizard', {
        project_id,
        style_preset,
        target_minutes,
        topic_summary,
        halal_audio_mode,
      });
      await loadProjects(res.id);
      switchBottomTab('timeline');
      toast(`Created "${res.id}" with ${res.project.scenes.length} granular clips!`);
    } catch (er) {
      toast(er.message, 'err');
    }
  });

  $('btnApplyCategoryToCurrent')?.addEventListener('click', async () => {
    if (!S.id) return;
    try {
      const style_preset = $('wizCategory')?.value || S.project.style_preset;
      pushHistory();
      const res = await api('POST', `/api/project/${S.id}/agent-edit`, {
        action: 'apply_category_preset',
        payload: { style_preset, apply_to_all_scenes: true },
      });
      S.project = res.project;
      const pb = $('presetBadge');
      pb.textContent = PRESET_LABEL[S.project.style_preset] || S.project.style_preset;
      pb.classList.remove('hidden');
      renderAll();
      toast(`Applied ${PRESET_LABEL[style_preset]} motion & VFX across project!`);
    } catch (er) {
      toast(er.message, 'err');
    }
  });

  $('btnRunAgentCmd')?.addEventListener('click', async () => {
    if (!S.id) return;
    const command = ($('agentCmdInput')?.value || '').trim();
    if (!command) return toast('Enter a @timestamp command first', 'err');
    try {
      pushHistory();
      const res = await api('POST', `/api/project/${S.id}/agent-edit`, {
        action: 'timestamp_command',
        payload: { command },
      });
      S.project = res.project;
      recompute();
      renderAll();
      toast(`Executed timestamp edit: ${command}`);
    } catch (er) {
      toast(er.message, 'err');
    }
  });

  $('btnExportPromptPack')?.addEventListener('click', async () => {
    if (!S.id) return;
    try {
      if (S.dirty) await save();
      const res = await api('POST', `/api/project/${S.id}/export-prompts`, {});
      if ($('promptPackPreview')) {
        $('promptPackPreview').textContent = `${res.ttsPreview}\n\n${res.imgPreview}`;
      }
      toast(`Generated ${res.files.join(', ')} in project folder!`);
    } catch (er) {
      toast(er.message, 'err');
    }
  });

  // Character & Voice Mapping Studio Events
  $('charactersGrid')?.addEventListener('input', (e) => {
    const card = e.target.closest('[data-char-idx]');
    if (!card || !S.project?.characters) return;
    const idx = +card.dataset.charIdx;
    const ch = S.project.characters[idx];
    const key = e.target.dataset.ck;
    if (!ch || !key) return;
    if (e.target.type === 'checkbox') {
      ch[key] = e.target.checked;
    } else {
      ch[key] = e.target.value;
      if (key === 'aistudio_voice') {
        const vObj = (S.data?.aistudioVoices || FALLBACK_VOICES).find((x) => x.id === e.target.value);
        if (vObj) {
          ch.style_prompt = vObj.defaultStyle;
          const styleInp = card.querySelector('[data-ck="style_prompt"]');
          if (styleInp) styleInp.value = vObj.defaultStyle;
        }
      }
    }
    markDirty();
  });

  $('charactersGrid')?.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-del-char]');
    if (!delBtn || !S.project?.characters) return;
    const idx = +delBtn.dataset.delChar;
    if (S.project.characters.length <= 1) return toast('Keep at least 1 character in roster', 'err');
    pushHistory();
    S.project.characters.splice(idx, 1);
    markDirty();
    renderCharactersPanel();
    renderInspector();
  });

  $('btnAddCharacter')?.addEventListener('click', () => {
    if (!S.project) return;
    pushHistory();
    S.project.characters = S.project.characters || [];
    const n = S.project.characters.length + 1;
    S.project.characters.push({
      id: `CHARACTER_${n}`,
      name_bn: `নতুন চরিত্র #${n}`,
      name_en: `Character #${n}`,
      name_hi: `पात्र #${n}`,
      role_bn: 'গল্পের চরিত্র',
      role_en: 'Story Character',
      role_hi: 'कहानी का पात्र',
      gender: 'Male',
      age_group: 'Adult',
      icon: '🎭',
      badge_class: 'speaker-badge-character',
      aistudio_voice: 'Iapetus',
      fallback_voice: 'Charon',
      style_prompt: 'warm, natural dramatic acting',
      default_wpm: 138,
      volume_db: 0,
      audio_effect: 'studio_clean',
      ref_image: '',
      noor_veil: false,
      visual_dna: 'Consistent facial structure, hairstyle, and period/modern attire across all scenes.',
    });
    markDirty();
    renderCharactersPanel();
    renderInspector();
    toast('Added new character to roster');
  });

  $('btnSyncCharsToScenes')?.addEventListener('click', async () => {
    if (!S.id || !S.project) return;
    try {
      const res = await api('POST', `/api/project/${S.id}/agent-edit`, {
        action: 'update_characters',
        payload: { characters: S.project.characters, sync_scenes: true },
      });
      S.project = res.project;
      clearDirty();
      renderAll();
      toast('Synced all character voices & styles across timeline scenes!');
    } catch (er) {
      toast(er.message, 'err');
    }
  });

  // System Instructions Panel Events
  document.querySelector('[data-tab="instructions"]')?.addEventListener('click', () => {
    loadInstructionsPanel(currentInstFile);
  });
  $('instFileList')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-inst-file]');
    if (b) loadInstructionsPanel(b.dataset.instFile);
  });
  $('btnCopyInstruction')?.addEventListener('click', () => {
    copy($('instEditorTextarea')?.value || '');
  });
  $('btnSaveInstruction')?.addEventListener('click', async () => {
    try {
      await api('PUT', '/api/instructions', {
        file: currentInstFile,
        content: $('instEditorTextarea')?.value || '',
      });
      toast(`Saved ${currentInstFile}`);
    } catch (er) {
      toast(er.message, 'err');
    }
  });


  $('pipelineStepsGrid')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-stage-idx]');
    if (!b) return;
    const stg = +b.dataset.stageIdx;
    if (stg === 1) $('btnGenTopicIdeas')?.click();
    else if (stg === 2 || stg === 4) switchBottomTab('instructions');
    else if (stg === 3 || stg === 7) switchBottomTab('characters');
    else if (stg === 5 || stg === 6) $('btnExportPromptPack')?.click();
    else if (stg === 8) switchBottomTab('audio');
    else if (stg === 9) switchBottomTab('timeline');
    else if (stg === 10) switchBottomTab('render');
  });

  document.querySelectorAll('[data-quick-cmd]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if ($('agentCmdInput')) $('agentCmdInput').value = btn.dataset.quickCmd;
      $('btnRunAgentCmd')?.click();
    });
  });

  $('btnSendToAgentNow')?.addEventListener('click', async () => {
    if (!S.id || !S.project) return;
    try {
      await api('POST', `/api/project/${S.id}/agent-edit`, {
        action: 'update_characters',
        payload: { characters: S.project.characters || [], sync_scenes: true },
      });
      await save();
      const res = await api('POST', `/api/project/${S.id}/export-prompts`, {});
      if ($('promptPackPreview')) {
        $('promptPackPreview').textContent = `✓ AGENT BRIDGE PAYLOAD SAVED (${res.files.join(', ')})\n\n` +
          `CLI Commands for Autonomous Agent:\n` +
          `• TTS Speech: node tools/auto_account_and_model_switching_tts.js ${S.id}\n` +
          `• Flow Images: node tools/parallel_batch_image_generator.js ${S.id}\n` +
          `• Veo Videos:  node tools/generate_all_ai_videos.js ${S.id}\n\n` +
          `${res.ttsPreview}`;
      }
      if ($('agentBridgeStatusBadge')) {
        $('agentBridgeStatusBadge').textContent = `● Agent Queue Updated (${S.project.scenes.length} clips)`;
      }
      toast(`🚀 Sent ${S.project.scenes.length} clips & ${(S.project.characters || []).length} characters to Agent Queue!`);
    } catch (er) {
      toast(er.message, 'err');
    }
  });

  $('btnCopyAgentCli')?.addEventListener('click', () => {
    const cli = `node tools/auto_account_and_model_switching_tts.js ${S.id} && node tools/parallel_batch_image_generator.js ${S.id} && node tools/dual_render_exporter.js ${S.id}`;
    copy(cli);
    toast('Copied Agent CLI pipeline command to clipboard!');
  });

  
  // Extra Pro Inspector Controls (Speed, Opacity, Callout Badge)
  bindField('fClipSpeed', 'clip_speed', (v) => Math.max(0.25, Math.min(4, parseFloat(v) || 1)));
  bindField('fClipOpacity', 'clip_opacity', (v) => Math.max(10, Math.min(100, parseFloat(v) || 100)), () => showFrame(S.t));
  bindField('fCalloutText', 'callout_text', (v) => v, () => { S.frameKey = null; showFrame(S.t); });

  $('btnOpenFxBrowser')?.addEventListener('click', () => {
    switchBottomTab('fxlibrary');
    populateFxCategoryDropdown();
    renderFxBrowser();
  });
  $('fxTabMotions')?.addEventListener('click', () => {
    activeFxTab = 'motions';
    $('fxTabMotions').className = 'btn-primary text-xs py-1 px-3';
    $('fxTabVfx').className = 'btn-ghost border border-white/15 text-xs py-1 px-3';
    populateFxCategoryDropdown();
    renderFxBrowser();
  });
  $('fxTabVfx')?.addEventListener('click', () => {
    activeFxTab = 'vfx';
    $('fxTabVfx').className = 'btn-primary text-xs py-1 px-3';
    $('fxTabMotions').className = 'btn-ghost border border-white/15 text-xs py-1 px-3';
    populateFxCategoryDropdown();
    renderFxBrowser();
  });
  $('fxCategoryFilter')?.addEventListener('change', renderFxBrowser);
  $('fxSearchInput')?.addEventListener('input', renderFxBrowser);

  $('fxBrowserGrid')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-fx-apply]');
    if (!card) return;
    const id = card.dataset.fxApply;
    const kind = card.dataset.fxKind;
    const s = scene();
    if (!s) return;
    pushHistory();
    if (kind === 'motion') {
      s.motion_effect = id;
      if ($('fMotion')) $('fMotion').value = id;
    } else {
      s.vfx_effect = id;
      if ($('fVfx')) $('fVfx').value = id;
    }
    S.frameKey = null;
    markDirty();
    renderMultiTrackTimeline();
    renderFxBrowser();
    showFrame(S.t);
    toast(`Applied ${kind === 'motion' ? (MOTION_LABEL[id] || id) : (VFX_LABEL[id] || id)} to Part #${S.sel + 1}`);
  });

  $('btnApplyFxAll')?.addEventListener('click', () => {
    const s = scene();
    if (!s || !S.project?.scenes) return;
    pushHistory();
    const m = s.motion_effect || 'zoom_in';
    const v = s.vfx_effect || 'none';
    S.project.scenes.forEach((sc) => {
      if (sc.type !== 'DYNAMIC_AI_VIDEO') sc.motion_effect = m;
      sc.vfx_effect = v;
    });
    S.frameKey = null;
    markDirty();
    renderAll();
    toast(`Applied Transition "${MOTION_LABEL[m] || m}" & VFX "${VFX_LABEL[v] || v}" to all ${S.project.scenes.length} scenes!`);
  });

  $('btnOpenAudioGuideDoc')?.addEventListener('click', () => {
    switchBottomTab('instructions');
    loadInstructionsPanel('AUDIO_COLLECTION_GUIDE.md');
  });

  $('btnAddMarker')?.addEventListener('click', () => {
    if (!S.project) return;
    S.project.markers = S.project.markers || [];
    const t = +S.t.toFixed(1);
    S.project.markers.push({ time: t, label: `Marker @${fmt(t)}` });
    markDirty();
    renderMultiTrackTimeline();
    toast(`📍 Added Timeline Marker at ${fmt(t)}`);
  });

  populateFxCategoryDropdown();

  wireNleTimelineInteractions();
}

async function checkGpuHealth() {
  try {
    const data = await api('GET', '/api/health');
    if (data.gpu) {
      const isApu = data.gpu.isApu || /radeon|vega|intel|uhd|iris/i.test(data.gpu.name || '');
      if ($('gpuStatusText')) {
        $('gpuStatusText').textContent = data.gpu.isGpu
          ? (isApu ? 'APU Acceleration: ACTIVE' : 'GPU Acceleration: ACTIVE')
          : 'CPU Software Mode: ACTIVE';
      }
      if ($('gpuDeviceText')) $('gpuDeviceText').textContent = data.gpu.name;
      if ($('gpuSubText')) {
        $('gpuSubText').textContent = data.gpu.isGpu
          ? '⚡ Hardware render to exports/ folder (auto CPU fallback)'
          : '🛡️ Universal CPU render to exports/ folder';
      }
    }
  } catch {}
}


/* ==================== STUDIO PRO v2: SHORTS BUILDER, 9:16 PORTRAIT STAGE, OVERLAYS & HOVER PREVIEWS ==================== */

const AI_LOGO_PRESETS = [
  '/references/mascot_logo_ref.jpg',
  '/banner_assets/mascot_01_modern_chronicler_sht.jpg',
  '/banner_assets/mascot_02_wise_owl_history_teller.jpg',
  '/banner_assets/mascot_04_wise_elder_chronicler_sht.jpg',
  '/banner_assets/mascot_06_hourglass_guardian_sht.jpg',
  '/banner_assets/mascot_08_monogram_scholar_fusion.jpg',
  '/banner_assets/mascot_10_cosmic_portal_chronicler.jpg',
  '/banner_assets/history_mascot_01_pyramid_arch_quill.jpg',
  '/banner_assets/history_mascot_05_antique_gold_coin_seal.jpg'
];
let aiLogoIdx = 0;

function bnNum(n) {
  return String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
}
function hiNum(n) {
  return String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[d]);
}

function resizeStageToFit() {
  const wrap = $('stageWrapper');
  const stg = $('stage');
  if (!wrap || !stg) return;
  const rect = wrap.getBoundingClientRect();
  const companionW = (S.studioMode === 'shorts' && !$('shortsSideCompanion')?.classList.contains('hidden')) ? 306 : 0;
  const availW = Math.max(200, rect.width - companionW - 12);
  const availH = Math.max(180, rect.height - 8);

  if (S.studioMode === 'shorts') {
    const aspect = 9 / 16;
    let h = availH;
    let w = h * aspect;
    if (w > availW) {
      w = availW;
      h = w / aspect;
    }
    stg.style.width = `${Math.floor(w)}px`;
    stg.style.height = `${Math.floor(h)}px`;
    stg.classList.add('shorts-mode-stage');
  } else {
    const aspect = 16 / 9;
    let w = availW;
    let h = w / aspect;
    if (h > availH) {
      h = availH;
      w = h * aspect;
    }
    stg.style.width = `${Math.floor(w)}px`;
    stg.style.height = `${Math.floor(h)}px`;
    stg.classList.remove('shorts-mode-stage');
  }
}

function getShortsParts() {
  if (!S.project) return [];
  if (!S.project.shorts_config || !Array.isArray(S.project.shorts_config.parts) || !S.project.shorts_config.parts.length) {
    S.project.shorts_config = S.project.shorts_config || {};
    S.project.shorts_config.parts = clientSuggestShortsParts(S.project.shorts_config.total_parts || 5, '');
  }
  return S.project.shorts_config.parts;
}

function clientSuggestShortsParts(requestedParts = 10, customPrompt = '') {
  const scs = getScenes(S.previewLang);
  const totalScenes = scs.length;
  if (!totalScenes) return [];

  let ranges = [];
  if (customPrompt && String(customPrompt).trim()) {
    const norm = String(customPrompt)
      .replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d))
      .replace(/[०-९]/g, (d) => '०१२३४५६७८९'.indexOf(d));
    const pairs = [...norm.matchAll(/(\d{1,3})\s*(?:-|–|to|থেকে|से)\s*(\d{1,3})/gi)];
    if (pairs.length >= 2) {
      ranges = pairs.map((m, idx) => ({
        partNum: idx + 1,
        sceneStart: Math.max(1, Math.min(totalScenes, parseInt(m[1], 10))),
        sceneEnd: Math.max(1, Math.min(totalScenes, parseInt(m[2], 10)))
      }));
    } else {
      const nMatch = norm.match(/(\d{1,2})\s*(?:parts?|shorts?|episodes?|টি|টা|পর্ব|পার্ট|ভাগ)/i);
      if (nMatch) requestedParts = Math.max(1, Math.min(totalScenes, parseInt(nMatch[1], 10)));
      const singleSpan = norm.match(/(?:scene|সিন|পার্ট|ক্লিপ)?\s*(\d{1,3})\s*(?:-|–|to|থেকে)\s*(\d{1,3})/i);
      if (singleSpan) {
        const sStart = Math.max(1, Math.min(totalScenes, parseInt(singleSpan[1], 10)));
        const sEnd = Math.max(sStart, Math.min(totalScenes, parseInt(singleSpan[2], 10)));
        const spanLen = sEnd - sStart + 1;
        const pCount = Math.max(1, Math.min(spanLen, Number(requestedParts) || 5));
        for (let p = 0; p < pCount; p++) {
          const a = sStart + Math.floor((p * spanLen) / pCount);
          const b = p === pCount - 1 ? sEnd : sStart + Math.floor(((p + 1) * spanLen) / pCount) - 1;
          ranges.push({ partNum: p + 1, sceneStart: a, sceneEnd: Math.max(a, b) });
        }
      }
    }
  }

  if (!ranges.length) {
    const pCount = Math.max(1, Math.min(totalScenes, parseInt(requestedParts, 10) || 10));
    for (let p = 0; p < pCount; p++) {
      const a = 1 + Math.floor((p * totalScenes) / pCount);
      const b = p === pCount - 1 ? totalScenes : Math.floor(((p + 1) * totalScenes) / pCount);
      ranges.push({ partNum: p + 1, sceneStart: a, sceneEnd: Math.max(a, b) });
    }
  }

  const mainBn = S.project?.metadata?.title_bn || S.project?.project_id || 'ইতিহাসের রহস্য';
  const mainEn = S.project?.metadata?.title_en || S.project?.project_id || 'Historical Mystery';
  const mainHi = S.project?.metadata?.title_hi || mainEn;

  return ranges.map((r, idx) => {
    const partNum = idx + 1;
    const sStart = Math.max(1, Math.min(totalScenes, r.sceneStart));
    const sEnd = Math.max(sStart, Math.min(totalScenes, r.sceneEnd));
    const firstOrig = S.project.scenes[sStart - 1] || S.project.scenes[0];
    const st = scs[sStart - 1]?.timestamp_start || 0;
    const en = scs[sEnd - 1]?.timestamp_end || st + 10;
    const dur = +(en - st).toFixed(1);

    const hookFrom = (l, fb) => {
      const raw = (firstOrig?.narration?.[l] || '').replace(/<[^>]+>/g, '').trim();
      if (!raw) return fb;
      const cl = raw.split(/[।?!.!]/)[0].trim();
      return cl.length > 52 ? cl.slice(0, 50) + '…' : (cl || fb);
    };

    const padP = String(partNum).padStart(2, '0');
    return {
      partNum,
      sceneStart: sStart,
      sceneEnd: sEnd,
      sceneRange: [sStart, sEnd],
      sceneCount: sEnd - sStart + 1,
      startTime: +st.toFixed(1),
      endTime: +en.toFixed(1),
      duration: dur,
      title_bn: `${hookFrom('bn', mainBn)} [পর্ব ${bnNum(partNum)}]`,
      title_en: `${hookFrom('en', mainEn)} [Part ${partNum}]`,
      title_hi: `${hookFrom('hi', mainHi)} [भाग ${hiNum(partNum)}]`,
      main_title_bn: mainBn,
      main_title_en: mainEn,
      main_title_hi: mainHi,
      thumbnail_files: {
        bn: `thumbnails/shorts/short_part_${padP}_bn.png`,
        en: `thumbnails/shorts/short_part_${padP}_en.png`,
        hi: `thumbnails/shorts/short_part_${padP}_hi.png`
      }
    };
  });
}

function updateStageOverlaysForScene(orig, sceneIdx) {
  if (!S.project || !orig) return;
  const lang = S.previewLang;
  const isShorts = S.studioMode === 'shorts';

  // 1. 9:16 Shorts Branded Top & Bottom Bars
  const topBar = $('pvShortsTopBar');
  const botBar = $('pvShortsBottomBar');
  const topDbg = $('pvTopDebugBadges');
  const logoOv = $('pvChannelLogoOverlay');
  const subEl = $('pvSubtitle');

  if (isShorts) {
    topBar?.classList.remove('hidden');
    botBar?.classList.remove('hidden');
    topDbg?.classList.add('hidden');
    logoOv?.classList.add('hidden');
    if (subEl) subEl.style.bottom = '34%';

    const parts = getShortsParts();
    // Find which Short contains sceneIdx + 1, or use activeShortIdx
    const scNum = sceneIdx + 1;
    const matchIdx = parts.findIndex((p) => scNum >= p.sceneStart && scNum <= p.sceneEnd);
    if (matchIdx >= 0 && S.playing) S.activeShortIdx = matchIdx;
    const curPart = parts[S.activeShortIdx] || parts[0] || { partNum: 1, sceneStart: 1, sceneEnd: S.project.scenes.length, title_bn: S.project.metadata?.title_bn };

    const logoPath = resolveRefUrl(S.project.branding?.logo_file || '/references/mascot_logo_ref.jpg');
    if ($('pvShortsLogoImg')) $('pvShortsLogoImg').src = logoPath;
    const chName = S.project.branding?.[`channel_name_${lang}`] || S.project.branding?.channel_name_bn || LANG_FULL[lang];
    if ($('pvShortsChannelName')) $('pvShortsChannelName').textContent = chName;
    if ($('pvShortsChannelHandle')) $('pvShortsChannelHandle').textContent = lang === 'bn' ? '@SimpleHistoryTellerBangla' : (lang === 'hi' ? '@SimpleHistoryTellerHindi' : '@SimpleHistoryTellerOfficial');
    const pBadge = lang === 'bn' ? `পর্ব ${bnNum(curPart.partNum)} / ${bnNum(parts.length)}` : (lang === 'hi' ? `भाग ${hiNum(curPart.partNum)} / ${hiNum(parts.length)}` : `PART ${curPart.partNum} / ${parts.length}`);
    if ($('pvShortsPartPill')) $('pvShortsPartPill').textContent = pBadge;
    const sTitle = curPart[`title_${lang}`] || curPart.title_bn || S.project.metadata?.[`title_${lang}`] || '';
    if ($('pvShortsHookTitle')) $('pvShortsHookTitle').textContent = sTitle;
    const mTitle = S.project.metadata?.[`title_${lang}`] || S.project.metadata?.title_bn || S.id;
    if ($('pvShortsMainVideoTitle')) $('pvShortsMainVideoTitle').textContent = mTitle;
    if ($('pvShortsCtaBar')) $('pvShortsCtaBar').textContent = S.project.shorts_config?.cta_text || '▶ সম্পূর্ণ ভিডিও দেখুন চ্যানেলে • SUBSCRIBE';
  } else {
    topBar?.classList.add('hidden');
    botBar?.classList.add('hidden');
    topDbg?.classList.remove('hidden');
    if (subEl) subEl.style.bottom = S.project.ticker_config?.position === 'bottom' ? '2.4rem' : '1.75rem';

    // 16:9 Channel Logo Watermark
    const bCfg = S.project.branding || { enabled: true, position: 'top-right', logo_file: 'references/mascot_logo_ref.jpg' };
    if (logoOv) {
      if (bCfg.enabled === false) {
        logoOv.classList.add('hidden');
      } else {
        logoOv.classList.remove('hidden');
        const lUrl = resolveRefUrl(bCfg.logo_file?.startsWith('branding/') ? `/projects/${S.id}/${bCfg.logo_file}` : (bCfg.logo_file || '/references/mascot_logo_ref.jpg'));
        if ($('pvChannelLogoImg')) $('pvChannelLogoImg').src = lUrl;
        if ($('pvChannelLogoName')) $('pvChannelLogoName').textContent = bCfg[`channel_name_${lang}`] || bCfg.channel_name_bn || 'Simple History Teller';
        const pos = bCfg.position || 'top-right';
        logoOv.style.top = pos.includes('top') ? '0.65rem' : 'auto';
        logoOv.style.bottom = pos.includes('bottom') ? '2.5rem' : 'auto';
        logoOv.style.right = pos.includes('right') ? '0.75rem' : 'auto';
        logoOv.style.left = pos.includes('left') ? '0.75rem' : 'auto';
      }
    }
  }

  // 2. Motion Text Card Overlay (Voice of Dhaka / Vox / Broadcast Styles)
  const tcEl = $('pvTextCardOverlay');
  const tcInner = $('pvTextCardInner');
  if (tcEl && tcInner) {
    const tcText = (orig.text_card_text || '').trim();
    if (tcText) {
      const style = orig.text_card_style || 'voice_of_dhaka_quote';
      const motion = orig.text_card_motion || 'lr';
      tcEl.className = `absolute ${isShorts ? 'top-[32%] inset-x-4 max-w-[92%]' : 'top-14 left-6 max-w-[68%]'} px-4 py-2.5 rounded-xl z-25 pointer-events-none tc-style-${style} text-card-anim-${motion}`;
      tcInner.textContent = tcText;
      tcEl.classList.remove('hidden');
    } else {
      tcEl.classList.add('hidden');
    }
  }

  // 3. TV Channel Scrolling News Ticker Overlay
  const tkOv = $('pvNewsTickerOverlay');
  if (tkOv) {
    const tkCfg = S.project.ticker_config || {};
    const pos = orig.ticker_position || tkCfg.position || 'none';
    const tkText = (orig.ticker_text || tkCfg[`text_${lang}`] || tkCfg.text_bn || '').trim();
    if (pos !== 'none' && tkText && !isShorts) {
      tkOv.style.top = pos === 'top' ? '0' : 'auto';
      tkOv.style.bottom = pos === 'bottom' ? '0' : 'auto';
      if ($('pvNewsTickerLabel')) $('pvNewsTickerLabel').textContent = tkCfg[`label_${lang}`] || tkCfg.label_bn || '● আপডেট';
      if ($('pvNewsTickerTrack')) $('pvNewsTickerTrack').textContent = `${tkText}   •   ${tkText}`;
      tkOv.classList.remove('hidden');
    } else {
      tkOv.classList.add('hidden');
    }
  }
}

function setStudioMode(mode) {
  S.studioMode = mode === 'shorts' ? 'shorts' : 'master';
  $('btnModeMaster')?.classList.toggle('active', S.studioMode === 'master');
  $('btnModeShorts')?.classList.toggle('active', S.studioMode === 'shorts');
  $('shortsStageToolbar')?.classList.toggle('hidden', S.studioMode !== 'shorts');
  $('shortsSideCompanion')?.classList.toggle('hidden', S.studioMode !== 'shorts');

  if (S.studioMode === 'shorts') {
    setLeftSidebarMode('shorts');
    selectShortEpisode(S.activeShortIdx || 0, false);
  }
  S.frameKey = null;
  resizeStageToFit();
  renderMultiTrackTimeline();
  showFrame(S.t);
  icons();
}

function setLeftSidebarMode(mode) {
  S.leftMode = mode;
  document.querySelectorAll('[data-left-mode]').forEach((b) => b.classList.toggle('active', b.dataset.leftMode === mode));
  $('leftViewClips')?.classList.toggle('hidden', mode !== 'clips');
  $('leftViewShorts')?.classList.toggle('hidden', mode !== 'shorts');
  $('leftViewFxQuick')?.classList.toggle('hidden', mode !== 'fxquick');
  $('leftViewOverlays')?.classList.toggle('hidden', mode !== 'overlays');
  if (mode === 'fxquick') renderLeftQuickFxList();
  if (mode === 'overlays') renderOverlaysPanel();
  if (mode === 'shorts') renderShortsPartsList();
  icons();
}

function selectShortEpisode(partIdx, autoPlay = false) {
  const parts = getShortsParts();
  if (!parts.length) return;
  S.activeShortIdx = Math.max(0, Math.min(parts.length - 1, partIdx));
  const p = parts[S.activeShortIdx];
  const scs = getScenes(S.previewLang);
  const startSc = scs[(p.sceneStart || 1) - 1] || scs[0];
  const endSc = scs[(p.sceneEnd || scs.length) - 1] || scs[scs.length - 1];
  const st = startSc ? startSc.timestamp_start : (p.startTime || 0);
  const en = endSc ? endSc.timestamp_end : (p.endTime || total());

  if ($('activeShortBadge')) $('activeShortBadge').textContent = `SHORTS PART #${p.partNum}`;
  if ($('activeShortTitleLabel')) $('activeShortTitleLabel').textContent = p[`title_${S.previewLang}`] || p.title_bn || `Part ${p.partNum}`;
  if ($('activeShortSpanLabel')) $('activeShortSpanLabel').textContent = `Scenes ${p.sceneStart}–${p.sceneEnd} (${fmt(st)} – ${fmt(en)})`;
  if ($('fActiveShortTitle')) $('fActiveShortTitle').value = p[`title_${S.previewLang}`] || p.title_bn || '';
  if ($('fActiveShortStartScene')) $('fActiveShortStartScene').value = p.sceneStart;
  if ($('fActiveShortEndScene')) $('fActiveShortEndScene').value = p.sceneEnd;

  renderShortsPartsList();
  S.sel = Math.max(0, (p.sceneStart || 1) - 1);
  seek(st + 0.01, false);
  highlightSel();
  if (autoPlay) {
    S.shortPlayEndT = en;
    play();
  }
}

function renderShortsPartsList() {
  const listEl = $('shortsPartsList');
  if (!listEl || !S.project) return;
  const parts = getShortsParts();
  if ($('leftShortsCount')) $('leftShortsCount').textContent = parts.length;
  const scs = getScenes(S.previewLang);

  listEl.innerHTML = parts.map((p, idx) => {
    const startSc = scs[(p.sceneStart || 1) - 1] || scs[0];
    const endSc = scs[(p.sceneEnd || scs.length) - 1] || scs[scs.length - 1];
    const st = startSc ? startSc.timestamp_start : 0;
    const en = endSc ? endSc.timestamp_end : 10;
    const dur = Math.max(1, +(en - st).toFixed(1));
    const midOrig = S.project.scenes[Math.floor(((p.sceneStart || 1) - 1 + (p.sceneEnd || 1) - 1) / 2)] || S.project.scenes[0];
    const thumbUrl = posterUrl(midOrig) || '/references/ref_style_2_simple_history.jpg';
    const title = p[`title_${S.previewLang}`] || p.title_bn || `Part #${p.partNum}`;

    return `
      <div class="short-part-card ${idx === S.activeShortIdx ? 'active' : ''}" data-short-idx="${idx}">
        <div class="flex gap-2 items-center">
          <div class="w-11 h-16 rounded-md overflow-hidden bg-black border border-amber-400/40 shrink-0 relative">
            <img src="${thumbUrl}" class="w-full h-full object-cover" loading="lazy" alt="" />
            <span class="absolute bottom-0 inset-x-0 bg-black/80 text-[8.5px] font-mono text-center text-amber-300">${dur}s</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <span class="px-1.5 py-0.2 rounded bg-brand-500/25 text-brand-400 font-mono font-bold text-[9.5px]">পর্ব #${p.partNum}</span>
              <span class="text-[9.5px] font-mono text-emerald-300">সিন ${p.sceneStart}–${p.sceneEnd} (${p.sceneEnd - p.sceneStart + 1}টি)</span>
            </div>
            <div class="text-[11px] font-bold text-slate-100 line-clamp-2 mt-0.5 leading-snug">${esc(title)}</div>
            <div class="flex items-center justify-between mt-1 text-[9.5px] text-slate-400 font-mono">
              <span>${fmt(st)} – ${fmt(en)}</span>
              <button type="button" data-play-short="${idx}" class="text-brand-400 hover:underline font-sans font-bold">▶ Play Short</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

let modalShortsDraft = [];

async function openShortsBuilderModal() {
  const modal = $('shortsBuilderModal');
  if (!modal || !S.project) return;
  modalShortsDraft = JSON.parse(JSON.stringify(getShortsParts()));
  if ($('shortsModalCountInput')) $('shortsModalCountInput').value = modalShortsDraft.length || 10;
  if ($('shortsModalChannelName')) $('shortsModalChannelName').value = S.project.branding?.[`channel_name_${S.previewLang}`] || 'Simple History Teller Bangla';
  if ($('shortsModalMainTitle')) $('shortsModalMainTitle').value = S.project.metadata?.[`title_${S.previewLang}`] || S.project.metadata?.title_bn || S.id;
  if ($('shortsModalCta')) $('shortsModalCta').value = S.project.shorts_config?.cta_text || '▶ সম্পূর্ণ ভিডিও দেখুন চ্যানেলে • SUBSCRIBE';
  if ($('shortsModalEmbedThumb')) $('shortsModalEmbedThumb').checked = S.project.shorts_config?.embed_intro_thumbnail !== false;
  renderShortsModalTable();
  modal.classList.remove('hidden');
  icons();
}

function renderShortsModalTable() {
  const tbody = $('shortsModalTableBody');
  if (!tbody || !S.project) return;
  const maxSc = S.project.scenes.length || 1;
  const scs = getScenes(S.previewLang);

  tbody.innerHTML = modalShortsDraft.map((p, idx) => {
    const startSc = scs[(p.sceneStart || 1) - 1] || scs[0];
    const endSc = scs[(p.sceneEnd || scs.length) - 1] || scs[scs.length - 1];
    const dur = Math.max(1, +((endSc?.timestamp_end || 10) - (startSc?.timestamp_start || 0)).toFixed(1));
    const titleVal = p[`title_${S.previewLang}`] || p.title_bn || '';
    return `
      <tr class="hover:bg-white/[0.02]" data-srow="${idx}">
        <td class="py-1.5 px-3 font-mono font-bold text-brand-400">#${idx + 1}</td>
        <td class="py-1.5 px-2">
          <input type="number" min="1" max="${maxSc}" data-sk="sceneStart" value="${p.sceneStart}" class="glass-input w-20 font-mono text-xs py-1 px-2" />
        </td>
        <td class="py-1.5 px-2">
          <input type="number" min="1" max="${maxSc}" data-sk="sceneEnd" value="${p.sceneEnd}" class="glass-input w-20 font-mono text-xs py-1 px-2" />
        </td>
        <td class="py-1.5 px-2 font-mono text-emerald-300">${dur}s <span class="text-[10px] text-slate-500">(${p.sceneEnd - p.sceneStart + 1} clips)</span></td>
        <td class="py-1.5 px-3">
          <input type="text" data-sk="title" value="${esc(titleVal)}" class="glass-input w-full text-xs py-1 px-2" />
        </td>
        <td class="py-1.5 px-2 text-right">
          <button type="button" data-sdel="${idx}" class="btn-ghost text-red-400 hover:bg-red-500/10 p-1" title="Remove this Short part"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </td>
      </tr>
    `;
  }).join('');
  icons();
}

let leftFxKind = 'motion';
function renderLeftQuickFxList() {
  const list = $('leftFxList');
  if (!list) return;
  const s = scene();
  const q = ($('leftFxSearch')?.value || '').trim().toLowerCase();
  const isMotion = leftFxKind === 'motion';
  const dict = isMotion ? MOTION_LABEL : VFX_LABEL;
  const curVal = isMotion ? (s?.motion_effect || 'static') : (s?.vfx_effect || 'none');
  const curThumb = (s && posterUrl(s)) || '/references/ref_style_2_simple_history.jpg';

  const entries = Object.entries(dict).filter(([id, label]) => !q || id.toLowerCase().includes(q) || label.toLowerCase().includes(q));
  list.innerHTML = entries.map(([id, label], idx) => {
    const isAct = id === curVal;
    return `
      <div class="fx-card ${isAct ? 'active' : ''}" data-fx-apply="${esc(id)}" data-fx-kind="${leftFxKind}">
        <div class="fx-mini-preview">
          <img src="${curThumb}" class="fx-mini-preview-inner object-cover ${!isMotion ? 'vfx-' + id : ''}" loading="lazy" alt="" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-semibold text-slate-100 truncate">${esc(label)}</div>
          <div class="text-[9px] font-mono text-slate-500 truncate">#${idx + 1} · ${esc(id)}</div>
        </div>
        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${isAct ? 'bg-brand-500 text-black' : 'bg-white/5 text-slate-300'}">${isAct ? 'ON' : 'Use'}</span>
      </div>
    `;
  }).join('');
}

function renderOverlaysPanel() {
  const s = scene();
  if (!S.project) return;
  if ($('tcSceneNumLabel')) $('tcSceneNumLabel').textContent = S.sel + 1;
  if (s) {
    if ($('fTextCardStyle')) $('fTextCardStyle').value = s.text_card_style || 'voice_of_dhaka_quote';
    if ($('fTextCardInput')) $('fTextCardInput').value = s.text_card_text || '';
    if ($('fTextCardMotion')) $('fTextCardMotion').value = s.text_card_motion || 'lr';
    if ($('fTextCardSfx')) $('fTextCardSfx').value = s.text_card_sfx || 'typewriter_mechanical_key';
  }
  const bCfg = S.project.branding || {};
  if ($('chkLogoEnabled')) $('chkLogoEnabled').checked = bCfg.enabled !== false;
  if ($('logoPositionSelect')) $('logoPositionSelect').value = bCfg.position || 'top-right';
  if ($('fBrandChannelName')) $('fBrandChannelName').value = bCfg[`channel_name_${S.previewLang}`] || bCfg.channel_name_bn || 'Simple History Teller Bangla';
  const lUrl = resolveRefUrl(bCfg.logo_file?.startsWith('branding/') ? `/projects/${S.id}/${bCfg.logo_file}` : (bCfg.logo_file || '/references/mascot_logo_ref.jpg'));
  if ($('logoPreviewThumb')) $('logoPreviewThumb').src = lUrl;

  const tkCfg = S.project.ticker_config || {};
  if ($('fTickerPos')) $('fTickerPos').value = tkCfg.position || 'none';
  if ($('fTickerLabel')) $('fTickerLabel').value = tkCfg[`label_${S.previewLang}`] || tkCfg.label_bn || '● আপডেট';
  if ($('fTickerText')) $('fTickerText').value = tkCfg[`text_${S.previewLang}`] || tkCfg.text_bn || '';
}

function renderSfxQuickGrid() {
  const grid = $('sfxQuickPlayGrid');
  if (!grid) return;
  const sfxLib = S.data?.sfxLibrary || [];
  grid.innerHTML = sfxLib.map((x) => `
    <button type="button" data-play-sfx-cue="${esc(x.id)}" class="p-1.5 rounded bg-white/[0.03] hover:bg-emerald-500/20 border border-white/10 text-left flex items-center justify-between gap-1 truncate">
      <span class="truncate">${esc(x.label)}</span>
      <span class="text-emerald-400 font-mono text-[9px] shrink-0">▶ WAV</span>
    </button>
  `).join('');
}

function renderShortsThumbnailsGallery() {
  const box = $('shortsThumbnailsGallery');
  if (!box || !S.project) return;
  const parts = getShortsParts();
  const sThumbs = S.data?.shortsThumbnails || [];

  box.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
        <i data-lucide="smartphone" class="w-4 h-4"></i>
        <span>শর্টস থাম্বনেইল ফোল্ডার (projects/${esc(S.id)}/thumbnails/shorts/ — ${parts.length} Parts)</span>
      </div>
      <span class="text-[10.5px] font-mono text-emerald-300">Auto-Attached at 0.0s–0.8s in Render</span>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 pt-1">
      ${parts.map((p) => {
        const padP = String(p.partNum).padStart(2, '0');
        const expectedName = `short_part_${padP}_${S.previewLang}`;
        const found = sThumbs.find((t) => t.name.startsWith(expectedName));
        const midOrig = S.project.scenes[Math.floor(((p.sceneStart || 1) - 1 + (p.sceneEnd || 1) - 1) / 2)] || S.project.scenes[0];
        const fallbackImg = posterUrl(midOrig) || '/references/ref_style_2_simple_history.jpg';
        const imgUrl = found ? withCacheBust(found.url, found.mtime) : resolveRefUrl(fallbackImg);
        return `
          <div class="card p-2 space-y-1.5 border border-white/10">
            <div class="relative aspect-[9/16] rounded overflow-hidden bg-black border border-amber-400/30">
              <img src="${imgUrl}" class="w-full h-full object-cover" loading="lazy" alt="" />
              <div class="absolute top-1 inset-x-1 px-1.5 py-0.5 rounded bg-red-600/90 text-white font-extrabold text-[9px] text-center truncate">পর্ব #${p.partNum} (Scenes ${p.sceneStart}–${p.sceneEnd})</div>
              <div class="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black via-black/80 to-transparent text-[9.5px] font-bold text-yellow-300 line-clamp-2 text-center">${esc(p[`title_${S.previewLang}`] || p.title_bn)}</div>
            </div>
            <div class="text-[9px] font-mono text-slate-400 truncate">thumbnails/shorts/${expectedName}.png</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function wireColumnSplitters() {
  const leftResizer = $('leftColResizer');
  const rightResizer = $('rightColResizer');
  const leftPane = $('leftPane');
  const rightPane = $('rightPane');

  leftResizer?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    leftResizer.classList.add('dragging');
    const startX = e.clientX;
    const startW = leftPane.getBoundingClientRect().width;
    const onMove = (ev) => {
      const w = Math.max(210, Math.min(540, startW + (ev.clientX - startX)));
      leftPane.style.width = `${w}px`;
      resizeStageToFit();
    };
    const onUp = () => {
      leftResizer.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  rightResizer?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    rightResizer.classList.add('dragging');
    const startX = e.clientX;
    const startW = rightPane.getBoundingClientRect().width;
    const onMove = (ev) => {
      const w = Math.max(240, Math.min(540, startW - (ev.clientX - startX)));
      rightPane.style.width = `${w}px`;
      resizeStageToFit();
    };
    const onUp = () => {
      rightResizer.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  $('btnLayoutBalanced')?.addEventListener('click', () => {
    leftPane.style.width = '300px';
    rightPane.style.width = '360px';
    resizeStageToFit();
  });
  $('btnLayoutMaxStage')?.addEventListener('click', () => {
    leftPane.style.width = '220px';
    rightPane.style.width = '250px';
    resizeStageToFit();
  });
  $('btnLayoutWideInsp')?.addEventListener('click', () => {
    leftPane.style.width = '380px';
    rightPane.style.width = '440px';
    resizeStageToFit();
  });

  if (window.ResizeObserver && $('stageWrapper')) {
    const ro = new ResizeObserver(() => resizeStageToFit());
    ro.observe($('stageWrapper'));
  }
  window.addEventListener('resize', resizeStageToFit);
}

function wireHoverPreviews() {
  // 1. Hovering over any Transition/Motion or VFX card live-previews it on the main video player!
  const handleFxHoverOver = (e) => {
    const card = e.target.closest('[data-fx-apply]');
    if (!card) return;
    const id = card.dataset.fxApply;
    const kind = card.dataset.fxKind === 'vfx' ? 'vfx' : 'motion';
    if (!S.hoverFx || S.hoverFx.id !== id || S.hoverFx.kind !== kind) {
      S.hoverFx = { kind, id };
      S.frameKey = null;
      showFrame(S.t);
    }
  };
  const handleFxHoverLeave = () => {
    if (S.hoverFx) {
      S.hoverFx = null;
      S.frameKey = null;
      showFrame(S.t);
    }
  };

  $('fxBrowserGrid')?.addEventListener('mouseover', handleFxHoverOver);
  $('fxBrowserGrid')?.addEventListener('mouseleave', handleFxHoverLeave);
  $('leftFxList')?.addEventListener('mouseover', handleFxHoverOver);
  $('leftFxList')?.addEventListener('mouseleave', handleFxHoverLeave);

  // 2. Hovering over any Clip on Timeline (.nle-clip) or Left Scene Card (.scene-card) shows CapCut Clip Overview Tooltip!
  const tip = $('clipHoverTooltip');
  const showClipTip = (idx, clientX, clientY) => {
    if (!tip || !S.project?.scenes?.[idx]) return;
    const orig = S.project.scenes[idx];
    const sc = getScenes()[idx] || orig;
    const pUrl = posterUrl(orig) || '/references/ref_style_2_simple_history.jpg';
    const pa = partAudioObj(orig, S.previewLang);
    const audFile = pa?.file || `audio/${S.previewLang}/scene_${String(orig.scene_id).padStart(4, '0')}.wav`;

    if ($('chtImg')) {
      $('chtImg').src = pUrl;
      $('chtImg').className = `w-full h-full object-cover vfx-${orig.vfx_effect || 'none'}`;
    }
    if ($('chtBadge')) $('chtBadge').textContent = `Part #${idx + 1} (ID ${orig.scene_id})`;
    if ($('chtTime')) $('chtTime').textContent = `${fmt(sc.timestamp_start)} – ${fmt(sc.timestamp_end)} (${sc.duration.toFixed(1)}s)`;
    const ch = (S.project.characters || []).find((c) => c.id === orig.dialogue_speaker);
    const spkName = stripGeminiVoiceName(ch?.[`name_${S.previewLang}`] || ch?.name_bn || orig.dialogue_speaker || 'NARRATOR');
    if ($('chtSpeaker')) $('chtSpeaker').textContent = `${ch?.icon || '🎙️'} ${spkName}`;
    if ($('chtFxInfo')) $('chtFxInfo').textContent = `🎞️ ${MOTION_LABEL[orig.motion_effect] || orig.motion_effect} · ✨ ${VFX_LABEL[orig.vfx_effect || 'none'] || 'Clean'}`;
    if ($('chtAudInfo')) $('chtAudInfo').textContent = `🎙️ ${audFile}${orig.sfx ? ` · 🔊 ${orig.sfx}` : ''}`;
    if ($('chtNarration')) $('chtNarration').textContent = orig.narration?.[S.previewLang] || orig.narration?.bn || '';

    const left = Math.max(12, Math.min(window.innerWidth - 292, clientX - 138));
    const top = clientY > 320 ? clientY - 228 : clientY + 24;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.classList.remove('hidden');
  };

  $('nleTracksContainer')?.addEventListener('mousemove', (e) => {
    const clip = e.target.closest('.nle-clip[data-i]');
    if (!clip) { tip?.classList.add('hidden'); return; }
    showClipTip(+clip.dataset.i, e.clientX, e.clientY);
  });
  $('nleTracksContainer')?.addEventListener('mouseleave', () => tip?.classList.add('hidden'));

  $('sceneList')?.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.scene-card[data-i]');
    if (!card) { tip?.classList.add('hidden'); return; }
    showClipTip(+card.dataset.i, e.clientX + 120, e.clientY);
  });
  $('sceneList')?.addEventListener('mouseleave', () => tip?.classList.add('hidden'));
}

function wireStudioProV2() {
  wireColumnSplitters();
  wireHoverPreviews();

  // Mode Switchers (16:9 Master vs 9:16 Shorts)
  $('btnModeMaster')?.addEventListener('click', () => setStudioMode('master'));
  $('btnModeShorts')?.addEventListener('click', () => {
    setStudioMode('shorts');
    openShortsBuilderModal();
  });
  $('btnOpenShortsDialog')?.addEventListener('click', openShortsBuilderModal);
  $('btnOpenShortsBuilderLeft')?.addEventListener('click', openShortsBuilderModal);
  $('btnEditShortsPlanCompanion')?.addEventListener('click', openShortsBuilderModal);

  // Left Sidebar Sub-Mode Tabs
  document.querySelectorAll('[data-left-mode]').forEach((b) => {
    b.addEventListener('click', () => setLeftSidebarMode(b.dataset.leftMode));
  });

  // Left Quick FX Sidebar Events
  $('btnLeftFxMotions')?.addEventListener('click', () => {
    leftFxKind = 'motion';
    $('btnLeftFxMotions').className = 'btn-primary text-[10.5px] py-1 px-2 flex-1 justify-center';
    $('btnLeftFxVfx').className = 'btn-ghost border border-white/15 text-[10.5px] py-1 px-2 flex-1 justify-center';
    renderLeftQuickFxList();
  });
  $('btnLeftFxVfx')?.addEventListener('click', () => {
    leftFxKind = 'vfx';
    $('btnLeftFxVfx').className = 'btn-primary text-[10.5px] py-1 px-2 flex-1 justify-center';
    $('btnLeftFxMotions').className = 'btn-ghost border border-white/15 text-[10.5px] py-1 px-2 flex-1 justify-center';
    renderLeftQuickFxList();
  });
  $('leftFxSearch')?.addEventListener('input', renderLeftQuickFxList);
  $('leftFxList')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-fx-apply]');
    if (!card || !scene()) return;
    pushHistory();
    const id = card.dataset.fxApply;
    if (card.dataset.fxKind === 'vfx') {
      scene().vfx_effect = id;
      if ($('fVfx')) $('fVfx').value = id;
    } else {
      scene().motion_effect = id;
      if ($('fMotion')) $('fMotion').value = id;
    }
    S.hoverFx = null;
    S.frameKey = null;
    markDirty();
    renderMultiTrackTimeline();
    renderLeftQuickFxList();
    renderFxBrowser();
    showFrame(S.t);
    toast(`Applied ${id} to Part #${S.sel + 1}`);
  });
  $('btnLeftApplyFxAll')?.addEventListener('click', () => $('btnApplyFxAll')?.click());

  // Shorts Episode Card Clicks
  $('shortsPartsList')?.addEventListener('click', (e) => {
    const playBtn = e.target.closest('[data-play-short]');
    if (playBtn) {
      e.stopPropagation();
      if (S.studioMode !== 'shorts') setStudioMode('shorts');
      selectShortEpisode(+playBtn.dataset.playShort, true);
      return;
    }
    const card = e.target.closest('[data-short-idx]');
    if (card) {
      if (S.studioMode !== 'shorts') setStudioMode('shorts');
      selectShortEpisode(+card.dataset.shortIdx, false);
    }
  });

  // Shorts Player Alignment Dock (Left / Center / Right)
  document.querySelectorAll('[data-short-dock]').forEach((b) => {
    b.addEventListener('click', () => {
      const dock = b.dataset.shortDock;
      const wrap = $('stageWrapper');
      if (!wrap) return;
      wrap.style.justifyContent = dock === 'left' ? 'flex-start' : (dock === 'right' ? 'flex-end' : 'center');
      if ($('shortsSideCompanion')) {
        $('shortsSideCompanion').style.order = dock === 'right' ? '-1' : '1';
      }
      document.querySelectorAll('[data-short-dock]').forEach((x) => {
        x.className = x.dataset.shortDock === dock
          ? 'px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/40 text-[10px] font-semibold'
          : 'px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-semibold';
      });
    });
  });

  $('btnPlayActiveShortOnly')?.addEventListener('click', () => {
    selectShortEpisode(S.activeShortIdx || 0, true);
  });

  // Companion Short Edits
  const syncActiveShortField = () => {
    const parts = getShortsParts();
    const p = parts[S.activeShortIdx];
    if (!p) return;
    p[`title_${S.previewLang}`] = $('fActiveShortTitle')?.value || p.title_bn;
    if (S.previewLang === 'bn') p.title_bn = p[`title_${S.previewLang}`];
    p.sceneStart = Math.max(1, parseInt($('fActiveShortStartScene')?.value || 1, 10));
    p.sceneEnd = Math.max(p.sceneStart, parseInt($('fActiveShortEndScene')?.value || p.sceneStart, 10));
    p.sceneRange = [p.sceneStart, p.sceneEnd];
    if (S.project.shorts_config) {
      S.project.shorts_config.cta_text = $('fActiveShortCta')?.value || '';
      S.project.shorts_config.embed_intro_thumbnail = Boolean($('chkShortsIntroThumb')?.checked);
    }
    markDirty();
    S.frameKey = null;
    renderShortsPartsList();
    showFrame(S.t);
  };
  $('fActiveShortTitle')?.addEventListener('input', syncActiveShortField);
  $('fActiveShortStartScene')?.addEventListener('change', syncActiveShortField);
  $('fActiveShortEndScene')?.addEventListener('change', syncActiveShortField);
  $('fActiveShortCta')?.addEventListener('input', syncActiveShortField);
  $('chkShortsIntroThumb')?.addEventListener('change', syncActiveShortField);

  // Shorts Builder Modal Events
  const closeShortsModal = () => $('shortsBuilderModal')?.classList.add('hidden');
  $('btnCloseShortsModal')?.addEventListener('click', closeShortsModal);
  $('btnCancelShortsModal')?.addEventListener('click', closeShortsModal);

  const runShortsSuggest = async (count, promptText = '') => {
    try {
      const res = await api('POST', `/api/project/${S.id}/shorts/suggest`, {
        lang: S.previewLang,
        numParts: count,
        prompt: promptText
      });
      if (res.parts?.length) {
        modalShortsDraft = res.parts;
        if ($('shortsModalCountInput')) $('shortsModalCountInput').value = modalShortsDraft.length;
        renderShortsModalTable();
        toast(`✨ AI Suggested ${modalShortsDraft.length} Shorts parts across ${S.project.scenes.length} scenes!`);
        return;
      }
    } catch {}
    modalShortsDraft = clientSuggestShortsParts(count, promptText);
    if ($('shortsModalCountInput')) $('shortsModalCountInput').value = modalShortsDraft.length;
    renderShortsModalTable();
    toast(`✨ AI Suggested ${modalShortsDraft.length} Shorts parts!`);
  };

  $('btnShortsAiAutoSuggest')?.addEventListener('click', () => {
    const cnt = Math.max(1, parseInt($('shortsModalCountInput')?.value || 10, 10));
    runShortsSuggest(cnt, '');
  });
  document.querySelectorAll('[data-quick-parts]').forEach((b) => {
    b.addEventListener('click', () => {
      const cnt = +b.dataset.quickParts;
      if ($('shortsModalCountInput')) $('shortsModalCountInput').value = cnt;
      runShortsSuggest(cnt, '');
    });
  });
  $('btnShortsParsePrompt')?.addEventListener('click', () => {
    const cnt = Math.max(1, parseInt($('shortsModalCountInput')?.value || 10, 10));
    const pr = ($('shortsModalAiPrompt')?.value || '').trim();
    runShortsSuggest(cnt, pr);
  });

  $('shortsModalTableBody')?.addEventListener('input', (e) => {
    const tr = e.target.closest('[data-srow]');
    if (!tr) return;
    const idx = +tr.dataset.srow;
    const p = modalShortsDraft[idx];
    if (!p) return;
    const k = e.target.dataset.sk;
    if (k === 'sceneStart') p.sceneStart = Math.max(1, parseInt(e.target.value || 1, 10));
    else if (k === 'sceneEnd') p.sceneEnd = Math.max(p.sceneStart, parseInt(e.target.value || p.sceneStart, 10));
    else if (k === 'title') {
      p[`title_${S.previewLang}`] = e.target.value;
      p.title_bn = e.target.value;
    }
    p.sceneRange = [p.sceneStart, p.sceneEnd];
  });
  $('shortsModalTableBody')?.addEventListener('click', (e) => {
    const del = e.target.closest('[data-sdel]');
    if (!del) return;
    if (modalShortsDraft.length <= 1) return toast('At least 1 Short part required', 'err');
    modalShortsDraft.splice(+del.dataset.sdel, 1);
    modalShortsDraft.forEach((p, i) => { p.partNum = i + 1; });
    renderShortsModalTable();
  });
  $('btnShortsAddRow')?.addEventListener('click', () => {
    const last = modalShortsDraft[modalShortsDraft.length - 1];
    const maxSc = S.project?.scenes?.length || 10;
    const nextStart = Math.min(maxSc, (last?.sceneEnd || 0) + 1);
    modalShortsDraft.push({
      partNum: modalShortsDraft.length + 1,
      sceneStart: nextStart,
      sceneEnd: maxSc,
      sceneRange: [nextStart, maxSc],
      title_bn: `নতুন শর্টস পর্ব [পর্ব ${bnNum(modalShortsDraft.length + 1)}]`,
      title_en: `New Short Episode [Part ${modalShortsDraft.length + 1}]`,
      title_hi: `नया शॉर्ट्स एपिसोड [भाग ${hiNum(modalShortsDraft.length + 1)}]`
    });
    renderShortsModalTable();
  });

  $('btnApplyShortsModal')?.addEventListener('click', async () => {
    if (!S.project) return;
    pushHistory();
    S.project.branding = S.project.branding || {};
    S.project.branding[`channel_name_${S.previewLang}`] = $('shortsModalChannelName')?.value || 'Simple History Teller Bangla';
    S.project.metadata = S.project.metadata || {};
    S.project.metadata[`title_${S.previewLang}`] = $('shortsModalMainTitle')?.value || S.project.metadata.title_bn;
    S.project.shorts_config = {
      total_parts: modalShortsDraft.length,
      embed_intro_thumbnail: Boolean($('shortsModalEmbedThumb')?.checked),
      intro_thumbnail_sec: 0.8,
      cta_text: $('shortsModalCta')?.value || '▶ সম্পূর্ণ ভিডিও দেখুন চ্যানেলে • SUBSCRIBE',
      parts: modalShortsDraft
    };
    try {
      await api('POST', `/api/project/${S.id}/shorts/save`, {
        shorts_config: S.project.shorts_config,
        branding: S.project.branding
      });
    } catch {}
    closeShortsModal();
    S.activeShortIdx = 0;
    setStudioMode('shorts');
    renderShortsThumbnailsGallery();
    toast(`✅ Loaded ${modalShortsDraft.length} Branded Shorts into Shorts Studio Dashboard!`);
  });

  // Text Cards, TV Ticker & Channel Logo Controls
  $('btnToolbarTextCard')?.addEventListener('click', () => {
    setLeftSidebarMode('overlays');
    $('fTextCardInput')?.focus();
  });

  const syncTextCardToScene = () => {
    const s = scene();
    if (!s) return;
    s.text_card_style = $('fTextCardStyle')?.value || 'voice_of_dhaka_quote';
    s.text_card_text = $('fTextCardInput')?.value || '';
    s.text_card_motion = $('fTextCardMotion')?.value || 'lr';
    s.text_card_sfx = $('fTextCardSfx')?.value || 'typewriter_mechanical_key';
    S.frameKey = null;
    markDirty();
    showFrame(S.t);
  };
  $('fTextCardStyle')?.addEventListener('change', syncTextCardToScene);
  $('fTextCardInput')?.addEventListener('input', syncTextCardToScene);
  $('fTextCardMotion')?.addEventListener('change', syncTextCardToScene);
  $('fTextCardSfx')?.addEventListener('change', syncTextCardToScene);

  $('btnAutoFillTextCard')?.addEventListener('click', () => {
    const s = scene();
    if (!s) return;
    const raw = (s.narration?.[S.previewLang] || s.narration?.bn || '').replace(/<[^>]+>/g, '').trim();
    const shortQuote = raw.split(/[।?!.!]/)[0].trim().slice(0, 68);
    if ($('fTextCardInput')) $('fTextCardInput').value = shortQuote;
    syncTextCardToScene();
    playSynthesizedSfxPreview($('fTextCardSfx')?.value || 'typewriter_mechanical_key');
    toast('✨ Auto-filled Text Card from scene narration!');
  });
  $('btnPreviewTextCard')?.addEventListener('click', () => {
    syncTextCardToScene();
    playSynthesizedSfxPreview($('fTextCardSfx')?.value || 'typewriter_mechanical_key');
  });

  // Channel Logo Controls
  const syncBranding = () => {
    if (!S.project) return;
    S.project.branding = S.project.branding || {};
    S.project.branding.enabled = Boolean($('chkLogoEnabled')?.checked);
    S.project.branding.position = $('logoPositionSelect')?.value || 'top-right';
    S.project.branding[`channel_name_${S.previewLang}`] = $('fBrandChannelName')?.value || 'Simple History Teller';
    S.frameKey = null;
    markDirty();
    showFrame(S.t);
  };
  $('chkLogoEnabled')?.addEventListener('change', syncBranding);
  $('logoPositionSelect')?.addEventListener('change', syncBranding);
  $('fBrandChannelName')?.addEventListener('input', syncBranding);
  $('logoUploadInput')?.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) uploadFile(f, { kind: 'logo' }).catch((er) => toast(er.message, 'err'));
  });
  $('btnAiLogoPreset')?.addEventListener('click', () => {
    if (!S.project) return;
    aiLogoIdx = (aiLogoIdx + 1) % AI_LOGO_PRESETS.length;
    const nextLogo = AI_LOGO_PRESETS[aiLogoIdx];
    S.project.branding = S.project.branding || {};
    S.project.branding.logo_file = nextLogo.replace(/^\//, '');
    if ($('logoPreviewThumb')) $('logoPreviewThumb').src = nextLogo;
    S.frameKey = null;
    markDirty();
    showFrame(S.t);
    toast(`✨ Switched AI Channel Emblem (#${aiLogoIdx + 1}/${AI_LOGO_PRESETS.length})`);
  });

  // TV News Ticker Controls
  const syncTicker = () => {
    if (!S.project) return;
    S.project.ticker_config = S.project.ticker_config || {};
    S.project.ticker_config.position = $('fTickerPos')?.value || 'none';
    S.project.ticker_config[`label_${S.previewLang}`] = $('fTickerLabel')?.value || '● আপডেট';
    S.project.ticker_config[`text_${S.previewLang}`] = $('fTickerText')?.value || '';
    S.frameKey = null;
    markDirty();
    showFrame(S.t);
  };
  $('fTickerPos')?.addEventListener('change', syncTicker);
  $('fTickerLabel')?.addEventListener('input', syncTicker);
  $('fTickerText')?.addEventListener('input', syncTicker);
  $('btnAutoTickerText')?.addEventListener('click', () => {
    if (!S.project) return;
    const title = S.project.metadata?.[`title_${S.previewLang}`] || S.project.metadata?.title_bn || S.id;
    const autoTxt = `${title}  •  ইতিহাসের রোমাঞ্চকর ও প্রামাণ্য ডকুমেন্টারি নিয়মিত পেতে আমাদের চ্যানেলটি সাবস্ক্রাইব করুন  •  Follow & Subscribe @SimpleHistoryTeller`;
    if ($('fTickerPos') && $('fTickerPos').value === 'none') $('fTickerPos').value = 'bottom';
    if ($('fTickerText')) $('fTickerText').value = autoTxt;
    syncTicker();
    playSynthesizedSfxPreview('news_ticker_broadcast_beep');
    toast('📺 TV Channel Scrolling News Ticker activated!');
  });

  // Show/Hide Speaker Badge Checkbox
  $('chkShowSpeakerBadge')?.addEventListener('change', (e) => {
    const s = scene();
    if (!s) return;
    s.hide_speaker_badge = !e.target.checked;
    S.frameKey = null;
    markDirty();
    showFrame(S.t);
  });

  // 3-Lang Audio Track Toggle on Timeline
  $('btnToggle3LangTracks')?.addEventListener('click', () => {
    S.showAll3LangTracks = !S.showAll3LangTracks;
    if ($('langTrackModeLabel')) {
      $('langTrackModeLabel').textContent = S.showAll3LangTracks ? '3-Lang Lanes' : '1-Lang Audio';
    }
    renderMultiTrackTimeline();
    icons();
    toast(S.showAll3LangTracks
      ? 'Showing all 3 Language Voiceover Tracks (BN, EN, HI) on Timeline'
      : `Showing active ${S.previewLang.toUpperCase()} Voiceover Track on Timeline`);
  });

  // Quick SFX Grid Clicks in Audio Tab
  $('sfxQuickPlayGrid')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-play-sfx-cue]');
    if (!b) return;
    const cue = b.dataset.playSfxCue;
    playSynthesizedSfxPreview(cue);
    if (scene()) {
      scene().sfx = cue;
      if ($('fSfx')) $('fSfx').value = cue;
      if ($('fSfxSelect')) $('fSfxSelect').value = cue;
      markDirty();
      renderMultiTrackTimeline();
    }
    toast(`🔊 Playing & assigned WAV SFX: ${cue}`);
  });

  // Project-Based Thumbnail Generation & Folder Open
  $('btnOpenThumbsFolder')?.addEventListener('click', () => api('POST', `/api/project/${S.id}/open-folder`, { sub: 'thumbnails' }));
  const triggerThumbGen = async () => {
    if (!S.id) return;
    try {
      toast('🖼️ Generating Master & Shorts Thumbnails in projects/' + S.id + '/thumbnails/...');
      if (S.dirty) await save();
      const res = await api('POST', `/api/project/${S.id}/thumbnails/generate`, { langs: ['bn', 'en', 'hi'] });
      await loadProject(S.id, true);
      toast(`✅ Generated ${res.generated.master.length} Master & ${res.generated.shorts.length} Shorts Thumbnails in thumbnails/ folder!`);
    } catch (er) {
      toast(er.message, 'err');
    }
  };
  $('btnGenerateAllProjectThumbs')?.addEventListener('click', triggerThumbGen);
  $('btnGenActiveShortThumb')?.addEventListener('click', triggerThumbGen);
  $('btnExportAllShortsNow')?.addEventListener('click', async () => {
    if (!S.id) return;
    try {
      toast('🎬 Rendering Branded 9:16 Vertical Shorts with Intro Thumbnails...');
      if (S.dirty) await save();
      const res = await api('POST', `/api/project/${S.id}/render-shorts`, { langs: [S.previewLang] });
      toast(`🎉 Exported ${res.results?.exports?.length || 0} Branded Shorts to exports/shorts/!`);
    } catch (er) {
      toast(er.message, 'err');
    }
  });
}

wire();
icons();
checkGpuHealth();
loadProjects().catch((e) => toast(e.message, 'err'));
wireStudioProV2();

