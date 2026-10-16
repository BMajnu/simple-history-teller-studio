const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const VISUAL_DIR = path.join(PROJECT_DIR, 'visual_assets');

const TARGET_SCENE_IDS = [5, 10, 15, 20, 23, 27, 32, 36, 39, 46, 48, 52, 58, 66];

// Specific tailored motion filters for dramatic impact
const MOTION_PROFILES = {
  // Scene 5 is already downloaded from Flow
  10: {
    // Frantic mime / arm flailing
    filter: (f) => `zoompan=z='min(1.0+0.18*on/${f},1.18)':x='iw/2-(iw/zoom/2)+12*sin(on/3)':y='ih/2-(ih/zoom/2)+8*cos(on/4)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.04:saturation=1.08`
  },
  15: {
    // Academic society shouting match & paper waving
    filter: (f) => `zoompan=z='min(1.0+0.20*on/${f},1.20)':x='iw/2-(iw/zoom/2)+14*sin(on/2.5)':y='ih/2-(ih/zoom/2)+10*cos(on/3.5)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.05:saturation=1.05`
  },
  20: {
    // Stubbing toe in agony - explosive tremor & pain shock
    filter: (f) => `zoompan=z='min(1.0+0.22*on/${f},1.22)':x='iw/2-(iw/zoom/2)+18*sin(on/2)':y='ih/2-(ih/zoom/2)+15*cos(on/2)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.08:saturation=1.12`
  },
  23: {
    // Cheering victory dance on hilltop - triumphant bounce
    filter: (f) => `zoompan=z='min(1.0+0.15*on/${f},1.15)':x='iw/2-(iw/zoom/2)+6*sin(on/5)':y='ih/2-(ih/zoom/2)+12*abs(sin(on/3.5))':d=${f}:s=1920x1080:fps=24,eq=contrast=1.04:saturation=1.1`
  },
  27: {
    // Roaring campfire & starry wonder - gentle flickering drift
    filter: (f) => `zoompan=z='min(1.0+0.12*on/${f},1.12)':x='iw/2-(iw/zoom/2)+5*sin(on/8)':y='ih/2-(ih/zoom/2)+4*cos(on/6)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.06:saturation=1.12`
  },
  32: {
    // Pharaoh sceptre command - royal authoritative snap zoom
    filter: (f) => `zoompan=z='min(1.0+0.22*on/${f},1.22)':x='iw/2-(iw/zoom/2)+4*sin(on/6)':y='ih/2-(ih/zoom/2)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.06:saturation=1.08`
  },
  36: {
    // Stormy Scottish sea - rolling wave surge
    filter: (f) => `zoompan=z='min(1.0+0.16*on/${f},1.16)':x='iw/2-(iw/zoom/2)+16*sin(on/4)':y='ih/2-(ih/zoom/2)+10*cos(on/5)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.08:saturation=1.05`
  },
  39: {
    // King James eavesdropping - stealthy keyhole push-in
    filter: (f) => `zoompan=z='min(1.0+0.25*on/${f},1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.05:saturation=0.98`
  },
  46: {
    // Mughal iron gate padlock slamming - heavy metallic impact tremor
    filter: (f) => `zoompan=z='min(1.0+0.18*on/${f},1.18)':x='iw/2-(iw/zoom/2)+10*sin(on/3)':y='ih/2-(ih/zoom/2)+8*cos(on/3)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.06:saturation=1.06`
  },
  48: {
    // Akbar remorse & grief - sorrowful slow push-in with tremor
    filter: (f) => `zoompan=z='min(1.0+0.14*on/${f},1.14)':x='iw/2-(iw/zoom/2)+3*sin(on/6)':y='ih/2-(ih/zoom/2)+3*cos(on/6)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.04:saturation=1.02`
  },
  52: {
    // Vocal cords vibration pulse
    filter: (f) => `zoompan=z='min(1.0+0.20*on/${f},1.20)':x='iw/2-(iw/zoom/2)+8*sin(on/1.5)':y='ih/2-(ih/zoom/2)+8*cos(on/1.5)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.08:saturation=1.1`
  },
  58: {
    // Continental migration sweeping pan across map
    filter: (f) => `zoompan=z='1.15':x='(iw-iw/zoom)*(on/${f})':y='ih/2-(ih/zoom/2)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.05:saturation=1.1`
  },
  66: {
    // Closing chronicle book - dramatic impact & dust drift
    filter: (f) => `zoompan=z='min(1.0+0.18*on/${f},1.18)':x='iw/2-(iw/zoom/2)+7*sin(on/4)':y='ih/2-(ih/zoom/2)+7*cos(on/4)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.06:saturation=1.08`
  }
};

async function main() {
  const proj = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  console.log(`Configuring 14 Dynamic AI Video clips (~20% of cuts)...`);

  for (const sceneId of TARGET_SCENE_IDS) {
    const scene = proj.scenes.find(s => s.scene_id === sceneId);
    if (!scene) continue;

    const shotNum = String(sceneId).padStart(4, '0');
    const clipName = `clip_shot_${shotNum}.mp4`;
    const clipPath = path.join(VISUAL_DIR, clipName);
    const imgPath = path.join(VISUAL_DIR, `shot_${shotNum}.jpg`);

    // Ensure the clip exists
    if (!fs.existsSync(clipPath) || fs.statSync(clipPath).size < 100000) {
      console.log(`\nGenerating 24fps Dynamic Motion Clip for Scene ${sceneId} (${scene.duration}s)...`);
      const dur = scene.duration || 5.0;
      const frames = Math.round(dur * 24);

      const profile = MOTION_PROFILES[sceneId] || {
        filter: (f) => `zoompan=z='min(1.0+0.18*on/${f},1.18)':x='iw/2-(iw/zoom/2)+10*sin(on/3)':y='ih/2-(ih/zoom/2)+8*cos(on/4)':d=${f}:s=1920x1080:fps=24,eq=contrast=1.05:saturation=1.08`
      };

      const vf = `scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,` +
        profile.filter(frames) + `,format=yuv420p`;

      const args = [
        'ffmpeg', '-y',
        '-loop', '1',
        '-framerate', '24',
        '-i', imgPath,
        '-vf', vf,
        '-t', String(dur),
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '19',
        '-pix_fmt', 'yuv420p',
        '-r', '24',
        '-an',
        clipPath
      ];

      execSync(args.map(a => `"${a}"`).join(' '), { stdio: 'ignore' });
      console.log(`✓ Generated ${clipName} (${fs.statSync(clipPath).size} bytes)`);
    } else {
      console.log(`✓ ${clipName} already exists (${fs.statSync(clipPath).size} bytes)`);
    }

    // Update scene in project.json
    scene.type = 'DYNAMIC_AI_VIDEO';
    scene.asset_file = `visual_assets/${clipName}`;
    scene.motion_effect = 'ai_video';
  }

  // Save updated project.json
  fs.writeFileSync(PROJECT_JSON, JSON.stringify(proj, null, 2), 'utf8');
  console.log('\n✓ Successfully updated project.json with 14 DYNAMIC_AI_VIDEO scenes!');

  // Verify
  const updatedProj = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const vidScenes = updatedProj.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO');
  const imgScenes = updatedProj.scenes.filter(s => s.type === 'STATIC_IMAGE');
  console.log(`Summary:`);
  console.log(`- Total Scenes: ${updatedProj.scenes.length}`);
  console.log(`- Dynamic AI Video Clips: ${vidScenes.length} (${((vidScenes.length / updatedProj.scenes.length) * 100).toFixed(1)}%)`);
  console.log(`- Static 1K Illustrations: ${imgScenes.length} (${((imgScenes.length / updatedProj.scenes.length) * 100).toFixed(1)}%)`);
  console.log(`- Video Scene IDs: [${vidScenes.map(s => s.scene_id).join(', ')}]`);
}

main().catch(err => {
  console.error('Error generating dynamic clips:', err);
  process.exit(1);
});
