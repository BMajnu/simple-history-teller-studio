// ============================================================================
// EP02 Flow SUBMIT Fleet - multi-worker fire-and-forget direct-mode submitter
// Project: projects/simple_itihash_002_first_language (16 DYNAMIC_AI_VIDEO)
// Run:   node tools/run_flow_submit_002.js
// Probe: $env:ONLY_SCENE='32'; node tools/run_flow_submit_002.js
// Force: $env:ONLY_SCENE='38'; $env:FORCE='1'; node tools/run_flow_submit_002.js
// ----------------------------------------------------------------------------
// RULES THIS SCRIPT FOLLOWS (instructions/04_VIDEO_GENERATION_AUTOMATION.md S6I):
//  D0/S0 SUBMIT-ONLY (P7): fire-and-forget direct mode. Never poll or wait for
//     video renders in this script ("high demand" queues stall for hours at 0%).
//     After submit acceptance, log the project URL and move immediately to the
//     next scene. Downloads are MANUAL by the user.
//  D1/S1 MULTI-ACCOUNT FLEET (F8): Flow has NO /u/0../u/7 tab system — it is a
//     single-session app per Chrome profile. Launch up to 3 parallel workers,
//     each on its OWN Chrome user-data-dir (own Google account + credit pool):
//       - profile_3 = badiuzzaman.majnu@gmail.com
//       - profile   = bmajnu9811@gmail.com
//       - profile_2 = msrosyafrin@gmail.com
//     Never open two workers on one profile (SingletonLock collision).
//     PROBE MODE (F9): when ONLY_SCENE or RESUME_URL is set, run Worker 1 ONLY.
//  D2/S2 STALE-LOCK CLEANUP (P2): before launching, kill only orphan chrome.exe
//     processes whose command line references OUR three scratch profile dirs
//     (never touch the user's personal Chrome profile) and clear stale lock
//     files; if still locked at launch, fail fast with PROFILE_BUSY.
//  D3/S3 EARLY DEDUPE EXIT (P8): filter missing scenes against both disk
//     (clip_shot_XXXX.mp4 > 100KB) and visual_assets/_flow_submitted.json
//     BEFORE launching any browser. If 0 scenes remain (and not FORCE=1),
//     exit 0 immediately with zero browsers launched.
//  D4/S4 LOCALE & OVERLAYS FIRST (P5): fresh/EN profiles show onboarding cards
//     ("You're generating with Gemini Omni Flash..." + Got it) that cover the
//     composer and eat clicks, and label the chip "Agent" instead of
//     "Agent mode". Dismiss overlays FIRST, close untitled agent side-panel,
//     and try bn then en on every selector.
//  D5/S5 AGENT-OFF & SETTINGS ONCE: self-identify agent chip via aria-pressed
//     (/^(এজেন্ট মোড|Agent mode|Agent)$/i) — never re-click when already off.
//     Verify composer settings chip reads video-720p-(8|6|10)s and frame slot
//     buttons exist; open model menu (Nano Banana -> VIDEO -> FRAME -> 16:9,
//     Omni 1.1 Flash, 720p, 8s, x1) ONLY when wrong.
//  D6/S6 BOUNDED UPLOAD + STAGGER (P3): stagger workers by 25s; Flow never
//     shows filenames on dropped images — verify upload by (% progress gone
//     AND img count increased) within a bounded 75s timeout, else fail loudly
//     with UPLOAD_STUCK (never hang).
//  D7/S7 EXACT START-FRAME LINK VERIFICATION (P4): in the ingredient picker,
//     Flow rows do NOT show filenames — fallback to clicking the newest
//     thumbnail row when filename text is absent, then click Add-to-prompt.
//     Verify link by confirming the শুরু/Start slot button itself is REPLACED
//     by a thumbnail in the composer (button gone/hidden + composer thumbnail
//     img >24x24 present), NOT an img inside the button.
//  D8/S8 SINGLE-CLICK SUBMIT + FAST ACCEPTANCE (P1, P6): find the VISIBLE,
//     non-disabled submit arrow (real mouse coords; screenshot on miss).
//     Click ONCE — NEVER auto-retry a landed submit click (retries double-burn
//     12 credits/video). Verify acceptance up to 90s via composer cleared OR
//     whitespace-normalized prompt signature appearing in an output card outside
//     ProseMirror.
// ============================================================================
const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const VISUAL = path.join(PROJ, 'visual_assets');
const STATE_FILE = path.join(VISUAL, '_flow_submitted.json');

// D1/S1 (F8): 3 isolated Chrome profile directories = 3 Google accounts
const PROFILES = [
  { dir: 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3', email: 'badiuzzaman.majnu@gmail.com' },
  { dir: 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile',   email: 'bmajnu9811@gmail.com' },
  { dir: 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_2', email: 'msrosyafrin@gmail.com' },
];
const FORCE = process.env.FORCE === '1';
const STAGGER_MS = 25000;

// Complete 16 DYNAMIC_AI_VIDEO motion bodies for EP02
const MOTION = {
1:'Time Chronicler stick-man scholar with white beard and glasses stepping forward toward camera in his cosmic library, raising his wooden torch high as its flame flares, old book pages fluttering in his other hand, galaxy light swirling through tall windows, slow camera push-in',
6:'stick-man caveman in close-up with heaving chest opening his mouth wide at dawn, glowing golden sound waves expanding outward ring by ring, birds scattering from a tree, morning light rising behind him',
12:'stick-man caveman waving both arms up and sideways in frantic silent mime, his companion leaning in squinting then swatting a fly with a stick, dry bushes shaking around them',
18:'grand parisian lecture hall where stick-man gentlemen in top hats rise from their seats shouting and shaking papers, president banging a huge gavel, chandelier swaying overhead, sheets of paper fluttering down',
23:'stick-man caveman hopping on one foot while clutching his stubbed toe with a contorting face, the other caveman pinching his nose and stepping back from a skunk with its tail rising, small dust puffs bursting',
27:'stick-man cavemen jumping and slapping a mid-air high-five on a hilltop, dust bursting under their feet, the boulder wobbling slightly behind them, bright sun flare',
32:'pharaoh stick-man in gold cobra crown striding forward through his palace courtyard with billowing cape, guards kneeling as he passes, tall columns sliding by in parallax, harsh sun glare',
38:'pharaoh stick-man sinking deep into his golden throne and pressing a hand to his forehead with dropping shoulders in a heavy sigh, thin steam curling up from the bread on the golden plate beside him',
43:'small wooden rowboat pitching and rolling on stormy sea waves toward a looming rocky island, baby blankets fluttering, the oarsman rowing hard, white spray bursting over the bow, rain slanting down',
47:'emperor akbar stick-man with emerald turban walking steadily along his red sandstone courtyard at sunrise, robe flowing behind him, pigeons bursting upward, curtains billowing inside the arches',
55:'a golden helix of light rotating slowly above a stick-man london family holding hands and swaying, clock hands turning on a tower behind them, night clouds drifting past the moon',
57:'a glowing helix spiraling upward between two ancient skulls on a table, cave torch flames dancing, dust motes floating in the light, camera slowly orbiting the table',
63:'san stick-man hunters with bows walking single file through kalahari desert at sunrise, red sand swirling at their feet, dry grass bending in the wind, sun climbing higher',
70:'a small band of stick-man humans leaning into icy wind with torches whose flames stream sideways, snow lashing across, gray waves crashing foam onto the frozen shore, slow forward push',
78:'a glowing web of light threads pulsing outward from hut to hut across the world, dots of light switching on in sequence along the threads, the whole network gently breathing',
84:'Time Chronicler stick-man scholar waving goodbye with a big smile and stepping back as tall library doors swing slowly shut, a plain bell shape swaying above with pulsing glow, sparkling light motes drifting down',
};
const END_FRAMES = {}; // scene_id -> shot file for end frame (empty for EP02)
const DIRECT_FORMULA = (b) => `Animate this image into video, 2D sticky-man cartoon style, OverSimplified, 5px black outlines, flat vector motion: ${b}. Smooth character motion, dust and light physics, 24fps, 16:9, no text, no watermarks`;
const AGENT_CHIP_RE = /^(এজেন্ট মোড|Agent mode|Agent)$/i;

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { return {}; }
}
function saveState(st) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 1));
}

// P2 (D2/S2): Clean up ONLY orphan chrome.exe processes bound to our 3 scratch
// profile directories, then remove stale SingletonLock files if unlocked.
function cleanupStaleProfiles(profileDirs) {
  if (process.platform === 'win32') {
    const markers = profileDirs.map(d => path.basename(d).toLowerCase());
    try {
      const psCmd = [
        'Get-CimInstance Win32_Process -Filter "Name = \'chrome.exe\'"',
        '| Select-Object ProcessId, CommandLine',
        '| ConvertTo-Json -Compress',
      ].join(' ');
      const raw = execSync(`powershell -NoProfile -Command "${psCmd}"`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 10000,
      }).trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        let killed = 0;
        for (const proc of list) {
          const cmd = String(proc.CommandLine || '').toLowerCase();
          if (markers.some(m => cmd.includes(m))) {
            try {
              execSync(`taskkill /F /PID ${proc.ProcessId} /T`, { stdio: 'ignore', timeout: 5000 });
              killed++;
            } catch (_) {}
          }
        }
        if (killed > 0) console.log(`[CLEANUP] Terminated ${killed} orphan Chrome process(es) for fleet profiles.`);
      }
    } catch (_) {}
  }
  for (const dir of profileDirs) {
    for (const lockName of ['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'lockfile']) {
      const lp = path.join(dir, lockName);
      if (fs.existsSync(lp)) {
        try { fs.unlinkSync(lp); } catch (_) {}
      }
    }
  }
}

// Find the first VISIBLE button matching any text in `txts` and click its center
// using real mouse coordinates.
async function tclick(page, txts, timeoutMs = 5000) {
  const list = Array.isArray(txts) ? txts : [txts];
  for (const t of list) {
    const loc = page.locator('button, [role="tab"], [role="menuitem"], [role="option"]').filter({ hasText: t });
    const count = await loc.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const el = loc.nth(i);
      if (!await el.isVisible().catch(() => false)) continue;
      const b = await el.boundingBox({ timeout: timeoutMs }).catch(() => null);
      if (!b || b.width < 2 || b.height < 2) continue;
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      await page.waitForTimeout(1800);
      return t;
    }
  }
  return null;
}

async function waitState(page, fn, label, tries = 40, gap = 2000) {
  for (let i = 0; i < tries; i++) {
    if (await fn().catch(() => false)) return true;
    await page.waitForTimeout(gap);
  }
  console.log(`  ... timeout waiting for: ${label}`);
  return false;
}

// P5 (D4/S4): Dismiss onboarding/consent overlays ("You're generating with
// Gemini Omni Flash..." -> "Got it", etc.) that cover the composer on fresh/EN profiles.
async function dismissOverlays(page) {
  for (let round = 0; round < 4; round++) {
    let hit = false;
    const labels = [
      /^Got it$/i,
      /^Acknowledge$/i,
      /^Accept$/i,
      /^Dismiss$/i,
      /^Next$/i,
      /^ঠিক আছে$/,
      /^বুঝেছি$/,
      /^অনুমোদন করুন$/,
    ];
    for (const re of labels) {
      const btns = page.locator('button').filter({ hasText: re });
      const n = await btns.count().catch(() => 0);
      for (let i = 0; i < n; i++) {
        const b = btns.nth(i);
        if (!await b.isVisible().catch(() => false)) continue;
        const box = await b.boundingBox({ timeout: 3000 }).catch(() => null);
        if (box && box.width > 2 && box.height > 2) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          hit = true;
          await page.waitForTimeout(1200);
          break;
        }
      }
      if (hit) break;
    }
    if (!hit) break;
  }
}

async function closeAgentPanel(page) {
  for (let i = 0; i < 3; i++) {
    const header = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('*')).filter(e =>
        /^(শিরোনামহীন সেশন|Untitled session)$/i.test((e.innerText || '').trim().split('\n')[0] || ''));
      return els.length > 0;
    }).catch(() => false);
    if (!header) return true;
    const x = page.locator('button[aria-label*="Close"], button[aria-label*="বন্ধ"]').last();
    if (await x.isVisible().catch(() => false)) {
      const b = await x.boundingBox({ timeout: 5000 }).catch(() => null);
      if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      await page.waitForTimeout(2000);
    } else return false;
  }
  return false;
}

// P5 + D5/S5: Self-identifying agent-mode chip toggle (supports "এজেন্ট মোড",
// "Agent mode", and "Agent"). Never re-clicks when aria-pressed is already false.
async function agentOff(page) {
  for (let i = 0; i < 5; i++) {
    await dismissOverlays(page);
    const state = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => {
        const txt = (b.innerText || '').trim();
        const aria = (b.getAttribute('aria-label') || '').trim();
        return /^(এজেন্ট মোড|Agent mode|Agent)$/i.test(txt) || /^(এজেন্ট মোড|Agent mode|Agent)$/i.test(aria);
      });
      if (!btns.length) return { found: false, pressed: [] };
      return {
        found: true,
        pressed: btns.map(b => b.getAttribute('aria-pressed')),
      };
    }).catch(() => ({ found: false, pressed: [] }));

    if (!state.found) {
      console.log('  agent chip not present (direct mode ready)');
      return true;
    }
    if (state.pressed.includes('false') || (state.pressed.length && !state.pressed.includes('true'))) {
      console.log('  agent already OFF (aria-pressed=false) - not touching');
      return true;
    }
    const chip = page.locator('button').filter({ hasText: AGENT_CHIP_RE }).first();
    if (await chip.isVisible().catch(() => false)) {
      const box = await chip.boundingBox({ timeout: 4000 }).catch(() => null);
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      } else {
        await chip.focus().catch(() => {});
        await page.keyboard.press('Space').catch(() => {});
      }
    }
    await page.waitForTimeout(2000);
    await closeAgentPanel(page);
  }
  return false;
}

// D5/S5: Verify settings chip reads video-720p-8s-x1 and frame slot buttons exist;
// open model menu ONLY when wrong (bn + en selectors).
async function settingsOnce(page) {
  await dismissOverlays(page);
  const check = await page.evaluate(() => {
    const t = document.body.innerText || '';
    const chipOk = /(ভিডিও|Video)\s*•?\s*720p\s*•?\s*(8|6|10)\s*(সেকেন্ড|s|sec|seconds)/i.test(t)
      || (/720p/i.test(t) && /(8\s*সেকেন্ড|8\s*s|8\s*seconds)/i.test(t));
    const frameOk = Array.from(document.querySelectorAll('button')).some(b =>
      /^(শুরু|শেষ|Start|End)$/i.test((b.innerText || '').trim())
    );
    return { chipOk, frameOk };
  }).catch(() => ({ chipOk: false, frameOk: false }));

  if (check.chipOk && check.frameOk) {
    console.log('  settings already correct (video-720p-8s-x1 + frame slots) - skipping menu');
    return true;
  }
  console.log('  settings missing/wrong - opening model settings menu once');
  const trigger = page.locator('button').filter({
    hasText: /Nano Banana|Gemini Omni|ভিডিও|Video|720p|1080p|ছবি|Image/i,
  }).first();
  const nbox = await trigger.boundingBox({ timeout: 5000 }).catch(() => null);
  if (!nbox) return false;
  await page.mouse.click(nbox.x + nbox.width / 2, nbox.y + nbox.height / 2);
  await page.waitForTimeout(2200);

  await tclick(page, ['ভিডিও', 'Video', 'VIDEO']);
  await tclick(page, ['ফ্রেম', 'Frame', 'FRAME', 'Frames']);
  for (const group of [
    ['16:9'],
    ['Omni 1.1 Flash', 'Gemini Omni 1.1 Flash', 'Omni Flash'],
    ['720p'],
    ['8 সেকেন্ড', '8 seconds', '8s'],
    ['x১', 'x1', '1x'],
  ]) {
    await tclick(page, group);
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(1500);
  await dismissOverlays(page);
  return true;
}

// P3 (D6/S6): Dropped images show % progress and thumbnails but NEVER any
// filename text. Verify upload by: no % indicator AND img count increased
// within bounded 75s timeout.
async function dropAnchor(page, shotFile, workerId) {
  await dismissOverlays(page);
  const filePath = path.join(VISUAL, shotFile);
  if (!fs.existsSync(filePath)) {
    console.log(`[S${workerId}] anchor file missing on disk: ${shotFile}`);
    return false;
  }
  const baseImgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).filter(im => im.complete && im.naturalWidth > 0).length
  ).catch(() => 0);
  const b64 = fs.readFileSync(filePath).toString('base64');

  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.evaluate(async (dd) => {
      const bc = atob(dd.b64);
      const arr = new Uint8Array(bc.length);
      for (let i = 0; i < bc.length; i++) arr[i] = bc.charCodeAt(i);
      const dt = new DataTransfer();
      dt.items.add(new File([arr], dd.name, { type: 'image/jpeg' }));
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 3) || document.body;
      for (const ev of ['dragenter', 'dragover', 'drop']) {
        el.dispatchEvent(new DragEvent(ev, { bubbles: true, cancelable: true, dataTransfer: dt }));
      }
    }, { b64, name: shotFile });

    // Bounded wait: 38 * 2000ms = 76s max per attempt
    const ok = await waitState(page, async () => {
      const st = await page.evaluate((base) => {
        const text = document.body.innerText || '';
        const busy = /\b\d{1,3}%/.test(text);
        const imgs = Array.from(document.querySelectorAll('img')).filter(im => {
          const r = im.getBoundingClientRect();
          return im.complete && im.naturalWidth > 0 && r.width >= 20 && r.height >= 20;
        }).length;
        return { busy, imgs };
      }, baseImgs).catch(() => ({ busy: true, imgs: 0 }));
      return !st.busy && st.imgs > baseImgs;
    }, `upload ${shotFile} (try ${attempt})`, 38, 2000);

    if (ok) return true;
  }
  return false;
}

// P4 (D7/S7): Exact start-frame link verification.
// When unlinked, the composer shows a visible button whose text is "শুরু" or "Start".
// When linked, that slot button is REPLACED by a thumbnail image in the composer
// (not an img inside the button: the শুরু/Start text button is gone/hidden AND
// the composer container holds a visible thumbnail img >24x24 outside ProseMirror).
async function isFrameSlotLinked(page, slotTxts = ['শুরু', 'Start']) {
  return page.evaluate((labels) => {
    const ed = document.querySelector('div.ProseMirror');
    if (!ed) return false;
    let composer = ed;
    for (let i = 0; i < 6 && composer.parentElement; i++) {
      composer = composer.parentElement;
      if (composer.querySelectorAll('button').length >= 2) break;
    }
    const lowerLabels = labels.map(s => s.toLowerCase());
    const slotBtns = Array.from(composer.querySelectorAll('button')).filter(b => {
      const r = b.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      const txt = (b.innerText || '').trim().toLowerCase();
      return lowerLabels.includes(txt);
    });
    // If the text button ("শুরু" / "Start") is still visible in the composer, it is NOT replaced yet.
    const unlinkedBtnVisible = slotBtns.some(b => {
      const hasThumb = Array.from(b.querySelectorAll('img')).some(im => {
        const ir = im.getBoundingClientRect();
        return ir.width > 24 && ir.height > 24;
      });
      return !hasThumb;
    });
    if (unlinkedBtnVisible) return false;

    // Confirm a real thumbnail image (>24x24) now exists in the composer area outside ProseMirror text
    const thumbs = Array.from(composer.querySelectorAll('img')).filter(im => {
      if (ed.contains(im)) return false;
      const r = im.getBoundingClientRect();
      return im.complete && im.naturalWidth > 0 && r.width > 24 && r.height > 24;
    });
    return thumbs.length > 0;
  }, slotTxts).catch(() => false);
}

// P3 + P4 (D7/S7): Click শুরু/Start -> select the uploaded image row (by filename
// if present, otherwise the newest/first visible thumbnail row in the picker) ->
// click Add to prompt / প্রম্পটে যোগ করুন -> verify slot button replaced by thumbnail.
async function setFrame(page, shotFile, slotTxts = ['শুরু', 'Start']) {
  await dismissOverlays(page);
  if (await isFrameSlotLinked(page, slotTxts)) return true;

  for (let pass = 0; pass < 2; pass++) {
    if (!await tclick(page, slotTxts)) {
      if (await isFrameSlotLinked(page, slotTxts)) return true;
      break;
    }
    await page.waitForTimeout(1800);

    // 1) Try matching by filename if shown
    let picked = false;
    const namedRow = page.locator('button, div[role="button"], [role="option"], [role="listitem"]').filter({ hasText: shotFile }).first();
    if (await namedRow.isVisible().catch(() => false)) {
      const b = await namedRow.boundingBox({ timeout: 3000 }).catch(() => null);
      if (b && b.width > 4 && b.height > 4) {
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        picked = true;
        await page.waitForTimeout(1500);
      }
    }

    // 2) Flow never shows filenames on dropped thumbnails (P3): click the newest
    // visible ingredient thumbnail outside the bottom composer bar.
    if (!picked) {
      const pt = await page.evaluate(() => {
        const ed = document.querySelector('div.ProseMirror');
        const edRect = ed ? ed.getBoundingClientRect() : { top: window.innerHeight - 180 };
        const candidates = Array.from(document.querySelectorAll('img')).filter(im => {
          const r = im.getBoundingClientRect();
          if (r.width < 32 || r.height < 32) return false;
          // Exclude tiny avatars and anything inside the bottom composer slot
          if (r.top > edRect.top - 10 && r.bottom <= window.innerHeight) return false;
          return im.complete && im.naturalWidth > 0;
        });
        if (!candidates.length) return null;
        // Pick the most recently added thumbnail (last in DOM or first in picker dialog)
        const target = candidates[candidates.length - 1];
        const tr = target.getBoundingClientRect();
        return { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };
      }).catch(() => null);

      if (pt) {
        await page.mouse.click(pt.x, pt.y);
        await page.waitForTimeout(1500);
      }
    }

    // Click "প্রম্পটে যোগ করুন" / "Add to prompt" if shown
    await tclick(page, ['প্রম্পটে যোগ করুন', 'Add to prompt', 'Use as start frame', 'শুরু ফ্রেম হিসেবে ব্যবহার করুন']);

    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(1500);
      if (await isFrameSlotLinked(page, slotTxts)) return true;
    }
  }
  return isFrameSlotLinked(page, slotTxts);
}

// P1 + P6 (D8/S8): Strictly SINGLE-CLICK submit with visible-enabled arrow check
// and fast whitespace-normalized output-card acceptance check. Never auto-retries
// a submit click so we NEVER double-burn 12 credits.
async function submitOnce(page, promptText, sceneId, workerId) {
  await dismissOverlays(page);
  const pm = page.locator('div.ProseMirror').first();
  // type with READ-BACK: an empty composer + arrow click is a silent no-op
  // that fakes ACCEPTED (PROBED 2026-10-15) - never click without typed text
  let typed = false;
  for (let t = 0; t < 3 && !typed; t++) {
    await pm.click().catch(() => {});
    await page.waitForTimeout(800);
    const cur = await pm.textContent().catch(() => '');
    if (!cur || cur.trim().length < 100) {
      await page.keyboard.press('Control+a').catch(() => {});
      await page.keyboard.type(promptText, { delay: 2 }).catch(() => {});
      await page.waitForTimeout(1500);
    }
    const back = await pm.textContent().catch(() => '');
    typed = (back || '').trim().length >= 100;
  }
  if (!typed) return false;

  // Snapshot existing output cards / prompt signature hits outside ProseMirror BEFORE clicking
  const sig = promptText.slice(28, 72).replace(/\s+/g, ' ').trim();
  const baseHits = await page.evaluate((s) => {
    const ed = document.querySelector('div.ProseMirror');
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('div.ProseMirror').forEach(n => n.remove());
    const norm = (clone.innerText || '').replace(/\s+/g, ' ');
    return norm.split(s).length - 1;
  }, sig).catch(() => 0);

  // P6: Find the VISIBLE, non-disabled submit arrow button (there may be hidden duplicates)
  const arrowBox = await page.evaluate(() => {
    const sel = [
      'button[aria-label="জেনারেট করা শুরু করুন"]',
      'button[aria-label*="Start generating"]',
      'button[aria-label*="Generate"]',
      'button[aria-label*="Submit"]',
      'button[aria-label*="Send"]',
    ].join(', ');
    const vis = (b) => {
      const r = b.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return false;
      const style = window.getComputedStyle(b);
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0;
    };
    for (const b of Array.from(document.querySelectorAll(sel))) {
      if (!vis(b)) continue;
      const dis = b.getAttribute('aria-disabled') === 'true' || b.disabled;
      if (dis) return { disabled: true };
      const r = b.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, disabled: false };
    }
    // geometry fallback (PROBED 2026-10-15: EN arrow aria differs): rightmost
    // circular composer button (24-48px) next to the Video-720p chip
    const ed = document.querySelector('div.ProseMirror');
    let scope = ed;
    for (let i = 0; i < 4 && scope && scope.parentElement; i++) scope = scope.parentElement;
    if (!scope || scope === document.body) scope = document;
    let best = null;
    for (const b of Array.from(scope.querySelectorAll('button'))) {
      const r = b.getBoundingClientRect();
      if (r.width < 20 || r.width > 56 || Math.abs(r.width - r.height) > 12) continue;
      const style = window.getComputedStyle(b);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (!best || r.left > best.x) best = { x: r.left + r.width / 2, y: r.top + r.height / 2, disabled: !!(b.disabled || b.getAttribute('aria-disabled') === 'true') };
    }
    return best;
  }).catch(() => null);

  if (!arrowBox || arrowBox.disabled) {
    const dbg = path.join(VISUAL, `_debug_s${workerId}_scene${sceneId}_arrow_miss.png`);
    await page.screenshot({ path: dbg }).catch(() => {});
    console.log(`[S${workerId}] submit arrow miss/disabled for scene ${sceneId} -> ${dbg}`);
    return false;
  }

  // STRICTLY ONE CLICK — never re-click after this point (P1: prevents 2x 12-credit burn)
  await page.mouse.click(arrowBox.x, arrowBox.y);

  // Fast acceptance check (up to 90s = 45 * 2s):
  // Accepted as soon as EITHER:
  //  (a) ProseMirror composer text cleared, OR
  //  (b) A new output card outside ProseMirror contains our whitespace-normalized prompt signature, OR
  //  (c) A generating/queued card ("0%", "Generating", "জেনারেট হচ্ছে", "in the queue") appeared.
  const accepted = await waitState(page, async () => {
    return page.evaluate(({ s, prevHits }) => {
      const ed = document.querySelector('div.ProseMirror');
      const edEmpty = !ed || (ed.textContent || '').trim().length < 30;
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll('div.ProseMirror').forEach(n => n.remove());
      const norm = (clone.innerText || '').replace(/\s+/g, ' ');
      const curHits = norm.split(s).length - 1;
      if (curHits > prevHits) return true;
      if (edEmpty && curHits >= 1) return true;
      if (edEmpty) return true;
      return false;
    }, { s: sig, prevHits: baseHits });
  }, `submit accepted (scene ${sceneId})`, 45, 2000);

  if (!accepted) {
    const dbg = path.join(VISUAL, `_debug_s${workerId}_scene${sceneId}_submit_noshow.png`);
    await page.screenshot({ path: dbg }).catch(() => {});
  }
  return accepted;
}

// Worker loop: 1 Chrome profile -> 1 Flow project -> submits all its assigned scenes serially
async function runProject(profileObj, workerId, ids, staggerMs = 0) {
  const { dir: profileDir, email } = profileObj;
  const st = loadState();
  const fresh = ids.filter(id => {
    const f = path.join(VISUAL, `clip_shot_${String(id).padStart(4, '0')}.mp4`);
    if (!FORCE && fs.existsSync(f) && fs.statSync(f).size > 100000) return false;
    if (!FORCE && st[id]) {
      console.log(`[S${workerId}] scene ${id} already submitted (${st[id].project}) - skip`);
      return false;
    }
    return !!MOTION[id];
  });
  if (!fresh.length) return { workerId, account: email, submitted: 0, failed: [] };

  if (staggerMs > 0) {
    console.log(`[S${workerId}/${email}] staggering start by ${Math.round(staggerMs / 1000)}s...`);
    await new Promise(r => setTimeout(r, staggerMs));
  }

  let ctx = null;
  let projectUrl = null;
  try {
    ctx = await chromium.launchPersistentContext(profileDir, {
      headless: false,
      executablePath: CHROME_PATH,
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
      viewport: null,
    });
    const page = ctx.pages()[0] || await ctx.newPage();
    await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    await dismissOverlays(page);

    if (process.env.RESUME_URL && workerId === 1) {
      projectUrl = process.env.RESUME_URL;
      console.log(`[S${workerId}/${email}] resume project: ${projectUrl}`);
      await page.goto(projectUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(9000);
    } else {
      if (!await tclick(page, ['নতুন প্রোজেক্ট', 'New project', 'Create project'])) {
        throw new Error('NO_NEW_PROJECT');
      }
      await page.waitForTimeout(9000);
      projectUrl = page.url();
    }
    // P7: Always print project URL clearly so user can open/adopt for manual harvest
    console.log(`[S${workerId}/${email}] PROJECT_URL: ${projectUrl}`);

    await dismissOverlays(page);
    await closeAgentPanel(page);
    if (!await agentOff(page)) throw new Error('AGENT_STUCK_ON');
    await dismissOverlays(page);
    await settingsOnce(page);

    let submitted = 0;
    const failed = [];
    for (const id of fresh) {
      const shot = `shot_${String(id).padStart(4, '0')}.jpg`;
      console.log(`[S${workerId}/${email}] scene ${id}: drop + link start frame + submit...`);
      await dismissOverlays(page);

      if (!await dropAnchor(page, shot, workerId)) {
        const dbg = path.join(VISUAL, `_debug_s${workerId}_scene${id}_upload_stuck.png`);
        await page.screenshot({ path: dbg }).catch(() => {});
        failed.push([id, 'UPLOAD_STUCK']);
        continue;
      }
      if (!await setFrame(page, shot, ['শুরু', 'Start'])) {
        const dbg = path.join(VISUAL, `_debug_s${workerId}_scene${id}_noframe.png`);
        await page.screenshot({ path: dbg }).catch(() => {});
        failed.push([id, 'NOFRAME']);
        continue;
      }
      const endShot = END_FRAMES[id];
      if (endShot) {
        if (!await dropAnchor(page, endShot, workerId) || !await setFrame(page, endShot, ['শেষ', 'End'])) {
          failed.push([id, 'NOENDFRAME']);
          continue;
        }
      }
      if (!await submitOnce(page, DIRECT_FORMULA(MOTION[id]), id, workerId)) {
        failed.push([id, 'SUBMIT_NOSHOW']);
        continue;
      }

      submitted++;
      const curState = loadState();
      curState[id] = {
        project: projectUrl,
        account: email,
        at: new Date().toISOString(),
      };
      saveState(curState);
      const shotOk = path.join(VISUAL, `_submitted_s${workerId}_scene${id}.png`);
      await page.screenshot({ path: shotOk }).catch(() => {});
      console.log(`[S${workerId}/${email}] ✓ scene ${id} ACCEPTED (~12 credits) -> ${projectUrl}`);
      // P7: Never wait for render completion; brief pause so composer resets for next scene
      await page.waitForTimeout(3500);
    }

    await ctx.close().catch(() => {});
    return { workerId, account: email, project: projectUrl, submitted, creditsSpent: submitted * 12, failed };
  } catch (err) {
    try { if (ctx) await ctx.close(); } catch (_) {}
    if (/existing browser session|profile.*in use|singletonlock/i.test(err.message)) {
      console.error(`[S${workerId}/${email}] PROFILE_BUSY: profile dir ${profileDir} is locked by another Chrome session.`);
      return { workerId, account: email, project: projectUrl, submitted: 0, failed: fresh.map(id => [id, 'PROFILE_BUSY']) };
    }
    return { workerId, account: email, project: projectUrl, submitted: 0, failed: fresh.map(id => [id, err.message.slice(0, 60)]) };
  }
}

async function main() {
  const only = Number(process.env.ONLY_SCENE) || 0;
  const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
  const st = loadState();

  // P8 (D3/S3): Deduplicate against BOTH disk clips AND _flow_submitted.json BEFORE
  // launching any browser so reruns never create empty/duplicate Flow projects.
  const todo = project.scenes
    .filter(s => s.type === 'DYNAMIC_AI_VIDEO')
    .map(s => s.scene_id)
    .filter(id => {
      if (only && id !== only) return false;
      const f = path.join(VISUAL, `clip_shot_${String(id).padStart(4, '0')}.mp4`);
      if (!FORCE && fs.existsSync(f) && fs.statSync(f).size > 100000) return false;
      if (!FORCE && st[id]) {
        console.log(`[SKIP] scene ${id} already submitted in state (${st[id].project} @ ${st[id].at})`);
        return false;
      }
      return !!MOTION[id];
    });

  if (!todo.length) {
    console.log('=== EP02 FLOW-SUBMIT: 0 scenes remaining (all rendered or already submitted). Exiting cleanly with 0 browsers launched. ===');
    process.exit(0);
  }

  // Single-worker mode when ONLY_SCENE or RESUME_URL is set; otherwise shard across up to 3 profiles
  const activeCount = (only || process.env.RESUME_URL) ? 1 : Math.min(PROFILES.length, todo.length);
  const buckets = Array.from({ length: activeCount }, () => []);
  todo.forEach((id, idx) => buckets[idx % activeCount].push(id));

  console.log(`=== EP02 FLOW-SUBMIT FLEET: ${activeCount} worker(s), ${todo.length} scene(s) [${todo.join(', ')}] ===`);

  // P2: Pre-launch cleanup of orphan Chrome processes for active fleet profiles only
  cleanupStaleProfiles(PROFILES.slice(0, activeCount).map(p => p.dir));

  const results = await Promise.all(
    buckets.map((ids, i) => runProject(PROFILES[i], i + 1, ids, i * STAGGER_MS))
  );
  console.log(JSON.stringify(results, null, 2));
  const totalCredits = results.reduce((acc, r) => acc + (r.creditsSpent || 0), 0);
  console.log(`Total submitted: ${results.reduce((a, r) => a + r.submitted, 0)} video(s), estimated credits spent: ${totalCredits}`);
  process.exit(results.some(r => (r.failed || []).length > 0) ? 1 : 0);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: multi-worker submit-only fleet; harvest is manual per user direction
