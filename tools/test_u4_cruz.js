const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('Testing Slot u/4 with Cruz & Old Man Voice Style...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  await page.goto('https://aistudio.google.com/u/4/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    await createCard.click();
    await page.waitForTimeout(2000);
  }

  // Set Voice to Cruz
  const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
  await speakerBtn.click();
  await page.waitForTimeout(800);

  const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('Cruz');
    await page.waitForTimeout(600);
    const row = page.locator('.cdk-overlay-container').getByText('Cruz', { exact: true }).first();
    if (await row.count() > 0) await row.click();
    await page.waitForTimeout(500);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Set Style
  const styleBtn = page.locator('button').filter({ hasText: 'Style' }).first();
  if (await styleBtn.count() > 0) {
    await styleBtn.click();
    await page.waitForTimeout(800);

    const styleTextarea = page.locator('.cdk-overlay-container textarea').first();
    if (await styleTextarea.count() > 0) {
      await styleTextarea.fill('An Old Story Teller, Old Man voice');
      await page.waitForTimeout(500);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // Fill text: Scene 1 narration
  const mainTextarea = page.locator('textarea:visible').first();
  const text = 'আমি সময়ের সাক্ষী! আজ তুমি যে দেশেরই নাগরিক হও না কেন, তুমি আইন মেনে চলো, ট্যাক্স দাও এবং একজন নেতা বা সরকারের কর্তৃত্বের সামনে মাথা নত করো।';
  await mainTextarea.click();
  await mainTextarea.fill(text);
  await page.waitForTimeout(500);

  // Click Run
  const runBtn = page.locator('button:has-text("Run")').last();
  await runBtn.click();
  console.log('Clicked Run on u/4! Waiting for generation...');

  let audioData = null;
  for (let i = 0; i < 35; i++) {
    await page.waitForTimeout(1200);
    const state = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      return {
        hasAudio: !!aud && aud.duration > 0.5,
        src: aud ? aud.src : null,
        stop
      };
    });

    console.log(`[${((i + 1) * 1.2).toFixed(1)}s] Audio: ${state.hasAudio} | Stop: ${state.stop}`);
    if (state.hasAudio && !state.stop && state.src && state.src.startsWith('data:audio/wav;base64,')) {
      audioData = state.src.split(',')[1];
      break;
    }
  }

  if (audioData) {
    const outPath = 'projects/sample_first_king/audio/raw/bn_scene_0001.wav';
    fs.writeFileSync(outPath, Buffer.from(audioData, 'base64'));
    console.log('🎉 Scene 1 successfully generated on u/4! Saved to:', outPath);
    console.log('Size:', fs.statSync(outPath).size);
  } else {
    await page.screenshot({ path: 'tools/u4_failed_state.png' });
    console.log('Failed or timed out on u/4. Saved tools/u4_failed_state.png');
  }
})();
