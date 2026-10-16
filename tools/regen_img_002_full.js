// Phase 2: Full image regeneration for simple_itihash_002_first_language
// Generates all 68 STATIC_IMAGE shots with PRESET_STICKY_MEME style.
// Uses 5 parallel workers across AI Studio accounts /u/1/ through /u/6/.
// TIME_CHRONICLER scenes get ref_host_sticky_meme.jpg attached as reference image.
// Model: gemini-3.1-flash-image (Nano Banana 2), fallback gemini-3.1-flash-lite-image
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');
const REF_STICKY = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');
const REF_STYLE  = path.join(ROOT, 'references', 'ref_style_1_sticky_meme.jpg');

fs.mkdirSync(VISUAL, { recursive: true });

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));

// Only static image scenes
const STATIC_SCENES = project.scenes.filter(s => s.type === 'STATIC_IMAGE');

// Style anchor prefix (mandatory for every prompt)
const STYLE_PREFIX = 'Sticky-Meme cutout vector cartoon, thick outlines, flat warm colors, ';
const NEGATIVE = ' --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions';

// Host/chronicler speakers — need reference image attached
const HOST_SPEAKERS = new Set(['TIME_CHRONICLER']);

// Account slots rotation: use accounts /u/1/ to /u/5/ for workers
const ACCOUNT_SLOTS = [1, 2, 3, 4, 5];

// Divide scenes across workers
const NUM_WORKERS = 5;

function sanitizePrompt(raw) {
  return raw
    .replace(/^(Simple\s+Itihash\s+)?(Scene|Shot|Part)\s*\d+[:\-.]*/i, '')
    .replace(/\[.*?\]/g, '')
    .trim();
}

function post(body, ms = 120000) {
  const http = require('http');
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request(
      { host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({ raw: raw.slice(0, 200) }); } });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('daemon timeout')));
    req.write(data); req.end();
  });
}

async function generateShot(workerId, slot, scene) {
  const shotNum = String(scene.scene_id).padStart(4, '0');
  const outPath = path.join(VISUAL, `shot_${shotNum}.jpg`);

  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 50000) {
    return { skip: true };
  }

  const isHost = HOST_SPEAKERS.has(scene.dialogue_speaker);
  const rawPrompt = sanitizePrompt(scene.visual_prompt);
  const fullPrompt = STYLE_PREFIX + rawPrompt + NEGATIVE;

  // Read reference image as base64 if host scene
  let refB64 = null;
  let refMime = 'image/jpeg';
  if (isHost && fs.existsSync(REF_STICKY)) {
    refB64 = fs.readFileSync(REF_STICKY).toString('base64');
  }

  const escapedPrompt = JSON.stringify(fullPrompt);
  const escapedOut = JSON.stringify(outPath.replace(/\\/g, '\\\\'));

  const code = `
return (async () => {
  const ctx = browser.contexts()[0];
  const pg = await ctx.newPage();
  try {
    const model = 'gemini-3.1-flash-image';
    await pg.goto('https://aistudio.google.com/u/${slot}/prompts/new_chat?model=' + model, { waitUntil: 'domcontentloaded' });
    await pg.waitForTimeout(4000);
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(500);

    // Set aspect ratio to 16:9
    const arSelectors = ['button[aria-label*="Aspect"], button[aria-label*="aspect"], mat-select[aria-label*="Aspect"]'];
    for (const sel of arSelectors) {
      const btn = pg.locator(sel).first();
      if (await btn.count() > 0) {
        await btn.click().catch(() => {});
        await pg.waitForTimeout(500);
        const opt = pg.locator('mat-option, [role="option"]').filter({ hasText: '16:9' }).first();
        if (await opt.count() > 0) await opt.click().catch(() => {});
        await pg.waitForTimeout(400);
        break;
      }
    }

    ${refB64 ? `
    // Attach reference image for host consistency
    const refData = '${refB64}';
    const refMime = '${refMime}';
    await pg.evaluate(async (b64, mime) => {
      const byteChars = atob(b64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: mime });
      const file = new File([blob], 'ref_host.jpg', { type: mime });
      const dt = new DataTransfer();
      dt.items.add(file);
      const inputs = document.querySelectorAll('input[type="file"]');
      if (inputs[0]) inputs[0].files = dt.files;
    }, refData, refMime).catch(() => {});
    await pg.waitForTimeout(1000);
    ` : ''}

    // Snapshot existing images before generation
    const prevImgs = await pg.evaluate(() =>
      Array.from(document.querySelectorAll('img')).filter(e => e.naturalWidth >= 400).map(e => e.src)
    );

    // Fill prompt
    const ta = pg.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill(${escapedPrompt});
    await pg.waitForTimeout(600);
    await pg.keyboard.press('Control+Enter');

    // Poll for new image (up to 90s)
    let found = null;
    for (let i = 0; i < 30; i++) {
      await pg.waitForTimeout(3000);
      // Check quota
      const quota = await pg.evaluate(() =>
        /exceeded quota|Upgrade to unlock|try again later/i.test(document.body.innerText || '')
      ).catch(() => false);
      if (quota) return { ok: false, err: 'QUOTA' };

      const cur = await pg.evaluate(() =>
        Array.from(document.querySelectorAll('img')).filter(e => e.naturalWidth >= 400).map(e => e.src)
      ).catch(() => []);
      const fresh = cur.filter(s => !prevImgs.includes(s));
      if (fresh.length > 0) { found = fresh[fresh.length - 1]; break; }
    }

    if (!found) return { ok: false, err: 'TIMEOUT_NO_IMAGE' };

    // Extract image as base64
    const imgData = await pg.evaluate(async (src) => {
      try {
        const r = await fetch(src);
        const bl = await r.blob();
        const ab = await bl.arrayBuffer();
        const by = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < by.length; k++) bin += String.fromCharCode(by[k]);
        return { b64: btoa(bin), size: by.length, mime: bl.type };
      } catch(e) { return { err: e.message }; }
    }, found);

    if (!imgData || imgData.err) return { ok: false, err: imgData?.err || 'EXTRACT_FAIL' };
    return { ok: true, b64: imgData.b64, size: imgData.size };
  } finally {
    await pg.close().catch(() => {});
  }
})();
`;

  try {
    const r = await post({ code }, 180000);
    if (r.result && r.result.ok) {
      fs.writeFileSync(outPath, Buffer.from(r.result.b64, 'base64'));
      const sizekb = (r.result.size / 1024).toFixed(0);
      console.log(`[W${workerId}/u${slot}] ✓ Shot ${scene.scene_id} (${sizekb}KB)${isHost ? ' [HOST]' : ''}`);
      return { ok: true };
    } else {
      const err = (r.result && r.result.err) || r.raw || 'unknown';
      console.log(`[W${workerId}/u${slot}] ✗ Shot ${scene.scene_id}: ${err}`);
      return { ok: false, err };
    }
  } catch(e) {
    console.log(`[W${workerId}/u${slot}] ERR Shot ${scene.scene_id}: ${e.message.slice(0, 80)}`);
    return { ok: false, err: e.message };
  }
}

async function runWorker(workerId, queue) {
  const slot = ACCOUNT_SLOTS[(workerId - 1) % ACCOUNT_SLOTS.length];
  let ok = 0, skip = 0, fail = 0;

  while (queue.length > 0) {
    const scene = queue.shift();
    const result = await generateShot(workerId, slot, scene);

    if (result.skip) { skip++; continue; }
    if (result.ok) { ok++; }
    else {
      fail++;
      // On QUOTA, switch to next slot and re-queue
      if (result.err === 'QUOTA') {
        const newSlot = (slot % 6) + 1;
        console.log(`[W${workerId}] QUOTA on /u/${slot}/ → switching to /u/${newSlot}/ and re-queuing shot ${scene.scene_id}`);
        queue.unshift(scene); // re-queue
        await new Promise(r => setTimeout(r, 3000));
        break;
      }
    }

    // Rate limit buffer
    await new Promise(r => setTimeout(r, 1500));
  }

  return { workerId, ok, skip, fail };
}

(async () => {
  // Check what's missing
  const todo = STATIC_SCENES.filter(s => {
    const f = path.join(VISUAL, `shot_${String(s.scene_id).padStart(4, '0')}.jpg`);
    return !fs.existsSync(f) || fs.statSync(f).size < 50000;
  });

  console.log(`\n=== Phase 2: Image Generation ===`);
  console.log(`Total STATIC scenes: ${STATIC_SCENES.length}`);
  console.log(`Need to generate: ${todo.length} shots`);
  console.log(`Workers: ${NUM_WORKERS} parallel | Accounts: /u/1/ through /u/5/\n`);

  if (todo.length === 0) {
    console.log('All images already exist. Nothing to do.');
    process.exit(0);
  }

  // Distribute across workers
  const queues = Array.from({ length: NUM_WORKERS }, (_, i) => todo.filter((_, k) => k % NUM_WORKERS === i));

  const results = await Promise.all(queues.map((q, i) => runWorker(i + 1, q)));
  const totalOk = results.reduce((a, r) => a + r.ok, 0);
  const totalFail = results.reduce((a, r) => a + r.fail, 0);
  const totalSkip = results.reduce((a, r) => a + r.skip, 0);

  console.log(`\n=== Phase 2 COMPLETE ===`);
  console.log(`Generated: ${totalOk} | Skipped: ${totalSkip} | Failed: ${totalFail}`);

  // Final count check
  const existing = fs.readdirSync(VISUAL).filter(f => f.match(/^shot_\d+\.jpg$/) && fs.statSync(path.join(VISUAL, f)).size > 50000);
  console.log(`Visual assets now: ${existing.length}/${STATIC_SCENES.length}`);

  if (totalFail > 0) {
    console.log(`\n⚠️  ${totalFail} shots failed. Re-run this script to retry.`);
    process.exit(1);
  }
})();
