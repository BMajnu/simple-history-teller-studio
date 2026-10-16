const fs = require('fs');
const p = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\simple_itihash_002_first_language\\project.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));
const S = d.scenes;
let bad = 0, shown = 0;
for (const s of S) {
  const cnt = (t, re) => (t.match(re) || []).length;
  const bn = cnt(s.narration.bn, /।/g) + cnt(s.narration.bn, /[?!]/g);
  const hi = cnt(s.narration.hi, /।/g) + cnt(s.narration.hi, /[?!]/g);
  const en = cnt(s.narration.en, /\./g) + cnt(s.narration.en, /[?!]/g);
  if (bn !== 1 || hi !== 1 || en !== 1) { bad++; if (shown < 8) { shown++; console.log(s.scene_id + ':bn' + bn + '/hi' + hi + '/en' + en); } }
}
console.log('TRUE_VIOLATIONS=' + bad + '/' + S.length);
const s54 = S.find(x => x.scene_id === 54);
console.log('S54BN:' + s54.narration.bn);
