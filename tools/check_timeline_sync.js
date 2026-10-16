const fs = require('fs');
const { execSync } = require('child_process');
const pj = JSON.parse(fs.readFileSync('projects/sample_first_king/project.json', 'utf8'));

console.log('Comparing scenes in project.json vs actual bn audio durations:');
let totalAudio = 0;
let totalPj = 0;
const diffs = [];

pj.scenes.forEach((s) => {
  const pad = String(s.scene_id).padStart(4, '0');
  const file = `projects/sample_first_king/audio/raw/bn_scene_${pad}.wav`;
  let dur = 0;
  if (fs.existsSync(file)) {
    dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`).toString().trim());
  }
  totalAudio += dur;
  totalPj += s.duration;
  if (Math.abs(s.duration - dur) > 0.5) {
    diffs.push({ id: s.scene_id, pjDur: s.duration, audioDur: +dur.toFixed(2), diff: +(s.duration - dur).toFixed(2) });
  }
});

console.log('Total project.json duration:', totalPj.toFixed(1));
console.log('Total audio duration:', totalAudio.toFixed(1));
console.log('Scenes with >0.5s duration mismatch:', diffs.length, 'out of', pj.scenes.length);
console.log('First 10 mismatches:\n', diffs.slice(0, 10));
