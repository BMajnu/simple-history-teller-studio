const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Connecting to Chrome CDP on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to generate-speech...');
  await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Dismiss any consent or upgrade dialogs
  for (let c = 0; c < 3; c++) {
    const dlg = page.locator('[role=dialog], mat-dialog-container').first();
    if (await dlg.isVisible().catch(() => false)) {
      const btn = dlg.locator('button:has-text("Continue"), button:has-text("Accept"), button:has-text("I agree")').first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }
  }

  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    await createCard.click();
    await page.waitForTimeout(2000);
  }

  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.waitFor({ timeout: 20000 });
  console.log('Speech UI Ready!');

  // Check voice
  const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
  console.log('Speaker button text:', await speakerBtn.innerText());

  // Let's set voice to Charon
  const targetVoice = 'Charon';
  await speakerBtn.click();
  await page.waitForTimeout(1000);

  const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill(targetVoice);
    await page.waitForTimeout(800);
    const row = page.locator('.cdk-overlay-container').getByText(targetVoice, { exact: true }).first();
    if (await row.count() > 0) await row.click();
    await page.waitForTimeout(600);
  }
  await page.keyboard.press('Escape');
  console.log('Voice set to Charon!');

  // Test synthesize line
  const testText = 'আমি সময়ের সাক্ষী! আজ তুমি যে দেশেরই নাগরিক হও না কেন...';
  await textarea.fill(testText);
  await page.waitForTimeout(400);

  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  await runBtn.click();
  console.log('Run clicked, waiting for audio...');

  let audioSrc = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1200);
    const state = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      return {
        hasAudio: !!aud && aud.duration > 0.5,
        dur: aud ? aud.duration : 0,
        src: aud ? aud.src : null,
        stop
      };
    });

    console.log(`[${i * 1.2}s] Audio: ${state.hasAudio} (${state.dur.toFixed(1)}s) | Stop: ${state.stop}`);
    if (state.hasAudio && !state.stop) {
      audioSrc = state.src;
      break;
    }
  }

  if (audioSrc) {
    console.log('Audio generated successfully!');
    const b64 = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const ab = await res.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let bin = '';
      for (let j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
      return btoa(bin);
    }, audioSrc);

    fs.writeFileSync('tools/test_charon_voice.wav', Buffer.from(b64, 'base64'));
    console.log('Saved tools/test_charon_voice.wav!');
  } else {
    console.error('Failed to generate audio');
  }

  await page.close();
  await browser.close();
})();
