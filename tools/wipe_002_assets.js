// Phase 0: Wipe all existing generated assets for simple_itihash_002_first_language
// Preserves: project.json, metadata/, branding/, audio/bgm.mp3 (will be replaced in Phase 1)
// Deletes: visual_assets (images+clips), audio/raw, audio/raw_aistudio, audio/shots_neural,
//          renders/.cache, renders/*.mp4, renders/shorts/*.mp4
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');

function rmDir(dir, keepDir = true) {
  if (!fs.existsSync(dir)) { console.log('  SKIP (not found):', dir); return 0; }
  const files = fs.readdirSync(dir);
  let count = 0;
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      count += rmDir(full, false);
    } else {
      fs.unlinkSync(full);
      count++;
    }
  }
  if (!keepDir) fs.rmdirSync(dir);
  return count;
}

function rmFiles(dir, exts) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isFile() && exts.some(e => f.endsWith(e))) {
      fs.unlinkSync(full);
      count++;
    }
  }
  return count;
}

console.log('=== Phase 0: Wiping assets for simple_itihash_002_first_language ===\n');

// 1. Visual assets — delete all .jpg and .mp4 (keep _wrong_backup for reference)
const VISUAL = path.join(PROJ, 'visual_assets');
let n = 0;
if (fs.existsSync(VISUAL)) {
  for (const f of fs.readdirSync(VISUAL)) {
    const full = path.join(VISUAL, f);
    if (fs.statSync(full).isFile() && (f.endsWith('.jpg') || f.endsWith('.mp4'))) {
      fs.unlinkSync(full); n++;
    }
  }
}
console.log(`✓ Visual assets wiped: ${n} files`);

// 2. Audio raw WAVs (voice)
const RAW = path.join(PROJ, 'audio', 'raw');
const n2 = rmFiles(RAW, ['.wav', '.mp3']);
console.log(`✓ Audio raw wiped: ${n2} files`);

// 3. Audio raw_aistudio
const RAW_AI = path.join(PROJ, 'audio', 'raw_aistudio');
const n3 = rmFiles(RAW_AI, ['.wav', '.mp3', '.webm']);
console.log(`✓ Audio raw_aistudio wiped: ${n3} files`);

// 4. Audio shots_neural
const SN = path.join(PROJ, 'audio', 'shots_neural');
const n4 = rmFiles(SN, ['.wav', '.mp3']);
console.log(`✓ Audio shots_neural wiped: ${n4} files`);

// 5. Render cache segments
const CACHE = path.join(PROJ, 'renders', '.cache');
const n5 = rmFiles(CACHE, ['.mp4']);
console.log(`✓ Render cache wiped: ${n5} segments`);

// 6. Render root master videos
const RENDERS = path.join(PROJ, 'renders');
const n6 = rmFiles(RENDERS, ['.mp4', '.part-000', '.part-001', '.part-002', '.part-003']);
console.log(`✓ Master renders wiped: ${n6} files`);

// 7. Shorts
const SHORTS = path.join(PROJ, 'renders', 'shorts');
const n7 = rmFiles(SHORTS, ['.mp4']);
console.log(`✓ Shorts wiped: ${n7} files`);

// 8. Concat cache txt files
const n8 = rmFiles(CACHE, ['.txt']);
console.log(`✓ Cache concat files wiped: ${n8} files`);

// 9. BGM — delete old 3-min bgm to force fresh generation
const bgmPath = path.join(PROJ, 'audio', 'bgm.mp3');
const bgmRaw = path.join(PROJ, 'audio', 'raw_bgm_lyria.wav');
if (fs.existsSync(bgmPath)) { fs.unlinkSync(bgmPath); console.log('✓ Old bgm.mp3 removed'); }
if (fs.existsSync(bgmRaw)) { fs.unlinkSync(bgmRaw); console.log('✓ Old raw_bgm_lyria.wav removed'); }

console.log('\n=== WIPE COMPLETE ===');
console.log('Preserved: project.json, metadata/, branding/');
console.log('Ready for Phase 1 (BGM) → Phase 2 (Images) → Phase 3 (Videos) → Phase 4 (TTS)');

// Verify project.json still intact
const pj = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
console.log(`\nproject.json OK: ${pj.scenes.length} scenes, style_preset=${pj.style_preset}`);
