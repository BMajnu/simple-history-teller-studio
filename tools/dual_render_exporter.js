/**
 * Simple Itihash / Simple Studio Pro — Dual-Export Engine (Full 16:9 + Vertical 9:16 Shorts/Reels/TikTok)
 * Features:
 * 1. Honors custom user-defined Shorts parts (`project.shorts_config.parts`) or AI Auto-Suggested scene ranges
 * 2. Composites 100% professional 9:16 Top & Bottom Branded Overlay Plates (Channel Logo, Channel Name,
 *    Part Badge, Highlighted Short Title, Main Video Title, and Subscribe CTA) — no plain blurred empty bars!
 * 3. Generates project-based thumbnails in `projects/<id>/thumbnails/master/` and `projects/<id>/thumbnails/shorts/`
 * 4. Pre-attaches the Short Thumbnail for the first ~0.8s–1.0s of each rendered Short video so YouTube/Facebook/TikTok
 *    auto-detects the thumbnail directly from the video stream without manual upload hassle.
 */

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const { suggestShortsParts, runPlateScript, closePlateRenderer } = require('../lib/media-compositor');

const ROOT = path.resolve(__dirname, '..');
const FFMPEG_BIN = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const FFPROBE_BIN = fs.existsSync(path.join(ROOT, 'bin', 'ffprobe.exe')) ? path.join(ROOT, 'bin', 'ffprobe.exe') : 'ffprobe';

const LANG_CONFIG = {
  bn: {
    name: 'Bangla',
    channelName: 'Simple History Teller Bangla',
    partPrefix: 'পর্ব',
    mainLabel: 'মূল ভিডিও / FULL DOCUMENTARY:',
    cta: 'সম্পূর্ণ ভিডিও দেখুন চ্যানেলে • SUBSCRIBE',
    handle: '@SimpleHistoryTellerBangla',
    tags: ['#ইতিহাস', '#অ্যানিমেশন', '#রহস্য', '#banglahistory', '#shorts', '#reels', '#tiktok']
  },
  en: {
    name: 'English',
    channelName: 'Simple History Teller',
    partPrefix: 'PART',
    mainLabel: 'FULL DOCUMENTARY:',
    cta: 'Watch Full Story on Channel • SUBSCRIBE',
    handle: '@SimpleHistoryTellerOfficial',
    tags: ['#history', '#animation', '#ancienthistory', '#mystery', '#shorts', '#reels', '#tiktok']
  },
  hi: {
    name: 'Hindi',
    channelName: 'Simple History Teller Hindi',
    partPrefix: 'भाग',
    mainLabel: 'पूरी डॉक्यूमेंट्री / FULL VIDEO:',
    cta: 'पूरी कहानी देखिए चैनल पर • SUBSCRIBE',
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
  } catch {}

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
    execFile(FFPROBE_BIN, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ], (err, stdout) => {
      const vDur = parseFloat((stdout || '').trim());
      if (!err && isFinite(vDur) && vDur > 0) return resolve(vDur);
      execFile(FFPROBE_BIN, [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath
      ], (err2, stdout2) => {
        if (err2) return reject(err2);
        resolve(parseFloat((stdout2 || '').trim()) || 60);
      });
    });
  });
}

function resolveLogoFile(projectDir, projectData, lang = '') {
  const b = projectData?.branding || {};
  const customLogo = (lang && (b[`logo_file_${lang}`] || projectData?.shorts_config?.[`logo_file_${lang}`]))
    || b.logo_file || projectData?.shorts_config?.logo_file;
  if (customLogo) {
    const abs1 = path.join(projectDir, customLogo);
    if (fs.existsSync(abs1)) return abs1;
    const abs2 = path.join(ROOT, customLogo.replace(/^\//, ''));
    if (fs.existsSync(abs2)) return abs2;
  }
  const cands = [
    path.join(projectDir, 'branding', 'channel_logo.png'),
    path.join(projectDir, 'branding', 'avatar_simple_history_teller.jpg'),
    path.join(ROOT, 'references', 'mascot_logo_ref.jpg'),
    path.join(ROOT, 'banner_assets', 'mascot_01_modern_chronicler_sht.jpg'),
  ];
  return cands.find((c) => fs.existsSync(c)) || '';
}

function resolveCoverImageForScene(projectDir, projectData, sceneId) {
  const scenes = projectData?.scenes || [];
  const sc = scenes.find((s) => Number(s.scene_id) === Number(sceneId)) || scenes[0];
  if (sc?.asset_file && /\.(png|jpg|jpeg|webp)$/i.test(sc.asset_file)) {
    const abs = path.join(projectDir, sc.asset_file);
    if (fs.existsSync(abs)) return abs;
  }
  const pad = String(sceneId || 1).padStart(4, '0');
  const cands = [
    path.join(projectDir, 'visual_assets', `scene_${pad}.png`),
    path.join(projectDir, 'visual_assets', `scene_${pad}.jpg`),
    path.join(projectDir, 'visual_assets', `shot_${pad}.jpg`),
    path.join(projectDir, 'visual_assets', `shot_${pad}.png`),
    path.join(ROOT, 'references', 'ref_style_2_simple_history.jpg'),
  ];
  return cands.find((c) => fs.existsSync(c)) || '';
}

function calculateParts(scenes, lang, totalDur, targetPartDur = 70, options = {}, projectData = {}) {
  const customParts = options.customParts || projectData?.shorts_config?.parts;
  const numParts = options.numParts || projectData?.shorts_config?.total_parts || Math.max(1, Math.round(totalDur / targetPartDur));
  const suggested = suggestShortsParts(
    { ...(projectData || {}), scenes },
    lang,
    numParts,
    options.prompt || projectData?.shorts_config?.ai_prompt || '',
    customParts
  );
  // If the master video starts with the embedded 0.8s thumbnail intro, shift cut points to keep narration sync
  const introOffset = Math.max(0, Number(options.introOffset || 0));

  // Clamp end times to actual probed master video duration
  return suggested
    .filter((p) => p.startTime < totalDur - 1.5)
    .map((p) => {
      const st = Math.max(0, Math.min(totalDur - 2, p.startTime + introOffset));
      const dur = Math.max(2, Math.min(p.duration, totalDur - st));
      return {
        ...p,
        startTime: +st.toFixed(2),
        duration: +dur.toFixed(2),
        endTime: +(st + dur).toFixed(2),
      };
    });
}

/** Finds the master thumbnail the server embedded as intro (thumbnails/master/ with metadata/ fallback). */
function findMasterThumbForLang(projectDir, lang) {
  const dirs = [path.join(projectDir, 'thumbnails', 'master'), path.join(projectDir, 'metadata')];
  const bases = [`master_thumbnail_${lang}`, `${lang}_thumbnail`];
  for (const d of dirs) {
    for (const b of bases) {
      for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
        const p = path.join(d, b + ext);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

async function exportProjectDual(projectId, options = {}) {
  const projectDir = path.resolve(ROOT, 'projects', projectId);
  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  const projectFile = path.join(projectDir, 'project.json');
  const projectData = JSON.parse(await fsp.readFile(projectFile, 'utf8'));
  const rendersDir = fs.existsSync(path.join(projectDir, 'exports')) ? path.join(projectDir, 'exports') : path.join(projectDir, 'renders');
  const shortsDir = path.join(rendersDir, 'shorts');
  const shortsCacheDir = path.join(shortsDir, '.cache');
  const thumbsMasterDir = path.join(projectDir, 'thumbnails', 'master');
  const thumbsShortsDir = path.join(projectDir, 'thumbnails', 'shorts');

  await fsp.mkdir(shortsDir, { recursive: true });
  await fsp.mkdir(shortsCacheDir, { recursive: true });
  await fsp.mkdir(thumbsMasterDir, { recursive: true });
  await fsp.mkdir(thumbsShortsDir, { recursive: true });

  const targetLangs = options.langs || ['bn', 'en', 'hi'];
  const embedIntroThumb = options.embedIntroThumbnail ?? projectData?.shorts_config?.embed_intro_thumbnail ?? true;
  const introThumbSec = Math.max(0.3, Math.min(2.0, Number(options.introThumbnailDuration || projectData?.shorts_config?.intro_thumbnail_sec || 0.8)));

  const results = {
    projectId,
    title: projectData.metadata?.title_en || projectData.title || projectId,
    exports: [],
    thumbnails: []
  };

  const metadataExport = {
    project: projectId,
    title: projectData.metadata?.title_bn || projectData.title || projectId,
    generatedAt: new Date().toISOString(),
    thumbnailsFolder: `projects/${projectId}/thumbnails/`,
    parts: []
  };

  const bnDigits = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  const hiDigits = (n) => String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[d]);

  for (const lang of targetLangs) {
    const cfg = LANG_CONFIG[lang] || LANG_CONFIG.en;
    const masterVideo = fs.existsSync(path.join(projectDir, 'exports', `video_${lang}.mp4`))
      ? path.join(projectDir, 'exports', `video_${lang}.mp4`)
      : path.join(projectDir, 'renders', `video_${lang}.mp4`);

    if (!fs.existsSync(masterVideo)) {
      console.warn(`[!] Master video not found for ${lang}: ${masterVideo}. Skipping shorts generation.`);
      continue;
    }

    const totalDur = await probeDuration(masterVideo);
    const masterThumbFile = findMasterThumbForLang(projectDir, lang);
    const introOffset = (embedIntroThumb && masterThumbFile) ? introThumbSec : 0;
    const logoPath = resolveLogoFile(projectDir, projectData, lang);
    const parts = calculateParts(projectData.scenes || [], lang, totalDur, options.targetDur || 75, { ...options, introOffset }, projectData);
    const totalPartsCount = parts.length;

    for (const part of parts) {
      const partNum = part.partNum;
      const padNum = String(partNum).padStart(2, '0');
      const outShortName = `short_${lang}_part${partNum}.mp4`;
      const outShortPath = path.join(shortsDir, outShortName);

      const partTitle = part[`title_${lang}`] || part.title_bn || `${projectData.metadata?.[`title_${lang}`] || projectId} [${cfg.partPrefix} ${partNum}]`;
      const mainTitle = part[`main_title_${lang}`] || projectData.metadata?.[`title_${lang}`] || projectData.metadata?.title_bn || projectId;
      const partBadgeLabel = lang === 'bn'
        ? `পর্ব ${bnDigits(partNum)} / ${bnDigits(totalPartsCount)}`
        : (lang === 'hi' ? `भाग ${hiDigits(partNum)} / ${hiDigits(totalPartsCount)}` : `PART ${partNum} / ${totalPartsCount}`);

      const channelName = projectData.branding?.[`channel_name_${lang}`] || projectData.channels?.[lang] || cfg.channelName;
      const channelHandle = projectData.branding?.[`handle_${lang}`] || cfg.handle;
      const ctaText = projectData.shorts_config?.[`cta_${lang}`] || cfg.cta;

      // 1. Generate 9:16 Branded Overlay Plate PNG (Top Logo/Channel/Part/Title + Bottom Main Video/CTA)
      const overlayPng = path.join(shortsCacheDir, `overlay_${lang}_part${padNum}.png`);
      const hasOverlay = await runPlateScript({
        mode: 'shorts_overlay',
        out_path: overlayPng,
        lang,
        logo_path: logoPath,
        channel_name: channelName,
        channel_handle: channelHandle,
        part_label: partBadgeLabel,
        short_title: partTitle,
        main_video_label: cfg.mainLabel,
        main_title: mainTitle,
        cta_text: ctaText,
        vid_y1: 560,
        vid_h: 640
      });

      // 2. Generate Dedicated Project-Based Short Thumbnail in `thumbnails/shorts/`
      const shortThumbPath = path.join(thumbsShortsDir, `short_part_${padNum}_${lang}.png`);
      const coverBg = resolveCoverImageForScene(projectDir, projectData, part.cover_scene_id);
      const hasShortThumb = await runPlateScript({
        mode: 'thumbnail',
        is_short: true,
        out_path: shortThumbPath,
        lang,
        bg_path: coverBg,
        logo_path: logoPath,
        channel_name: channelName,
        badge_text: partBadgeLabel,
        title_text: partTitle
      });
      if (hasShortThumb) {
        results.thumbnails.push({ lang, part: partNum, path: shortThumbPath, rel: `thumbnails/shorts/short_part_${padNum}_${lang}.png` });
      }

      // 3. Render 9:16 Vertical Short with Branded Overlay Plate + Optional 0.8s Intro Thumbnail Frame
      const enc = getHardwareEncoder();
      const fadeStart = Math.max(1, part.duration - 1.5);
      const bodyClipPath = embedIntroThumb && hasShortThumb
        ? path.join(shortsCacheDir, `body_${lang}_part${padNum}.mp4`)
        : outShortPath;

      const fc = hasOverlay
        ? [
            `[0:v]scale=1920:1080,format=yuv420p,setpts=PTS-STARTPTS,split=2[v_bg][v_fg]`,
            `[v_bg]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,boxblur=6:3,scale=1080:1920,setsar=1[bg]`,
            `[v_fg]scale=1080:640:force_original_aspect_ratio=increase,crop=1080:640,setsar=1[fg]`,
            `[bg][fg]overlay=0:560:format=auto[v_mid]`,
            `[v_mid][1:v]overlay=0:0:format=auto,format=yuv420p,setsar=1[v_out]`,
            `[0:a]aresample=async=1000,asetpts=PTS-STARTPTS,afade=t=out:st=${fadeStart}:d=1.5[a_out]`
          ].join(';')
        : [
            `[0:v]scale=1920:1080,format=yuv420p,setpts=PTS-STARTPTS,split=2[v_bg][v_fg]`,
            `[v_bg]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,boxblur=6:3,scale=1080:1920,setsar=1[bg]`,
            `[v_fg]scale=1080:640:force_original_aspect_ratio=decrease,setsar=1[fg]`,
            `[bg][fg]overlay=0:560,setsar=1[v_out]`,
            `[0:a]aresample=async=1000,asetpts=PTS-STARTPTS,afade=t=out:st=${fadeStart}:d=1.5[a_out]`
          ].join(';');

      const buildArgs = (useCpu) => {
        const base = ['-y', '-ss', String(part.startTime), '-reinit_filter', '0', '-i', masterVideo];
        if (hasOverlay) base.push('-i', overlayPng);
        base.push('-filter_complex', fc, '-map', '[v_out]', '-map', '[a_out]', '-t', String(part.duration));
        if (useCpu || !enc.isGpu) {
          base.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', '60');
        } else {
          base.push(...enc.args, '-pix_fmt', 'yuv420p', '-r', '60');
        }
        base.push('-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', bodyClipPath);
        return base;
      };

      try {
        await runFFmpeg(buildArgs(false));
      } catch (renderErr) {
        if (enc.isGpu) {
          await runFFmpeg(buildArgs(true));
        } else {
          throw renderErr;
        }
      }

      // 4. Prepend 0.8s Intro Thumbnail Segment if enabled
      if (embedIntroThumb && hasShortThumb && bodyClipPath !== outShortPath) {
        const introSegPath = path.join(shortsCacheDir, `intro_${lang}_part${padNum}.mp4`);
        await runFFmpeg([
          '-y',
          '-loop', '1', '-framerate', '60', '-t', String(introThumbSec), '-i', shortThumbPath,
          '-f', 'lavfi', '-t', String(introThumbSec), '-i', 'anullsrc=r=48000:cl=stereo',
          '-vf', 'scale=1080:1920,setsar=1,format=yuv420p',
          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', '60',
          '-c:a', 'aac', '-b:a', '192k',
          '-shortest', introSegPath
        ]);
        const concatTxt = path.join(shortsCacheDir, `concat_${lang}_part${padNum}.txt`);
        await fsp.writeFile(
          concatTxt,
          `file '${introSegPath.split(path.sep).join('/')}'\nfile '${bodyClipPath.split(path.sep).join('/')}'\n`,
          'utf8'
        );
        await runFFmpeg([
          '-y', '-f', 'concat', '-safe', '0', '-i', concatTxt,
          '-c', 'copy', '-movflags', '+faststart', outShortPath
        ]);
      }

      // Mirror to renders/shorts if exports/shorts was primary
      const legacyShortsDir = path.join(projectDir, 'renders', 'shorts');
      if (shortsDir !== legacyShortsDir) {
        await fsp.mkdir(legacyShortsDir, { recursive: true });
        await fsp.copyFile(outShortPath, path.join(legacyShortsDir, outShortName)).catch(() => {});
      }

      const stat = await fsp.stat(outShortPath);
      const copyText = {
        lang,
        part: partNum,
        sceneRange: part.sceneRange,
        filename: outShortName,
        thumbnail: `thumbnails/shorts/short_part_${padNum}_${lang}.png`,
        duration: +(part.duration + (embedIntroThumb && hasShortThumb ? introThumbSec : 0)).toFixed(1),
        title: partTitle,
        main_video_title: mainTitle,
        tiktok_caption: `${partTitle} | ${cfg.cta}\n\n${cfg.tags.join(' ')}`,
        reels_caption: `${partTitle}\n\n${cfg.cta}\n\n${cfg.tags.join(' ')}`,
        youtube_shorts_title: `${partTitle} #Shorts #History`,
        description_cta: `Watch the full documentary on YouTube: ${cfg.handle}`
      };

      metadataExport.parts.push(copyText);
      results.exports.push({
        lang,
        part: partNum,
        sceneRange: part.sceneRange,
        title: partTitle,
        path: outShortPath,
        filename: outShortName,
        thumbnail: `thumbnails/shorts/short_part_${padNum}_${lang}.png`,
        sizeMb: (stat.size / (1024 * 1024)).toFixed(1)
      });
    }
  }

  const metaPath = path.join(shortsDir, 'metadata_distribution.json');
  await fsp.writeFile(metaPath, JSON.stringify(metadataExport, null, 2), 'utf8');

  await closePlateRenderer().catch(() => {});
  return results;
}

if (require.main === module) {
  const targetProject = process.argv[2] || 'simple_itihash_002_first_language';
  exportProjectDual(targetProject)
    .then(r => {
      console.log(`\n🎉 Dual-Export completed! Total exports: ${r.exports.length}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { exportProjectDual, calculateParts, getHardwareEncoder };
