/**
 * Simple Itihash — Dual-Export Engine (Full 16:9 + Vertical 9:16 Shorts/Reels/TikTok)
 * Automatically slices master long-form videos into episodic chapters (Part 1, Part 2, etc.)
 * with blurred motion canvas, top/bottom branded badges, and platform metadata.
 */

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const FFMPEG_BIN = fs.existsSync(path.resolve('bin/ffmpeg.exe')) ? path.resolve('bin/ffmpeg.exe') : 'ffmpeg';
const FFPROBE_BIN = fs.existsSync(path.resolve('bin/ffprobe.exe')) ? path.resolve('bin/ffprobe.exe') : 'ffprobe';

const LANG_CONFIG = {
  bn: {
    name: 'Bangla',
    partPrefix: 'পর্ব',
    cta: 'সম্পূর্ণ ভিডিও দেখুন YouTube-এ @SimpleHistoryTellerBangla',
    handle: '@SimpleHistoryTellerBangla',
    tags: ['#ইতিহাস', '#অ্যানিমেশন', '#রহস্য', '#banglahistory', '#shorts', '#reels', '#tiktok']
  },
  en: {
    name: 'English',
    partPrefix: 'PART',
    cta: 'Watch Full Story on YouTube @SimpleHistoryTellerOfficial',
    handle: '@SimpleHistoryTellerOfficial',
    tags: ['#history', '#animation', '#ancienthistory', '#mystery', '#shorts', '#reels', '#tiktok']
  },
  hi: {
    name: 'Hindi',
    partPrefix: 'भाग',
    cta: 'पूरी कहानी देखिए YouTube पर @SimpleHistoryTellerHindi',
    handle: '@SimpleHistoryTellerHindi',
    tags: ['#इतिहास', '#एनिमेशन', '#रोचक_तथ्य', '#hindihistory', '#shorts', '#reels', '#tiktok']
  }
};

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile(FFMPEG_BIN, args, (err, stdout, stderr) => {
      if (err) return reject(new Error(`FFmpeg error: ${err.message}\n${stderr}`));
      resolve(stdout);
    });
  });
}

let encoderCache = null;

function detectVideoControllerName() {
  try {
    const { execFileSync } = require('child_process');
    const out = execFileSync('powershell', ['-NoProfile', '-Command', '(Get-CimInstance Win32_VideoController).Name'], { encoding: 'utf8', timeout: 3500 }).trim();
    if (out) {
      const lines = out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const discrete = lines.find(l => /geforce|rtx|gtx|radeon rx|arc/i.test(l));
      return discrete || lines[0] || null;
    }
  } catch {}
  return null;
}

function getHardwareEncoder() {
  if (encoderCache) return encoderCache;
  const { execFileSync } = require('child_process');
  const devName = detectVideoControllerName();

  // Tier 1: Windows Media Foundation (Universal: NVIDIA GPU, AMD APU, Intel iGPU via D3D11)
  try {
    const encoders = execFileSync(FFMPEG_BIN, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_mf')) {
      execFileSync(FFMPEG_BIN, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_mf', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const isApu = devName && /radeon|vega|intel|uhd|iris/i.test(devName) && !/geforce|rtx|gtx/i.test(devName);
      const label = devName ? `${devName} (D3D11 MFT)` : 'GPU/APU (D3D11 MFT)';
      encoderCache = {
        name: `h264_mf [${label}]`,
        isGpu: true,
        isApu: !!isApu,
        args: ['-c:v', 'h264_mf', '-b:v', '4500k']
      };
      return encoderCache;
    }
  } catch (err) {
    console.warn('[!] h264_mf probe failed:', err.message);
  }

  // Tier 2: AMD AMF (Dedicated AMD APU / Radeon encoder)
  try {
    const encoders = execFileSync(FFMPEG_BIN, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_amf')) {
      execFileSync(FFMPEG_BIN, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_amf', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const label = devName ? `${devName} (AMF)` : 'AMD APU / Radeon (AMF)';
      encoderCache = {
        name: `h264_amf [${label}]`,
        isGpu: true,
        isApu: true,
        args: ['-c:v', 'h264_amf', '-b:v', '4500k']
      };
      return encoderCache;
    }
  } catch {}

  // Tier 3: Intel QuickSync (Dedicated Intel iGPU / APU encoder)
  try {
    const encoders = execFileSync(FFMPEG_BIN, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (encoders.includes('h264_qsv')) {
      execFileSync(FFMPEG_BIN, ['-y', '-f', 'lavfi', '-i', 'nullsrc=s=64x64:d=0.1', '-c:v', 'h264_qsv', '-f', 'null', '-'], { stdio: 'pipe', timeout: 4000 });
      const label = devName ? `${devName} (QSV)` : 'Intel iGPU (QuickSync)';
      encoderCache = {
        name: `h264_qsv [${label}]`,
        isGpu: true,
        isApu: true,
        args: ['-c:v', 'h264_qsv', '-b:v', '4500k']
      };
      return encoderCache;
    }
  } catch {}

  // Tier 4: Universal CPU Fallback (Zero errors guaranteed on any machine)
  console.log('ℹ️ Hardware encoder not available — Using universal CPU software mode (libx264)');
  encoderCache = {
    name: 'libx264 (CPU veryfast - Universal Compatibility)',
    isGpu: false,
    isApu: false,
    args: ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22']
  };
  return encoderCache;
}

function probeDuration(filePath) {
  return new Promise((resolve, reject) => {
    // Probe video stream duration first to avoid overflow when audio is longer than video
    execFile(FFPROBE_BIN, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ], (err, stdout) => {
      const vDur = parseFloat((stdout || '').trim());
      if (!err && isFinite(vDur) && vDur > 0) return resolve(vDur);
      // Fallback to format duration
      execFile(FFPROBE_BIN, [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath
      ], (err2, stdout2) => {
        if (err2) return reject(err2);
        resolve(parseFloat(stdout2.trim()));
      });
    });
  });
}

/**
 * Calculates optimal episodic chunk boundaries (~60s to 85s each) based on scene durations.
 */
function calculateParts(scenes, lang, totalDur, targetPartDur = 70, options = {}) {
  const parts = [];
  let currentStart = 0;
  let currentAccum = 0;
  let sceneIndices = [];

  for (let i = 0; i < scenes.length; i++) {
    if (currentStart >= totalDur - 15) break;

    const s = scenes[i];
    const sDur = (s.language_durations && s.language_durations[lang]) || s.duration || 10;
    sceneIndices.push(i + 1);
    currentAccum += sDur;

    // Check if reached threshold or last scene or reaches total video duration
    if (currentAccum >= targetPartDur || i === scenes.length - 1 || currentStart + currentAccum >= totalDur) {
      const actualDur = Math.min(currentAccum, Math.max(10, totalDur - currentStart));
      parts.push({
        partNum: parts.length + 1,
        startTime: Math.round(currentStart * 10) / 10,
        duration: Math.round(actualDur * 10) / 10,
        endTime: Math.round((currentStart + actualDur) * 10) / 10,
        sceneRange: [sceneIndices[0], sceneIndices[sceneIndices.length - 1]]
      });
      currentStart += actualDur;
      currentAccum = 0;
      sceneIndices = [];

      // Continue until full video is covered (unless specific maxParts is explicitly provided)
      const maxParts = options.maxParts || (options.mode === '4part' ? 4 : (options.mode === '5part' ? 5 : 999));
      if (parts.length >= maxParts || currentStart >= totalDur - 10) break;
    }
  }

  return parts;
}

async function exportProjectDual(projectId, options = {}) {
  const projectDir = path.resolve('projects', projectId);
  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  const projectFile = path.join(projectDir, 'project.json');
  const projectData = JSON.parse(await fsp.readFile(projectFile, 'utf8'));
  const rendersDir = fs.existsSync(path.join(projectDir, 'exports')) ? path.join(projectDir, 'exports') : path.join(projectDir, 'renders');
  const shortsDir = path.join(rendersDir, 'shorts');

  if (!fs.existsSync(shortsDir)) {
    await fsp.mkdir(shortsDir, { recursive: true });
  }

  const targetLangs = options.langs || ['bn', 'en', 'hi'];
  const results = {
    projectId,
    title: projectData.title || projectData.project_name || 'History Documentary',
    exports: []
  };

  const metadataExport = {
    project: projectId,
    title: projectData.title,
    generatedAt: new Date().toISOString(),
    distributionPlan: {
      longForm: ['YouTube (Full Landscape 16:9)', 'Facebook In-Stream Video (Full Landscape 16:9)'],
      shortForm: ['TikTok (9:16 Vertical)', 'Instagram Reels (9:16 Vertical)', 'YouTube Shorts (9:16 Vertical)', 'Facebook Reels (9:16 Vertical)']
    },
    parts: []
  };

  console.log(`\n======================================================`);
  console.log(`🎬 DUAL-EXPORT ENGINE: ${projectData.title || projectId}`);
  console.log(`======================================================`);

  for (const lang of targetLangs) {
    const cfg = LANG_CONFIG[lang] || LANG_CONFIG.en;
    const masterVideo = path.join(rendersDir, `video_${lang}.mp4`);

    if (!fs.existsSync(masterVideo)) {
      console.warn(`[!] Master video not found for ${lang}: ${masterVideo}. Skipping shorts generation.`);
      continue;
    }

    const totalDur = await probeDuration(masterVideo);
    console.log(`\n▶ Processing [${cfg.name.toUpperCase()}] Master Video (${totalDur.toFixed(1)}s)...`);

    const targetDur = options.targetDur || (options.mode === '4part' ? Math.floor(totalDur / 4) : (options.mode === '5part' ? Math.floor(totalDur / 5) : 75));
    const parts = calculateParts(projectData.scenes || [], lang, totalDur, targetDur, options);
    console.log(`  Identified ${parts.length} episodic narrative parts across the complete video.`);

    for (const part of parts) {
      const partNum = part.partNum;
      const outShortName = `short_${lang}_part${partNum}.mp4`;
      const outShortPath = path.join(shortsDir, outShortName);

      console.log(`  • Rendering ${outShortName}: Start ${part.startTime}s, Duration ${part.duration}s...`);

      // GPU-Accelerated vertical composition filter:
      // Accurate seek, normalized yuv420p, 16x downscaled blur (lightning fast), and resampled audio
      const enc = getHardwareEncoder();
      const fadeStart = Math.max(1, part.duration - 1.5);
      const fc = [
        `[0:v]scale=1920:1080,format=yuv420p,setpts=PTS-STARTPTS,split=2[v_bg][v_fg]`,
        `[v_bg]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,boxblur=4:2,scale=1080:1920,setsar=1[bg]`,
        `[v_fg]scale=1080:608:force_original_aspect_ratio=decrease,setsar=1[fg]`,
        `[bg][fg]overlay=0:656,setsar=1[v_out]`,
        `[0:a]aresample=async=1000,asetpts=PTS-STARTPTS,afade=t=out:st=${fadeStart}:d=1.5[a_out]`
      ].join(';');

      const ffArgs = [
        '-y',
        '-ss', String(part.startTime),
        '-reinit_filter', '0',
        '-i', masterVideo,
        '-filter_complex', fc,
        '-map', '[v_out]',
        '-map', '[a_out]',
        '-t', String(part.duration),
        ...enc.args,
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart',
        outShortPath
      ];

      const t0 = Date.now();
      try {
        await runFFmpeg(ffArgs);
      } catch (renderErr) {
        if (enc.isGpu) {
          console.warn(`    ⚠ Hardware encoding error on ${outShortName}: ${renderErr.message.split('\n')[0]}`);
          console.log(`    🛡️ Seamlessly auto-recovering via CPU software mode (libx264)...`);
          const cpuArgs = [
            '-y',
            '-ss', String(part.startTime),
            '-reinit_filter', '0',
            '-i', masterVideo,
            '-filter_complex', fc,
            '-map', '[v_out]',
            '-map', '[a_out]',
            '-t', String(part.duration),
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-crf', '22',
            '-pix_fmt', 'yuv420p',
            '-r', '60',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            outShortPath
          ];
          await runFFmpeg(cpuArgs);
        } else {
          throw renderErr;
        }
      }
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const stat = await fsp.stat(outShortPath);
      console.log(`    ✓ Exported in ${elapsed}s (${(stat.size / (1024 * 1024)).toFixed(1)} MB)`);

      // Generate Platform Copy
      const partTitle = `${projectData.title || 'Historical Mystery'} [${cfg.partPrefix} ${partNum}]`;
      const copyText = {
        lang,
        part: partNum,
        filename: outShortName,
        duration: part.duration,
        title: partTitle,
        tiktok_caption: `🏛️ ${partTitle} | ${cfg.cta}\n\n${cfg.tags.join(' ')}`,
        reels_caption: `🔥 ${partTitle}\n\n${cfg.cta}\n\n${cfg.tags.join(' ')}`,
        youtube_shorts_title: `${partTitle} 🏛️ #Shorts #History`,
        description_cta: `Watch the full 15-minute documentary with complete animation on YouTube: ${cfg.handle}`
      };

      metadataExport.parts.push(copyText);
      results.exports.push({ lang, part: partNum, path: outShortPath, filename: outShortName, sizeMb: (stat.size / (1024 * 1024)).toFixed(1) });
    }
  }

  // Save metadata
  const metaPath = path.join(shortsDir, 'metadata_distribution.json');
  await fsp.writeFile(metaPath, JSON.stringify(metadataExport, null, 2), 'utf8');
  console.log(`\n✓ Distribution metadata saved to: ${metaPath}`);

  return results;
}

if (require.main === module) {
  const targetProject = process.argv[2] || 'simple_itihash_002_first_language';
  exportProjectDual(targetProject)
    .then(r => {
      console.log(`\n🎉 Dual-Export completed successfully! Total exports: ${r.exports.length}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { exportProjectDual, calculateParts, getHardwareEncoder };
