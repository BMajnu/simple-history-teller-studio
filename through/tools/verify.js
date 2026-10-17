/**
 * Through load-readiness verifier (dev-only, zero dependencies).
 * Run: node tools/verify.js   (exit 0 = chrome://extensions load-ready)
 *
 * Checks:
 *  1. Every file referenced by manifest.json exists.
 *  2. sidepanel.html script refs exist.
 *  3. sitePacks.json packs are well-formed; preset ops are known ops.
 *  4. examples/*.json jobs match the universal job schema.
 *  5. Universality guard: core files contain no site-specific strings.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let failures = 0;
const ok = (msg) => console.log('  ok  ' + msg);
const fail = (msg) => { failures++; console.log('  FAIL ' + msg); };

const KNOWN_OPS = new Set(['sleep', 'navigate', 'waitFor', 'click', 'fill', 'selectOption',
  'uploadDataUrl', 'extract', 'runJS', 'pageRpc', 'askHuman', 'download']);

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// --- 1. manifest refs -----------------------------------------------------
console.log('[1] manifest references');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const refs = [
  manifest.background && manifest.background.service_worker,
  ...((manifest.content_scripts || []).flatMap((cs) => cs.js || [])),
  ...((manifest.web_accessible_resources || []).flatMap((w) => w.resources || [])),
  manifest.side_panel && manifest.side_panel.default_path,
  ...Object.values(manifest.icons || {}),
  ...Object.values((manifest.action && manifest.action.default_icon) || {}),
].filter(Boolean);
for (const r of new Set(refs)) {
  if (exists(r)) ok(r);
  else fail('missing file: ' + r);
}

// --- 2. sidepanel html refs ------------------------------------------------
console.log('[2] sidepanel refs');
const html = fs.readFileSync(path.join(ROOT, 'src/sidepanel/sidepanel.html'), 'utf8');
for (const m of html.matchAll(/src="([^"]+)"/g)) {
  if (exists('src/sidepanel/' + m[1])) ok('sidepanel/' + m[1]);
  else fail('missing sidepanel asset: ' + m[1]);
}

// --- 3. site packs ---------------------------------------------------------
console.log('[3] site packs');
const packs = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/sites/sitePacks.json'), 'utf8'));
for (const [id, p] of Object.entries(packs)) {
  if (!p.label || !Array.isArray(p.match) || !p.note) { fail(`pack ${id}: needs label/match/note`); continue; }
  if (p.actionsPreset) {
    for (const a of p.actionsPreset) {
      if (!KNOWN_OPS.has(a.op)) fail(`pack ${id}: unknown op ${a.op}`);
    }
  }
  ok(`pack ${id} (${p.match.join(',') || 'fallback'})`);
}

// --- 4. examples schema ----------------------------------------------------
console.log('[4] examples');
const checkActions = (where, actions) => {
  if (!Array.isArray(actions) || !actions.length) { fail(where + ': actions[] empty'); return; }
  for (const a of actions) {
    if (!a || !KNOWN_OPS.has(a.op)) { fail(`${where}: unknown op ${a && a.op}`); continue; }
    if (typeof a.args !== 'object' || a.args === null) fail(`${where}/${a.op}: args must be object`);
  }
};
for (const f of fs.readdirSync(path.join(ROOT, 'examples'))) {
  if (!f.endsWith('.json')) continue;
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'examples', f), 'utf8'));
  const jobs = Array.isArray(data) ? data : data.jobs;
  if (!Array.isArray(jobs) || !jobs.length) { fail(f + ': no jobs'); continue; }
  let n = 0;
  for (const j of jobs) {
    n++;
    if (typeof j.url !== 'string' || !/^https?:\/\//.test(j.url)) { fail(`${f}#${n}: url must be http(s)`); continue; }
    checkActions(`${f}#${n}`, j.actions);
  }
  ok(`${f} (${jobs.length} jobs)`);
}
for (const f of fs.readdirSync(path.join(ROOT, 'pipeline'))) {
  if (!f.endsWith('.json')) continue;
  JSON.parse(fs.readFileSync(path.join(ROOT, 'pipeline', f), 'utf8'));
  ok(`pipeline/${f} (valid JSON)`);
}
// Verbatim ports must keep their source headers
for (const rel of ['src/sites/flow/prompt.md', 'src/sites/flow/video-prompt.md',
  'src/sites/flow/flow-ui-elements.md', 'src/sites/flow/openai-reference.js']) {
  const head = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n')[0];
  if (/EXACT PORT/.test(head)) ok(rel + ' (attributed)');
  else fail(rel + ': missing EXACT PORT header');
}
for (const f of fs.readdirSync(path.join(ROOT, 'skills', 'flowkit'))) {
  const head = fs.readFileSync(path.join(ROOT, 'skills', 'flowkit', f), 'utf8').split('\n')[0];
  if (/EXACT PORT/.test(head)) ok(`skills/flowkit/${f} (attributed)`);
  else fail(`skills/flowkit/${f}: missing EXACT PORT header`);
}

// --- 5. universality guard -------------------------------------------------
console.log('[5] universality guard (core must not name sites)');
const CORE = [
  'src/background/engine.js',
  'src/content/content.js',
  'src/injected/pageBridge.js',
  'src/sidepanel/sidepanel.js',
];
const FORBIDDEN = ['flow.google.com', 'labs.google', 'aistudio.google.com',
  'studio.youtube.com', 'youtube.com', 'facebook.com', 'fb.com', 'tiktok.com',
  'PINHOLE', 'veo-3', 'nano-banana', 'ya29'];
for (const rel of CORE) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const hits = FORBIDDEN.filter((s) => src.includes(s));
  if (hits.length) fail(`${rel}: site-specific strings: ${hits.join(', ')}`);
  else ok(rel + ' clean');
}

console.log(failures === 0 ? '\nVERIFY: ALL PASS' : `\nVERIFY: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
