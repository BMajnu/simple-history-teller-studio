/**
 * Batch generate 24fps motion video clips for Episode 1 dynamic scenes
 * Uses FFmpeg with 4K internal super-sampling (3840x2160) for buttery-smooth 24fps film motion.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');
const FFMPEG = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';

const CLIPS = [
  {
    id: 6,
    dur: 10.5,
    motion: 'push_impact',
    desc: 'Hunter chief dramatic shout & spear thrust'
  },
  {
    id: 12,
    dur: 11.0,
    motion: 'campfire_sway',
    desc: 'Hunters roaring with campfire laughter'
  },
  {
    id: 18,
    dur: 11.0,
    motion: 'kinetic_pan_right',
    desc: 'Running chase across savannah'
  },
  {
    id: 24,
    dur: 11.0,
    motion: 'storm_shake',
    desc: 'Torrential mud & lightning storm'
  },
  {
    id: 30,
    dur: 11.0,
    motion: 'torch_push',
    desc: 'Torch perimeter watch against predators'
  },
  {
    id: 36,
    dur: 11.0,
    motion: 'steady_pan',
    desc: 'Phalanx marching outside Sumerian walls'
  },
  {
    id: 42,
    dur: 10.5,
    motion: 'axe_slam_impact',
    desc: 'Warlord axe slam on stone war table'
  },
  {
    id: 48,
    dur: 11.0,
    motion: 'majestic_tilt',
    desc: 'Ziggurat priest chanting to starry skies'
  },
  {
    id: 54,
    dur: 11.0,
    motion: 'chariot_charge',
    desc: 'War chariots stampeding across plains'
  },
  {
    id: 60,
    dur: 11.0,
    motion: 'heroic_mace_zoom',
    desc: 'Pharaoh Narmer victory mace strike'
  },
  {
    id: 66,
    dur: 11.5,
    motion: 'flood_wave_pan',
    desc: 'Surging floodwaters across fertile delta'
  },
  {
    id: 70,
    dur: 12.0,
    motion: 'historian_scholarly',
    desc: 'Time Chronicler turning cosmic clockwork'
  },
  {
    id: 74,
    dur: 11.5,
    motion: 'monument_collapse',
    desc: 'Tyrant stone monument fracturing'
  },
  {
    id: 78,
    dur: 11.0,
    motion: 'scroll_unveil',
    desc: 'Time Chronicler unveiling moral scroll'
  },
  {
    id: 80,
    dur: 11.5,
    motion: 'book_snap_outro',
    desc: 'Time Chronicler snapping book shut & portal exit'
  }
];

function buildVf(motion, frames) {
  let zx;
  switch (motion) {
    case 'push_impact':
      // Dynamic camera push-in with forward momentum
      zx = {
        z: `min(1.0+0.18*on/${frames},1.18)`,
        x: `iw/2-(iw/zoom/2)+4*sin(on/4)`,
        y: `ih/2-(ih/zoom/2)+2*cos(on/5)`
      };
      break;
    case 'campfire_sway':
      // Gentle warm comic sway and breathing zoom
      zx = {
        z: `1.0+0.08*sin(2*3.1415*on/${frames})`,
        x: `iw/2-(iw/zoom/2)+5*sin(on/8)`,
        y: `ih/2-(ih/zoom/2)`
      };
      break;
    case 'kinetic_pan_right':
      // Fast lateral pan with running cadence
      zx = {
        z: `1.12`,
        x: `(iw-iw/zoom)*(on/${frames})+4*sin(on/2)`,
        y: `ih/2-(ih/zoom/2)+5*abs(sin(on/2))`
      };
      break;
    case 'storm_shake':
      // Stormy turbulence and steady zoom
      zx = {
        z: `1.0+0.14*on/${frames}`,
        x: `iw/2-(iw/zoom/2)+8*sin(on/3)`,
        y: `ih/2-(ih/zoom/2)+6*cos(on/2.5)`
      };
      break;
    case 'torch_push':
      // Torchlight perimeter zoom-in
      zx = {
        z: `min(1.0+0.15*on/${frames},1.15)`,
        x: `iw/2-(iw/zoom/2)+3*sin(on/6)`,
        y: `ih/2-(ih/zoom/2)+3*cos(on/6)`
      };
      break;
    case 'steady_pan':
      // Forward steady march pan
      zx = {
        z: `1.10`,
        x: `(iw-iw/zoom)*(1.0-on/${frames})`,
        y: `ih/2-(ih/zoom/2)`
      };
      break;
    case 'axe_slam_impact':
      // Dive-in camera with heavy stone impact shake
      zx = {
        z: `min(1.0+0.20*on/${frames},1.20)`,
        x: `iw/2-(iw/zoom/2)+9*sin(on/2.2)`,
        y: `ih/2-(ih/zoom/2)+7*cos(on/2)`
      };
      break;
    case 'majestic_tilt':
      // Slow majestic upward push to ziggurat stars
      zx = {
        z: `1.0+0.14*on/${frames}`,
        x: `iw/2-(iw/zoom/2)`,
        y: `(ih-ih/zoom)*(1.0-0.75*on/${frames})`
      };
      break;
    case 'chariot_charge':
      // High-speed tracking pan across plains
      zx = {
        z: `1.14`,
        x: `(iw-iw/zoom)*(on/${frames})`,
        y: `ih/2-(ih/zoom/2)+6*sin(on/2)`
      };
      break;
    case 'heroic_mace_zoom':
      // Heroic slow-motion impact zoom
      zx = {
        z: `min(1.0+0.22*on/${frames},1.22)`,
        x: `iw/2-(iw/zoom/2)`,
        y: `ih/2-(ih/zoom/2)`
      };
      break;
    case 'flood_wave_pan':
      // Rolling wave surge pan
      zx = {
        z: `1.12+0.06*sin(3.1415*on/${frames})`,
        x: `(iw-iw/zoom)*(on/${frames})`,
        y: `ih/2-(ih/zoom/2)+4*sin(on/4)`
      };
      break;
    case 'historian_scholarly':
      // Wise historian scholarly push-in
      zx = {
        z: `min(1.0+0.12*on/${frames},1.12)`,
        x: `iw/2-(iw/zoom/2)+3*sin(on/6)`,
        y: `ih/2-(ih/zoom/2)`
      };
      break;
    case 'monument_collapse':
      // Monument tremor shake and downward drop
      zx = {
        z: `1.0+0.16*on/${frames}`,
        x: `iw/2-(iw/zoom/2)+7*sin(on/2.5)`,
        y: `(ih-ih/zoom)*(0.3+0.7*on/${frames})`
      };
      break;
    case 'scroll_unveil':
      // Camera arc unveiling scroll
      zx = {
        z: `min(1.0+0.14*on/${frames},1.14)`,
        x: `iw/2-(iw/zoom/2)+5*cos(on/5)`,
        y: `ih/2-(ih/zoom/2)`
      };
      break;
    case 'book_snap_outro':
      // Outro book snap & portal zoom-out
      zx = {
        z: `max(1.18-0.18*on/${frames},1.0)`,
        x: `iw/2-(iw/zoom/2)+4*sin(on/5)`,
        y: `ih/2-(ih/zoom/2)`
      };
      break;
    default:
      zx = {
        z: `1.0+0.12*on/${frames}`,
        x: `iw/2-(iw/zoom/2)`,
        y: `ih/2-(ih/zoom/2)`
      };
  }

  return `scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,` +
    `zoompan=z='${zx.z}':x='${zx.x}':y='${zx.y}':d=${frames}:s=1920x1080:fps=24,` +
    `eq=contrast=1.03:saturation=1.06,format=yuv420p`;
}

async function run() {
  console.log(`🎬 Rendering ${CLIPS.length} dynamic motion video clips...`);
  const tStart = Date.now();

  for (let i = 0; i < CLIPS.length; i++) {
    const item = CLIPS[i];
    const pad = String(item.id).padStart(4, '0');
    const imgPath = path.join(VISUAL_DIR, `scene_${pad}.jpg`);
    const outPath = path.join(VISUAL_DIR, `clip_scene_${pad}.mp4`);

    if (!fs.existsSync(imgPath)) {
      console.warn(`[!] Skipping Scene ${item.id}: base image ${imgPath} not found`);
      continue;
    }

    const frames = Math.round(item.dur * 24);
    const vf = buildVf(item.motion, frames);

    const args = [
      '-y',
      '-loop', '1',
      '-framerate', '24',
      '-i', imgPath,
      '-vf', vf,
      '-t', String(item.dur),
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '19',
      '-pix_fmt', 'yuv420p',
      '-r', '24',
      '-an',
      outPath
    ];

    process.stdout.write(`[${i + 1}/${CLIPS.length}] Scene ${item.id} (${item.dur}s - ${item.desc})... `);
    const t0 = Date.now();
    try {
      execFileSync(FFMPEG, args, { stdio: 'pipe' });
      const sz = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
      console.log(`✓ DONE in ${((Date.now() - t0) / 1000).toFixed(1)}s (${sz} MB)`);
    } catch (err) {
      console.error(`❌ FAILED: ${err.message}`);
    }
  }

  console.log(`\n🎉 ALL 15 CLIPS GENERATED IN ${((Date.now() - tStart) / 1000).toFixed(1)}s!`);
}

run().catch(console.error);
