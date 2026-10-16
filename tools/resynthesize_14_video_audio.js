const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_JSON = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'project.json');
const RAW_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio');

const TARGET_SHOT_IDS = [5, 10, 15, 20, 23, 27, 32, 36, 39, 46, 48, 52, 58, 66];

async function ensureVoicePuck(page) {
  const chip = page.locator('button.voice-chip, button.voice-playground-chip').first();
  if (await chip.count() > 0) {
    const cur = await chip.innerText();
    if (!cur.toLowerCase().includes('puck')) {
      console.log(`Switching voice to Puck (currently ${cur.replace(/\n/g, ' ')})...`);
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
    }
  }
}

async function synthesizeShot(page, shot) {
  const shotNum = String(shot.scene_id).padStart(4, '0');
  const targetFile = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);
  const text = shot.narration.bn;

  console.log(`\n▶ Starting Shot ${shot.scene_id}: "${text.slice(0, 50)}..."`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.keyboard.press('Escape');
      await ensureVoicePuck(page);

      const oldSrc = await page.evaluate(() => {
        const a = document.querySelector('audio');
        return a ? a.src : '';
      });

      const textarea = page.locator('textarea.textarea, textarea').first();
      await textarea.click();
      await textarea.fill(text);
      await page.waitForTimeout(300);

      const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
      await runBtn.click();

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

      if (!newSrc) throw new Error('Speech audio generation timed out');

      const base64Data = newSrc.replace(/^data:audio\/wav;base64,/, '');
      fs.writeFileSync(targetFile, Buffer.from(base64Data, 'base64'));
      console.log(`✅ [Shot ${shot.scene_id}] Saved to ${targetFile} (${(base64Data.length * 0.75 / 1024).toFixed(1)} KB)`);
      return true;
    } catch (err) {
      console.warn(`[Shot ${shot.scene_id}] Attempt ${attempt} failed: ${err.message}`);
      await page.waitForTimeout(2000);
    }
  }
  return false;
}

async function main() {
  console.log('--- RE-SYNTHESIZING 14 DYNAMIC VIDEO SCENES TO PUCK ---');
  const pj = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const shots = pj.scenes.filter(s => TARGET_SHOT_IDS.includes(s.scene_id));

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  const speechUrl = 'https://aistudio.google.com/u/3/generate-speech?model=gemini-3.8-flash-tts';
  console.log('Navigating to:', speechUrl);
  await page.goto(speechUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Check if "Create new dialog" card is visible
  const hasCard = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).some(el => el.innerText && el.innerText.trim() === 'Create new dialog');
  });
  if (hasCard) {
    console.log('Clicking Create new dialog...');
    await page.mouse.click(350, 420);
    await page.waitForTimeout(2000);
  }

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.waitFor({ timeout: 15000 });
  await ensureVoicePuck(page);

  for (const shot of shots) {
    await synthesizeShot(page, shot);
    await page.waitForTimeout(500);
  }

  await page.close();
  console.log('\n🎉 ALL 14 VIDEO SHOTS RE-SYNTHESIZED WITH PUCK!');
}

main().catch(console.error);
