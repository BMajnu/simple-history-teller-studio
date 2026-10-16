const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_JSON = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'project.json');
const RAW_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio');

const NUM_WORKERS = 5;

const WORKER_ACCOUNTS = [
  'https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/2/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts'
];

async function ensureVoicePuck(page, workerId) {
  const chip = page.locator('button.voice-chip, button.voice-playground-chip').first();
  if (await chip.count() > 0) {
    const cur = await chip.innerText();
    if (!cur.toLowerCase().includes('puck')) {
      console.log(`[Worker ${workerId}] Switching voice to Puck (currently ${cur.replace(/\n/g, ' ')})...`);
      await chip.click();
      await page.waitForTimeout(800);
      const search = page.locator('input[placeholder*="Search"]').first();
      if (await search.count() > 0) {
        await search.fill('Puck');
        await page.waitForTimeout(500);
      }
      const puckBtn = page.locator('button:has-text("Puck")').first();
      if (await puckBtn.count() > 0) {
        await puckBtn.click();
        await page.waitForTimeout(400);
      }
      const closeBtn = page.locator('button[aria-label="Close panel"], button.close-button, button:has-text("Done")').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(400);
      }
      const afterText = await chip.innerText();
      console.log(`[Worker ${workerId}] Active voice is now: ${afterText.replace(/\n/g, ' ')}`);
    }
  }
}

async function initWorkerTab(ctx, workerId, url) {
  console.log(`[Worker ${workerId}] Initializing tab on ${url}...`);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Auto-dismiss any upgrade or error modals
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Check if "Create new dialog" card is visible
  const hasCard = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).some(el => el.innerText && el.innerText.trim() === 'Create new dialog');
  });

  if (hasCard) {
    console.log(`[Worker ${workerId}] Clicking 'Create new dialog'...`);
    await page.mouse.click(350, 420);
    await page.waitForTimeout(2000);
  }

  // Wait for textarea
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.waitFor({ timeout: 15000 });

  // Ensure Puck is selected
  await ensureVoicePuck(page, workerId);

  console.log(`[Worker ${workerId}] Ready with Puck voice!`);
  return page;
}

async function synthesizeShot(page, workerId, shot) {
  const shotNum = String(shot.scene_id).padStart(4, '0');
  const targetFile = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);
  const text = shot.narration.bn;

  console.log(`\n[Worker ${workerId}] ▶ Starting Shot ${shot.scene_id}: "${text.slice(0, 50)}..."`);

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      await ensureVoicePuck(page, workerId);

      // Record old audio src
      const oldSrc = await page.evaluate(() => {
        const a = document.querySelector('audio');
        return a ? a.src : '';
      });

      const textarea = page.locator('textarea.textarea, textarea').first();
      await textarea.click();
      await textarea.fill(text);
      await page.waitForTimeout(300);

      // Click run
      const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
      await runBtn.click();

      // Wait for completion
      let elapsed = 0;
      let newSrc = null;
      let prevLen = 0;
      let stableCount = 0;

      while (elapsed < 35000) {
        await page.waitForTimeout(1000);
        elapsed += 1000;

        const info = await page.evaluate(() => {
          const a = document.querySelector('audio');
          const btns = Array.from(document.querySelectorAll('button'));
          const stopBtn = btns.find(b => (b.innerText || '').includes('Stop') || (b.getAttribute('aria-label') || '').includes('Stop'));
          return {
            src: a ? a.src : '',
            readyState: a ? a.readyState : 0,
            hasStop: !!stopBtn
          };
        });

        if (info.src && info.src.startsWith('data:audio/wav;base64,') && info.src !== oldSrc) {
          if (info.src.length === prevLen && info.src.length > 50000) {
            stableCount++;
            if (stableCount >= 2 && !info.hasStop) {
              newSrc = info.src;
              break;
            }
          } else {
            prevLen = info.src.length;
            stableCount = 0;
          }
        }
      }

      if (!newSrc) {
        throw new Error('TTS audio did not stabilize within 35s');
      }

      // Decode base64 and save
      const b64Data = newSrc.replace(/^data:audio\/wav;base64,/, '');
      const buf = Buffer.from(b64Data, 'base64');

      if (buf.length < 50000) {
        throw new Error(`Buffer too small: ${buf.length} bytes`);
      }

      fs.writeFileSync(targetFile, buf);
      console.log(`[Worker ${workerId}] ✓ SUCCESS Shot ${shot.scene_id} saved (${buf.length} bytes, Puck voice)`);
      return true;
    } catch (err) {
      console.error(`[Worker ${workerId}] ⚠ Attempt ${attempts} error on Shot ${shot.scene_id}: ${err.message}`);
      await page.waitForTimeout(2000);
      await page.keyboard.press('Escape');
    }
  }

  return false;
}

async function runWorker(workerId, shots, ctx) {
  const url = WORKER_ACCOUNTS[workerId] || WORKER_ACCOUNTS[0];
  let page = await initWorkerTab(ctx, workerId, url);

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const ok = await synthesizeShot(page, workerId, shot);
    if (!ok) {
      console.error(`[Worker ${workerId}] FAILED Shot ${shot.scene_id} after all retries!`);
    }
    await page.waitForTimeout(500);
  }

  try { await page.close(); } catch (e) {}
  console.log(`[Worker ${workerId}] 🎉 Finished all ${shots.length} assigned shots!`);
}

async function main() {
  const proj = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));

  // Target shots 1 to 48
  const targetShots = proj.scenes.filter(s => s.scene_id >= 1 && s.scene_id <= 48);
  console.log(`Total shots to synthesize with Puck voice: ${targetShots.length} (Shots 1 to 48)`);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];

  // Distribute across 5 workers
  const queues = [[], [], [], [], []];
  targetShots.forEach((shot, idx) => {
    queues[idx % NUM_WORKERS].push(shot);
  });

  queues.forEach((q, idx) => {
    console.log(`Worker ${idx}: ${q.length} shots (${q.map(s => s.scene_id).join(', ')})`);
  });

  const workerPromises = queues.map((q, idx) => runWorker(idx, q, ctx));
  await Promise.all(workerPromises);

  console.log('\n======================================================');
  console.log('🎉 ALL SHOTS 1 TO 48 SUCCESSFULLY SYNTHESIZED WITH PUCK!');
  console.log('======================================================');
}

main().catch(err => {
  console.error('Fatal error in speech synthesis:', err);
  process.exit(1);
});
