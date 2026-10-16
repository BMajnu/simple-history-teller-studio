const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio');

async function testSingleShot() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to generate-speech...');
  await page.goto('https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Check card
  const hasCard = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).some(el => el.innerText && el.innerText.trim() === 'Create new dialog');
  });
  if (hasCard) {
    console.log('Clicking Create new dialog...');
    await page.mouse.click(350, 420);
    await page.waitForTimeout(2000);
  }

  // Voice check
  const chip = page.locator('button.voice-chip, button.voice-playground-chip').first();
  console.log('Chip count:', await chip.count());
  if (await chip.count() > 0) {
    const cur = await chip.innerText();
    console.log('Current voice:', cur.replace(/\n/g, ' '));
    if (!cur.toLowerCase().includes('puck')) {
      console.log('Switching to Puck...');
      await chip.click();
      await page.waitForTimeout(1000);
      const search = page.locator('input[placeholder*="Search"]').first();
      if (await search.count() > 0) {
        await search.fill('Puck');
        await page.waitForTimeout(500);
      }
      const puckBtn = page.locator('button:has-text("Puck")').first();
      if (await puckBtn.count() > 0) {
        await puckBtn.click();
        await page.waitForTimeout(500);
      }
      const closeBtn = page.locator('button[aria-label="Close panel"], button.close-button, button:has-text("Done")').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    }
  }

  const voiceAfter = await chip.innerText();
  console.log('Voice after check:', voiceAfter.replace(/\n/g, ' '));

  // Fill text for shot 1
  const text = 'আজ থেকে হাজার হাজার বছর আগে, মানুষ যখন আজকের মতো গুছিয়ে কথা বলতে পারত না, তখন পৃথিবীর ভাষা কেমন ছিল?';
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.click();
  await textarea.fill(text);
  await page.waitForTimeout(500);

  // Click Run
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();
  console.log('Clicked Run, waiting for audio...');

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

    if (info.src && info.src.startsWith('data:audio/wav;base64,')) {
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

  if (newSrc) {
    const b64 = newSrc.replace(/^data:audio\/wav;base64,/, '');
    const buf = Buffer.from(b64, 'base64');
    const target = path.join(RAW_DIR, 'bn_shot_0001.wav');
    fs.writeFileSync(target, buf);
    console.log(`✓ SUCCESS: Saved bn_shot_0001.wav (${buf.length} bytes)`);
  } else {
    console.error('✗ FAILED to generate audio within timeout');
  }

  await page.close();
}

testSingleShot().catch(console.error);
