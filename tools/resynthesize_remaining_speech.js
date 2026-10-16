const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_JSON = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'project.json');
const RAW_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio');

const REMAINING_SHOT_IDS = [10, 15, 20, 23, 27, 32, 36, 39, 46, 48, 52, 58, 66];

async function main() {
  console.log('--- RE-SYNTHESIZING 13 VIDEO AUDIO WITH PUCK ON /u/3/ ---');
  const pj = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
  const shots = pj.scenes.filter(s => REMAINING_SHOT_IDS.includes(s.scene_id));

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('/u/3/generate-speech'));
  if (!page) {
    page = await browser.contexts()[0].newPage();
    await page.goto('https://aistudio.google.com/u/3/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }

  console.log('Using page:', page.url());
  await page.keyboard.press('Escape');

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.waitFor({ timeout: 10000 });
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();

  for (const shot of shots) {
    const shotNum = String(shot.scene_id).padStart(4, '0');
    const targetFile = path.join(RAW_DIR, `bn_shot_${shotNum}.wav`);
    const text = shot.narration.bn;

    console.log(`\n▶ [Shot ${shot.scene_id}] Synthesizing: "${text.slice(0, 50)}..."`);

    const initialSrc = await page.evaluate(() => {
      const a = document.querySelector('audio');
      return a ? a.src : '';
    });

    await textarea.click();
    await textarea.fill(text);
    await page.waitForTimeout(300);

    await runBtn.click();
    console.log(`[Shot ${shot.scene_id}] Clicked Run, waiting for speech completion...`);

    let newSrc = null;
    let prevLen = 0;
    let stableCount = 0;

    for (let sec = 0; sec < 35; sec++) {
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
            console.log(`✅ [Shot ${shot.scene_id}] Fully generated in ${sec + 1}s! Length: ${newSrc.length}`);
            break;
          }
        } else {
          prevLen = state.src.length;
          stableCount = 0;
        }
      }
    }

    if (!newSrc) {
      console.error(`❌ Failed to get complete audio for Shot ${shot.scene_id}`);
      continue;
    }

    const b64 = newSrc.replace(/^data:audio\/wav;base64,/, '');
    fs.writeFileSync(targetFile, Buffer.from(b64, 'base64'));
    console.log(`💾 [Shot ${shot.scene_id}] Saved ${targetFile} (${(b64.length * 0.75 / 1024).toFixed(1)} KB)`);
    await page.waitForTimeout(1000);
  }

  console.log('\n🎉 ALL 13 REMAINING VIDEO SHOTS SYNTHESIZED WITH PUCK!');
}

main().catch(console.error);
