// FIRST CITY ep004 dynamic AI video batch — modeled on tools/run_vid_batch_nalanda.js
// with fixes: daemon browser.contexts()[0] (new daemon contract), IMG_SLOTS-style
// slot rotation, auto launch of the CDP Chrome on profile_3.
//
// Run:   node tools/run_vid_batch_firstcity.js
// Probe: $env:ONLY_SCENE='1'; node tools/run_vid_batch_firstcity.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_004_first_city');
const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const FFPROBE = process.env.FFPROBE_BIN || 'ffprobe';

const MODEL = process.env.VID_MODEL || null;
const MODEL_CHAIN = MODEL ? [MODEL] : ['gemini-omni-1.1-flash', 'veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite'];
const SLOTS = (process.env.VID_SLOTS
  ? process.env.VID_SLOTS.split(',').map((n) => parseInt(n.trim(), 10))
  : [0, 1]);
const IMG_PROFILE_DIR = process.env.IMG_PROFILE_DIR
  || path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile_3');

function isReal(id) {
  const f = path.join(PROJ, 'visual_assets', `clip_shot_${String(id).padStart(4, '0')}.mp4`);
  if (!fs.existsSync(f) || fs.statSync(f).size < 500000) return false;
  try {
    const o = execSync(`"${FFPROBE}" -hide_banner -v error -show_entries stream=width,height -show_entries format=duration -of csv=p=0 "${f}"`).toString().trim().split(/\r?\n/);
    const dur = parseFloat(o[o.length - 1]);
    const wh = o.slice(0, -1).join(',');
    return dur > 5 && wh.includes('640');
  } catch { return false; }
}

const ONLY_SCENE = process.env.ONLY_SCENE ? parseInt(process.env.ONLY_SCENE, 10) : null;
const QUEUE = project.scenes
  .filter(s => s.type === 'DYNAMIC_AI_VIDEO' && (!ONLY_SCENE || s.scene_id === ONLY_SCENE) && !isReal(s.scene_id))
  .map(s => {
    const body = String(s.visual_prompt || '')
      .replace(/^(Simple\s+Itihash\s+)?(Scene|Shot|Part|Section)\s*\d+[:\-.]*\s*/i, '')
      .replace(/--no\s+.*$/i, '')
      .replace(/^Dynamic cartoon 2D animation in Simple History flat vector style,\s*/i, '')
      .trim();
    return {
      shot: s.scene_id,
      duration: s.duration,
      prompt: `Dynamic 2D cartoon animation in Simple History flat vector cutout style: ${body}, 24fps motion, 16:9 widescreen`
    };
  });

async function call(code) {
  const r = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
  });
  return r.json();
}

async function ensureChrome() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const r = await call('return 1');
      if (r.ok) return true;
    } catch (e) {}
    if (attempt === 0) {
      await fetch('http://127.0.0.1:9333/launch-chrome', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDataDir: IMG_PROFILE_DIR })
      }).catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return false;
}

async function generateOnce(job, slot, model) {
  const URL_ = 'https://aistudio.google.com/u/' + slot + '/prompts/new_chat?model=' + model;
  const code = `
    const pg = await browser.contexts()[0].newPage();
    try {
      await pg.goto(${JSON.stringify(URL_)}, { waitUntil: 'domcontentloaded' });
      await pg.waitForTimeout(6000);
      await pg.keyboard.press('Escape');
      const ta = pg.locator('textarea').first();
      await ta.waitFor({ timeout: 20000 });
      await ta.fill(${JSON.stringify(job.prompt)});
      await pg.waitForTimeout(800);
      await pg.keyboard.press('Control+Enter');
      let found = null;
      for (let i = 0; i < 80; i++) {
        await pg.waitForTimeout(3000);
        const qt = await pg.evaluate(() => /exceeded quota|Upgrade to unlock|try again later/i.test(document.body.innerText || '')).catch(() => false);
        if (qt) return { ok: false, err: 'QUOTA' };
        const v = await pg.evaluate(() => {
          const arr = Array.from(document.querySelectorAll('video'));
          const good = arr.filter(x => {
            const s = x.currentSrc || x.src || '';
            if (/zero-state|gstatic/.test(s)) return false;
            return (x.duration || 0) > 1 || s.startsWith('blob:');
          });
          return good.map(x => x.currentSrc || x.src);
        }).catch(() => []);
        if (v.length > 0 && v[0]) { found = v[0]; break; }
      }
      if (!found) return { ok: false, err: 'TIMEOUT' };
      const b = await pg.evaluate(async (u) => {
        const r = await fetch(u); const ab = await r.arrayBuffer();
        const by = new Uint8Array(ab); let bin = '';
        for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
        return { b64: btoa(bin), size: by.length };
      }, found);
      return { ok: true, size: b.size, b64: b.b64 };
    } finally { await pg.close().catch(() => {}); }
  `;
  const r = await call(code);
  return (r && r.result) ? r.result : { ok: false, err: (r && r.error) || 'DAEMON-ERR' };
}

async function worker(id, jobs) {
  const slotIdx0 = (id - 1) % SLOTS.length;
  let ok = 0, fail = 0;
  for (const job of jobs) {
    const out = path.join(PROJ, 'visual_assets', `clip_shot_${String(job.shot).padStart(4, '0')}.mp4`);
    let done = false;
    let modelIdx = 0;
    let slotIdx = slotIdx0;
    let attempts = 0;
    const loadModel = () => { for (let m = 0; m < MODEL_CHAIN.length; m++) { const cand = MODEL_CHAIN[(modelIdx + m) % MODEL_CHAIN.length]; return cand; } return MODEL_CHAIN[modelIdx % MODEL_CHAIN.length]; };
    const nextModel = () => { modelIdx = (modelIdx + 1) % MODEL_CHAIN.length; slotIdx = (slotIdx + 1) % SLOTS.length; attempts = 0; };
    while (!done && attempts < 8) {
      const model = MODEL_CHAIN[modelIdx % MODEL_CHAIN.length];
      const slot = SLOTS[slotIdx];
      attempts++;
      try {
        const r = await generateOnce(job, slot, model);
        if (r.ok) {
          fs.writeFileSync(out, Buffer.from(r.b64, 'base64'));
          ok++;
          console.log(`[V${id}] OK clip ${job.shot} u/${slot} (${r.size}B) [${model}]`);
          done = true;
        } else {
          console.log(`[V${id}] FAIL clip ${job.shot} u/${slot}: ${r.err} [${model}]`);
          if (r.err === 'QUOTA') nextModel();
          else if (attempts % 2 === 0) nextModel();
        }
      } catch (e) {
        console.log(`[V${id}] ERR clip ${job.shot}: ${e.message.slice(0, 80)} [${model}]`);
        nextModel();
      }
    }
    if (!done) fail++;
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log(`[V${id}] done ok=${ok} fail=${fail}`);
  return { ok, fail };
}

(async () => {
  const N = 3;
  if (!(await ensureChrome())) {
    console.error('Could not reach daemon Chrome on CDP 9224 after launch attempt.');
    process.exit(1);
  }
  const qs = Array.from({ length: N }, (_, i) => QUEUE.filter((_, k) => k % N === i));
  console.log(`VID batch first_city: ${QUEUE.length} clips, ${N} workers, slots u/${SLOTS.join(' u/')}${ONLY_SCENE ? ` (ONLY_SCENE=${ONLY_SCENE})` : ''}`);
  const res = await Promise.all(qs.map((q, i) => worker(i + 1, q)));
  console.log('SUMMARY: ' + res.map((r, i) => `V${i + 1}:${r.ok}ok/${r.fail}f`).join(' '));
})();
