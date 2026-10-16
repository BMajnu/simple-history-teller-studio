const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TARGET_FILE = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio', 'bn_shot_0005.wav');
const TEXT = 'তাহলে এই মহাজাগতিক নীরবতা ভেঙে আদিম মানুষের মুখ থেকে প্রথম কোন শব্দটি উচ্চারিত হয়েছিল? কী সেই বিস্ময়কর সূচনা?';

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
    } else {
      console.log('Voice is already Puck:', cur.replace(/\n/g, ' '));
    }
  }
}

async function main() {
  console.log('--- RE-SYNTHESIZING SHOT 05 WITH PUCK ON AI STUDIO ---');
  console.log('Target Text:', TEXT);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('generate-speech'));
  if (!page) {
    page = await browser.contexts()[0].newPage();
    await page.goto('https://aistudio.google.com/u/3/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }

  console.log('Using page:', page.url());
  await page.keyboard.press('Escape');

  await ensureVoicePuck(page);

  const initialSrc = await page.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? a.src : '';
  });

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.waitFor({ timeout: 10000 });
  await textarea.click();
  await textarea.fill(TEXT);
  await page.waitForTimeout(300);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();
  console.log('Clicked Run, waiting for speech synthesis...');

  let newSrc = null;
  let prevLen = 0;
  let stableCount = 0;

  for (let sec = 0; sec < 40; sec++) {
    await page.waitForTimeout(1000);
    const state = await page.evaluate(() => {
      const a = document.querySelector('audio');
      const btns = Array.from(document.querySelectorAll('button'));
      const hasStop = btns.some(b => (b.innerText || '').includes('Stop') || (b.getAttribute('aria-label') || '').includes('Stop'));
      return {
        src: a ? a.src : '',
        hasStop
      };
    });

    if (state.src && state.src.startsWith('data:audio/wav;base64,') && state.src !== initialSrc) {
      if (state.src.length > 30000 && state.src.length === prevLen) {
        stableCount++;
        if (stableCount >= 2 && !state.hasStop) {
          newSrc = state.src;
          console.log(`✅ Fully generated in ${sec + 1}s! Base64 Length: ${newSrc.length}`);
          break;
        }
      } else {
        prevLen = state.src.length;
        stableCount = 0;
      }
    }
  }

  if (!newSrc) {
    throw new Error('Failed to capture generated speech audio');
  }

  const b64 = newSrc.replace(/^data:audio\/wav;base64,/, '');
  fs.writeFileSync(TARGET_FILE, Buffer.from(b64, 'base64'));
  console.log(`💾 Saved ${TARGET_FILE} (${(b64.length * 0.75 / 1024).toFixed(1)} KB)`);
  console.log('🎉 SHOT 05 AUDIO RE-SYNTHESIS COMPLETED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
