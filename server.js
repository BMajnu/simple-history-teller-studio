/**
 * Simple History Teller — Production Studio (Module 3)
 * Local web studio: timeline inspector, asset swapping, tri-lingual render via FFmpeg.
 *
 * Pipeline:
 *   1. Every scene -> 1920x1080 @60fps H.264 segment (cached by content hash, so only changed scenes re-encode)
 *   2. Segments -> visual_master.mp4 (stream copy concat, rendered ONCE for all languages)
 *   3. Per language: visual_master + {lang}_narration + ducked BGM -> loudnorm -14 LUFS -> video_{lang}.mp4
 */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');

const ROOT = __dirname;
const PORT = process.env.PORT || 4000;
const PROJECTS = path.join(ROOT, 'projects');
const TMP = path.join(ROOT, '.tmp_uploads');
const binOr = (name) => (fs.existsSync(path.join(ROOT, 'bin', name + '.exe')) ? path.join(ROOT, 'bin', name + '.exe') : name);
const FFMPEG = binOr('ffmpeg');
const FFPROBE = binOr('ffprobe');

const LANGS = { bn: 'Simple History Teller Bangla', en: 'Simple History Teller', hi: 'Simple History Teller Hindi' };
const W = 1920, H = 1080, FPS = 60;
const IMG_EXT = ['.png', '.jpg', '.jpeg', '.webp'];
const VID_EXT = ['.mp4', '.mov', '.webm', '.mkv'];
const AUD_EXT = ['.wav', '.mp3', '.m4a', '.aac', '.ogg', '.flac'];
const MOTIONS = ['static', 'zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'ai_video'];

fs.mkdirSync(PROJECTS, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(ROOT, 'public')));
app.use('/projects', express.static(PROJECTS, { etag: false, maxAge: 0 }));
app.use('/references', express.static(path.join(ROOT, 'references')));
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
async function readProject(id) {
  const file = path.join(pdir(id), 'project.json');
  if (!exists(file)) throw httpErr(404, 'Project not found');
  return JSON.parse(await fsp.readFile(file, 'utf8'));
}
function recomputeTimeline(project) {
  let t = 0;
  for (const s of project.scenes) {
    s.duration = Math.max(0.5, +Number(s.duration || 4).toFixed(3));
    s.timestamp_start = +t.toFixed(3);
    t += s.duration;
    s.timestamp_end = +t.toFixed(3);
  }
  project.total_duration_seconds = +t.toFixed(3);
  return project;
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
/** Find `dir/base.*` (any extension from list). */
function findFile(dir, base, exts) {
  if (!exists(dir)) return null;
  const f = fs.readdirSync(dir).find((n) => path.parse(n).name === base && exts.includes(path.extname(n).toLowerCase()));
  return f ? path.join(dir, f) : null;
}
/** Resolve scene asset with graceful fallback to base image or video */
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

const probeCache = new Map();
function probeDuration(file) {
  const st = fs.statSync(file);
  const key = `${file}|${st.mtimeMs}|${st.size}`;
  if (probeCache.has(key)) return Promise.resolve(probeCache.get(key));
  return new Promise((resolve) => {
    const p = spawn(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.on('close', () => { const d = parseFloat(out) || null; probeCache.set(key, d); resolve(d); });
    p.on('error', () => resolve(null));
  });
}
const rel = (id, abs) => abs ? `/projects/${id}/${path.relative(pdir(id), abs).split(path.sep).join('/')}` : null;
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(e.code || 500).json({ error: e.message }));

app.get('/api/health', (req, res) => res.json({ ok: true, ffmpeg: FFMPEG, gpu: getHwEncoder() }));

app.get('/api/projects', wrap(async (req, res) => {
  const list = [];
  for (const d of await fsp.readdir(PROJECTS, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const pj = await readJson(path.join(PROJECTS, d.name, 'project.json'), null);
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
  const project = recomputeTimeline(await readProject(id));
  const audioDir = path.join(dir, 'audio');
  const metaDir = path.join(dir, 'metadata');
  const rendersDir = path.join(dir, 'renders');

  const assets = {};
  for (const s of project.scenes) {
    const res = resolveSceneAsset(dir, s);
    const abs = res.abs;
    const pad = pad4(s.scene_id);
    const imgPoster = findFile(path.join(dir, 'visual_assets'), `scene_${pad}`, IMG_EXT);
    assets[s.scene_id] = abs && exists(abs) ? {
      url: rel(id, abs),
      posterUrl: imgPoster ? rel(id, imgPoster) : null,
      mtime: fs.statSync(abs).mtimeMs,
      isFallback: res.isFallback
    } : null;
  }
  const audio = {};
  for (const lang of Object.keys(LANGS)) {
    const f = findFile(audioDir, `${lang}_narration`, AUD_EXT);
    audio[lang] = f ? { url: rel(id, f), duration: await probeDuration(f), mtime: fs.statSync(f).mtimeMs } : null;
  }
  const bgmFile = findFile(audioDir, 'bgm', AUD_EXT);
  const thumbnails = {};
  for (const lang of Object.keys(LANGS)) {
    const f = findFile(metaDir, `${lang}_thumbnail`, IMG_EXT);
    thumbnails[lang] = f ? { url: rel(id, f), mtime: fs.statSync(f).mtimeMs } : null;
  }
  const renders = exists(rendersDir)
    ? fs.readdirSync(rendersDir).filter((n) => /^video_\w+\.mp4$/.test(n)).map((n) => {
        const st = fs.statSync(path.join(rendersDir, n));
        return { name: n, url: rel(id, path.join(rendersDir, n)), size: st.size, mtime: st.mtimeMs };
      })
    : [];

  res.json({
    id, project, assets, audio, thumbnails, renders,
    bgm: bgmFile ? { url: rel(id, bgmFile), duration: await probeDuration(bgmFile), mtime: fs.statSync(bgmFile).mtimeMs } : null,
    seo: await readJson(path.join(metaDir, 'youtube_seo.json'), {}),
    job: jobSnapshot(jobs.get(id)),
    motions: MOTIONS,
    automationRuns: await listAutomationRuns(id, 12),
  });
}));

// The actual screenshots, DOM state and failure records live under the
// project itself. These read-only endpoints make the latest evidence easy to
// inspect from the Studio without granting the browser runtime arbitrary file
// access.
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
 *   kind = scene | narration | bgm | thumbnail
 *   sceneId (kind=scene) | lang (kind=narration|thumbnail)
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
  const lang = req.body.lang;
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
    if (kind === 'narration' || kind === 'thumbnail') {
      if (!LANGS[lang]) throw httpErr(400, 'lang must be bn | en | hi');
      const exts = kind === 'narration' ? AUD_EXT : IMG_EXT;
      if (!exts.includes(ext)) throw httpErr(400, `Unsupported file type ${ext}`);
      const sub = kind === 'narration' ? 'audio' : 'metadata';
      const base = `${lang}_${kind}`;
      await archive(findFile(path.join(dir, sub), base, exts));
      await moveFile(f.path, path.join(dir, sub, base + ext));
      return res.json({ ok: true });
    }
    if (kind === 'bgm') {
      if (!AUD_EXT.includes(ext)) throw httpErr(400, `Unsupported file type ${ext}`);
      await archive(findFile(path.join(dir, 'audio'), 'bgm', AUD_EXT));
      await moveFile(f.path, path.join(dir, 'audio', 'bgm' + ext));
      return res.json({ ok: true });
    }
    throw httpErr(400, `Unknown upload kind "${kind}"`);
  } finally {
    if (exists(f.path)) fs.unlink(f.path, () => {});
  }
}));

app.post('/api/project/:id/open-folder', wrap(async (req, res) => {
  const sub = ['renders', 'automation_runs'].includes(req.body?.sub) ? req.body.sub : '';
  const target = path.join(pdir(req.params.id), sub);
  await fsp.mkdir(target, { recursive: true });
  spawn(process.platform === 'win32' ? 'explorer' : 'xdg-open', [target], { detached: true, stdio: 'ignore' }).unref();
  res.json({ ok: true });
}));

/* --------------------------------------------------------- render engine */
const jobs = new Map(); // projectId -> job

function jobSnapshot(job) {
  if (!job) return null;
  const { status, progress, stage, outputs, startedAt, finishedAt, langs, error } = job;
  return { status, progress: +progress.toFixed(1), stage, outputs, startedAt, finishedAt, langs, error };
}
function emit(job, event, data) {
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
      const lines = out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const discrete = lines.find(l => /geforce|rtx|gtx|radeon rx|arc/i.test(l));
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
      enc: ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', FPS, '-an']
    };
  }
  if (hwEncoderConfig) return hwEncoderConfig;

  const devName = detectVideoControllerName();

  // Tier 1: Windows Media Foundation (Universal: NVIDIA GPU, AMD APU, Intel iGPU via D3D11)
  try {
    const encoders = execFileSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_mf')) {
      execFileSync(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_mf', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const isApu = devName && /radeon|vega|intel|uhd|iris/i.test(devName) && !/geforce|rtx|gtx/i.test(devName);
      const label = devName ? `${devName} (D3D11 MFT)` : 'GPU/APU (D3D11 MFT)';
      console.log(`⚡ ${isApu ? 'APU' : 'GPU'} Hardware Acceleration: ACTIVE [${label}]`);
      hwEncoderConfig = {
        name: label,
        isGpu: true,
        isApu: !!isApu,
        enc: ['-c:v', 'h264_mf', '-b:v', '6500k', '-pix_fmt', 'yuv420p', '-r', FPS, '-an']
      };
      return hwEncoderConfig;
    }
  } catch (e) {
    console.warn('[!] h264_mf hardware probe failed:', e.message);
  }

  // Tier 2: AMD AMF (Dedicated AMD APU / Radeon encoder)
  try {
    const encoders = execFileSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_amf')) {
      execFileSync(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_amf', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const label = devName ? `${devName} (AMF)` : 'AMD APU / Radeon (AMF)';
      console.log(`⚡ AMD APU Hardware Acceleration: ACTIVE [${label}]`);
      hwEncoderConfig = {
        name: label,
        isGpu: true,
        isApu: true,
        enc: ['-c:v', 'h264_amf', '-b:v', '6500k', '-pix_fmt', 'yuv420p', '-r', FPS, '-an']
      };
      return hwEncoderConfig;
    }
  } catch {}

  // Tier 3: Intel QuickSync (Dedicated Intel iGPU / APU encoder)
  try {
    const encoders = execFileSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_qsv')) {
      execFileSync(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_qsv', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const label = devName ? `${devName} (QSV)` : 'Intel iGPU (QuickSync)';
      console.log(`⚡ Intel iGPU Hardware Acceleration: ACTIVE [${label}]`);
      hwEncoderConfig = {
        name: label,
        isGpu: true,
        isApu: true,
        enc: ['-c:v', 'h264_qsv', '-b:v', '6500k', '-pix_fmt', 'yuv420p', '-r', FPS, '-an']
      };
      return hwEncoderConfig;
    }
  } catch {}

  // Tier 4: Universal CPU Software Fallback (Guaranteed to work on ANY PC with ZERO errors)
  console.log('ℹ️ No dedicated GPU/APU hardware encoder detected — Using universal CPU software mode (libx264 veryfast)');
  hwEncoderConfig = {
    name: 'CPU Software Mode (libx264 veryfast - Universal Compatibility)',
    isGpu: false,
    isApu: false,
    enc: ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', FPS, '-an']
  };
  return hwEncoderConfig;
}

const FILL = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1`;
// Cache of probed clip durations (per render process) for the slow-match rule.
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
    const text = (s.narration && s.narration[lang]) || '';
    if (text.trim()) {
      const startMs = Math.round(t * 1000);
      const endMs = Math.round((t + dur) * 1000);
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

function segmentArgs(scene, assetAbs, out, customDur, forceCpu = false, lang = 'bn') {
  const dur = typeof customDur === 'number' && customDur > 0 ? customDur : scene.duration;
  const frames = Math.round(dur * FPS);
  const motion = scene.motion_effect || 'static';
  const ENC = forceCpu
    ? ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', FPS, '-an']
    : getHwEncoder().enc;

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
    effMotion = 'zoom_in'; // Smooth Ken-Burns dynamic motion for image fallback
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
    // Ken-Burns family
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

function segmentHash(scene, assetAbs, customDur, forceCpu = false, lang = 'bn') {
  const dur = typeof customDur === 'number' && customDur > 0 ? customDur : scene.duration;
  const st = assetAbs ? fs.statSync(assetAbs) : null;
  const encName = forceCpu ? 'CPU_libx264' : getHwEncoder().name;
  return crypto.createHash('sha1').update(JSON.stringify({
    a: assetAbs, m: st?.mtimeMs, s: st?.size, d: dur, fx: scene.motion_effect, spk: scene.dialogue_speaker, lang, W, H, FPS, enc: encName, v: 11,
  })).digest('hex').slice(0, 12);
}

async function renderProject(id, opts) {
  const job = jobs.get(id);
  const dir = pdir(id);
  const project = recomputeTimeline(await readProject(id));
  const rendersDir = path.join(dir, 'renders');
  const cacheDir = path.join(rendersDir, '.cache');
  await fsp.mkdir(cacheDir, { recursive: true });

  const langCount = opts.langs.length;
  log(job, `▶ Multi-language dynamic render started — ${project.scenes.length} scenes, languages: ${opts.langs.join(', ')}`);

  const audioDir = path.join(dir, 'audio');
  const bgm = opts.useBgm ? findFile(audioDir, 'bgm', AUD_EXT) : null;
  const outputs = [];

  for (const [idx, lang] of opts.langs.entries()) {
    const langSpan = 98 / langCount;
    const langBase = idx * langSpan;

    // Calculate language specific scene durations
    const getDur = (s) => (s.language_durations && s.language_durations[lang]) || s.duration;
    const langTotal = project.language_total_durations?.[lang] || project.scenes.reduce((sum, s) => sum + getDur(s), 0);

    log(job, `\n▶ Rendering ${LANGS[lang]} channel (${langTotal.toFixed(1)}s, zero dead pauses)...`);
    setState(job, { stage: `Encoding ${LANGS[lang]} visual timeline`, progress: langBase });

    // Step 1: encode per-scene segments matching exact language audio durations
    const segFiles = [];
    let acc = 0;
    for (let sIdx = 0; sIdx < project.scenes.length; sIdx++) {
      const scene = project.scenes[sIdx];
      const dur = getDur(scene);
      const resAsset = resolveSceneAsset(dir, scene);
      const assetAbs = resAsset.abs;
      if (!assetAbs) log(job, `⚠ Scene ${scene.scene_id}: asset missing (${scene.asset_file || 'none'}) — using placeholder slate`);
      else if (resAsset.isFallback) log(job, `ℹ Scene ${scene.scene_id}: using base asset fallback (${path.basename(assetAbs)})`);
      const seg = path.join(cacheDir, `seg_${pad4(scene.scene_id)}_${segmentHash(scene, assetAbs, dur, false, lang)}.mp4`);
      const segBase = langBase + (langSpan * 0.65) * (acc / langTotal);
      const segSpan = (langSpan * 0.65) * (dur / langTotal);

      if (exists(seg)) {
        job.progress = segBase + segSpan;
      } else {
        log(job, `• Scene ${scene.scene_id} [${lang.toUpperCase()}]: encoding ${scene.motion_effect || 'static'} (${dur}s)`);
        try {
          await runFF(job, segmentArgs(scene, assetAbs, seg + '.part.mp4', dur, false, lang), { duration: dur, base: segBase, span: segSpan });
        } catch (encErr) {
          if (getHwEncoder().isGpu) {
            log(job, `  ⚠ Hardware encoder note: ${encErr.message.split('\n')[0]}`);
            log(job, `  🛡️ Seamlessly auto-recovering via CPU software mode (libx264) for Scene ${scene.scene_id}...`);
            hwFallbackTriggered = true; // Lock into safe CPU mode for subsequent scenes
            await runFF(job, segmentArgs(scene, assetAbs, seg + '.part.mp4', dur, true, lang), { duration: dur, base: segBase, span: segSpan });
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

    // Step 2: assemble visual master for this specific language
    setState(job, { stage: `Assembling ${LANGS[lang]} visual master`, progress: langBase + langSpan * 0.65 });
    const list = path.join(cacheDir, `concat_${lang}.txt`);
    await fsp.writeFile(list, segFiles.map((f) => `file '${f.split(path.sep).join('/').replace(/'/g, "'\\''")}'`).join('\n'));
    const master = path.join(rendersDir, `visual_master_${lang}.mp4`);
    await runFF(job, ['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', master], {
      duration: langTotal, base: langBase + langSpan * 0.65, span: langSpan * 0.05
    });
    log(job, `✓ ${LANGS[lang]} visual master assembled (${langTotal.toFixed(1)}s)`);

    // Step 3: mix language narration with ducked BGM
    setState(job, { stage: `Mixing ${LANGS[lang]} audio track`, progress: langBase + langSpan * 0.7 });
    const nar = findFile(audioDir, `${lang}_narration`, AUD_EXT);
    if (!nar) {
      log(job, `⚠ ${LANGS[lang]}: audio/${lang}_narration.* not found — skipped`);
      continue;
    }

    const out = path.join(rendersDir, `video_${lang}.mp4`);
    const norm = 'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo';
    const loud = 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000';
    const args = ['-i', master, '-i', nar];
    let fc;
    if (bgm) {
      args.push('-stream_loop', '-1', '-i', bgm);
      const duckStage = opts.duck
        ? `[bg][sc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350[bgd];`
        : `[sc]anullsink;[bg]anull[bgd];`;
      fc = `[1:a]${norm},apad,asplit=2[nar][sc];` +
        `[2:a]${norm},volume=${opts.bgmDb}dB[bg];` + duckStage +
        `[nar][bgd]amix=inputs=2:duration=first:normalize=0,${loud}[aout]`;
    } else {
      fc = `[1:a]${norm},apad,${loud}[aout]`;
    }
    args.push('-filter_complex', fc, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-t', langTotal, '-movflags', '+faststart', out + '.part.mp4');

    log(job, `• ${LANGS[lang]}: mixing narration${bgm ? ` + BGM (${opts.bgmDb} dB${opts.duck ? ', auto-duck' : ''})` : ''} → ${path.basename(out)}`);
    await runFF(job, args, { duration: langTotal, base: langBase + langSpan * 0.7, span: langSpan * 0.3 });
    await archive(out);
    await fsp.rename(out + '.part.mp4', out);

    // Generate YouTube CC synchronized SRT subtitles
    const srtOut = path.join(rendersDir, `video_${lang}.srt`);
    await writeSrt(project, lang, srtOut);
    log(job, `✓ ${LANGS[lang]} YouTube CC subtitles exported: renders/${path.basename(srtOut)}`);

    outputs.push({ lang, name: path.basename(out), url: rel(id, out) });
    job.outputs = outputs;
    log(job, `✓ ${LANGS[lang]} exported: renders/${path.basename(out)} (${langTotal.toFixed(1)}s, tight pacing)`);
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
          const shortsResult = await exportProjectDual(id, { langs: opts.langs });
          log(job, `✓ ${shortsResult.exports.length} episodic shorts exported to renders/shorts/ with metadata`);
        } catch (sErr) {
          log(job, `⚠ Shorts export warning: ${sErr.message}`);
        }
      }
      setState(job, { status: 'done', progress: 100, stage: `Finished — ${outputs.length} video(s) exported`, outputs, finishedAt: Date.now() });
      log(job, `■ Done in ${((Date.now() - job.startedAt) / 1000).toFixed(1)}s`);
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

/** Server-Sent Events: live progress + logs. */
app.get('/api/project/:id/render-status', (req, res) => {
  let id;
  try { id = safeId(req.params.id); } catch (e) { return res.status(400).end(); }
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders();
  if (!jobs.has(id)) jobs.set(id, { status: 'idle', progress: 0, stage: 'Idle', logs: [], outputs: [], listeners: new Set() });
  const job = jobs.get(id);
  res.write(`event: state\ndata: ${JSON.stringify(jobSnapshot(job))}\n\n`);
  for (const l of job.logs.slice(-200)) res.write(`event: log\ndata: ${JSON.stringify(l)}\n\n`);
  job.listeners.add(res);
  const ping = setInterval(() => res.write(': ping\n\n'), 20000);
  req.on('close', () => { clearInterval(ping); job.listeners.delete(res); });
});

app.use((err, req, res, next) => res.status(Number.isInteger(err.status) ? err.status : Number.isInteger(err.code) ? err.code : 400).json({ error: err.message }));

app.listen(PORT, () => {
  const hw = getHwEncoder();
  console.log(`\n  Simple History Teller Production Studio`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  ffmpeg: ${FFMPEG}`);
  console.log(`  encoder: ${hw.name} (GPU: ${hw.isGpu})\n`);
});
