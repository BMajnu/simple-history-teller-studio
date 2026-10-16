// One-off planner: slice full BN master into 5 scene-snapped Shorts + content map.
// Run: node tools/plan_five_shorts.js  (writes projects/sample_first_king/metadata/shorts_plan.json)
const fs = require('fs');
const path = require('path');

const proj = require('../projects/sample_first_king/project.json');
const N = 5;
const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const bfmt = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');

let t = 0;
const sc = proj.scenes.map((s) => {
  const st = t;
  t += s.language_durations.bn;
  return { id: s.scene_id, par: s.parent_scene_id, st, en: t, n: s.narration.bn };
});
const total = t;
console.log('TOTAL BN ' + total.toFixed(1) + 's  target/part ' + (total / N).toFixed(1) + 's');

const parts = [];
let b = 0;
for (let p = 1; p <= N; p++) {
  const ideal = (total / N) * p;
  let bi = sc.findIndex((s) => s.en >= ideal);
  if (p === N) bi = sc.length - 1;
  const e = sc[bi].en;
  const part = {
    part: p,
    start: Math.round(sc[b].st * 10) / 10,
    end: Math.round(e * 10) / 10,
    duration: Math.round((e - sc[b].st) * 10) / 10,
    label: fmt(sc[b].st) + ' - ' + fmt(e),
    scenes: [sc[b].id, sc[bi].id],
    parents: [sc[b].par, sc[bi].par],
    head: sc[b].n,
    tail: sc[bi].n,
  };
  console.log('SHORT' + p + ': ' + bfmt(part.start) + ' -> ' + bfmt(part.end) + ' (' + part.duration + 's) scenes ' + part.scenes[0] + '-' + part.scenes[1]);
  console.log('  head: ' + part.head.slice(0, 100));
  console.log('  tail: ' + part.tail.slice(0, 100));
  parts.push(part);
  b = bi + 1;
}
const out = path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'metadata', 'shorts_plan.json');
fs.writeFileSync(out, JSON.stringify({ total: Math.round(total * 10) / 10, parts }, null, 2), 'utf8');
console.log('Wrote ' + out);
