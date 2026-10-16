const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Connecting to Chrome CDP on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to AI Studio Speech with Charon (Elderly Male Voice)...');
  await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Dismiss any dialogs
  for (let c = 0; c < 2; c++) {
    const dlg = page.locator('[role=dialog], mat-dialog-container').first();
    if (await dlg.isVisible().catch(() => false)) {
      const btn = dlg.locator('button:has-text("Continue"), button:has-text("Accept"), button:has-text("close")').first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(800);
      }
    }
  }

  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    await createCard.click();
    await page.waitForTimeout(1500);
  }

  // Set Voice to Charon (Elderly Mature Male)
  const targetVoice = 'Charon';
  const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
  if (await speakerBtn.count() > 0) {
    await speakerBtn.click();
    await page.waitForTimeout(800);
    const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill(targetVoice);
      await page.waitForTimeout(600);
      const row = page.locator('.cdk-overlay-container').getByText(targetVoice, { exact: true }).first();
      if (await row.count() > 0) await row.click();
      await page.waitForTimeout(500);
    }
    await page.keyboard.press('Escape');
  }

  // Fill text for Scene 1 (Anchor opening hook)
  const text = 'আমি সময়ের সাক্ষী! আজ তুমি যে দেশেরই নাগরিক হও না কেন, তুমি আইন মেনে চলো, ট্যাক্স দাও এবং একজন নেতা বা সরকারের কর্তৃত্বের সামনে মাথা নত করো।';
  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.fill(text);
  await page.waitForTimeout(300);

  // Click Run
  console.log('Running synthesis for Scene 1 with Charon...');
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();

  let completed = false;
  let audioSrc = null;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(1000);
    const state = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      return { hasAudio: !!aud && aud.duration > 0.5, dur: aud ? aud.duration : 0, src: aud ? aud.src : null, stop };
    });
    if (state.hasAudio && !state.stop) {
      audioSrc = state.src;
      completed = true;
      console.log(`✓ Audio generated! Duration: ${state.dur.toFixed(2)}s`);
      break;
    }
  }

  if (completed && audioSrc) {
    const b64 = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const ab = await res.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let bin = '';
      for (let j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
      return btoa(bin);
    }, audioSrc);

    const outPath = path.resolve('projects/sample_first_king/audio/raw/bn_scene_0001_elderly.wav');
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log(`✓ Saved elderly Anchor voice to: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
  }

  await page.close();
  process.exit(0);
})().catch(console.error);
