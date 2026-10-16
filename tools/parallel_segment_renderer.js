const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_ID = 'simple_itihash_002_first_language';
const PROJECT_DIR = path.join(ROOT, 'projects', PROJECT_ID);
const RENDERS_DIR = path.join(PROJECT_DIR, 'renders');
const CACHE_DIR = path.join(RENDERS_DIR, '.cache');

const FFMPEG = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const FFPROBE = fs.existsSync(path.join(ROOT, 'bin', 'ffprobe.exe')) ? path.join(ROOT, 'bin', 'ffprobe.exe') : 'ffprobe';

const W = 1920, H = 1080, FPS = 60;
const IMG_EXT = ['.png', '.jpg', '.jpeg', '.webp'];
const VID_EXT = ['.mp4', '.mov', '.webm', '.mkv'];
const FILL = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1`;

const ENC = ['-c:v', 'h264_mf', '-b:v', '6500k', '-pix_fmt', 'yuv420p', '-r', FPS, '-an'];
const ENC_NAME = 'NVIDIA GeForce GTX 1050 Ti (D3D11 MFT)';

function exists(f) {
  try { return !!f && fs.existsSync(f); } catch { return false; }
}

function pad4(n) {
  return String(n).padStart(4, '0');
}

function findFile(dir, base, exts) {
  for (const ext of exts) {
    const f = path.join(dir, base + ext);
    if (exists(f)) return f;
  }
  return null;
}

function resolveSceneAsset(dir, s) {
  if (s && s.asset_file) {
    const abs = path.join(dir, s.asset_file);
    if (exists(abs)) return { abs, isFallback: false };
  }
  if (!s) return { abs: null, isFallback: false };
  const pad = pad4(s.scene_id);
  const vdir = path.join(dir, 'visual_assets');
  const candidates = [
    findFile(vdir, `scene_${pad}`, IMG_EXT),
    findFile(vdir, `shot_${pad}`, IMG_EXT),
    findFile(vdir, `clip_scene_${pad}`, VID_EXT),
    findFile(vdir, `clip_shot_${pad}`, VID_EXT),
    findFile(dir, `scene_${pad}`, IMG_EXT),
    findFile(dir, `shot_${pad}`, IMG_EXT),
  ];
  const found = candidates.find((c) => c && exists(c));
  if (found) return { abs: found, isFallback: true };
  return { abs: null, isFallback: false };
}

function getBadgeFile(speakerKey, lang = 'bn') {
  const normKey = (speakerKey || 'NARRATOR').trim();
  const candidate = path.join(ROOT, 'public', 'assets', 'badges', `badge_${normKey}_${lang}.png`);
  if (exists(candidate)) return candidate;
  const narratorCandidate = path.join(ROOT, 'public', 'assets', 'badges', `badge_NARRATOR_${lang}.png`);
  if (exists(narratorCandidate)) return narratorCandidate;
  return null;
}

const durCache = new Map();
function probeDur(abs) {
  if (durCache.has(abs)) return durCache.get(abs);
  try {
    const o = execFileSync(FFPROBE, ['-hide_banner', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', abs]).toString().trim();
    const d = parseFloat(o);
    durCache.set(abs, isFinite(d) ? d : 0);
  } catch { durCache.set(abs, 0); }
  return durCache.get(abs);
}

function segmentHash(scene, assetAbs, customDur, lang = 'bn') {
  const dur = typeof customDur === 'number' && customDur > 0 ? customDur : scene.duration;
  const st = assetAbs ? fs.statSync(assetAbs) : null;
  return crypto.createHash('sha1').update(JSON.stringify({
    a: assetAbs, m: st?.mtimeMs, s: st?.size, d: dur, fx: scene.motion_effect, spk: scene.dialogue_speaker, lang, W, H, FPS, enc: ENC_NAME, v: 11,
  })).digest('hex').slice(0, 12);
}

function segmentArgs(scene, assetAbs, out, customDur, lang = 'bn') {
  const dur = typeof customDur === 'number' && customDur > 0 ? customDur : scene.duration;
  const frames = Math.round(dur * FPS);
  const motion = scene.motion_effect || 'static';
  const badgeFile = getBadgeFile(scene.dialogue_speaker, lang);

  if (!assetAbs) {
    if (badgeFile) {
      return [
        '-f', 'lavfi', '-i', `color=c=0x111827:s=${W}x${H}:r=${FPS}:d=${dur}`,
        '-i', badgeFile,
        '-filter_complex', `[0:v][1:v]overlay=48:H-h-48:format=auto,format=yuv420p[v]`,
        '-map', '[v]',
        ...ENC, '-t', dur, out
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
    const D = probeDur(assetAbs);
    if (D > 0 && D < dur - 0.05) {
      const f = dur / D;
      if (f <= 2.0) {
        baseInput = ['-i', assetAbs];
        baseVf = `${FILL},fps=${FPS},setpts=${f.toFixed(4)}*PTS,fps=${FPS},tpad=stop_mode=clone:stop_duration=${dur}`;
      } else {
        baseInput = ['-stream_loop', '1', '-i', assetAbs];
        baseVf = `${FILL},fps=${FPS}`;
      }
    } else {
      baseInput = ['-i', assetAbs];
      baseVf = `${FILL},fps=${FPS},tpad=stop_mode=clone:stop_duration=${dur}`;
    }
  } else if (effMotion === 'static') {
    baseInput = ['-loop', '1', '-framerate', FPS, '-i', assetAbs];
    baseVf = `${FILL}`;
  } else {
    const Z = 0.12;
    const zx = {
      zoom_in: [`1+${Z}*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      zoom_out: [`${1 + Z}-${Z}*on/${frames}`, `iw/2-(iw/zoom/2)`, `ih/2-(ih/zoom/2)`],
      pan_right: [`${1 + Z}`, `(iw-iw/zoom)*on/${frames}`, `ih/2-(ih/zoom/2)`],
      pan_left: [`${1 + Z}`, `(iw-iw/zoom)*(1-on/${frames})`, `ih/2-(ih/zoom/2)`],
    }[effMotion] || [`1`, `0`, `0`];
    baseInput = ['-i', assetAbs];
    baseVf = `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},` +
      `zoompan=z='${zx[0]}':x='${zx[1]}':y='${zx[2]}':d=${frames}:s=${W}x${H}:fps=${FPS},setsar=1`;
    isFramesBased = true;
  }

  const durArgs = isFramesBased ? ['-frames:v', frames] : ['-t', dur];

  if (badgeFile) {
    const fc = [
      `[0:v]${baseVf},setsar=1[v_base]`,
      `[v_base][1:v]overlay=48:H-h-48:format=auto,format=yuv420p[v_out]`
    ].join(';');
    return [
      ...baseInput,
      '-i', badgeFile,
      '-filter_complex', fc,
      '-map', '[v_out]',
      ...durArgs,
      ...ENC,
      out
    ];
  }

  const finalVf = `${baseVf},format=yuv420p`;
  return [...baseInput, '-vf', finalVf, ...durArgs, ...ENC, out];
}

function runFF(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, ['-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let errOutput = '';
    proc.stderr.on('data', d => { errOutput += d.toString(); });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg error (code ${code}): ${errOutput.slice(-300)}`));
    });
  });
}

async function renderSegment(scene, lang) {
  const getDur = (s) => (s.language_durations && s.language_durations[lang]) || s.duration;
  const dur = getDur(scene);
  const resAsset = resolveSceneAsset(PROJECT_DIR, scene);
  const assetAbs = resAsset.abs;
  const hash = segmentHash(scene, assetAbs, dur, lang);
  const finalSeg = path.join(CACHE_DIR, `seg_${pad4(scene.scene_id)}_${hash}.mp4`);
  const tempSeg = path.join(CACHE_DIR, `seg_${pad4(scene.scene_id)}_${hash}.par_${process.pid}_${Date.now()}.mp4`);

  if (exists(finalSeg)) {
    return { cached: true, file: finalSeg };
  }

  const args = segmentArgs(scene, assetAbs, tempSeg, dur, lang);
  await runFF(args);
  await fsp.rename(tempSeg, finalSeg);
  return { cached: false, file: finalSeg };
}

async function worker(queue, workerId) {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { scene, lang, idx, total } = item;
    const getDur = (s) => (s.language_durations && s.language_durations[lang]) || s.duration;
    const dur = getDur(scene);
    const resAsset = resolveSceneAsset(PROJECT_DIR, scene);
    const hash = segmentHash(scene, resAsset.abs, dur, lang);
    const finalSeg = path.join(CACHE_DIR, `seg_${pad4(scene.scene_id)}_${hash}.mp4`);
    
    if (exists(finalSeg)) {
      continue;
    }
    
    const t0 = Date.now();
    try {
      await renderSegment(scene, lang);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[Worker ${workerId}] [${lang.toUpperCase()}] Scene ${scene.scene_id} done in ${elapsed}s (Remaining in queue: ${queue.length})`);
    } catch (e) {
      console.error(`[Worker ${workerId}] Error on Scene ${scene.scene_id} [${lang}]:`, e.message);
    }
  }
}

async function main() {
  const project = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'project.json'), 'utf8'));
  console.log(`=== PARALLEL SEGMENT RENDER ACCELERATOR ===`);
  console.log(`Loaded project with ${project.scenes.length} scenes.`);

  // Build task items for 'en' and 'hi' (and 'bn' backwards so we don't collide with server.js)
  const queue = [];
  
  // First priority: English and Hindi scenes (all 84)
  for (const lang of ['en', 'hi']) {
    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i];
      const getDur = (s) => (s.language_durations && s.language_durations[lang]) || s.duration;
      const dur = getDur(scene);
      const resAsset = resolveSceneAsset(PROJECT_DIR, scene);
      const hash = segmentHash(scene, resAsset.abs, dur, lang);
      const finalSeg = path.join(CACHE_DIR, `seg_${pad4(scene.scene_id)}_${hash}.mp4`);
      if (!exists(finalSeg)) {
        queue.push({ scene, lang, idx: i + 1, total: project.scenes.length });
      }
    }
  }

  // Second priority: Bangla scenes from 84 backwards
  for (let i = project.scenes.length - 1; i >= 0; i--) {
    const scene = project.scenes[i];
    const getDur = (s) => (s.language_durations && s.language_durations['bn']) || s.duration;
    const dur = getDur(scene);
    const resAsset = resolveSceneAsset(PROJECT_DIR, scene);
    const hash = segmentHash(scene, resAsset.abs, dur, 'bn');
    const finalSeg = path.join(CACHE_DIR, `seg_${pad4(scene.scene_id)}_${hash}.mp4`);
    if (!exists(finalSeg)) {
      queue.push({ scene, lang: 'bn', idx: i + 1, total: project.scenes.length });
    }
  }

  console.log(`Pending segments to render: ${queue.length}`);
  if (queue.length === 0) {
    console.log('All segments are already cached! Nothing to do.');
    return;
  }

  // Run 2 parallel workers using the GPU encoder
  const NUM_WORKERS = 2;
  console.log(`Starting ${NUM_WORKERS} concurrent GPU workers...`);
  const workers = [];
  for (let w = 1; w <= NUM_WORKERS; w++) {
    workers.push(worker(queue, w));
  }

  await Promise.all(workers);
  console.log('🎉 Parallel segment rendering completed!');
}

main().catch(console.error);
