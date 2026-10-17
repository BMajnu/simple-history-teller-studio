// EP03 MASTER THUMBNAILS — 3 jobs (bn/en/hi, 16:9). Prompts: metadata/THUMBNAIL_PROMPTS.md
// Based on proven run_thumbs_002.js fleet. Run: node tools/run_thumbs_003.js
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const META = path.join(ROOT, 'projects', 'simple_itihash_003_nalanda', 'metadata');

const MODEL_CHAIN = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];
const ACCOUNT_SLOTS = [1, 2, 3, 4, 5, 6];
const NUM_WORKERS = 3;

const SPEC = '3D CTR style YouTube thumbnail, burning 9-storey ancient Nalanda Ratnasagara library left-center, towering flames and thick smoke in night sky, flying burnt manuscripts and embers, right-third extreme closeup shocked Time Chronicler face with round brass spectacles reflecting fire, mouth wide open, high contrast yellow-red palette, dramatic rim light, ultra sharp, 4k';

const JOBS = [
  { id: 'master_bn', ratio: '16:9', out: path.join(META, 'bn_thumbnail.jpg'), prompt: `16:9 ${SPEC}, big bold 3D Bengali text "৩ মাস আগুন!" in yellow with red outline and black stroke center-left` },
  { id: 'master_en', ratio: '16:9', out: path.join(META, 'en_thumbnail.jpg'), prompt: `16:9 ${SPEC}, big bold 3D English text "BURNED 3 MONTHS!" in yellow with red outline and black stroke center-left` },
  { id: 'master_hi', ratio: '16:9', out: path.join(META, 'hi_thumbnail.jpg'), prompt: `16:9 ${SPEC}, big bold 3D Hindi text "3 महीने आग!" in yellow with red outline and black stroke center-left` },
];

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
        console.log(`OK ${job.id} (${(img.size / 1024).toFixed(0)} KB)`);
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
  const page = await ctx.newPage();
  let slotIdx = (workerId - 1) % ACCOUNT_SLOTS.length;
  const getSlot = () => { const s = ACCOUNT_SLOTS[slotIdx % ACCOUNT_SLOTS.length]; slotIdx++; return s; };
  try {
    while (queue.length > 0) {
      const job = queue.shift();
      const res = await generateOnPage(page, job, getSlot);
      if (!res.ok) console.log(`FAIL ${job.id}: ${res.err}`);
      await page.waitForTimeout(1500);
    }
  } finally { await page.close().catch(() => {}); }
}

(async () => {
  const todo = JOBS.filter(j => !(fs.existsSync(j.out) && fs.statSync(j.out).size > 100000));
  console.log(`=== EP03 THUMB FLEET: ${todo.length}/${JOBS.length} jobs ===`);
  if (!todo.length) { process.exit(0); }
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null,
  });
  await Promise.all(Array.from({ length: Math.min(NUM_WORKERS, todo.length) }, (_, i) => runWorker(ctx, i + 1, todo.slice())));
  const results = JOBS.map(j => `${j.id}:${(fs.existsSync(j.out) ? (fs.statSync(j.out).size / 1024).toFixed(0) + 'KB' : 'MISSING')}`);
  console.log('RESULTS:', results.join(' | '));
  await ctx.close();
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
