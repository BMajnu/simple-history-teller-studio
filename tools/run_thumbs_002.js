// ============================================================================
// EP02 THUMBNAIL FLEET — 3 master (16:9) + 12 shorts (9:16), TEXT-ON (SOP 09)
// Run:   node tools/run_thumbs_002.js
// ----------------------------------------------------------------------------
// T1 Style: sticky-man formula anchored to ref_host_sticky_meme.jpg host scenes.
// T2 INVERSE RULE: prompts MUST include the burned hook text spec (no anti-text).
// T3 Aspect per job: 16:9 masters / 9:16 shorts safe-zone layout.
// T4 Output < 2MB: banana jpg (~800KB) accepted as-is.
// T5 Slots always valid (modulo); queue shared; never close Chrome mid-run.
// ============================================================================
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const META = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'metadata');
const SHORTS = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'renders', 'shorts');
const REF_STICKY = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');

const MODEL_CHAIN = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];
const ACCOUNT_SLOTS = [1, 2, 3, 4, 5, 6];
const NUM_WORKERS = 2;

const STYLE = 'Sticky-man stick-figure cartoon, smooth plain round heads with simple dot eyes, thin black stick arms and legs, thick outlines, flat warm colors, dramatic comic lighting, full-scene composition, all written text clean and unmistakable with zero gibberish glyphs, no photorealism, no sticker borders';
const TITLE3D = 'Large bold 3D embossed comic title with glowing golden-yellow fiery gradient fill (#FFE600 to #FF6D00), thick black outline, intense volumetric glow and heavy drop shadow';
const TEXT_LOCK = 'Render ONLY the following written texts and absolutely nothing else:';

const ART = {
  p1: 'a panicked white monkey-like stick figure clinging to an acacia tree pointing up at a swooping dark eagle while a spotted leopard lurks in tall golden grass below, huge glowing orange sound rings bursting from the monkey mouth',
  p2: 'an arrogant pharaoh stick-man in gold cobra crown glaring from his golden throne while a shepherd stick-man carries two swaddled babies toward a stone hut, blazing desert sun, tall columns',
  p3: 'a stick-man scholar with white beard holding two ancient glowing skulls while a golden DNA helix spirals up between them inside a torch-lit cave wall chamber',
  p4: 'a small band of stick-man humans with blazing torches marching through an icy storm shore toward a giant glowing golden globe of the earth floating in the night sky',
  master: 'epic confrontation: an angry wild caveman stick-man on the left shouting huge glowing orange sound rings versus the calm Time Chronicler stick-man scholar with white beard, glasses and brown robe holding a blazing wooden torch and a glowing golden scroll on the right, cosmic starry library background',
};

function badgeOf(lang, part) {
  if (lang === 'bn') return ['১ম পর্ব', '২য় পর্ব', '৩য় পর্ব', '৪র্থ পর্ব'][part - 1];
  if (lang === 'hi') return ['भाग 1', 'भाग 2', 'भाग 3', 'भाग 4'][part - 1];
  return ['PART 1', 'PART 2', 'PART 3', 'PART 4'][part - 1];
}
const HOOKS = {
  bn: ['প্রথম শব্দ কে বললো?!', 'ফারাওর নিষিদ্ধ পরীক্ষা!', 'হাড়ের DNA রহস্য!', 'প্রথম ভাষার রহস্য!'],
  en: ['WHO SPOKE THE FIRST WORD?!', "PHARAOH'S FORBIDDEN EXPERIMENT!", 'SECRETS INSIDE THE BONES!', 'THE FIRST LANGUAGE MYSTERY!'],
  hi: ['पहला शब्द किसने बोला?!', 'फ़राओ का गुप्त प्रयोग!', 'हड्डी के DNA रहस्य!', 'पहली भाषा का रहस्य!'],
};
const BRAND = { bn: 'Simple History Teller Bangla', en: 'Simple History Teller', hi: 'Simple History Teller Hindi' };

const JOBS = [];
// masters (16:9)
JOBS.push({
  id: 'master_bn', ratio: '16:9', out: path.join(META, 'bn_thumbnail.jpg'), ref: true,
  prompt: `${STYLE}. ${ART.master}. ${TEXT_LOCK} 1) the big 3D title: "প্রথম শব্দ কে বললো?!" 2) a red comic speech bubble: "চুপ!!"`,
});
JOBS.push({
  id: 'master_en', ratio: '16:9', out: path.join(META, 'en_thumbnail.jpg'), ref: true,
  prompt: `${STYLE}. ${ART.master}. ${TEXT_LOCK} 1) the big 3D title: "THE FIRST WORD?!" 2) a red comic speech bubble: "¡¡AHHH!!"`,
});
JOBS.push({
  id: 'master_hi', ratio: '16:9', out: path.join(META, 'hi_thumbnail.jpg'), ref: true,
  prompt: `${STYLE}. ${ART.master}. ${TEXT_LOCK} 1) the big 3D title: "पहला शब्द किसने बोला?!" 2) a red comic speech bubble: "चुप!!"`,
});
for (const lang of ['bn', 'en', 'hi']) {
  for (let part = 1; part <= 4; part++) {
    JOBS.push({
      id: `s${lang}${part}`, ratio: '9:16', out: path.join(SHORTS, `thumb_${lang}_part${part}.jpg`), ref: part === 2,
      prompt: `Vertical 9:16 social poster layout, ${STYLE}. TOP ZONE (15-35% from top): small minimalist rounded badge reading "[ ${badgeOf(lang, part)} ]" and below it the hook headline ${TITLE3D} reading: "${HOOKS[lang][part - 1]}". CENTER ZONE (40-75%): main dynamic artwork: ${ART['p' + (part === 2 ? 2 : part === 1 ? 1 : part === 3 ? 3 : 4)]} rendered large and dramatic with action lines. BOTTOM STRIP (last 8%): small clean white watermark text: "${BRAND[lang]}".`,
    });
  }
}

const LOGO_DESC = 'a perfectly square 1:1 channel logo design. CENTERED COMPOSITION: one single complete circular medallion, perfectly round, fully visible, placed exactly in the middle of the square canvas with equal empty margin on all four sides, absolutely nothing cropped or touching the canvas edges. OUTER RING: thick bright gold circular ring with one thin cream-white ring just inside it and a soft golden glow halo around it. INSIDE THE CIRCLE: a deep navy blue field. TOP INSIDE: delicate gold baroque filigree scrollwork ornament. CENTER: a stick-figure cartoon scholar (match the attached character design exactly) — bald elderly man with smooth round head, tiny dot eyes behind small round glasses, long white beard, brown robe, thick black outlines, flat warm colors — his left hand raised holding a burning wooden torch with a big orange-yellow flame, his right hand resting on a huge closed antique leather-bound book with a gold clasp and small rune marks. BEHIND HIM: a cracked stone rune-inscribed archway with a keystone block and faint mystical rune glyphs floating on the navy background. BOTTOM INSIDE: elegant gold serif uppercase letters curved along the inner bottom edge of the ring. OUTSIDE THE CIRCLE: very dark navy monastery stone wall with faint carved runes. crisp vector cartoon illustration, clean crisp legible letters, no gibberish, no extra text, no watermark, no photorealism, no sticker border, no crop';
const LOGO_EXACT = (name) => `${LOGO_DESC}. ${TEXT_LOCK} the only visible text is the curved gold uppercase letters along the bottom ring interior, reading exactly: "${name}" - every letter must sit fully inside the ring with a small margin, no letter touching or spilling past the ring edge`;
JOBS.push({
  id: 'logo_en', ratio: '1:1', out: path.join(META, '..', 'branding', 'avatar_simple_history_teller.jpg'), ref: true,
  prompt: LOGO_EXACT('SIMPLE HISTORY TELLER'),
});
JOBS.push({
  id: 'logo_bn', ratio: '1:1', out: path.join(META, '..', 'branding', 'avatar_simple_history_teller_bangla.jpg'), ref: true,
  prompt: LOGO_EXACT('SIMPLE HISTORY TELLER BANGLA'),
});
JOBS.push({
  id: 'logo_hi', ratio: '1:1', out: path.join(META, '..', 'branding', 'avatar_simple_history_teller_hindi.jpg'), ref: true,
  prompt: LOGO_EXACT('SIMPLE HISTORY TELLER HINDI'),
});

function ff(args) { try { const { execSync } = require('child_process'); execSync('ffmpeg ' + args.join(' '), { stdio: 'pipe' }); return true; } catch (e) { return false; } }

async function ensureSession(page, slot, model, ratio) {
  await page.goto(`https://aistudio.google.com/u/${slot}/prompts/new_chat?model=${model}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  try {
    const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await thinkingSelect.count() > 0) {
      await thinkingSelect.click().catch(() => {});
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option').filter({ hasText: 'High' }).first();
      if (await opt.count() > 0) await opt.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (e) {}
  try {
    const btn = page.locator('button[aria-label*="Aspect"], button[aria-label*="aspect"], mat-select[aria-label*="Aspect"]').first();
    if (await btn.count() > 0) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(500);
      const opt = page.locator('mat-option, [role="option"]').filter({ hasText: ratio }).first();
      if (await opt.count() > 0) await opt.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (e) {}
}

async function isQuota(page) {
  return page.evaluate(() =>
    /exceeded quota|Upgrade to unlock|try again later|daily limit|rate limit/i.test(document.body.innerText || '')
  ).catch(() => false);
}

async function generateOnPage(page, job, getSlot) {
  for (const model of MODEL_CHAIN) {
    for (let s = 0; s < ACCOUNT_SLOTS.length; s++) {
      const slot = getSlot();
      try {
        await ensureSession(page, slot, model, job.ratio);
        if (await isQuota(page)) continue;
        if (job.ref) {
          const refPath = typeof job.ref === 'string' ? job.ref : REF_STICKY;
          if (fs.existsSync(refPath)) {
            const fi = page.locator('input[type="file"]').first();
            if (await fi.count() > 0) { await fi.setInputFiles(refPath).catch(() => {}); await page.waitForTimeout(1500); }
          }
        }
        const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
          .filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/'))
          .map(img => img.src)).catch(() => []);
        const ta = page.locator('textarea, div[contenteditable="true"][role="textbox"]').first();
        await ta.waitFor({ state: 'visible', timeout: 20000 });
        await ta.fill(job.prompt);
        await page.waitForTimeout(600);
        await page.keyboard.press('Control+Enter');
        let found = null;
        for (let i = 0; i < 25; i++) {
          await page.waitForTimeout(2000);
          if (await isQuota(page)) break;
          const cur = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
            .filter(img => img.naturalWidth >= 400 && !img.src.includes('avatar') && !img.src.includes('googleusercontent.com/a/'))
            .map(img => img.src)).catch(() => []);
          const fresh = cur.filter(x => !prevImgs.includes(x));
          if (fresh.length) { found = fresh[fresh.length - 1]; break; }
        }
        if (!found) { if (await isQuota(page)) continue; return { ok: false, err: 'TIMEOUT_NO_IMAGE' }; }
        const img = await page.evaluate(async (src) => {
          const res = await fetch(src); const blob = await res.blob();
          const ab = await blob.arrayBuffer(); const b = new Uint8Array(ab);
          let bin = ''; for (let k = 0; k < b.length; k++) bin += String.fromCharCode(b[k]);
          return { b64: btoa(bin), size: b.length };
        }, found);
        if (!img || !img.b64) return { ok: false, err: 'EXTRACT_FAIL' };
        fs.writeFileSync(job.out, Buffer.from(img.b64, 'base64'));
        console.log(`✓ ${job.id} (${(img.size / 1024).toFixed(0)} KB)`);
        return { ok: true };
      } catch (e) {
        if (/quota|429/i.test(e.message)) continue;
        return { ok: false, err: e.message.slice(0, 80) };
      }
    }
  }
  return { ok: false, err: 'ALL_SLOTS_QUOTA' };
}

async function runWorker(ctx, workerId, queue) {
  let page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length;
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  try {
    while (queue.length > 0) {
      const job = queue.shift();
      try {
        const res = await generateOnPage(page, job, getSlot);
        if (!res.ok) console.log(`✗ ${job.id}: ${res.err}`);
      } catch (e) {
        console.log(`✗ ${job.id}: CRASH ${e.message.slice(0, 60)} — restarting page`);
        try { await page.close(); } catch (_) {}
        page = await ctx.newPage();
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  } finally { try { await page.close(); } catch (_) {} }
}

(async () => {
  const only = (process.env.THUMB_ONLY || '').split(',').filter(Boolean);
const todo = JOBS.filter(j => only.includes(j.id) || (!only.length && !(fs.existsSync(j.out) && fs.statSync(j.out).size > 100000)));
  console.log(`=== THUMB FLEET: ${todo.length}/${JOBS.length} jobs ===`);
  if (!todo.length) { process.exit(0); }
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null,
  });
  await Promise.all(Array.from({ length: NUM_WORKERS }, (_, i) => runWorker(ctx, i + 1, todo.slice())));
  const results = JOBS.map(j => `${j.id}:${(fs.existsSync(j.out) ? (fs.statSync(j.out).size / 1024).toFixed(0) + 'KB' : 'MISSING')}`);
  console.log('RESULTS:', results.join(' | '));
  await ctx.close();
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
// ponytail: one fleet pass; thumbs land as direct banana jpgs (size is small)
