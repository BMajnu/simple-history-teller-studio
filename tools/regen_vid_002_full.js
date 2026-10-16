// Phase 3: AI Video Clip Generation for simple_itihash_002_first_language
// Generates all 16 DYNAMIC_AI_VIDEO scenes via Google AI Studio Video (gemini-omni-1.1-flash)
// Uses 4 parallel workers across /u/1/ through /u/4/ accounts
// Each clip: 2D Sticky-Meme cartoon style, 24fps, 16:9
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');

fs.mkdirSync(VISUAL, { recursive: true });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const VIDEO_SCENES = project.scenes.filter(s => s.type === 'DYNAMIC_AI_VIDEO');

const NUM_WORKERS = 4;
const ACCOUNT_SLOTS = [1, 2, 3, 4];
const VIDEO_MODEL = 'gemini-omni-1.1-flash';

function post(body, ms = 300000) {
  const http = require('http');
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request(
      { host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw: raw.slice(0, 300) }); } });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('daemon timeout')));
    req.write(data); req.end();
  });
}

// Build video motion prompt from scene narration (English as reference)
function buildVideoPrompt(scene) {
  const narr = scene.narration.en;
  const action = narr.split('.')[0].trim().slice(0, 120); // first sentence
  return `Animate this 2D Sticky-Meme cartoon scene: ${action}. Thick black outlines, flat vibrant colors, OverSimplified 2D cartoon animation style, smooth character motion, 24fps, 16:9 widescreen.`;
}

async function generateClip(workerId, slot, scene) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);

  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) {
    return { skip: true };
  }

  const motionPrompt = buildVideoPrompt(scene);
  const escapedPrompt = JSON.stringify(motionPrompt);

  // Read reference image if it exists (from Phase 2 output — same shot number but .jpg)
  // If there's no static shot for this video scene, use style reference
  const refImgPath = path.join(VISUAL, `shot_${shotNum}.jpg`);
  const styleRefPath = path.join(ROOT, 'references', 'ref_style_1_sticky_meme.jpg');
  const refPath = fs.existsSync(refImgPath) ? refImgPath : styleRefPath;
  let refB64 = null;
  if (fs.existsSync(refPath)) {
    refB64 = fs.readFileSync(refPath).toString('base64');
  }

  const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = await ctx.newPage();
  try {
    await pg.goto('https://aistudio.google.com/u/${slot}/app/prompts/new_chat?model=${VIDEO_MODEL}', { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(5000);
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(800);

    ${refB64 ? `
    // Inject reference image via file input
    const refData = '${refB64}';
    const injected = await pg.evaluate(async (b64) => {
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
    ` : ''}

    // Fill prompt
    const ta = pg.locator('textarea, div[contenteditable="true"]').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill(${escapedPrompt});
    await pg.waitForTimeout(600);
    await pg.keyboard.press('Control+Enter');

    // Wait for video element to appear (up to 120s)
    let videoSrc = null;
    for (let i = 0; i < 40; i++) {
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

    // Download video blob
    const vidData = await pg.evaluate(async (src) => {
      try {
        const r = await fetch(src);
        const ab = await r.arrayBuffer();
        const by = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
        return { b64: btoa(bin), size: by.length };
      } catch(e) { return { err: e.message }; }
    }, videoSrc);

    if (!vidData || vidData.err) return { ok: false, err: vidData?.err || 'EXTRACT_FAIL' };
    return { ok: true, b64: vidData.b64, size: vidData.size };
  } finally {
    await pg.close().catch(() => {});
  }
})();
`;

  try {
    const r = await post({ code }, 300000);
    if (r.result && r.result.ok) {
      fs.writeFileSync(outPath, Buffer.from(r.result.b64, 'base64'));
      console.log(`[W${workerId}/u${slot}] ✓ Clip scene ${scene.scene_id} (${(r.result.size/1024/1024).toFixed(1)}MB)`);
      return { ok: true };
    } else {
      const err = (r.result && r.result.err) || r.raw || 'unknown';
      console.log(`[W${workerId}/u${slot}] ✗ Clip scene ${scene.scene_id}: ${err}`);
      return { ok: false, err };
    }
  } catch(e) {
    console.log(`[W${workerId}/u${slot}] ERR Clip ${scene.scene_id}: ${e.message.slice(0, 80)}`);
    return { ok: false, err: e.message };
  }
}

async function runWorker(workerId, queue) {
  const slot = ACCOUNT_SLOTS[(workerId - 1) % ACCOUNT_SLOTS.length];
  let ok = 0, skip = 0, fail = 0;

  while (queue.length > 0) {
    const scene = queue.shift();
    const result = await generateClip(workerId, slot, scene);

    if (result.skip) { skip++; continue; }
    if (result.ok) { ok++; }
    else {
      fail++;
      if (result.err === 'QUOTA') {
        queue.unshift(scene);
        console.log(`[W${workerId}] QUOTA hit — re-queuing scene ${scene.scene_id}`);
        break;
      }
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  return { workerId, ok, skip, fail };
}

(async () => {
  const todo = VIDEO_SCENES.filter(s => {
    const f = path.join(VISUAL, `clip_shot_${String(s.scene_id).padStart(4, '0')}.mp4`);
    return !fs.existsSync(f) || fs.statSync(f).size < 100000;
  });

  console.log(`\n=== Phase 3: AI Video Clip Generation ===`);
  console.log(`Total DYNAMIC scenes: ${VIDEO_SCENES.length}`);
  console.log(`Need to generate: ${todo.length} clips`);
  console.log(`Workers: ${NUM_WORKERS} parallel | Model: ${VIDEO_MODEL}\n`);

  if (todo.length === 0) {
    console.log('All video clips already exist. Nothing to do.');
    process.exit(0);
  }

  const queues = Array.from({ length: NUM_WORKERS }, (_, i) => todo.filter((_, k) => k % NUM_WORKERS === i));
  const results = await Promise.all(queues.map((q, i) => runWorker(i + 1, q)));

  const totalOk = results.reduce((a, r) => a + r.ok, 0);
  const totalFail = results.reduce((a, r) => a + r.fail, 0);
  const totalSkip = results.reduce((a, r) => a + r.skip, 0);

  console.log(`\n=== Phase 3 COMPLETE ===`);
  console.log(`Generated: ${totalOk} | Skipped: ${totalSkip} | Failed: ${totalFail}`);

  // Update project.json asset_file for each video scene to clip_shot_XXXX.mp4
  const clips = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/));
  console.log(`\nVideo clips in visual_assets: ${clips.length}/${VIDEO_SCENES.length}`);

  if (totalFail > 0) {
    console.log(`\n⚠️  ${totalFail} clips failed. Re-run this script to retry.`);
    process.exit(1);
  }
})();
