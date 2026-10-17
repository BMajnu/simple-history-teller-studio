const fs = require('fs');
const path = require('path');

const PROJ_DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_004_bronze_age_collapse');
const PJ_PATH = path.join(PROJ_DIR, 'project.json');
const AUDIO_DIR = path.join(PROJ_DIR, 'audio', 'bn');

const project = JSON.parse(fs.readFileSync(PJ_PATH, 'utf8'));

let totalDuration = 0;
let syncedCount = 0;

project.scenes.forEach(s => {
  const pad = String(s.scene_id).padStart(4, '0');
  const wavPath = path.join(AUDIO_DIR, `scene_${pad}.wav`);
  if (fs.existsSync(wavPath)) {
    const size = fs.statSync(wavPath).size;
    const dur = Math.max(2.0, (size - 44) / 48000);
    s.duration = +(dur.toFixed(2));
    s.audio_file = `audio/bn/scene_${pad}.wav`;
    syncedCount++;
  }
  totalDuration += s.duration;
});

project.total_duration = +(totalDuration.toFixed(2));
fs.writeFileSync(PJ_PATH, JSON.stringify(project, null, 2));

console.log(`================================================================================`);
console.log(`TIMELINE SYNCHRONIZATION COMPLETE!`);
console.log(`Synced Scenes: ${syncedCount} / ${project.scenes.length}`);
console.log(`Total Documentary Duration: ${totalDuration.toFixed(2)} seconds (~${(totalDuration / 60).toFixed(1)} minutes)`);
console.log(`================================================================================`);
