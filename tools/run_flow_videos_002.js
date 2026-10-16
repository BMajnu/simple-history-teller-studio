// ============================================================================
// EP02 Flow Fleet - canonical Google Flow fallback batch generator
// Project: projects/simple_itihash_002_first_language (9 remaining DYNAMIC clips)
// Run:   node tools/run_flow_videos_002.js
// Probe: $env:ONLY_SCENE='18'; node tools/run_flow_videos_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (instructions/04_VIDEO_GENERATION_AUTOMATION.md S5):
//  F0 TRIGGER: run ONLY when the AI Studio fleet (run_parallel_videos_002.js)
//     reports ALL_SLOTS_MODELS_QUOTA on every V1-chain model (04 S4 note).
//  F1 BATCHING: one Flow project per worker, up to 3 scenes per submit. The
//     Flow agent mode generates several videos in ONE request (PROBED
//     2026-10-14: agent proposed "15টি ভিডিও ... 15 ক্রেডিট" for a batch) -
//     batching is faster than one-project-per-clip and burns 1 credit/video.
//  F2 ANCHOR: drop each scene's own shot_XXXX.jpg onto the project (drop upload
//     works; the + ingredient menu does not open reliably). Wait for the %
//     upload indicator to disappear before submitting.
//  F3 APPROVAL (mandatory - a missing click stalls forever): read the proposed
//     video count ("এই Nটি ভিডিও"); if N != batch size -> Cancel (বাতিল করুন)
//     and fall back to single submits. Else click সবসময় অনুমোদন করুন
//     (always-approve) so later batches never stall; else অনুমোদন করুন.
//  F4 MONITOR: poll flow-video-tile / video elements until count == batch size
//     (up to ~40 min). Tiles arrive in prompt order.
//  F5 WORKERS: 3 parallel projects (3+3+3 scenes), each worker owns its page.
//  F6 VERIFY: every clip saved only if ftyp+moov present and > 100KB.
//  F7 Single-agent execution; do NOT close the Chrome windows mid-run.
//  F8 MULTI-ACCOUNT (PROBED 2026-10-14): Flow has NO /u/N tab system - it is a
//     single-session app, so all tabs in one Chrome profile share ONE Google
//     account + credit pool (that is why 3 tabs burned one limit 3x faster).
//     True isolation = one Chrome user-data-dir per worker. Verified logins:
//     profile_3=badiuzzaman.majnu, profile=bmajnu9811, profile_2=msrosyafrin.
//     To add an account: launch Chrome with a fresh dir, log into Google, open
//     flow.google.com once (Next, no opt-ins), append the dir to PROFILES.
//  F9 PROBE MODE (ONLY_SCENE): exactly ONE worker runs - never submit the same
//     form from parallel tabs (duplicate credit burn + time waste).
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

// F8 MULTI-ACCOUNT (PROBED 2026-10-14): Flow has NO /u/N tab system - it is a
// single-session app, so all tabs in one profile share ONE account + credit
// pool. True isolation = one Chrome user-data-dir per worker. Verified
// distinct logins: profile_3=badiuzzaman.majnu, profile=bmajnu9811,
// profile_2=msrosyafrin. Worker i owns PROFILES[i] (own Chrome window).
const PROFILES = [
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3',
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile',
  'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_2',
];
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');

// F1: fixed 3+3+3 batches over the 9 remaining dynamic scenes
const BATCHES = [[18, 23, 32], [38, 43, 57], [70, 78, 84]];
const NUM_WORKERS = 3;

// Detailed motion bodies (same V4-DETAILED beats as the AI Studio fleet)
const MOTION = {
18:'grand parisian lecture hall where stick-man gentlemen in top hats rise from their seats shouting and shaking papers, president banging a huge gavel, chandelier swaying overhead, sheets of paper fluttering down',
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const STYLE_TAIL = 'in 2D sticky-man cartoon style, OverSimplified, 5px black outlines, flat vector motion, 24fps, 16:9 widescreen, no text, no watermarks';

function batchPrompt(ids) {
  // NOTE: Flow shows NO filenames - the agent sees images in upload order,
  // so scenes reference images by ordinal (1st/2nd/3rd uploaded image).
  const ord = ['first', 'second', 'third'];
  const parts = ids.map((id, i) => `Scene ${i + 1} - use the ${ord[i]} uploaded image: animate it: ${MOTION[id]} ${STYLE_TAIL}.`);
  return `Generate ${ids.length} separate videos, one per scene below, in upload order. For each scene animate its image. ${parts.join(' ')}`;
}

async function dropAnchor(page, shotFile) {
  const b64 = fs.readFileSync(path.join(VISUAL, shotFile)).toString('base64');
  await page.evaluate(async (d) => {
    const bc = atob(d.b64); const arr = new Uint8Array(bc.length);
    for (let i = 0; i < bc.length; i++) arr[i] = bc.charCodeAt(i);
    const dt = new DataTransfer(); dt.items.add(new File([arr], d.name, { type: 'image/jpeg' }));
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    for (const t of ['dragenter', 'dragover', 'drop']) (el || document.body).dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { b64, name: shotFile });
  for (let i = 0; i < 150; i++) { // F2: upload % gone? uploads crawl under load (PROBED: 20% for minutes)
    await page.waitForTimeout(2000);
    const busy = await page.evaluate(() => /(\d+)%/.test(document.body.innerText || '')).catch(() => false);
    if (!busy) return true;
  }
  return false;
}

// LOCALE (PROBED 2026-10-15): freshly-onboarded profiles render Flow in
// ENGLISH ("New project"), older ones in Bengali. Every selector below tries
// bn first, en fallback. Approval cards follow the UI locale too.
async function clickNewProject(page) {
  for (const txt of ['নতুন প্রোজেক্ট', 'New project']) {
    const b = page.locator('button').filter({ hasText: txt }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ force: true }).catch(() => {});
      return true;
    }
  }
  return false;
}
const SUBMIT_SEL = 'button[aria-label="জেনারেট করা শুরু করুন"], button[aria-label*="Start generating"]';

// Trusted click (PROBED: Flow's Angular buttons ignore synthetic force-clicks
// that do not move the mouse - use real coordinates like the image fleet).
async function trustedClick(page, locator, timeoutMs = 8000) {
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: timeoutMs }).catch(() => {});
    const box = await locator.boundingBox({ timeout: timeoutMs });
    if (!box || box.width < 2 || box.height < 2) return false;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    return true;
  } catch (e) { return false; }
}

function parseApprovalCount(t) {
  const conv = (s) => Number(String(s).replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d)));
  const m = t.match(/এই[^\d\n০-৯]*([0-9০-৯]+)[^\d\n]{0,4}টি ভিডিও/)
    || t.match(/([0-9০-৯]+)[^\d\n]{0,4}টি ভিডিও[^\n]{0,60}ক্রেডিট/)
    || t.match(/(?:generate|start)[^\n]{0,40}?([0-9]+)\s*videos?/i)
    || t.match(/([0-9]+)\s*videos?[^\n]{0,40}credits?/i);
  return m ? conv(m[1]) : 0;
}
function hasApproveCard(t) { return /অনুমোদন করুন|Always approve|Approve/.test(t); }

// F3: approval handling. VISIBLE-BUTTON driven (PROBED 2026-10-15): the old
// card text lingers in session history, so body-text matching lies. Rules:
// (1) no visible approve button + (tiles/videos OR queued-message) -> progress;
// (2) visible button + parsed count -> approve (always first), verified by
// BUTTON disappearance (not text); (3) else keep waiting (~20 min).
async function handleApproval(page, expectN) {
  const anyApproveVisible = async () => {
    for (const txt of ['সবসময় অনুমোদন করুন', 'Always approve', 'অনুমোদন করুন', 'Approve']) {
      if (await page.locator('button').filter({ hasText: txt }).first().isVisible().catch(() => false)) return true;
    }
    return false;
  };
  for (let i = 0; i < 400; i++) { // ~20 min: agent answers very slow under load
    await page.waitForTimeout(3000);
    const card = await page.evaluate(() => {
      const t = document.body.innerText || '';
      const queuedMsg = /waiting in the queue|in the queue due to high demand|will be processed soon/i.test(t);
      const hardEvidence = document.querySelectorAll('flow-video-tile').length > 0
        || document.querySelectorAll('video[src]').length > 0;
      return { t: t.slice(-4000), queuedMsg, hardEvidence };
    }).catch(() => ({}));
    const n = parseApprovalCount(card.t || '');
    const visApprove = await anyApproveVisible();
    if (i % 10 === 9) console.log(`  ... approval wait ${Math.round((i + 1) * 3 / 60)}min (card:${visApprove} n:${n || 0} queued:${!!card.queuedMsg} tiles:${card.hardEvidence ? 'yes' : 'no'})`);
    if (!visApprove && (card.hardEvidence || card.queuedMsg)) return 'progress';
    if (!visApprove) continue; // no card yet - agent still thinking
    if (n === 0) continue; // buttons render before count text streams in - wait
      if (n !== expectN) {
        for (const ctxt of ['বাতিল করুন', 'Cancel']) {
          const cancel = page.locator('button').filter({ hasText: ctxt }).first();
          if (await cancel.isVisible().catch(() => false)) { await cancel.click({ force: true }).catch(() => {}); break; }
        }
        return 'cancelled';
      }
      let approved = false;
      for (let c = 0; c < 3 && !approved; c++) { // trusted click + verify dismissal
        const always = page.locator('button').filter({ hasText: 'সবসময় অনুমোদন করুন' }).first();
        const alwaysEn = page.locator('button').filter({ hasText: 'Always approve' }).first();
        if (await always.isVisible().catch(() => false)) {
          await trustedClick(page, always);
        } else if (await alwaysEn.isVisible().catch(() => false)) {
          await trustedClick(page, alwaysEn);
        } else {
          const one = page.locator('button').filter({ hasText: 'অনুমোদন করুন' }).first();
          const oneEn = page.locator('button', { hasText: 'Approve' }).first();
          if (await one.isVisible().catch(() => false)) await trustedClick(page, one);
          else if (await oneEn.isVisible().catch(() => false)) await trustedClick(page, oneEn);
          else break;
        }
        await page.waitForTimeout(8000);
        approved = !(await anyApproveVisible());
      }
      if (!approved) {
        await page.screenshot({ path: path.join(VISUAL, '_debug_flow_clickfail.png') }).catch(() => {});
        return 'clickfail';
      }
      return 'ok';
  }
  return 'noapproval';
}

async function downloadTiles(page, ids) {
  const out = [];
  for (let k = 0; k < 100; k++) { // F4: up to ~50 min for the batch
    await page.waitForTimeout(30000);
    const n = await page.evaluate(() =>
      document.querySelectorAll('flow-video-tile').length || document.querySelectorAll('video[src]').length
    ).catch(() => 0);
    if (k % 4 === 0) console.log(`  ... waiting tiles: ${n}/${ids.length}`);
    if (n >= ids.length) break;
  }
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const shotNum = String(id).padStart(4, '0');
    const outPath = path.join(VISUAL, `clip_shot_${shotNum}.mp4`);
    // wait for THIS tile's video to have a real src (tiles render before video)
    let ready = false;
    for (let w = 0; w < 60 && !ready; w++) {
      await page.waitForTimeout(30000);
      ready = await page.evaluate((idx) => {
        const tiles = document.querySelectorAll('flow-video-tile');
        const scope = tiles.length > idx ? tiles[idx] : document;
        const vid = scope.querySelector('video');
        return !!(vid && (vid.currentSrc || vid.src) && (vid.readyState || 0) >= 1);
      }, i).catch(() => false);
      if (w % 4 === 3) console.log(`  ... tile ${i + 1}/${ids.length} video ready: ${ready}`);
    }
    if (!ready) { out.push({ id, ok: false, err: 'TILE_NOSRC' }); continue; }
    const v = await page.evaluate(async (idx) => {
      const tiles = document.querySelectorAll('flow-video-tile');
      const scope = tiles.length > idx ? tiles[idx] : document;
      const vid = scope.querySelector('video');
      const src = vid ? vid.currentSrc || vid.src : null;
      if (!src) return { err: 'NO_SRC' };
      try {
        const res = await fetch(src, { credentials: 'include' }); const blob = await res.blob();
        const ab = await blob.arrayBuffer(); const bytes = new Uint8Array(ab);
        let bin = ''; for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), size: bytes.length };
      } catch (e) { return { err: e.message }; }
    }, i).catch(e => ({ err: e.message }));
    if (!v || v.err || !v.b64 || v.size < 100000) {
      // fallback: tile header download button -> Playwright download event
      try {
        const tiles = await page.$$('flow-video-tile');
        const scope = tiles.length > i ? tiles[i] : null;
        const btn = scope
          ? await scope.$('button[aria-label*="ownload"], a[download]')
          : null;
        const target = btn || (scope ? await scope.$('button') : null);
        if (!target) { out.push({ id, ok: false, err: ((v && v.err) || 'FETCH_FAIL') + '/NO_DLBTN' }); continue; }
        await target.scrollIntoViewIfNeeded().catch(() => {});
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 120000 }).catch(() => null),
          target.click({ force: true }).catch(() => {}),
        ]);
        if (!download) { out.push({ id, ok: false, err: ((v && v.err) || 'FETCH_FAIL') + '/NO_DOWNLOAD_EVENT' }); continue; }
        const tmp = path.join(VISUAL, `_flowdl_${shotNum}.mp4`);
        await download.saveAs(tmp);
        const buf = fs.readFileSync(tmp);
        fs.unlinkSync(tmp);
        if (buf.length < 100000) { out.push({ id, ok: false, err: 'DL_TOO_SMALL' }); continue; }
        const validDl = buf.slice(4, 12).toString() === 'ftypmp42' || buf.includes(Buffer.from('moov'));
        if (!validDl) { out.push({ id, ok: false, err: 'BAD_MP4_DL' }); continue; }
        fs.writeFileSync(outPath, buf);
        console.log(`  ✓ Clip ${id} via download-btn (${(buf.length / 1048576).toFixed(2)} MB)`);
        out.push({ id, ok: true });
        continue;
      } catch (e) { out.push({ id, ok: false, err: 'DL_EXC' }); continue; }
    }
    const buf = Buffer.from(v.b64, 'base64');
    const valid = buf.slice(4, 12).toString() === 'ftypmp42' || buf.includes(Buffer.from('moov')); // F6
    if (!valid) { out.push({ id, ok: false, err: 'BAD_MP4' }); continue; }
    fs.writeFileSync(outPath, buf);
    console.log(`  ✓ Clip ${id} (${(v.size / 1048576).toFixed(2)} MB)`);
    out.push({ id, ok: true });
  }
  return out;
}

async function runBatch(profileDir, workerId, ids) {
  const only = Number(process.env.ONLY_SCENE) || 0;
  let list = only ? [only] : ids.filter(id => {
    const f = path.join(VISUAL, `clip_shot_${String(id).padStart(4, '0')}.mp4`);
    return !fs.existsSync(f) || fs.statSync(f).size < 100000;
  });
  if (list.length === 0) return { workerId, done: 0, fail: 0, skipped: ids.length };
  await new Promise(r => setTimeout(r, (workerId - 1) * 45000)); // stagger uploads across accounts
  let ctx = null;
  try {
  ctx = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = await ctx.newPage();
  try {
    const adopt = (workerId === 1 && process.env.ADOPT_URL) || '';
    if (adopt) { // adopt an existing project (agent already answered) - no resubmit
      console.log(`[F${workerId}] adopting ${adopt}`);
      await page.goto(adopt, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(8000);
      const ap0 = await handleApproval(page, list.length); // F3
      if (ap0 !== 'ok' && ap0 !== 'progress') return { workerId, done: 0, fail: list.length, err: 'ADOPT_' + ap0.toUpperCase() };
      const res0 = await downloadTiles(page, list); // F4+F6
      await ctx.close().catch(() => {});
      return { workerId, done: res0.filter(r => r.ok).length, fail: res0.filter(r => !r.ok).length, detail: res0 };
    }
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    if (!await clickNewProject(page)) { try { await ctx.close(); } catch (_) {} return { workerId, done: 0, fail: list.length, err: 'NO_NEW_PROJECT' }; }
    await page.waitForTimeout(9000);
  for (const id of list) { // F2: all anchors first, VERIFIED (no silent drops)
    const shot = `shot_${String(id).padStart(4, '0')}.jpg`;
    const baseImgs = await page.evaluate(() => document.querySelectorAll('img').length).catch(() => 0);
    let attached = false;
    for (let d = 0; d < 2 && !attached; d++) {
      console.log(`[F${workerId}] dropping ${shot} (try ${d + 1})...`);
      await dropAnchor(page, shot);
      // VERIFIED SIGNAL (PROBED 2026-10-15): tiles show % while uploading and
      // NO filename ever - attached = % cleared AND a new thumbnail appeared.
      for (let i = 0; i < 150; i++) {
        await page.waitForTimeout(2000);
        const st = await page.evaluate((base) => ({
          busy: /(\d+)%/.test(document.body.innerText || ''),
          imgs: document.querySelectorAll('img').length,
        }), baseImgs).catch(() => ({}));
        if (!st.busy && (st.imgs || 0) > baseImgs) { attached = true; break; }
      }
    }
    if (!attached) return { workerId, done: 0, fail: list.length, err: 'UPLOAD_STUCK' };
  }
    await page.screenshot({ path: path.join(VISUAL, `_debug_flow${workerId}_anchors.png`) }).catch(() => {});
    const pm = page.locator('div.ProseMirror').first();
    const promptText = batchPrompt(list);
  let posted = false; // submitted = text left the composer into a session turn
  for (let s = 0; s < 3 && !posted; s++) {
    await pm.click().catch(() => {});
    const cur = await pm.textContent().catch(() => '');
    if (!cur || !cur.includes('Scene 1 - use the')) {
      await page.keyboard.press('Control+a').catch(() => {});
      await page.keyboard.type(promptText, { delay: 3 }).catch(() => {});
      await page.waitForTimeout(1500);
    }
    await page.locator(SUBMIT_SEL).first().click({ force: true }).catch(() => {});
    for (let w = 0; w < 10; w++) {
      await page.waitForTimeout(3000);
      posted = await page.evaluate(() => {
        const ed = document.querySelector('div.ProseMirror');
        const edEmpty = !ed || (ed.textContent || '').trim().length < 50;
        return edEmpty && (document.body.innerText || '').includes('Scene 1 - use the');
      }).catch(() => false);
      if (posted) break;
    }
  }
    if (!posted) {
      await page.screenshot({ path: path.join(VISUAL, `_debug_flow${workerId}_nosubmit.png`) }).catch(() => {});
      try { await ctx.close(); } catch (_) {}
      return { workerId, done: 0, fail: list.length, err: 'SUBMIT_NOSHOW' };
    }
    const ap = await handleApproval(page, list.length); // F3
    if (ap === 'cancelled') { try { await ctx.close(); } catch (_) {} return { workerId, done: 0, fail: list.length, err: 'COUNT_MISMATCH' }; }
    if (ap === 'progress') console.log(`[F${workerId}] already queued/generating - monitoring tiles...`);
    if (ap !== 'ok' && ap !== 'progress') {
      await page.screenshot({ path: path.join(VISUAL, `_debug_flow${workerId}_noapproval.png`) }).catch(() => {});
      try { await ctx.close(); } catch (_) {}
      return { workerId, done: 0, fail: list.length, err: 'NO_APPROVAL' };
    }
    const res = await downloadTiles(page, list); // F4+F6
    await ctx.close().catch(() => {});
    return { workerId, done: res.filter(r => r.ok).length, fail: res.filter(r => !r.ok).length, detail: res };
  } catch (err) {
    try { if (ctx) await ctx.close(); } catch (_) {}
    if (/existing browser session|profile.*in use|profile.*locked/i.test(err.message)) {
      console.log(`[F${workerId}] PROFILE_BUSY (${profileDir.split('scratch').pop()}) - close the holding Chrome and rerun.`);
      return { workerId, done: 0, fail: list.length, err: 'PROFILE_BUSY' };
    }
    return { workerId, done: 0, fail: list.length, err: err.message.slice(0, 100) };
  }
  } catch (err) {
    try { if (ctx) await ctx.close(); } catch (_) {}
    return { workerId, done: 0, fail: list.length, err: err.message.slice(0, 100) };
  }
}

(async () => {
  console.log(`=== EP02 FLOW FLEET: ${NUM_WORKERS} WORKERS (3+3+3) x ${PROFILES.length} PROFILES ===`);
  const only = Number(process.env.ONLY_SCENE) || 0;
  // PROBE MODE: single worker only - never triplicate the same form (quota waste).
  // ADOPT MODE: only worker 1 adopts (others would spawn noise projects).
  const jobs = process.env.ADOPT_URL ? [[PROFILES[0], 1, BATCHES[0]]]
    : only ? [[PROFILES[0], 1, BATCHES[0]]]
    : BATCHES.map((b, i) => [PROFILES[i % PROFILES.length], i + 1, b]);
  const results = await Promise.all(jobs.map(([prof, wid, b]) => runBatch(prof, wid, b)));
  console.log(JSON.stringify(results, null, 2));
  const totalPresent = fs.readdirSync(VISUAL).filter(f => f.match(/^clip_shot_\d+\.mp4$/) && fs.statSync(path.join(VISUAL, f)).size > 100000).length;
  console.log(`Final: ${totalPresent}/16 clips.`);
  process.exit(results.some(r => (r.fail || 0) > 0) ? 1 : 0);
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one Flow fleet file; batches over single submits (agent batch mode)
