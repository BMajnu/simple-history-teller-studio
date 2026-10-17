// Regenerate episode-003 scene-1 AI clip: image-to-video from shot_0001.jpg so the
// clip matches the film's flat-vector / warm-parchment style (old clip was an egg-head mascot).
// Run: node tools/regen_clip_003_scene1.js   (daemon :9333 + Chrome CDP :9224 must be up)
//      PROMPT="..." node tools/regen_clip_003_scene1.js to override the motion prompt
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_003_nalanda');
const VISUAL = path.join(PROJ, 'visual_assets');
const OUT = path.join(VISUAL, 'clip_shot_0001.mp4');
const REF = path.join(VISUAL, 'shot_0001.jpg');
const MODEL_URL = 'https://aistudio.google.com/app/prompts/new_chat?model=gemini-omni-1.1-flash';

const PROMPT = process.env.PROMPT || [
  'Animate this historical illustration: the elderly scholar with long white beard, round glasses and star-patterned robe',
  'emerges gently from the swirling cosmic clock vortex with a welcoming open-arm gesture,',
  'his beard and robe drifting, stars and gears slowly rotating in the spiral, soft cinematic push-in,',
  '2D cutout vector cartoon, clean flat shapes, warm parchment tones, smooth 24fps motion, 16:9, no text',
].join(' ');

async function call(code) {
  const r = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  return r.json();
}

const refB64 = fs.readFileSync(REF).toString('base64');
const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = await ctx.newPage();
  try {
    await pg.goto(${JSON.stringify(MODEL_URL)}, { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(5000);
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(800);

    const refData = '${refB64}';
    await pg.evaluate(async (b64) => {
      const byteChars = atob(b64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: 'image/jpeg' });
      const file = new File([blob], 'scene_ref.jpg', { type: 'image/jpeg' });
      const dt = new DataTransfer();
      dt.items.add(file);
      const inputs = document.querySelectorAll('input[type="file"]');
      if (inputs[0]) { inputs[0].files = dt.files; return true; }
      return false;
    }, refData).catch(() => false);
    await pg.waitForTimeout(1500);

    const ta = pg.locator('textarea, div[contenteditable="true"]').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill(${JSON.stringify(PROMPT)});
    await pg.waitForTimeout(600);
    await pg.keyboard.press('Control+Enter');

    let videoSrc = null;
    for (let i = 0; i < 60; i++) {
      await pg.waitForTimeout(3000);
      const quota = await pg.evaluate(() =>
        /exceeded quota|Upgrade to unlock|try again later/i.test(document.body.innerText || '')
      ).catch(() => false);
      if (quota) return { ok: false, err: 'QUOTA' };
      videoSrc = await pg.evaluate(() => {
        const v = document.querySelector('video');
        return v && v.src && v.src.startsWith('blob:') ? v.src : null;
      }).catch(() => null);
      if (videoSrc) break;
    }
    if (!videoSrc) return { ok: false, err: 'TIMEOUT_NO_VIDEO' };

    const vidData = await pg.evaluate(async (src) => {
      try {
        const r = await fetch(src);
        const ab = await r.arrayBuffer();
        const by = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
        return { b64: btoa(bin), size: by.length };
      } catch (e) { return { err: e.message }; }
    }, videoSrc);
    if (!vidData || vidData.err) return { ok: false, err: (vidData && vidData.err) || 'EXTRACT_FAIL' };
    return { ok: true, b64: vidData.b64, size: vidData.size };
  } finally { await pg.close().catch(() => {}); }
})();
`;

(async () => {
  console.log('MOTION PROMPT: ' + PROMPT.slice(0, 160));
  const r = await call(code);
  if (r.result && r.result.ok) {
    const buf = Buffer.from(r.result.b64, 'base64');
    if (buf.length < 200000) { console.error('REJECT: too small (' + buf.length + 'B)'); process.exit(2); }
    fs.writeFileSync(OUT, buf);
    console.log('SAVED ' + OUT + ' (' + buf.length + ' bytes)');
  } else {
    console.error('FAIL: ' + ((r.result && r.result.err) || r.error || r.raw || JSON.stringify(r).slice(0, 300)));
    process.exit(1);
  }
})();
