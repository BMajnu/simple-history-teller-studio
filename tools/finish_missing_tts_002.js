const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const RAW = path.join(PROJ, 'audio', 'raw');

const project = JSON.parse(fs.readFileSync(path.join(PROJ, 'project.json'), 'utf8'));
const TTS_MODEL = 'gemini-3.8-flash-tts';

// Detect all missing files
const missingJobs = [];
for (const lang of ['bn', 'en', 'hi']) {
  for (const s of project.scenes) {
    const outFile = path.join(RAW, `${lang}_shot_${String(s.scene_id).padStart(4, '0')}.wav`);
    if (!fs.existsSync(outFile) || fs.statSync(outFile).size < 50000) {
      missingJobs.push({
        shot: s.scene_id,
        lang,
        speaker: s.dialogue_speaker,
        voice: 'Charon',
        text: s.narration[lang],
        outFile
      });
    }
  }
}

console.log(`Total missing jobs: ${missingJobs.length}`);
console.log('Missing scenes:', missingJobs.map(j => `${j.lang.toUpperCase()} Shot ${j.shot}`).join(', '));

if (missingJobs.length === 0) {
  console.log('All audio files are complete!');
  process.exit(0);
}

const ACCOUNT_SLOTS = [1, 2, 3, 4, 5];

async function generateSingleJob(page, slot, job) {
  const url = `https://aistudio.google.com/u/${slot}/generate-speech?model=${TTS_MODEL}`;
  console.log(`[u/${slot}] Navigating for ${job.lang.toUpperCase()} Shot ${job.shot}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Dismiss onboarding dialogs
  for (let c = 0; c < 3; c++) {
    const dlg = await page.locator('[role="dialog"], mat-dialog-container').count().catch(() => 0);
    if (dlg === 0) break;
    const cbs = await page.locator('[role="dialog"] input[type="checkbox"], mat-dialog-container input[type="checkbox"]').all().catch(() => []);
    for (const cb of cbs) { try { await cb.check({ force: true, timeout: 2000 }); } catch (e) {} }
    await page.waitForTimeout(500);
    try { await page.locator('[role="dialog"] button, mat-dialog-container button').filter({ hasText: 'Continue' }).first().click({ timeout: 4000 }); } catch (e) {}
    await page.waitForTimeout(1500);
  }

  // Click "Create new dialog" if present
  const cards = await page.$$('button, div, a');
  for (const c of cards) {
    const t = ((await c.innerText().catch(() => '')) || '').trim();
    if (t.includes('Create new dialog')) {
      await c.click().catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(2500);

  // Select voice Charon
  const spkBtn = page.locator('button').filter({ hasText: 'Speaker 1' }).first();
  if (await spkBtn.count() > 0) {
    const btnText = await spkBtn.innerText();
    if (!btnText.includes('Charon')) {
      await spkBtn.click();
      await page.waitForTimeout(1000);

      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('Charon');
        await page.waitForTimeout(400);
      }

      const row = page.locator('.cdk-overlay-container, mat-dialog-container, [role="listbox"]').getByText('Charon', { exact: true }).first();
      if (await row.count() > 0) {
        await row.click();
        await page.waitForTimeout(600);
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
  }

  // Fill text
  const ta = page.locator("textarea[aria-label='Speech block text'], textarea").first();
  await ta.waitFor({ state: 'visible', timeout: 15000 });
  await ta.fill(job.text);
  await page.waitForTimeout(500);

  // Snapshot existing audio elements
  const prevAudioSrcs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('audio')).map(a => a.src || a.currentSrc).filter(Boolean);
  }).catch(() => []);

  // Trigger generation via Generate button or Ctrl+Enter
  const genBtn = page.locator('button:has-text("Generate"), button.generate-button, button[aria-label*="Generate"]').first();
  if (await genBtn.count() > 0 && await genBtn.isEnabled()) {
    await genBtn.click();
  } else {
    await page.keyboard.press('Control+Enter');
  }

  console.log(`[u/${slot}] Triggered generation for ${job.lang.toUpperCase()} Shot ${job.shot}, awaiting audio...`);

  // Wait for audio
  let audioData = null;
  for (let i = 0; i < 35; i++) {
    await page.waitForTimeout(2000);
    const quota = await page.evaluate(() =>
      /exceeded quota|Upgrade to unlock|try again later/i.test(document.body.innerText || '')
    ).catch(() => false);
    if (quota) return { ok: false, err: 'QUOTA' };

    const result = await page.evaluate(async (prevs) => {
      const auds = Array.from(document.querySelectorAll('audio')).filter(a => a.duration > 0.5 && !isNaN(a.duration));
      if (auds.length === 0) return null;
      // Prefer fresh audio not in prevs, or last audio
      const fresh = auds.filter(a => !prevs.includes(a.src || a.currentSrc));
      const target = fresh.length > 0 ? fresh[fresh.length - 1] : auds[auds.length - 1];
      if (!target) return null;

      try {
        const res = await fetch(target.src || target.currentSrc);
        const blob = await res.blob();
        const ab = await blob.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let bin = '';
        for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
        return { b64: btoa(bin), dur: target.duration, size: bytes.length };
      } catch(e) { return { err: e.message }; }
    }, prevAudioSrcs).catch(() => null);

    if (result && result.b64) {
      audioData = result;
      break;
    }
  }

  if (!audioData) return { ok: false, err: 'TIMEOUT_NO_AUDIO' };

  fs.writeFileSync(job.outFile, Buffer.from(audioData.b64, 'base64'));
  const sizeKb = (audioData.size / 1024).toFixed(0);
  console.log(`[u/${slot}] ✓ Saved ${job.lang.toUpperCase()} Shot ${job.shot} (${audioData.dur.toFixed(1)}s, ${sizeKb}KB)`);
  return { ok: true, dur: audioData.dur, size: audioData.size };
}

async function runWorker(ctx, slot, queue) {
  const page = await ctx.newPage();
  try {
    for (const job of queue) {
      if (fs.existsSync(job.outFile) && fs.statSync(job.outFile).size > 50000) {
        console.log(`[u/${slot}] - Shot ${job.shot} already exists. Skipping.`);
        continue;
      }
      try {
        const res = await generateSingleJob(page, slot, job);
        if (!res.ok) {
          console.error(`[u/${slot}] ✗ Shot ${job.shot} failed: ${res.err}`);
        }
      } catch(e) {
        console.error(`[u/${slot}] Error on Shot ${job.shot}:`, e.message);
      }
      await page.waitForTimeout(1500);
    }
  } finally {
    await page.close().catch(() => {});
  }
}

(async () => {
  console.log('=== FINISHING REMAINING AUDIO BLOCKS ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  // Distribute missing jobs across all 5 slots
  const queues = Array.from({ length: 5 }, (_, i) => missingJobs.filter((_, k) => k % 5 === i));

  const workers = queues.map((q, i) => runWorker(ctx, ACCOUNT_SLOTS[i], q));
  await Promise.all(workers);

  await ctx.close().catch(() => {});
  console.log('=== AUDIO FINISHER COMPLETED ===');
})();
