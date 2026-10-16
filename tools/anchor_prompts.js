// Anchor restoration: style prefix + Chronicler mascot (03 section 6).
const fs = require('fs');
const MASCOT = 'Time Chronicler, the bald elderly scholar with long white beard, round glasses and brown robe holding torch and ancient book (match the attached character design exactly), ';
const STRIP = /(cute egg-headed sticky scholar( mascot)?|big round white head|round brass spectacles|brown tweed vest( over white shirt)?|pocket-?watch chain|egg-?head(ed)?( mascot)?|warm friendly smile)/gi;
const PRESETS = {
  simple_itihash_002_first_language: 'Sticky-Meme cutout vector cartoon, thick outlines, flat warm colors, ',
  simple_itihash_003_nalanda: 'Simple History cutout vector cartoon, clean shapes, warm parchment tones, '
};
for (const [proj, anchor] of Object.entries(PRESETS)) {
  const p = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\' + proj + '\\project.json';
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const key = anchor.split(' ')[0].toLowerCase();
  let nA = 0, nM = 0;
  for (const s of d.scenes) {
    let v = s.visual_prompt;
    const isCh = /chronicler/i.test(v);
    if (isCh) { v = v.replace(STRIP, 'Time Chronicler').replace(/Time Chronicler(\s+Time Chronicler)+/g, 'Time Chronicler'); v = v.replace(/Time Chronicler/i, MASCOT.trim().replace(/, $/, '')); nM++; }
    if (!v.toLowerCase().startsWith(key) && !v.toLowerCase().includes(key.split(' ')[0] + ' ' + (proj.includes('002') ? 'cutout' : 'cutout'))) {
      // prepend only if preset phrase absent anywhere
      const has = proj.includes('002') ? /sticky-meme/i.test(v) : /simple history/i.test(v);
      if (!has) { v = anchor + v.charAt(0).toLowerCase() + v.slice(1); nA++; }
    }
    s.visual_prompt = v;
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
  console.log(proj + ': anchors-added=' + nA + ' mascot-fixed=' + nM);
}
