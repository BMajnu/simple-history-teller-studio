const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '..', 'projects', 'simple_itihash_004_bronze_age_collapse');
const researchDir = path.join(projectDir, 'research');
const visualAssetsDir = path.join(projectDir, 'visual_assets');
const audioDir = path.join(projectDir, 'audio');
const audioBnDir = path.join(audioDir, 'bn');
const audioEnDir = path.join(audioDir, 'en');
const audioHiDir = path.join(audioDir, 'hi');
const audioSfxDir = path.join(audioDir, 'sfx');
const audioBgmDir = path.join(audioDir, 'bgm');
const metadataDir = path.join(projectDir, 'metadata');
const exportsDir = path.join(projectDir, 'exports');

[projectDir, researchDir, visualAssetsDir, audioBnDir, audioEnDir, audioHiDir, audioSfxDir, audioBgmDir, metadataDir, exportsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

console.log("Directories initialized successfully.");
