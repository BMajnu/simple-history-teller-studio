// QA Verification script for simple_itihash_002_first_language regeneration
// Run after all phases complete to confirm everything is production-ready
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const FFPROBE = path.join(ROOT, 'bin', 'ffprobe.exe');

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const STATIC_SCENES  = project.scenes.filter(s => s.type === 'STATIC_IMAGE');
const DYNAMIC_SCENES = project.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO');

let pass = 0, fail = 0;
function check(label, ok, detail = '') {
  if (ok) { console.log(`  ✅ ${label}${detail ? ' — ' + detail : ''}`); pass++; }
  else     { console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`); fail++; }
}

function probe(file) {
  try {
    const out = execSync(`"${FFPROBE}" -v error -show_entries format=duration,size -of json "${file}"`).toString();
    return JSON.parse(out).format;
  } catch { return null; }
}

console.log('\n=== QA Verification: simple_itihash_002_first_language ===\n');

// --- VISUAL ASSETS ---
console.log('📁 Visual Assets:');
const VISUAL = path.join(PROJ, 'visual_assets');
let imgOk = 0, imgMiss = [];
for (const s of STATIC_SCENES) {
  const f = path.join(VISUAL, `shot_${String(s.scene_id).padStart(4,'0')}.jpg`);
  if (fs.existsSync(f) && fs.statSync(f).size > 50000) imgOk++;
  else imgMiss.push(s.scene_id);
}
check(`Static images: ${imgOk}/${STATIC_SCENES.length}`, imgOk === STATIC_SCENES.length,
  imgMiss.length ? `Missing: ${imgMiss.join(',')}` : 'all present');

let clipOk = 0, clipMiss = [];
for (const s of DYNAMIC_SCENES) {
  const f = path.join(VISUAL, `clip_shot_${String(s.scene_id).padStart(4,'0')}.mp4`);
  if (fs.existsSync(f) && fs.statSync(f).size > 100000) clipOk++;
  else clipMiss.push(s.scene_id);
}
check(`AI video clips: ${clipOk}/${DYNAMIC_SCENES.length}`, clipOk === DYNAMIC_SCENES.length,
  clipMiss.length ? `Missing: ${clipMiss.join(',')}` : 'all present');

// --- AUDIO ---
console.log('\n🎙️  Audio Files:');
const RAW = path.join(PROJ, 'audio', 'raw');
let audioOk = {bn:0,en:0,hi:0};
const audioMiss = {bn:[],en:[],hi:[]};
for (const lang of ['bn','en','hi']) {
  for (const s of project.scenes) {
    const f = path.join(RAW, `${lang}_shot_${String(s.scene_id).padStart(4,'0')}.wav`);
    if (fs.existsSync(f) && fs.statSync(f).size > 100000) audioOk[lang]++;
    else audioMiss[lang].push(s.scene_id);
  }
}
for (const lang of ['bn','en','hi']) {
  check(`${lang.toUpperCase()} voice: ${audioOk[lang]}/${project.scenes.length}`, audioOk[lang] === project.scenes.length,
    audioMiss[lang].length ? `Missing: ${audioMiss[lang].join(',')}` : '');
}

// BGM
const bgmPath = path.join(PROJ, 'audio', 'bgm.mp3');
const bgmExists = fs.existsSync(bgmPath) && fs.statSync(bgmPath).size > 500000;
let bgmDur = 0;
if (bgmExists) {
  const fmt = probe(bgmPath);
  bgmDur = fmt ? parseFloat(fmt.duration) : 0;
}
check(`BGM file exists & > 500KB`, bgmExists, bgmExists ? `${(fs.statSync(bgmPath).size/1024/1024).toFixed(1)}MB, ${bgmDur.toFixed(0)}s` : 'MISSING');
check(`BGM duration ≥ 900s`, bgmDur >= 900, `${bgmDur.toFixed(0)}s`);

// --- MASTER RENDERS ---
console.log('\n🎬 Master Renders:');
const RENDERS = path.join(PROJ, 'renders');
for (const lang of ['bn','en','hi']) {
  const f = path.join(RENDERS, `video_${lang}.mp4`);
  if (!fs.existsSync(f)) { check(`video_${lang}.mp4`, false, 'FILE MISSING'); continue; }
  const fmt = probe(f);
  const dur = fmt ? parseFloat(fmt.duration) : 0;
  const sizeMB = fs.statSync(f).size / 1024 / 1024;
  check(`video_${lang}.mp4 duration ≥ 900s`, dur >= 900, `${dur.toFixed(0)}s, ${sizeMB.toFixed(0)}MB`);
}

// --- SHORTS ---
console.log('\n📱 Shorts:');
const SHORTS = path.join(RENDERS, 'shorts');
for (const lang of ['bn','en','hi']) {
  let parts = 0;
  for (let p = 1; p <= 6; p++) {
    const f = path.join(SHORTS, `short_${lang}_part${p}.mp4`);
    if (fs.existsSync(f) && fs.statSync(f).size > 500000) parts++;
  }
  check(`${lang.toUpperCase()} shorts: ${parts} valid parts`, parts >= 4, parts < 4 ? 'Need ≥4 parts' : '');
}

// --- STYLE & QA GATES ---
console.log('\n🎨 QA Gates:');
check(`Scene count ≥ 70`, project.scenes.length >= 70, `${project.scenes.length} scenes`);
check(`DYNAMIC_AI_VIDEO ≥ 14`, DYNAMIC_SCENES.length >= 14, `${DYNAMIC_SCENES.length} dynamic`);
const dynRatio = DYNAMIC_SCENES.length / project.scenes.length;
check(`DYNAMIC ratio 15–25%`, dynRatio >= 0.15 && dynRatio <= 0.25, `${(dynRatio*100).toFixed(1)}%`);
check(`First scene is DYNAMIC_AI_VIDEO`, project.scenes[0].type === 'DYNAMIC_AI_VIDEO', project.scenes[0].type);
check(`Last scene is DYNAMIC_AI_VIDEO`, project.scenes[project.scenes.length-1].type === 'DYNAMIC_AI_VIDEO', project.scenes[project.scenes.length-1].type);

// Style consistency check (sample 5 random static scenes)
const sample = STATIC_SCENES.slice(0,5);
let styleOk = 0;
for (const s of sample) {
  if (s.visual_prompt.toLowerCase().includes('sticky') || s.visual_prompt.toLowerCase().includes('cutout')) styleOk++;
}
check(`Style prefix in visual_prompts`, styleOk === sample.length, `${styleOk}/${sample.length} sampled`);

// --- SUMMARY ---
console.log(`\n${'─'.repeat(50)}`);
console.log(`TOTAL: ✅ ${pass} passed  ❌ ${fail} failed`);
if (fail === 0) {
  console.log('\n🎉 ALL CHECKS PASSED — Video #002 is production-ready!');
} else {
  console.log(`\n⚠️  ${fail} check(s) failed. Address issues above before publishing.`);
  process.exit(1);
}
