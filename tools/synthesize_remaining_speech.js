const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_JSON = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'project.json');
const RAW_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio');

const NUM_WORKERS = 5;

// Accounts to distribute across workers
const WORKER_ACCOUNTS = [
  'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/2/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/2/generate-speech?model=gemini-3.8-flash-tts'
];

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
  console.log(`[Worker ${workerId}] Ready!`);
  return page;
}

async function synthesizeShotOnTab(page, workerId, shot) {
  const shotNum = String(shot.scene_id).padStart(4, '0');
  const outFile = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);

  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 20000) {
    console.log(`[Worker ${workerId}] Shot ${shot.scene_id} already exists on disk.`);
    return true;
  }

  const text = shot.narration.bn;
  console.log(`[Worker ${workerId}] Starting Shot ${shot.scene_id}: "${text.substring(0, 40)}..."`);

  // Record old audio src
  const oldSrc = await page.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? a.src : '';
  });

  // Fill text
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(text);
  await page.waitForTimeout(300);

  // Click Run
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  // Wait for completion (up to 35 seconds)
  let prevLen = 0;
  let stableCount = 0;
  let finalSrc = null;

  for (let i = 0; i < 35; i++) {
    await page.waitForTimeout(1000);

    const check = await page.evaluate((old) => {
      const stop = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Stop'));
      const text = document.body.innerText;
      const isQuota = text.includes('user has exceeded quota') || text.includes('Upgrade to unlock more');
      const a = document.querySelector('audio');
      const src = a ? a.src : '';
      const readyState = a ? a.readyState : 0;
      const duration = a ? a.duration : 0;
      return {
        hasStop: !!stop,
        isQuota,
        src,
        isNew: src !== old && src.startsWith('data:audio/wav;base64,'),
        srcLen: src.length,
        readyState,
        duration
      };
    }, oldSrc);

    if (check.isQuota) {
      console.warn(`[Worker ${workerId}] Quota limit hit! Switching account...`);
      return false; // trigger retry / rotation
    }

    if (!check.hasStop && check.isNew && check.readyState === 4 && check.srcLen > 50000) {
      if (check.srcLen === prevLen) {
        stableCount++;
        if (stableCount >= 2) {
          finalSrc = check.src;
          break;
        }
      } else {
        prevLen = check.srcLen;
        stableCount = 0;
      }
    }
  }

  if (finalSrc) {
    const b64 = finalSrc.replace(/^data:audio\/wav;base64,/, '');
    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(outFile, buf);
    console.log(`✓ [Worker ${workerId}] Successfully generated Shot ${shot.scene_id} (${buf.length} bytes, ${(buf.length / 1024).toFixed(1)} KB)`);
    return true;
  } else {
    console.error(`✗ [Worker ${workerId}] Timed out waiting for Shot ${shot.scene_id}`);
    return false;
  }
}

async function runWorker(workerId, ctx, queue) {
  let url = WORKER_ACCOUNTS[workerId % WORKER_ACCOUNTS.length];
  let page = null;

  try {
    page = await initWorkerTab(ctx, workerId, url);
  } catch (err) {
    console.error(`[Worker ${workerId}] Init failed:`, err.message);
    return;
  }

  while (queue.length > 0) {
    const shot = queue.shift();
    let success = false;
    let attempts = 0;

    while (!success && attempts < 2) {
      attempts++;
      try {
        success = await synthesizeShotOnTab(page, workerId, shot);
        if (!success) {
          // Switch to alternate account URL
          url = url.includes('/u/1/')
            ? 'https://aistudio.google.com/u/2/generate-speech?model=gemini-3.8-flash-tts'
            : 'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts';
          console.log(`[Worker ${workerId}] Switching to alternate account: ${url}`);
          await page.close().catch(() => {});
          page = await initWorkerTab(ctx, workerId, url);
        }
      } catch (err) {
        console.error(`[Worker ${workerId}] Error on shot ${shot.scene_id}:`, err.message);
        break;
      }
    }

    if (!success) {
      console.warn(`[Worker ${workerId}] Re-queueing Shot ${shot.scene_id}`);
      queue.push(shot);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (page) await page.close().catch(() => {});
  console.log(`[Worker ${workerId}] Finished all assigned tasks.`);
}

async function main() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  
  // Find all missing shots
  const files = fs.readdirSync(RAW_DIR);
  const existing = new Set(files.map(f => {
    const m = f.match(/\d+/);
    return m ? parseInt(m[0]) : null;
  }).filter(Boolean));

  const queue = project.scenes.filter(s => !existing.has(s.scene_id));
  console.log(`\n==================================================`);
  console.log(`MULTI-WORKER AI STUDIO SPEECH SYNTHESIS FLEET`);
  console.log(`Workers: ${NUM_WORKERS}`);
  console.log(`Missing Shots Queue: ${queue.length} scenes`);
  console.log(`Scene IDs: ${queue.map(s => s.scene_id).join(', ')}`);
  console.log(`==================================================\n`);

  if (queue.length === 0) {
    console.log('All 69 shots already exist on disk! No work required.');
    return;
  }

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];

  const workers = [];
  for (let w = 0; w < NUM_WORKERS; w++) {
    workers.push(runWorker(w, ctx, queue));
    await new Promise(r => setTimeout(r, 1200)); // stagger tab openings
  }

  await Promise.all(workers);
  console.log('\n✓ ALL SHOTS COMPLETED BY 5-WORKER FLEET!\n');
}

main().catch(console.error);
