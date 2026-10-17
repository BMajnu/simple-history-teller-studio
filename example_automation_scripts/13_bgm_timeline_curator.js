const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FFMPEG = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const FFPROBE = fs.existsSync(path.join(ROOT, 'bin', 'ffprobe.exe')) ? path.join(ROOT, 'bin', 'ffprobe.exe') : 'ffprobe';

// Historical Era procedural acoustic matrix
const ERA_CONFIGS = {
  bronze_age_collapse: {
    name: 'Late Bronze Age Collapse (c. 1200 BCE Mediterranean)',
    freq1: 130.81, // C3 (Aegean minor modal root)
    freq2: 196.00, // G3 (Deep open fifth)
    freq3: 155.56, // Eb3 (Tragic minor third)
    pulseFreq: 72.00, // Deep bronze military kettle pulse
    pulseBpmHz: 1.15, // 69 BPM driving ancient war tempo
    filter: 'lowpass=f=400,highpass=f=45',
    ambience: 'anoisesrc=color=brown:sample_rate=48000:amplitude=0.08',
    reverb: 'aecho=0.8:0.86:75:0.38'
  },
  prehistoric_mesopotamia: {
    name: 'Prehistory to Ancient Mesopotamia (First King)',
    freq1: 110.00, // A2 (Earth primal root)
    freq2: 164.81, // E3 (Open fifth)
    freq3: 146.83, // D3 (Sumerian/Mesopotamian modal fourth)
    pulseFreq: 68.00, // Deep acoustic frame drum resonance
    pulseBpmHz: 1.2,  // 72 BPM ceremonial heartbeat
    filter: 'lowpass=f=360,highpass=f=40',
    ambience: 'anoisesrc=color=brown:sample_rate=48000:amplitude=0.07',
    reverb: 'aecho=0.8:0.85:70:0.35'
  },
  ancient_egypt: {
    name: 'Ancient Egypt & Pharaohs',
    freq1: 146.83, // D3 (Phrygian desert drone)
    freq2: 220.00, // A3
    freq3: 185.00, // F#3
    pulseFreq: 75.00,
    pulseBpmHz: 1.1,
    filter: 'lowpass=f=420,highpass=f=50',
    ambience: 'anoisesrc=color=brown:sample_rate=48000:amplitude=0.08',
    reverb: 'aecho=0.8:0.88:80:0.4'
  },
  prehistoric: {
    name: 'Prehistory & Stone Age',
    freq1: 110.00, // A2
    freq2: 164.81, // E3
    freq3: 130.81, // C3 (Primal minor)
    pulseFreq: 60.00,
    pulseBpmHz: 1.0,
    filter: 'lowpass=f=320,highpass=f=35',
    ambience: 'anoisesrc=color=pink:sample_rate=48000:amplitude=0.06',
    reverb: 'aecho=0.8:0.82:90:0.35'
  },
  classical_india: {
    name: 'Classical India (Gupta / Nalanda)',
    freq1: 174.61, // F3
    freq2: 261.63, // C4
    freq3: 196.00, // G3
    pulseFreq: 82.00,
    pulseBpmHz: 1.35,
    filter: 'lowpass=f=480,highpass=f=55',
    ambience: 'anoisesrc=color=brown:sample_rate=48000:amplitude=0.05',
    reverb: 'aecho=0.8:0.88:100:0.4'
  },
  islamic_golden_age: {
    name: 'Islamic Golden Age',
    freq1: 196.00, // G3 (Bayati/Rast modal)
    freq2: 293.66, // D4
    freq3: 233.08, // Bb3
    pulseFreq: 88.00,
    pulseBpmHz: 1.3,
    filter: 'lowpass=f=520,highpass=f=50',
    ambience: 'anoisesrc=color=brown:sample_rate=48000:amplitude=0.04',
    reverb: 'aecho=0.8:0.88:85:0.38'
  },
  medieval: {
    name: 'Medieval & Renaissance',
    freq1: 146.83, // D3
    freq2: 220.00, // A3
    freq3: 174.61, // F3
    pulseFreq: 80.00,
    pulseBpmHz: 1.25,
    filter: 'lowpass=f=550,highpass=f=60',
    ambience: 'anoisesrc=color=pink:sample_rate=48000:amplitude=0.04',
    reverb: 'aecho=0.8:0.90:120:0.45'
  },
  noir: {
    name: 'Dark History & Conspiracies',
    freq1: 65.41,  // C2 (Sub-bass drone)
    freq2: 77.78,  // Eb2
    freq3: 98.00,  // G2
    pulseFreq: 110.00,
    pulseBpmHz: 1.0, // Ticking clock pulse
    filter: 'lowpass=f=280,highpass=f=30',
    ambience: 'anoisesrc=color=brown:sample_rate=48000:amplitude=0.09',
    reverb: 'aecho=0.8:0.80:50:0.3'
  }
};

/**
 * Procedurally generates or curates era-authentic background music.
 * @param {Object} options
 * @param {string} options.projectId - Project folder name (e.g. 'sample_first_king')
 * @param {string} options.era - Era key from ERA_CONFIGS
 * @param {number} [options.durationSeconds] - Override duration (default: read from project.json)
 */
function generateProjectBgm({ projectId = 'sample_first_king', era = 'prehistoric_mesopotamia', durationSeconds = null } = {}) {
  const projectDir = path.join(ROOT, 'projects', projectId);
  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  // Load project.json to determine exact documentary duration if not provided
  let targetDuration = durationSeconds;
  const projectJsonPath = path.join(projectDir, 'project.json');
  if (!targetDuration && fs.existsSync(projectJsonPath)) {
    try {
      const pData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
      targetDuration = pData.target_duration_seconds || pData.total_duration_seconds || 900;
    } catch (e) {
      targetDuration = 900;
    }
  }
  if (!targetDuration) targetDuration = 961;

  const audioDir = path.join(projectDir, 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  const bgmOutPath = path.join(audioDir, 'bgm.mp3');

  // Archive existing BGM if present
  if (fs.existsSync(bgmOutPath)) {
    const histDir = path.join(audioDir, '_history');
    if (!fs.existsSync(histDir)) fs.mkdirSync(histDir, { recursive: true });
    const backupName = `bgm_backup_${Date.now()}.mp3`;
    fs.copyFileSync(bgmOutPath, path.join(histDir, backupName));
    console.log(`[BGM] Archived existing BGM to _history/${backupName}`);
  }

  const config = ERA_CONFIGS[era] || ERA_CONFIGS.prehistoric_mesopotamia;

  console.log(`======================================================================`);
  console.log(`COMPOSING ERA-AUTHENTIC SOUNDTRACK`);
  console.log(`Project:  ${projectId}`);
  console.log(`Era:      ${config.name} [${era}]`);
  console.log(`Duration: ${targetDuration} seconds (${(targetDuration / 60).toFixed(1)} mins)`);
  console.log(`Output:   ${bgmOutPath}`);
  console.log(`======================================================================`);

  // Multi-layer procedural synthesis matching Instruction 07:
  // Layer 1: Fundamental modal bass drone
  // Layer 2: Open acoustic harmonic fifth
  // Layer 3: Modal color third / fourth
  // Layer 4: Tribal acoustic frame drum pulse (modulated LFO sine)
  // Layer 5: Atmospheric environmental noise (desert wind / earth bed)
  // Master: Reverb chamber + stereo widening + EBU R128 loudness normalization (-18 dB RMS)
  const filterGraph = [
    `[0:a]volume=0.20,lowpass=f=350[d1]`,
    `[1:a]volume=0.14,lowpass=f=450[d2]`,
    `[2:a]volume=0.12,lowpass=f=400[d3]`,
    `[3:a]tremolo=f=${config.pulseBpmHz}:d=0.85,lowpass=f=140,volume=0.26[pulse]`,
    `[4:a]${config.filter},volume=0.14[amb]`,
    `[d1][d2][d3][pulse][amb]amix=inputs=5:duration=first:dropout_transition=0,${config.reverb},stereotools=mlev=0.8:slev=1.2,volume=0.5,loudnorm=I=-18:TP=-1.5:LRA=9[out]`
  ].join(';');

  const args = [
    '-hide_banner', '-y',
    '-f', 'lavfi', '-i', `sine=frequency=${config.freq1}:duration=${targetDuration}`,
    '-f', 'lavfi', '-i', `sine=frequency=${config.freq2}:duration=${targetDuration}`,
    '-f', 'lavfi', '-i', `sine=frequency=${config.freq3}:duration=${targetDuration}`,
    '-f', 'lavfi', '-i', `sine=frequency=${config.pulseFreq}:duration=${targetDuration}`,
    '-f', 'lavfi', '-i', `${config.ambience}:duration=${targetDuration}`,
    '-filter_complex', filterGraph,
    '-map', '[out]',
    '-t', String(targetDuration),
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    '-ar', '48000',
    '-ac', '2',
    bgmOutPath
  ];

  const startTime = Date.now();
  console.log('[BGM] Executing high-precision FFmpeg audio synthesis pipeline...');
  const r = spawnSync(FFMPEG, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  if (r.status !== 0) {
    const errText = r.stderr?.toString() || 'Unknown FFmpeg error';
    throw new Error(`Failed to generate custom BGM: ${errText}`);
  }

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const fileSizeMb = (fs.statSync(bgmOutPath).size / (1024 * 1024)).toFixed(2);
  console.log(`[BGM] ✓ Soundtrack successfully generated in ${elapsedSec}s!`);
  console.log(`[BGM] File: ${bgmOutPath} (${fileSizeMb} MB)`);

  // Verification with ffprobe
  if (fs.existsSync(FFPROBE)) {
    const probe = spawnSync(FFPROBE, [
      '-v', 'error',
      '-show_entries', 'format=duration,bit_rate,size:stream=sample_rate,channels,codec_name',
      '-of', 'json',
      bgmOutPath
    ]);
    if (probe.status === 0) {
      try {
        const pInfo = JSON.parse(probe.stdout.toString());
        const stream = pInfo.streams?.[0] || {};
        const fmt = pInfo.format || {};
        console.log(`[BGM] ffprobe Verification:`);
        console.log(`      Codec:       ${stream.codec_name}`);
        console.log(`      Sample Rate: ${stream.sample_rate} Hz`);
        console.log(`      Channels:    ${stream.channels} (Stereo)`);
        console.log(`      Bitrate:     ${Math.round((fmt.bit_rate || 0) / 1000)} kbps`);
        console.log(`      Duration:    ${parseFloat(fmt.duration || 0).toFixed(1)}s (Target: ${targetDuration}s)`);
      } catch (e) {
        // probe parsing error ignored
      }
    }
  }

  return {
    filePath: bgmOutPath,
    duration: targetDuration,
    era: era,
    eraName: config.name
  };
}

// Support CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let projectId = 'sample_first_king';
  let era = 'prehistoric_mesopotamia';
  let duration = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && args[i + 1]) projectId = args[++i];
    if (args[i] === '--era' && args[i + 1]) era = args[++i];
    if (args[i] === '--duration' && args[i + 1]) duration = parseFloat(args[++i]);
  }

  try {
    generateProjectBgm({ projectId, era, durationSeconds: duration });
  } catch (err) {
    console.error('BGM Generation Error:', err.message);
    process.exit(1);
  }
}

module.exports = { generateProjectBgm, ERA_CONFIGS };
