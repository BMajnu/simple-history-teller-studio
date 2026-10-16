const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_JSON = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'project.json');
const RAW_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio');

const NUM_WORKERS = 5;

const WORKER_ACCOUNTS = [
  'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/2/generate-speech?model=gemini-3.8-flash-tts',
  'https://aistudio.google.com/u/2/generate-speech?model=gemini-3.8-flash-tts'
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
      const closeBtn = page.locator('button[aria-label="Close panel"], button.close-button').first();
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
  const outFile = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);

  // Ensure voice is still Puck
  await ensureVoicePuck(page, workerId);

  const text = shot.narration.bn;
  console.log(`[Worker ${workerId}] Synthesizing Shot ${shot.scene_id} [Puck]: "${text.substring(0, 40)}..."`);

  const oldSrc = await page.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? a.src : '';
  });

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(text);
  await page.waitForTimeout(300);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

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
      console.warn(`[Worker ${workerId}] Quota hit!`);
      return false;
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
    console.log(`✓ [Worker ${workerId}] Saved Shot ${shot.scene_id} [Puck] (${buf.length} bytes, ${(buf.length / 1024).toFixed(1)} KB)`);
    return true;
  } else {
    console.error(`✗ [Worker ${workerId}] Timeout on Shot ${shot.scene_id}`);
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
        success = await synthesizeShot(page, workerId, shot);
        if (!success) {
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
  console.log(`[Worker ${workerId}] Done.`);
}

async function main() {
  const project = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  
  // Re-generate shots 49 to 69 with Puck
  const targetIds = [];
  for (let id = 49; id <= 69; id++) targetIds.push(id);

  const queue = project.scenes.filter(s => targetIds.includes(s.scene_id));
  console.log(`\n==================================================`);
  console.log(`RE-SYNTHESIZING SHOTS 49-69 WITH CONSISTENT MALE VOICE [Puck]`);
  console.log(`Queue size: ${queue.length} scenes`);
  console.log(`Target Scene IDs: ${queue.map(s => s.scene_id).join(', ')}`);
  console.log(`==================================================\n`);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];

  // Close extra pages
  const pages = ctx.pages();
  for (let i = 1; i < pages.length; i++) await pages[i].close().catch(() => {});

  const workers = [];
  for (let w = 0; w < NUM_WORKERS; w++) {
    workers.push(runWorker(w, ctx, queue));
    await new Promise(r => setTimeout(r, 1200));
  }

  await Promise.all(workers);
  console.log('\n✓ ALL SHOTS 49-69 RE-SYNTHESIZED WITH MALE NARRATOR (Puck)!\n');
}

main().catch(console.error);
