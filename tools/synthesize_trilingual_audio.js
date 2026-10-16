const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { synthesizeSpeech } = require('./tts_helper');

const PROJECT_DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJECT_DIR, 'audio');

fs.mkdirSync(AUDIO_DIR, { recursive: true });

function getAudioDuration(filePath) {
  const res = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ], { encoding: 'utf8' });
  const dur = parseFloat(res.stdout.trim());
  return isNaN(dur) ? 0 : dur;
}

async function run() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  console.log(`Starting trilingual audio synthesis for ${project.project_id}...`);
  console.log(`Scenes count: ${project.scenes.length}`);

  const languages = [
    { code: 'bn', name: 'Bengali' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' }
  ];

  for (const lang of languages) {
    console.log(`\n========================================`);
    console.log(`Processing Language: ${lang.name} (${lang.code})`);
    console.log(`========================================`);

    const concatList = [];

    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i];
      const sceneNum = String(scene.scene_id).padStart(4, '0');
      const text = scene.narration[lang.code];
      const sceneFile = path.join(AUDIO_DIR, `${lang.code}_scene_${sceneNum}.mp3`);

      console.log(`[${lang.code.toUpperCase()}] Scene ${scene.scene_id} (${scene.dialogue_speaker}): "${text.substring(0, 45)}..."`);

      try {
        await synthesizeSpeech(text, lang.code, sceneFile);
        const dur = getAudioDuration(sceneFile);
        console.log(`  -> Generated: ${path.basename(sceneFile)} (${dur.toFixed(2)}s)`);

        // Record duration for BN as reference for timeline synchronization
        if (lang.code === 'bn') {
          scene.audio_duration = dur;
          scene.duration = Math.max(dur + 0.4, 5.0); // breathing room 0.4s
        }
        concatList.push(sceneFile);
      } catch (err) {
        console.error(`  -> ERROR on Scene ${scene.scene_id}:`, err.message);
      }

      // Small delay between synthesis requests
      await new Promise(r => setTimeout(r, 120));
    }

    // Build master concatenated audio for this language
    const listFile = path.join(AUDIO_DIR, `${lang.code}_concat_list.txt`);
    fs.writeFileSync(listFile, concatList.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
    const fullAudioFile = path.join(AUDIO_DIR, `${lang.code}_narration_full.mp3`);

    console.log(`Concatenating master track for ${lang.name}...`);
    const r = spawnSync('ffmpeg', ['-hide_banner', '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', fullAudioFile]);
    if (r.status === 0) {
      const totalDur = getAudioDuration(fullAudioFile);
      console.log(`SUCCESS: Master ${lang.name} audio saved: ${fullAudioFile} (${(totalDur / 60).toFixed(2)} min / ${totalDur.toFixed(1)}s)`);
    } else {
      console.error(`ERROR: Failed to concat master audio for ${lang.name}`);
    }
  }

  // Calculate total timeline duration
  let totalTimeline = 0;
  for (const s of project.scenes) {
    totalTimeline += s.duration || 45.0;
  }
  project.total_duration_seconds = totalTimeline;
  console.log(`\nUpdated total project duration: ${totalTimeline.toFixed(1)}s (${(totalTimeline / 60).toFixed(2)} minutes)`);

  fs.writeFileSync(PROJECT_JSON, JSON.stringify(project, null, 2), 'utf8');
  console.log(`Saved updated project.json with synced timeline.`);
}

run().catch(console.error);
